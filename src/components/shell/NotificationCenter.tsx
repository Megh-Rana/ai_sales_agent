import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Zap, PhoneCall, CalendarCheck, Target, CheckCheck, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockNotifications, NotificationItem } from '../../services/mockShellData';

export const NotificationCenter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [notifications, setNotifications] = useState<NotificationItem[]>(mockNotifications);
  const navigate = useNavigate();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const displayedNotifications =
    filter === 'unread' ? notifications.filter((n) => !n.isRead) : notifications;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen && e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleNotificationClick = (notif: NotificationItem) => {
    setNotifications((prev) => prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n)));
    setIsOpen(false);
    navigate(notif.targetPath);
  };

  const getTypeIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'signal':
        return <Zap className="w-3.5 h-3.5 text-signal-high" />;
      case 'call':
        return <PhoneCall className="w-3.5 h-3.5 text-primary" />;
      case 'followup':
        return <CalendarCheck className="w-3.5 h-3.5 text-info" />;
      case 'campaign':
        return <Target className="w-3.5 h-3.5 text-signal-qualified" />;
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-foreground-secondary hover:text-foreground hover:bg-surface-hover rounded-md transition-colors"
        title="Sales Notifications"
        aria-label="Sales Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-signal-high rounded-full ring-2 ring-background animate-pulse" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 z-50 w-84 sm:w-96 bg-surface border border-border-strong rounded-xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="p-3.5 border-b border-border-subtle bg-surface-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-body font-semibold text-foreground">Sales Notifications</span>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.2 text-[10px] font-mono font-bold rounded-full bg-signal-high-muted text-signal-high border border-signal-high/30">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllRead}
                      className="text-xs text-primary hover:text-primary-hover font-medium flex items-center gap-1 transition-colors"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>Mark all read</span>
                    </button>
                  )}
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1 text-xs">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-2.5 py-0.5 rounded-md font-medium transition-colors ${
                      filter === 'all'
                        ? 'bg-surface-elevated text-foreground font-semibold'
                        : 'text-foreground-tertiary hover:text-foreground'
                    }`}
                  >
                    All ({notifications.length})
                  </button>
                  <button
                    onClick={() => setFilter('unread')}
                    className={`px-2.5 py-0.5 rounded-md font-medium transition-colors ${
                      filter === 'unread'
                        ? 'bg-surface-elevated text-foreground font-semibold'
                        : 'text-foreground-tertiary hover:text-foreground'
                    }`}
                  >
                    Unread ({unreadCount})
                  </button>
                </div>
              </div>

              {/* List */}
              <div className="max-h-84 overflow-y-auto divide-y divide-border-subtle">
                {displayedNotifications.length === 0 ? (
                  <div className="p-8 text-center space-y-1">
                    <div className="text-xs font-medium text-foreground">No active notifications</div>
                    <div className="text-caption text-foreground-tertiary">
                      All buying signal and autonomous cadence alerts are cleared.
                    </div>
                  </div>
                ) : (
                  displayedNotifications.map((notif) => (
                    <button
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`w-full p-3.5 flex items-start gap-3 transition-colors text-left group ${
                        notif.isRead
                          ? 'bg-surface-0 opacity-70 hover:opacity-100 hover:bg-surface-hover'
                          : 'bg-surface-1 hover:bg-surface-elevated'
                      }`}
                    >
                      <span className="p-1.5 rounded-md bg-surface-elevated shrink-0 mt-0.5 border border-border-subtle">
                        {getTypeIcon(notif.type)}
                      </span>

                      <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`text-xs font-semibold truncate ${
                              notif.isRead ? 'text-foreground-secondary' : 'text-foreground'
                            }`}
                          >
                            {notif.title}
                          </span>
                          <span className="text-[10px] font-mono text-foreground-tertiary shrink-0">
                            {notif.timestamp}
                          </span>
                        </div>
                        <p className="text-caption text-foreground-secondary line-clamp-2 leading-relaxed">
                          {notif.message}
                        </p>
                      </div>

                      {!notif.isRead && (
                        <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                      )}
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
