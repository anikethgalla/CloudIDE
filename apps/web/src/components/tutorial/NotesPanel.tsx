'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Plus, Trash2, Edit3, Save, Sparkles, Check } from 'lucide-react';
import { TimestampedNote } from '@cloud-ide/shared';
import { ApiClient } from '@/services/api';
import { cn } from '@/lib/utils';

interface NotesPanelProps {
  projectId: string;
  currentTime: number;
  onSeek: (seconds: number) => void;
}

export const NotesPanel: React.FC<NotesPanelProps> = ({
  projectId,
  currentTime,
  onSeek,
}) => {
  const [notes, setNotes] = useState<TimestampedNote[]>([]);
  const [activeNoteText, setActiveNoteText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const loadNotes = async () => {
    try {
      const data = await ApiClient.getNotes(projectId);
      setNotes(data);
    } catch (_) {}
  };

  useEffect(() => {
    loadNotes();
  }, [projectId]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const parseSecondsFromText = (timeStr: string): number | null => {
    const parts = timeStr.split(':').map((p) => parseInt(p, 10));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return parts[0] * 60 + parts[1];
    }
    return null;
  };

  const handleInsertTimestamp = () => {
    const stamp = `[${formatTime(currentTime)}] `;
    setActiveNoteText((prev) => prev + (prev.endsWith('\n') || prev === '' ? '' : ' ') + stamp);
  };

  const handleSaveNote = async () => {
    if (!activeNoteText.trim()) return;

    try {
      setIsSaving(true);
      const note = await ApiClient.saveNote(
        projectId,
        activeNoteText.trim(),
        currentTime,
        editingId || undefined
      );

      if (editingId) {
        setNotes((prev) => prev.map((n) => (n.id === editingId ? note : n)));
        setEditingId(null);
      } else {
        setNotes((prev) => [note, ...prev]);
      }
      setActiveNoteText('');
    } catch (err: any) {
      alert('Failed to save note: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (noteId: string) => {
    try {
      await ApiClient.deleteNote(projectId, noteId);
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
    } catch (_) {}
  };

  const renderFormattedContent = (content: string) => {
    // Replace [MM:SS] with clickable badges
    const regex = /\[(\d{1,2}:\d{2})\]/g;
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(content)) !== null) {
      // Text before timestamp
      if (match.index > lastIndex) {
        elements.push(content.substring(lastIndex, match.index));
      }

      const timeStr = match[1];
      const seconds = parseSecondsFromText(timeStr);

      elements.push(
        <button
          key={`${match.index}-${timeStr}`}
          onClick={() => seconds !== null && onSeek(seconds)}
          className="inline-flex items-center space-x-1 px-1.5 py-0.5 mx-1 my-0.5 rounded bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 font-mono text-[11px] font-semibold border border-sky-500/30 transition-colors"
          title={`Seek video to ${timeStr}`}
        >
          <Clock className="w-3 h-3" />
          <span>{timeStr}</span>
        </button>
      );

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < content.length) {
      elements.push(content.substring(lastIndex));
    }

    return elements;
  };

  return (
    <div className="h-full w-full flex flex-col bg-zinc-950 text-zinc-300 overflow-hidden font-sans">
      {/* Editor Box */}
      <div className="p-3 bg-zinc-900 border-b border-ide-border shrink-0 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-200">
            {editingId ? 'Edit Note' : 'Timestamped Scratchpad'}
          </span>

          <button
            onClick={handleInsertTimestamp}
            className="flex items-center space-x-1 px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-sky-400 text-xs font-medium border border-zinc-700 transition-colors"
            title="Insert current video timestamp (Ctrl + Shift + M)"
          >
            <Clock className="w-3 h-3" />
            <span>Insert [{formatTime(currentTime)}]</span>
          </button>
        </div>

        <textarea
          rows={3}
          value={activeNoteText}
          onChange={(e) => setActiveNoteText(e.target.value)}
          placeholder="Write your notes here... (Use [MM:SS] for clickable video timestamps)"
          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-200 outline-none focus:border-sky-500 transition-colors custom-scrollbar"
        />

        <div className="flex justify-between items-center">
          <span className="text-[10px] text-zinc-500">
            Supports Markdown &amp; clickable <code>[MM:SS]</code> timestamps
          </span>

          <div className="flex space-x-2">
            {editingId && (
              <button
                onClick={() => {
                  setEditingId(null);
                  setActiveNoteText('');
                }}
                className="px-2.5 py-1 text-xs text-zinc-400 hover:text-zinc-200"
              >
                Cancel
              </button>
            )}
            <button
              onClick={handleSaveNote}
              disabled={isSaving || !activeNoteText.trim()}
              className="flex items-center space-x-1 px-3 py-1 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-semibold rounded-md shadow transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{editingId ? 'Update Note' : 'Save Note'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notes List */}
      <div className="flex-1 p-3 overflow-y-auto custom-scrollbar space-y-2.5">
        {notes.length > 0 ? (
          notes.map((note) => (
            <div
              key={note.id}
              className="group p-3 bg-zinc-900/70 hover:bg-zinc-900 border border-zinc-800/80 rounded-xl transition-all"
            >
              <div className="flex items-start justify-between mb-1.5">
                <span className="text-[10px] text-zinc-500 font-mono">
                  {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>

                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      setEditingId(note.id);
                      setActiveNoteText(note.content);
                    }}
                    className="p-1 hover:text-sky-400 text-zinc-500 transition-colors"
                    title="Edit note"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="p-1 hover:text-rose-400 text-zinc-500 transition-colors"
                    title="Delete note"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="text-xs text-zinc-200 leading-relaxed whitespace-pre-wrap select-text font-sans">
                {renderFormattedContent(note.content)}
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-zinc-500 text-xs">
            No notes created yet. Use the scratchpad above to record your understanding as you learn.
          </div>
        )}
      </div>
    </div>
  );
};
