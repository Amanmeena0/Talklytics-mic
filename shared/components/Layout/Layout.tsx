'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/shared/components/Layout/Header';
import Sidebar from '@/shared/components/Layout/Sidebar';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load from localStorage if client side
  useEffect(() => {
    const saved = localStorage.getItem('sidebar_collapsed') === 'true';
    setIsCollapsed(saved);
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('sidebar_collapsed', String(next));
      return next;
    });
  };

  return (
    <div className="app-shell min-h-screen bg-[#FAFBFC]">
      <Header />
      <Sidebar isCollapsed={isCollapsed} toggleCollapse={toggleCollapse} />
      <div className={`transition-all duration-300 ${isCollapsed ? 'md:pl-16' : 'md:pl-[260px]'} w-full min-h-screen`}>
        {children}
      </div>
    </div>
  );
}
