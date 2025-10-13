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

      console.log("🌍 API URL:", process.env.REACT_APP_API_URL);
      console.log("🔑 Token found:", token ? "✅" : "❌");

      // ✅ Use BACKTICKS, not single quotes!
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/my-submissions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      console.log("📦 Submissions response:", data);

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

  // Filter submissions
  const filteredSubmissions = submissions.filter((sub) => {
    if (filterStatus === "all") return true;
    if (filterStatus === "winner") return sub.is_winner;
    if (filterStatus === "pending") return !sub.is_winner;
    return true;
  });

  // Count stats
  const totalSubmissions = submissions.length;
  const winnerCount = submissions.filter((s) => s.is_winner).length;
  const pendingCount = submissions.filter((s) => !s.is_winner).length;

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "#0a0a0a",
          color: "#fff",
          fontSize: "32px",
          fontWeight: "700",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "64px", marginBottom: "20px" }}>⏳</div>
          Loading your submissions...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
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
        }}
      >
        <div style={{ fontSize: "64px", marginBottom: "20px" }}>❌</div>
        {error}
        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: "20px",
            padding: "14px 30px",
            borderRadius: "50px",
            background:
              "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            fontWeight: "700",
            fontSize: "18px",
          }}
        >
          🔄 Retry
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)",
        padding: "40px 20px",
        color: "#fff",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "40px", textAlign: "center" }}>
          <h1
            style={{
              fontSize: "56px",
              fontWeight: "900",
              background:
                "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: "0 0 30px rgba(102, 126, 234, 0.3)",
            }}
          >
            🎨 My Submissions
          </h1>
          <p style={{ fontSize: "22px", color: "#888" }}>
            Track your competition entries and wins
          </p>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
            gap: "25px",
            marginBottom: "50px",
          }}
        >
          <StatCard count={totalSubmissions} label="Total Submissions" color="#667eea" />
          <StatCard count={winnerCount} label="Wins" color="#f5576c" emoji="🏆" />
          <StatCard count={pendingCount} label="Pending Review" color="#4facfe" />
        </div>

        {/* Filters */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "15px",
            flexWrap: "wrap",
            marginBottom: "40px",
          }}
        >
          {[
            { key: "all", label: `All (${totalSubmissions})`, color: "#667eea" },
            { key: "winner", label: `🏆 Winners (${winnerCount})`, color: "#f093fb" },
            { key: "pending", label: `Pending (${pendingCount})`, color: "#00f2fe" },
          ].map((btn) => (
            <button
              key={btn.key}
              onClick={() => setFilterStatus(btn.key)}
              style={{
                padding: "16px 32px",
                borderRadius: "50px",
                fontSize: "20px",
                background:
                  filterStatus === btn.key
                    ? `linear-gradient(135deg, ${btn.color}, ${btn.color}bb)`
                    : "rgba(255,255,255,0.1)",
                color: "#fff",
                border:
                  filterStatus === btn.key
                    ? `2px solid ${btn.color}`
                    : "2px solid rgba(255,255,255,0.2)",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Empty State */}
        {filteredSubmissions.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "80px 20px",
              background: "rgba(255,255,255,0.05)",
              borderRadius: "20px",
              border: "2px dashed rgba(255,255,255,0.2)",
            }}
          >
            <div style={{ fontSize: "80px", marginBottom: "20px" }}>📦</div>
            <h2>No submissions yet</h2>
            <p style={{ color: "#aaa", marginBottom: "30px" }}>
              Start creating custom car parts and join the competition!
            </p>
            <button
              onClick={() => navigate("/carmod")}
              style={{
                padding: "18px 40px",
                fontSize: "22px",
                borderRadius: "50px",
                background:
                  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                fontWeight: "700",
              }}
            >
              🚀 Create Your First Part
            </button>
          </div>
        )}

        {/* Submissions Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
            gap: "30px",
          }}
        >
          {filteredSubmissions.map((sub) => (
            <SubmissionCard key={sub.id} sub={sub} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ===== Reusable Components ===== */
const StatCard = ({ count, label, color, emoji }) => (
  <div
    style={{
      background: `linear-gradient(135deg, ${color} 0%, ${color}aa 100%)`,
      padding: "35px",
      borderRadius: "20px",
      boxShadow: `0 10px 30px ${color}55`,
      textAlign: "center",
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
      background: sub.is_winner
        ? "linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,140,0,0.15))"
        : "rgba(255,255,255,0.05)",
      padding: "30px",
      borderRadius: "20px",
      border: sub.is_winner
        ? "3px solid #FFD700"
        : "2px solid rgba(255,255,255,0.1)",
      transition: "all 0.3s ease",
    }}
  >
    {sub.is_winner && (
      <div
        style={{
          background: "linear-gradient(135deg,#FFD700,#FFA500)",
          padding: "10px 20px",
          borderRadius: "50px",
          fontWeight: "900",
          color: "#000",
          marginBottom: "20px",
          textAlign: "center",
        }}
      >
        🏆 WINNER!
      </div>
    )}
    <h3>{sub.part_name}</h3>
    <p>🚗 {sub.car_model}</p>
    <p>📦 {sub.part_type}</p>
    <p>📅 Week {sub.week_number}</p>
    <a
      href={sub.file_path}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "block",
        background: "linear-gradient(135deg, #667eea, #764ba2)",
        color: "#fff",
        textDecoration: "none",
        textAlign: "center",
        padding: "12px",
        borderRadius: "12px",
        marginTop: "15px",
        fontWeight: "700",
      }}
    >
      📥 View Model
    </a>
  </div>
);

export default MySubmissions;
