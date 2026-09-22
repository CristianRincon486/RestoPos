import React from 'react';

function Topbar({ activeTab, setTab, toggleTheme, toggleAlertas, dark, clock, dateDisplay }) {
  return (
    <div className="topbar">
      <div className="topbar-left">
        <div className="logo">
          <div className="logo-dot"></div>
          Restaurante La Bahía
          <span className="logo-sub">v1</span>
        </div>
        <nav className="nav">
          {[
            { id: 'dashboard', icon: '◼', label: 'Dashboard' },
            { id: 'caja',      icon: '◈', label: 'Caja' },
            { id: 'inventario',  icon: '◎', label: 'Inventario' },
            { id: 'saneamiento', icon: '◍', label: 'Saneamiento' },
          ].map(tab => (
            <button
              key={tab.id}
              className={`nav-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setTab(tab.id)}
              data-tab={tab.id}
            >
              <span className="nav-icon">{tab.icon}</span> {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="topbar-right">
        <div className="date-display">{dateDisplay}</div>
        <div className="clock">{clock}</div>
        <button className="notif-btn" onClick={toggleAlertas} title="Alertas">
          ⚑ <span className="notif-dot" id="notif-dot"></span>
        </button>
        <button className="theme-btn" onClick={toggleTheme}>
          <span>{dark ? '☀' : '☾'}</span>
          <span>{dark ? 'Modo día' : 'Modo noche'}</span>
        </button>
      </div>
    </div>
  );
}

export default Topbar;