'use client';

import { useState } from 'react';
import { useMe } from '@/components/user-provider';
import { type Room, type User } from '@/lib/api';
import { Badge } from '@/components/ui/badge';

interface ChatLayoutProps {
  rooms: Room[];
  classmates: User[];
}

export function ChatLayout({ rooms, classmates }: ChatLayoutProps) {
  const { user } = useMe();
  const [activeRoom, setActiveRoom] = useState<Room | null>(
    rooms.find(r => r.type === 'group') ?? null
  );

  // Найти личную комнату между двумя компами
  function findPrivateRoom(classmate: User): Room | null {
    if (!user) return null;
    return rooms.find(r =>
      r.type === 'private' &&
      r.name.includes(user.name) &&
      r.name.includes(classmate.name)
    ) ?? null;
  }

  const groupRooms = rooms.filter(r => r.type === 'group');

  return (
    <div className="flex h-screen w-screen overflow-hidden">

      {/* ── Левая панель ── */}
      <aside
        className="glass-thick flex flex-col shrink-0 border-r border-white/[0.07]"
        style={{ width: '280px' }}
      >
        {/* Шапка */}
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

        <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">

          {/* ── АДМИН: все групповые чаты ── */}
          {user?.is_admin && (
            <>
              <div className="px-3 pt-1 pb-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                Чаты
              </div>
              {groupRooms.map(room => (
                <button
                  key={room.id}
                  onClick={() => setActiveRoom(room)}
                  className={[
                    'w-full text-left px-3 py-2.5 rounded-xl transition-all duration-150 text-sm font-medium',
                    activeRoom?.id === room.id
                      ? 'drop text-foreground'
                      : 'text-muted-foreground hover:bg-white/[0.05] hover:text-foreground',
                  ].join(' ')}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base leading-none">👥</span>
                    <span className="truncate">{room.name}</span>
                  </div>
                </button>
              ))}
            </>
          )}

          {/* ── УЧЕНИК: групповой + классматы ── */}
          {!user?.is_admin && (
            <>
              {/* Групповой чат */}
              {groupRooms[0] && (
                <>
                  <div className="px-3 pt-1 pb-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                    Класс
                  </div>
                  <button
                    onClick={() => setActiveRoom(groupRooms[0])}
                    className={[
                      'w-full text-left px-3 py-2.5 rounded-xl transition-all duration-150 text-sm font-medium',
                      activeRoom?.id === groupRooms[0].id
                        ? 'drop text-foreground'
                        : 'text-muted-foreground hover:bg-white/[0.05] hover:text-foreground',
                    ].join(' ')}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base leading-none">👥</span>
                      <span className="truncate">{groupRooms[0].name}</span>
                    </div>
                  </button>
                </>
              )}

              {/* Личные чаты — список классматов */}
              <div className="px-3 pt-3 pb-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                Личные чаты
              </div>
              {classmates.map((classmate) => {
                const room = findPrivateRoom(classmate);
                const isActive = activeRoom?.id === room?.id;

                return (
                  <button
                    key={classmate.ip}
                    onClick={() => room && setActiveRoom(room)}
                    disabled={!room}
                    className={[
                      'w-full text-left px-3 py-2.5 rounded-xl transition-all duration-150 text-sm font-medium',
                      isActive
                        ? 'drop text-foreground'
                        : 'text-muted-foreground hover:bg-white/[0.05] hover:text-foreground',
                      !room ? 'opacity-40 cursor-not-allowed' : '',
                    ].join(' ')}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-base leading-none">💬</span>
                        <span className="truncate">{classmate.name}</span>
                      </div>
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-1.5 py-0 h-4 bg-primary/20 text-primary border-0 shrink-0 hidden"
                      >
                        0
                      </Badge>
                    </div>
                  </button>
                );
              })}
            </>
          )}

        </nav>

        {/* Футер */}
        {user?.is_admin && (
          <div className="px-4 py-3 border-t border-white/[0.07]">
            <div className="text-xs text-primary font-medium">⚙ admin</div>
          </div>
        )}
      </aside>

      {/* ── Правая панель ── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {activeRoom ? (
          <>
            <div className="glass-thin iridescent glass-highlight relative px-6 py-4 border-b border-white/[0.07] shrink-0">
              <div className="text-sm font-semibold text-foreground">
                {activeRoom.name}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {activeRoom.type === 'group' ? 'Групповой чат' : 'Личный чат'}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 flex items-center justify-center">
              <div className="text-muted-foreground text-sm">
                Выбрана комната: {activeRoom.name}
              </div>
            </div>

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