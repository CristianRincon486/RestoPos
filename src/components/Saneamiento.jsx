// src/components/Saneamiento.jsx

import React, { useState } from "react";

// ─── DATOS INICIALES ─────────────────────────────────────────────────────────

const CARGOS_INICIALES = [
  "Cocinera",
  "Aux de cocina",
  "Mesero 1",
  "Mesero 2",
  "Jefe 1",
  "Jefe 2",
];

const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const OPCIONES_CALIDAD = ["Bueno", "Malo"];

const hoy = new Date();
const DIA_HOY = hoy.getDate();
const MES_HOY = hoy.getMonth();
const ANIO_HOY = hoy.getFullYear();
const DIAS_MES = new Date(ANIO_HOY, MES_HOY + 1, 0).getDate();

// ─── HISTORIAL SANEAMIENTO ───────────────────────────────────────────────────
const HISTORIAL_INICIAL = [
  { fecha: "Vie 13 jun", pct: 100, resp: "María García", firmado: true },
  { fecha: "Jue 12 jun", pct: 95, resp: "Carlos Pérez", firmado: true },
  { fecha: "Mié 11 jun", pct: 100, resp: "María García", firmado: true },
  { fecha: "Mar 10 jun", pct: 0, resp: "—", firmado: false, alerta: true },
  { fecha: "Lun 9 jun", pct: 88, resp: "Carlos Pérez", firmado: true },
];

// ─── SECCIONES PLAN DE SANEAMIENTO ───────────────────────────────────────────
const SECCIONES = [
  {
    id: "ld",
    titulo: "1. Limpieza y desinfección",
    norma: "Res. 2674/2013 Art. 26 — Programa L&D",
    checks: [
      {
        id: "ld1",
        label: "Limpieza de superficies de contacto con alimentos",
        freq: "Antes y después de cada turno",
      },
      {
        id: "ld2",
        label: "Desinfección de mesones, tablas y utensilios",
        freq: "Entre cada preparación",
      },
      {
        id: "ld3",
        label: "Limpieza de pisos, paredes y techos área producción",
        freq: "Al final del turno",
      },
      {
        id: "ld4",
        label: "Lavado y desinfección de neveras / cuartos fríos",
        freq: "Semanal — registrar fecha",
      },
      {
        id: "ld5",
        label: "Desinfección área de servicio y comedor",
        freq: "Antes de cada servicio",
      },
    ],
  },
  {
    id: "plagas",
    titulo: "2. Control integrado de plagas",
    norma: "Res. 2674/2013 Art. 28 — Vectores y roedores",
    checks: [
      {
        id: "pl1",
        label: "Inspección visual de trampas para roedores",
        freq: "Diaria",
      },
      {
        id: "pl2",
        label: "Verificar vigencia del contrato de fumigación",
        freq: "Mensual",
      },
      {
        id: "pl3",
        label: "Sellado de grietas y puntos de ingreso",
        freq: "Semanal",
      },
      {
        id: "pl4",
        label: "Verificación de mallas y barreras físicas",
        freq: "Diaria",
      },
    ],
  },
  {
    id: "agua",
    titulo: "3. Abastecimiento de agua",
    norma: "Res. 2674/2013 Art. 6 · Decreto 1575/2007",
    extra: "cloro",
    checks: [
      {
        id: "ag1",
        label: "Presión y suministro de agua potable verificados",
        freq: "Al inicio del turno",
      },
      {
        id: "ag2",
        label: "Tanques y depósitos limpios (registrar última limpieza)",
        freq: "Semestral",
      },
      {
        id: "ag3",
        label: "Cloro residual en parámetros (0.3 – 2.0 mg/L)",
        freq: "Verificar con acueducto",
      },
    ],
  },
  {
    id: "personal",
    titulo: "4. Higiene del personal",
    norma: "Res. 2674/2013 Art. 10 · Res. 765/2010",
    checks: [
      {
        id: "pe1",
        label: "Todo el personal porta carnet de manipulación vigente",
        freq: "Verificar vigencia anual",
      },
      {
        id: "pe2",
        label: "Uso correcto de dotación: delantal, gorro, tapabocas",
        freq: "Durante toda la jornada",
      },
      {
        id: "pe3",
        label: "Lavado de manos con técnica correcta (20 seg)",
        freq: "Antes de manipular, después baño",
      },
      {
        id: "pe4",
        label: "Ningún manipulador con síntomas de enfermedad",
        freq: "Control diario al ingreso",
      },
    ],
  },
  {
    id: "residuos",
    titulo: "5. Manejo de residuos sólidos",
    norma: "Res. 2674/2013 Art. 29 · Res. 1045/2003 PGIRS",
    checks: [
      {
        id: "re1",
        label: "Residuos clasificados: orgánicos, reciclables, ordinarios",
        freq: "Durante todo el turno",
      },
      {
        id: "re2",
        label: "Recipientes con tapa, bolsa y debidamente marcados",
        freq: "Al inicio del turno",
      },
      {
        id: "re3",
        label: "Evacuación de residuos al final de la jornada",
        freq: "Diaria — obligatoria",
      },
      {
        id: "re4",
        label: "Área de almacenamiento temporal limpia y cerrada",
        freq: "Al final de cada turno",
      },
    ],
  },
  {
    id: "temp",
    titulo: "6. Control de temperaturas (HACCP)",
    norma: "Decreto 60/2002 — Cadena de frío · BPM",
    extra: "temps",
    checks: [
      {
        id: "te1",
        label: "Temperatura nevera en rango (0 – 4 °C)",
        freq: "Al inicio y fin del turno",
      },
      {
        id: "te2",
        label: "Temperatura congelador correcta (≤ −18 °C)",
        freq: "Al inicio y fin del turno",
      },
      {
        id: "te3",
        label: "Temperatura cocción carnes ≥ 75 °C",
        freq: "Cada preparación de proteína",
      },
    ],
  },
];

