'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  HelpCircle,
  Clock,
  Code2,
  Bug,
  BrainCircuit,
  ChevronRight,
  Loader2,
  Lightbulb,
} from 'lucide-react';
import { SocraticResponse } from '@cloud-ide/shared';
import { ApiClient } from '@/services/api';
import { cn } from '@/lib/utils';

interface SocraticAIPanelProps {
  projectId: string;
  currentTime: number;
  activeFilePath?: string | null;
  activeFileContent?: string;
  recentTerminalOutput?: string;
  onSeek: (seconds: number) => void;
}

interface MessageItem {
  id: string;
  sender: 'user' | 'ai';
  text?: string;
  response?: SocraticResponse;
  timestamp: string;
}

export const SocraticAIPanel: React.FC<SocraticAIPanelProps> = ({
  projectId,
  currentTime,
  activeFilePath,
  activeFileContent,
  recentTerminalOutput,
  onSeek,
}) => {
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: 'init',
      sender: 'ai',
      response: {
        type: 'socratic_hint',
        hintLevel: 0,
        question: 'What concept are you currently working to understand or implement?',
        hint: 'I will guide you with questions and progressive hints rather than giving away code.',
        concept: 'Socratic Active Learning',
      },
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [hintLevel, setHintLevel] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSend = async (questionText?: string, levelOverride?: number) => {
    const q = (questionText || inputText).trim();
    if (!q || isLoading) return;

    const currentLevel = levelOverride !== undefined ? levelOverride : hintLevel;

    // Add user message
    const userMsg: MessageItem = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const res = await ApiClient.getSocraticGuidance({
        projectId,
        currentTimestamp: currentTime,
        question: q,
        hintLevel: currentLevel,
        currentFile: activeFilePath || undefined,
        currentCode: activeFileContent,
        recentTerminalOutput,
        learningMode: 'tutorial',
      });

      const aiMsg: MessageItem = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        response: res,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          response: {
            type: 'socratic_hint',
            hintLevel: currentLevel,
            question: 'What do you think is causing the roadblock?',
            hint: 'Try breaking down your logic into smaller steps.',
            concept: 'Problem Solving',
          },
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    { label: 'Explain Concept', text: 'Can you explain the main concept discussed in this section?' },
    { label: 'Help Debug', text: 'I hit a roadblock. How should I diagnose what went wrong?' },
    { label: 'Next Step Hint', text: 'What is the logical next step I should implement?' },
  ];

  return (
    <div className="h-full w-full flex flex-col bg-zinc-950 text-zinc-200 overflow-hidden font-sans">
      {/* Header Context Bar */}
      <div className="p-2.5 bg-zinc-900 border-b border-ide-border flex items-center justify-between text-xs shrink-0">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded bg-sky-500/10 text-sky-400">
            <BrainCircuit className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-zinc-100 text-xs">Socratic AI Tutor</span>
            <span className="text-[10px] text-zinc-500 block">Tutor mode • Never gives raw code</span>
          </div>
        </div>

        {/* Video Context Pill */}
        <button
          onClick={() => onSeek(currentTime)}
          className="flex items-center space-x-1 px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-[11px] text-sky-400 font-mono transition-colors"
          title="Current Tutorial Timestamp"
        >
          <Clock className="w-3 h-3" />
          <span>{formatTime(currentTime)}</span>
        </button>
      </div>

      {/* Progressive Hint Level Selector */}
      <div className="px-3 py-1.5 bg-zinc-950/80 border-b border-zinc-800/80 flex items-center justify-between text-[11px]">
        <span className="text-zinc-400 font-medium">Hint Level:</span>
        <div className="flex space-x-1">
          {[0, 1, 2, 3, 4].map((level) => (
            <button
              key={level}
              onClick={() => setHintLevel(level)}
              className={cn(
                'px-2 py-0.5 rounded text-[10px] font-semibold transition-all',
                hintLevel === level
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-zinc-900 text-zinc-500 hover:text-zinc-300'
              )}
            >
              L{level}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-3 overflow-y-auto custom-scrollbar space-y-3">
        {messages.map((msg) => {
          if (msg.sender === 'user') {
            return (
              <div key={msg.id} className="flex justify-end">
                <div className="max-w-[85%] bg-sky-600/20 border border-sky-500/30 text-sky-100 rounded-2xl px-3 py-2 text-xs">
                  <p>{msg.text}</p>
                  <span className="text-[9px] text-sky-400/60 block text-right mt-1">
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          }

          const res = msg.response;
          if (!res) return null;

          return (
            <div key={msg.id} className="flex justify-start">
              <div className="max-w-[92%] bg-zinc-900 border border-zinc-800 rounded-2xl p-3 text-xs space-y-2.5 shadow-sm">
                {/* Concept Badge & Hint Level */}
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 font-semibold text-[10px]">
                    {res.concept}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    Hint Level {res.hintLevel}
                  </span>
                </div>

                {/* Socratic Question */}
                <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80">
                  <div className="flex items-center space-x-1.5 text-amber-400 text-[11px] font-semibold mb-1">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Consider this:</span>
                  </div>
                  <p className="text-zinc-200 leading-relaxed">{res.question}</p>
                </div>

                {/* Progressive Hint */}
                {res.hint && (
                  <div className="p-2.5 rounded-xl bg-zinc-950/50 border border-zinc-800/50">
                    <div className="flex items-center space-x-1.5 text-sky-400 text-[11px] font-semibold mb-1">
                      <Lightbulb className="w-3.5 h-3.5" />
                      <span>Guidance / Mental Model:</span>
                    </div>
                    <p className="text-zinc-300 leading-relaxed">{res.hint}</p>
                  </div>
                )}

                {/* Timestamp link if available */}
                {res.relatedTimestamp !== undefined && (
                  <div className="pt-1 flex items-center justify-between text-[10px]">
                    <button
                      onClick={() => onSeek(res.relatedTimestamp!)}
                      className="text-sky-400 hover:underline flex items-center space-x-1"
                    >
                      <Clock className="w-3 h-3" />
                      <span>Review video moment [{formatTime(res.relatedTimestamp)}]</span>
                    </button>

                    {res.hintLevel < 4 && (
                      <button
                        onClick={() => handleSend('I am still stuck, can I get the next level hint?', res.hintLevel + 1)}
                        className="text-amber-400 hover:underline flex items-center space-x-0.5"
                      >
                        <span>Need deeper hint?</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center space-x-2 text-zinc-500 text-xs p-2">
            <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
            <span>Formulating Socratic guidance...</span>
          </div>
        )}
      </div>

      {/* Quick Prompts */}
      <div className="px-3 py-1 bg-zinc-900 border-t border-zinc-800/80 flex items-center space-x-1.5 overflow-x-auto no-scrollbar shrink-0">
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(qp.text)}
            className="px-2.5 py-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-medium shrink-0 transition-colors"
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-3 bg-zinc-900 border-t border-ide-border shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            placeholder="Ask the Socratic tutor a question..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 outline-none focus:border-sky-500 transition-colors"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="p-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white rounded-lg transition-colors shadow"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
