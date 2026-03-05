'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { type User, fetchMe } from '@/lib/api';

interface UserContextValue {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const UserContext = createContext<UserContextValue>({
  user: null,
  loading: true,
  error: null,
});

export function UserProvider({ children, initialUser }: {
  children: ReactNode;
  initialUser?: User | null;
}) {
  const [user, setUser]       = useState<User | null>(initialUser ?? null);
  const [loading, setLoading] = useState(!initialUser);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    // Если данные уже переданы с сервера — не делаем лишний запрос
    if (initialUser) return;

    fetchMe()
      .then(setUser)
      .catch(() => setError('Компьютер не зарегистрирован'))
      .finally(() => setLoading(false));
  }, [initialUser]);

  return (
    <UserContext.Provider value={{ user, loading, error }}>
      {children}
    </UserContext.Provider>
  );
}

export function useMe() {
  return useContext(UserContext);
}