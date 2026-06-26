import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--bg-root)', color: 'var(--text-primary)', minHeight: '100vh' }}>
      <Header />
      <Sidebar />
      {children}
    </div>
  );
}