// ─── COMPONENTE ──────────────────────────────────────────────────────────────
function Saneamiento({ onSanFirmado }) {
  const [tabActivo, setTabActivo] = useState("plan");

  //  ── Guardado ──
  const [guardadoSalud, setGuardadoSalud] = useState(false);
  const [guardadoMateria, setGuardadoMateria] = useState(false);
  const [guardadoNevera, setGuardadoNevera] = useState(false);

  // ── Plan de saneamiento ──
  const [checks, setChecks] = useState({});
  const [observaciones, setObs] = useState({});
  const [cloro, setCloro] = useState("");
  const [tempNev, setTempNev] = useState("");
  const [tempCon, setTempCon] = useState("");
  const [firmado, setFirmado] = useState(false);
  const [firmaData, setFirmaData] = useState({
    nombre: "",
    cargo: "",
    cedula: "",
  });
  const [historial, setHistorial] = useState(HISTORIAL_INICIAL);
  const [errorFirma, setErrorFirma] = useState("");

  // ── Control de salud ──
  const [cargos, setCargos] = useState(CARGOS_INICIALES);
  const [editandoCargos, setEditandoCargos] = useState(false);
  const [cargosTemp, setCargosTemp] = useState([...CARGOS_INICIALES]);
  const [mesSalud, setMesSalud] = useState(MES_HOY);
  const [saludData, setSaludData] = useState({});

  // ── Control materia prima ──
  const [mesMateria, setMesMateria] = useState(MES_HOY);
  const [alimentos, setAlimentos] = useState(["Pollo", "Res", "Pescado"]);
  const [nuevoAlimento, setNuevoAlimento] = useState("");
  const [materiaData, setMateriaData] = useState({});

  // ── Control temperatura nevera ──
  const [mesTempNev, setMesTempNev] = useState(MES_HOY);
  const [productos, setProductos] = useState([
    "Pollo",
    "Res",
    "Pescado",
    "Lácteos",
  ]);
  const [nuevoProducto, setNuevoProducto] = useState("");
  const [tempNeveraData, setTempNeveraData] = useState({});

  //  Guardado
  const guardarSalud = () => {
    // TODO: aquí va la conexión a Firebase/base de datos
    // Por ahora guarda en localStorage
    localStorage.setItem(
      `salud-${mesSalud}-${ANIO_HOY}`,
      JSON.stringify(saludData),
    );
    setGuardadoSalud(true);
    setTimeout(() => setGuardadoSalud(false), 3000);
  };

  const guardarMateria = () => {
    localStorage.setItem(
      `materia-${mesMateria}-${ANIO_HOY}`,
      JSON.stringify(materiaData),
    );
    setGuardadoMateria(true);
    setTimeout(() => setGuardadoMateria(false), 3000);
  };

  const guardarNevera = () => {
    localStorage.setItem(
      `nevera-${mesTempNev}-${ANIO_HOY}`,
      JSON.stringify(tempNeveraData),
    );
    setGuardadoNevera(true);
    setTimeout(() => setGuardadoNevera(false), 3000);
  };



  // ─── PLAN SANEAMIENTO ────────────────────────────────────────────────────
  const totalChecks = SECCIONES.reduce((s, sec) => s + sec.checks.length, 0);
  const marcados = Object.values(checks).filter(Boolean).length;
  const pct = totalChecks > 0 ? Math.round((marcados / totalChecks) * 100) : 0;

  const estadoBadge = () => {
    if (firmado && pct === 100)
      return { label: "Completo", clase: "badge-green" };
    if (pct >= 60) return { label: "En progreso", clase: "badge-blue" };
    return { label: "Incompleto", clase: "badge-amber" };
  };

  const toggleCheck = (id) => {
    if (firmado) return;
    setChecks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const estadoCloro = () => {
    const v = parseFloat(cloro);
    if (!cloro) return null;
    if (v >= 0.3 && v <= 2.0)
      return { msg: "✓ Dentro del rango", color: "var(--green)" };
    return { msg: "⚠ Fuera del rango — revisar", color: "var(--red)" };
  };

  const firmar = () => {
    if (!firmaData.nombre.trim() || !firmaData.cargo.trim()) {
      setErrorFirma("Por favor ingresa nombre y cargo del responsable.");
      return;
    }
    if (
      pct < 80 &&
      !window.confirm(
        `El registro está al ${pct}%. ¿Desea firmar de todas formas?`,
      )
    )
      return;
    setErrorFirma("");
    setFirmado(true);
    const fechaHoy = new Date().toLocaleDateString("es-CO", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
    setHistorial((prev) => [
      { fecha: `Hoy ${fechaHoy}`, pct, resp: firmaData.nombre, firmado: true },
      ...prev,
    ]);
    onSanFirmado && onSanFirmado(pct);
  };

  const badgeHistorial = (h) => {
    if (h.alerta) return <span className="badge badge-red">No registrado</span>;
    if (h.pct === 100)
      return <span className="badge badge-green">100% completo</span>;
    if (h.pct >= 80)
      return <span className="badge badge-blue">{h.pct}% completo</span>;
    if (h.pct > 0)
      return <span className="badge badge-amber">{h.pct}% completo</span>;
    return <span className="badge badge-red">Pendiente</span>;
  };

  // ─── CONTROL DE SALUD ────────────────────────────────────────────────────
  const setSaludField = (dia, cargo, campo, valor) => {
    setSaludData((prev) => ({
      ...prev,
      [`${dia}-${cargo}-${campo}`]: valor,
    }));
  };

  const getSaludField = (dia, cargo, campo) =>
    saludData[`${dia}-${cargo}-${campo}`] || "";

  const guardarCargos = () => {
    setCargos(cargosTemp.filter((c) => c.trim()));
    setEditandoCargos(false);
  };

  // ─── CONTROL MATERIA PRIMA ───────────────────────────────────────────────
  const setMateriaField = (dia, campo, valor) => {
    setMateriaData((prev) => ({ ...prev, [`${dia}-${campo}`]: valor }));
  };
  const getMateriaField = (dia, campo) => materiaData[`${dia}-${campo}`] || "";

  const agregarAlimento = () => {
    if (nuevoAlimento.trim() && !alimentos.includes(nuevoAlimento.trim())) {
      setAlimentos((prev) => [...prev, nuevoAlimento.trim()]);
      setNuevoAlimento("");
    }
  };

  // ─── CONTROL TEMPERATURA NEVERA ──────────────────────────────────────────
  const setTempNeveraField = (producto, dia, valor) => {
    setTempNeveraData((prev) => ({ ...prev, [`${producto}-${dia}`]: valor }));
  };
  const getTempNeveraField = (producto, dia) =>
    tempNeveraData[`${producto}-${dia}`] || "";

  const colorTemp = (val) => {
    const v = parseFloat(val);
    if (!val) return "var(--text3)";
    if (v >= 0 && v <= 4) return "var(--green)";
    return "var(--red)";
  };

  const agregarProducto = () => {
    if (nuevoProducto.trim() && !productos.includes(nuevoProducto.trim())) {
      setProductos((prev) => [...prev, nuevoProducto.trim()]);
      setNuevoProducto("");
    }
  };

  // ─── ESTILOS COMUNES ─────────────────────────────────────────────────────
  const thStyle = {
    background: "var(--blue)",
    color: "white",
    padding: "8px 10px",
    fontSize: "11px",
    fontWeight: 600,
    textAlign: "center",
    border: "1px solid var(--border)",
    whiteSpace: "nowrap",
  };

  const tdStyle = {
    padding: "6px 8px",
    fontSize: "12px",
    border: "1px solid var(--border)",
    textAlign: "center",
    background: "var(--surface)",
  };

  const tdAltStyle = {
    ...tdStyle,
    background: "var(--blue-bg)",
    fontWeight: 500,
    textAlign: "left",
  };

  const inputTabla = (valor, onChange, tipo = "text", extra = {}) => (
    <input
      type={tipo}
      value={valor}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: "100%",
        padding: "3px 5px",
        border: "none",
        background: "transparent",
        fontSize: "12px",
        color: "var(--text)",
        textAlign: "center",
        outline: "none",
        ...extra,
      }}
    />
  );

  const selectTabla = (valor, onChange, opciones) => (
    <select
      value={valor}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: "100%",
        padding: "3px 2px",
        border: "none",
        background: "transparent",
        fontSize: "11px",
        color: "var(--text)",
        outline: "none",
        cursor: "pointer",
      }}
    >
      <option value="">—</option>
      {opciones.map((op) => (
        <option key={op} value={op}>
          {op}
        </option>
      ))}
    </select>
  );

  // ─── RENDER PLAN SANEAMIENTO ─────────────────────────────────────────────
  const renderPlan = () => (
    <div>
      <div className="san-header-bar">
        <div>
          <div className="san-title">
            Plan de Saneamiento — Res. 2674/2013 · Decreto 60/2002 (HACCP) · Ley
            9/1979
          </div>
          <div className="san-norm">
            Ministerio de Salud y Protección Social · Registro diario
            obligatorio BPM · INVIMA
          </div>
        </div>
        <div className="san-progress-wrap">
          <div
            style={{
              fontSize: "11px",
              color: "var(--blue)",
              marginRight: "4px",
            }}
          >
            Progreso:
          </div>
          <div className="san-progress-track">
            <div className="san-progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <div className="san-pct-text">{pct}%</div>
          <span className={`badge ${estadoBadge().clase}`}>
            {estadoBadge().label}
          </span>
        </div>
      </div>

      {firmado && (
        <div className="alert-row alert-green" style={{ marginBottom: "14px" }}>
          <div className="alert-dot alert-dot-green" />
          <span className="alert-text">
            Registro firmado por <strong>{firmaData.nombre}</strong> (
            {firmaData.cargo}) — {pct}% de cumplimiento.
          </span>
        </div>
      )}

      <div className="san-grid">
        {SECCIONES.map((sec) => (
          <div key={sec.id} className="san-section">
            <div className="san-section-title">{sec.titulo}</div>
            <span className="san-norm-tag">{sec.norma}</span>

            {sec.checks.map((ck) => (
              <label
                key={ck.id}
                className="check-row"
                style={{ cursor: firmado ? "not-allowed" : "pointer" }}
              >
                <input
                  type="checkbox"
                  checked={!!checks[ck.id]}
                  onChange={() => toggleCheck(ck.id)}
                  disabled={firmado}
                />
                <div>
                  <div className="check-label">{ck.label}</div>
                  <div className="check-freq">{ck.freq}</div>
                </div>
              </label>
            ))}

            {sec.extra === "cloro" && (
              <div style={{ margin: "6px 0" }}>
                <div className="temp-label">Cloro residual medido (mg/L)</div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <input
                    type="number"
                    className="temp-input"
                    placeholder="Ej: 0.8"
                    step="0.1"
                    min="0"
                    max="5"
                    value={cloro}
                    onChange={(e) => setCloro(e.target.value)}
                    disabled={firmado}
                    style={{ width: "100px" }}
                  />
                  {estadoCloro() && (
                    <span
                      style={{ fontSize: "11px", color: estadoCloro().color }}
                    >
                      {estadoCloro().msg}
                    </span>
                  )}
                </div>
              </div>
            )}

            {sec.extra === "temps" && (
              <div className="temp-inputs">
                <div>
                  <div className="temp-label">Temp. nevera (°C)</div>
                  <input
                    type="number"
                    className="temp-input"
                    placeholder="Ej: 3"
                    value={tempNev}
                    onChange={(e) => setTempNev(e.target.value)}
                    disabled={firmado}
                  />
                  {tempNev && (
                    <div
                      style={{
                        fontSize: "10px",
                        marginTop: "3px",
                        color:
                          parseFloat(tempNev) >= 0 && parseFloat(tempNev) <= 4
                            ? "var(--green)"
                            : "var(--red)",
                      }}
                    >
                      {parseFloat(tempNev) >= 0 && parseFloat(tempNev) <= 4
                        ? "✓ En rango"
                        : "⚠ Fuera de rango (0–4°C)"}
                    </div>
                  )}
                </div>
                <div>
                  <div className="temp-label">Temp. congelador (°C)</div>
                  <input
                    type="number"
                    className="temp-input"
                    placeholder="Ej: -20"
                    value={tempCon}
                    onChange={(e) => setTempCon(e.target.value)}
                    disabled={firmado}
                  />
                  {tempCon && (
                    <div
                      style={{
                        fontSize: "10px",
                        marginTop: "3px",
                        color:
                          parseFloat(tempCon) <= -18
                            ? "var(--green)"
                            : "var(--red)",
                      }}
                    >
                      {parseFloat(tempCon) <= -18
                        ? "✓ En rango"
                        : "⚠ Fuera de rango (≤ −18°C)"}
                    </div>
                  )}
                </div>
              </div>
            )}

            <textarea
              className="san-obs"
              placeholder={`Observaciones ${sec.titulo.toLowerCase()}...`}
              value={observaciones[sec.id] || ""}
              onChange={(e) =>
                setObs((prev) => ({ ...prev, [sec.id]: e.target.value }))
              }
              disabled={firmado}
            />
          </div>
        ))}
      </div>

      {/* Firma */}
      <div className="firma-section">
        <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "4px" }}>
          Firma y cierre del registro
        </div>
        <div
          style={{
            fontSize: "12px",
            color: "var(--text2)",
            marginBottom: "10px",
          }}
        >
          Registro con validez legal ante Secretaría Distrital de Salud e INVIMA
          (Ley 9/1979, Res. 2674/2013).
        </div>
        {!firmado ? (
          <>
            <div className="firma-inputs">
              <input
                type="text"
                className="input-field"
                placeholder="Nombre del responsable"
                value={firmaData.nombre}
                onChange={(e) =>
                  setFirmaData((prev) => ({ ...prev, nombre: e.target.value }))
                }
              />
              <input
                type="text"
                className="input-field"
                placeholder="Cargo"
                value={firmaData.cargo}
                onChange={(e) =>
                  setFirmaData((prev) => ({ ...prev, cargo: e.target.value }))
                }
              />
              <input
                type="text"
                className="input-field"
                placeholder="Cédula"
                value={firmaData.cedula}
                onChange={(e) =>
                  setFirmaData((prev) => ({ ...prev, cedula: e.target.value }))
                }
              />
              <button className="btn btn-accent" onClick={firmar}>
                Firmar y cerrar registro
              </button>
            </div>
            {errorFirma && (
              <div
                style={{
                  fontSize: "12px",
                  color: "var(--red)",
                  marginTop: "6px",
                }}
              >
                {errorFirma}
              </div>
            )}
          </>
        ) : (
          <div
            style={{
              padding: "10px 14px",
              background: "var(--green-bg)",
              borderRadius: "var(--r-sm)",
              borderLeft: "3px solid var(--green)",
            }}
          >
            <div
              style={{
                fontSize: "13px",
                fontWeight: 500,
                color: "var(--green)",
              }}
            >
              ✓ Firmado por {firmaData.nombre} ({firmaData.cargo})
              {firmaData.cedula ? ` — CC ${firmaData.cedula}` : ""} —{" "}
              {new Date().toLocaleString("es-CO", {
                day: "2-digit",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              — Cumplimiento: {pct}%
            </div>
          </div>
        )}
      </div>

      {/* Historial */}
      <div className="san-historial">
        <div className="card-title">Historial de la semana</div>
        {historial.map((h, i) => (
          <div key={i} className="historial-row">
            <span className="hist-fecha">{h.fecha}</span>
            <span className="hist-resp" style={{ color: "var(--text3)" }}>
              {h.resp}
            </span>
            {badgeHistorial(h)}
          </div>
        ))}
      </div>
    </div>
  );

  // ─── RENDER CONTROL DE SALUD ─────────────────────────────────────────────
  const renderSalud = () => (
    <div>
      {/* Encabezado */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        <div>
          <div style={{ fontSize: "16px", fontWeight: 600 }}>
            Control de Salud Diario
          </div>
          <div style={{ fontSize: "11px", color: "var(--text3)" }}>
            Res. 2674/2013 Art. 10 · Res. 765/2010 — Higiene del personal
            manipulador
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <select
            className="input-field"
            style={{ width: "auto" }}
            value={mesSalud}
            onChange={(e) => setMesSalud(parseInt(e.target.value))}
          >
            {MESES.map((m, i) => (
              <option key={i} value={i}>
                {m} {ANIO_HOY}
              </option>
            ))}
          </select>
          <button
            className="btn btn-sm"
            onClick={() => {
              setCargosTemp([...cargos]);
              setEditandoCargos(true);
            }}
          >
            ✎ Editar cargos
          </button>

          {/* ── BOTÓN GUARDAR ── */}
          {guardadoSalud ? (
            <span className="badge badge-green">✓ Guardado</span>
          ) : (
            <button className="btn btn-accent btn-sm" onClick={guardarSalud}>
              💾 Guardar cambios
            </button>
          )}
        </div>
      </div>

      {/* Modal editar cargos */}
      {editandoCargos && (
        <div className="modal-overlay open">
          <div className="modal-box">
            <div className="modal-title">Editar cargos del personal</div>
            <div className="modal-sub">
              Agrega, edita o elimina los cargos del equipo
            </div>
            {cargosTemp.map((c, i) => (
              <div
                key={i}
                style={{ display: "flex", gap: "8px", marginBottom: "8px" }}
              >
                <input
                  type="text"
                  className="input-field"
                  value={c}
                  onChange={(e) =>
                    setCargosTemp((prev) =>
                      prev.map((p, j) => (j === i ? e.target.value : p)),
                    )
                  }
                />
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() =>
                    setCargosTemp((prev) => prev.filter((_, j) => j !== i))
                  }
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              className="btn btn-sm"
              style={{ marginBottom: "12px" }}
              onClick={() => setCargosTemp((prev) => [...prev, ""])}
            >
              + Agregar cargo
            </button>
            <div className="modal-footer">
              <button className="btn" onClick={() => setEditandoCargos(false)}>
                Cancelar
              </button>
              <button className="btn btn-accent" onClick={guardarCargos}>
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabla */}
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "12px",
          }}
        >
          <thead>
            <tr>
              <th style={{ ...thStyle, width: "40px" }}>Día</th>
              <th style={thStyle}>Nombre del empleado</th>
              <th style={{ ...thStyle, width: "50px" }}>Síntomas SI</th>
              <th style={{ ...thStyle, width: "50px" }}>Síntomas NO</th>
              <th style={thStyle}>Síntomas observados</th>
              <th style={thStyle}>Acciones tomadas</th>
              <th style={thStyle}>Firma del empleado</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: DIAS_MES }, (_, dIdx) => {
              const dia = dIdx + 1;
              const esDiaHoy = dia === DIA_HOY && mesSalud === MES_HOY;
              return cargos.map((cargo, cIdx) => (
                <tr
                  key={`${dia}-${cargo}`}
                  style={{
                    background: esDiaHoy
                      ? "var(--accent2)"
                      : dIdx % 2 === 0
                        ? "var(--surface)"
                        : "var(--surface2)",
                  }}
                >
                  {cIdx === 0 && (
                    <td
                      rowSpan={cargos.length}
                      style={{
                        ...tdStyle,
                        fontWeight: 700,
                        color: esDiaHoy ? "var(--accent)" : "var(--text)",
                        verticalAlign: "middle",
                        background: esDiaHoy
                          ? "var(--accent2)"
                          : "var(--blue-bg)",
                        fontSize: "13px",
                      }}
                    >
                      {dia}
                      {esDiaHoy && (
                        <div
                          style={{ fontSize: "9px", color: "var(--accent)" }}
                        >
                          HOY
                        </div>
                      )}
                    </td>
                  )}
                  <td style={tdAltStyle}>{cargo}</td>
                  <td style={tdStyle}>
                    <input
                      type="checkbox"
                      checked={getSaludField(dia, cargo, "si") === "true"}
                      onChange={(e) => {
                        setSaludField(
                          dia,
                          cargo,
                          "si",
                          e.target.checked ? "true" : "",
                        );
                        if (e.target.checked)
                          setSaludField(dia, cargo, "no", "");
                      }}
                      style={{
                        accentColor: "var(--red)",
                        width: "16px",
                        height: "16px",
                        cursor: "pointer",
                      }}
                    />
                  </td>
                  <td style={tdStyle}>
                    <input
                      type="checkbox"
                      checked={getSaludField(dia, cargo, "no") === "true"}
                      onChange={(e) => {
                        setSaludField(
                          dia,
                          cargo,
                          "no",
                          e.target.checked ? "true" : "",
                        );
                        if (e.target.checked)
                          setSaludField(dia, cargo, "si", "");
                      }}
                      style={{
                        accentColor: "var(--green)",
                        width: "16px",
                        height: "16px",
                        cursor: "pointer",
                      }}
                    />
                  </td>
                  <td style={tdStyle}>
                    {inputTabla(getSaludField(dia, cargo, "sintomas"), (v) =>
                      setSaludField(dia, cargo, "sintomas", v),
                    )}
                  </td>
                  <td style={tdStyle}>
                    {inputTabla(getSaludField(dia, cargo, "acciones"), (v) =>
                      setSaludField(dia, cargo, "acciones", v),
                    )}
                  </td>
                  <td style={tdStyle}>
                    {inputTabla(getSaludField(dia, cargo, "firma"), (v) =>
                      setSaludField(dia, cargo, "firma", v),
                    )}
                  </td>
                </tr>
              ));
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ─── RENDER CONTROL MATERIA PRIMA ────────────────────────────────────────
const renderMateriaPrima = () => (
  <div>
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "16px",
        flexWrap: "wrap",
        gap: "10px",
      }}
    >
      <div>
        <div style={{ fontSize: "16px", fontWeight: 600 }}>
          Control de Materia Prima
        </div>
        <div style={{ fontSize: "11px", color: "var(--text3)" }}>
          Res. 2674/2013 — Control de calidad en recepción de alimentos
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: "8px",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        {/* Selector de mes */}
        <select
          className="input-field"
          style={{ width: "auto" }}
          value={mesMateria}
          onChange={(e) => setMesMateria(parseInt(e.target.value))}
        >
          {MESES.map((m, i) => (
            <option key={i} value={i}>
              {m} {ANIO_HOY}
            </option>
          ))}
        </select>

        {/* Agregar alimento */}
        <div style={{ display: "flex", gap: "6px" }}>
          <input
            type="text"
            className="input-field"
            placeholder="Nuevo alimento"
            value={nuevoAlimento}
            onChange={(e) => setNuevoAlimento(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && agregarAlimento()}
            style={{ width: "140px" }}
          />
          <button className="btn btn-accent btn-sm" onClick={agregarAlimento}>
            + Agregar
          </button>
        </div>

        {/* Botón guardar */}
        {guardadoMateria ? (
          <span className="badge badge-green">✓ Guardado</span>
        ) : (
          <button className="btn btn-accent btn-sm" onClick={guardarMateria}>
            💾 Guardar cambios
          </button>
        )}
      </div>
    </div>

    <div style={{ overflowX: "auto" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "12px",
        }}
      >
        <thead>
          <tr>
            <th style={{ ...thStyle, width: "40px" }}>Día</th>
            <th style={{ ...thStyle, width: "120px" }}>Alimento</th>
            <th style={{ ...thStyle, width: "90px" }}>Temperatura</th>
            <th style={thStyle}>Proveedor</th>
            <th style={{ ...thStyle, width: "80px" }}>Cantidad</th>
            <th style={{ ...thStyle, width: "80px" }}>Textura</th>
            <th style={{ ...thStyle, width: "70px" }}>Olor</th>
            <th style={{ ...thStyle, width: "70px" }}>Sabor</th>
            <th style={thStyle}>Observaciones</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: DIAS_MES }, (_, dIdx) => {
            const dia = dIdx + 1;
            const esDiaHoy = dia === DIA_HOY && mesMateria === MES_HOY;
            return (
              <tr
                key={dia}
                style={{
                  background: esDiaHoy
                    ? "var(--accent2)"
                    : dIdx % 2 === 0
                      ? "var(--surface)"
                      : "var(--surface2)",
                }}
              >
                <td
                  style={{
                    ...tdStyle,
                    fontWeight: 700,
                    color: esDiaHoy ? "var(--accent)" : "var(--text)",
                    background: esDiaHoy
                      ? "var(--accent2)"
                      : "var(--blue-bg)",
                  }}
                >
                  {dia}
                  {esDiaHoy && (
                    <div style={{ fontSize: "9px", color: "var(--accent)" }}>
                      HOY
                    </div>
                  )}
                </td>
                <td style={tdStyle}>
                  <select
                    value={getMateriaField(dia, "alimento")}
                    onChange={(e) =>
                      setMateriaField(dia, "alimento", e.target.value)
                    }
                    style={{
                      width: "100%",
                      border: "none",
                      background: "transparent",
                      fontSize: "12px",
                      color: "var(--text)",
                      outline: "none",
                      cursor: "pointer",
                    }}
                  >
                    <option value="">—</option>
                    {alimentos.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </td>
                <td
                  style={{
                    ...tdStyle,
                    color: colorTemp(getMateriaField(dia, "temperatura")),
                  }}
                >
                  {inputTabla(
                    getMateriaField(dia, "temperatura"),
                    (v) => setMateriaField(dia, "temperatura", v),
                    "number",
                  )}
                </td>
                <td style={tdStyle}>
                  {inputTabla(
                    getMateriaField(dia, "proveedor"),
                    (v) => setMateriaField(dia, "proveedor", v),
                  )}
                </td>
                <td style={tdStyle}>
                  {inputTabla(
                    getMateriaField(dia, "cantidad"),
                    (v) => setMateriaField(dia, "cantidad", v),
                    "number",
                  )}
                </td>
                <td style={tdStyle}>
                  {selectTabla(
                    getMateriaField(dia, "textura"),
                    (v) => setMateriaField(dia, "textura", v),
                    OPCIONES_CALIDAD,
                  )}
                </td>
                <td style={tdStyle}>
                  {selectTabla(
                    getMateriaField(dia, "olor"),
                    (v) => setMateriaField(dia, "olor", v),
                    OPCIONES_CALIDAD,
                  )}
                </td>
                <td style={tdStyle}>
                  {selectTabla(
                    getMateriaField(dia, "sabor"),
                    (v) => setMateriaField(dia, "sabor", v),
                    OPCIONES_CALIDAD,
                  )}
                </td>
                <td style={tdStyle}>
                  {inputTabla(
                    getMateriaField(dia, "observaciones"),
                    (v) => setMateriaField(dia, "observaciones", v),
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
);

  // ─── RENDER CONTROL TEMPERATURA NEVERA ───────────────────────────────────
  const renderTempNevera = () => (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        <div>
          <div style={{ fontSize: "16px", fontWeight: 600 }}>
            Control de Temperatura de la Nevera
          </div>
          <div style={{ fontSize: "11px", color: "var(--text3)" }}>
            Decreto 60/2002 HACCP — Rango permitido: 0°C a 4°C · Valores fuera
            de rango se marcan en rojo
          </div>
        </div>
        <div
          style={{
            display: "flex",
            gap: "8px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <select
            className="input-field"
            style={{ width: "auto" }}
            value={mesTempNev}
            onChange={(e) => setMesTempNev(parseInt(e.target.value))}
          >
            {MESES.map((m, i) => (
              <option key={i} value={i}>
                {m} {ANIO_HOY}
              </option>
            ))}
          </select>
          <div style={{ display: "flex", gap: "6px" }}>
            <input
              type="text"
              className="input-field"
              placeholder="Nuevo producto"
              value={nuevoProducto}
              onChange={(e) => setNuevoProducto(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && agregarProducto()}
              style={{ width: "140px" }}
            />
            <button className="btn btn-accent btn-sm" onClick={agregarProducto}>
              + Agregar
            </button>
          </div>
        </div>
      </div>

      {/* Leyenda */}
      <div
        style={{
          display: "flex",
          gap: "16px",
          marginBottom: "12px",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "11px",
          }}
        >
          <div
            style={{
              width: "12px",
              height: "12px",
              background: "var(--green)",
              borderRadius: "2px",
            }}
          />
          <span>En rango (0–4°C)</span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "11px",
          }}
        >
          <div
            style={{
              width: "12px",
              height: "12px",
              background: "var(--red)",
              borderRadius: "2px",
            }}
          />
          <span>Fuera de rango</span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "11px",
          }}
        >
          <div
            style={{
              width: "12px",
              height: "12px",
              background: "var(--accent2)",
              borderRadius: "2px",
              border: "1px solid var(--accent)",
            }}
          />
          <span>Día actual</span>
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "11px",
          }}
        >
          <thead>
            <tr>
              <th style={{ ...thStyle, width: "120px", textAlign: "left" }}>
                Producto
              </th>
              {Array.from({ length: DIAS_MES }, (_, i) => (
                <th
                  key={i + 1}
                  style={{
                    ...thStyle,
                    width: "32px",
                    background:
                      i + 1 === DIA_HOY && mesTempNev === MES_HOY
                        ? "var(--accent)"
                        : "var(--blue)",
                    padding: "8px 4px",
                  }}
                >
                  {i + 1}
                </th>
              ))}
              <th style={{ ...thStyle, width: "32px" }}>
                <button
                  className="btn btn-danger btn-sm"
                  style={{ fontSize: "9px", padding: "1px 4px" }}
                >
                  ✕
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {productos.map((producto, pIdx) => (
              <tr
                key={producto}
                style={{
                  background:
                    pIdx % 2 === 0 ? "var(--surface)" : "var(--surface2)",
                }}
              >
                <td style={{ ...tdAltStyle, fontSize: "12px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span>{producto}</span>
                    <button
                      onClick={() =>
                        setProductos((prev) =>
                          prev.filter((p) => p !== producto),
                        )
                      }
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--red)",
                        cursor: "pointer",
                        fontSize: "11px",
                      }}
                    >
                      ✕
                    </button>
                  </div>
                </td>
                {Array.from({ length: DIAS_MES }, (_, dIdx) => {
                  const dia = dIdx + 1;
                  const val = getTempNeveraField(producto, dia);
                  const vNum = parseFloat(val);
                  const esDiaHoy = dia === DIA_HOY && mesTempNev === MES_HOY;
                  const fueraRango = val && (vNum < 0 || vNum > 4);
                  return (
                    <td
                      key={dia}
                      style={{
                        ...tdStyle,
                        background: esDiaHoy
                          ? "var(--accent2)"
                          : fueraRango
                            ? "var(--red-bg)"
                            : "inherit",
                        padding: "2px",
                      }}
                    >
                      <input
                        type="number"
                        value={val}
                        onChange={(e) =>
                          setTempNeveraField(producto, dia, e.target.value)
                        }
                        style={{
                          width: "100%",
                          border: "none",
                          background: "transparent",
                          fontSize: "11px",
                          textAlign: "center",
                          outline: "none",
                          color: fueraRango
                            ? "var(--red)"
                            : val
                              ? "var(--green)"
                              : "var(--text3)",
                          fontWeight: fueraRango ? 700 : 400,
                        }}
                        placeholder="—"
                      />
                    </td>
                  );
                })}
                <td style={tdStyle} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ─── RETURN PRINCIPAL ────────────────────────────────────────────────────
  return (
    <div className="main active fade-in" id="tab-saneamiento">
      {/* Tabs internos */}
      <div
        style={{
          display: "flex",
          gap: "2px",
          background: "var(--surface2)",
          borderRadius: "var(--r-md)",
          padding: "3px",
          marginBottom: "18px",
          flexWrap: "wrap",
        }}
      >
        {[
          { id: "plan", label: "📋 Plan de saneamiento" },
          { id: "salud", label: "🩺 Control de salud diario" },
          { id: "materia", label: "🥩 Control de materia prima" },
          { id: "nevera", label: "🌡 Control temperatura nevera" },
        ].map((tab) => (
          <button
            key={tab.id}
            className={`nav-btn ${tabActivo === tab.id ? "active" : ""}`}
            onClick={() => setTabActivo(tab.id)}
            style={{ flex: 1, minWidth: "180px" }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {tabActivo === "plan" && renderPlan()}
      {tabActivo === "salud" && renderSalud()}
      {tabActivo === "materia" && renderMateriaPrima()}
      {tabActivo === "nevera" && renderTempNevera()}
    </div>
  );
}

export default Saneamiento;
