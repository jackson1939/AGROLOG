'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const email = form.get('email') as string;
    const password = form.get('password') as string;

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      toast.error('Credenciales incorrectas');
      return;
    }

    router.push('/dashboard');
    router.refresh();
  };

  return (
    <div className="rounded-xl bg-surface border border-border shadow-elevated p-8">
      <div className="text-center mb-8">
        <h1 className="font-serif text-3xl text-tierra-900">AgroLog</h1>
        <p className="text-sm text-text-3 mt-1">Tu campo, tu historial, tu decisión.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="email"
          name="email"
          label="Email"
          type="email"
          defaultValue="demo@agrolog.bo"
          required
        />
        <Input
          id="password"
          name="password"
          label="Contraseña"
          type="password"
          defaultValue="campo2024"
          required
        />
        <Button type="submit" className="w-full" loading={loading}>
          Entrar
        </Button>
      </form>

      <p className="text-xs text-text-3 text-center mt-6 font-mono">
        demo@agrolog.bo · campo2024
      </p>
    </div>
  );
}
