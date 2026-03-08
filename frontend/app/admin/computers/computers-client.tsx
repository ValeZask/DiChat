'use client';

import { useState } from 'react';
import Link from 'next/link';
import { type User } from '@/lib/api';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

interface ComputerForm {
  ip: string;
  name: string;
  classroom: string;
  is_admin: boolean;
}

interface Props {
  initialComputers: User[];
  clientIp: string;
}

export function ComputersClient({ initialComputers, clientIp }: Props) {
  const [computers, setComputers] = useState<User[]>(initialComputers);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ComputerForm>({ ip: '', name: '', classroom: 'A', is_admin: false });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function loadComputers() {
    try {
      const res = await fetch(`${API}/admin/computers`, {
        headers: { 'X-Forwarded-For': clientIp },
      });
      const data = await res.json();
      setComputers(data);
    } catch {}
  }

  async function handleAdd() {
    if (!form.ip.trim() || !form.name.trim()) {
      setFormError('IP и имя обязательны');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const res = await fetch(`${API}/admin/computers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Forwarded-For': clientIp,
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json();
        setFormError(err.detail ?? 'Ошибка');
        return;
      }
      setForm({ ip: '', name: '', classroom: 'A', is_admin: false });
      setShowForm(false);
      await loadComputers();
    } catch {
      setFormError('Ошибка сети');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    setDeleting(true);
    try {
      await fetch(`${API}/admin/computers/${id}`, {
        method: 'DELETE',
        headers: { 'X-Forwarded-For': clientIp },
      });
      setConfirmDelete(null);
      await loadComputers();
    } catch {
    } finally {
      setDeleting(false);
    }
  }

  const classA = computers.filter(c => c.classroom === 'A');
  const classB = computers.filter(c => c.classroom === 'B');

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">

        {/* Шапка */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">🖥 Компьютеры</h1>
            <p className="text-sm text-muted-foreground mt-1">Всего: {computers.length}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { setShowForm(true); setFormError(null); }}
              className="glass-thin px-4 py-2 rounded-xl text-sm font-medium text-foreground hover:bg-white/[0.08] transition-all"
            >
              + Добавить
            </button>
            <Link
              href="/admin"
              className="glass-thin px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:bg-white/[0.08] transition-all"
            >
              ← Панель
            </Link>
          </div>
        </div>

        {/* Форма добавления */}
        {showForm && (
          <div className="glass rounded-2xl p-6 mb-6">
            <h2 className="text-sm font-semibold text-foreground mb-4">Новый компьютер</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">IP-адрес</label>
                <input
                  type="text"
                  placeholder="192.168.1.31"
                  value={form.ip}
                  onChange={e => setForm(f => ({ ...f, ip: e.target.value }))}
                  className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Имя</label>
                <input
                  type="text"
                  placeholder="Комп-А16"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Класс</label>
                <select
                  value={form.classroom}
                  onChange={e => setForm(f => ({ ...f, classroom: e.target.value }))}
                  className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50"
                >
                  <option value="A">А</option>
                  <option value="B">Б</option>
                </select>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_admin}
                    onChange={e => setForm(f => ({ ...f, is_admin: e.target.checked }))}
                    className="rounded"
                  />
                  Администратор
                </label>
              </div>
            </div>

            {formError && (
              <div className="mt-3 text-xs text-red-400">{formError}</div>
            )}

            <div className="flex gap-3 mt-4">
              <button
                onClick={handleAdd}
                disabled={saving}
                className="glass-thin px-4 py-2 rounded-xl text-sm font-medium text-foreground hover:bg-white/[0.08] transition-all disabled:opacity-50"
              >
                {saving ? 'Сохраняю...' : 'Сохранить'}
              </button>
              <button
                onClick={() => { setShowForm(false); setFormError(null); }}
                className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:bg-white/[0.05] transition-all"
              >
                Отмена
              </button>
            </div>
          </div>
        )}

        {/* Таблицы по классам */}
        {[{ label: 'Класс А', list: classA }, { label: 'Класс Б', list: classB }].map(({ label, list }) => (
          <div key={label} className="glass rounded-2xl p-6 mb-6">
            <h2 className="text-sm font-semibold text-foreground mb-4">
              {label} <span className="text-muted-foreground font-normal">— {list.length} компов</span>
            </h2>
            <div className="space-y-1">
              {/* Заголовок */}
              <div className="grid grid-cols-[1fr_1.5fr_80px_40px] gap-3 px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                <span>IP</span>
                <span>Имя</span>
                <span>Роль</span>
                <span></span>
              </div>
              {list.map(comp => (
                <div
                  key={comp.ip}
                  className="grid grid-cols-[1fr_1.5fr_80px_40px] gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-all items-center"
                >
                  <span className="text-sm text-muted-foreground font-mono">{comp.ip}</span>
                  <span className="text-sm text-foreground">{comp.name}</span>
                  <span className="text-xs">
                    {comp.is_admin
                      ? <span className="text-primary">⚙ admin</span>
                      : <span className="text-muted-foreground">ученик</span>
                    }
                  </span>
                  <button
                    onClick={() => setConfirmDelete(comp.id)}
                    className="text-muted-foreground hover:text-red-400 transition-colors text-sm"
                    title="Удалить"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {list.length === 0 && (
                <div className="text-sm text-muted-foreground px-3 py-2">Нет компьютеров</div>
              )}
            </div>
          </div>
        ))}

      </div>

      {/* Модалка подтверждения удаления */}
      {confirmDelete !== null && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-thick rounded-2xl p-6 max-w-sm w-full mx-4 border border-white/[0.15]">
            <h3 className="text-sm font-semibold text-foreground mb-2">Удалить компьютер?</h3>
            <p className="text-xs text-muted-foreground mb-5">
              Это действие необратимо. Все сообщения от этого компа останутся в БД.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(confirmDelete)}
                disabled={deleting}
                className="flex-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
              >
                {deleting ? 'Удаляю...' : 'Удалить'}
              </button>
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 glass-thin px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:bg-white/[0.08] transition-all"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}