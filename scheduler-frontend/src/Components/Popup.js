import React from "react";

const Popup = ({ open, message, onClose }) => {
  if (!open) return null;
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
      background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999
    }}>
      <div style={{
        background: "#fff", padding: 24, borderRadius: 8, minWidth: 300, boxShadow: "0 2px 16px rgba(0,0,0,0.2)"
      }}>
        <div style={{ marginBottom: 16 }}>{message}</div>
        <button onClick={onClose} style={{ padding: "6px 18px" }}>Fechar</button>
      </div>
    </div>
  );
};

export default Popup;