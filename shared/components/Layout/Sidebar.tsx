'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  Activity,
  History,
  BarChart3,
  Settings,
  HelpCircle,
  User,
  Users,
  ChevronLeft,
  ChevronRight,
  Mic
} from 'lucide-react';

interface SidebarProps {
  isCollapsed?: boolean;
  toggleCollapse?: () => void;
}

export default function Sidebar({ isCollapsed = false, toggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const [liveCallAvailable, setLiveCallAvailable] = useState(false);

  // Poll health endpoint to check if websocket backend is available
  useEffect(() => {
    const checkLiveServer = async () => {
      try {
        const res = await fetch('/api/health');
        if (res.ok) {
          setLiveCallAvailable(true);
        } else {
          setLiveCallAvailable(false);
        }
      } catch {
        setLiveCallAvailable(false);
      }
    };
    checkLiveServer();
    const interval = setInterval(checkLiveServer, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <aside 
      className={`fixed left-0 top-16 bottom-0 bg-white border-r border-[#E5E7EB] flex flex-col justify-between py-6 z-40 font-sans select-none hidden md:flex transition-all duration-300 shadow-sm ${
        isCollapsed ? 'w-16 px-2' : 'w-[260px] px-4'
      }`}
    >
      <div className="space-y-6">
        
        {/* Collapse Toggle Button (Inside Sidebar) */}
        <div className="w-full px-1">
          {isCollapsed ? (
            <button 
              onClick={toggleCollapse}
              className="w-9 h-9 mx-auto flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm"
              title="Expand Sidebar"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button 
              onClick={toggleCollapse}
              className="w-full py-2.5 px-3.5 flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm font-semibold text-xs tracking-wide"
              title="Collapse Sidebar"
            >
              <span>Collapse Sidebar</span>
              <ChevronLeft className="w-4 h-4 text-slate-400" />
            </button>
          )}
        </div>

        {/* Live Stream Panel */}
        <div className="space-y-2">
          <Link href="/calls/live" className="block group">
            <div className={`rounded-2xl border transition-all duration-300 ${
              pathname === '/calls/live' 
                ? 'bg-indigo-50/40 border-indigo-100 shadow-sm' 
                : 'bg-transparent border-transparent hover:bg-slate-50'
            } ${isCollapsed ? 'p-2 flex justify-center' : 'p-3'}`}>
              
              {isCollapsed ? (
                /* Collapsed Live Stream Icon */
                <div className={`relative flex items-center justify-center w-8 h-8 rounded-xl bg-slate-50 text-slate-600 transition-all group-hover:bg-indigo-50 group-hover:text-indigo-600 ${
                  pathname === '/calls/live' ? 'bg-indigo-50 text-indigo-700' : ''
                }`}>
                  <Mic className="w-4 h-4" />
                  <span className={`absolute top-0 right-0 w-2 h-2 rounded-full border border-white ${liveCallAvailable ? 'bg-[#10B981]' : 'bg-slate-400'}`} />
                  {liveCallAvailable && (
                    <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
                  )}
                </div>
              ) : (
                /* Full Live Stream Card */
                <div className="flex items-center gap-3">
                  <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
                    <Mic className="w-4 h-4" />
                    <span className={`absolute top-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${liveCallAvailable ? 'bg-[#10B981]' : 'bg-slate-400'}`} />
                    {liveCallAvailable && (
                      <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-[#10B981] animate-ping" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 tracking-wide flex items-center gap-1.5">
                      Live Monitor
                      {liveCallAvailable && <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />}
                    </div>
                    <div className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">
                      {liveCallAvailable ? 'Active Connection' : 'No Live Stream'}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </Link>
        </div>

        <div className="w-full h-px bg-slate-100" />

        {/* Main Navigation */}
        <div className="space-y-2">
          {!isCollapsed && (
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest pl-3 block mb-1">
              Navigation
            </span>
          )}
          
          <div className="space-y-1">
            {[
              {
                href: '/dashboard',
                label: 'Dashboard',
                icon: BarChart3
              },
              {
                href: '/calls/live',
                label: 'Live Stream',
                icon: Activity
              },
              {
                href: '/calls',
                label: 'Recordings',
                icon: History
              },
              {
                href: '/dashboard/contacts',
                label: 'Contacts',
                icon: Users
              }
            ].map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || 
                (item.href === '/calls' && pathname.startsWith('/calls') && pathname !== '/calls/live') ||
                (item.href === '/dashboard/contacts' && pathname.startsWith('/dashboard/contacts'));
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={isCollapsed ? item.label : undefined}
                  className={`flex items-center rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    isCollapsed 
                      ? 'justify-center p-2.5' 
                      : 'gap-3 py-2.5 pl-3 border-l-2 ' + (isActive ? 'border-indigo-600 bg-indigo-50/40 text-indigo-700' : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50')
                  } ${isCollapsed && isActive ? 'bg-indigo-50 text-indigo-700' : isCollapsed ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-50' : ''}`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Configuration Section */}
        <div className="space-y-2">
          {!isCollapsed && (
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest pl-3 block mb-1">
              Configuration
            </span>
          )}
          
          <div className="space-y-1">
            <Link
              href="/settings"
              title={isCollapsed ? 'Settings' : undefined}
              className={`flex items-center rounded-xl text-xs font-semibold tracking-wide transition-all ${
                isCollapsed 
                  ? 'justify-center p-2.5' 
                  : 'gap-3 py-2.5 pl-3 border-l-2 ' + (isActiveSettings(pathname) ? 'border-indigo-600 bg-indigo-50/40 text-indigo-700' : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50')
              } ${isCollapsed && isActiveSettings(pathname) ? 'bg-indigo-50 text-indigo-700' : isCollapsed ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-50' : ''}`}
            >
              <Settings className={`w-4 h-4 ${isActiveSettings(pathname) ? 'text-indigo-600' : 'text-slate-400'}`} />
              {!isCollapsed && <span>Settings</span>}
            </Link>
          </div>
        </div>

      </div>

      {/* Bottom Footer Section */}
      <div className="space-y-2 pt-4 border-t border-slate-100">
        <Link
          href="/settings?tab=support"
          title={isCollapsed ? 'Support & FAQ' : undefined}
          className={`flex items-center rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all ${
            isCollapsed ? 'justify-center p-2.5' : 'gap-3 py-2.5 pl-3 border-l-2 border-transparent'
          }`}
        >
          <HelpCircle className="w-4 h-4 text-slate-400" />
          {!isCollapsed && <span>Support & FAQ</span>}
        </Link>
        <Link
          href="/settings?tab=profile"
          title={isCollapsed ? 'Account Profile' : undefined}
          className={`flex items-center rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all ${
            isCollapsed ? 'justify-center p-2.5' : 'gap-3 py-2.5 pl-3 border-l-2 border-transparent'
          }`}
        >
          <User className="w-4 h-4 text-slate-400" />
          {!isCollapsed && <span>Account Profile</span>}
        </Link>
      </div>

    </aside>
  );
}

// Helpers for settings pathname active checks
function isActiveSettings(pathname: string) {
  return pathname === '/settings';
}
