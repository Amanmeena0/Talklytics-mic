'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed. The email might already be registered.');
      }

      setSuccess('Account created successfully! Redirecting to login page...');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Something went wrong during registration.');
    } finally {
      setIsLoading(false);
    }
  };

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

      <div className="bg-surface/60 backdrop-blur-lg border border-surface-container-high rounded-3xl p-8 sm:p-10 shadow-2xl max-w-md w-full transition-all duration-300 hover:shadow-[0px_8px_30px_rgba(0,0,0,0.12)]">
        {/* Title */}
        <div className="text-center mb-6">
          <span className="material-symbols-outlined text-primary text-4xl mb-2">lens_blur</span>
          <h2 className="font-title text-headline-lg font-bold text-on-background tracking-tight">
            Create Account
          </h2>
          <p className="font-body-md text-secondary mt-1">
            Get started with AI conversation intelligence
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-3 bg-error-container/20 border border-error-container text-error p-4 rounded-2xl mb-6 text-sm animate-shake">
            <span className="material-symbols-outlined text-xl">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="flex items-center gap-3 bg-success-container/20 border border-success-container text-success p-4 rounded-2xl mb-6 text-sm">
            <span className="material-symbols-outlined text-xl">check_circle</span>
            <span>{success}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-label-bold font-semibold text-secondary text-xs uppercase tracking-wider" htmlFor="name">
              Full Name
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-secondary/60 text-lg">person</span>
              <input
                id="name"
                type="text"
                placeholder="Jane Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-surface-container-low text-on-background border border-surface-container-high focus:border-primary rounded-2xl py-3 pl-11 pr-4 text-sm outline-none transition-all duration-200"
                disabled={isLoading || !!success}
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-label-bold font-semibold text-secondary text-xs uppercase tracking-wider" htmlFor="email">
              Work Email Address
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-secondary/60 text-lg">mail</span>
              <input
                id="email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface-container-low text-on-background border border-surface-container-high focus:border-primary rounded-2xl py-3 pl-11 pr-4 text-sm outline-none transition-all duration-200"
                disabled={isLoading || !!success}
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-label-bold font-semibold text-secondary text-xs uppercase tracking-wider" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-secondary/60 text-lg">lock</span>
              <input
                id="password"
                type="password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-surface-container-low text-on-background border border-surface-container-high focus:border-primary rounded-2xl py-3 pl-11 pr-4 text-sm outline-none transition-all duration-200"
                disabled={isLoading || !!success}
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-label-bold font-semibold text-secondary text-xs uppercase tracking-wider" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-secondary/60 text-lg">lock_reset</span>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-surface-container-low text-on-background border border-surface-container-high focus:border-primary rounded-2xl py-3 pl-11 pr-4 text-sm outline-none transition-all duration-200"
                disabled={isLoading || !!success}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !!success}
            className="bg-primary text-on-primary font-label-bold text-sm uppercase tracking-wide py-3.5 rounded-2xl hover:opacity-90 active:scale-98 transition-all flex justify-center items-center gap-2 shadow-lg mt-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                Registering...
              </>
            ) : (
              <>
                Register Account
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </>
            )}
          </button>
        </form>

        {/* Redirect to login */}
        <div className="text-center mt-6 text-sm text-secondary">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline font-semibold">
            Sign In instead
          </Link>
        </div>
      </div>
    </div>
  );
}
