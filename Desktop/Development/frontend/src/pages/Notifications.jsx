import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { notificationsApi } from '../services/notificationsApi';

export default function Notifications() {
  const [state, setState] = useState({ loading: true, items: [] });

  const fetchAll = async () => {
    setState((s) => ({ ...s, loading: true }));
    try {
      const { data } = await notificationsApi.list();
      const items = Array.isArray(data) ? data : data?.results ?? [];
      setState({ loading: false, items });
    } catch (e) {
      setState({ loading: false, items: [] });
      toast.error(e?.response?.data?.detail || 'Failed to load notifications');
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const unreadCount = useMemo(() => state.items.filter((n) => !n.is_read).length, [state.items]);

  const markAllRead = async () => {
    try {
      await notificationsApi.markRead({ all: true });
      toast.success('Marked all as read');
      fetchAll();
    } catch (e) {
      toast.error(e?.response?.data?.detail || 'Failed to mark read');
    }
  };

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-2xl font-black tracking-tight text-white">Notifications</div>
            <p className="mt-1 text-sm text-slate-400">
              Unread: <span className="font-semibold text-slate-200">{unreadCount}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-ghost" onClick={fetchAll} type="button">
              Refresh
            </button>
            <button
              className="btn btn-primary"
              onClick={markAllRead}
              type="button"
              disabled={state.loading || state.items.length === 0}
            >
              Mark all read
            </button>
          </div>
        </div>
      </div>

      {state.loading ? (
        <div className="card h-56 animate-pulse bg-white/5" />
      ) : state.items.length === 0 ? (
        <div className="card p-6 text-sm text-slate-300">No notifications yet.</div>
      ) : (
        <div className="card overflow-hidden">
          <div className="divide-y divide-white/10">
            {state.items.map((n) => (
              <div key={n.id} className="p-4 hover:bg-white/5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-sm font-black text-white">{n.title}</div>
                      {!n.is_read && (
                        <span className="rounded-full bg-indigo-500/15 px-2 py-0.5 text-xs font-black text-indigo-200">
                          New
                        </span>
                      )}
                      <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-semibold text-slate-300">
                        {n.notification_type}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-slate-300">{n.message}</div>
                    <div className="mt-2 text-xs text-slate-500">{new Date(n.created_at).toLocaleString()}</div>
                  </div>

                  {n.link ? (
                    <a className="btn btn-ghost" href={n.link}>
                      Open
                    </a>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

