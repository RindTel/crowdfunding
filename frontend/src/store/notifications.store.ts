import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface NotificationState {
  readIds: string[];
  markRead: (id: string) => void;
  markAllRead: (ids: string[]) => void;
}

/**
 * Tracks which notifications the user has seen. Notification ids are the
 * underlying donation ids, so read-state survives reloads and stays in sync
 * with the real activity feed. Unread = item id not present in `readIds`.
 */
export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      readIds: [],
      markRead: (id) =>
        set((s) => (s.readIds.includes(id) ? s : { readIds: [...s.readIds, id] })),
      markAllRead: (ids) =>
        set((s) => ({ readIds: Array.from(new Set([...s.readIds, ...ids])) })),
    }),
    { name: 'ff-notifications' }
  )
);
