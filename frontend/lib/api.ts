// Базовый URL бэкенда
export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
export const WS_BASE  = process.env.NEXT_PUBLIC_WS_URL  ?? 'ws://localhost:8000';

export interface User {
  ip: string;
  name: string;
  classroom: string;
  is_admin: boolean;
}

export interface Room {
  id: number;
  name: string;
  type: string;         // 'group' | 'private'
  classroom: string | null;
}

export interface Message {
  id: number;
  room_id: number;
  from_ip: string;
  sender_name: string;
  text: string;
  created_at: string;
}

// GET /me — передаём IP клиента через заголовок
export async function fetchMe(clientIp?: string): Promise<User> {
  const headers: Record<string, string> = {};
  if (clientIp) headers['X-Forwarded-For'] = clientIp;

  const res = await fetch(`${API_BASE}/me`, { headers, cache: 'no-store' });
  if (!res.ok) throw new Error(`fetchMe failed: ${res.status}`);
  return res.json();
}

// GET /rooms
export async function fetchRooms(clientIp?: string): Promise<Room[]> {
  const headers: Record<string, string> = {};
  if (clientIp) headers['X-Forwarded-For'] = clientIp;

  const res = await fetch(`${API_BASE}/rooms`, { headers, cache: 'no-store' });
  if (!res.ok) throw new Error(`fetchRooms failed: ${res.status}`);
  return res.json();
}

// GET /messages/{room_id}
export async function fetchMessages(
  roomId: number,
  clientIp?: string,
  limit = 50,
  offset = 0,
): Promise<Message[]> {
  const headers: Record<string, string> = {};
  if (clientIp) headers['X-Forwarded-For'] = clientIp;

  const res = await fetch(
    `${API_BASE}/messages/${roomId}?limit=${limit}&offset=${offset}`,
    { headers, cache: 'no-store' },
  );
  if (!res.ok) throw new Error(`fetchMessages failed: ${res.status}`);
  return res.json();
}