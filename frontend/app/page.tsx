import { fetchRooms, fetchClassmates } from '@/lib/api';
import { headers } from 'next/headers';
import { ChatLayout } from '@/components/chat-layout';

export default async function Home() {
  const headersList = await headers();
  const rawIp =
    headersList.get('x-forwarded-for') ??
    headersList.get('x-real-ip') ??
    '127.0.0.1';
  const clientIp = rawIp.replace(/^::ffff:/, '');

  let rooms = [];
  let classmates = [];

  try {
    rooms = await fetchRooms(clientIp);
  } catch {}

  try {
    classmates = await fetchClassmates(clientIp);
  } catch {}

  console.log('SSR clientIp:', clientIp);
  console.log('SSR rooms:', rooms.map((r: any) => `${r.type}:${r.name}`));
  console.log('SSR classmates:', classmates.map((c: any) => c.name));

  return <ChatLayout rooms={rooms} classmates={classmates} />;
}