import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/apiClient';
import { Bell, Check, Trash2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Notifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await apiClient('/notifications');
      if (res.success && res.notifications) {
        setNotifications(res.notifications);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      const res = await apiClient(`/notifications/${id}/read`, { method: 'PUT' });
      if (res.success) {
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await apiClient('/notifications/mark-all-read', { method: 'PUT' });
      if (res.success) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in pb-24">
      <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-muted hover:text-brand-dark mb-6 uppercase tracking-wider">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </Link>

      <div className="bg-white border border-brand-border/60 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-brand-light pb-4">
          <h1 className="font-extrabold text-xl text-brand-dark flex items-center gap-2">
            <Bell className="w-5 h-5 text-brand-green" />
            <span>My Notifications ({notifications.filter(n => !n.read).length} unread)</span>
          </h1>

          {notifications.some(n => !n.read) && (
            <button 
              onClick={handleMarkAllRead}
              className="text-xs font-bold text-brand-green hover:underline flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
          )}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-slate-100 skeleton-pulse rounded-xl"></div>
            ))}
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div 
                key={n._id}
                className={`p-4 rounded-xl border flex items-start justify-between gap-4 transition-all duration-150 ${
                  n.read ? 'bg-white border-brand-border/60' : 'bg-brand-green/5 border-brand-green/20'
                }`}
              >
                <div className="flex gap-3">
                  <span className="text-xl">{n.icon || '🔔'}</span>
                  <div>
                    <h4 className="font-extrabold text-sm text-brand-dark">{n.title}</h4>
                    <p className="text-xs text-brand-muted font-medium mt-0.5 leading-relaxed">{n.body}</p>
                  </div>
                </div>

                {!n.read && (
                  <button 
                    onClick={() => handleMarkRead(n._id)}
                    className="p-1 rounded-lg text-brand-green hover:bg-brand-green/10 transition-all flex-shrink-0"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center font-bold text-sm text-brand-muted py-8">
            You have no notifications yet.
          </p>
        )}
      </div>
    </div>
  );
}
