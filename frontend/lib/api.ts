// Базовый URL бэкенда
// NEXT_PUBLIC_ — для браузера (localhost)
// INTERNAL_API_URL — для SSR внутри Docker (backend:8000)
const isServer = typeof window === 'undefined';

export const API_BASE = isServer
  ? (process.env.INTERNAL_API_URL ?? 'http://backend:8000')
  : (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000');

export const WS_BASE = process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:8000';

export interface User {
  ip: string;
  name: string;
  classroom: string;
  is_admin: boolean;
}

export interface Room {
  id: number;
  name: string;
  type: string;
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

export async function fetchMe(clientIp?: string): Promise<User> {
  const headers: Record<string, string> = {};
  if (clientIp) headers['X-Forwarded-For'] = clientIp;

  const res = await fetch(`${API_BASE}/me`, { headers, cache: 'no-store' });
  if (!res.ok) throw new Error(`fetchMe failed: ${res.status}`);
  return res.json();
}

export async function fetchRooms(clientIp?: string): Promise<Room[]> {
  const headers: Record<string, string> = {};
  if (clientIp) headers['X-Forwarded-For'] = clientIp;

  const res = await fetch(`${API_BASE}/rooms`, { headers, cache: 'no-store' });
  if (!res.ok) throw new Error(`fetchRooms failed: ${res.status}`);
  return res.json();
}

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

// GET /classmates — компы своего класса без себя
export async function fetchClassmates(clientIp?: string): Promise<User[]> {
  const headers: Record<string, string> = {};
  if (clientIp) headers['X-Forwarded-For'] = clientIp;

  const res = await fetch(`${API_BASE}/classmates`, { headers, cache: 'no-store' });
  if (!res.ok) throw new Error(`fetchClassmates failed: ${res.status}`);
  return res.json();
}

// GET /admin/rooms — все комнаты (только админ)
export async function fetchAdminRooms(clientIp?: string): Promise<Room[]> {
  const headers: Record<string, string> = {};
  if (clientIp) headers['X-Forwarded-For'] = clientIp;

  const res = await fetch(`${API_BASE}/admin/rooms`, { headers, cache: 'no-store' });
  if (!res.ok) throw new Error(`fetchAdminRooms failed: ${res.status}`);
  return res.json();
}

// GET /admin/computers — все компы (только админ)
export async function fetchAdminComputers(clientIp?: string): Promise<User[]> {
  const headers: Record<string, string> = {};
  if (clientIp) headers['X-Forwarded-For'] = clientIp;

  const res = await fetch(`${API_BASE}/admin/computers`, { headers, cache: 'no-store' });
  if (!res.ok) throw new Error(`fetchAdminComputers failed: ${res.status}`);
  return res.json();
}