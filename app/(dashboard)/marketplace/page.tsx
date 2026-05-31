'use client';

import { useState } from 'react';
import { ShoppingBag, Filter, Search, TrendingUp, Sparkles, MessageSquare, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = ['Todos', 'Fungicidas', 'Herbicidas', 'Fertilizantes', 'Servicios Drone', 'Sensores IoT'];

// ─── Proveedores reales de Santa Cruz, Bolivia ───
// Mainter S.A. → Av. Banzer Km 8, Santa Cruz de la Sierra
// Interagro → Plan 3000, Santa Cruz de la Sierra
// AgroCoop → Warnes, Norte Integrado
// CAICO → Cuatro Cañadas, Expansión Este
// AgroDrones SCZ → Montero, Norte Integrado
const PRODUCTS = [
  {
    id: 'p1', category: 'Fungicidas',
    name: 'Elatus Extra (Syngenta)',
    desc: 'Fungicida sistémico preventivo-curativo para Roya Asiática de la Soya. Dosis recomendada: 0.3 L/Ha. Ideal para R1-R3.',
    provider: 'Mainter S.A.', zone: '📍 Av. Banzer Km 8 · Santa Cruz de la Sierra',
    phone: '59176008123',
    price: 135, unit: 'L', stock: 'Alta disponibilidad', badge: '🔥 Más vendido Norte Integrado',
    tags: ['SOYA', 'ROYA', 'MONTERO', 'NORTE INTEGRADO'],
  },
  {
    id: 'p2', category: 'Fungicidas',
    name: 'Sphere Max 720 SC (Bayer)',
    desc: 'Trifloxistrobina + Ciproconazol. Control de Cercospora, Mancha marrón y Roya en soya de Cuatro Cañadas.',
    provider: 'Interagro', zone: '📍 Plan 3000 · Santa Cruz de la Sierra',
    phone: '59178044321',
    price: 98, unit: 'L', stock: 'Stock disponible', badge: null,
    tags: ['SOYA', 'CERCOSPORA', 'CUATRO CAÑADAS'],
  },
  {
    id: 'p3', category: 'Herbicidas',
    name: 'Glifosato Arpon 480 SL',
    desc: 'Herbicida de contacto no selectivo para control de malezas en barbecho. Ampliamente usado en el Norte Integrado y Cuatro Cañadas.',
    provider: 'AgroCoop Warnes', zone: '📍 Warnes · Norte Integrado, SCZ',
    phone: '59176009234',
    price: 42, unit: 'L', stock: 'Alta disponibilidad', badge: null,
    tags: ['SOYA', 'MAIZ', 'BARBECHO', 'WARNES'],
  },
  {
    id: 'p4', category: 'Fertilizantes',
    name: 'Urea Granulada 46%N - ANAPO',
    desc: 'Fertilizante nitrogenado certificado por ANAPO. Recomendado para hortalizas de los Valles (Samaipata, Mairana, Comarapa).',
    provider: 'ANAPO Santa Cruz', zone: '📍 Av. Cañoto · Casco Viejo, SCZ',
    phone: '59133427900',
    price: 85, unit: 'Saco 50kg', stock: 'Alta disponibilidad', badge: '⚡ Certificado ANAPO',
    tags: ['TOMATE', 'PAPA', 'SAMAIPATA', 'VALLES CRUCEÑOS'],
  },
  {
    id: 'p5', category: 'Servicios Drone',
    name: 'Fumigación DJI Agras T40',
    desc: 'Servicio de fumigación aérea de precisión con mapa de infestación exportado desde AgroLog. Cobertura Norte Integrado y Expansión Este.',
    provider: 'AgroDrones SCZ', zone: '📍 Montero · Norte Integrado, SCZ',
    phone: '59176112345',
    price: 18, unit: 'USD/Ha', stock: '2 drones activos en SCZ', badge: '🤖 Integrado con AgroLog',
    tags: ['TODOS LOS CULTIVOS', 'MONTERO', 'CUATRO CAÑADAS'],
  },
  {
    id: 'p6', category: 'Sensores IoT',
    name: 'Sensor AgroLog Link v2 (Humedad + Clorofila)',
    desc: 'Sensor IoT de humedad de suelo y reflectancia foliar. Transmisión en tiempo real al sistema AgroLog. Calibrado para suelos arcillosos del Norte Integrado.',
    provider: 'AgroTech SCZ · CAICO', zone: '📍 Cuatro Cañadas · Expansión Este, SCZ',
    phone: '59176008123',
    price: 85, unit: 'Unidad', stock: '15 unidades en Cuatro Cañadas', badge: '🔗 Nativo AgroLog',
    tags: ['SOYA', 'IOT', 'CUATRO CAÑADAS', 'EXPANSIÓN ESTE'],
  },
];

export default function MarketplacePage() {
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [search, setSearch] = useState('');
  const [purchasedId, setPurchasedId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filtered = PRODUCTS.filter(p => {
    const matchCat = selectedCategory === 'Todos' || p.category === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.desc.toLowerCase().includes(search.toLowerCase()) ||
      p.provider.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleBuy = (id: string, name: string, price: number) => {
    setLoadingId(id);
    setTimeout(() => {
      setLoadingId(null);
      setPurchasedId(id);
      const commission = (price * 0.035).toFixed(2);
      const commissionBs = (price * 0.035 * 6.96).toFixed(1);
      toast.success(`¡Adquisición procesada! Comisión AgroLog: $${commission} USD / ${commissionBs} Bs. (3.5% mediación)`);
    }, 1800);
  };

  const handleWhatsApp = (product: typeof PRODUCTS[0]) => {
    const priceBs = (product.price * 6.96).toFixed(0);
    const msg = `Hola ${product.provider}! Soy usuario de AgroLog v2.0 (Santa Cruz). Me interesa adquirir *${product.name}* a $${product.price} USD (${priceBs} Bs.) por ${product.unit}. ¿Pueden coordinar el despacho a mi parcela en ${product.zone.replace('📍 ', '')}?`;
    window.open(`https://wa.me/${product.phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const totalCommissionPotential = filtered.reduce((sum, p) => sum + p.price * 0.035, 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShoppingBag className="w-5 h-5 text-emerald-600" />
            <h1 className="font-serif text-2xl text-text-1">Marketplace de Insumos</h1>
          </div>
          <p className="text-sm text-text-3">
            Insumos, servicios y tecnología de proveedores reales de <strong className="text-campo-700">Santa Cruz de la Sierra y el Norte Integrado</strong>.
          </p>
        </div>

        {/* Live revenue model indicator */}
        <div className="bg-campo-50 border border-campo-100 rounded-xl px-4 py-3 flex items-center gap-3 shrink-0">
          <TrendingUp className="w-4 h-4 text-campo-700" />
          <div>
            <p className="text-[9px] font-mono text-campo-700 uppercase tracking-widest font-bold">Comisión potencial</p>
            <p className="text-sm font-mono font-black text-campo-700">
              ${totalCommissionPotential.toFixed(2)} USD / {(totalCommissionPotential * 6.96).toFixed(1)} Bs.
              <span className="text-[9px] font-normal text-campo-500 ml-1">@ 3.5%</span>
            </p>
          </div>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar insumo, proveedor..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-surface text-sm text-text-1 placeholder:text-text-3 focus:outline-none focus:ring-2 focus:ring-campo-500/20 focus:border-campo-500 transition-colors"
          />
        </div>

        {/* Category filter */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                selectedCategory === cat
                  ? 'bg-campo-700 text-white shadow-sm'
                  : 'bg-surface-2 text-text-2 hover:bg-surface-3 border border-border/50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((product) => {
            const isBought = purchasedId === product.id;
            const isLoading = loadingId === product.id;

            return (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="bg-surface border border-border/50 rounded-xl p-4 flex flex-col justify-between shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-0.5 group relative"
              >
                {/* Badge */}
                {product.badge && (
                  <span className="absolute -top-2.5 left-4 text-[9px] font-mono font-black bg-campo-500 text-white px-2.5 py-0.5 rounded-full shadow-sm">
                    {product.badge}
                  </span>
                )}

                {/* Category chip & provider */}
                <div className="flex justify-between items-start mb-3 pt-1">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-text-3 bg-surface-2 px-2 py-0.5 rounded border border-border/40">
                    {product.category}
                  </span>
                  <span className="text-[9px] text-text-3 text-right max-w-[120px] leading-tight">{product.provider}</span>
                </div>

                {/* Name & Description */}
                <div className="flex-1 space-y-1.5 mb-4">
                  <h3 className="font-serif text-base text-text-1 group-hover:text-campo-700 transition-colors">{product.name}</h3>
                  <p className="text-xs text-text-2 leading-snug">{product.desc}</p>
                  <p className="text-[10px] font-mono text-text-3">📍 {product.zone}</p>
                  <p className="text-[10px] font-mono text-emerald-600">📦 Stock: {product.stock}</p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {product.tags.map(tag => (
                    <span key={tag} className="text-[8px] font-mono bg-campo-50 text-campo-700 border border-campo-100 px-1.5 py-0.5 rounded">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Price + Actions */}
                <div className="border-t border-border/40 pt-3 space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] font-mono text-text-3 uppercase mt-1">Precio</span>
                    <div className="text-right">
                      <div className="text-base font-mono font-black text-text-1">
                        ${product.price}
                        <span className="text-[10px] text-text-3 font-normal ml-1">USD/{product.unit}</span>
                      </div>
                      <div className="text-xs font-mono font-bold text-emerald-600">
                        {(product.price * 6.96).toLocaleString('es-BO', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Bs.
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleWhatsApp(product)}
                      className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-emerald-50 border border-emerald-200/60 text-[10px] font-bold text-emerald-700 hover:bg-emerald-100 transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      WhatsApp
                    </button>

                    <button
                      onClick={() => !isBought && handleBuy(product.id, product.name, product.price)}
                      disabled={isLoading || isBought}
                      className={`flex items-center justify-center gap-1 py-2 rounded-lg text-[10px] font-bold transition-all duration-300 ${
                        isBought
                          ? 'bg-campo-500 text-white border border-campo-400'
                          : 'bg-campo-700 hover:bg-campo-600 text-white shadow-sm'
                      } disabled:opacity-70`}
                    >
                      {isLoading ? (
                        <span className="animate-pulse">Procesando...</span>
                      ) : isBought ? (
                        <><CheckCircle2 className="w-3.5 h-3.5" /> Comprado</>
                      ) : (
                        '1-Click Comprar'
                      )}
                    </button>
                  </div>

                  {/* Commission micro-indicator */}
                  <p className="text-[8px] font-mono text-text-3 text-right">
                    AgroLog gana: <span className="text-campo-600 font-bold">${(product.price * 0.035).toFixed(2)} USD / {((product.price * 0.035) * 6.96).toFixed(1)} Bs.</span> (3.5%)
                  </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-text-3">
          <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-20" />
          <p className="font-serif text-lg">Sin productos para este filtro</p>
          <p className="text-sm mt-1">Intenta cambiar la categoría o la búsqueda</p>
        </div>
      )}
    </div>
  );
}
