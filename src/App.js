// src/App.js

import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Topbar from "./components/Topbar";
import Dashboard from "./components/Dashboard";
import Caja from "./components/Caja";
import Saneamiento from "./components/Saneamiento";
import Inventario from "./components/Inventario";
import "./App.css";

function POS() {
  const [activeTab, setActiveTab]         = useState("dashboard");
  const [sanFirmadoHoy, setSanFirmadoHoy] = useState(false);
  const [totalVentas, setTotalVentas]     = useState(0);
  const [pedidosCount, setPedidosCount]   = useState(0);
  const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark");
  const [clock, setClock]             = useState("--:--:--");
  const [dateDisplay, setDateDisplay] = useState("");

  // ─── GASTOS ──────────────────────────────────────────────────────────────
  const [gastos, setGastos] = useState([
    { id: 1, desc: "Insumos base del día", cat: "Insumos", val: 94500 },
    { id: 2, desc: "Nómina empleados",     cat: "Nómina",  val: 48000 },
  ]);
  const [gastoIdSeq, setGastoIdSeq] = useState(3);
  const [panelGastos, setPanelGastos] = useState(false);
  const [gDesc, setGDesc] = useState("");
  const [gCat, setGCat]   = useState("Insumos");
  const [gVal, setGVal]   = useState("");

  // ─── CIERRE ──────────────────────────────────────────────────────────────
  const [modalCierre, setModalCierre] = useState(false);

  // ─── CONTROL DE EFECTIVO ─────────────────────────────────────────────────
  const [efectivoRecibido, setEfectivoRecibido]   = useState(0);
  const [cambioEntregado, setCambioEntregado]     = useState(0);
  const [transferenciaTotal, setTransferenciaTotal] = useState(0);
  const [tarjetaTotal, setTarjetaTotal]           = useState(0);

  // ─── COBRO ───────────────────────────────────────────────────────────────
  const handleCobro = (datos) => {
    setTotalVentas(prev => prev + datos.monto);
    setPedidosCount(prev => prev + 1);

    if (datos.tipoPago === "efectivo") {
      setEfectivoRecibido(prev => prev + datos.pagoRecibido);
      setCambioEntregado(prev => prev + datos.cambioEntregado);
    } else if (datos.tipoPago === "transferencia") {
      setTransferenciaTotal(prev => prev + datos.monto);
    } else if (datos.tipoPago === "tarjeta") {
      setTarjetaTotal(prev => prev + datos.monto);
    }
  };

  // ─── GASTOS FUNCIONES ────────────────────────────────────────────────────
  const abrirGastos  = () => setPanelGastos(true);
  const cerrarGastos = () => {
    setPanelGastos(false);
    setGDesc(""); setGVal(""); setGCat("Insumos");
  };

  const agregarGasto = () => {
    if (!gDesc.trim() || !gVal || parseFloat(gVal) <= 0) return;
    setGastos(prev => [...prev, {
      id: gastoIdSeq,
      desc: gDesc.trim(),
      cat: gCat,
      val: parseFloat(gVal),
    }]);
    setGastoIdSeq(prev => prev + 1);
    setGDesc(""); setGVal("");
  };

  const eliminarGasto = (id) => {
    setGastos(prev => prev.filter(g => g.id !== id));
  };

  // ─── CIERRE FUNCIONES ────────────────────────────────────────────────────
  const abrirCierre  = () => setModalCierre(true);
  const cerrarCierre = () => setModalCierre(false);

  const totalGastos = gastos.reduce((s, g) => s + g.val, 0);
  const utilidad    = totalVentas - totalGastos;
  const margen      = totalVentas > 0 ? Math.round((utilidad / totalVentas) * 100) : 0;
  const fmt = (n) => "$" + Math.round(n).toLocaleString("es-CO");

  // ─── RELOJ ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setClock(now.toLocaleTimeString("es-CO", {
        hour: "2-digit", minute: "2-digit", second: "2-digit",
      }));
      setDateDisplay(now.toLocaleDateString("es-CO", {
        weekday: "short", day: "numeric", month: "short",
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // ─── MODO NOCHE ──────────────────────────────────────────────────────────
  useEffect(() => {
    document.body.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  // ─── RENDER ──────────────────────────────────────────────────────────────
  return (
    <div className="app">
      <Topbar
        activeTab={activeTab}
        setTab={setActiveTab}
        toggleTheme={() => setDark(!dark)}
        toggleAlertas={() => {}}
        dark={dark}
        clock={clock}
        dateDisplay={dateDisplay}
      />

      {activeTab === "dashboard" && (
        <Dashboard
          totalVentas={totalVentas}
          pedidosCount={pedidosCount}
          gastos={gastos}
          abrirGastos={abrirGastos}
          abrirCierre={abrirCierre}
          dark={dark}
          efectivoRecibido={efectivoRecibido}
          cambioEntregado={cambioEntregado}
          transferenciaTotal={transferenciaTotal}
          tarjetaTotal={tarjetaTotal}
        />
      )}

      {activeTab === "caja" && (
        <Caja onCobro={handleCobro} />
      )}

      {activeTab === "saneamiento" && (
        <Saneamiento
          onSanFirmado={(pct) => setSanFirmadoHoy(true)}
        />
      )}

      {activeTab === "inventario" && (
        <Inventario ventasDelDia={[]} />
      )}

      {/* ══════════════════════════════════════════
          PANEL LATERAL — GASTOS
      ══════════════════════════════════════════ */}
      {panelGastos && (
        <div
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 200,
            display: "flex",
            justifyContent: "flex-end",
          }}
          onClick={(e) => { if (e.target === e.currentTarget) cerrarGastos(); }}
        >
          <div style={{
            background: "var(--surface)",
            width: "420px",
            height: "100vh",
            overflowY: "auto",
            padding: "24px",
            borderLeft: "1px solid var(--border)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
              <div>
                <div style={{ fontSize: "16px", fontWeight: 600 }}>Gestión de gastos</div>
                <div style={{ fontSize: "11px", color: "var(--text3)", marginTop: "2px" }}>
                  Registra gastos fijos, imprevistos y extras del día
                </div>
              </div>
              <button className="btn btn-sm" onClick={cerrarGastos}>✕</button>
            </div>

            <hr className="divider" style={{ margin: "14px 0" }} />

            {/* Lista de gastos */}
            {gastos.map(g => (
              <div key={g.id} style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "8px 10px",
                background: "var(--surface2)",
                borderRadius: "var(--r-sm)",
                marginBottom: "6px",
              }}>
                <span style={{ flex: 1, fontSize: "12px" }}>{g.desc}</span>
                <span className="badge badge-amber">{g.cat}</span>
                <span style={{
                  fontSize: "13px", fontWeight: 600,
                  color: "var(--red)", minWidth: "80px",
                  textAlign: "right", fontFamily: "var(--fm)"
                }}>
                  {fmt(g.val)}
                </span>
                <button
                  className="btn btn-sm"
                  style={{ color: "var(--red)", padding: "2px 8px" }}
                  onClick={() => eliminarGasto(g.id)}
                >✕</button>
              </div>
            ))}

            {/* Formulario agregar */}
            <div style={{
              background: "var(--surface2)",
              borderRadius: "var(--r-md)",
              padding: "14px",
              marginTop: "8px",
              border: "1px dashed var(--border2)",
            }}>
              <div style={{ fontSize: "12px", fontWeight: 500, marginBottom: "10px" }}>
                Agregar nuevo gasto
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Descripción (ej: Gas extra, insumo urgente...)"
                  value={gDesc}
                  onChange={e => setGDesc(e.target.value)}
                />
                <select
                  className="input-field"
                  value={gCat}
                  onChange={e => setGCat(e.target.value)}
                >
                  <option>Insumos</option>
                  <option>Nómina</option>
                  <option>Imprevisto</option>
                  <option>Servicios</option>
                  <option>Mantenimiento</option>
                  <option>Otro</option>
                </select>
                <input
                  type="number"
                  className="input-field"
                  placeholder="Valor en pesos (COP)"
                  value={gVal}
                  min="0"
                  onChange={e => setGVal(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && agregarGasto()}
                />
                <button className="btn btn-accent btn-full" onClick={agregarGasto}>
                  + Agregar gasto
                </button>
              </div>
            </div>

            {/* Total gastos */}
            <div style={{
              background: "var(--red-bg)",
              borderRadius: "var(--r-sm)",
              padding: "12px 14px",
              marginTop: "12px",
            }}>
              <div style={{ fontSize: "11px", color: "var(--red)", marginBottom: "2px" }}>
                Total gastos del día
              </div>
              <div style={{ fontSize: "22px", fontWeight: 700, color: "var(--red)", fontFamily: "var(--fm)" }}>
                {fmt(totalGastos)}
              </div>
            </div>

            <button className="btn btn-full" style={{ marginTop: "10px" }} onClick={cerrarGastos}>
              Cerrar y guardar
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          MODAL — CIERRE DE CAJA
      ══════════════════════════════════════════ */}
      {modalCierre && (
        <div style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.5)",
          zIndex: 200,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}>
          <div style={{
            background: "var(--surface)",
            borderRadius: "var(--r-xl)",
            border: "1px solid var(--border)",
            width: "100%",
            maxWidth: "640px",
            maxHeight: "90vh",
            overflowY: "auto",
          }}>
            {/* Header */}
            <div style={{
              background: "var(--accent)",
              color: "white",
              padding: "16px 20px",
              borderRadius: "var(--r-xl) var(--r-xl) 0 0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
              <div>
                <div style={{ fontSize: "16px", fontWeight: 600 }}>Cierre de caja</div>
                <div style={{ fontSize: "12px", opacity: 0.8, fontFamily: "var(--fm)" }}>
                  {new Date().toLocaleDateString("es-CO", {
                    weekday: "long", day: "numeric",
                    month: "long", year: "numeric"
                  })}
                </div>
              </div>
              <button
                onClick={cerrarCierre}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  border: "none", color: "white",
                  borderRadius: "var(--r-sm)",
                  padding: "5px 10px", cursor: "pointer"
                }}
              >✕ Cerrar</button>
            </div>

            {/* Cuerpo */}
            <div style={{ padding: "20px" }}>

              {/* Totales principales */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px", marginBottom: "18px" }}>
                {[
                  { label: "Ingresos brutos", val: totalVentas, color: "var(--green)" },
                  { label: "Total gastos",    val: totalGastos, color: "var(--red)"   },
                  { label: "Utilidad neta",   val: utilidad,    color: utilidad >= 0 ? "var(--amber)" : "var(--red)" },
                ].map((t, i) => (
                  <div key={i} style={{ background: "var(--surface2)", borderRadius: "var(--r-md)", padding: "14px" }}>
                    <div style={{ fontSize: "11px", color: "var(--text3)", marginBottom: "5px" }}>{t.label}</div>
                    <div style={{ fontSize: "20px", fontWeight: 600, color: t.color, fontFamily: "var(--fm)" }}>
                      {fmt(t.val)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Control de efectivo */}
              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "12px", fontWeight: 500, marginBottom: "8px" }}>
                  Control de efectivo en caja
                </div>
                <div className="item-row">
                  <span className="item-row-label">Billetes recibidos</span>
                  <span className="item-row-val number" style={{ color: "var(--blue)" }}>
                    {fmt(efectivoRecibido)}
                  </span>
                </div>
                <div className="item-row">
                  <span className="item-row-label">Cambio entregado</span>
                  <span className="item-row-val number" style={{ color: "var(--red)" }}>
                    -{fmt(cambioEntregado)}
                  </span>
                </div>
                <div className="item-row" style={{ background: "var(--green-bg)" }}>
                  <span className="item-row-label" style={{ fontWeight: 600 }}>
                    Efectivo neto en caja
                  </span>
                  <span className="item-row-val number" style={{ color: "var(--green)", fontWeight: 700, fontSize: "15px" }}>
                    {fmt(efectivoRecibido - cambioEntregado)}
                  </span>
                </div>
                <hr className="divider" style={{ margin: "8px 0" }} />
                <div className="item-row">
                  <span className="item-row-label">Transferencias</span>
                  <span className="item-row-val number">{fmt(transferenciaTotal)}</span>
                </div>
                <div className="item-row">
                  <span className="item-row-label">Tarjeta</span>
                  <span className="item-row-val number">{fmt(tarjetaTotal)}</span>
                </div>
              </div>

              {/* Desglose gastos */}
              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "12px", fontWeight: 500, marginBottom: "8px" }}>
                  Desglose de gastos
                </div>
                {gastos.map(g => (
                  <div key={g.id} className="item-row">
                    <span className="item-row-label">{g.desc}</span>
                    <span className="item-row-val number" style={{ color: "var(--red)" }}>
                      -{fmt(g.val)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Resumen ventas */}
              <div style={{ marginBottom: "18px" }}>
                <div style={{ fontSize: "12px", fontWeight: 500, marginBottom: "8px" }}>
                  Resumen de ventas
                </div>
                <div className="item-row">
                  <span className="item-row-label">Total pedidos</span>
                  <span className="item-row-val number" style={{ color: "var(--blue)" }}>
                    {pedidosCount}
                  </span>
                </div>
                <div className="item-row">
                  <span className="item-row-label">Ticket promedio</span>
                  <span className="item-row-val number">
                    {pedidosCount > 0 ? fmt(totalVentas / pedidosCount) : "$0"}
                  </span>
                </div>
                <div className="item-row">
                  <span className="item-row-label">Margen de utilidad</span>
                  <span className="item-row-val number" style={{ color: "var(--amber)" }}>
                    {margen}%
                  </span>
                </div>
              </div>

              {/* Botones */}
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  className="btn btn-accent btn-full btn-lg"
                  onClick={() => {
                    alert("Cierre guardado correctamente.\n\nLos datos han sido almacenados.");
                    cerrarCierre();
                  }}
                >
                  Confirmar y guardar cierre
                </button>
                <button className="btn btn-full" onClick={() => window.print()}>
                  🖨 Imprimir
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ─── APP PRINCIPAL CON ROUTER ─────────────────────────────────────────────────
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"     element={<POS />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;