import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { fetchMe, fetchAdminRooms, fetchAdminComputers, fetchMessages } from '@/lib/api';
import { ChatLayout } from '@/components/chat-layout';

interface Props {
  params: Promise<{ roomId: string }>;
}

export default async function AdminChatPage({ params }: Props) {
  const { roomId } = await params;
  const roomIdNum = parseInt(roomId, 10);

  const headersList = await headers();
  const rawIp =
    headersList.get('x-forwarded-for') ??
    headersList.get('x-real-ip') ??
    '127.0.0.1';
  const clientIp = rawIp.replace(/^::ffff:/, '');

  // Проверка прав
  let me;
  try {
    me = await fetchMe(clientIp);
  } catch {
    redirect('/');
  }
  if (!me.is_admin) redirect('/');

  // Все комнаты + компы для сайдбара
  let allRooms = [];
  let allComputers = [];
  try {
    allRooms = await fetchAdminRooms(clientIp);
  } catch {}
  try {
    allComputers = await fetchAdminComputers(clientIp);
  } catch {}

  return (
    <ChatLayout
      rooms={allRooms}
      classmates={allComputers}
      readOnly={true}
      initialRoomId={roomIdNum}
    />
  );
}