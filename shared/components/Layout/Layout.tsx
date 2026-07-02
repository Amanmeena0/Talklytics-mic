import Header from '@/shared/components/Layout/Header';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <Header />
      {children}
    </div>
  );
}
