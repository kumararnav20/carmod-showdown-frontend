import React, { useState, useEffect } from "react";

function LeaderboardSection() {
  const [winners, setWinners] = useState([]);
  const [weekNumber, setWeekNumber] = useState(1);
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/competition-stats`);
      const data = await res.json();
      if (res.ok) {
        setWeekNumber(data.currentWeek || 1);
        fetchWinners(data.currentWeek || 1);
      }
    } catch (e) {
      console.error("Failed to fetch stats:", e);
    }
  };

  const fetchWinners = async (week) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/winners/${week}`);
      const data = await res.json();
      if (res.ok) {
        setWinners(data.winners || []);
      }
    } catch (e) {
      console.error("Error fetching winners:", e);
    }
  };

  // Countdown to next Monday 00:00 UTC
  useEffect(() => {
    const getNextMonday = () => {
      const now = new Date();
      const next = new Date(now);
      next.setDate(now.getDate() + ((8 - now.getDay()) % 7));
      next.setHours(0, 0, 0, 0);
      return next;
    };

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = getNextMonday().getTime() - now;

      if (diff <= 0) {
        setCountdown("New Week Begins!");
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const mins = Math.floor((diff / (1000 * 60)) % 60);
        setCountdown(`${days}d ${hours}h ${mins}m`);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section
      style={{
        padding: "100px 40px",
        background: "linear-gradient(135deg, #000428 0%, #004e92 100%)",
        textAlign: "center",
        color: "#fff",
      }}
    >
      <h2
        style={{
          fontSize: "56px",
          fontWeight: "900",
          marginBottom: "20px",
          background: "linear-gradient(135deg,#FFD700,#FF9800)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        🏆 Weekly Leaderboard
      </h2>
      <p style={{ fontSize: "22px", color: "#ccc", marginBottom: "50px" }}>
        Week {weekNumber} • Ends in <span style={{ color: "#FFD700" }}>{countdown}</span>
      </p>

      {winners.length === 0 ? (
        <p style={{ color: "#888", fontSize: "20px" }}>No winners yet this week — be the first!</p>
      ) : (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "30px",
          }}
        >
          {winners.slice(0, 3).map((winner, index) => (
            <div
              key={winner.id}
              style={{
                background: "rgba(255,255,255,0.08)",
                borderRadius: "20px",
                border: "2px solid rgba(255,215,0,0.3)",
                width: "300px",
                padding: "25px",
                boxShadow: "0 0 20px rgba(255,215,0,0.2)",
                transform: `scale(${index === 0 ? 1.05 : 1})`,
              }}
            >
              <div
                style={{
                  fontSize: "48px",
                  marginBottom: "10px",
                  color: index === 0 ? "#FFD700" : index === 1 ? "#C0C0C0" : "#CD7F32",
                }}
              >
                {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
              </div>
              <h3 style={{ fontSize: "24px", color: "#fff" }}>{winner.part_name}</h3>
              <p style={{ color: "#aaa" }}>{winner.user_name}</p>
              <p style={{ color: "#666", marginTop: "10px" }}>{winner.car_model}</p>
              <div
                style={{
                  marginTop: "15px",
                  fontSize: "18px",
                  color: "#FFD700",
                  fontWeight: "700",
                }}
              >
                ⭐ {Math.round(winner.approval_rating)}% Approval
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default LeaderboardSection;
