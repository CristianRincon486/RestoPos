// src/components/Dashboard.jsx

import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

function Dashboard({
  totalVentas,
  pedidosCount,
  gastos,
  abrirGastos,
  abrirCierre,
  dark,
  efectivoRecibido = 0,
  cambioEntregado = 0,
  transferenciaTotal = 0,
  tarjetaTotal = 0,
}) {
  const chartHorasRef       = useRef(null);
  const chartSemanalRef     = useRef(null);
  const chartHorasInstance  = useRef(null);
  const chartSemanalInstance= useRef(null);

  const fmt = (n) => "$" + Math.round(n).toLocaleString("es-CO");

  const totalGastos = gastos.reduce((s, g) => s + g.val, 0);
  const utilidad    = totalVentas - totalGastos;
  const margen      = totalVentas > 0 ? Math.round((utilidad / totalVentas) * 100) : 0;

  const alertas = [
    {
      tipo: "blue",
      msg: totalVentas === 0
        ? "No hay ventas registradas aún — caja lista"
        : `${pedidosCount} pedido${pedidosCount !== 1 ? "s" : ""} registrado${pedidosCount !== 1 ? "s" : ""} hoy`,
    },
  ];

  useEffect(() => {
    const tc = dark ? "#6A6560" : "#9A978E";
    const gc = dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";

    if (chartHorasInstance.current)   chartHorasInstance.current.destroy();
    if (chartSemanalInstance.current) chartSemanalInstance.current.destroy();

    if (chartHorasRef.current) {
      chartHorasInstance.current = new Chart(chartHorasRef.current, {
        type: "bar",
        data: {
          labels: ["7am","8am","9am","10am","11am","12pm","1pm","2pm","3pm"],
          datasets: [{
            label: "Ventas",
            data: [],
            backgroundColor: "#C4742A",
            borderRadius: 5,
            borderSkipped: false,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: tc, font: { size: 11 } }, grid: { color: gc } },
            y: { ticks: { color: tc, font: { size: 11 }, callback: (v) => "$" + Math.round(v / 1000) + "k" }, grid: { color: gc } },
          },
        },
      });
    }

    if (chartSemanalRef.current) {
      chartSemanalInstance.current = new Chart(chartSemanalRef.current, {
        type: "line",
        data: {
          labels: ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"],
          datasets: [{
            label: "Ingresos",
            data: [],
            borderColor: "#C4742A",
            backgroundColor: "rgba(196,116,42,0.08)",
            borderWidth: 2,
            pointRadius: 3,
            pointBackgroundColor: "#C4742A",
            fill: true,
            tension: 0.4,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: tc, font: { size: 10 } }, grid: { display: false } },
            y: { ticks: { color: tc, font: { size: 10 }, callback: (v) => "$" + Math.round(v / 1000) + "k" }, grid: { color: gc } },
          },
        },
      });
    }

    return () => {
      chartHorasInstance.current?.destroy();
      chartSemanalInstance.current?.destroy();
    };
  }, [dark]);

  return (
    <div className="main active fade-in" id="tab-dashboard">

      {/* ── MÉTRICAS ── */}
      <div className="section-label">Resumen del día</div>
      <div className="dash-metrics">

        <div className="metric-card">
          <div className="metric-label">Ingresos totales</div>
          <div className="metric-value number" style={{ color: "var(--green)" }}>
            {fmt(totalVentas)}
          </div>
          <div className="metric-sub">
            {pedidosCount} pedido{pedidosCount !== 1 ? "s" : ""} registrado{pedidosCount !== 1 ? "s" : ""}
          </div>
        </div>

        <div className="metric-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
            <div className="metric-label">Gastos del día</div>
            <button className="btn btn-sm" onClick={abrirGastos} style={{ fontSize: "10px", padding: "3px 8px" }}>
              + Editar
            </button>
          </div>
          <div className="metric-value number" style={{ color: "var(--red)" }}>
            {fmt(totalGastos)}
          </div>
          <div className="metric-sub">
            {gastos.length > 0
              ? [...new Set(gastos.map((g) => g.cat))].join(" · ")
              : "Sin gastos aún"}
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Utilidad neta</div>
          <div className="metric-value number" style={{ color: utilidad >= 0 ? "var(--amber)" : "var(--red)" }}>
            {fmt(utilidad)}
          </div>
          <div className="metric-sub">{margen}% margen</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Efectivo en caja</div>
          <div className="metric-value number" style={{ color: "var(--green)" }}>
            {fmt(efectivoRecibido - cambioEntregado)}
          </div>
          <div style={{ fontSize: "11px", color: "var(--text3)", marginTop: "4px" }}>
            Recibido: {fmt(efectivoRecibido)}
          </div>
          <div style={{ fontSize: "11px", color: "var(--red)", marginTop: "2px" }}>
            Cambio: -{fmt(cambioEntregado)}
          </div>
        </div>

      </div>

      {/* ── GRÁFICAS ── */}
      <div className="dash-row">
        <div className="card">
          <div className="card-title-row">
            <span className="card-title">Ventas por hora</span>
            <span className="badge badge-gray">Pico: 1pm</span>
          </div>
          <div className="chart-wrap" style={{ height: "200px" }}>
            <canvas ref={chartHorasRef}></canvas>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Platos más pedidos hoy</div>
          <div style={{ textAlign: "center", padding: "30px 0", color: "var(--text3)", fontSize: "12px" }}>
            Las ventas del día aparecerán aquí
          </div>
        </div>
      </div>

      {/* ── CUENTAS + SEMANAL + ALERTAS ── */}
      <div className="dash-bottom">

        <div className="card">
          <div className="card-title-row">
            <span className="card-title">Cuentas del día</span>
          </div>

          {/* Ingresos */}
          <div className="item-row">
            <span className="item-row-label">Ingresos brutos</span>
            <span className="item-row-val number" style={{ color: "var(--green)" }}>
              {fmt(totalVentas)}
            </span>
          </div>

          {/* Gastos */}
          {gastos.map((g) => (
            <div key={g.id} className="item-row">
              <span className="item-row-label" style={{ color: "var(--text2)" }}>
                {g.desc}
              </span>
              <span className="item-row-val number" style={{ color: "var(--red)" }}>
                -{fmt(g.val)}
              </span>
            </div>
          ))}

          <hr className="divider" style={{ margin: "8px 0" }} />

          {/* Control de efectivo */}
          <div className="item-row">
            <span className="item-row-label" style={{ fontSize: "11px", color: "var(--text3)" }}>
              Billetes recibidos
            </span>
            <span className="item-row-val number" style={{ fontSize: "12px" }}>
              {fmt(efectivoRecibido)}
            </span>
          </div>
          <div className="item-row">
            <span className="item-row-label" style={{ fontSize: "11px", color: "var(--text3)" }}>
              Cambio entregado
            </span>
            <span className="item-row-val number" style={{ fontSize: "12px", color: "var(--red)" }}>
              -{fmt(cambioEntregado)}
            </span>
          </div>
          <div className="item-row">
            <span className="item-row-label" style={{ fontSize: "11px", color: "var(--text3)" }}>
              Transferencias
            </span>
            <span className="item-row-val number" style={{ fontSize: "12px" }}>
              {fmt(transferenciaTotal)}
            </span>
          </div>
          <div className="item-row">
            <span className="item-row-label" style={{ fontSize: "11px", color: "var(--text3)" }}>
              Tarjeta
            </span>
            <span className="item-row-val number" style={{ fontSize: "12px" }}>
              {fmt(tarjetaTotal)}
            </span>
          </div>

          <hr className="divider" style={{ margin: "8px 0" }} />

          {/* Utilidad neta */}
          <div className="item-row" style={{ background: "transparent", paddingLeft: 0, paddingRight: 0 }}>
            <span className="item-row-label" style={{ fontWeight: 600, fontSize: "13px" }}>
              Utilidad neta
            </span>
            <span className="item-row-val number" style={{ fontSize: "14px", color: utilidad >= 0 ? "var(--amber)" : "var(--red)" }}>
              {fmt(utilidad)}
            </span>
          </div>

          <div style={{ marginTop: "12px" }}>
            <button className="btn btn-accent btn-full btn-lg" onClick={abrirCierre}>
              ⬡ Generar cierre de caja
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Rendimiento semanal</div>
          <div className="chart-wrap" style={{ height: "170px" }}>
            <canvas ref={chartSemanalRef}></canvas>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Alertas del sistema</div>
          {alertas.map((a, i) => (
            <div key={i} className={`alert-row alert-${a.tipo}`}>
              <div className={`alert-dot alert-dot-${a.tipo}`}></div>
              <span className="alert-text">{a.msg}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default Dashboard;