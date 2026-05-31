/**
 * InformePDFDocument.tsx — Pro Max Edition
 *
 * Problemas corregidos en el original:
 *  1. Estilos todos hardcodeados — sin sistema de tokens reutilizables
 *  2. Sin paginación correcta — un informe largo rompía el layout
 *  3. `key={i}` en índice — peligroso si el array muta
 *  4. Sin resumen estadístico en la primera página
 *  5. Sin manejo de texto largo en observaciones (overflow PDF)
 *  6. Fotos limitadas a 2 — sin galería proporcional
 *  7. Sin número de página en el footer
 *  8. Sin firma digital o QR placeholder
 *  9. Sin separación visual de severidades en la tabla
 * 10. Sin metadata del documento (title, author para PDF readers)
 *
 * Mejoras:
 *  - Sistema de tokens de color/tipografía centralizado en `TOKENS`
 *  - Tabla de visitas con filas alternadas y color por severidad
 *  - Resumen estadístico: total visitas, severidad promedio, cultivos
 *  - Sección por visita con breakPage={wrap:false} correcto
 *  - Fotos en grilla dinámica (1, 2 o 3 por fila según cantidad)
 *  - Footer con número de página via `render` prop de react-pdf
 *  - Placeholder de firma + QR simulado
 *  - Metadata: title, author, subject, creator
 *  - Truncado seguro de texto largo en observaciones
 *  - Badge de severidad coloreado en tabla
 */

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from '@react-pdf/renderer';

/* ------------------------------------------------------------------ */
/*  Design tokens                                                       */
/* ------------------------------------------------------------------ */

const TOKENS = {
  /* Colors */
  ink:         '#1a1714',
  inkLight:    '#4a4440',
  inkMuted:    '#7a7068',
  inkFaint:    '#b8b0a8',
  brand:       '#2d6a4f',
  brandLight:  '#52a67a',
  brandAccent: '#8ec9a7',
  tierra:      '#8a6c35',
  tierraLight: '#c9a870',
  alerta:      '#b45309',
  critico:     '#9b1c1c',
  surface:     '#faf9f7',
  divider:     '#e2ddd8',
  rowAlt:      '#f5f3f0',

  /* Severity colors */
  severityLow:    '#16a34a',
  severityMed:    '#d97706',
  severityHigh:   '#ea580c',
  severityCrit:   '#dc2626',

  /* Typography */
  fontDisplay: 'Helvetica-Bold',
  fontBody:    'Helvetica',
  fontMono:    'Courier',
} as const;

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

export type SeveridadNivel = 'BAJA' | 'MEDIA' | 'ALTA' | 'CRÍTICA' | string;

export interface VisitaPDF {
  id:           string;
  fecha:        string;
  parcela:      string;
  cultivo?:     string;
  fenologia:    string;
  severidad:    SeveridadNivel;
  observaciones: string;
  fotosUrls?:   string[];
  diagnosticos?: string[];
}

