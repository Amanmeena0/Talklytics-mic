import React from 'react';

interface PageHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  noBorder?: boolean;
}

export default function PageHeader({
  title,
  subtitle,
  badge,
  actions,
  className = '',
  noBorder = false,
}: PageHeaderProps) {
  return (
    <header
      className={`relative flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 mb-8 transition-all duration-300 ${
        noBorder ? '' : 'border-b border-slate-200/60'
      } ${className}`}
    >
      {/* Premium left gradient accent line */}
      <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-gradient-to-b from-indigo-500 to-violet-500 rounded-full opacity-80 blur-[0.5px] hidden md:block" />

      <div className="space-y-2 min-w-0 flex-1 pl-0 md:pl-2">
        {badge && <div className="flex items-center gap-2.5 flex-wrap">{badge}</div>}
        <div className="flex items-center gap-2.5 mt-2.5 flex-wrap">
          {typeof title === 'string' ? (
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 font-sans">
              {title}
            </h1>
          ) : (
            title
          )}
        </div>
        {subtitle && (
          <div className="text-xs text-slate-500 font-sans font-medium tracking-wide leading-relaxed">
            {subtitle}
          </div>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-3 shrink-0 flex-wrap md:justify-end">{actions}</div>
      )}
    </header>
  );
}
