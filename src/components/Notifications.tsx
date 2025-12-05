import React, { useEffect, useState } from "react";

const STORAGE_KEY = "smartfactory_notifications";

type Note = {
  id: string;
  title: string;
  message: string;
  ts: string;
  read?: boolean;
};

export function pushNotification(note: Omit<Note, "id" | "ts" | "read">) {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as Note[];
    const n: Note = {
      id: `n-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: note.title,
      message: note.message,
      ts: new Date().toISOString(),
      read: false,
    };
    all.unshift(n);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all.slice(0, 200)));
    window.dispatchEvent(new CustomEvent("sf:notifications-updated"));
  } catch (e) {
    console.warn("pushNotification error", e);
  }
}

export default function Notifications({ compact }: { compact?: boolean }) {
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    const load = () => {
      const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as Note[];
      setNotes(all);
    };
    load();
    const handler = () => load();
    window.addEventListener("sf:notifications-updated", handler);
    return () => window.removeEventListener("sf:notifications-updated", handler);
  }, []);

  const markAllRead = () => {
    const all = (JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as Note[]).map((n) => ({ ...n, read: true }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    setNotes(all);
    window.dispatchEvent(new CustomEvent("sf:notifications-updated"));
  };

  if (compact) {
    const unread = notes.filter((n) => !n.read).length;
    return (
      <div className="flex items-center gap-2">
        <div className="text-sm">Notifications</div>
        <div className="bg-red-600 text-white text-xs rounded-full px-2 py-0.5">{unread}</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 480 }} className="p-2">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Notifications</h3>
        <div>
          <button className="text-sm text-blue-600" onClick={markAllRead}>Mark all read</button>
        </div>
      </div>

      <div className="mt-2 space-y-2">
        {notes.length === 0 && <div className="text-sm text-gray-500">No notifications</div>}
        {notes.map((n) => (
          <div key={n.id} className={`p-2 rounded border ${n.read ? "bg-gray-50" : "bg-white"}`}>
            <div className="flex justify-between items-center">
              <div className="font-medium text-sm">{n.title}</div>
              <div className="text-xs text-gray-400">{new Date(n.ts).toLocaleString()}</div>
            </div>
            <div className="text-sm text-gray-700 mt-1">{n.message}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
