import Header from '@/components/Header';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <Header />
      {children}
    </div>
  );
}