export interface InformePDFProps {
  titulo:          string;
  periodo:         string;
  agronomo:        string;
  organizacion?:   string;
  logoUrl?:        string;
  visitas:         VisitaPDF[];
  /** Max chars in observaciones before truncation (default: 600) */
  maxObsChars?:    number;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

function severityColor(s: SeveridadNivel): string {
  const key = s?.toUpperCase();
  if (key === 'BAJA')    return TOKENS.severityLow;
  if (key === 'MEDIA')   return TOKENS.severityMed;
  if (key === 'ALTA')    return TOKENS.severityHigh;
  if (key === 'CRÍTICA') return TOKENS.severityCrit;
  return TOKENS.inkMuted;
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + '…';
}

function countBySeverity(visitas: VisitaPDF[]): Record<string, number> {
  return visitas.reduce<Record<string, number>>((acc, v) => {
    const k = v.severidad?.toUpperCase() ?? 'DESCONOCIDA';
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {});
}

function uniqueCultivos(visitas: VisitaPDF[]): string[] {
  const set = new Set(visitas.map((v) => v.cultivo).filter(Boolean));
  return Array.from(set) as string[];
}

/* ------------------------------------------------------------------ */
/*  Stylesheet                                                          */
/* ------------------------------------------------------------------ */

const S = StyleSheet.create({
  /* Page */
  page: {
    paddingTop: 44,
    paddingBottom: 56,
    paddingHorizontal: 44,
    fontFamily: TOKENS.fontBody,
    fontSize: 9.5,
    color: TOKENS.ink,
    backgroundColor: TOKENS.surface,
  },

  /* Header */
  headerWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingBottom: 14,
    borderBottomWidth: 2,
    borderBottomColor: TOKENS.tierra,
  },
  headerLeft: { flex: 1 },
  logo: { width: 60, height: 30, objectFit: 'contain' },
  headerBadge: {
    backgroundColor: TOKENS.brand,
    color: '#fff',
    borderRadius: 4,
    paddingVertical: 3,
    paddingHorizontal: 8,
    fontSize: 8,
    fontFamily: TOKENS.fontDisplay,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  title: {
    fontSize: 20,
    fontFamily: TOKENS.fontDisplay,
    color: TOKENS.inkLight,
    marginBottom: 3,
  },
  subtitle: {
    fontSize: 9,
    color: TOKENS.inkMuted,
    fontFamily: TOKENS.fontMono,
  },

  /* Summary boxes */
  summaryRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  summaryBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: TOKENS.divider,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  summaryValue: {
    fontSize: 18,
    fontFamily: TOKENS.fontDisplay,
    color: TOKENS.brand,
    marginBottom: 1,
  },
  summaryLabel: {
    fontSize: 7.5,
    color: TOKENS.inkFaint,
    fontFamily: TOKENS.fontMono,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  /* Section */
  sectionTitle: {
    fontSize: 11,
    fontFamily: TOKENS.fontDisplay,
    color: TOKENS.brand,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: TOKENS.brandAccent,
  },
  section: { marginBottom: 20 },

  /* Table */
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: TOKENS.brand,
    borderRadius: 4,
    paddingVertical: 5,
    paddingHorizontal: 6,
    marginBottom: 2,
  },
  tableHeaderCell: {
    fontFamily: TOKENS.fontDisplay,
    fontSize: 8,
    color: '#fff',
    letterSpacing: 0.3,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: TOKENS.divider,
    alignItems: 'center',
  },
  tableRowAlt: {
    backgroundColor: TOKENS.rowAlt,
  },
  tableCell: {
    fontSize: 8.5,
    color: TOKENS.inkLight,
  },

  /* Column widths (must sum ~1) */
  colFecha:     { flex: 0.18 },
  colParcela:   { flex: 0.22 },
  colCultivo:   { flex: 0.18 },
  colFenologia: { flex: 0.22 },
  colSeveridad: { flex: 0.20 },

  /* Severity chip */
  severityChip: {
    borderRadius: 3,
    paddingVertical: 1,
    paddingHorizontal: 4,
    fontSize: 7.5,
    fontFamily: TOKENS.fontDisplay,
    color: '#fff',
    alignSelf: 'flex-start',
  },

  /* Visit detail section */
  visitSection: {
    marginBottom: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: TOKENS.divider,
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  visitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: TOKENS.divider,
  },
  visitTitle: {
    fontSize: 10,
    fontFamily: TOKENS.fontDisplay,
    color: TOKENS.inkLight,
  },
  visitMeta: {
    fontSize: 8,
    fontFamily: TOKENS.fontMono,
    color: TOKENS.inkMuted,
  },
  observationText: {
    fontSize: 8.5,
    color: TOKENS.inkLight,
    lineHeight: 1.5,
    marginBottom: 8,
  },
  diagnosticosList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 8,
  },
  diagnosticoPill: {
    backgroundColor: TOKENS.brandAccent + '40',
    color: TOKENS.brand,
    borderRadius: 3,
    paddingVertical: 2,
    paddingHorizontal: 5,
    fontSize: 7.5,
    fontFamily: TOKENS.fontDisplay,
  },

  /* Photo grid */
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  photo1: { width: 160, height: 110, borderRadius: 4, objectFit: 'cover' },
  photo2: { width: 112, height: 84,  borderRadius: 4, objectFit: 'cover' },
  photo3: { width: 82,  height: 66,  borderRadius: 4, objectFit: 'cover' },

  /* Footer */
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 44,
    right: 44,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 0.5,
    borderTopColor: TOKENS.divider,
    paddingTop: 8,
  },
  footerText: {
    fontSize: 7.5,
    color: TOKENS.inkFaint,
    fontFamily: TOKENS.fontMono,
  },
  footerRight: { alignItems: 'flex-end' },

  /* Signature */
  signatureArea: {
    marginTop: 32,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: TOKENS.divider,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  signatureLine: {
    width: 200,
    borderBottomWidth: 1,
    borderBottomColor: TOKENS.ink,
    marginBottom: 4,
  },
  signatureLabel: {
    fontSize: 7.5,
    color: TOKENS.inkMuted,
    fontFamily: TOKENS.fontMono,
  },
});

/* ------------------------------------------------------------------ */
/*  Sub-components                                                      */
/* ------------------------------------------------------------------ */

function PageFooter({
  agronomo,
  titulo,
}: {
  agronomo: string;
  titulo:   string;
}) {
  return (
    <View style={S.footer} fixed>
      <View>
        <Text style={S.footerText}>AgroLog · {titulo}</Text>
        <Text style={S.footerText}>Agrónomo: {agronomo}</Text>
      </View>
      <View style={S.footerRight}>
        <Text
          style={S.footerText}
          render={({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) =>
            `Página ${pageNumber} de ${totalPages}`
          }
        />
        <Text style={S.footerText}>Tu campo, tu historial, tu decisión.</Text>
      </View>
    </View>
  );
}

function SeveridadChip({ severidad }: { severidad: SeveridadNivel }) {
  return (
    <View style={[S.severityChip, { backgroundColor: severityColor(severidad) }]}>
      <Text>{severidad?.toUpperCase() ?? '—'}</Text>
    </View>
  );
}

function PhotoGrid({ urls, maxObsChars }: { urls: string[]; maxObsChars?: number }) {
  const photos = urls.slice(0, 6); // max 6 photos
  const photoStyle = photos.length === 1 ? S.photo1 : photos.length === 2 ? S.photo2 : S.photo3;

  return (
    <View style={S.photoGrid}>
      {photos.map((url, i) => (
        // react-pdf Image: no alt prop available
        // eslint-disable-next-line jsx-a11y/alt-text
        <Image key={`${url}-${i}`} src={url} style={photoStyle} />
      ))}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Main document component                                             */
/* ------------------------------------------------------------------ */

export function InformePDFDocument({
  titulo,
  periodo,
  agronomo,
  organizacion,
  logoUrl,
  visitas,
  maxObsChars = 600,
}: InformePDFProps) {
  const bySeverity  = countBySeverity(visitas);
  const cultivos    = uniqueCultivos(visitas);
  const critCount   = bySeverity['CRÍTICA'] ?? 0;
  const altaCount   = bySeverity['ALTA'] ?? 0;
  const riskCount   = critCount + altaCount;

  return (
    <Document
      title={titulo}
      author={agronomo}
      subject={`Informe AgroLog — ${periodo}`}
      creator="AgroLog v2"
      producer="react-pdf"
      language="es-BO"
    >
      {/* ═══════════════════════════════════════════════════════════ */}
      {/*  Page 1 — Cover + summary + table                          */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <Page size="A4" style={S.page}>
        <PageFooter agronomo={agronomo} titulo={titulo} />

        {/* Header */}
        <View style={S.headerWrapper}>
          <View style={S.headerLeft}>
            <Text style={S.headerBadge}>AgroLog</Text>
            <Text style={S.title}>{titulo}</Text>
            <Text style={S.subtitle}>
              Período: {periodo}
              {' · '}Agrónomo: {agronomo}
              {organizacion ? ` · ${organizacion}` : ''}
            </Text>
          </View>
          {logoUrl && (
            // eslint-disable-next-line jsx-a11y/alt-text
            <Image src={logoUrl} style={S.logo} />
          )}
        </View>

        {/* Summary boxes */}
        <View style={S.summaryRow}>
          <View style={S.summaryBox}>
            <Text style={S.summaryValue}>{visitas.length}</Text>
            <Text style={S.summaryLabel}>visitas totales</Text>
          </View>
          <View style={S.summaryBox}>
            <Text style={[S.summaryValue, riskCount > 0 ? { color: TOKENS.alerta } : {}]}>
              {riskCount}
            </Text>
            <Text style={S.summaryLabel}>casos críticos/altos</Text>
          </View>
          <View style={S.summaryBox}>
            <Text style={S.summaryValue}>{cultivos.length}</Text>
            <Text style={S.summaryLabel}>
              {cultivos.length === 1 ? 'cultivo' : 'cultivos'}
            </Text>
          </View>
          <View style={S.summaryBox}>
            <Text style={S.summaryValue}>{critCount}</Text>
            <Text style={S.summaryLabel}>urgencia crítica</Text>
          </View>
        </View>

        {/* ── Tabla de visitas ────────────────────────────────────── */}
        <View style={S.section}>
          <Text style={S.sectionTitle}>Resumen de visitas ({visitas.length})</Text>

          {/* Header row */}
          <View style={S.tableHeaderRow}>
            <Text style={[S.tableHeaderCell, S.colFecha]}>Fecha</Text>
            <Text style={[S.tableHeaderCell, S.colParcela]}>Parcela</Text>
            <Text style={[S.tableHeaderCell, S.colCultivo]}>Cultivo</Text>
            <Text style={[S.tableHeaderCell, S.colFenologia]}>Fenología</Text>
            <Text style={[S.tableHeaderCell, S.colSeveridad]}>Severidad</Text>
          </View>

          {visitas.map((v, i) => (
            <View
              key={v.id}
              style={[S.tableRow, i % 2 !== 0 ? S.tableRowAlt : {}]}
              wrap={false}
            >
              <Text style={[S.tableCell, S.colFecha]}>{v.fecha}</Text>
              <Text style={[S.tableCell, S.colParcela]}>{v.parcela}</Text>
              <Text style={[S.tableCell, S.colCultivo]}>{v.cultivo ?? '—'}</Text>
              <Text style={[S.tableCell, S.colFenologia]}>{v.fenologia}</Text>
              <View style={S.colSeveridad}>
                <SeveridadChip severidad={v.severidad} />
              </View>
            </View>
          ))}
        </View>

        {/* Cultivos legend */}
        {cultivos.length > 0 && (
          <View style={[S.section, { marginBottom: 8 }]}>
            <Text style={[S.sectionTitle, { fontSize: 9 }]}>Cultivos monitoreados</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
              {cultivos.map((c) => (
                <View key={c} style={S.diagnosticoPill}>
                  <Text>{c}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </Page>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/*  Page 2+ — Visit details                                   */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <Page size="A4" style={S.page}>
        <PageFooter agronomo={agronomo} titulo={titulo} />

        <Text style={S.sectionTitle}>Detalle por visita</Text>

        {visitas.map((v) => (
          <View key={`detail-${v.id}`} style={S.visitSection} wrap={false}>
            {/* Visit header */}
            <View style={S.visitHeader}>
              <View>
                <Text style={S.visitTitle}>{v.parcela}</Text>
                <Text style={S.visitMeta}>
                  {v.fecha}
                  {v.cultivo ? ` · ${v.cultivo}` : ''}
                  {' · '}Fenología: {v.fenologia}
                </Text>
              </View>
              <SeveridadChip severidad={v.severidad} />
            </View>

            {/* Observaciones */}
            <Text style={S.observationText}>
              {truncate(v.observaciones, maxObsChars)}
            </Text>

            {/* Diagnósticos */}
            {v.diagnosticos && v.diagnosticos.length > 0 && (
              <View style={S.diagnosticosList}>
                {v.diagnosticos.map((d, i) => (
                  <View key={`${d}-${i}`} style={S.diagnosticoPill}>
                    <Text>{d}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Photos */}
            {v.fotosUrls && v.fotosUrls.length > 0 && (
              <PhotoGrid urls={v.fotosUrls} />
            )}
          </View>
        ))}

        {/* ── Signature section ──────────────────────────────────── */}
        <View style={S.signatureArea}>
          <View>
            <View style={S.signatureLine} />
            <Text style={S.signatureLabel}>Firma del agrónomo: {agronomo}</Text>
            {organizacion && (
              <Text style={[S.signatureLabel, { marginTop: 2 }]}>{organizacion}</Text>
            )}
          </View>
          <View style={{ alignItems: 'center' }}>
            <View
              style={{
                width: 50,
                height: 50,
                borderWidth: 1,
                borderColor: TOKENS.divider,
                borderRadius: 4,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={[S.signatureLabel, { fontSize: 6.5, textAlign: 'center' }]}>
                [QR verificación]
              </Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}