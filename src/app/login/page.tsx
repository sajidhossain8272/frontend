'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Activity, ShieldCheck, ArrowRight, KeyRound } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setError('');
    setIsLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('admin@doctortracker.com');
    setPassword('Password@123');
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Icon */}
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-xl bg-[#0F172A] text-white flex items-center justify-center shadow-card border border-slate-900">
            <Activity className="w-6 h-6 text-emerald-400" />
          </div>
        </div>

        {/* Header Typography */}
        <div className="text-center mt-4 space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Doctor Tracker
          </h2>
          <p className="text-xs text-slate-500 font-medium tracking-wide uppercase">
            Clinical Administration Portal
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl border border-slate-200/80 shadow-hover">
          {error && (
            <div className="mb-5 p-3 rounded-lg text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="admin@doctortracker.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full h-10"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Sign In to Portal
              </Button>
            </div>
          </form>

          {/* Quick Demo Fill Box */}
          <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium text-slate-700">Evaluation Credentials</span>
              <span className="text-[11px] text-slate-400">Pre-seeded</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/60 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Email:</span>
                <span className="font-mono text-slate-800">admin@doctortracker.com</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Password:</span>
                <span className="font-mono text-slate-800">Password@123</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleFillDemo}
              className="w-full text-xs text-slate-700"
              leftIcon={<KeyRound className="w-3.5 h-3.5 text-slate-500" />}
            >
              Autofill Demo Credentials
            </Button>
          </div>
        </div>

        {/* Security Footer Notice */}
        <div className="mt-6 text-center flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
          <span>Care Guide BD • Certified Clinical Infrastructure</span>
        </div>
      </div>
    </div>
  );
}
