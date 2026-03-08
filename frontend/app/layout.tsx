import type { Metadata } from 'next';
import './globals.css';
import { UserProvider } from '@/components/user-provider';
import { fetchMe } from '@/lib/api';
import { headers } from 'next/headers';

export const metadata: Metadata = {
  title: 'DiChat02',
  description: 'Школьный мессенджер',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // SSR: читаем IP из входящего запроса
  const headersList = await headers();
  const rawIp =
    headersList.get('x-forwarded-for') ??
    headersList.get('x-real-ip') ??
    '127.0.0.1';

  // Очищаем IPv6-mapped IPv4 префикс (::ffff:172.19.0.1 → 172.19.0.1)
  const clientIp = rawIp.replace(/^::ffff:/, '');

  // Загружаем пользователя на сервере и передаём клиенту
  let initialUser = null;
  try {
    initialUser = await fetchMe(clientIp);
  } catch {
    // Если комп не зарегистрирован — обработает UserProvider
  }

  return (
    <html lang="ru" className="dark">
      <body>
        <UserProvider initialUser={initialUser}>
          {children}
        </UserProvider>
      </body>
    </html>
  );
}