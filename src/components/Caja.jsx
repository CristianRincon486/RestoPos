// src/components/Caja.jsx

import React, { useState } from "react";

// ─── MENÚ BASE ───────────────────────────────────────────────────────────────
const MENU_BASE = {
  desayuno: {
    caldos: [
      { id: "c1", name: "Caldo de costilla", precio: 7500, tipo: "normal" },
      { id: "c2", name: "Caldo de pollo", precio: 7500, tipo: "normal" },
      { id: "c3", name: "Caldo de pata", precio: 7500, tipo: "normal" },
      { id: "c4", name: "Caldo de pescado", precio: 8500, tipo: "especial" },
      { id: "c5", name: "Caldo de pajarilla", precio: 8500, tipo: "especial" },
    ],
    bandeja: [
      { id: "b1", name: "Huevos al gusto", precio: 13000 },
      { id: "b2", name: "Huevos rancheros", precio: 14000 },
      { id: "b3", name: "Carne sudada", precio: 14000 },
      { id: "b4", name: "Moñona", precio: 14000 },
    ],
    bebidas: [
      { id: "be1", name: "Limonada" },
      { id: "be2", name: "Chocolate" },
      { id: "be3", name: "Tinto" },
      { id: "be4", name: "Perico" },
    ],
  },
  almuerzo: {
    sopa: { id: "sopa", name: "Sopa de arroz", precioSolo: 5500 },
    principios: [
      { id: "p1", name: "Frijol" },
      { id: "p2", name: "Arveja" },
      { id: "p3", name: "Brócoli" },
    ],
    ejecutivo: [
      { id: "e1", name: "Minichurrasco", precio: 18000, tipo: "carne" },
      { id: "e2", name: "Chuleta", precio: 18000, tipo: "carne" },
      { id: "e3", name: "Cachama", precio: 19000, tipo: "pescado" },
      { id: "e4", name: "Cazuela de mariscos", precio: 20000, tipo: "cazuela" },
    ],
    intermedio: [
      {
        id: "i1",
        name: "Chuleta ejecutiva",
        conSopa: 16000,
        sinSopa: 15000,
        tipo: "carne",
      },
      {
        id: "i2",
        name: "Filete de robalo",
        conSopa: 16000,
        sinSopa: 15000,
        tipo: "pescado",
      },
    ],
    corriente: [
      {
        id: "co1",
        name: "Pechuga",
        conSopa: 13000,
        sinSopa: 12000,
        tipo: "carne",
      },
      {
        id: "co2",
        name: "Lomo",
        conSopa: 13000,
        sinSopa: 12000,
        tipo: "carne",
      },
      {
        id: "co3",
        name: "Hígado",
        conSopa: 13000,
        sinSopa: 12000,
        tipo: "carne",
      },
      {
        id: "co4",
        name: "Mojarra",
        conSopa: 14000,
        sinSopa: 13000,
        tipo: "pescado",
      },
    ],
    bebidas: [
      { id: "ab1", name: "Limonada" },
      { id: "ab2", name: "Jugo de mango" },
    ],
  },
};

// ─── PRECIO ICOPOR ───────────────────────────────────────────────────────────
const PRECIO_ICOPOR = 500;

const fmt = (n) => "$" + Math.round(n).toLocaleString("es-CO");

const itemVacio = () => ({
  esCaldo: false,
  caldo: null,
  bandeja: null,
  bebidaD: null,
  soloSopa: false,
  conSopa: false,
  categoria: null,
  proteina: null,
  principios: [],
  mixto: false,
  bebidaA: null,
});

// ─── STOCK INICIAL ───────────────────────────────────────────────────────────
const buildStockInicial = () => {
  const stock = {};
  ["ejecutivo", "intermedio", "corriente"].forEach((cat) => {
    MENU_BASE.almuerzo[cat].forEach((p) => {
      stock[p.id] = { name: p.name, cat, total: 0, vendidas: 0 };
    });
  });
  return stock;
};

