'use client';

import { useState, useRef, useEffect } from 'react';

interface MessageInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export function MessageInput({ onSend, disabled }: MessageInputProps) {
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Фокус при монтировании
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="glass-thin px-4 py-3 border-t border-white/[0.07] shrink-0">
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="Напишите сообщение..."
            className={[
              'w-full px-4 py-2.5 rounded-xl text-sm',
              'bg-white/[0.05] border border-white/[0.1]',
              'text-foreground placeholder:text-muted-foreground',
              'backdrop-blur-md',
              'focus:outline-none focus:border-primary/50',
              'focus:shadow-[0_0_0_3px_rgba(99,102,241,0.15)]',
              'transition-all duration-200',
              'disabled:opacity-40 disabled:cursor-not-allowed',
            ].join(' ')}
          />
        </div>

        <button
          onClick={handleSend}
          disabled={disabled || !text.trim()}
          className={[
            'shrink-0 w-10 h-10 rounded-xl',
            'flex items-center justify-center',
            'transition-all duration-150',
            text.trim() && !disabled
              ? 'drop bg-primary/20 border-primary/40 text-primary hover:bg-primary/30'
              : 'glass opacity-40 cursor-not-allowed text-muted-foreground',
          ].join(' ')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}