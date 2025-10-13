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
          alert("🎉 " + data.message);
          onClose();
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

  // =======================
  //   CONDITIONAL VIEWS
  // =======================

  if (!userId) {
    return (
      <Overlay>
        <Panel borderColor="#2196F3">
          <h2 style={styles.titleBlue}>Please Login First</h2>
          <p style={styles.text}>You need to be logged in to vote on entries.</p>
          <Button color="#2196F3" text="Close" onClick={onClose} />
        </Panel>
      </Overlay>
    );
  }

  if (loading) {
    return (
      <Overlay>
        <div style={styles.loading}>Loading entries...</div>
      </Overlay>
    );
  }

  if (entries.length === 0) {
    return (
      <Overlay>
        <Panel borderColor="#2196F3">
          <h2 style={styles.titleBlue}>No More Entries</h2>
          <p style={styles.text}>You've voted on all available entries! Check back later.</p>
          <Button color="#2196F3" text="Close" onClick={onClose} />
        </Panel>
      </Overlay>
    );
  }

  const entry = entries[currentIndex];

  return (
    <Overlay>
      <div style={styles.wrapper}>
        <Header title="🗳️ Vote on Submissions" onClose={onClose} />
        <Progress votesCompleted={votesCompleted} />
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h3 style={{ color: "#9C27B0" }}>{entry.anonymous_id}</h3>
            <span style={{ color: "#666" }}>
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
            <VoteButton color="#f44336" text="👎 Not Good" onClick={() => handleVote(0)} />
            <VoteButton color="#4CAF50" text="👍 Good" onClick={() => handleVote(1)} />
          </div>
        </div>

        <div style={styles.noticeBox}>
          ⚠️ Vote on 25 entries to qualify your submission for winning!
        </div>
      </div>
    </Overlay>
  );
}

/* =======================
    SUB-COMPONENTS
======================= */
const Overlay = ({ children }) => (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.9)",
      zIndex: 100,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      overflow: "auto",
    }}
  >
    {children}
  </div>
);

const Panel = ({ borderColor, children }) => (
  <div
    style={{
      background: "#1a1a1a",
      padding: "40px",
      borderRadius: "16px",
      border: `3px solid ${borderColor}`,
      textAlign: "center",
      maxWidth: "600px",
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
      borderRadius: "10px",
      cursor: "pointer",
      fontWeight: "800",
      marginTop: "20px",
    }}
  >
    {text}
  </button>
);

const Header = ({ title, onClose }) => (
  <div style={styles.header}>
    <h2 style={styles.titleBlue}>{title}</h2>
    <button style={styles.closeBtn} onClick={onClose}>
      ×
    </button>
  </div>
);

const Progress = ({ votesCompleted }) => (
  <div style={{ marginBottom: "30px" }}>
    <div style={{ color: "#4CAF50", fontWeight: "700", marginBottom: "10px" }}>
      Progress: {votesCompleted} / 25 votes
    </div>
    <div style={styles.progressBar}>
      <div
        style={{
          height: "100%",
          width: `${(votesCompleted / 25) * 100}%`,
          background: "linear-gradient(90deg,#4CAF50,#8BC34A)",
          borderRadius: "10px",
          transition: "width 0.3s ease",
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
    }}
  >
    {text}
  </button>
);

/* =======================
    STYLES
======================= */
const styles = {
  wrapper: {
    width: "100%",
    maxWidth: "800px",
    background: "#1a1a1a",
    border: "3px solid #2196F3",
    borderRadius: "16px",
    padding: "30px",
  },
  titleBlue: {
    color: "#2196F3",
    fontSize: "32px",
    fontWeight: "800",
    marginBottom: "20px",
  },
  text: { color: "#fff", fontSize: "18px", marginBottom: "10px" },
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
    background: "#222",
    padding: "30px",
    borderRadius: "12px",
    border: "3px solid #333",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "20px",
  },
  previewBox: {
    background: "#0a0a0a",
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
    height: "20px",
    background: "#222",
    borderRadius: "10px",
    overflow: "hidden",
  },
  noticeBox: {
    marginTop: "20px",
    padding: "15px",
    background: "#2d1810",
    borderRadius: "10px",
    border: "2px solid #4a2818",
    color: "#FFA500",
    textAlign: "center",
    fontWeight: "700",
  },
};

export default VotingPanel;
