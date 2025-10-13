import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsLoading(true);

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, password }),
      });
      const data = await res.json();
      setMessage(data.message || data.error);
    } catch (err) {
      console.error(err);
      setMessage("Error connecting to server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.bgOverlay}></div>

      <div style={styles.card}>
        <h1 style={styles.logo}>🏎️ CarMod Showdown</h1>
        <h2 style={styles.heading}>Register</h2>

        {message && (
          <div
            style={{
              ...styles.message,
              color: message.includes("success") ? "#00e676" : "#ff5c5c",
            }}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <label style={styles.label}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
            placeholder="racer@email.com"
          />

          <label style={styles.label}>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={styles.input}
            placeholder="Choose your racer tag"
          />

          <label style={styles.label}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
            placeholder="Your password"
          />

          <button type="submit" disabled={isLoading} style={styles.button}>
            {isLoading ? "🏁 Registering..." : "🚀 Join the Race"}
          </button>
        </form>

        <p style={styles.text}>
          Already have an account?{" "}
          <span style={styles.link} onClick={() => navigate("/login")}>
            Login
          </span>
        </p>

        <button onClick={() => navigate("/")} style={styles.back}>
          ← Back to Home
        </button>
      </div>
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
      "linear-gradient(-45deg, #000000, #1a0033, #440066, #660033)",
    backgroundSize: "400% 400%",
    animation: "bgMove 12s ease infinite",
    zIndex: -2,
  },
  card: {
    background: "rgba(0,0,0,0.6)",
    border: "1px solid rgba(255,0,255,0.3)",
    borderRadius: "16px",
    backdropFilter: "blur(15px)",
    boxShadow: "0 0 40px rgba(255,0,255,0.15)",
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
    background: "linear-gradient(135deg,#f093fb,#f5576c)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    marginBottom: "10px",
  },
  heading: { textAlign: "center", color: "#fff", fontSize: "22px", marginBottom: "25px" },
  label: { display: "block", fontSize: "14px", color: "#ccc", marginBottom: "6px" },
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
    background: "linear-gradient(135deg,#f093fb,#f5576c)",
    color: "#000",
    fontWeight: "900",
    border: "none",
    borderRadius: "10px",
    fontSize: "16px",
    cursor: "pointer",
    boxShadow: "0 0 25px rgba(255,0,255,0.3)",
  },
  text: { textAlign: "center", marginTop: "20px", color: "#bbb" },
  link: { color: "#f5576c", cursor: "pointer", fontWeight: "700", textShadow: "0 0 8px #f5576c" },
  back: { display: "block", margin: "20px auto 0", background: "none", border: "none", color: "#777", cursor: "pointer" },
  message: { textAlign: "center", fontWeight: "700", marginBottom: "15px" },
};

export default Register;
