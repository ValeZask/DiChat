'use client';

import { useState } from 'react';
import { useMe } from '@/components/user-provider';
import { type Room } from '@/lib/api';

interface ChatLayoutProps {
  rooms: Room[];
}

export function ChatLayout({ rooms }: ChatLayoutProps) {
  const { user } = useMe();
  const [activeRoom, setActiveRoom] = useState<Room | null>(rooms[0] ?? null);

  return (
    <div className="flex h-screen w-screen overflow-hidden">

      {/* ── Левая панель — список чатов ── */}
      <aside
        className="glass-thick flex flex-col shrink-0 border-r border-white/[0.07]"
        style={{ width: '280px' }}
      >
        {/* Шапка сайдбара */}
        <div className="glass-thin iridescent glass-highlight relative px-5 py-4 border-b border-white/[0.07]">
          <div className="text-sm font-semibold text-foreground tracking-wide">
            DiChat
          </div>
          {user && (
            <div className="text-xs text-muted-foreground mt-0.5">
              {user.name} · Класс {user.classroom}
            </div>
          )}
        </div>

        {/* Список комнат */}
        <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
          {rooms.map((room) => (
            <button
              key={room.id}
              onClick={() => setActiveRoom(room)}
              className={[
                'w-full text-left px-3 py-2.5 rounded-xl transition-all duration-150',
                'text-sm font-medium',
                activeRoom?.id === room.id
                  ? 'drop text-foreground'
                  : 'text-muted-foreground hover:bg-white/[0.05] hover:text-foreground',
              ].join(' ')}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-base leading-none">
                  {room.type === 'group' ? '👥' : '💬'}
                </span>
                <span className="truncate">{room.name}</span>
              </div>
            </button>
          ))}

          {rooms.length === 0 && (
            <div className="px-3 py-4 text-xs text-muted-foreground text-center">
              Нет доступных чатов
            </div>
          )}
        </nav>

        {/* Футер сайдбара */}
        {user?.is_admin && (
          <div className="px-4 py-3 border-t border-white/[0.07]">
            <div className="text-xs text-primary font-medium">⚙ admin</div>
          </div>
        )}
      </aside>

      {/* ── Правая панель — активный чат ── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {activeRoom ? (
          <>
            {/* Заголовок чата */}
            <div className="glass-thin iridescent glass-highlight relative px-6 py-4 border-b border-white/[0.07] shrink-0">
              <div className="text-sm font-semibold text-foreground">
                {activeRoom.name}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {activeRoom.type === 'group' ? 'Групповой чат' : 'Личный чат'}
              </div>
            </div>

            {/* Область сообщений — заглушка, заполним в FRONT-19 */}
            <div className="flex-1 overflow-y-auto px-6 py-4 flex items-center justify-center">
              <div className="text-muted-foreground text-sm">
                Выбрана комната: {activeRoom.name}
              </div>
            </div>

            {/* Поле ввода — заглушка, заполним в FRONT-21 */}
            <div className="glass-thin px-4 py-3 border-t border-white/[0.07] shrink-0">
              <div className="glass drop rounded-xl px-4 py-2.5 text-sm text-muted-foreground">
                Поле ввода появится в FRONT-21
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-muted-foreground text-sm">
              Выберите чат
            </div>
          </div>
        )}
      </main>

    </div>
  );
}