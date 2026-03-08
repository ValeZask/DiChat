import { fetchRooms } from '@/lib/api';
import { headers } from 'next/headers';
import { ChatLayout } from '@/components/chat-layout';

export default async function Home() {
  const headersList = await headers();
  const rawIp =
    headersList.get('x-forwarded-for') ??
    headersList.get('x-real-ip') ??
    '127.0.0.1';

  // Очищаем IPv6-mapped IPv4 префикс (::ffff:192.168.1.1 → 192.168.1.1)
  const clientIp = rawIp.replace(/^::ffff:/, '');

  console.log('SSR clientIp:', clientIp);

  let rooms = [];
  try {
    rooms = await fetchRooms(clientIp);
    console.log('SSR rooms count:', rooms.length);
  } catch (e) {
    console.log('SSR fetchRooms error:', e);
  }

  return <ChatLayout rooms={rooms} />;
}