'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'es' | 'chq' | 'gn'; // es: Español, chq: Chiquitano (Bésiro), gn: Guaraní

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, section?: string) => string;
}

const translations: Record<Language, Record<string, Record<string, string>>> = {
  es: {
    sidebar: {
      flow: 'Flujo de trabajo',
      summary: 'Resumen',
      lotes: 'Lotes de Clientes',
      diagnostico: 'Diagnóstico IA',
      marketplace: 'Marketplace',
      informes: 'Informes PDF',
      model: 'Modelo de ingreso',
      commission: '3.5% por transacción',
      mediation: 'Mediación de insumos · SCZ'
    },
    header: {
      location: 'Santa Cruz · Bolivia',
      logout: 'Salir',
      role: 'Agrónomo'
    },
    dashboard: {
      welcome: 'Hola',
      subtitle: 'Monitoreo en tiempo real de parcelas y análisis fitosanitario en Santa Cruz.',
      sync: 'Última sincronización',
      alerts: 'Noxemo tapera · Alertas del campo',
      charts: 'Interactivos · Tendencias',
      activity: 'Nopeyatime · Actividad Reciente',
      map: 'Tapera Mapa · Ubicación de Lotes',
      totalLotes: 'Total Lotes',
      underCare: 'Bajo mi cuidado',
      diagnosticos: 'Diagnósticos',
      iaDetections: 'Detecciones IA',
      recentVisits: 'Visitas Recientes',
      totalVisits: 'Visitas Totales',
      alertsTitle: 'Alertas Activas',
      realtimeAlerts: 'Tiempo Real'
    },
    marketplace: {
      title: 'Marketplace de Insumos',
      subtitle: 'Insumos, servicios y tecnología de proveedores reales de Santa Cruz de la Sierra y el Norte Integrado.',
      potentialCommission: 'COMISIÓN POTENCIAL',
      searchPlaceholder: 'Buscar insumo, proveedor...',
      categoryAll: 'Todos',
      categoryFungicides: 'Fungicidas',
      categoryHerbicides: 'Herbicidas',
      categoryFertilizers: 'Fertilizantes',
      categoryDrones: 'Servicios Drone',
      categoryIot: 'Sensores IoT',
      stockAvailable: 'Stock: Alta disponibilidad',
      buyBtn: '1-Click Comprar',
      whatsappBtn: 'WhatsApp',
      earned: 'AgroLog gana'
    }
  },
  chq: {
    sidebar: {
      flow: 'Umoñuruma poño', // Flujo de trabajo
      summary: 'Nimopaite', // Resumen / Bienvenidos
      lotes: 'Nopeyapaite tapera', // Lotes de Clientes / Mis parcelas cuidadas
      diagnostico: 'Tachüünama IA', // Diagnóstico IA / Ver enfermedad
      marketplace: 'Penityaka', // Marketplace / Vender-Comprar
      informes: 'Anekana PDF', // Informes PDF / Papeles escritos
      model: 'Kixuruki mono', // Modelo de ingreso
      commission: '3.5% penityaka', // 3.5% por transacción
      mediation: 'Taperaimi nityakax · SCZ' // Mediación de insumos · SCZ
    },
    header: {
      location: 'Santa Cruz · Taperaimi',
      logout: 'Topoxó', // Salir
      role: 'Umoñurux' // Trabajador / Agrónomo
    },
    dashboard: {
      welcome: 'Nimopaite',
      subtitle: 'Añu taperaimi nityaka, auxilio fitosanitario ta Santa Cruz.', // Monitoreo en tiempo real de parcelas y análisis fitosanitario en Santa Cruz.
      sync: 'Yubiriki poño',
      alerts: 'Noxemo tapera · Alertas del campo',
      charts: 'Kiyeneño · Tendencias',
      activity: 'Nopeyatime · Actividad Reciente',
      map: 'Tapera Mapa · Lotes ubica',
      totalLotes: 'Tuboüx tapera',
      underCare: 'Nopeyapaite · Cuidados',
      diagnosticos: 'Tachüünama',
      iaDetections: 'Detecciones IA',
      recentVisits: 'Yubiriki poño',
      totalVisits: 'Tuboüx yubiriki',
      alertsTitle: 'Noxemo Activas',
      realtimeAlerts: 'Tapo poño'
    },
    marketplace: {
      title: 'Marketplace Penityaka',
      subtitle: 'Taperaimi insumos, servicios tyone ta Santa Cruz.',
      potentialCommission: 'COMMISION KIÑE',
      searchPlaceholder: 'Paata insumo, proveedor...',
      categoryAll: 'Paimax',
      categoryFungicides: 'Nenitix noxemo',
      categoryHerbicides: 'Nenitix yaka',
      categoryFertilizers: 'Yubiriki yitoñox',
      categoryDrones: 'Drones tech',
      categoryIot: 'Sensoring IoT',
      stockAvailable: 'Paimax stock',
      buyBtn: 'Penityaka 1-Click',
      whatsappBtn: 'WhatsApp',
      earned: 'AgroLog niyakama'
    }
  },
  gn: {
    sidebar: {
      flow: 'Mba\'apo rape', // Flujo de trabajo
      summary: 'Maitei', // Resumen / Hola
      lotes: 'Che Kokue Lote', // Lotes de Clientes / Mis parcelas
      diagnostico: 'Kuaapy IA', // Diagnóstico IA
      marketplace: 'Ñemuha guasu', // Marketplace / Gran Mercado
      informes: 'Kuatia PDF', // Informes PDF
      model: 'Viru Rape', // Modelo de ingreso
      commission: '3.5% ñemuhápe', // 3.5% por transacción
      mediation: 'Kokuerehegua · SCZ' // Mediación de insumos · SCZ
    },
    header: {
      location: 'Santa Cruz · Kokueyvy',
      logout: 'Sẽ', // Salir
      role: 'Kokue Mbo\'ehara' // Agrónomo / Maestro del campo
    },
    dashboard: {
      welcome: 'Maitei porã',
      subtitle: 'Kokue ñangareko hína ko yvy Santa Cruz-pe.', // Monitoreo en tiempo real de parcelas y análisis fitosanitario en Santa Cruz.
      sync: 'Mba\'epochy pyahu',
      alerts: 'Kokue Alertas · Techakuaa',
      charts: 'Ta\'anga techambyrapy',
      activity: 'Mba\'e porã pyahu',
      map: 'Kokue Kokuaa Mapa',
      totalLotes: 'Lotes Oĩva',
      underCare: 'Che Ñangarekope',
      diagnosticos: 'Techakuaa',
      iaDetections: 'IA Techakuaapy',
      recentVisits: 'Jejuhu Pyahu',
      totalVisits: 'Jejuhu Oĩva',
      alertsTitle: 'Kyhyjeha Oĩva',
      realtimeAlerts: 'Ko\'aiteguigua'
    },
    marketplace: {
      title: 'Mba\'erepy Ñemuha',
      subtitle: 'Insumo ha mba\'e pyahu kokue peguarã Santa Cruz-pe.',
      potentialCommission: 'VIRU OĨVA',
      searchPlaceholder: 'Heka insumo, proveedor...',
      categoryAll: 'Opavave',
      categoryFungicides: 'Ñanapohã fungicida',
      categoryHerbicides: 'Ñanapohã kokuerehegua',
      categoryFertilizers: 'Yvy Mombareteha',
      categoryDrones: 'Dron Mba\'epy',
      categoryIot: 'Sensores IoT',
      stockAvailable: 'Oĩmbáma ñemurã',
      buyBtn: 'Jogua Pya\'e',
      whatsappBtn: 'WhatsApp',
      earned: 'AgroLog ogana'
    }
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('es');

  // Load selected language from localStorage on client side
  useEffect(() => {
    const stored = localStorage.getItem('agrolog_lang') as Language;
    if (stored && (stored === 'es' || stored === 'chq' || stored === 'gn')) {
      setLanguageState(stored);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('agrolog_lang', lang);
  };

  const t = (key: string, section?: string): string => {
    try {
      if (section && translations[language]?.[section]?.[key]) {
        return translations[language][section][key];
      }
      // Fallback lookup or simple key return
      return key;
    } catch (e) {
      return key;
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
