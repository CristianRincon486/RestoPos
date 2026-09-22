// src/components/Inventario.jsx

import React, { useState } from 'react';

// ─── PROTEÍNAS INICIALES ─────────────────────────────────────────────────────
const PROTEINAS_INICIALES = [
  // Desayuno
  { id: 'p-carne-s',   name: 'Carne sudada',      categoria: 'Desayuno', porciones: 0, minimo: 3, unidad: 'porciones' },
  // Ejecutivo
  { id: 'p-churra',    name: 'Minichurrasco',      categoria: 'Ejecutivo', porciones: 0, minimo: 3, unidad: 'porciones' },
  { id: 'p-chuleta-e', name: 'Chuleta',            categoria: 'Ejecutivo', porciones: 0, minimo: 3, unidad: 'porciones' },
  { id: 'p-cachama',   name: 'Cachama',             categoria: 'Ejecutivo', porciones: 0, minimo: 3, unidad: 'porciones' },
  { id: 'p-cazuela',   name: 'Cazuela de mariscos', categoria: 'Ejecutivo', porciones: 0, minimo: 3, unidad: 'porciones' },
  // Intermedio
  { id: 'p-chuleta-i', name: 'Chuleta ejecutiva',  categoria: 'Intermedio', porciones: 0, minimo: 3, unidad: 'porciones' },
  { id: 'p-robalo',    name: 'Filete de robalo',    categoria: 'Intermedio', porciones: 0, minimo: 3, unidad: 'porciones' },
  // Corriente
  { id: 'p-pechuga',   name: 'Pechuga',             categoria: 'Corriente', porciones: 0, minimo: 3, unidad: 'porciones' },
  { id: 'p-lomo',      name: 'Lomo',                categoria: 'Corriente', porciones: 0, minimo: 3, unidad: 'porciones' },
  { id: 'p-higado',    name: 'Hígado',              categoria: 'Corriente', porciones: 0, minimo: 3, unidad: 'porciones' },
  { id: 'p-mojarra',   name: 'Mojarra',             categoria: 'Corriente', porciones: 0, minimo: 3, unidad: 'porciones' },
];

const CATEGORIAS = ['Desayuno', 'Ejecutivo', 'Intermedio', 'Corriente'];

const fmt = (n) => '$' + Math.round(n).toLocaleString('es-CO');

