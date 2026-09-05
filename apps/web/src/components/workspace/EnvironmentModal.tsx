'use client';

import React, { useState, useEffect } from 'react';
import { Key, Plus, Trash2, Save, Eye, EyeOff, X, AlertCircle } from 'lucide-react';
import { WorkspaceEnvVar } from '@cloud-ide/shared';
import { ApiClient } from '@/services/api';

interface EnvironmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

export const EnvironmentModal: React.FC<EnvironmentModalProps> = ({
  isOpen,
  onClose,
  projectId,
}) => {
  const [vars, setVars] = useState<WorkspaceEnvVar[]>([]);
  const [showSecrets, setShowSecrets] = useState<Record<number, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && projectId) {
      ApiClient.getEnv(projectId)
        .then((data) => setVars(data || []))
        .catch(() => setVars([]));
    }
  }, [isOpen, projectId]);

  if (!isOpen) return null;

  const handleAddRow = () => {
    setVars([...vars, { key: '', value: '', isSecret: false }]);
  };

  const handleRemoveRow = (index: number) => {
    setVars(vars.filter((_, i) => i !== index));
  };

  const handleKeyChange = (index: number, key: string) => {
    const updated = [...vars];
    const isSecret = /key|secret|token|password|auth|private/i.test(key);
    updated[index] = { ...updated[index], key, isSecret };
    setVars(updated);
  };

  const handleValueChange = (index: number, value: string) => {
    const updated = [...vars];
    updated[index] = { ...updated[index], value };
    setVars(updated);
  };

  const toggleShowSecret = (index: number) => {
    setShowSecrets((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const filtered = vars.filter((v) => v.key.trim().length > 0);
      await ApiClient.saveEnv(projectId, filtered);
      setVars(filtered);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err: any) {
      alert('Failed to save environment variables: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fade-in font-sans">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-4 bg-zinc-950/80 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-100">Workspace Environment Variables</h3>
              <p className="text-[11px] text-zinc-400">Injected into terminal sessions, runners, and build scripts</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 flex-1 overflow-y-auto custom-scrollbar space-y-3">
          <div className="text-[11px] text-zinc-400 bg-zinc-950 p-2.5 rounded-lg border border-zinc-800/80 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <span>
              Variables are saved to <code>.env</code> in your workspace. Secrets are masked in logs and telemetry.
            </span>
          </div>

          <div className="space-y-2">
            {vars.map((item, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="KEY (e.g. PORT)"
                  value={item.key}
                  onChange={(e) => handleKeyChange(idx, e.target.value)}
                  className="w-1/3 bg-zinc-950 border border-zinc-800 focus:border-sky-500 rounded-lg px-2.5 py-1.5 text-xs font-mono text-zinc-200 outline-none transition-colors"
                />

                <div className="flex-1 relative">
                  <input
                    type={item.isSecret && !showSecrets[idx] ? 'password' : 'text'}
                    placeholder="VALUE (e.g. 3000)"
                    value={item.value}
                    onChange={(e) => handleValueChange(idx, e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-sky-500 rounded-lg px-2.5 py-1.5 text-xs font-mono text-zinc-200 outline-none pr-8 transition-colors"
                  />
                  {item.isSecret && (
                    <button
                      type="button"
                      onClick={() => toggleShowSecret(idx)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                      title={showSecrets[idx] ? 'Hide' : 'Show'}
                    >
                      {showSecrets[idx] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveRow(idx)}
                  className="p-1.5 rounded-lg hover:bg-rose-500/10 text-zinc-500 hover:text-rose-400 transition-colors"
                  title="Remove variable"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddRow}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium border border-zinc-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Variable</span>
          </button>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between">
          <span className="text-xs text-emerald-400 font-medium">
            {saveSuccess && '? Environment variables saved successfully!'}
          </span>

          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center space-x-1.5 px-4 py-1.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save & Apply'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
