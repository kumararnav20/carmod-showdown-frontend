import React, { useState, useEffect } from "react";

function StatusPanel({ userId, onClose }) {
  const [submission, setSubmission] = useState(null);
  const [votesCompleted, setVotesCompleted] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) loadStatus();
  }, [userId]);

  const loadStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/submission/status/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setSubmission(data.submission);
        setVotesCompleted(data.votesCompleted);
      }
      setLoading(false);
    } catch (e) {
      console.error("Error loading status:", e);
      setLoading(false);
    }
  };

  if (!userId) {
    return (
      <Overlay>
        <Panel border="#9C27B0">
          <h2 style={styles.title}>Please Login First</h2>
          <p style={styles.text}>You need to be logged in to view your submission status.</p>
          <Button text="Close" color="#9C27B0" onClick={onClose} />
        </Panel>
      </Overlay>
    );
  }

  if (loading) {
    return (
      <Overlay>
        <div style={styles.loading}>Loading your status...</div>
      </Overlay>
    );
  }

  if (!submission) {
    return (
      <Overlay>
        <Panel border="#9C27B0">
          <h2 style={styles.title}>No Submission Yet</h2>
          <p style={styles.text}>
            You haven’t submitted an entry yet. Go to CarMod Creator to upload your custom car part!
          </p>
          <Button text="Close" color="#9C27B0" onClick={onClose} />
        </Panel>
      </Overlay>
    );
  }

  const isQualified = submission.status === "QUALIFIED";

  return (
    <Overlay>
      <div style={styles.container}>
        <Header title="📊 Your Submission Status" onClose={onClose} />
        <div style={styles.submissionBox}>
          <div style={styles.id}>{submission.anonymous_id}</div>
          <Detail label="Part Name" value={submission.part_name} />
          <Detail label="Type" value={submission.part_type} />
          <Detail label="Car Model" value={submission.car_model} />
        </div>

        {!isQualified ? (
          <Pending votesCompleted={votesCompleted} onClose={onClose} />
        ) : (
          <Qualified submission={submission} onClose={onClose} />
        )}
      </div>
    </Overlay>
  );
}

/* 🟪 COMPONENTS */

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

const Panel = ({ border, children }) => (
  <div
    style={{
      background: "#1a1a1a",
      padding: "40px",
      borderRadius: "16px",
      border: `3px solid ${border}`,
      textAlign: "center",
      maxWidth: "600px",
    }}
  >
    {children}
  </div>
);

const Header = ({ title, onClose }) => (
  <div style={styles.header}>
    <h2 style={styles.headerTitle}>{title}</h2>
    <button style={styles.closeBtn} onClick={onClose}>
      ×
    </button>
  </div>
);

const Detail = ({ label, value }) => (
  <div style={styles.detail}>
    <strong>{label}:</strong> {value}
  </div>
);

const Button = ({ text, color, onClick }) => (
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

/* 🟡 SUB-PANELS */

const Pending = ({ votesCompleted, onClose }) => (
  <div style={styles.pendingBox}>
    <div style={styles.pendingBadge}>⏳ PENDING QUALIFICATION</div>
    <p style={styles.warning}>Your entry is NOT eligible to win yet!</p>
    <p style={styles.textWhite}>Vote on 25 entries to qualify for winning</p>

    <div style={styles.progressContainer}>
      <div
        style={{
          height: "100%",
          width: `${(votesCompleted / 25) * 100}%`,
          background: "linear-gradient(90deg,#FF9800,#F57C00)",
          borderRadius: "10px",
          transition: "width 0.3s ease",
        }}
      />
    </div>

    <div style={styles.voteCount}>{votesCompleted} / 25 votes completed</div>

    <Button text="Close (Click Vote button to start voting)" color="#FF9800" onClick={onClose} />
  </div>
);

const Qualified = ({ submission, onClose }) => (
  <div style={styles.qualifiedBox}>
    <div style={styles.qualifiedBadge}>✅ QUALIFIED</div>
    <p style={styles.success}>Your entry is eligible to win! 🏆</p>

    <div style={styles.statsGrid}>
      <Stat label="Times Shown" value={`👀 ${submission.times_shown || 0}`} />
      <Stat label="Total Votes" value={`🗳️ ${submission.total_votes || 0}`} />
      <Stat
        label="Approval"
        value={`📊 ${
          submission.total_votes > 0
            ? Math.round((submission.thumbs_up / submission.total_votes) * 100)
            : 0
        }%`}
      />
    </div>

    <div style={styles.tipBox}>✅ Keep voting to help other creators qualify too!</div>
    <Button text="Close" color="#4CAF50" onClick={onClose} />
  </div>
);

const Stat = ({ label, value }) => (
  <div>
    <div style={{ color: "#aaa", fontSize: "14px" }}>{label}</div>
    <div style={{ fontSize: "24px", fontWeight: "800", color: "#fff" }}>{value}</div>
  </div>
);

/* 🧾 STYLES */

const styles = {
  container: {
    width: "100%",
    maxWidth: "700px",
    background: "#1a1a1a",
    border: "3px solid #9C27B0",
    borderRadius: "16px",
    padding: "30px",
  },
  title: { color: "#9C27B0", fontSize: "32px", marginBottom: "20px", fontWeight: "800" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" },
  headerTitle: { color: "#9C27B0", fontSize: "32px", fontWeight: "800" },
  closeBtn: { background: "none", border: "none", color: "#fff", fontSize: "36px", cursor: "pointer", lineHeight: 1 },
  submissionBox: {
    background: "#222",
    padding: "25px",
    borderRadius: "12px",
    border: "3px solid #333",
    marginBottom: "25px",
  },
  id: { fontSize: "24px", color: "#9C27B0", fontWeight: "800", marginBottom: "15px" },
  detail: { fontSize: "18px", color: "#fff", marginBottom: "10px" },
  loading: { color: "#fff", fontSize: "24px" },
  pendingBox: {
    background: "#2d1810",
    padding: "25px",
    borderRadius: "12px",
    border: "3px solid #4a2818",
  },
  pendingBadge: {
    display: "inline-block",
    padding: "10px 20px",
    background: "#FF9800",
    color: "#000",
    fontWeight: "800",
    borderRadius: "50px",
    marginBottom: "20px",
  },
  warning: { color: "#FFA500", fontSize: "18px", fontWeight: "700", marginBottom: "10px" },
  text: { color: "#fff", fontSize: "18px", marginBottom: "10px" },
  textWhite: { color: "#fff", fontSize: "20px", fontWeight: "800", marginBottom: "20px" },
  progressContainer: { width: "100%", height: "20px", background: "#222", borderRadius: "10px", overflow: "hidden" },
  voteCount: { color: "#FF9800", fontSize: "18px", fontWeight: "700", marginBottom: "30px" },
  qualifiedBox: {
    background: "#1a2d1e",
    padding: "25px",
    borderRadius: "12px",
    border: "3px solid #2d4a38",
  },
  qualifiedBadge: {
    display: "inline-block",
    padding: "10px 20px",
    background: "#4CAF50",
    color: "#fff",
    fontWeight: "800",
    borderRadius: "50px",
    marginBottom: "20px",
  },
  success: { color: "#4CAF50", fontSize: "20px", fontWeight: "700", marginBottom: "20px" },
  statsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "15px", marginBottom: "20px" },
  tipBox: {
    padding: "15px",
    background: "#0f2415",
    borderRadius: "8px",
    textAlign: "center",
    color: "#4CAF50",
    fontSize: "16px",
    marginBottom: "20px",
  },
};

export default StatusPanel;
