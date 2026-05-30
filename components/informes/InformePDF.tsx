import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1a1714',
  },
  header: {
    marginBottom: 20,
    borderBottom: '2pt solid #8a6c35',
    paddingBottom: 10,
  },
  title: {
    fontSize: 22,
    color: '#4a3a1a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 11,
    color: '#5a5448',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#1f5c1f',
    marginBottom: 8,
    fontFamily: 'Helvetica-Bold',
  },
  row: {
    flexDirection: 'row',
    borderBottom: '0.5pt solid #d4cfc4',
    paddingVertical: 6,
  },
  cell: {
    flex: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTop: '1pt solid #d4cfc4',
    paddingTop: 10,
    fontSize: 9,
    color: '#8a8278',
  },
  photo: {
    width: 120,
    height: 90,
    marginRight: 8,
    marginBottom: 8,
  },
});

interface InformePDFProps {
  titulo: string;
  periodo: string;
  agronomo: string;
  organizacion?: string;
  visitas: {
    fecha: string;
    parcela: string;
    fenologia: string;
    severidad: string;
    observaciones: string;
    fotosUrls?: string[];
  }[];
}

export function InformePDFDocument({
  titulo,
  periodo,
  agronomo,
  organizacion,
  visitas,
}: InformePDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>AgroLog — {titulo}</Text>
          <Text style={styles.subtitle}>
            Período: {periodo} · Agrónomo: {agronomo}
            {organizacion ? ` · ${organizacion}` : ''}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen de visitas ({visitas.length})</Text>
          <View style={[styles.row, { fontFamily: 'Helvetica-Bold' }]}>
            <Text style={styles.cell}>Fecha</Text>
            <Text style={styles.cell}>Parcela</Text>
            <Text style={styles.cell}>Fenología</Text>
            <Text style={styles.cell}>Severidad</Text>
          </View>
          {visitas.map((v, i) => (
            <View key={i} style={styles.row}>
              <Text style={styles.cell}>{v.fecha}</Text>
              <Text style={styles.cell}>{v.parcela}</Text>
              <Text style={styles.cell}>{v.fenologia}</Text>
              <Text style={styles.cell}>{v.severidad}</Text>
            </View>
          ))}
        </View>

        {visitas.map((v, i) => (
          <View key={`detail-${i}`} style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>{v.parcela} — {v.fecha}</Text>
            <Text>{v.observaciones}</Text>
            {v.fotosUrls && v.fotosUrls.length > 0 && (
              <View style={{ flexDirection: 'row', marginTop: 8 }}>
                {v.fotosUrls.slice(0, 2).map((url, j) => (
                  <Image key={j} src={url} style={styles.photo} />
                ))}
              </View>
            )}
          </View>
        ))}

        <View style={styles.footer}>
          <Text>Generado con AgroLog · Tu campo, tu historial, tu decisión.</Text>
          <Text>Firma del agrónomo: _________________________</Text>
        </View>
      </Page>
    </Document>
  );
}
