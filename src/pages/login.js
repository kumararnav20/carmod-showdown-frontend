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
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        color: "#fff",
      }}
    >
      {/* 🎥 Background video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: -2,
        }}
      >
        <source src="/nfs_bg.mp4" type="video/mp4" />
      </video>

      {/* 🕶️ Dark overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.65)",
          backdropFilter: "blur(4px)",
          zIndex: -1,
        }}
      />

      {/* 🚀 Toast */}
      {showToast && (
        <div
          style={{
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
          }}
        >
          ✅ Welcome Back!
        </div>
      )}

      {/* 💎 Glass form */}
      <div
        style={{
          background: "rgba(255,255,255,0.08)",
          padding: "40px",
          borderRadius: "20px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
          border: "1px solid rgba(255,255,255,0.2)",
          width: "90%",
          maxWidth: "400px",
          backdropFilter: "blur(12px)",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            marginBottom: "25px",
            background: "linear-gradient(135deg,#00f2fe,#4facfe)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontWeight: "900",
            fontSize: "32px",
          }}
        >
          🏎️ CarMod Showdown
        </h2>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={inputStyle}
          />
          <button type="submit" disabled={isLoading} style={buttonStyle}>
            {isLoading ? "⏳ Logging in..." : "🚀 Login"}
          </button>
        </form>

        {error && (
          <p style={{ color: "#ff8080", textAlign: "center", marginTop: "10px" }}>
            ❌ {error}
          </p>
        )}

        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <span>Don't have an account? </span>
          <button
            onClick={() => navigate("/register")}
            style={{
              background: "none",
              border: "none",
              color: "#00f2fe",
              textDecoration: "underline",
              cursor: "pointer",
              fontWeight: "700",
            }}
          >
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
        `}
      </style>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "14px",
  margin: "10px 0",
  borderRadius: "10px",
  border: "none",
  fontSize: "16px",
  outline: "none",
};

const buttonStyle = {
  width: "100%",
  padding: "14px",
  borderRadius: "10px",
  border: "none",
  background: "linear-gradient(135deg,#00f2fe,#4facfe)",
  color: "#fff",
  fontWeight: "800",
  fontSize: "18px",
  cursor: "pointer",
  marginTop: "10px",
};

export default Login;
