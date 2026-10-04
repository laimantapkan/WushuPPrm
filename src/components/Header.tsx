import React from 'react';
import { UserRole, AppNotification } from '../types';
import { Bell, Wifi, WifiOff, Menu } from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  notifications: AppNotification[];
  onOpenNotifications: () => void;
  onToggleMobileMenu: () => void;
  isConnected: boolean;
  contingentName: string;
  faviconUrl?: string;
}

export const Header: React.FC<HeaderProps> = ({
  notifications,
  onOpenNotifications,
  onToggleMobileMenu,
  isConnected,
  contingentName,
  faviconUrl = '/wushu_logo.svg',
}) => {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white px-4 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Left: Mobile Menu Trigger + Brand with PB Wushu Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
            aria-label="Toggle Menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white p-0.5 flex items-center justify-center shadow-lg glow-red overflow-hidden shrink-0">
              <img
                src={faviconUrl}
                alt="Logo PB Wushu Indonesia"
                className="w-full h-full object-contain rounded-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/wushu_logo.svg';
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white uppercase">
                  WUSHU PORPROV SUMBAR XVI 2026
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-[220px] sm:max-w-md">
                {contingentName}
              </p>
            </div>
          </div>
        </div>

        {/* Right Actions: Realtime Badge & Notifications */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Connection Status Badge */}
          <div
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
              isConnected
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            }`}
            title={isConnected ? 'Sinkronisasi Real-time Aktif' : 'Menghubungkan ke Server...'}
          >
            {isConnected ? (
              <>
                <Wifi className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
                <span>Live Sync</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                <span>Offline Sync</span>
              </>
            )}
          </div>

          {/* Notifications Trigger */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
            title="Notifikasi Kontingen"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
