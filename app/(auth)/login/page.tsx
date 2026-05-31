'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'sonner';
import { Sparkles, BrainCircuit, ShoppingBag, ShieldCheck, Compass } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('demo@agrolog.bo');
  const [password, setPassword] = useState('campo2024');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

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

  const handleSelectCredentials = (selectedEmail: string, selectedPass: string) => {
    setEmail(selectedEmail);
    setPassword(selectedPass);
    toast.success(`Cargadas credenciales de: ${selectedEmail.split('@')[0].toUpperCase()}`);
  };

  return (
    <div className="w-full bg-black/40 rounded-3xl border border-white/10 p-4 md:p-6 backdrop-blur-xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-8 items-center min-h-[500px]">
      
      {/* ── Left Column: Agrotech Sci-Fi Showcase Panel ── */}
      <div className="hidden md:flex flex-col justify-between h-full min-h-[460px] rounded-2xl p-8 bg-gradient-to-br from-[#0a2818]/60 to-[#15452a]/60 text-white relative overflow-hidden shadow-inner border border-white/10 backdrop-blur-md">
        
        {/* Animated matrix dots pattern in the background */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(rgba(34,197,94,0.3)_1px,transparent_1px)] bg-[size:16px_16px]" />
        
        {/* Decorative organic tech orbs */}
        <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-[#4ade80]/10 blur-[40px] animate-pulse" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full bg-amber-500/10 blur-[40px] animate-pulse [animation-delay:1.5s]" />

        {/* Top brand header */}
        <div className="relative z-10 flex items-center gap-2">
          <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-gradient-to-br from-[#4ade80] to-[#16a34a] shadow-md shadow-[#16a34a]/30">
            <span className="text-white text-sm font-bold">🌾</span>
          </div>
          <span className="font-serif text-lg font-black tracking-wider text-white">
            Agro<span className="text-[#4ade80]">Log</span>
          </span>
        </div>

        {/* Center: Main value proposition */}
        <div className="relative z-10 my-auto py-6 space-y-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#4ade80]/10 border border-[#4ade80]/20 text-[10px] font-mono font-bold tracking-widest text-[#4ade80] uppercase">
              <Sparkles className="w-3 h-3" /> Ecosistema de 3ra Generación
            </span>
            <h2 className="font-serif text-3xl font-black leading-tight text-white">
              Siembra Datos.<br />
              Cosecha Futuro.
            </h2>
            <p className="text-xs text-[#6ca381] leading-relaxed max-w-sm">
              Conectamos el relevo generacional del campo con insumos de alta tecnología en Santa Cruz.
            </p>
          </div>

          {/* Interactive Feature Pills */}
          <div className="space-y-2.5 max-w-xs">
            {[
              { icon: <BrainCircuit className="w-4 h-4 text-[#4ade80]" />, title: 'Diagnóstico Foliar con IA', desc: 'Análisis visual al instante mediante Gemini.' },
              { icon: <ShoppingBag className="w-4 h-4 text-amber-400" />, title: 'Marketplace de Adquisición', desc: 'Compra insumos específicos con un solo click.' },
              { icon: <ShieldCheck className="w-4 h-4 text-[#4ade80]" />, title: 'Mediación Tecnológica', desc: 'El nexo comercial perfecto para el productor.' }
            ].map((feat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
                className="flex items-start gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5 hover:border-[#4ade80]/20 transition-all duration-300 backdrop-blur-sm group"
              >
                <div className="p-1.5 rounded-lg bg-white/5 group-hover:scale-110 transition-transform duration-300">
                  {feat.icon}
                </div>
                <div>
                  <h4 className="text-[11px] font-bold text-white leading-none mb-1">{feat.title}</h4>
                  <p className="text-[9px] text-[#6ca381] leading-tight">{feat.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom footer note */}
        <div className="relative z-10 flex items-center gap-1.5 text-[9px] font-mono text-[#6ca381]">
          <Compass className="w-3 h-3 text-[#4ade80]" />
          <span>Bolivia AgroTech Network · 2026</span>
        </div>
      </div>

      {/* ── Right Column: The Premium Login Form ── */}
      <div className="p-4 md:p-6 flex flex-col justify-center h-full relative z-10">
        
        {/* Mobile Header (Only visible on mobile) */}
        <div className="flex md:hidden items-center justify-center gap-2 mb-8">
          <div className="h-9 w-9 flex items-center justify-center rounded-xl bg-gradient-to-br from-[#16a34a] to-[#052e16] shadow-lg">
            <span className="text-white text-base font-bold">🌾</span>
          </div>
          <span className="font-serif text-2xl font-black text-white">
            Agro<span className="text-[#4ade80]">Log</span>
          </span>
        </div>

        {/* Form Title */}
        <div className="mb-6 text-center md:text-left">
          <h1 className="font-serif text-2xl md:text-3xl font-black text-white">
            Iniciar Sesión
          </h1>
          <p className="text-xs text-[#4ade80]/80 mt-1 font-medium">
            Entra a tu portal de campo y marketplace digital.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="group transition-all duration-300 [&_label]:text-[#4ade80]/80 [&_label]:text-xs [&_label]:font-mono [&_label]:uppercase [&_label]:tracking-wider [&_label]:mb-1.5">
            <Input
              id="email"
              name="email"
              label="Email de Usuario"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-black/30 hover:bg-black/40 focus:bg-black/50 border-white/10 text-white placeholder-white/20 focus:ring-[#4ade80]/30 focus:border-[#4ade80] rounded-xl text-sm"
            />
          </div>
          
          <div className="group transition-all duration-300 [&_label]:text-[#4ade80]/80 [&_label]:text-xs [&_label]:font-mono [&_label]:uppercase [&_label]:tracking-wider [&_label]:mb-1.5">
            <Input
              id="password"
              name="password"
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-black/30 hover:bg-black/40 focus:bg-black/50 border-white/10 text-white placeholder-white/20 focus:ring-[#4ade80]/30 focus:border-[#4ade80] rounded-xl text-sm"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#16a34a] to-[#15803d] text-white font-bold text-sm shadow-md shadow-[#16a34a]/10 hover:shadow-lg hover:shadow-[#16a34a]/20 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 mt-2" 
            loading={loading}
          >
            Ingresar al Campo
          </Button>
        </form>

        {/* Credentials Sandbox Helper */}
        <div className="mt-8 p-4 rounded-xl bg-white/5 border border-white/10 relative overflow-hidden backdrop-blur-md">
          <div className="absolute right-2 top-2 opacity-10 select-none text-2xl">🔐</div>
          <p className="text-[10px] font-mono text-[#4ade80] font-bold text-center mb-3">
            Credenciales de Demostración:
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div 
              onClick={() => handleSelectCredentials('demo@agrolog.bo', 'campo2024')}
              className="bg-black/30 border border-white/5 p-2 rounded-lg text-center cursor-pointer hover:bg-emerald-500/5 hover:border-emerald-500/30 active:scale-[0.98] transition-all duration-200"
            >
              <span className="text-[10px] font-bold text-white block mb-1">👨‍🌾 Productor / Usuario</span>
              <code className="text-[9px] font-mono text-emerald-300 block bg-white/5 px-1.5 py-0.5 rounded mb-1">
                demo@agrolog.bo
              </code>
              <code className="text-[9px] font-mono text-white/60 block bg-white/5 px-1.5 py-0.5 rounded">
                campo2024
              </code>
              <div className="text-[#4ade80] text-[9px] font-mono mt-1 font-bold uppercase tracking-wider animate-pulse">¡Haz click!</div>
            </div>
            
            <div 
              onClick={() => handleSelectCredentials('admin@agrolog.bo', 'admin2024')}
              className="bg-black/30 border border-amber-500/10 p-2 rounded-lg text-center cursor-pointer hover:bg-amber-500/5 hover:border-amber-500/30 active:scale-[0.98] transition-all duration-200"
            >
              <span className="text-[10px] font-bold text-amber-400 block mb-1">👑 Administrador Central</span>
              <code className="text-[9px] font-mono text-amber-200 block bg-amber-500/10 px-1.5 py-0.5 rounded mb-1">
                admin@agrolog.bo
              </code>
              <code className="text-[9px] font-mono text-white/60 block bg-white/5 px-1.5 py-0.5 rounded">
                admin2024
              </code>
              <div className="text-amber-400 text-[9px] font-mono mt-1 font-bold uppercase tracking-wider animate-pulse">¡Haz click!</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
