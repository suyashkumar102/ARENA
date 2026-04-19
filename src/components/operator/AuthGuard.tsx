'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '@/lib/firebase';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // No Firebase config — skip auth entirely and show the dashboard
    if (!isFirebaseConfigured || !auth) {
      setAuthed(true);
      setChecking(false);
      return;
    }

    return onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthed(true);
      } else {
        router.replace('/operator/login');
      }
      setChecking(false);
    });
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" aria-label="Loading" />
      </div>
    );
  }
  if (!authed) return null;
  return <>{children}</>;
}
