import React, { useState, useRef, useEffect } from "react";

export default function AIChatBox({ onActions, getCarContext, busy }) {
  const [prompt, setPrompt] = useState("");
  const [history, setHistory] = useState([]);
  const [aiTyping, setAiTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, aiTyping]);

  const sendPrompt = async (e) => {
    e?.preventDefault?.();
    if (!prompt.trim() || busy) return;

    const userMsg = { role: "user", content: prompt };
    setHistory((h) => [...h, userMsg]);
    setAiTyping(true);

    try {
      // 🔍 Detect part creation (keywords like "add exhaust" or "create spoiler")
      const isPartCreation = /(add|create|build|make).*(part|exhaust|spoiler|wheel|door|hood|bumper|roof|mirror)/i.test(prompt);

      const endpoint = isPartCreation
        ? `${process.env.REACT_APP_API_URL}/api/part/create`
        : `${process.env.REACT_APP_API_URL}/api/ai/interpret`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, carContext: getCarContext?.() }),
      });

      if (!res.ok) throw new Error("Server error");

      if (isPartCreation) {
        // 🧱 Expect GLB blob for new 3D part
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setHistory((h) => [
          ...h,
          { role: "assistant", content: "✅ New 3D part generated and attached to your car!" },
        ]);
        onActions?.([{ type: "LOAD_NEW_PART", parameters: { url } }]);
      } else {
        // ⚙️ Interpret modification commands
        const data = await res.json();
        if (data?.success && Array.isArray(data.actions)) {
          setHistory((h) => [
            ...h,
            { role: "assistant", content: `✅ Applied ${data.actions.length} change(s)!` },
          ]);
          onActions?.(data.actions);
        } else {
          setHistory((h) => [
            ...h,
            { role: "assistant", content: "⚠️ I couldn’t understand that." },
          ]);
        }
      }
    } catch (err) {
      console.error(err);
      setHistory((h) => [
        ...h,
        { role: "assistant", content: "❌ AI connection error." },
      ]);
    } finally {
      setPrompt("");
      setAiTyping(false);
    }
  };

  return (
    <div
      style={styles.wrap}
      onMouseDown={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
    >
      <div style={styles.header}>
        <span>🤖 AI Mechanic</span>
        {busy && <span style={styles.loadingDot}>⏳</span>}
      </div>

      <div style={styles.chat}>
        {history.length === 0 && (
          <div style={styles.placeholder}>
            💡 Try: “Make it matte black with cyan neon”<br />
            or “Add a chrome exhaust that shoots fire 🔥”
          </div>
        )}
        {history.map((msg, i) => (
          <div key={i} style={msg.role === "user" ? styles.userMsg : styles.aiMsg}>
            <div style={styles.msgText}>{msg.content}</div>
          </div>
        ))}
        {aiTyping && (
          <div style={styles.aiMsg}>
            <div style={styles.typingDots}>
              <span>.</span><span>.</span><span>.</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={sendPrompt} style={styles.form}>
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Type a command for your car..."
          style={styles.input}
          disabled={busy}
        />
        <button type="submit" style={styles.btn} disabled={busy || !prompt.trim()}>
          {busy ? "..." : "🚀"}
        </button>
      </form>
    </div>
  );
}

/* ✨ STYLES ✨ */
const neon = (color) => ({
  textShadow: `0 0 6px ${color}, 0 0 12px ${color}, 0 0 24px ${color}`,
});

const styles = {
  wrap: {
    position: "absolute",
    bottom: 30,
    right: 30,
    width: 420,
    height: 560,
    display: "flex",
    flexDirection: "column",
    backdropFilter: "blur(20px)",
    background: "linear-gradient(180deg, rgba(15,17,25,0.85), rgba(10,10,18,0.95))",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 20,
    boxShadow: "0 0 40px rgba(0,200,255,0.15)",
    fontFamily: "'Orbitron', sans-serif",
    zIndex: 50,
  },

  header: {
    padding: "14px 18px",
    color: "#7fe9ff",
    fontWeight: 800,
    fontSize: 18,
    letterSpacing: 0.8,
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    ...neon("#00bfff"),
  },

  loadingDot: { fontSize: 16, animation: "pulse 1s infinite" },

  chat: {
    flex: 1,
    overflowY: "auto",
    padding: "12px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },

  placeholder: {
    color: "#999",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 1.5,
    marginTop: 30,
  },

  aiMsg: {
    alignSelf: "flex-start",
    background: "rgba(0,180,255,0.1)",
    border: "1px solid rgba(0,180,255,0.25)",
    borderRadius: "14px 14px 14px 4px",
    padding: "10px 14px",
    maxWidth: "85%",
    color: "#bdefff",
    fontSize: 14,
    ...neon("#00bfff"),
  },

  typingDots: {
    display: "flex",
    gap: 4,
    fontSize: 18,
    animation: "blink 1.2s infinite ease-in-out",
  },

  userMsg: {
    alignSelf: "flex-end",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: "14px 14px 4px 14px",
    padding: "10px 14px",
    maxWidth: "85%",
    color: "#fff",
    fontSize: 14,
  },

  msgText: { whiteSpace: "pre-wrap", lineHeight: 1.5 },

  form: {
    display: "flex",
    gap: 8,
    padding: 12,
    borderTop: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(0,0,0,0.2)",
  },

  input: {
    flex: 1,
    padding: "12px 14px",
    borderRadius: 12,
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "#fff",
    fontSize: 14,
    outline: "none",
    fontFamily: "'Orbitron', sans-serif",
  },

  btn: {
    padding: "12px 16px",
    borderRadius: 12,
    background: "linear-gradient(135deg,#00e6ff,#0077ff)",
    color: "#111",
    border: "none",
    cursor: "pointer",
    fontWeight: 900,
    transition: "all 0.2s ease",
  },
};
