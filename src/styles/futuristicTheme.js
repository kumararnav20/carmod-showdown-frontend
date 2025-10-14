// src/styles/futuristicTheme.js
// 💫 Premium Futuristic Theme for CarMod Showdown

const futuristicTheme = {
  // 🖤 Backgrounds
  background: {
    main: "radial-gradient(circle at 20% 20%, #0a0a12 0%, #000000 100%)",
    panel: "rgba(20, 25, 45, 0.8)",
    overlay: "rgba(0, 0, 0, 0.9)",
    glass: "rgba(10, 10, 25, 0.75)",
  },

  // 💡 Text Colors
  text: {
    primary: "#ffffff",
    secondary: "#a0a8c0",
    accent: "#00eaff",
    danger: "#ff3366",
    success: "#00ff88",
    warning: "#ffc107",
  },

  // 🔳 Borders & Shadows
  border: {
    neonCyan: "1px solid rgba(0, 255, 255, 0.6)",
    neonPurple: "1px solid rgba(156, 39, 176, 0.6)",
    neonOrange: "1px solid rgba(255, 152, 0, 0.6)",
    glassEdge: "1px solid rgba(255, 255, 255, 0.05)",
  },

  // 🧊 Panels
  panelStyle: {
    background: "rgba(10, 10, 25, 0.85)",
    backdropFilter: "blur(14px)",
    border: "1px solid rgba(0, 255, 255, 0.25)",
    boxShadow: "0 0 25px rgba(0, 255, 255, 0.1)",
    borderRadius: "16px",
    padding: "30px",
  },

  // 🎮 Neon Button
  neonButton: (color = "#00eaff") => ({
    padding: "20px 40px",
    fontSize: "22px",
    fontWeight: "900",
    borderRadius: "14px",
    border: `1px solid ${color}`,
    color: "#fff",
    background: `linear-gradient(135deg, ${color}33, ${color}11)`,
    boxShadow: `0 0 12px ${color}55`,
    cursor: "pointer",
    transition: "0.3s all ease",
    textTransform: "uppercase",
  }),

  // 🌌 Hover Effect
  neonHover: (e, color = "#00eaff") => {
    e.currentTarget.style.boxShadow = `0 0 30px ${color}`;
    e.currentTarget.style.transform = "scale(1.05)";
  },
  neonUnhover: (e) => {
    e.currentTarget.style.boxShadow = "";
    e.currentTarget.style.transform = "scale(1)";
  },

  // ⚡ HUD (bottom info bar)
  hudBar: {
    background: "rgba(10, 20, 30, 0.8)",
    borderTop: "1px solid rgba(0, 255, 255, 0.2)",
    boxShadow: "0 -2px 20px rgba(0, 255, 255, 0.05)",
    backdropFilter: "blur(8px)",
    borderRadius: "12px",
    color: "#00eaff",
    fontWeight: "800",
    fontFamily: "'Orbitron', sans-serif",
  },

  // 🧠 Debug Console
  hudBadge: {
    background: "rgba(0, 255, 255, 0.1)",
    border: "1px solid rgba(0, 255, 255, 0.3)",
    color: "#00ffff",
    boxShadow: "0 0 20px rgba(0, 255, 255, 0.2)",
    fontFamily: "'Rajdhani', monospace",
    borderRadius: "12px",
    fontWeight: "700",
  },

  // 🎬 Loading Overlay
  loadingScreen: {
    background: "rgba(5, 10, 20, 0.95)",
    border: "1px solid rgba(0, 255, 255, 0.3)",
    color: "#00eaff",
    boxShadow: "0 0 25px rgba(0, 255, 255, 0.2)",
    fontFamily: "'Orbitron', sans-serif",
  },
};

export default futuristicTheme;