// ─── COMPONENTE ──────────────────────────────────────────────────────────────
function Inventario({ ventasDelDia = [] }) {

  const [proteinas, setProteinas]       = useState(PROTEINAS_INICIALES);
  const [modalApertura, setModalApertura] = useState(false);
  const [modalCierre, setModalCierre]   = useState(false);
  const [modalAgregar, setModalAgregar] = useState(false);
  const [aperturaTmp, setAperturaTmp]   = useState({});
  const [cierreData, setCierreData]     = useState(null);
  const [historial, setHistorial]       = useState([]);
  const [tabActivo, setTabActivo]       = useState('inventario');
  const [configurado, setConfigurado]   = useState(false);

  // Nuevo ítem
  const [nuevoItem, setNuevoItem] = useState({
    name: '', categoria: 'Corriente', porciones: 0, minimo: 3
  });

  // ─── ALERTAS ───────────────────────────────────────────────────────────
  const alertas = proteinas.filter(p =>
    p.porciones > 0 && p.porciones <= p.minimo
  );
  const agotados = proteinas.filter(p => configurado && p.porciones === 0);

  // ─── APERTURA DEL DÍA ──────────────────────────────────────────────────
  const abrirModalApertura = () => {
    const tmp = {};
    proteinas.forEach(p => { tmp[p.id] = p.porciones; });
    setAperturaTmp(tmp);
    setModalApertura(true);
  };

  const confirmarApertura = () => {
    setProteinas(prev => prev.map(p => ({
      ...p,
      porciones: parseInt(aperturaTmp[p.id]) || 0,
      porcionesInicio: parseInt(aperturaTmp[p.id]) || 0,
    })));
    setConfigurado(true);
    setModalApertura(false);
  };

  // ─── CIERRE DEL DÍA ────────────────────────────────────────────────────
  const generarCierre = () => {
    const resumen = proteinas
      .filter(p => p.porcionesInicio > 0)
      .map(p => ({
        ...p,
        vendidas: (p.porcionesInicio || 0) - p.porciones,
        restantes: p.porciones,
      }));

    const fechaHoy = new Date().toLocaleDateString('es-CO', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });

    const cierre = {
      fecha: fechaHoy,
      hora: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
      resumen,
      totalVendidas: resumen.reduce((s, p) => s + p.vendidas, 0),
    };

    setCierreData(cierre);
    setHistorial(prev => [cierre, ...prev]);
    setModalCierre(true);
  };

  // ─── DESCONTAR PORCIÓN (llamado desde Caja) ────────────────────────────
  const descontarPorcion = (proteinaId) => {
    setProteinas(prev => prev.map(p =>
      p.id === proteinaId && p.porciones > 0
        ? { ...p, porciones: p.porciones - 1 }
        : p
    ));
  };

  // ─── AJUSTE MANUAL ─────────────────────────────────────────────────────
  const ajustarPorciones = (id, valor) => {
    const num = parseInt(valor);
    if (isNaN(num) || num < 0) return;
    setProteinas(prev => prev.map(p => p.id === id ? { ...p, porciones: num } : p));
  };

  const ajustarMinimo = (id, valor) => {
    const num = parseInt(valor);
    if (isNaN(num) || num < 0) return;
    setProteinas(prev => prev.map(p => p.id === id ? { ...p, minimo: num } : p));
  };

  // ─── AGREGAR PROTEÍNA ──────────────────────────────────────────────────
  const agregarProteina = () => {
    if (!nuevoItem.name.trim()) return;
    setProteinas(prev => [...prev, {
      id: 'p-' + Date.now(),
      name: nuevoItem.name.trim(),
      categoria: nuevoItem.categoria,
      porciones: parseInt(nuevoItem.porciones) || 0,
      porcionesInicio: parseInt(nuevoItem.porciones) || 0,
      minimo: parseInt(nuevoItem.minimo) || 3,
      unidad: 'porciones',
    }]);
    setNuevoItem({ name: '', categoria: 'Corriente', porciones: 0, minimo: 3 });
    setModalAgregar(false);
  };

  // ─── ELIMINAR PROTEÍNA ─────────────────────────────────────────────────
  const eliminarProteina = (id) => {
    if (!window.confirm('¿Eliminar esta proteína del inventario?')) return;
    setProteinas(prev => prev.filter(p => p.id !== id));
  };

  // ─── COLOR STOCK ───────────────────────────────────────────────────────
  const colorStock = (p) => {
    if (!configurado || p.porciones === 0) return 'var(--red)';
    if (p.porciones <= p.minimo) return 'var(--amber)';
    return 'var(--green)';
  };

  const badgeStock = (p) => {
    if (!configurado) return <span className="badge badge-gray">Sin configurar</span>;
    if (p.porciones === 0) return <span className="badge badge-red">Agotado</span>;
    if (p.porciones <= p.minimo) return <span className="badge badge-amber">Stock bajo</span>;
    return <span className="badge badge-green">Disponible</span>;
  };

  // ─── RENDER INVENTARIO ─────────────────────────────────────────────────
  const renderInventario = () => (
    <div>

      {/* Alertas */}
      {agotados.length > 0 && (
        <div className="alert-row alert-red" style={{ marginBottom: '10px' }}>
          <div className="alert-dot alert-dot-red" />
          <span className="alert-text">
            <strong>Agotados:</strong> {agotados.map(p => p.name).join(', ')}
          </span>
        </div>
      )}
      {alertas.length > 0 && (
        <div className="alert-row alert-amber" style={{ marginBottom: '10px' }}>
          <div className="alert-dot alert-dot-amber" />
          <span className="alert-text">
            <strong>Stock bajo:</strong> {alertas.map(p => `${p.name} (${p.porciones} porciones)`).join(' · ')}
          </span>
        </div>
      )}

      {/* Métricas rápidas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: '10px', marginBottom: '16px' }}>
        <div className="metric-card">
          <div className="metric-label">Total proteínas</div>
          <div className="metric-value number">{proteinas.length}</div>
          <div className="metric-sub">en inventario</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Porciones totales</div>
          <div className="metric-value number" style={{ color: 'var(--blue)' }}>
            {proteinas.reduce((s, p) => s + p.porciones, 0)}
          </div>
          <div className="metric-sub">disponibles hoy</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Stock bajo</div>
          <div className="metric-value number" style={{ color: 'var(--amber)' }}>
            {alertas.length}
          </div>
          <div className="metric-sub">proteínas con alerta</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Agotadas</div>
          <div className="metric-value number" style={{ color: 'var(--red)' }}>
            {agotados.length}
          </div>
          <div className="metric-sub">sin porciones</div>
        </div>
      </div>

      {/* Tabla por categoría */}
      {CATEGORIAS.map(cat => {
        const items = proteinas.filter(p => p.categoria === cat);
        if (!items.length) return null;
        return (
          <div key={cat} className="card" style={{ marginBottom: '12px' }}>
            <div className="card-title-row">
              <span className="card-title">
                {cat === 'Desayuno' ? '🍳' : cat === 'Ejecutivo' ? '⭐' : cat === 'Intermedio' ? '🍽' : '🍛'} {cat}
              </span>
              <span className="badge badge-gray">
                {items.reduce((s, p) => s + p.porciones, 0)} porciones totales
              </span>
            </div>

            <table className="inv-table">
              <thead>
                <tr>
                  <th>Proteína</th>
                  <th>Porciones disponibles</th>
                  <th>Alerta mínimo</th>
                  <th>Vendidas hoy</th>
                  <th>Estado</th>
                  <th>Ajuste manual</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 500 }}>{p.name}</td>
                    <td>
                      <div style={{
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center', gap: '6px'
                      }}>
                        <span style={{
                          fontSize: '22px', fontWeight: 700,
                          color: colorStock(p), fontFamily: 'var(--fm)'
                        }}>
                          {p.porciones}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--text3)' }}>
                          {p.unidad}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        <input
                          type="number"
                          value={p.minimo}
                          onChange={e => ajustarMinimo(p.id, e.target.value)}
                          min="1"
                          style={{
                            width: '55px', padding: '4px 6px', textAlign: 'center',
                            border: '1px solid var(--border)', borderRadius: 'var(--r-sm)',
                            background: 'var(--surface2)', color: 'var(--amber)',
                            fontSize: '13px', fontFamily: 'var(--fm)'
                          }}
                        />
                        <span style={{ fontSize: '10px', color: 'var(--text3)' }}>porc.</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center', fontFamily: 'var(--fm)', color: 'var(--accent)', fontWeight: 600 }}>
                      {(p.porcionesInicio || 0) - p.porciones}
                    </td>
                    <td style={{ textAlign: 'center' }}>{badgeStock(p)}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        <button className="qty-btn"
                          onClick={() => ajustarPorciones(p.id, p.porciones - 1)}
                          disabled={p.porciones <= 0}>−</button>
                        <input
                          type="number"
                          value={p.porciones}
                          onChange={e => ajustarPorciones(p.id, e.target.value)}
                          min="0"
                          style={{
                            width: '55px', padding: '4px 6px', textAlign: 'center',
                            border: '1px solid var(--border)', borderRadius: 'var(--r-sm)',
                            background: 'var(--surface2)', color: colorStock(p),
                            fontSize: '13px', fontFamily: 'var(--fm)', fontWeight: 700,
                          }}
                        />
                        <button className="qty-btn"
                          onClick={() => ajustarPorciones(p.id, p.porciones + 1)}>+</button>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button className="btn btn-danger btn-sm"
                        onClick={() => eliminarProteina(p.id)}>✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );

  // ─── RENDER HISTORIAL ──────────────────────────────────────────────────
  const renderHistorial = () => (
    <div>
      {historial.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>📦</div>
          <div style={{ fontSize: '15px', fontWeight: 500, marginBottom: '6px' }}>Sin cierres registrados</div>
          <div style={{ fontSize: '12px', color: 'var(--text3)' }}>
            Los cierres del día aparecerán aquí
          </div>
        </div>
      ) : (
        historial.map((c, i) => (
          <div key={i} className="card" style={{ marginBottom: '12px' }}>
            <div className="card-title-row">
              <span className="card-title">📦 Cierre del {c.fecha}</span>
              <span className="badge badge-blue">{c.hora}</span>
            </div>
            <div className="item-row">
              <span className="item-row-label">Total porciones vendidas</span>
              <span className="item-row-val number" style={{ color: 'var(--accent)', fontSize: '16px', fontWeight: 700 }}>
                {c.totalVendidas}
              </span>
            </div>
            <table className="inv-table" style={{ marginTop: '10px' }}>
              <thead>
                <tr>
                  <th>Proteína</th>
                  <th>Categoría</th>
                  <th>Inicio del día</th>
                  <th>Vendidas</th>
                  <th>Restantes</th>
                </tr>
              </thead>
              <tbody>
                {c.resumen.map((p, j) => (
                  <tr key={j}>
                    <td style={{ fontWeight: 500 }}>{p.name}</td>
                    <td><span className="badge badge-gray">{p.categoria}</span></td>
                    <td style={{ textAlign: 'center', fontFamily: 'var(--fm)' }}>{p.porcionesInicio}</td>
                    <td style={{ textAlign: 'center', fontFamily: 'var(--fm)', color: 'var(--accent)', fontWeight: 600 }}>
                      {p.vendidas}
                    </td>
                    <td style={{ textAlign: 'center', fontFamily: 'var(--fm)', color: p.restantes === 0 ? 'var(--red)' : 'var(--green)', fontWeight: 600 }}>
                      {p.restantes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );

  // ─── RETURN PRINCIPAL ──────────────────────────────────────────────────
  return (
    <div className="main active fade-in" id="tab-inventario">

      {/* Barra superior */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div style={{ fontSize: '16px', fontWeight: 600 }}>Inventario de proteínas</div>

        {/* Tabs internos */}
        <div className="tabs" style={{  marginLeft: '5px', display: 'flex', gap: '8px', flexWrap: 'wrap'  }}>
          <button className="btn btn-sm"
            onClick={() => setTabActivo('inventario')}>
            📦 Inventario
          </button>
        </div>
        <div className="tabs" style={{  marginLeft: '3px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button className="btn btn-sm"
            onClick={() => setTabActivo('historial')}>
            📊 Historial cierres
          </button>
        </div>

        {/* Acciones */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button className="btn btn-sm" onClick={() => setModalAgregar(true)}>
            + Agregar proteína
          </button>
          <button className="btn btn-accent btn-sm" onClick={abrirModalApertura}>
            🌅 Apertura del día
          </button>
          {configurado && (
            <button className="btn btn-sm" style={{ background: 'var(--blue-bg)', color: 'var(--blue)', border: '1px solid var(--blue)' }}
              onClick={generarCierre}>
              🌙 Cierre del día
            </button>
          )}
        </div>
      </div>

      {!configurado && (
        <div className="alert-row alert-blue" style={{ marginBottom: '14px' }}>
          <div className="alert-dot alert-dot-blue" />
          <span className="alert-text">
            Presiona <strong>"Apertura del día"</strong> para ingresar las porciones disponibles de hoy antes de empezar a vender.
          </span>
        </div>
      )}

      {tabActivo === 'inventario' && renderInventario()}
      {tabActivo === 'historial'  && renderHistorial()}

      {/* ── MODAL APERTURA ── */}
      {modalApertura && (
        <div className="modal-overlay open">
          <div className="modal-box wide">
            <div className="modal-title">🌅 Apertura del día</div>
            <div className="modal-sub">
              Ingresa cuántas porciones hay de cada proteína al comenzar el día
            </div>

            {CATEGORIAS.map(cat => {
              const items = proteinas.filter(p => p.categoria === cat);
              if (!items.length) return null;
              return (
                <div key={cat} style={{ marginBottom: '16px' }}>
                  <div className="section-label">{cat}</div>
                  {items.map(p => (
                    <div key={p.id} style={{
                      display: 'flex', alignItems: 'center',
                      gap: '10px', marginBottom: '8px'
                    }}>
                      <span style={{ flex: 1, fontSize: '13px', fontWeight: 500 }}>{p.name}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button className="qty-btn"
                          onClick={() => setAperturaTmp(prev => ({
                            ...prev, [p.id]: Math.max(0, (parseInt(prev[p.id]) || 0) - 1)
                          }))}>−</button>
                        <input
                          type="number"
                          value={aperturaTmp[p.id] || 0}
                          onChange={e => setAperturaTmp(prev => ({ ...prev, [p.id]: e.target.value }))}
                          min="0"
                          style={{
                            width: '70px', padding: '6px 8px', textAlign: 'center',
                            border: '1px solid var(--border)', borderRadius: 'var(--r-sm)',
                            background: 'var(--surface2)', color: 'var(--text)',
                            fontSize: '16px', fontFamily: 'var(--fm)', fontWeight: 700,
                          }}
                        />
                        <button className="qty-btn"
                          onClick={() => setAperturaTmp(prev => ({
                            ...prev, [p.id]: (parseInt(prev[p.id]) || 0) + 1
                          }))}>+</button>
                        <span style={{ fontSize: '11px', color: 'var(--text3)', minWidth: '50px' }}>porciones</span>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}

            <div style={{
              background: 'var(--blue-bg)', borderRadius: 'var(--r-sm)',
              padding: '10px 14px', marginBottom: '14px'
            }}>
              <span style={{ fontSize: '12px', color: 'var(--blue)' }}>
                Total porciones del día:{' '}
                <strong>
                  {Object.values(aperturaTmp).reduce((s, v) => s + (parseInt(v) || 0), 0)}
                </strong>
              </span>
            </div>

            <div className="modal-footer">
              <button className="btn" onClick={() => setModalApertura(false)}>Cancelar</button>
              <button className="btn btn-accent" onClick={confirmarApertura}>
                Confirmar apertura
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL CIERRE ── */}
      {modalCierre && cierreData && (
        <div className="modal-overlay open">
          <div className="modal-box wide">
            <div className="modal-title">🌙 Cierre del día — Inventario</div>
            <div className="modal-sub">{cierreData.fecha} · {cierreData.hora}</div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', marginBottom: '16px' }}>
              <div className="cierre-total-box">
                <div className="cierre-total-label">Total vendidas</div>
                <div className="cierre-total-val number" style={{ color: 'var(--accent)' }}>
                  {cierreData.totalVendidas}
                </div>
              </div>
              <div className="cierre-total-box">
                <div className="cierre-total-label">Proteínas agotadas</div>
                <div className="cierre-total-val number" style={{ color: 'var(--red)' }}>
                  {cierreData.resumen.filter(p => p.restantes === 0).length}
                </div>
              </div>
              <div className="cierre-total-box">
                <div className="cierre-total-label">Con sobrante</div>
                <div className="cierre-total-val number" style={{ color: 'var(--green)' }}>
                  {cierreData.resumen.filter(p => p.restantes > 0).length}
                </div>
              </div>
            </div>

            <table className="inv-table">
              <thead>
                <tr>
                  <th>Proteína</th>
                  <th>Categoría</th>
                  <th>Inicio</th>
                  <th>Vendidas</th>
                  <th>Restantes</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {cierreData.resumen.map((p, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 500 }}>{p.name}</td>
                    <td><span className="badge badge-gray">{p.categoria}</span></td>
                    <td style={{ textAlign: 'center', fontFamily: 'var(--fm)' }}>
                      {p.porcionesInicio}
                    </td>
                    <td style={{ textAlign: 'center', fontFamily: 'var(--fm)', color: 'var(--accent)', fontWeight: 700 }}>
                      {p.vendidas}
                    </td>
                    <td style={{ textAlign: 'center', fontFamily: 'var(--fm)', fontWeight: 700,
                      color: p.restantes === 0 ? 'var(--red)' : 'var(--green)' }}>
                      {p.restantes}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {p.restantes === 0
                        ? <span className="badge badge-red">Agotado</span>
                        : p.restantes <= p.minimo
                          ? <span className="badge badge-amber">Stock bajo</span>
                          : <span className="badge badge-green">OK</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="modal-footer">
              <button className="btn btn-accent" onClick={() => setModalCierre(false)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL AGREGAR PROTEÍNA ── */}
      {modalAgregar && (
        <div className="modal-overlay open">
          <div className="modal-box">
            <div className="modal-title">Agregar proteína</div>
            <div className="modal-sub">La proteína quedará disponible en el inventario y en la caja</div>

            <div className="form-group" style={{ marginBottom: '10px' }}>
              <div className="form-label">Nombre</div>
              <input type="text" className="input-field"
                placeholder="Ej: Trucha"
                value={nuevoItem.name}
                onChange={e => setNuevoItem(prev => ({ ...prev, name: e.target.value }))} />
            </div>
            <div className="form-group" style={{ marginBottom: '10px' }}>
              <div className="form-label">Categoría</div>
              <select className="input-field" value={nuevoItem.categoria}
                onChange={e => setNuevoItem(prev => ({ ...prev, categoria: e.target.value }))}>
                {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: '10px' }}>
              <div className="form-label">Porciones iniciales</div>
              <input type="number" className="input-field" min="0"
                value={nuevoItem.porciones}
                onChange={e => setNuevoItem(prev => ({ ...prev, porciones: e.target.value }))} />
            </div>
            <div className="form-group" style={{ marginBottom: '14px' }}>
              <div className="form-label">Alerta cuando queden menos de (porciones)</div>
              <input type="number" className="input-field" min="1"
                value={nuevoItem.minimo}
                onChange={e => setNuevoItem(prev => ({ ...prev, minimo: e.target.value }))} />
            </div>

            <div className="modal-footer">
              <button className="btn" onClick={() => setModalAgregar(false)}>Cancelar</button>
              <button className="btn btn-accent" onClick={agregarProteina}
                disabled={!nuevoItem.name.trim()}>
                Agregar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Inventario;