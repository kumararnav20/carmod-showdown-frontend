// src/components/AIChatBox.jsx
import React, { useState } from "react";

export default function AIChatBox({ onActions, getCarContext, busy }) {
  const [prompt, setPrompt] = useState("");
  const [history, setHistory] = useState([]);

  const sendPrompt = async (e) => {
    e?.preventDefault?.();
    if (!prompt.trim() || busy) return;
    const you = { role: "user", content: prompt };
    setHistory((h) => [...h, you]);

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/ai/parse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, carContext: getCarContext?.() }),
      });
      const data = await res.json();
      if (data?.success && Array.isArray(data.actions)) {
        setHistory((h) => [...h, { role: "assistant", content: `✅ Applied ${data.actions.length} change(s).` }]);
        onActions?.(data.actions);
      } else {
        setHistory((h) => [...h, { role: "assistant", content: "⚠️ I couldn't parse that." }]);
      }
    } catch (err) {
      console.error(err);
      setHistory((h) => [...h, { role: "assistant", content: "❌ Error talking to AI." }]);
    } finally {
      setPrompt("");
    }
  };

  return (
    <div style={styles.panel} onMouseDown={(e)=>e.stopPropagation()} onWheel={(e)=>e.stopPropagation()}>
      <div style={styles.header}>🤖 AI Mechanic</div>
      <div style={styles.history}>
        {history.length === 0 ? (
          <div style={{ color: "#889", fontSize: 14 }}>
            Try: “Make the roof matte black and add sport rims”<br/>Or: “Add cyan underglow and darken windows”
          </div>
        ) : history.map((m, i) => (
          <div key={i} style={{ ...styles.msg, background: m.role==="user"?"#131622":"#0d1018", borderColor: m.role==="user"?"#2d3b8c":"#20304d" }}>
            <div style={{ fontSize: 12, opacity: .7, marginBottom: 4 }}>{m.role === "user" ? "You" : "AI"}</div>
            <div>{m.content}</div>
          </div>
        ))}
      </div>

      <form onSubmit={sendPrompt} style={styles.form}>
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder='Describe a change… e.g. "metallic yellow body, neon blue underglow"'
          style={styles.input}
          disabled={busy}
        />
        <button type="submit" style={styles.btn} disabled={busy || !prompt.trim()}>
          {busy ? "…" : "Apply"}
        </button>
      </form>
    </div>
  );
}

const styles = {
  panel: {
    width: 420, height: 560, position: "absolute", right: 20, bottom: 20,
    background: "rgba(10,12,20,0.9)", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16, backdropFilter: "blur(10px)", padding: 16, zIndex: 50,
    display: "flex", flexDirection: "column", boxShadow: "0 12px 40px rgba(0,0,0,0.5)"
  },
  header: { color: "#8ab4ff", fontWeight: 900, letterSpacing: .6, fontSize: 18, marginBottom: 8 },
  history: { flex: 1, overflowY: "auto", padding: "8px 4px", display: "grid", gap: 8 },
  msg: { border: "1px solid", borderRadius: 10, padding: "10px 12px", color: "#fff", fontSize: 14, lineHeight: 1.35 },
  form: { display: "flex", gap: 8, marginTop: 8 },
  input: {
    flex: 1, padding: "12px 14px", borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.12)", outline: "none",
    background: "rgba(255,255,255,0.06)", color: "#fff", fontSize: 14
  },
  btn: {
    padding: "12px 16px", borderRadius: 10, border: "none",
    background: "linear-gradient(135deg,#00f2fe,#4facfe)", color: "#111",
    fontWeight: 900, cursor: "pointer"
  }
};
