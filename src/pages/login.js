import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.userId);
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
          navigate("/");
        }, 1500);
      } else setError(data.message || "Login failed");
    } catch (err) {
      console.error(err);
      setError("Connection error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* 🎥 Background video */}
      <video
        key="nfs-bg"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        style={styles.video}
      >
        <source src="/nfs_bg.mp4" type="video/mp4" />
        Your browser does not support video.
      </video>

      {/* 🕶 Overlay */}
      <div style={styles.overlay} />

      {/* ✅ Toast */}
      {showToast && <div style={styles.toast}>✅ Welcome Back!</div>}

      {/* 💎 Glass Form */}
      <div style={styles.card}>
        <h2 style={styles.title}>🏎️ CarMod Showdown</h2>
        <p style={styles.subtitle}>Enter the Cyber Garage</p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />

          <button type="submit" disabled={isLoading} style={styles.button}>
            {isLoading ? "⏳ Logging in..." : "🚀 Login"}
          </button>
        </form>

        {error && <p style={styles.error}>❌ {error}</p>}

        <div style={styles.bottomText}>
          Don’t have an account?{" "}
          <button onClick={() => navigate("/register")} style={styles.linkBtn}>
            Register here
          </button>
        </div>
      </div>

      <style>
        {`
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(-20px); }
          20%,80% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-20px); }
        }
        @keyframes neonPulse {
          0%,100% { box-shadow: 0 0 20px rgba(0,242,254,0.4); }
          50% { box-shadow: 0 0 35px rgba(79,172,254,0.7); }
        }
      `}
      </style>
    </div>
  );
}

/* =========================
   🎨 Styles
========================= */
const styles = {
  page: {
    position: "relative",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    overflow: "hidden",
    fontFamily: "'Orbitron', sans-serif",
  },
  video: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    zIndex: -2,
  },
  overlay: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(135deg,rgba(0,0,0,0.85) 20%,rgba(10,10,15,0.9) 80%)",
    backdropFilter: "blur(6px)",
    zIndex: -1,
  },
  toast: {
    position: "absolute",
    top: "40px",
    background: "linear-gradient(135deg,#4caf50,#2e7d32)",
    color: "white",
    padding: "16px 28px",
    borderRadius: "10px",
    fontSize: "18px",
    fontWeight: "700",
    boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
    animation: "fadeInOut 1.5s ease forwards",
  },
  card: {
    background: "rgba(255,255,255,0.08)",
    padding: "50px 40px",
    borderRadius: "20px",
    boxShadow: "0 10px 50px rgba(0,0,0,0.6)",
    border: "1px solid rgba(255,255,255,0.15)",
    width: "90%",
    maxWidth: "420px",
    textAlign: "center",
    backdropFilter: "blur(12px)",
  },
  title: {
    fontSize: "34px",
    fontWeight: "900",
    marginBottom: "10px",
    background: "linear-gradient(135deg,#00f2fe,#4facfe)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  subtitle: {
    color: "#aaa",
    fontSize: "16px",
    marginBottom: "30px",
    letterSpacing: "1px",
  },
  input: {
    width: "100%",
    padding: "14px",
    margin: "10px 0",
    borderRadius: "10px",
    border: "none",
    fontSize: "16px",
    outline: "none",
    background: "rgba(255,255,255,0.1)",
    color: "#fff",
    fontWeight: "700",
  },
  button: {
    width: "100%",
    padding: "14px",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(135deg,#00f2fe,#4facfe)",
    color: "#fff",
    fontWeight: "900",
    fontSize: "18px",
    cursor: "pointer",
    marginTop: "15px",
    transition: "transform 0.2s ease",
    animation: "neonPulse 3s infinite",
  },
  error: {
    color: "#ff8080",
    textAlign: "center",
    marginTop: "10px",
    fontWeight: "700",
  },
  bottomText: {
    marginTop: "20px",
    fontSize: "14px",
  },
  linkBtn: {
    background: "none",
    border: "none",
    color: "#00f2fe",
    textDecoration: "underline",
    cursor: "pointer",
    fontWeight: "700",
  },
};

export default Login;
