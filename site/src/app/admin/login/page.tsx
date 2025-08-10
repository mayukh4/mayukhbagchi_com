"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch('/api/admin/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ password }) });
    if (res.ok) {
      // Check for redirect parameter
      const urlParams = new URLSearchParams(window.location.search);
      const redirect = urlParams.get('redirect') || '/admin/dashboard';
      router.push(redirect);
    } else {
      setError('Invalid password');
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-16">
      <h1 className="text-2xl font-semibold mb-4">Admin login</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <input value={password} onChange={(e)=>setPassword(e.target.value)} type="password" className="w-full rounded border border-muted/40 bg-background/50 px-3 py-2" placeholder="Password" />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button className="rounded px-4 py-2 border border-accent text-accent hover:bg-accent/10">Sign in</button>
      </form>
    </div>
  );
}


