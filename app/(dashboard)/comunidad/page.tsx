'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Camera, Send, MessageSquare, BrainCircuit, Activity, CheckCircle2, FileDown, Eye, Check, Trash2, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';

// Sample Field Images for mock simulation upload
const PRESET_IMAGES = [
  { label: 'Hojas con Roya Asiática', url: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?q=80&w=600&auto=format&fit=crop' },
  { label: 'Gusano Cogollero en Maíz', url: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?q=80&w=600&auto=format&fit=crop' },
  { label: 'Hojas con Tizón Tardío', url: 'https://images.unsplash.com/photo-1416339306562-f3d12fefd36f?q=80&w=600&auto=format&fit=crop' }
];

export default function ComunidadPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';

  const [message, setMessage] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  const [showImageSelector, setShowImageSelector] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecciona un archivo de imagen válido');
      return;
    }

    // Limit to 4MB to prevent DB bloating in a hackathon SQLite
    if (file.size > 4 * 1024 * 1024) {
      toast.error('La imagen supera los 4MB. Sube una más compacta.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFotoUrl(reader.result as string);
      toast.success('¡Imagen local cargada y lista para publicar!');
      setShowImageSelector(false); // Close preset selection if opened
    };
    reader.readAsDataURL(file);
  };

  // Fetch posts from API
  const fetchPosts = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const res = await fetch('/api/comunidad');
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Poll for posts in real-time every 3.5 seconds
  useEffect(() => {
    fetchPosts(true);
    const interval = setInterval(() => {
      fetchPosts(false);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/comunidad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensaje: message, fotoUrl }),
      });

      if (res.ok) {
        const newPost = await res.json();
        setPosts([newPost, ...posts]);
        setMessage('');
        setFotoUrl('');
        setShowImageSelector(false);
        toast.success('Publicación enviada al canal en tiempo real');
      } else {
        toast.error('Error al enviar publicación');
      }
    } catch (err) {
      toast.error('Error al conectar con el servidor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta publicación del canal regional?')) return;
    try {
      const res = await fetch(`/api/comunidad/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setPosts(posts.filter((p) => p.id !== id));
        toast.success('Publicación eliminada correctamente');
      } else {
        toast.error('Error al eliminar la publicación');
      }
    } catch (err) {
      toast.error('Error de red al intentar eliminar');
    }
  };

  const handleAnalyze = async (id: string) => {
    setAnalyzingId(id);
    toast.loading('Analizando diagnóstico con Gemini AI...', { id: 'analyze' });
    try {
      const res = await fetch(`/api/comunidad/${id}/analyze`, {
        method: 'POST',
      });

      if (res.ok) {
        const updatedPost = await res.json();
        setPosts(posts.map(p => p.id === id ? updatedPost : p));
        toast.success('Análisis completado. ¡Veredicto e informe técnico creados!', { id: 'analyze' });
      } else {
        toast.error('Error al analizar la publicación', { id: 'analyze' });
      }
    } catch (err) {
      toast.error('Error de red', { id: 'analyze' });
    } finally {
      setAnalyzingId(null);
    }
  };

  // Dynamic PDF proposal generator
  const downloadProposal = (post: any) => {
    const analysis = post.analisis;
    if (!analysis) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Informe Técnico y Propuesta Comercial IA - AgroLog</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; padding: 40px; background-color: #ffffff; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #10b981; padding-bottom: 20px; }
            .title { color: #065f46; font-size: 28px; font-weight: bold; margin: 0; }
            .subtitle { color: #64748b; font-size: 14px; margin-top: 5px; }
            .badge { background-color: ${analysis.gravedad === 'CRÍTICA' ? '#ef4444' : '#f59e0b'}; color: white; padding: 4px 12px; rounded-radius: 4px; font-weight: bold; font-size: 12px; border-radius: 4px; }
            .section { margin-top: 30px; }
            .section-title { font-size: 18px; color: #0f766e; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; font-weight: bold; }
            .grid { display: grid; grid-template-cols: 1fr 1fr; gap: 20px; margin-top: 15px; }
            .card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; }
            .card-label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold; }
            .card-value { font-size: 15px; color: #0f172a; margin-top: 4px; font-weight: 500; }
            .message-box { background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; border-radius: 0 8px 8px 0; margin-top: 20px; font-style: italic; }
            .footer { margin-top: 60px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
            .btn-print { background-color: #10b981; color: white; border: none; padding: 10px 20px; font-weight: bold; border-radius: 6px; cursor: pointer; float: right; margin-top: 20px; }
            @media print { .btn-print { display: none; } }
          </style>
        </head>
        <body>
          <button class="btn-print" onclick="window.print()">Imprimir / Guardar PDF</button>
          <div class="header">
            <div>
              <h1 class="title">AgroLog Central v2.0</h1>
              <p class="subtitle">Propuesta Comercial y Asesoramiento Fitosanitario IA</p>
            </div>
            <span class="badge">${analysis.gravedad}</span>
          </div>

          <div class="message-box">
            <strong>Caso reportado por ${post.user.name} (${post.user.role}):</strong><br/>
            "${post.mensaje}"
          </div>

          <div class="section">
            <h2 class="section-title">1. Diagnóstico de Patología e Impacto</h2>
            <div class="grid">
              <div class="card">
                <div class="card-label">Detección Principal</div>
                <div class="card-value">${analysis.enfermedad}</div>
              </div>
              <div class="card">
                <div class="card-label">Severidad Estimada</div>
                <div class="card-value">${analysis.gravedad}</div>
              </div>
            </div>
            <div class="card" style="margin-top: 15px;">
              <div class="card-label">Detalles del Monitoreo Regional</div>
              <div class="card-value" style="font-weight: normal; line-height: 1.6;">${analysis.detalles}</div>
            </div>
          </div>

          <div class="section">
            <h2 class="section-title">2. Plan de Intervención y Sugerencias de Adquisición</h2>
            <div class="grid">
              <div class="card">
                <div class="card-label">Tratamiento Recomendado</div>
                <div class="card-value" style="color: #047857;">${analysis.recomendacion}</div>
              </div>
              <div class="card">
                <div class="card-label">Plazo Crítico de Ejecución</div>
                <div class="card-value" style="color: #b91c1c;">${analysis.urgencia}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <h2 class="section-title">3. Certificación de IA</h2>
            <p style="font-size: 13px; color: #475569; line-height: 1.6;">
              Este informe ha sido compilado automáticamente por el motor cognitivo de <strong>AgroLog AI</strong> en base a redes neurales calibradas para la fitosanidad en el departamento de Santa Cruz, Bolivia. La adquisición de insumos sugerida genera un beneficio directo a la producción agrícola local y cuenta con el 3.5% de mediación de la plataforma.
            </p>
          </div>

          <div class="footer">
            Generado por el Administrador ${analysis.generadoPor} · Central AgroLog Santa Cruz · ${new Date(analysis.fechaAnalisis).toLocaleString()}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-black text-white flex items-center gap-3">
          <MessageSquare className="w-8 h-8 text-[#4ade80]" />
          Canal de Difusión Regional
        </h1>
        <p className="text-[#6ca381] mt-2">
          {isAdmin 
            ? 'Monitoreo en tiempo real de reportes de campo e intervención con IA para emitir alertas e informes.'
            : 'Comparte diagnósticos de campo en tiempo real, sube fotos de plagas y recibe propuestas fitosanitarias con IA.'}
        </p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md space-y-3">
        {/* Hidden File Input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*" 
          className="hidden" 
        />

        {/* Selected Photo Preview */}
        {fotoUrl && (
          <div className="relative inline-block mt-1">
            <div className="h-20 w-32 rounded-xl overflow-hidden border border-white/15 bg-black/40">
              <img src={fotoUrl} alt="Preview" className="h-full w-full object-cover" />
            </div>
            <button
              type="button"
              onClick={() => {
                setFotoUrl('');
                toast.info('Imagen removida');
              }}
              className="absolute -top-1.5 -right-1.5 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors shadow-lg"
              title="Quitar imagen"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="flex-1 bg-black/30 rounded-xl flex items-center px-4 border border-white/5 focus-within:border-[#4ade80]/50 transition-colors">
            <input
              type="text"
              placeholder={isAdmin 
                ? "Publicar aviso central, alerta regional o anomalía de campo... (Escribe 'roya', 'gusano' o 'tizón' para probar)"
                : "¿Qué plaga o anomalía observas en tu parcela hoy? (Escribe 'roya', 'gusano' o 'tizón' para probar)"}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isSubmitting}
              className="w-full bg-transparent border-none text-white focus:ring-0 placeholder:text-white/30 text-sm py-3 outline-none"
            />
            <button 
              type="button" 
              onClick={() => setShowImageSelector(!showImageSelector)}
              disabled={isSubmitting}
              className={`transition-colors p-2 rounded-lg ${fotoUrl ? 'text-[#4ade80] bg-[#4ade80]/10' : 'text-white/40 hover:text-[#4ade80]'}`}
              title="Añadir foto de anomalía"
            >
              <Camera className="w-5 h-5" />
            </button>
          </div>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-[#4ade80] text-black hover:bg-[#22c55e] px-6 rounded-xl font-bold text-xs uppercase tracking-wider disabled:opacity-50"
          >
            {isSubmitting ? 'Publicando...' : 'Publicar'}
          </Button>
        </form>

        {/* Image Selector Area (Presets + Native Local upload trigger) */}
        {showImageSelector && (
          <div className="bg-black/40 p-3 rounded-xl border border-white/5 space-y-3">
            <div className="flex justify-between items-center">
              <p className="text-xs text-[#6ca381] font-mono">Selecciona una foto del simulador o sube tu archivo real:</p>
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-[10px] font-bold transition-all border border-emerald-500/20"
              >
                <Upload className="w-3.5 h-3.5" />
                Subir Imagen Local (PNG/JPG)
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {PRESET_IMAGES.map((img) => (
                <button
                  key={img.url}
                  onClick={() => {
                    setFotoUrl(img.url);
                    toast.success(`Foto "${img.label}" adjuntada correctamente`);
                  }}
                  className={`relative p-2 rounded-lg border text-left text-[10px] transition-all overflow-hidden ${
                    fotoUrl === img.url 
                      ? 'border-[#4ade80] bg-[#4ade80]/5 text-white' 
                      : 'border-white/5 bg-white/5 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  <div className="h-10 w-full mb-1 bg-cover bg-center rounded" style={{ backgroundImage: `url(${img.url})` }} />
                  <span className="block truncate font-bold">{img.label}</span>
                  {fotoUrl === img.url && (
                    <span className="absolute top-1 right-1 bg-[#4ade80] text-black rounded-full p-0.5">
                      <Check className="w-2 h-2" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-[#6ca381]">
          <span className="animate-pulse">Cargando transmisiones comunitarias...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-black/40 border border-white/5 hover:border-white/10 transition-colors rounded-2xl p-5 relative overflow-hidden group">
              
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#16a34a] to-[#052e16] flex items-center justify-center font-bold text-white shadow-inner">
                    {post.user?.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{post.user?.name || 'Productor'}</h4>
                    <p className="text-[10px] text-[#6ca381] uppercase tracking-wider">
                      {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {post.user?.role || 'AGRONOMO'}
                    </p>
                  </div>
                </div>
                {post.estado === 'ANALIZADO' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" /> Propuesta Emitida
                  </span>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-bold uppercase tracking-wider border border-amber-500/20">
                      <Activity className="w-3 h-3" /> Pendiente IA
                    </span>
                    {(isAdmin || post.userId === session?.user?.id) && (
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="text-red-400/60 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                        title="Eliminar publicación"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Message text & picture attachment */}
              <div className="space-y-3 mb-4">
                <p className="text-white/80 text-sm">{post.mensaje}</p>
                {post.fotoUrl && (
                  <div className="max-w-md overflow-hidden rounded-xl border border-white/10 bg-black/40">
                    <img 
                      src={post.fotoUrl} 
                      alt="Anomalía de campo" 
                      className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
              </div>

              {post.estado === 'ANALIZADO' && post.analisis && (
                <div className="mt-4 bg-emerald-950/30 border border-emerald-500/20 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <BrainCircuit className="w-4 h-4 text-emerald-400 animate-pulse" />
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Veredicto IA AgroLog</span>
                    </div>
                    
                    {/* DOWNLOAD PROPOSAL BUTTON */}
                    <button
                      onClick={() => downloadProposal(post)}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold transition-all border border-emerald-500/30"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                      Descargar Propuesta PDF
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3 pt-2 border-t border-emerald-500/10">
                    <div>
                      <span className="block text-[10px] text-emerald-500/60 uppercase font-mono">Enfermedad</span>
                      <span className="text-sm text-emerald-50 font-bold">{post.analisis.enfermedad}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-emerald-500/60 uppercase font-mono">Urgencia</span>
                      <span className="text-sm text-red-400 font-bold">{post.analisis.urgencia}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-emerald-500/60 uppercase font-mono">Recomendación Mkt</span>
                      <span className="text-sm text-[#4ade80] font-bold">{post.analisis.recomendacion}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 italic pt-1 font-serif">
                    &ldquo;{post.analisis.detalles}&rdquo;
                  </p>
                </div>
              )}

              {isAdmin && post.estado === 'PENDIENTE' && (
                <div className="mt-4 pt-4 border-t border-white/5 flex justify-end">
                  <Button 
                    onClick={() => handleAnalyze(post.id)}
                    disabled={analyzingId === post.id}
                    className="bg-white/5 hover:bg-[#4ade80]/10 text-[#4ade80] border border-[#4ade80]/20 transition-all text-xs h-8"
                  >
                    <BrainCircuit className="w-4 h-4 mr-2" />
                    {analyzingId === post.id ? 'Analizando...' : 'Aplicar IA y Recomendar'}
                  </Button>
                </div>
              )}
              
            </div>
          ))}

          {posts.length === 0 && (
            <div className="text-center py-16 text-slate-500 border border-dashed border-white/10 rounded-2xl">
              <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="font-serif text-lg text-white/50">Canal de difusión vacío</p>
              <p className="text-xs mt-1">Sé el primero en reportar una anomalía de tus parcelas.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
