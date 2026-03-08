'use client';

import { useMe } from '@/components/user-provider';

export default function Home() {
  const { user, loading, error } = useMe();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="glass drop rounded-2xl px-8 py-6 text-center">
          <div className="text-muted-foreground text-sm animate-pulse">
            Подключение...
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="glass drop rounded-2xl px-8 py-6 text-center space-y-2">
          <div className="text-destructive font-medium">⚠ Компьютер не зарегистрирован</div>
          <div className="text-muted-foreground text-sm">
            Обратитесь к администратору
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="glass drop rounded-2xl px-8 py-6 text-center space-y-1">
        <div className="text-foreground font-medium">{user.name}</div>
        <div className="text-muted-foreground text-sm">Класс {user.classroom} · {user.ip}</div>
        {user.is_admin && (
          <div className="text-xs text-primary mt-2">admin</div>
        )}
      </div>
    </div>
  );
}