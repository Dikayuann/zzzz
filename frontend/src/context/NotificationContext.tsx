import React, { createContext, useContext, useState, useEffect } from "react";
import type { NotificationItem } from "@/types/notification";
import { INITIAL_NOTIFICATIONS } from "@/data/mockNotifications";
import { toast } from "sonner";

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  selectedNotification: NotificationItem | null;
  setSelectedNotification: (item: NotificationItem | null) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
}

const STORAGE_KEY = "campaign_blast_notifications_v1";

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback to default
      }
    }
    return INITIAL_NOTIFICATIONS;
  });

  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  }, [notifications]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    if (selectedNotification && selectedNotification.id === id) {
      setSelectedNotification((prev) => (prev ? { ...prev, isRead: true } : null));
    }
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    toast.success("Semua notifikasi telah ditandai sudah dibaca");
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (selectedNotification?.id === id) {
      setSelectedNotification(null);
    }
    toast.success("Notifikasi berhasil dihapus");
  };

  const clearAll = () => {
    setNotifications([]);
    setSelectedNotification(null);
    toast.success("Semua riwayat notifikasi dibersihkan");
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        selectedNotification,
        setSelectedNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};
