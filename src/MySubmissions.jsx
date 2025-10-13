import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function MySubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all"); // all, winner, pending
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login first!");
        navigate("/login");
        return;
      }

      // ✅ Safe logging in dev only
      if (process.env.NODE_ENV === "development") {
        console.log("🌍 API URL:", process.env.REACT_APP_API_URL);
        console.log("🔑 Token found:", token ? "✅" : "❌");
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/my-submissions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSubmissions(data.submissions || []);
        setLoading(false);
      } else {
        setError(data.error || "Failed to fetch submissions");
        setLoading(false);
      }
    } catch (err) {
      console.error("❌ Error fetching submissions:", err);
      setError("Failed to connect to server. Please try again later.");
      setLoading(false);
    }
  };

  // Filter logic
  const filteredSubmissions = submissions.filter((sub) => {
    if (filterStatus === "all") return true;
    if (filterStatus === "winner") return sub.is_winner;
    if (filterStatus === "pending") return !sub.is_winner;
    return true;
  });

  // Stats
  const totalSubmissions = submissions.length;
  const winnerCount = submissions.filter((s) => s.is_winner).length;
  const pendingCount = submissions.filter((s) => !s.is_winner).length;

  // Loading state
  if (loading) {
    return (
      <div style={styles.centerScreen}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "64px", marginBottom: "20px" }}>⏳</div>
          Loading your submissions...
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={styles.errorScreen}>
        <div style={{ fontSize: "64px", marginBottom: "20px" }}>❌</div>
        {error}
        <button
          onClick={() => window.location.reload()}
          style={styles.retryBtn}
        >
          🔄 Retry
        </button>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "40px", textAlign: "center" }}>
          <h1 style={styles.title}>🎨 My Submissions</h1>
          <p style={styles.subtitle}>Track your entries, wins, and progress</p>
        </div>

        {/* Stats */}
        <div style={styles.statsGrid}>
          <StatCard count={totalSubmissions} label="Total Submissions" color="#667eea" />
          <StatCard count={winnerCount} label="Wins" color="#FFD700" emoji="🏆" />
          <StatCard count={pendingCount} label="Pending Review" color="#00f2fe" />
        </div>

        {/* Filters */}
        <div style={styles.filterBar}>
          {[
            { key: "all", label: `All (${totalSubmissions})`, color: "#667eea" },
            { key: "winner", label: `🏆 Winners (${winnerCount})`, color: "#FFD700" },
            { key: "pending", label: `Pending (${pendingCount})`, color: "#00f2fe" },
          ].map((btn) => (
            <button
              key={btn.key}
              onClick={() => setFilterStatus(btn.key)}
              style={{
                ...styles.filterBtn,
                background:
                  filterStatus === btn.key
                    ? `linear-gradient(135deg, ${btn.color}, ${btn.color}bb)`
                    : "rgba(255,255,255,0.1)",
                border:
                  filterStatus === btn.key
                    ? `2px solid ${btn.color}`
                    : "2px solid rgba(255,255,255,0.2)",
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Empty State */}
        {filteredSubmissions.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={{ fontSize: "80px", marginBottom: "20px" }}>📦</div>
            <h2>No submissions yet</h2>
            <p style={{ color: "#aaa", marginBottom: "30px" }}>
              Start creating custom car parts and join the competition!
            </p>
            <button onClick={() => navigate("/carmod")} style={styles.primaryBtn}>
              🚀 Create Your First Part
            </button>
          </div>
        ) : (
          <div style={styles.grid}>
            {filteredSubmissions.map((sub) => (
              <SubmissionCard key={sub.id} sub={sub} />
            ))}
          </div>
        )}

        {/* Footer buttons */}
        <div style={styles.bottomBtns}>
          <button style={styles.orangeBtn} onClick={() => navigate("/carmod")}>
            ✨ Upload New Part
          </button>
          <button style={styles.secondaryBtn} onClick={() => navigate("/")}>
            🏠 Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

/* === Reusable Components === */
const StatCard = ({ count, label, color, emoji }) => (
  <div
    style={{
      ...styles.statCard,
      background: `linear-gradient(135deg, ${color} 0%, ${color}55 100%)`,
      boxShadow: `0 10px 30px ${color}55`,
    }}
  >
    <div style={{ fontSize: "54px", fontWeight: "900" }}>
      {emoji ? emoji + " " : ""}
      {count}
    </div>
    <div style={{ fontSize: "20px", fontWeight: "600" }}>{label}</div>
  </div>
);

const SubmissionCard = ({ sub }) => (
  <div
    style={{
      ...styles.card,
      background: sub.is_winner
        ? "rgba(255, 215, 0, 0.12)"
        : "rgba(255, 255, 255, 0.08)",
      border: sub.is_winner
        ? "1px solid rgba(255, 215, 0, 0.4)"
        : "1px solid rgba(255,255,255,0.2)",
      boxShadow: sub.is_winner
        ? "0 8px 40px rgba(255,215,0,0.35)"
        : "0 8px 32px rgba(31,38,135,0.37)",
    }}
    onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
  >
    {sub.is_winner && <div style={styles.winnerBadge}>🏆 WINNER!</div>}
    <h3 style={styles.cardTitle}>{sub.part_name}</h3>
    <p style={styles.cardText}>🚗 {sub.car_model}</p>
    <p style={styles.cardText}>📦 {sub.part_type}</p>
    <p style={styles.cardText}>📅 Week {sub.week_number}</p>
    <a
      href={sub.file_path}
      target="_blank"
      rel="noopener noreferrer"
      style={styles.downloadBtn}
    >
      📥 View Model
    </a>
  </div>
);

/* === Styles === */
const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #000 0%, #090933 40%, #1b0034 100%)",
    color: "#fff",
    padding: "40px 20px",
  },
  title: {
    fontSize: "56px",
    fontWeight: "900",
    background: "linear-gradient(135deg,#00f2fe,#4facfe)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    textShadow: "0 0 30px rgba(79,172,254,0.4)",
  },
  subtitle: { color: "#aaa", fontSize: "20px", marginBottom: "50px" },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
    gap: "25px",
    marginBottom: "50px",
  },
  statCard: {
    padding: "35px",
    borderRadius: "20px",
    textAlign: "center",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.2)",
  },
  filterBar: {
    display: "flex",
    justifyContent: "center",
    gap: "15px",
    flexWrap: "wrap",
    marginBottom: "40px",
  },
  filterBtn: {
    padding: "16px 32px",
    borderRadius: "50px",
    fontSize: "20px",
    color: "#fff",
    fontWeight: "700",
    cursor: "pointer",
    transition: "0.3s",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
    gap: "30px",
  },
  card: {
    borderRadius: "20px",
    padding: "30px",
    transition: "0.3s",
    backdropFilter: "blur(10px)",
  },
  winnerBadge: {
    background: "linear-gradient(135deg,#FFD700,#FFA500)",
    color: "#000",
    padding: "10px 20px",
    borderRadius: "50px",
    fontWeight: "900",
    marginBottom: "15px",
    textAlign: "center",
  },
  cardTitle: { fontSize: "24px", fontWeight: "800", marginBottom: "10px" },
  cardText: { color: "#aaa", fontSize: "18px", marginBottom: "8px" },
  downloadBtn: {
    display: "block",
    background: "linear-gradient(135deg,#667eea,#764ba2)",
    color: "#fff",
    textDecoration: "none",
    textAlign: "center",
    padding: "14px",
    borderRadius: "12px",
    marginTop: "15px",
    fontWeight: "700",
    boxShadow: "0 8px 20px rgba(102,126,234,0.4)",
  },
  emptyState: {
    textAlign: "center",
    padding: "80px 20px",
    background: "rgba(255,255,255,0.05)",
    borderRadius: "20px",
    border: "2px dashed rgba(255,255,255,0.2)",
  },
  primaryBtn: {
    padding: "18px 40px",
    fontSize: "20px",
    borderRadius: "50px",
    background: "linear-gradient(135deg,#667eea,#764ba2)",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    fontWeight: "700",
  },
  bottomBtns: { textAlign: "center", marginTop: "60px" },
  orangeBtn: {
    padding: "20px 50px",
    fontSize: "22px",
    borderRadius: "50px",
    background: "linear-gradient(135deg,#FF9800,#F57C00)",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    fontWeight: "800",
    margin: "10px",
    boxShadow: "0 8px 25px rgba(255,152,0,0.3)",
  },
  secondaryBtn: {
    padding: "20px 50px",
    fontSize: "22px",
    borderRadius: "50px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.2)",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "700",
    margin: "10px",
    boxShadow: "0 8px 25px rgba(255,255,255,0.2)",
  },
  centerScreen: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    background: "#0a0a0a",
    color: "#fff",
    fontSize: "32px",
    fontWeight: "700",
  },
  errorScreen: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    background: "#0a0a0a",
    color: "#f44",
    fontSize: "28px",
    fontWeight: "700",
    flexDirection: "column",
    textAlign: "center",
  },
  retryBtn: {
    marginTop: "20px",
    padding: "14px 30px",
    borderRadius: "50px",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "18px",
  },
};

export default MySubmissions;
