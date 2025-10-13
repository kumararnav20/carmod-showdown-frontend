import React, { useState, useEffect } from "react";

function VotingPanel({ userId, onClose }) {
  const [entries, setEntries] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [votesCompleted, setVotesCompleted] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) loadVotingBatch();
  }, [userId]);

  const loadVotingBatch = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/voting/batch/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setEntries(data.entries);
        setLoading(false);
      } else {
        alert("Failed to load entries.");
      }
    } catch (e) {
      console.error("Error loading batch:", e);
      alert("Error loading entries.");
    }
  };

  const handleVote = async (voteValue) => {
    const currentEntry = entries[currentIndex];
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/vote`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          voterId: userId,
          submissionId: currentEntry.id,
          voteValue,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setVotesCompleted(data.votesCompleted);
        if (data.qualified) {
          setTimeout(() => {
            alert("🎉 " + data.message);
            onClose();
          }, 400);
        } else if (currentIndex < entries.length - 1) {
          setCurrentIndex((prev) => prev + 1);
        } else {
          alert(`✅ Voting complete! You've voted on ${data.votesCompleted} entries.`);
          onClose();
        }
      } else {
        alert("Vote failed: " + data.message);
      }
    } catch (e) {
      console.error("Error voting:", e);
      alert("Failed to submit vote.");
    }
  };

  /* ==========================
       CONDITIONAL RENDERING
  ========================== */

  if (!userId) {
    return (
      <Overlay>
        <Panel glow="#00f2fe">
          <h2 style={styles.title}>Please Login</h2>
          <p style={styles.text}>You must log in to vote on designs.</p>
          <Button color="linear-gradient(135deg,#00f2fe,#4facfe)" text="Close" onClick={onClose} />
        </Panel>
      </Overlay>
    );
  }

  if (loading) {
    return (
      <Overlay>
        <div style={styles.loading}>⏳ Loading entries...</div>
      </Overlay>
    );
  }

  if (entries.length === 0) {
    return (
      <Overlay>
        <Panel glow="#FFD700">
          <h2 style={styles.title}>No More Entries</h2>
          <p style={styles.text}>You’ve voted on all available entries. Check back later!</p>
          <Button color="linear-gradient(135deg,#FFD700,#FFA500)" text="Close" onClick={onClose} />
        </Panel>
      </Overlay>
    );
  }

  const entry = entries[currentIndex];

  // Completion State
  if (votesCompleted >= 25) {
    return (
      <Overlay>
        <Panel glow="#00f2fe">
          <h2 style={styles.title}>🎉 Voting Complete!</h2>
          <p style={styles.text}>
            You’ve finished all 25 votes! Your submission now qualifies for this week’s showdown.
          </p>
          <Button
            color="linear-gradient(135deg,#667eea,#764ba2)"
            text="🏠 Back to Home"
            onClick={onClose}
          />
        </Panel>
      </Overlay>
    );
  }

  return (
    <Overlay>
      <div style={styles.wrapper}>
        <Header title="🗳️ Vote on Submissions" onClose={onClose} />
        <Progress votesCompleted={votesCompleted} />

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h3 style={styles.anonymous}>{entry.anonymous_id}</h3>
            <span style={{ color: "#bbb" }}>
              Entry {currentIndex + 1} / {entries.length}
            </span>
          </div>

          <div style={styles.previewBox}>🚗</div>

          <div style={styles.entryDetails}>
            <Detail label="Part" value={entry.part_name} />
            <Detail label="Type" value={entry.part_type} />
            <Detail label="Car" value={entry.car_model} />
            {entry.description && <Detail label="Description" value={entry.description} />}
          </div>

          <div style={styles.voteBtns}>
            <VoteButton
              color="linear-gradient(135deg,#f5576c,#f093fb)"
              text="👎 Not Good"
              onClick={() => handleVote(0)}
            />
            <VoteButton
              color="linear-gradient(135deg,#4facfe,#00f2fe)"
              text="👍 Good"
              onClick={() => handleVote(1)}
            />
          </div>
        </div>

        <div style={styles.noticeBox}>
          ⚠️ Vote on 25 entries to qualify your submission for winning!
        </div>
      </div>
    </Overlay>
  );
}

/* ==========================
   SUB-COMPONENTS
========================== */
const Overlay = ({ children }) => (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.85)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      zIndex: 100,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
    }}
  >
    {children}
  </div>
);

