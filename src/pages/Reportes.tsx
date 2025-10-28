import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { salesService } from '../services/salesService';
import type { Sale } from '../services/authService';

const Reportes: React.FC = () => {
  const { user } = useAuth();
  const companyName = user?.companyNombre || 'Sin empresa';
  const waMessage = encodeURIComponent(`Hola soporte, necesito ayuda con reportes en SIGEV-PYME. Empresa: ${companyName}.`);

  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [sales, setSales] = useState<Sale[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const data = await salesService.getAll();
        setSales(data || []);
      } catch (e: any) {
        setError(e?.message || 'No se pudieron cargar las ventas');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const filteredSales = useMemo(() => {
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;
    return (sales || []).filter((s) => {
      const d = new Date(s.fecha);
      if (from && d < from) return false;
      if (to) {
        const end = new Date(to);
        end.setHours(23, 59, 59, 999);
        if (d > end) return false;
      }
      return true;
    });
  }, [sales, fromDate, toDate]);

  const totalAmount = useMemo(() => {
    return filteredSales.reduce((acc, s) => acc + (s.total || 0), 0);
  }, [filteredSales]);

  const exportAsPDF = () => {
    const title = `Reporte de Ventas - ${companyName}`;
    const win = window.open('', '_blank');
    if (!win) return;
    const style = `
      <style>
        body { font-family: Arial, sans-serif; padding: 16px; }
        h2 { margin: 0 0 8px 0; }
        .subtitle { color: #444; margin: 0 0 16px 0; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #e5e7eb; padding: 8px; font-size: 12px; }
        th { background: #f5f5f5; text-align: left; }
        tfoot td { font-weight: 700; }
      </style>
    `;
    const rows = filteredSales.map((s) => {
      const fecha = new Date(s.fecha).toLocaleString();
      const cliente = s.clienteNombre || s.clienteDocumento || '-';
      const metodo = typeof s.metodoPago === 'number' ? s.metodoPago : (s as any).paymentMethod;
      return `<tr>
        <td>${s.id}</td>
        <td>${fecha}</td>
        <td>${cliente}</td>
        <td>${metodo ?? '-'}</td>
        <td style="text-align:right;">S/. ${(s.total || 0).toFixed(2)}</td>
      </tr>`;
    }).join('');
    const html = `
      <html>
      <head><meta charset="utf-8" />${style}<title>${title}</title></head>
      <body>
        <h2>${title}</h2>
        <div class="subtitle">Rango: ${fromDate || '—'} a ${toDate || '—'}</div>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Método</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
          <tfoot>
            <tr>
              <td colspan="4" style="text-align:right;">Total</td>
              <td style="text-align:right;">S/. ${totalAmount.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
        <script>window.print();</script>
      </body>
      </html>
    `;
    win.document.open();
    win.document.write(html);
    win.document.close();
  };

  return (
    <div className="reportes-container" style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 8 }}>Reportes</h2>
      <p style={{ color: '#555', marginTop: 0 }}>Genera y analiza reportes de tu empresa.</p>

      <div style={{ marginTop: 16, display: 'grid', gap: 16, gridTemplateColumns: '1fr' }}>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, background: '#fff' }}>
          <h3 style={{ marginTop: 0, marginBottom: 12 }}>Reporte de Ventas</h3>
          <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', marginBottom: 12 }}>
            <input placeholder="Desde" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
            <input placeholder="Hasta" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
            <button onClick={exportAsPDF} disabled={isLoading} style={{ padding: '8px 12px', borderRadius: 6, background: '#111827', color: '#fff', border: 'none' }}>Exportar PDF</button>
            <span style={{ color: '#555' }}>Total: S/. {totalAmount.toFixed(2)}</span>
          </div>
          {error && <div style={{ color: '#b91c1c', marginBottom: 8 }}>{error}</div>}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', border: '1px solid #e5e7eb', padding: 8, background: '#f5f5f5' }}>ID</th>
                  <th style={{ textAlign: 'left', border: '1px solid #e5e7eb', padding: 8, background: '#f5f5f5' }}>Fecha</th>
                  <th style={{ textAlign: 'left', border: '1px solid #e5e7eb', padding: 8, background: '#f5f5f5' }}>Cliente</th>
                  <th style={{ textAlign: 'left', border: '1px solid #e5e7eb', padding: 8, background: '#f5f5f5' }}>Método</th>
                  <th style={{ textAlign: 'right', border: '1px solid #e5e7eb', padding: 8, background: '#f5f5f5' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={5} style={{ padding: 12 }}>Cargando...</td></tr>
                ) : filteredSales.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: 12, color: '#555' }}>No hay ventas para el rango seleccionado.</td></tr>
                ) : (
                  filteredSales.map((s) => {
                    const fecha = new Date(s.fecha).toLocaleString();
                    const cliente = s.clienteNombre || s.clienteDocumento || '-';
                    const metodo = typeof s.metodoPago === 'number' ? s.metodoPago : (s as any).paymentMethod;
                    return (
                      <tr key={s.id}>
                        <td style={{ border: '1px solid #e5e7eb', padding: 8 }}>{s.id}</td>
                        <td style={{ border: '1px solid #e5e7eb', padding: 8 }}>{fecha}</td>
                        <td style={{ border: '1px solid #e5e7eb', padding: 8 }}>{cliente}</td>
                        <td style={{ border: '1px solid #e5e7eb', padding: 8 }}>{metodo ?? '-'}</td>
                        <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right' }}>S/. {(s.total || 0).toFixed(2)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, background: '#fff' }}>
          <h3 style={{ marginTop: 0, marginBottom: 12 }}>Soporte</h3>
          <p style={{ marginTop: 0, color: '#444' }}>¿Tienes dudas con tus reportes? Escríbenos por WhatsApp.</p>
          <a
            href={`https://wa.me/51951907810?text=${waMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              padding: '10px 14px',
              borderRadius: 8,
              background: '#25D366',
              color: '#fff',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            Escribir por WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
};

export default Reportes;


