import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { Database } from '../db/db';

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  image?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * Extracts authenticated user from Bearer JWT token, session header, or developer header.
 */
export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  const devUserId = req.headers['x-user-id'] as string;
  const devUserEmail = req.headers['x-user-email'] as string;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const decoded = jwt.verify(token, config.authSecret) as any;
      if (decoded && (decoded.sub || decoded.id)) {
        const userId = decoded.sub || decoded.id;
        const dbUser = await Database.getUser(userId);
        req.user = {
          id: userId,
          name: decoded.name || dbUser?.name || 'Developer',
          email: decoded.email || dbUser?.email || '',
          image: decoded.picture || dbUser?.image,
        };
        return next();
      }
    } catch (_) {
      // If JWT verify fails, continue checking fallback headers
    }
  }

  // Developer or proxy session header
  if (devUserId) {
    const dbUser = await Database.getUser(devUserId);
    req.user = {
      id: devUserId,
      name: (req.headers['x-user-name'] as string) || dbUser?.name || 'Developer',
      email: devUserEmail || dbUser?.email || `${devUserId}@example.com`,
      image: dbUser?.image,
    };
    return next();
  }

  // If no auth provided in development mode, default to a fallback user
  if (config.nodeEnv === 'development' || !config.nodeEnv) {
    req.user = {
      id: 'dev-user-default',
      name: 'Default Developer',
      email: 'dev@projectbreakout.internal',
    };
    return next();
  }

  next();
}

/**
 * Strict authentication guard for routes that require a verified user.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized: Authentication required.' });
  }
  next();
}
