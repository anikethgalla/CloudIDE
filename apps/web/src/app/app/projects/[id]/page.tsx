'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { IDEWorkspace } from '@/components/ide/IDEWorkspace';

export default function AppProjectIDEPage() {
  const params = useParams();
  const projectId = params.id as string;

  return <IDEWorkspace projectId={projectId} />;
}
