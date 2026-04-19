'use client';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '@/lib/firebase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // No Firebase config — accept demo credentials locally
    if (!isFirebaseConfigured || !auth) {
      if (email === 'demo@arena.app' && password === 'demo1234') {
        router.replace('/operator');
      } else {
        setError('Invalid credentials. Try demo@arena.app / demo1234');
        setLoading(false);
      }
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace('/operator');
    } catch {
      setError('Invalid credentials. Try demo@arena.app / demo1234');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-widest text-amber-500 uppercase">ARENA</h1>
          <p className="text-slate-400 text-sm mt-2">Operator Dashboard</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-[#1E293B] border border-slate-700 rounded-xl p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-xs text-slate-400 uppercase tracking-wider">Email</label>
            <input
              id="email"
              type="email"
              aria-label="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
              placeholder="demo@arena.app"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-xs text-slate-400 uppercase tracking-wider">Password</label>
            <input
              id="password"
              type="password"
              aria-label="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-2 rounded transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="text-center text-slate-500 text-xs mt-4">Demo: demo@arena.app / demo1234</p>
      </div>
    </div>
  );
}
