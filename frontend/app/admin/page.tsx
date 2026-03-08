import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { fetchMe, fetchAdminRooms, type Room } from '@/lib/api';

export default async function AdminPage() {
  const headersList = await headers();
  const rawIp =
    headersList.get('x-forwarded-for') ??
    headersList.get('x-real-ip') ??
    '127.0.0.1';
  const clientIp = rawIp.replace(/^::ffff:/, '');

  // Проверка прав — не админ → редирект
  let me;
  try {
    me = await fetchMe(clientIp);
  } catch {
    redirect('/');
  }
  if (!me.is_admin) redirect('/');

  // Загружаем все комнаты
  let allRooms: Room[] = [];
  try {
    allRooms = await fetchAdminRooms(clientIp);
  } catch {}

  const roomsA = allRooms.filter(r => r.classroom === 'A');
  const roomsB = allRooms.filter(r => r.classroom === 'B');
  const groupA = roomsA.filter(r => r.type === 'group');
  const groupB = roomsB.filter(r => r.type === 'group');
  const privateA = roomsA.filter(r => r.type === 'private');
  const privateB = roomsB.filter(r => r.type === 'private');

  return (
    <div className="min-h-screen p-8">
      {/* Шапка */}
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">⚙ Панель администратора</h1>
            <p className="text-sm text-muted-foreground mt-1">DiChat02 · {me.name}</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/admin/computers"
              className="glass-thin px-4 py-2 rounded-xl text-sm font-medium text-foreground hover:bg-white/[0.08] transition-all"
            >
              🖥 Компьютеры
            </Link>
            <Link
              href="/"
              className="glass-thin px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:bg-white/[0.08] transition-all"
            >
              ← Чат
            </Link>
          </div>
        </div>

        {/* Карточки классов */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Класс А */}
          <ClassCard
            label="Класс А"
            classroom="A"
            groupRooms={groupA}
            privateCount={privateA.length}
          />

          {/* Класс Б */}
          <ClassCard
            label="Класс Б"
            classroom="B"
            groupRooms={groupB}
            privateCount={privateB.length}
          />
        </div>
      </div>
    </div>
  );
}

// ── Компонент карточки класса ──────────────────────────────────────────────
function ClassCard({
  label,
  classroom,
  groupRooms,
  privateCount,
}: {
  label: string;
  classroom: string;
  groupRooms: Room[];
  privateCount: number;
}) {
  return (
    <div className="glass rounded-2xl p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">{label}</h2>
        <span className="text-xs text-muted-foreground glass-thin px-2.5 py-1 rounded-full">
          {classroom === 'A' ? '2/1' : '3/1'}
        </span>
      </div>

      {/* Групповые чаты */}
      <div>
        <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">
          Групповые чаты
        </div>
        <div className="space-y-1.5">
          {groupRooms.length === 0 && (
            <div className="text-sm text-muted-foreground">Нет чатов</div>
          )}
          {groupRooms.map(room => (
            <Link
              key={room.id}
              href={`/admin/chat/${room.id}`}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-white/[0.07] transition-all group"
            >
              <span className="text-base leading-none">👥</span>
              <span className="flex-1 truncate">{room.name}</span>
              <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                открыть →
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Личные чаты — счётчик */}
      <div>
        <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">
          Личные чаты
        </div>
        <Link
          href={`/admin/class/${classroom}`}
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-white/[0.07] hover:text-foreground transition-all group"
        >
          <span className="text-base leading-none">💬</span>
          <span className="flex-1">{privateCount} чатов</span>
          <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
            смотреть →
          </span>
        </Link>
      </div>
    </div>
  );
}