import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, Calendar, Dumbbell, History, LineChart, 
  Bot, Award, Settings, LogOut, Bell, Menu, X, BookOpen, FileText, ChevronLeft, ChevronRight, Apple, Heart, Activity
} from 'lucide-react';
import api from '../../services/api';
import { AppNotification } from '../../types';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/workouts/notifications');
        setNotifications(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 15000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const markAllRead = async () => {
    try {
      await api.put('/workouts/notifications/read');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Workout Planner', path: '/planner', icon: Calendar },
    { name: 'Active Workout', path: '/active-workout', icon: Dumbbell },
    { name: 'Exercise Library', path: '/library', icon: BookOpen },
    { name: 'Workout History', path: '/history', icon: History },
    { name: 'Progress Analytics', path: '/analytics', icon: LineChart },
    { name: 'Nutrition Hub', path: '/nutrition', icon: Apple },
    { name: "Women's Health", path: '/womens-health', icon: Heart },
    { name: 'AI Coach', path: '/coach', icon: Bot },
    { name: 'Goals', path: '/goals', icon: FileText },
    { name: 'Achievements', path: '/achievements', icon: Award },
    { name: 'Reports', path: '/reports', icon: FileText },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-background text-text-body flex font-sans p-4 gap-4">
      {/* Sidebar for Desktop - Floating style */}
      <aside 
        className={`hidden md:flex flex-col bg-white border border-border rounded-[24px] shadow-glass transition-all duration-300 shrink-0 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Sidebar Header Logo */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-border">
          {!collapsed ? (
            <div className="flex items-center gap-2">
              <Activity className="text-primary w-6 h-6 animate-pulse" />
              <span className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                PULSE
              </span>
            </div>
          ) : (
            <Activity className="text-primary w-6 h-6 mx-auto animate-pulse" />
          )}
          <button 
            onClick={() => setCollapsed(!collapsed)} 
            className="p-1.5 hover:bg-surface-hover rounded-xl text-text-muted hover:text-text-heading transition-colors ml-auto"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-xl text-sm font-bold transition-all group ${
                  isActive 
                    ? 'bg-primary-light text-primary border-l-4 border-primary' 
                    : 'text-text-muted hover:bg-surface-hover hover:text-text-heading'
                }`}
              >
                <Icon size={18} className={`shrink-0 ${isActive ? 'text-primary' : 'text-text-muted group-hover:text-text-heading'}`} />
                {!collapsed && <span className="ml-3 transition-opacity duration-200">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Footer Profile Card */}
        <div className="p-4 border-t border-border flex flex-col gap-2 bg-surface-light rounded-b-[24px]">
          <div className="flex items-center gap-3 p-1">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold text-white text-sm shadow-sm shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-extrabold truncate text-text-heading">{user?.name}</p>
                <p className="text-[10px] truncate text-text-muted">{user?.email}</p>
              </div>
            )}
          </div>
          <button 
            onClick={logout}
            className="flex items-center w-full px-3 py-2 text-xs font-bold text-danger hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut size={16} className="shrink-0" />
            {!collapsed && <span className="ml-2.5">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Panel Content Container */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Top Navbar */}
        <header className="h-16 bg-white/80 border border-border rounded-[20px] shadow-sm backdrop-blur-md flex items-center justify-between px-6 z-20 sticky top-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-1.5 hover:bg-surface-hover rounded-xl text-text-muted hover:text-text-heading"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-base font-extrabold text-text-heading">
              {navItems.find(i => i.path === location.pathname)?.name || 'Platform'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => {
                  setShowNotifDropdown(!showNotifDropdown);
                  if (!showNotifDropdown) markAllRead();
                }}
                className="p-2 hover:bg-surface-hover rounded-full text-text-muted hover:text-text-heading relative transition-colors"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full animate-ping" />
                )}
              </button>

              {showNotifDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-border rounded-2xl shadow-xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between border-b border-border pb-2 mb-2">
                    <h3 className="text-xs font-bold text-text-heading">Notifications</h3>
                    <span className="text-[10px] bg-primary-light text-primary px-2 py-0.5 rounded-full font-bold">
                      {notifications.length} Total
                    </span>
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-text-muted text-center py-4">No recent notifications</p>
                    ) : (
                      notifications.map(n => (
                        <div key={n._id} className="p-2.5 rounded-xl bg-surface-light border border-border text-xs">
                          <p className="font-bold text-text-heading">{n.title}</p>
                          <p className="text-text-body mt-0.5">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="w-8 h-8 rounded-full bg-surface-light border border-border flex items-center justify-center font-bold text-text-heading text-xs">
              {user?.name?.substring(0, 2).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Viewport Children */}
        <main className="flex-1 overflow-y-auto pt-6 pb-12 relative">
          {children}
        </main>
      </div>

      {/* Slide-out Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative flex flex-col w-72 bg-white border-r border-border p-4 z-10 animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Activity className="text-primary w-6 h-6 animate-pulse" />
                <span className="text-lg font-extrabold tracking-wider bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  PULSE
                </span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="p-1.5 hover:bg-surface-hover rounded-xl text-text-muted">
                <X size={18} />
              </button>
            </div>
            <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
                      isActive 
                        ? 'bg-primary-light text-primary' 
                        : 'text-text-muted hover:bg-surface-hover hover:text-text-heading'
                    }`}
                  >
                    <Icon size={18} className="mr-3" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            <div className="p-2 border-t border-border">
              <button 
                onClick={() => { logout(); setMobileOpen(false); }}
                className="flex items-center w-full px-4 py-3 text-sm font-bold text-danger hover:bg-red-50 rounded-xl transition-colors"
              >
                <LogOut size={18} className="mr-3" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;
