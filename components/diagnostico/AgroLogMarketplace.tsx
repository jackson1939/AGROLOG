'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, 
  MessageSquare, 
  CheckCircle2, 
  DollarSign, 
  Percent, 
  UserCheck, 
  Sparkles, 
  ArrowRight,
  TrendingUp,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';

interface AgroLogMarketplaceProps {
  enfermedad: string;
  cultivo: string;
  urgencia: string;
}

export function AgroLogMarketplace({ enfermedad, cultivo, urgencia }: AgroLogMarketplaceProps) {
  const [loadingItem, setLoadingItem] = useState<string | null>(null);
  const [successItem, setSuccessItem] = useState<string | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Dynamic recommendations mapping based on real agricultural suppliers in Santa Cruz (Mainter, Interagro, CAICO, etc.)
  const recommendations = [
    {
      id: 'insumo-1',
      type: 'INSUMO',
      name: enfermedad.toLowerCase().includes('roya') ? 'Elatus Extra - Syngenta' : 'Sphere Max 720 SC - Bayer',
      provider: 'Mainter S.A. — Av. Banzer Km 8, SCZ',
      price: 135,
      desc: 'Protección preventiva y curativa de alta fijación. Dosis recomendada: 0.3 L/Ha. Disponible en Mainter, Santa Cruz.',
      delivery: 'Despacho en 4-6 hrs (Montero / Norte Integrado)',
      stock: 'Alta disponibilidad en SCZ',
      phone: '59176008123'
    },
    {
      id: 'servicio-1',
      type: 'SERVICIO',
      name: 'Fumigación con Drone DJI Agras T40',
      provider: 'AgroDrones SCZ — Montero, Norte Integrado',
      price: 18,
      desc: 'Aplicación ultra-localizada con mapa de severidad foliar exportado por AgroLog. Opera en Montero, Mineros y Warnes.',
      delivery: 'Disponible mañana en zona Norte Integrado',
      stock: '2 drones activos en el departamento',
      phone: '59176112345'
    },
    {
      id: 'hardware-1',
      type: 'SENSOR IOT',
      name: 'AgroLog Link Sensor v2 (Humedad + Clorofila)',
      provider: 'AgroTech SCZ · CAICO — Cuatro Cañadas',
      price: 85,
      desc: 'Mide humedad del suelo y reflectancia foliar. Calibrado para suelos areno-arcillosos del Norte Integrado y Expansión Este de SCZ.',
      delivery: 'Envío gratuito a Montero, Cuatro Cañadas o SCZ ciudad',
      stock: '15 unidades en Cuatro Cañadas',
      phone: '59176008123'
    }
  ];

  const handleAcquisition = (itemId: string, itemName: string, price: number) => {
    setLoadingItem(itemId);
    
    // Simulate transaction processing and 3.5% commission calculation
    setTimeout(() => {
      setLoadingItem(null);
      setSuccessItem(itemId);
      const commission = (price * 0.035).toFixed(2);
      const commissionBs = (price * 0.035 * 6.96).toFixed(1);
      toast.success(`¡Adquisición procesada! AgroLog generó $${commission} USD / ${commissionBs} Bs. (3.5% Comisión) por mediación.`);
    }, 2000);
  };

  const getWhatsAppLink = (rec: typeof recommendations[0]) => {
    const priceBs = (rec.price * 6.96).toFixed(0);
    const text = `Hola ${rec.provider.split(' —')[0]}! Soy agrónomo usuario de AgroLog v2.0 (Santa Cruz). Mi parcela de *${cultivo}* ha sido diagnosticada con *${enfermedad}* (Urgencia: *${urgencia}*) por la IA de AgroLog. Deseo adquirir *${rec.name}* a $${rec.price} USD (${priceBs} Bs.). ¿Pueden coordinar el despacho en Santa Cruz?`;
    return `https://wa.me/${rec.phone}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="bg-[#050b07]/95 border border-emerald-500/20 rounded-2xl p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden space-y-6">
      {/* Decorative chlorophyll highlights */}
      <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-emerald-500/5 blur-[100px] pointer-events-none" />

      {/* Header section with commission and status indicators */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono font-bold tracking-widest text-[#4ade80] uppercase">
            <Sparkles className="w-3 h-3" /> Mediador Tecnológico Comercial
          </span>
          <h2 className="font-serif text-xl md:text-2xl text-white mt-1.5">
            Solución Fitosanitaria Sugerida
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            La IA de AgroLog ha diseñado un plan de adquisición directa para neutralizar la plaga.
          </p>
        </div>

        {/* Real-time Business Model Badge */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <TrendingUp className="w-4.5 h-4.5 text-[#4ade80]" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
              Tasa de Comisión
            </div>
            <div className="text-xs text-white font-mono font-black flex items-center gap-0.5">
              3.5% <span className="text-[9px] text-slate-400 font-normal">por transacción</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Products and Services List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {recommendations.map((rec) => {
          const isProcessing = loadingItem === rec.id;
          const isDone = successItem === rec.id;

          return (
            <div 
              key={rec.id}
              className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col justify-between hover:border-emerald-500/30 transition-all duration-300 shadow-inner group relative"
            >
              {/* Type Badge */}
              <div className="flex justify-between items-start mb-3">
                <span className="px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {rec.type}
                </span>
                <span className="text-[9px] font-serif font-black text-emerald-300">
                  {rec.provider.split(' —')[0]}
                </span>
              </div>

              {/* Title & Description */}
              <div className="space-y-1.5 flex-1">
                <h4 className="text-sm font-bold text-white leading-tight group-hover:text-emerald-300 transition-colors">
                  {rec.name}
                </h4>
                <p className="text-[11px] text-slate-300 leading-snug">
                  {rec.desc}
                </p>
                <div className="text-[10px] text-slate-400 font-mono space-y-0.5 pt-1.5 border-t border-white/5">
                  <div>🚚 {rec.delivery}</div>
                  <div>📦 {rec.stock}</div>
                </div>
              </div>

              {/* Bottom Action and Price */}
              <div className="mt-4 pt-3 border-t border-white/10 space-y-2">
                <div className="flex justify-between items-start">
                  <span className="text-[9px] font-mono text-slate-400 mt-1">COSTO ESTIMADO</span>
                  <div className="text-right">
                    <div className="text-sm font-mono font-black text-white">
                      ${rec.price} <span className="text-[10px] text-slate-400 font-normal">USD</span>
                    </div>
                    <div className="text-[11px] font-mono font-bold text-emerald-400">
                      {(rec.price * 6.96).toLocaleString('es-BO', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Bs.
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {/* Immediate Direct WhatsApp Connection (Enlace de venta/canal) */}
                  <a
                    href={getWhatsAppLink(rec)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-1 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/25 hover:bg-emerald-500/20 text-[10px] font-bold text-[#4ade80] transition-all duration-300 text-center"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    WhatsApp
                  </a>

                  {/* Immediate 1-Click Purchase System with commission popup */}
                  <Button
                    size="sm"
                    onClick={() => handleAcquisition(rec.id, rec.name, rec.price)}
                    disabled={isProcessing || isDone}
                    className={`w-full py-2 rounded-lg text-[10px] font-mono font-bold transition-all duration-300 flex items-center justify-center gap-1 ${
                      isDone 
                        ? 'bg-emerald-600 border border-emerald-400 text-white' 
                        : 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-md shadow-emerald-500/10'
                    }`}
                  >
                    {isProcessing ? 'Procesando...' : isDone ? 'Adquirido ✓' : 'Comprar 1-Click'}
                  </Button>
                </div>
              </div>

              {/* Success Overlay animation */}
              <AnimatePresence>
                {isDone && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-[#050b07]/95 rounded-xl flex flex-col items-center justify-center p-4 text-center z-20 border border-emerald-400/30"
                  >
                    <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center mb-2 animate-bounce">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    </div>
                    <h5 className="text-xs font-bold text-white">¡Despacho Solicitado!</h5>
                    <p className="text-[10px] text-slate-300 mt-1 max-w-[180px]">
                      Conectando con {rec.provider.split(' —')[0]} para la entrega directa en tu parcela.
                    </p>
                    <div className="text-[8px] font-mono text-emerald-400 mt-2 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      3.5% COMISIÓN AUDITADA
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Official AgroLog Broadcast Channel Subscription (Canal de Difusión Fitosanitaria de Santa Cruz) */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-5 select-none text-4xl">📢</div>
        
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <h4 className="text-xs font-bold text-white">Canal de Alertas Fitosanitarias — Santa Cruz</h4>
          </div>
          <p className="text-[10px] text-slate-300">
            Recibe alertas preventivas de focos de plaga en tiempo real: Montero, Mineros, Warnes, Cuatro Cañadas, Samaipata y San Julián.
          </p>
        </div>

        <div className="flex gap-2">
          {isSubscribed ? (
            <div className="px-3.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-[#4ade80] flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5" /> Suscrito al Canal
            </div>
          ) : (
            <Button
              size="sm"
              onClick={() => {
                setIsSubscribed(true);
                toast.success('¡Te has suscrito al Canal de Difusión Fitosanitaria de Santa Cruz!');
              }}
              className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-[10px] px-4 py-1.5 rounded-lg transition-all duration-300"
            >
              Suscribirse
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
