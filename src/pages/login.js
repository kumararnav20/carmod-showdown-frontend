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
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.userId);
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
          navigate("/");
        }, 1500);
      } else {
        setError(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Connection error. Please check backend status.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* ✅ Background Gradient Animation */}
      <div style={styles.bgOverlay}></div>

      {/* ✅ Toast Notification */}
      {showToast && <div style={styles.toast}>✅ Welcome back, Racer!</div>}

      {/* ✅ Glass Card */}
      <div style={styles.card}>
        <h1 style={styles.logo}>🏁 CarMod Showdown</h1>
        <h2 style={styles.heading}>Login</h2>

        {error && <div style={styles.error}>❌ {error}</div>}

        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            placeholder="racer@example.com"
          />

          <label style={styles.label}>Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            placeholder="Your password"
          />

          <button type="submit" disabled={isLoading} style={styles.button}>
            {isLoading ? "⏳ Logging in..." : "🚀 Enter the Garage"}
          </button>
        </form>

        <p style={styles.text}>
          Don’t have an account?{" "}
          <span style={styles.link} onClick={() => navigate("/register")}>
            Register now
          </span>
        </p>

        <button onClick={() => navigate("/")} style={styles.back}>
          ← Back to Home
        </button>
      </div>

      <style>
        {`
          @keyframes bgMove {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }

          @keyframes fadeInOut {
            0% { opacity: 0; transform: translateY(-20px); }
            20%,80% { opacity: 1; transform: translateY(0); }
            100% { opacity: 0; transform: translateY(-20px); }
          }
        `}
      </style>
    </div>
  );
}

const styles = {
  page: {
    position: "relative",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    fontFamily: "'Orbitron', sans-serif",
  },
  bgOverlay: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(-45deg, #000000, #020d1f, #1a0033, #660066)",
    backgroundSize: "400% 400%",
    animation: "bgMove 12s ease infinite",
    zIndex: -2,
  },
  toast: {
    position: "absolute",
    top: "40px",
    background: "linear-gradient(135deg,#00f2fe,#4facfe)",
    color: "#000",
    padding: "14px 30px",
    borderRadius: "12px",
    fontWeight: "800",
    boxShadow: "0 0 20px rgba(0,242,254,0.6)",
    animation: "fadeInOut 1.5s ease forwards",
  },
  card: {
    background: "rgba(0,0,0,0.6)",
    border: "1px solid rgba(0,242,254,0.2)",
    borderRadius: "16px",
    backdropFilter: "blur(15px)",
    boxShadow: "0 0 40px rgba(0,242,254,0.15)",
    padding: "50px 40px",
    width: "90%",
    maxWidth: "400px",
    zIndex: 2,
    color: "#fff",
  },
  logo: {
    textAlign: "center",
    fontSize: "26px",
    fontWeight: "900",
    background: "linear-gradient(135deg,#00f2fe,#f5576c)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    marginBottom: "10px",
  },
  heading: {
    textAlign: "center",
    color: "#fff",
    fontSize: "22px",
    marginBottom: "25px",
  },
  label: {
    display: "block",
    fontSize: "14px",
    color: "#ccc",
    marginBottom: "6px",
  },
  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(20,20,20,0.8)",
    color: "#fff",
    marginBottom: "20px",
    fontSize: "14px",
  },
  button: {
    width: "100%",
    padding: "14px",
    background: "linear-gradient(135deg,#00f2fe,#f5576c)",
    color: "#000",
    fontWeight: "900",
    border: "none",
    borderRadius: "10px",
    fontSize: "16px",
    cursor: "pointer",
    boxShadow: "0 0 25px rgba(0,242,254,0.3)",
  },
  text: { textAlign: "center", marginTop: "20px", color: "#bbb" },
  link: {
    color: "#00f2fe",
    cursor: "pointer",
    fontWeight: "700",
    textShadow: "0 0 8px #00f2fe",
  },
  back: {
    display: "block",
    margin: "20px auto 0",
    background: "none",
    border: "none",
    color: "#777",
    cursor: "pointer",
  },
  error: {
    background: "rgba(255,0,0,0.1)",
    border: "1px solid rgba(255,0,0,0.3)",
    color: "#ff5c5c",
    padding: "12px",
    borderRadius: "8px",
    textAlign: "center",
    marginBottom: "15px",
    fontWeight: "600",
  },
};

export default Login;
