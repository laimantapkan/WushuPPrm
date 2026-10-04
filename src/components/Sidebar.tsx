import React from 'react';
import {
  LayoutDashboard,
  Users,
  Building,
  CheckSquare,
  Scale,
  Calendar,
  BookOpen,
  Settings,
  X
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'atlet'
  | 'manajemen'
  | 'checklist'
  | 'timbang'
  | 'pertandingan'
  | 'catatan'
  | 'pengaturan';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  mobileMenuOpen: boolean;
  onCloseMobileMenu: () => void;
  unreadNotificationsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  mobileMenuOpen,
  onCloseMobileMenu,
  unreadNotificationsCount,
}) => {
  const menuItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard Utama', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'atlet', label: 'Data Atlet', icon: <Users className="w-5 h-5" /> },
    { id: 'manajemen', label: 'Data Official & Pelatih', icon: <Building className="w-5 h-5" /> },
    { id: 'checklist', label: 'Checklist Kontingen', icon: <CheckSquare className="w-5 h-5" /> },
    { id: 'timbang', label: 'Timbang Sanda', icon: <Scale className="w-5 h-5" /> },
    { id: 'pertandingan', label: 'Jadwal Tanding', icon: <Calendar className="w-5 h-5" /> },
    { id: 'catatan', label: 'Catatan Harian', icon: <BookOpen className="w-5 h-5" />, badge: 'Baru' },
    { id: 'pengaturan', label: 'Pengaturan', icon: <Settings className="w-5 h-5" /> },
  ];

  const handleNavClick = (tab: NavTab) => {
    onSelectTab(tab);
    onCloseMobileMenu();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={onCloseMobileMenu}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* Main Sidebar Container - Sticky & Fixed during page scroll */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:sticky md:top-16 md:h-[calc(100vh-4rem)] md:self-start md:shrink-0 flex flex-col shadow-xl md:shadow-none ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Header in Drawer */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 md:hidden">
          <div className="flex items-center gap-2">
            <span className="font-bold text-red-500">MENU PORPROV XVI SUMBAR</span>
          </div>
          <button
            onClick={onCloseMobileMenu}
            className="p-1 text-slate-400 hover:text-white rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Items Scrollable List */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition group ${
                  isActive
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md shadow-red-900/30 font-bold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-red-400'}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      isActive ? 'bg-white text-red-700' : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Contingent Readiness Info */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 shrink-0">
          <div className="text-[11px] text-slate-400 font-semibold mb-1">Status Sistem Porprov</div>
          <div className="flex items-center justify-between text-xs font-bold text-slate-200">
            <span>Versi Real-time Sync</span>
            <span className="text-emerald-400">Online</span>
          </div>
        </div>
      </aside>
    </>
  );
};
