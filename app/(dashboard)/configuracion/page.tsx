import { auth } from '@/lib/auth';

export default async function ConfiguracionPage() {
  const session = await auth();

  return (
    <div className="max-w-xl space-y-6">
      <div data-gsap="stagger">
        <h1 className="font-serif text-2xl text-text-1">Configuración</h1>
        <p className="text-text-3 text-sm">Perfil y preferencias</p>
      </div>

      <div
        className="rounded-lg border border-border bg-surface p-6 space-y-4"
        data-gsap="stagger"
      >
        <div>
          <p className="text-xs text-text-3 uppercase tracking-wider">Nombre</p>
          <p className="font-medium text-text-1">{session?.user?.name}</p>
        </div>
        <div>
          <p className="text-xs text-text-3 uppercase tracking-wider">Email</p>
          <p className="font-mono text-sm text-text-2">{session?.user?.email}</p>
        </div>
        <div>
          <p className="text-xs text-text-3 uppercase tracking-wider">Rol</p>
          <p className="font-mono text-sm text-text-2">{session?.user?.role}</p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface p-6" data-gsap="stagger">
        <h2 className="font-serif text-lg mb-2">Modo offline</h2>
        <p className="text-sm text-text-2">
          Las visitas se guardan localmente cuando no hay conexión y se
          sincronizan automáticamente al reconectar.
        </p>
      </div>
    </div>
  );
}
