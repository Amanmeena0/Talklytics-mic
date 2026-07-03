'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Invalid credentials or login failed.');
      }

      // Set cookie to indicate logged-in state on the client side
      document.cookie = 'logged_in=true; path=/; max-age=604800; SameSite=Lax';

      // Route to redirect path or dashboard
      router.push(redirectPath);
    } catch (err: any) {
      setError(err.message || 'Something went wrong during login.');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick helper to auto-fill for testing/demo
  const handleDemoFill = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Password123!'); // default demo password seeded
  };

  return (
    <div className="bg-surface/60 backdrop-blur-lg border border-surface-container-high rounded-3xl p-8 sm:p-10 shadow-2xl max-w-md w-full transition-all duration-300 hover:shadow-[0px_8px_30px_rgba(0,0,0,0.12)]">
      {/* Title */}
      <div className="text-center mb-8">
        <span className="material-symbols-outlined text-primary text-4xl mb-2">lens_blur</span>
        <h2 className="font-title text-headline-lg font-bold text-on-background tracking-tight">
          Welcome to Talklytics
        </h2>
        <p className="font-body-md text-secondary mt-1">
          Secure, backend-delegated AI sales monitor
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-3 bg-error-container/20 border border-error-container text-error p-4 rounded-2xl mb-6 text-sm animate-shake">
          <span className="material-symbols-outlined text-xl">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label
            className="text-label-bold font-semibold text-secondary text-xs uppercase tracking-wider"
            htmlFor="email"
          >
            Work Email Address
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-secondary/60 text-lg">
              mail
            </span>
            <input
              id="email"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface-container-low text-on-background border border-surface-container-high focus:border-primary rounded-2xl py-3.5 pl-11 pr-4 text-sm outline-none transition-all duration-200"
              disabled={isLoading}
              required
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <label
              className="text-label-bold font-semibold text-secondary text-xs uppercase tracking-wider"
              htmlFor="password"
            >
              Password
            </label>
            <a
              href="#"
              className="text-xs text-primary hover:underline font-semibold"
              onClick={(e) => {
                e.preventDefault();
                alert('Please register a new account if you forgot your credentials.');
              }}
            >
              Forgot password?
            </a>
          </div>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-secondary/60 text-lg">
              lock
            </span>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-surface-container-low text-on-background border border-surface-container-high focus:border-primary rounded-2xl py-3.5 pl-11 pr-4 text-sm outline-none transition-all duration-200"
              disabled={isLoading}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="bg-primary text-on-primary font-label-bold text-sm uppercase tracking-wide py-4 rounded-2xl hover:opacity-90 active:scale-98 transition-all flex justify-center items-center gap-2 shadow-lg mt-2 cursor-pointer disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
              Signing In...
            </>
          ) : (
            <>
              Sign In
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </>
          )}
        </button>
      </form>

      {/* Redirect to signup */}
      <div className="text-center mt-6 text-sm text-secondary">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-primary hover:underline font-semibold">
          Create one now
        </Link>
      </div>

    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col justify-center items-center px-4 relative overflow-hidden gradient-mesh">
      {/* Background circles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      {/* Brand logo header */}
      <div className="absolute top-8 flex items-center gap-2">
        <span className="material-symbols-outlined text-primary text-2xl">lens_blur</span>
        <span className="font-title text-headline-lg font-extrabold text-on-background tracking-tighter">
          Talklytics
        </span>
      </div>

      <Suspense
        fallback={
          <div className="loading-state-container">
            <div className="pulse-dot pulse-dot-large" />
            <p className="text-body mt-4">Loading login terminal...</p>
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