// ─── COMPONENTE ──────────────────────────────────────────────────────────────
function Caja({ onCobro }) {
  const [menu, setMenu] = useState(MENU_BASE);
  const [servicio, setServicio] = useState(null);
  const [ticket, setTicket] = useState([]);
  const [item, setItem] = useState(itemVacio());
  const [paraLlevar, setParaLlevar] = useState(false);
  const [tipoPago, setTipoPago] = useState("efectivo");
  const [pagoInput, setPagoInput] = useState("");
  const [pedidoNum, setPedidoNum] = useState(1);
  const [editIdx, setEditIdx] = useState(null);
  const [precioEdit, setPrecioEdit] = useState("");
  const [cobrado, setCobrado] = useState(false);
  const [stock, setStock] = useState(buildStockInicial());
  const [stockConfigurado, setStockConfigurado] = useState(false);
  const [stockTemp, setStockTemp] = useState({});
  const [pedidoCobrado, setPedidoCobrado] = useState(null);

  // Factura electrónica
  const [modalFactura, setModalFactura] = useState(false);
  const [datosFactura, setDatosFactura] = useState({
    nombre: "",
    documento: "",
    correo: "",
  });
  const [facturaError, setFacturaError] = useState("");
  const [facturaGenerada, setFacturaGenerada] = useState(null);

  // Edición de precios en caja
  const [editandoPrecios, setEditandoPrecios] = useState(false);
  const [preciosTemp, setPreciosTemp] = useState({});

  // Balance del día
  const [verBalance, setVerBalance] = useState(false);
  const [balanceDia, setBalanceDia] = useState([]);

  // ─── TOTALES ─────────────────────────────────────────────────────────────
  const costoIcopor = () => {
    if (!paraLlevar) return 0;
    let recipientes = 0;
    ticket.forEach((t) => {
      if (t.tieneSopa) recipientes++;
      if (t.tieneBandeja) recipientes++;
      if (t.esSoloSopa || t.esSoloCaldo) recipientes++;
    });
    return recipientes * PRECIO_ICOPOR;
  };

  const totalTicket = ticket.reduce((s, t) => s + t.precio, 0) + costoIcopor();
  const pagoNum = parseFloat(pagoInput) || 0;
  const cambio = pagoNum - totalTicket;
  const puedeCobrar =
    ticket.length > 0 && (tipoPago !== "efectivo" || pagoNum >= totalTicket);

  // ─── PRECIO ÍTEM EN CONSTRUCCIÓN ─────────────────────────────────────────
  const calcPrecioItem = () => {
    if (servicio === "desayuno") {
      if (item.esCaldo && !item.bandeja && item.caldo) return item.caldo.precio;
      if (item.bandeja && !item.esCaldo) return item.bandeja.precio;
      if (item.esCaldo && item.bandeja && item.caldo && item.bandeja)
        return item.caldo.precio + item.bandeja.precio;
      return 0;
    }
    if (servicio === "almuerzo") {
      if (item.soloSopa) return menu.almuerzo.sopa.precioSolo;
      if (!item.proteina) return 0;
      const { categoria, proteina, conSopa } = item;
      if (categoria === "ejecutivo") return proteina.precio;
      return conSopa ? proteina.conSopa : proteina.sinSopa;
    }
    return 0;
  };

  // ─── DESCRIPCIÓN ÍTEM ────────────────────────────────────────────────────
  const descItem = () => {
    if (servicio === "desayuno") {
      const partes = [];
      if (item.caldo) partes.push(item.caldo.name);
      if (item.bandeja) partes.push(item.bandeja.name);
      if (item.bebidaD) partes.push(item.bebidaD.name);
      return partes.join(" + ") || "—";
    }
    if (servicio === "almuerzo") {
      if (item.soloSopa) return menu.almuerzo.sopa.name;
      const partes = [];
      if (item.conSopa) partes.push(menu.almuerzo.sopa.name);
      if (item.proteina) partes.push(item.proteina.name);
      if (item.principios.length > 0)
        partes.push(
          item.mixto
            ? `Mixto (${item.principios.map((p) => p.name).join("/")})`
            : item.principios[0].name,
        );
      if (item.bebidaA) partes.push(item.bebidaA.name);
      return partes.join(" + ") || "—";
    }
    return "—";
  };

  // ─── CONFIRMAR ÍTEM ──────────────────────────────────────────────────────
  const confirmarItem = () => {
    const precio = calcPrecioItem();
    if (precio === 0) return;

    // Metadatos para icopor y balance
    const tieneSopa = servicio === "almuerzo" && item.conSopa && !item.soloSopa;
    const tieneBandeja =
      servicio === "almuerzo" && !item.soloSopa && !!item.proteina;
    const esSoloSopa = servicio === "almuerzo" && item.soloSopa;
    const esSoloCaldo =
      servicio === "desayuno" && item.esCaldo && !item.bandeja;

    setTicket((prev) => [
      ...prev,
      {
        id: Date.now(),
        desc: descItem(),
        precio,
        servicio,
        tieneSopa,
        tieneBandeja,
        esSoloSopa,
        esSoloCaldo,
        proteina: item.proteina || null,
        categoria: item.categoria || null,
      },
    ]);

    setItem(itemVacio());
  };

  // ─── ELIMINAR ÍTEM ───────────────────────────────────────────────────────
  const eliminarItem = (id) => {
    setTicket((prev) => prev.filter((t) => t.id !== id));
    if (editIdx === id) setEditIdx(null);
  };

  // ─── EDITAR PRECIO TICKET ────────────────────────────────────────────────
  const iniciarEdicion = (t) => {
    setEditIdx(t.id);
    setPrecioEdit(String(t.precio));
  };
  const guardarEdicion = (id) => {
    const nuevo = parseFloat(precioEdit);
    if (!isNaN(nuevo) && nuevo >= 0)
      setTicket((prev) =>
        prev.map((t) => (t.id === id ? { ...t, precio: nuevo } : t)),
      );
    setEditIdx(null);
  };

   const limpiar = () => {
    if (ticket.length > 0) {
      const confirmar = window.confirm(
        "¿Seguro que quieres cancelar este pedido? Se perderán los ítems agregados.",
      );
      if (!confirmar) return;
    }
    setTicket([]);
    setItem(itemVacio());
    setPagoInput("");
    setParaLlevar(false);
    setTipoPago("efectivo");
    setEditIdx(null);
    setPrecioEdit("");
    setServicio(null);
  };

  // ─── COBRAR ──────────────────────────────────────────────────────────────
  const cobrar = () => {
  if (!puedeCobrar) return;

  const snapshot = {
    num: String(pedidoNum).padStart(5, '0'),
    items: [...ticket],
    total: totalTicket,
    icopor: costoIcopor(),
    paraLlevar,
    tipoPago,
    pagoRecibido: tipoPago === 'efectivo' ? pagoNum : totalTicket,
    cambioEntregado: tipoPago === 'efectivo' ? cambio : 0,
    fecha: new Date().toLocaleString('es-CO'),
  };

  // Descontar stock proteínas
  setStock(prev => {
    const nuevo = { ...prev };
    ticket.forEach(t => {
      if (t.proteina && nuevo[t.proteina.id]) {
        nuevo[t.proteina.id] = {
          ...nuevo[t.proteina.id],
          vendidas: nuevo[t.proteina.id].vendidas + 1,
        };
      }
    });
    return nuevo;
  });

  // Balance del día
  ticket.forEach(t => {
    if (t.categoria) {
      setBalanceDia(prev => {
        const existe = prev.find(b => b.proteinaId === t.proteina?.id);
        if (existe) {
          return prev.map(b => b.proteinaId === t.proteina?.id
            ? { ...b, cantidad: b.cantidad + 1, total: b.total + t.precio }
            : b
          );
        }
        return [...prev, {
          proteinaId: t.proteina?.id,
          nombre: t.proteina?.name,
          categoria: t.categoria,
          cantidad: 1,
          total: t.precio,
        }];
      });
    }
  });

  // ── Notificar al App.js con todos los datos ──
  onCobro({
    monto: totalTicket,
    pagoRecibido: tipoPago === 'efectivo' ? pagoNum : totalTicket,
    cambioEntregado: tipoPago === 'efectivo' ? cambio : 0,
    tipoPago,
  });

  setPedidoNum(n => n + 1);
  setPedidoCobrado(snapshot);
  setCobrado(true);

  setTicket([]);
  setPagoInput('');
  setParaLlevar(false);
  setItem(itemVacio());
};

  // ─── FACTURA ELECTRÓNICA ─────────────────────────────────────────────────
  const generarFactura = () => {
    const { nombre, documento, correo } = datosFactura;
    if (!nombre.trim() || !documento.trim() || !correo.trim()) {
      setFacturaError("Por favor completa todos los campos.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      setFacturaError("El correo electrónico no es válido.");
      return;
    }
    const cufe =
      "CUFE-" + Math.random().toString(36).substr(2, 16).toUpperCase();
    const numFact = "REST-" + String(pedidoNum).padStart(5, "0");
    setFacturaGenerada({
      numero: numFact,
      cufe,
      fecha: new Date().toLocaleString("es-CO"),
      cliente: nombre,
      documento,
      correo,
      items: ticket.map((t) => ({ desc: t.desc, precio: t.precio })),
      total: totalTicket,
    });
    setFacturaError("");
  };

  // ─── EDITAR PRECIOS EN CAJA ──────────────────────────────────────────────
  const abrirEditarPrecios = () => {
    const temp = {};
    ["ejecutivo", "intermedio", "corriente"].forEach((cat) => {
      menu.almuerzo[cat].forEach((p) => {
        temp[p.id] = { ...p };
      });
    });
    menu.desayuno.caldos.forEach((c) => {
      temp[c.id] = { ...c };
    });
    menu.desayuno.bandeja.forEach((b) => {
      temp[b.id] = { ...b };
    });
    setPreciosTemp(temp);
    setEditandoPrecios(true);
  };

  const guardarPrecios = () => {
    setMenu((prev) => {
      const nuevo = JSON.parse(JSON.stringify(prev));
      ["ejecutivo", "intermedio", "corriente"].forEach((cat) => {
        nuevo.almuerzo[cat] = nuevo.almuerzo[cat].map((p) =>
          preciosTemp[p.id] ? { ...p, ...preciosTemp[p.id] } : p,
        );
      });
      nuevo.desayuno.caldos = nuevo.desayuno.caldos.map((c) =>
        preciosTemp[c.id]
          ? { ...c, precio: parseFloat(preciosTemp[c.id].precio) || c.precio }
          : c,
      );
      nuevo.desayuno.bandeja = nuevo.desayuno.bandeja.map((b) =>
        preciosTemp[b.id]
          ? { ...b, precio: parseFloat(preciosTemp[b.id].precio) || b.precio }
          : b,
      );
      return nuevo;
    });
    setEditandoPrecios(false);
  };

  // ─── HELPERS ─────────────────────────────────────────────────────────────
  const selBtn = (cond) => `tipo-btn${cond ? " active" : ""}`;

  const togglePrincipio = (p) => {
    setItem((prev) => {
      const yaEsta = prev.principios.find((sp) => sp.id === p.id);
      if (yaEsta)
        return {
          ...prev,
          principios: prev.principios.filter((sp) => sp.id !== p.id),
        };
      const max = prev.mixto ? 2 : 1;
      if (prev.principios.length >= max) return prev;
      return { ...prev, principios: [...prev.principios, p] };
    });
  };

  // ─── MODAL EDITAR PRECIOS ────────────────────────────────────────────────
  const renderModalPrecios = () => (
    <div className="modal-overlay open">
      <div className="modal-box wide">
        <div className="modal-title">Editar precios del menú</div>
        <div className="modal-sub">
          Los cambios se aplican inmediatamente en la caja
        </div>

        {/* Desayuno - Caldos */}
        <div style={{ marginBottom: "16px" }}>
          <div className="section-label">Desayuno — Caldos</div>
          {menu.desayuno.caldos.map((c) => (
            <div
              key={c.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "6px",
              }}
            >
              <span style={{ flex: 1, fontSize: "13px" }}>{c.name}</span>
              <input
                type="number"
                className="input-field"
                style={{
                  width: "100px",
                  fontFamily: "var(--fm)",
                  textAlign: "right",
                }}
                value={preciosTemp[c.id]?.precio || ""}
                onChange={(e) =>
                  setPreciosTemp((prev) => ({
                    ...prev,
                    [c.id]: { ...prev[c.id], precio: e.target.value },
                  }))
                }
              />
            </div>
          ))}
        </div>

        {/* Desayuno - Bandeja */}
        <div style={{ marginBottom: "16px" }}>
          <div className="section-label">Desayuno — Bandeja</div>
          {menu.desayuno.bandeja.map((b) => (
            <div
              key={b.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "6px",
              }}
            >
              <span style={{ flex: 1, fontSize: "13px" }}>{b.name}</span>
              <input
                type="number"
                className="input-field"
                style={{
                  width: "100px",
                  fontFamily: "var(--fm)",
                  textAlign: "right",
                }}
                value={preciosTemp[b.id]?.precio || ""}
                onChange={(e) =>
                  setPreciosTemp((prev) => ({
                    ...prev,
                    [b.id]: { ...prev[b.id], precio: e.target.value },
                  }))
                }
              />
            </div>
          ))}
        </div>

        {/* Almuerzo - Ejecutivo */}
        <div style={{ marginBottom: "16px" }}>
          <div className="section-label">
            Almuerzo — Ejecutivo (precio único)
          </div>
          {menu.almuerzo.ejecutivo.map((p) => (
            <div
              key={p.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "6px",
              }}
            >
              <span style={{ flex: 1, fontSize: "13px" }}>{p.name}</span>
              <input
                type="number"
                className="input-field"
                style={{
                  width: "100px",
                  fontFamily: "var(--fm)",
                  textAlign: "right",
                }}
                value={preciosTemp[p.id]?.precio || ""}
                onChange={(e) =>
                  setPreciosTemp((prev) => ({
                    ...prev,
                    [p.id]: {
                      ...prev[p.id],
                      precio: parseFloat(e.target.value),
                    },
                  }))
                }
              />
            </div>
          ))}
        </div>

        {/* Almuerzo - Intermedio */}
        <div style={{ marginBottom: "16px" }}>
          <div className="section-label">
            Almuerzo — Intermedio (con sopa / sin sopa)
          </div>
          {menu.almuerzo.intermedio.map((p) => (
            <div
              key={p.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "6px",
              }}
            >
              <span style={{ flex: 1, fontSize: "13px" }}>{p.name}</span>
              <div
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <span style={{ fontSize: "11px", color: "var(--text3)" }}>
                  Con sopa
                </span>
                <input
                  type="number"
                  className="input-field"
                  style={{
                    width: "90px",
                    fontFamily: "var(--fm)",
                    textAlign: "right",
                  }}
                  value={preciosTemp[p.id]?.conSopa || ""}
                  onChange={(e) =>
                    setPreciosTemp((prev) => ({
                      ...prev,
                      [p.id]: {
                        ...prev[p.id],
                        conSopa: parseFloat(e.target.value),
                      },
                    }))
                  }
                />
                <span style={{ fontSize: "11px", color: "var(--text3)" }}>
                  Sin sopa
                </span>
                <input
                  type="number"
                  className="input-field"
                  style={{
                    width: "90px",
                    fontFamily: "var(--fm)",
                    textAlign: "right",
                  }}
                  value={preciosTemp[p.id]?.sinSopa || ""}
                  onChange={(e) =>
                    setPreciosTemp((prev) => ({
                      ...prev,
                      [p.id]: {
                        ...prev[p.id],
                        sinSopa: parseFloat(e.target.value),
                      },
                    }))
                  }
                />
              </div>
            </div>
          ))}
        </div>

        {/* Almuerzo - Corriente */}
        <div style={{ marginBottom: "16px" }}>
          <div className="section-label">
            Almuerzo — Corriente (con sopa / sin sopa)
          </div>
          {menu.almuerzo.corriente.map((p) => (
            <div
              key={p.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "6px",
              }}
            >
              <span style={{ flex: 1, fontSize: "13px" }}>{p.name}</span>
              <div
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <span style={{ fontSize: "11px", color: "var(--text3)" }}>
                  Con sopa
                </span>
                <input
                  type="number"
                  className="input-field"
                  style={{
                    width: "90px",
                    fontFamily: "var(--fm)",
                    textAlign: "right",
                  }}
                  value={preciosTemp[p.id]?.conSopa || ""}
                  onChange={(e) =>
                    setPreciosTemp((prev) => ({
                      ...prev,
                      [p.id]: {
                        ...prev[p.id],
                        conSopa: parseFloat(e.target.value),
                      },
                    }))
                  }
                />
                <span style={{ fontSize: "11px", color: "var(--text3)" }}>
                  Sin sopa
                </span>
                <input
                  type="number"
                  className="input-field"
                  style={{
                    width: "90px",
                    fontFamily: "var(--fm)",
                    textAlign: "right",
                  }}
                  value={preciosTemp[p.id]?.sinSopa || ""}
                  onChange={(e) =>
                    setPreciosTemp((prev) => ({
                      ...prev,
                      [p.id]: {
                        ...prev[p.id],
                        sinSopa: parseFloat(e.target.value),
                      },
                    }))
                  }
                />
              </div>
            </div>
          ))}
        </div>

        <div className="modal-footer">
          <button className="btn" onClick={() => setEditandoPrecios(false)}>
            Cancelar
          </button>
          <button className="btn btn-accent" onClick={guardarPrecios}>
            Guardar precios
          </button>
        </div>
      </div>
    </div>
  );

  // ─── MODAL STOCK ─────────────────────────────────────────────────────────
  const renderModalStock = () => (
    <div className="modal-overlay open">
      <div className="modal-box">
        <div className="modal-title">Porciones disponibles hoy</div>
        <div className="modal-sub">
          Ingresa cuántas porciones hay de cada proteína al iniciar el día
        </div>
        {["ejecutivo", "intermedio", "corriente"].map((cat) => (
          <div key={cat} style={{ marginBottom: "14px" }}>
            <div className="section-label">
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </div>
            {MENU_BASE.almuerzo[cat].map((p) => (
              <div
                key={p.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "6px",
                }}
              >
                <span style={{ flex: 1, fontSize: "13px" }}>{p.name}</span>
                <input
                  type="number"
                  className="input-field"
                  style={{
                    width: "80px",
                    textAlign: "center",
                    fontFamily: "var(--fm)",
                  }}
                  placeholder="0"
                  min="0"
                  value={stockTemp[p.id] || ""}
                  onChange={(e) =>
                    setStockTemp((prev) => ({
                      ...prev,
                      [p.id]: e.target.value,
                    }))
                  }
                />
                <span style={{ fontSize: "11px", color: "var(--text3)" }}>
                  porciones
                </span>
              </div>
            ))}
          </div>
        ))}
        <div className="modal-footer">
        </div>
      </div>
    </div>
  );

  // ─── MODAL FACTURA ────────────────────────────────────────────────────────
  const renderModalFactura = () => (
    <div className="modal-overlay open">
      <div className="modal-box">
        {!facturaGenerada ? (
          <>
            <div className="modal-title">Factura electrónica</div>
            <div className="modal-sub">
              La factura se enviará al correo del cliente automáticamente
            </div>

            <div className="form-group" style={{ marginBottom: "10px" }}>
              <div className="form-label">Nombre completo</div>
              <input
                type="text"
                className="input-field"
                placeholder="Nombre del cliente o razón social"
                value={datosFactura.nombre}
                onChange={(e) =>
                  setDatosFactura((prev) => ({
                    ...prev,
                    nombre: e.target.value,
                  }))
                }
              />
            </div>
            <div className="form-group" style={{ marginBottom: "10px" }}>
              <div className="form-label">Documento (CC / NIT)</div>
              <input
                type="text"
                className="input-field"
                placeholder="Ej: 1020304050"
                value={datosFactura.documento}
                onChange={(e) =>
                  setDatosFactura((prev) => ({
                    ...prev,
                    documento: e.target.value,
                  }))
                }
              />
            </div>
            <div className="form-group" style={{ marginBottom: "14px" }}>
              <div className="form-label">Correo electrónico</div>
              <input
                type="email"
                className="input-field"
                placeholder="cliente@correo.com"
                value={datosFactura.correo}
                onChange={(e) =>
                  setDatosFactura((prev) => ({
                    ...prev,
                    correo: e.target.value,
                  }))
                }
              />
            </div>

            {/* Resumen automático */}
            <div
              style={{
                background: "var(--surface2)",
                borderRadius: "var(--r-md)",
                padding: "12px",
                marginBottom: "14px",
              }}
            >
              <div className="section-label" style={{ marginBottom: "8px" }}>
                Productos
              </div>
              {pedidoCobrado?.items.map((t) => (
                <div
                  key={t.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "12px",
                    marginBottom: "4px",
                  }}
                >
                  <span>{t.desc}</span>
                  <span style={{ fontFamily: "var(--fm)" }}>
                    {fmt(t.precio)}
                  </span>
                </div>
              ))}
              {pedidoCobrado?.paraLlevar && pedidoCobrado?.icopor > 0 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "12px",
                    marginBottom: "4px",
                  }}
                >
                  <span>Icopor (para llevar)</span>
                  <span style={{ fontFamily: "var(--fm)" }}>
                    {fmt(pedidoCobrado.icopor)}
                  </span>
                </div>
              )}
              <hr className="divider" style={{ margin: "8px 0" }} />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontWeight: 700,
                  fontSize: "14px",
                }}
              >
                <span>Total</span>
                <span
                  style={{ fontFamily: "var(--fm)", color: "var(--accent)" }}
                >
                  {fmt(pedidoCobrado?.total || 0)}
                </span>
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "var(--text3)",
                  marginTop: "4px",
                }}
              >
                Fecha: {pedidoCobrado?.fecha}
              </div>
            </div>

            {facturaError && (
              <div
                style={{
                  fontSize: "12px",
                  color: "var(--red)",
                  marginBottom: "10px",
                }}
              >
                {facturaError}
              </div>
            )}

            <div className="modal-footer">
              <button
                className="btn"
                onClick={() => {
                  setModalFactura(false);
                  setFacturaGenerada(null);
                  setFacturaError("");
                }}
              >
                Cancelar
              </button>
              <button className="btn btn-accent" onClick={generarFactura}>
                Generar y enviar factura
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="modal-title">✓ Factura generada</div>
            <div
              style={{
                background: "var(--green-bg)",
                borderRadius: "var(--r-md)",
                padding: "14px",
                marginBottom: "14px",
                borderLeft: "3px solid var(--green)",
              }}
            >
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "var(--green)",
                  marginBottom: "6px",
                }}
              >
                {facturaGenerada.numero}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "var(--green)",
                  marginBottom: "4px",
                }}
              >
                Cliente: {facturaGenerada.cliente} — {facturaGenerada.documento}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "var(--green)",
                  marginBottom: "4px",
                }}
              >
                Enviada a: {facturaGenerada.correo}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "var(--green)",
                  marginBottom: "4px",
                }}
              >
                Total: {fmt(facturaGenerada.total)}
              </div>
              <div
                style={{
                  fontFamily: "var(--fm)",
                  fontSize: "9px",
                  color: "var(--green)",
                  wordBreak: "break-all",
                  marginTop: "8px",
                }}
              >
                {facturaGenerada.cufe}
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-accent"
                onClick={() => {
                  setModalFactura(false);
                  setFacturaGenerada(null);
                  setDatosFactura({ nombre: "", documento: "", correo: "" });
                }}
              >
                Cerrar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  // ─── MODAL BALANCE ────────────────────────────────────────────────────────
  const renderModalBalance = () => (
    <div className="modal-overlay open">
      <div className="modal-box wide">
        <div className="modal-title">Balance del día — Porciones vendidas</div>
        <div className="modal-sub">
          Resumen de ventas por proteína y cruce con inventario
        </div>

        {["ejecutivo", "intermedio", "corriente"].map((cat) => {
          const itemsCat = Object.values(stock).filter((s) => s.cat === cat);
          if (!itemsCat.length) return null;
          return (
            <div key={cat} style={{ marginBottom: "16px" }}>
              <div className="section-label">
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </div>
              <table className="inv-table">
                <thead>
                  <tr>
                    <th>Proteína</th>
                    <th>Porciones iniciales</th>
                    <th>Vendidas</th>
                    <th>Disponibles</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {itemsCat.map((s) => {
                    const disponibles = s.total - s.vendidas;
                    return (
                      <tr key={s.name}>
                        <td>{s.name}</td>
                        <td
                          style={{
                            textAlign: "center",
                            fontFamily: "var(--fm)",
                          }}
                        >
                          {s.total}
                        </td>
                        <td
                          style={{
                            textAlign: "center",
                            fontFamily: "var(--fm)",
                            color: "var(--accent)",
                          }}
                        >
                          {s.vendidas}
                        </td>
                        <td
                          style={{
                            textAlign: "center",
                            fontFamily: "var(--fm)",
                            color:
                              disponibles <= 0
                                ? "var(--red)"
                                : disponibles <= 2
                                  ? "var(--amber)"
                                  : "var(--green)",
                          }}
                        >
                          {disponibles <= 0 ? "¡Agotado!" : disponibles}
                        </td>
                        <td>
                          {disponibles <= 0 ? (
                            <span className="badge badge-red">Agotado</span>
                          ) : disponibles <= 2 ? (
                            <span className="badge badge-amber">
                              Últimas {disponibles}
                            </span>
                          ) : (
                            <span className="badge badge-green">
                              Disponible
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })}

        {/* Total ventas por categoría */}
        <div style={{ marginTop: "8px" }}>
          <div className="section-label">Resumen de ventas</div>
          {["ejecutivo", "intermedio", "corriente"].map((cat) => {
            const ventasCat = balanceDia.filter((b) => b.categoria === cat);
            const totalCat = ventasCat.reduce((s, b) => s + b.cantidad, 0);
            const totalPesos = ventasCat.reduce((s, b) => s + b.total, 0);
            if (!totalCat) return null;
            return (
              <div key={cat} className="item-row">
                <span className="item-row-label">
                  {cat.charAt(0).toUpperCase() + cat.slice(1)} ({totalCat}{" "}
                  bandejas)
                </span>
                <span
                  className="item-row-val number"
                  style={{ color: "var(--green)" }}
                >
                  {fmt(totalPesos)}
                </span>
              </div>
            );
          })}
        </div>

        <div className="modal-footer">
          <button
            className="btn btn-accent"
            onClick={() => setVerBalance(false)}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );

  // ─── ARMADOR DESAYUNO ────────────────────────────────────────────────────
  const renderDesayuno = () => (
    <div className="card">
      <div className="card-title" style={{ color: "var(--accent)" }}>
        🍳 Armar desayuno
      </div>

      <div style={{ marginBottom: "14px" }}>
        <div className="section-label">¿Qué va a llevar?</div>
        <div className="tipo-pago" style={{ marginTop: "6px" }}>
          <button
            className={selBtn(item.esCaldo && !item.bandeja)}
            onClick={() => setItem({ ...itemVacio(), esCaldo: true })}
          >
            🍲 Solo caldo
          </button>
          <button
            className={selBtn(!item.esCaldo && !!item.bandeja)}
            onClick={() => setItem({ ...itemVacio(), esCaldo: false })}
          >
            🍳 Solo bandeja
          </button>
          <button
            className={selBtn(item.esCaldo && !!item.bandeja)}
            onClick={() =>
              setItem({ ...itemVacio(), esCaldo: true, bandeja: item.bandeja })
            }
          >
            🍲+🍳 Caldo + Bandeja
          </button>
        </div>
      </div>

      {item.esCaldo && (
        <div style={{ marginBottom: "14px" }}>
          <div className="section-label">Elige el caldo</div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "6px",
              marginTop: "6px",
            }}
          >
            {menu.desayuno.caldos.map((c) => (
              <button
                key={c.id}
                className={selBtn(item.caldo?.id === c.id)}
                onClick={() => setItem((prev) => ({ ...prev, caldo: c }))}
              >
                {c.name} — {fmt(c.precio)}
              </button>
            ))}
          </div>
        </div>
      )}

      {(!item.esCaldo || !!item.bandeja !== false) && (
        <div style={{ marginBottom: "14px" }}>
          <div className="section-label">Elige la bandeja</div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "6px",
              marginTop: "6px",
            }}
          >
            {menu.desayuno.bandeja.map((b) => (
              <button
                key={b.id}
                className={selBtn(item.bandeja?.id === b.id)}
                onClick={() => setItem((prev) => ({ ...prev, bandeja: b }))}
              >
                {b.name} — {fmt(b.precio)}
              </button>
            ))}
          </div>
        </div>
      )}

      {(item.caldo || item.bandeja) && (
        <div style={{ marginBottom: "14px" }}>
          <div className="section-label">Bebida (incluida)</div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "6px",
              marginTop: "6px",
            }}
          >
            <button
              className={selBtn(!item.bebidaD)}
              onClick={() => setItem((prev) => ({ ...prev, bebidaD: null }))}
            >
              Sin bebida
            </button>
            {menu.desayuno.bebidas.map((b) => (
              <button
                key={b.id}
                className={selBtn(item.bebidaD?.id === b.id)}
                onClick={() => setItem((prev) => ({ ...prev, bebidaD: b }))}
              >
                {b.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {calcPrecioItem() > 0 && (
        <div
          style={{
            background: "var(--surface2)",
            borderRadius: "var(--r-md)",
            padding: "12px",
            marginBottom: "12px",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              color: "var(--text2)",
              marginBottom: "4px",
            }}
          >
            Resumen
          </div>
          <div style={{ fontSize: "13px", fontWeight: 500 }}>{descItem()}</div>
          <div
            style={{
              fontSize: "22px",
              fontWeight: 700,
              color: "var(--accent)",
              fontFamily: "var(--fm)",
            }}
          >
            {fmt(calcPrecioItem())}
          </div>
        </div>
      )}

      <button
        className="btn btn-accent btn-full btn-lg"
        onClick={confirmarItem}
        disabled={calcPrecioItem() === 0}
      >
        + Agregar al pedido
      </button>
    </div>
  );

  // ─── ARMADOR ALMUERZO ────────────────────────────────────────────────────
  const renderAlmuerzo = () => (
    <div className="card">
      <div className="card-title" style={{ color: "var(--accent)" }}>
        🍛 Armar almuerzo
      </div>

      <div style={{ marginBottom: "14px" }}>
        <div className="section-label">¿Qué va a llevar?</div>
        <div className="tipo-pago" style={{ marginTop: "6px" }}>
          <button
            className={selBtn(item.soloSopa)}
            onClick={() => setItem({ ...itemVacio(), soloSopa: true })}
          >
            🍲 Solo sopa — {fmt(menu.almuerzo.sopa.precioSolo)}
          </button>
          <button
            className={selBtn(
              !item.soloSopa && item.conSopa === false && !!item.categoria,
            )}
            onClick={() =>
              setItem({ ...itemVacio(), soloSopa: false, conSopa: false })
            }
          >
            🍽 Solo bandeja
          </button>
          <button
            className={selBtn(!item.soloSopa && item.conSopa === true)}
            onClick={() =>
              setItem({ ...itemVacio(), soloSopa: false, conSopa: true })
            }
          >
            🍲+🍽 Completo
          </button>
        </div>
      </div>

      {!item.soloSopa && (item.conSopa === true || item.conSopa === false) && (
        <div style={{ marginBottom: "14px" }}>
          <div className="section-label">Categoría</div>
          <div className="tipo-pago" style={{ marginTop: "6px" }}>
            {["ejecutivo", "intermedio", "corriente"].map((cat) => (
              <button
                key={cat}
                className={selBtn(item.categoria === cat)}
                onClick={() =>
                  setItem((prev) => ({
                    ...prev,
                    categoria: cat,
                    proteina: null,
                  }))
                }
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {item.categoria && (
        <div style={{ marginBottom: "14px" }}>
          <div className="section-label">Proteína</div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "6px",
              marginTop: "6px",
            }}
          >
            {menu.almuerzo[item.categoria].map((p) => {
              const precio =
                item.categoria === "ejecutivo"
                  ? p.precio
                  : item.conSopa
                    ? p.conSopa
                    : p.sinSopa;
              const disp = stock[p.id];
              const agotado =
                stockConfigurado && disp && disp.total - disp.vendidas <= 0;
              return (
                <button
                  key={p.id}
                  className={selBtn(item.proteina?.id === p.id)}
                  onClick={() =>
                    !agotado && setItem((prev) => ({ ...prev, proteina: p }))
                  }
                  style={{
                    opacity: agotado ? 0.4 : 1,
                    cursor: agotado ? "not-allowed" : "pointer",
                  }}
                  title={agotado ? "Agotado" : ""}
                >
                  {p.name} — {fmt(precio)}
                  {agotado && " 🚫"}
                  {stockConfigurado &&
                    disp &&
                    !agotado &&
                    disp.total - disp.vendidas <= 2 &&
                    ` (${disp.total - disp.vendidas} left)`}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {item.proteina && (
        <div style={{ marginBottom: "14px" }}>
          <div className="section-label">Principio (opcional)</div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "6px",
              marginTop: "6px",
              marginBottom: "8px",
            }}
          >
            <button
              className={selBtn(item.principios.length === 0)}
              onClick={() =>
                setItem((prev) => ({ ...prev, principios: [], mixto: false }))
              }
            >
              Sin principio
            </button>
            {menu.almuerzo.principios.map((p) => (
              <button
                key={p.id}
                className={selBtn(
                  !!item.principios.find((sp) => sp.id === p.id),
                )}
                onClick={() => togglePrincipio(p)}
              >
                {p.name}
              </button>
            ))}
          </div>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={item.mixto}
              onChange={(e) =>
                setItem((prev) => ({
                  ...prev,
                  mixto: e.target.checked,
                  principios: e.target.checked
                    ? prev.principios.slice(0, 2)
                    : prev.principios.slice(0, 1),
                }))
              }
              style={{ accentColor: "var(--accent)" }}
            />
            Principio mixto (máx. 2 opciones)
          </label>
        </div>
      )}

      {item.proteina && (
        <div style={{ marginBottom: "14px" }}>
          <div className="section-label">Bebida (incluida)</div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "6px",
              marginTop: "6px",
            }}
          >
            <button
              className={selBtn(!item.bebidaA)}
              onClick={() => setItem((prev) => ({ ...prev, bebidaA: null }))}
            >
              Sin bebida
            </button>
            {menu.almuerzo.bebidas.map((b) => (
              <button
                key={b.id}
                className={selBtn(item.bebidaA?.id === b.id)}
                onClick={() => setItem((prev) => ({ ...prev, bebidaA: b }))}
              >
                {b.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {calcPrecioItem() > 0 && (
        <div
          style={{
            background: "var(--surface2)",
            borderRadius: "var(--r-md)",
            padding: "12px",
            marginBottom: "12px",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              color: "var(--text2)",
              marginBottom: "4px",
            }}
          >
            Resumen
          </div>
          <div style={{ fontSize: "13px", fontWeight: 500 }}>{descItem()}</div>
          <div
            style={{
              fontSize: "22px",
              fontWeight: 700,
              color: "var(--accent)",
              fontFamily: "var(--fm)",
            }}
          >
            {fmt(calcPrecioItem())}
          </div>
        </div>
      )}

      <button
        className="btn btn-accent btn-full btn-lg"
        onClick={confirmarItem}
        disabled={!item.soloSopa && calcPrecioItem() === 0}
      >
        + Agregar al pedido
      </button>
    </div>
  );

  // ─── TICKET ──────────────────────────────────────────────────────────────
  const renderTicket = () => (
    <div className="ticket">
      <div className="ticket-header">
        <div className="ticket-title">
          Pedido #{String(pedidoNum).padStart(5, "0")}
        </div>
        <div style={{ fontSize: "11px", color: "var(--text3)" }}>
          {ticket.length} ítem{ticket.length !== 1 ? "s" : ""}
        </div>
      </div>

      <div className="ticket-body">
        {ticket.length === 0 ? (
          <div className="ticket-empty">
            <div className="ticket-empty-icon">⬡</div>
            <div>Agrega ítems al pedido</div>
          </div>
        ) : (
          ticket.map((t) => (
            <div
              key={t.id}
              className="ticket-item"
              style={{
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "4px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span className="ticket-item-name" style={{ flex: 1 }}>
                  {t.desc}
                </span>
                <button
                  className="btn btn-sm"
                  style={{ fontSize: "10px", padding: "2px 7px" }}
                  onClick={() => iniciarEdicion(t)}
                  title="Ajustar precio"
                >
                  ✎
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  style={{ fontSize: "10px", padding: "2px 7px" }}
                  onClick={() => eliminarItem(t.id)}
                >
                  ✕
                </button>
              </div>
              {editIdx === t.id ? (
                <div style={{ display: "flex", gap: "6px", width: "100%" }}>
                  <input
                    type="number"
                    className="input-field"
                    value={precioEdit}
                    onChange={(e) => setPrecioEdit(e.target.value)}
                    style={{
                      flex: 1,
                      fontFamily: "var(--fm)",
                      fontWeight: 600,
                    }}
                    autoFocus
                  />
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => guardarEdicion(t.id)}
                  >
                    ✓
                  </button>
                  <button
                    className="btn btn-sm"
                    onClick={() => setEditIdx(null)}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "var(--accent)",
                    fontFamily: "var(--fm)",
                  }}
                >
                  {fmt(t.precio)}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="ticket-footer">
        {/* Para llevar */}
        <div style={{ marginBottom: "10px" }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={paraLlevar}
              onChange={(e) => setParaLlevar(e.target.checked)}
              style={{
                accentColor: "var(--accent)",
                width: "16px",
                height: "16px",
              }}
            />
            <span style={{ fontSize: "13px", fontWeight: 500 }}>
              Para llevar
            </span>
            {paraLlevar && costoIcopor() > 0 && (
              <span className="badge badge-amber">
                +{fmt(costoIcopor())} icopor
              </span>
            )}
          </label>
        </div>

        {/* Total */}
        <table className="totals-table">
          <tbody>
            {paraLlevar && costoIcopor() > 0 && (
              <tr>
                <td style={{ color: "var(--text2)", fontSize: "12px" }}>
                  Subtotal
                </td>
                <td className="number">
                  {fmt(ticket.reduce((s, t) => s + t.precio, 0))}
                </td>
              </tr>
            )}
            {paraLlevar && costoIcopor() > 0 && (
              <tr>
                <td style={{ color: "var(--text2)", fontSize: "12px" }}>
                  Icopor
                </td>
                <td className="number" style={{ color: "var(--amber)" }}>
                  +{fmt(costoIcopor())}
                </td>
              </tr>
            )}
            <tr className="totals-total">
              <td>Total</td>
              <td className="number">{fmt(totalTicket)}</td>
            </tr>
          </tbody>
        </table>

        {/* Tipo de pago */}
        <div className="tipo-pago">
          {[
            { id: "efectivo", icon: "💵" },
            { id: "transferencia", icon: "📲" },
            { id: "tarjeta", icon: "💳" },
          ].map((tp) => (
            <button
              key={tp.id}
              className={selBtn(tipoPago === tp.id)}
              onClick={() => setTipoPago(tp.id)}
            >
              {tp.icon} {tp.id.charAt(0).toUpperCase() + tp.id.slice(1)}
            </button>
          ))}
        </div>

        {/* Pago efectivo */}
        {tipoPago === "efectivo" && (
          <>
            <div className="pago-label">Pago del cliente (COP)</div>
            <div className="pago-input-wrap">
              <input
                type="number"
                className="input-field pago-field"
                placeholder="0"
                value={pagoInput}
                onChange={(e) => setPagoInput(e.target.value)}
                step="1000"
                min="0"
              />
            </div>
            {pagoNum >= totalTicket && totalTicket > 0 && (
              <div className="cambio-display">
                <span className="cambio-label">Cambio</span>
                <span className="cambio-val">{fmt(cambio)}</span>
              </div>
            )}
          </>
        )}

        {/* Botón factura */}
        {ticket.length > 0 && (
          <button
            className="btn btn-full"
            style={{ marginBottom: "8px", fontSize: "12px" }}
            onClick={() => {
              setModalFactura(true);
              setFacturaGenerada(null);
            }}
          >
            🧾 Factura electrónica
          </button>
        )}

        {/* Cobrar */}
        {cobrado ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div
              className="alert-row alert-green"
              style={{ justifyContent: "center" }}
            >
              <span className="alert-text" style={{ fontWeight: 600 }}>
                ✓ Cobrado — {fmt(pedidoCobrado?.total || 0)}
              </span>
            </div>

            {/* Opción factura DESPUÉS del cobro */}
            <button
              className="btn btn-full"
              style={{ fontSize: "12px" }}
              onClick={() => setModalFactura(true)}
            >
              🧾 Generar factura electrónica
            </button>

            <button
              className="btn btn-full"
              style={{ fontSize: "12px" }}
              onClick={() => {
                setCobrado(false);
                setPedidoCobrado(null);
                setServicio(null);
                setEditIdx(null);
              }}
            >
              Nuevo pedido
            </button>
          </div>
        ) : (
          <>
            <button
              className="btn btn-accent btn-full btn-lg"
              onClick={cobrar}
              disabled={!puedeCobrar}
            >
              Cobrar {totalTicket > 0 ? fmt(totalTicket) : ""}
            </button>
            <button
              className="btn btn-full"
              style={{ marginTop: "6px", fontSize: "12px" }}
              onClick={limpiar}
            >
              Cancelar pedido
            </button>
          </>
        )}
      </div>
    </div>
  );

  // ─── RETURN PRINCIPAL ────────────────────────────────────────────────────
  return (
    <div className="main active fade-in" id="tab-caja">
      {/* Barra superior */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "16px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ fontSize: "16px", fontWeight: 600 }}>
          Caja registradora
        </div>

        {/* Selector servicio */}
        <div className="tipo-pago" style={{ margin: 0 }}>
          <button
            className={selBtn(servicio === "desayuno")}
            onClick={() => {
              setServicio("desayuno");
              setItem(itemVacio());
            }}
          >
            🍳 Desayuno
          </button>
          <button
            className={selBtn(servicio === "almuerzo")}
            onClick={() => {
              setServicio("almuerzo");
              setItem(itemVacio());
            }}
          >
            🍛 Almuerzo
          </button>
        </div>

        {/* Acciones */}
        <div style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
          <button className="btn btn-sm" onClick={abrirEditarPrecios}>
            ✎ Editar precios
          </button>
          <button className="btn btn-sm" onClick={() => setVerBalance(true)}>
            📊 Balance del día
          </button>
        </div>
      </div>

      {/* Alertas de stock bajo */}
      {stockConfigurado &&
        Object.values(stock).some(
          (s) => s.total - s.vendidas <= 2 && s.total - s.vendidas > 0,
        ) && (
          <div
            className="alert-row alert-amber"
            style={{ marginBottom: "12px" }}
          >
            <div className="alert-dot alert-dot-amber" />
            <span className="alert-text">
              Últimas porciones:{" "}
              {Object.values(stock)
                .filter(
                  (s) => s.total - s.vendidas <= 2 && s.total - s.vendidas > 0,
                )
                .map((s) => `${s.name} (${s.total - s.vendidas})`)
                .join(", ")}
            </span>
          </div>
        )}
      {stockConfigurado &&
        Object.values(stock).some(
          (s) => s.total > 0 && s.total - s.vendidas <= 0,
        ) && (
          <div className="alert-row alert-red" style={{ marginBottom: "12px" }}>
            <div className="alert-dot alert-dot-red" />
            <span className="alert-text">
              Agotados:{" "}
              {Object.values(stock)
                .filter((s) => s.total > 0 && s.total - s.vendidas <= 0)
                .map((s) => s.name)
                .join(", ")}
            </span>
          </div>
        )}

      {/* Layout principal */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 370px",
          gap: "16px",
          alignItems: "start",
        }}
      >
        <div>
          {!servicio && (
            <div
              className="card"
              style={{ textAlign: "center", padding: "40px" }}
            >
              <div style={{ fontSize: "32px", marginBottom: "12px" }}>🍽</div>
              <div
                style={{
                  fontSize: "15px",
                  fontWeight: 500,
                  marginBottom: "6px",
                }}
              >
                Selecciona el servicio
              </div>
              <div style={{ fontSize: "12px", color: "var(--text3)" }}>
                Elige desayuno o almuerzo para comenzar el pedido
              </div>
            </div>
          )}
          {servicio === "desayuno" && renderDesayuno()}
          {servicio === "almuerzo" && renderAlmuerzo()}
        </div>
        {renderTicket()}
      </div>

      {/* Modales */}
      {editandoPrecios && renderModalPrecios()}
      {modalFactura && renderModalFactura()}
      {verBalance && renderModalBalance()}
    </div>
  );
}

export default Caja;
