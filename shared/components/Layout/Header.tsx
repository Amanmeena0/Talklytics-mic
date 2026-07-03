'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import clientFetch from '@/shared/utils/clientFetch';
import {
  Sparkles,
  Search,
  Bell,
  Phone,
  Settings,
  LogOut,
  User,
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
  BellOff,
  ChevronDown,
  Menu
} from 'lucide-react';

interface HeaderProps {
  isSidebarCollapsed?: boolean;
  toggleSidebar?: () => void;
}

export default function Header({ isSidebarCollapsed = false, toggleSidebar }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  // State
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Refs for closing dropdowns when clicking outside
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Fetch current user and notifications
  const loadUserData = async () => {
    try {
      const [userRes, notifRes] = await Promise.all([
        clientFetch('/api/users'),
        clientFetch('/api/notifications'),
      ]);
      if (userRes.ok) {
        const user = await userRes.json();
        if (user) {
          setCurrentUser(user);
          setIsLoggedIn(true);
        } else {
          setCurrentUser(null);
          setIsLoggedIn(false);
        }
      } else {
        setCurrentUser(null);
        setIsLoggedIn(false);
      }
      if (notifRes.ok) {
        const notifs = await notifRes.json();
        setNotifications(notifs);
      }
    } catch (err) {
      console.error('Failed to load header data:', err);
      setCurrentUser(null);
      setIsLoggedIn(false);
    } finally {
      setIsLoaded(true);
    }
  };

  const handleLogout = async () => {
    try {
      await clientFetch('/api/auth/logout', { method: 'POST' });
      document.cookie = 'logged_in=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
      setCurrentUser(null);
      setIsLoggedIn(false);
      setShowUserMenu(false);
      router.push('/login');
    } catch (err) {
      console.error('Logout failed:', err);
      document.cookie = 'logged_in=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
      setCurrentUser(null);
      setIsLoggedIn(false);
      router.push('/login');
    }
  };

  useEffect(() => {
    // Check if we are logged in from document.cookie
    const hasLoginCookie = document.cookie
      .split('; ')
      .some((row) => row.startsWith('logged_in=true'));
    const isProtected = pathname !== '/' && pathname !== '/login' && pathname !== '/register';

    if (hasLoginCookie || isProtected) {
      setIsLoggedIn(true);
    }

    loadUserData();
  }, [pathname]);

  // Handle click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Switch user role (demo purpose)
  const handleSwitchUser = async (email: string) => {
    try {
      const res = await clientFetch('/api/users/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        document.cookie = 'logged_in=true; path=/; max-age=604800; SameSite=Lax';
        setShowUserMenu(false);
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Mark notification as read
  const handleMarkNotifRead = async (id: string, read: boolean) => {
    try {
      const res = await clientFetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, read }),
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read } : n)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Clear all notifications
  const handleClearAllNotifs = async () => {
    try {
      const res = await clientFetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clearAll: true }),
      });
      if (res.ok) {
        setNotifications([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/calls?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-[#FAFBFC] border-b border-[#E5E7EB] flex items-center justify-between px-6 z-50 font-sans select-none">
      
      {/* Brand logo & Sidebar Toggle */}
      <div className="flex items-center gap-4">
        {toggleSidebar && (
          <button 
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors hidden md:block"
            title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            <Menu className="w-4 h-4" />
          </button>
        )}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm transition-all group-hover:scale-105">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-bold text-base text-[#111827] tracking-tight">Talklytics</span>
        </Link>

        {isLoggedIn && (
          <div className="hidden lg:flex items-center gap-2 text-xs font-semibold text-slate-400">
            <span>/</span>
            <span className="text-slate-600">Workspace Corporate</span>
          </div>
        )}
      </div>

      {/* Top Navigation Links */}
      <nav className="hidden md:flex items-center gap-8">
        <Link 
          href="/" 
          className={`text-xs font-bold tracking-wider uppercase transition-colors ${pathname === '/' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Home
        </Link>
        <Link 
          href="/pricing" 
          className={`text-xs font-bold tracking-wider uppercase transition-colors ${pathname === '/pricing' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Pricing
        </Link>
        <Link 
          href="/contact" 
          className={`text-xs font-bold tracking-wider uppercase transition-colors ${pathname === '/contact' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Contact
        </Link>
      </nav>

      {/* Right control panel */}
      <div className="flex items-center gap-4">
        {isLoggedIn ? (
          <>
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                placeholder="Search transcripts..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-1.5 w-60 border border-[#E5E7EB] rounded-lg text-xs outline-none bg-slate-50/50 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-700"
              />
            </form>

            {/* Notifications panel */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg hover:bg-slate-100/60 transition-colors relative text-slate-600 hover:text-slate-900"
                aria-label="Notifications"
              >
                <Bell className="w-4.5 h-4.5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600 border border-white" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-[#E5E7EB] rounded-2xl shadow-xl overflow-hidden z-50 py-2">
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Notifications</span>
                    {notifications.length > 0 && (
                      <button onClick={handleClearAllNotifs} className="text-[10px] text-indigo-600 hover:text-indigo-700 font-bold">
                        Clear All
                      </button>
                    )}
                  </div>

                  <div className="max-h-64 overflow-y-auto custom-scrollbar px-2 py-1 space-y-1.5">
                    {notifications.length > 0 ? (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => handleMarkNotifRead(n.id, !n.read)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer space-y-1 ${
                            !n.read 
                              ? 'bg-indigo-50/20 border-indigo-100' 
                              : 'bg-white border-transparent hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                              {n.type === 'SUCCESS' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> :
                               n.type === 'WARNING' ? <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> :
                               <Info className="w-3.5 h-3.5 text-indigo-600" />}
                              {n.title}
                            </span>
                            {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />}
                          </div>
                          <p className="text-[10px] text-slate-500 leading-normal">{n.description}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 space-y-2 text-slate-400">
                        <BellOff className="w-8 h-8 text-slate-300 mx-auto" />
                        <span className="text-[10px] font-bold uppercase block">Clear inbox</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Live Coaching CTA */}
            <Link href="/calls/live">
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all shadow-sm flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 fill-current" />
                Start Live Call
              </button>
            </Link>

            {/* Workspace switcher dropdown */}
            <div className="relative" ref={userMenuRef}>
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)} 
                className="flex items-center gap-1 p-0.5 rounded-full hover:bg-slate-100 transition-colors"
              >
                <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-100 border border-slate-200">
                  <img
                    className="w-full h-full object-cover"
                    src={
                      currentUser?.avatarUrl ||
                      'https://lh3.googleusercontent.com/aida-public/AB6AXuBydN9a-URkUyb3EbMEXrxRRb35zw61rKWQ7f3QcdwXBQrIa8blJRm9flK0WbBbOjWAQyw6yBXqeiOPw9A7a3ngJ3S7Le2X-QXAZIgnd88et1q7etjADf0KLje2R6eHsXAW4haDHneZxCRUONnAlkjdludfTwpAg3RfFcasH2NH1G4jLMJqS5j6LIEUiye1zcL4in7zFU-AIteWTeAFKq5NlUek2mHAEpjs5RGuL8QpW8WsRlPEHwswXnL4oYjStpG4CWyyowvqog'
                    }
                    alt="User avatar"
                  />
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400 pr-0.5" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-[#E5E7EB] rounded-2xl shadow-xl overflow-hidden z-50 py-2">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-800 block">{currentUser?.name || 'Jane Smith'}</span>
                    <span className="text-[10px] text-slate-400 block truncate">{currentUser?.email || 'jane.smith@talklytics.com'}</span>
                    <span className="inline-block mt-2 text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold uppercase">
                      {currentUser?.role || 'SALES_REP'}
                    </span>
                  </div>

                  <div className="p-1 space-y-0.5">
                    <Link
                      href="/settings"
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Settings className="w-3.5 h-3.5 text-slate-400" />
                      Account Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link href="/login" className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors">
              Login
            </Link>
            <Link href="/dashboard">
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all shadow-sm">
                Get Started
              </button>
            </Link>
          </>
        )}
      </div>

    </header>
  );
}
