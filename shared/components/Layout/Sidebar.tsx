'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  Activity,
  History,
  BarChart3,
  Layers,
  Settings,
  HelpCircle,
  User,
  Users,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  isCollapsed?: boolean;
  toggleCollapse?: () => void;
}

export default function Sidebar({ isCollapsed = false, toggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const [liveCallAvailable, setLiveCallAvailable] = useState(false);

  // Poll health endpoint of uvicorn server to check if uvicorn websocket is available
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
      className={`fixed left-0 top-16 bottom-0 bg-slate-50 border-r border-[#E5E7EB] flex flex-col justify-between py-6 z-40 font-sans select-none hidden md:flex transition-all duration-300 ${
        isCollapsed ? 'w-16 px-2' : 'w-[260px] px-4'
      }`}
    >
      <div className="space-y-6">
        
        {/* Collapse Toggle Button */}
        <div className={`flex ${isCollapsed ? 'justify-center' : 'justify-end'} px-1`}>
          <button 
            onClick={toggleCollapse}
            className="p-1.5 rounded-lg bg-white border border-[#E5E7EB] text-slate-500 hover:text-slate-900 transition-colors shadow-sm"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Live Stream Panel */}
        <div className="space-y-2">
          <Link href="/calls/live" className="block group">
            <div className={`rounded-2xl border transition-all duration-300 ${
              pathname === '/calls/live' 
                ? 'bg-white border-[#E5E7EB] shadow-md shadow-slate-100/60' 
                : 'bg-transparent border-transparent hover:bg-slate-100/60'
            } ${isCollapsed ? 'p-2 flex justify-center' : 'p-4'}`}>
              <div className="flex items-center gap-3">
                <div className="relative flex items-center justify-center">
                  <span className={`w-2.5 h-2.5 rounded-full ${liveCallAvailable ? 'bg-indigo-600' : 'bg-slate-400'}`} />
                  {liveCallAvailable && (
                    <span className="absolute w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping" />
                  )}
                </div>
                {!isCollapsed && (
                  <div>
                    <div className="text-xs font-bold text-slate-800 tracking-wide">Live Monitor</div>
                    <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                      {liveCallAvailable ? 'Uvicorn Server Active' : 'No Active Stream'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Link>
        </div>

        <div className="w-full h-px bg-slate-200/60" />

        {/* Main Navigation */}
        <div className="space-y-2">
          {!isCollapsed && (
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest pl-3 block mb-1">
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
                    isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'
                  } ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
                  }`}
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
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest pl-3 block mb-1">
              Configuration
            </span>
          )}
          
          <div className="space-y-1">
            <Link
              href="/settings?tab=integrations"
              title={isCollapsed ? 'Integrations' : undefined}
              className={`flex items-center rounded-xl text-xs font-semibold tracking-wide transition-all ${
                isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'
              } ${
                pathname === '/settings' && typeof window !== 'undefined' && window.location.search.includes('integrations')
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
              }`}
            >
              <Layers className="w-4 h-4 text-slate-400" />
              {!isCollapsed && <span>Integrations</span>}
            </Link>
            
            <Link
              href="/settings"
              title={isCollapsed ? 'Settings' : undefined}
              className={`flex items-center rounded-xl text-xs font-semibold tracking-wide transition-all ${
                isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'
              } ${
                pathname === '/settings' && (typeof window === 'undefined' || !window.location.search.includes('integrations'))
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
              }`}
            >
              <Settings className="w-4 h-4 text-slate-400" />
              {!isCollapsed && <span>Settings</span>}
            </Link>
          </div>
        </div>

      </div>

      {/* Bottom Footer Section */}
      <div className="space-y-3 pt-6 border-t border-slate-200/60">
        <Link
          href="/settings?tab=support"
          title={isCollapsed ? 'Support & FAQ' : undefined}
          className={`flex items-center rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100/50 transition-all ${
            isCollapsed ? 'justify-center p-2' : 'gap-3 px-3 py-2'
          }`}
        >
          <HelpCircle className="w-4 h-4 text-slate-400" />
          {!isCollapsed && <span>Support & FAQ</span>}
        </Link>
        <Link
          href="/settings?tab=profile"
          title={isCollapsed ? 'Account Profile' : undefined}
          className={`flex items-center rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100/50 transition-all ${
            isCollapsed ? 'justify-center p-2' : 'gap-3 px-3 py-2'
          }`}
        >
          <User className="w-4 h-4 text-slate-400" />
          {!isCollapsed && <span>Account Profile</span>}
        </Link>
      </div>

    </aside>
  );
}
