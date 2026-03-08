// app/admin/computers/page.tsx — SSR shell
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { fetchMe, fetchAdminComputers, type User } from '@/lib/api';
import { ComputersClient } from './computers-client';

export default async function AdminComputersPage() {
  const headersList = await headers();
  const rawIp =
    headersList.get('x-forwarded-for') ??
    headersList.get('x-real-ip') ??
    '127.0.0.1';
  const clientIp = rawIp.replace(/^::ffff:/, '');

  let me;
  try {
    me = await fetchMe(clientIp);
  } catch {
    redirect('/');
  }
  if (!me.is_admin) redirect('/');

  let computers: User[] = [];
  try {
    computers = await fetchAdminComputers(clientIp);
  } catch {}

  return <ComputersClient initialComputers={computers} clientIp={clientIp} />;
}