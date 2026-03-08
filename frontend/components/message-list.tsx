'use client';

import { useEffect, useRef } from 'react';
import { type Message, type User } from '@/lib/api';

interface MessageListProps {
  messages: Message[];
  currentUser: User;
}

export function MessageList({ messages, currentUser }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Автоскролл вниз при новых сообщениях
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-muted-foreground text-sm">
          Нет сообщений. Напишите первым!
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
      {messages.map((msg, i) => {
        const isOwn = msg.from_ip === currentUser.ip;
        const prevMsg = messages[i - 1];
        const isFirstInGroup = !prevMsg || prevMsg.from_ip !== msg.from_ip;
        const nextMsg = messages[i + 1];
        const isLastInGroup = !nextMsg || nextMsg.from_ip !== msg.from_ip;

        return (
          <div
            key={msg.id}
            className={[
              'flex flex-col',
              isOwn ? 'items-end' : 'items-start',
              isFirstInGroup ? 'mt-3' : 'mt-0.5',
            ].join(' ')}
          >
            {/* Имя отправителя — только первое в группе и не своё */}
            {!isOwn && isFirstInGroup && (
              <span className="text-[11px] text-muted-foreground px-3 mb-1">
                {msg.sender_name}
              </span>
            )}

            <div
              className={[
                'relative max-w-[70%] px-4 py-2 text-sm leading-relaxed',
                isOwn ? 'bubble-own' : 'bubble-other',
                // Скруглённые углы как в iMessage
                isOwn ? [
                  'rounded-2xl',
                  isFirstInGroup ? 'rounded-tr-md' : '',
                  isLastInGroup  ? 'rounded-br-md' : '',
                ].join(' ') : [
                  'rounded-2xl',
                  isFirstInGroup ? 'rounded-tl-md' : '',
                  isLastInGroup  ? 'rounded-bl-md' : '',
                ].join(' '),
              ].join(' ')}
            >
              <span className="text-foreground">{msg.text}</span>

              {/* Время — только последнее в группе */}
              {isLastInGroup && (
                <span className={[
                  'block text-[10px] mt-1',
                  isOwn ? 'text-right text-primary/60' : 'text-muted-foreground',
                ].join(' ')}>
                  {new Date(msg.created_at).toLocaleTimeString('ru-RU', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              )}
            </div>
          </div>
        );
      })}

      {/* Якорь для автоскролла */}
      <div ref={bottomRef} />
    </div>
  );
}