const Panel = ({ glow, children }) => (
  <div
    style={{
      background: "rgba(20,20,30,0.9)",
      padding: "40px",
      borderRadius: "20px",
      border: `2px solid ${glow}`,
      boxShadow: `0 0 25px ${glow}55`,
      textAlign: "center",
      maxWidth: "600px",
      width: "100%",
    }}
  >
    {children}
  </div>
);

const Button = ({ color, text, onClick }) => (
  <button
    onClick={onClick}
    style={{
      padding: "15px 40px",
      fontSize: "18px",
      background: color,
      color: "#fff",
      border: "none",
      borderRadius: "50px",
      cursor: "pointer",
      fontWeight: "800",
      marginTop: "20px",
      boxShadow: "0 8px 25px rgba(0,0,0,0.3)",
      transition: "all 0.3s ease",
    }}
    onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
  >
    {text}
  </button>
);

const Header = ({ title, onClose }) => (
  <div style={styles.header}>
    <h2 style={styles.title}>{title}</h2>
    <button style={styles.closeBtn} onClick={onClose}>
      ×
    </button>
  </div>
);

const Progress = ({ votesCompleted }) => (
  <div style={{ marginBottom: "30px" }}>
    <div style={{ color: "#00f2fe", fontWeight: "700", marginBottom: "10px" }}>
      Progress: {votesCompleted} / 25 votes
    </div>
    <div style={styles.progressBar}>
      <div
        style={{
          height: "100%",
          width: `${(votesCompleted / 25) * 100}%`,
          background: "linear-gradient(135deg,#00f2fe,#4facfe)",
          borderRadius: "10px",
          transition: "width 0.4s ease",
        }}
      />
    </div>
  </div>
);

const Detail = ({ label, value }) => (
  <p style={styles.detail}>
    <strong style={{ color: "#fff" }}>{label}:</strong> {value}
  </p>
);

const VoteButton = ({ color, text, onClick }) => (
  <button
    onClick={onClick}
    style={{
      padding: "20px",
      fontSize: "20px",
      fontWeight: "800",
      background: color,
      color: "#fff",
      border: "none",
      borderRadius: "15px",
      cursor: "pointer",
      boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
      transition: "all 0.3s ease",
    }}
    onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
  >
    {text}
  </button>
);

/* ==========================
   STYLES
========================== */
const styles = {
  wrapper: {
    width: "100%",
    maxWidth: "850px",
    background: "rgba(20,20,40,0.8)",
    border: "2px solid rgba(255,255,255,0.1)",
    borderRadius: "20px",
    padding: "30px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.4)",
  },
  title: {
    color: "#00f2fe",
    fontSize: "32px",
    fontWeight: "900",
    marginBottom: "20px",
    background: "linear-gradient(135deg,#00f2fe,#4facfe)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  text: { color: "#ccc", fontSize: "18px", marginBottom: "10px" },
  closeBtn: {
    background: "none",
    border: "none",
    color: "#fff",
    fontSize: "36px",
    cursor: "pointer",
    lineHeight: 1,
  },
  loading: { color: "#fff", fontSize: "24px" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
  },
  card: {
    background: "rgba(255,255,255,0.05)",
    padding: "30px",
    borderRadius: "16px",
    border: "1px solid rgba(255,255,255,0.1)",
    backdropFilter: "blur(12px)",
    marginBottom: "30px",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "20px",
  },
  anonymous: {
    color: "#FFD700",
    fontWeight: "700",
    fontSize: "20px",
  },
  previewBox: {
    background: "rgba(0,0,0,0.4)",
    borderRadius: "15px",
    height: "300px",
    marginBottom: "30px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "72px",
  },
  entryDetails: { marginBottom: "30px" },
  detail: { fontSize: "18px", color: "#aaa", marginBottom: "10px" },
  voteBtns: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
  },
  progressBar: {
    width: "100%",
    height: "18px",
    background: "rgba(255,255,255,0.1)",
    borderRadius: "10px",
    overflow: "hidden",
  },
  noticeBox: {
    marginTop: "20px",
    padding: "15px",
    background: "rgba(255,215,0,0.08)",
    borderRadius: "10px",
    border: "1px solid rgba(255,215,0,0.3)",
    color: "#FFD700",
    textAlign: "center",
    fontWeight: "700",
  },
};

export default VotingPanel;
