import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import VotingPanel from "./VotingPanel";
import StatusPanel from "./StatusPanel";
import LeaderboardSection from "../components/LeaderboardSection"; // 🏆 Leaderboard import

function HomePage() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [showVotingPanel, setShowVotingPanel] = useState(false);
  const [showStatusPanel, setShowStatusPanel] = useState(false);
  const [stats, setStats] = useState({
    currentWeek: 0,
    totalSubmissions: 0,
    totalWinners: 0,
    qualifiedEntries: 0,
  });
  const [countdown, setCountdown] = useState("");
  const [scrollY, setScrollY] = useState(0);

  // 🧭 Track scroll for parallax motion
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    setIsLoggedIn(!!token);
    setCurrentUserId(userId ? parseInt(userId) : null);
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/competition-stats`);
      const data = await res.json();
      if (res.ok) setStats(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const target = new Date("2025-12-01T00:00:00Z").getTime();
    const interval = setInterval(() => {
      const now = Date.now();
      const diff = target - now;
      if (diff <= 0) {
        setCountdown("Free Entry Ended!");
        clearInterval(interval);
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const mins = Math.floor((diff / (1000 * 60)) % 60);
        setCountdown(`${days}d ${hours}h ${mins}m`);
      }
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setIsLoggedIn(false);
    setCurrentUserId(null);
    window.location.reload();
  };

  return (
    <div style={styles.page}>
      {/* 🏁 Background with Parallax Motion */}
      <div
        style={{
          ...styles.bgImage,
          backgroundPositionY: `${scrollY * 0.3}px`,
        }}
      ></div>
      <div style={styles.overlay}></div>

      {/* NAVBAR */}
      <nav style={styles.navbar}>
        <div style={styles.logo}>🏎️ CarMod Showdown</div>

        <div style={{ display: "flex", gap: "20px" }}>
          {isLoggedIn ? (
            <>
              <NavBtn label="Vote" color="#2196F3" onClick={() => setShowVotingPanel(true)} emoji="🗳️" />
              <NavBtn label="Status" color="#9C27B0" onClick={() => setShowStatusPanel(true)} emoji="📊" />
              <NavBtn label="Dashboard" color="#ffffff33" onClick={() => navigate("/my-submissions")} emoji="🧭" />
              <NavBtn label="Logout" color="#ffffff22" onClick={handleLogout} emoji="🚪" />
            </>
          ) : (
            <>
              <NavBtn label="Login" color="#ffffff22" onClick={() => navigate("/login")} emoji="🔐" />
              <NavBtn label="Sign Up" color="#FF9800" gradient onClick={() => navigate("/register")} emoji="✨" />
            </>
          )}
        </div>
      </nav>

      {showVotingPanel && <VotingPanel userId={currentUserId} onClose={() => setShowVotingPanel(false)} />}
      {showStatusPanel && <StatusPanel userId={currentUserId} onClose={() => setShowStatusPanel(false)} />}

      {/* HERO */}
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>Customize Cars. Compete. Win. 🏆</h1>
        <p style={styles.heroSubtitle}>
          Create custom 3D parts in Blender, submit weekly, and win{" "}
          <strong style={{ color: "#FFD700" }}>Premium Access</strong> +{" "}
          <strong style={{ color: "#4CAF50" }}>£50 Cash Prize!</strong>
        </p>

        <div style={styles.heroBadge}>
          🔥 Week {stats.currentWeek} • {stats.totalSubmissions} Entries • {stats.qualifiedEntries} Qualified
        </div>

        <p style={styles.countdown}>⏰ Free Entry ends in {countdown}</p>

        <div style={styles.heroBtns}>
          {isLoggedIn ? (
            <>
              <MainBtn color="#667eea" text="🎨 Start Creating" onClick={() => navigate("/carmod")} />
              <MainBtn color="#2196F3" text="🗳️ Vote Now" onClick={() => setShowVotingPanel(true)} />
              <MainBtn color="#9C27B0" text="🎨 Browse Gallery" onClick={() => navigate("/gallery")} />
            </>
          ) : (
            <>
              <MainBtn color="#FF9800" text="🚀 Join Competition - Free!" onClick={() => navigate("/register")} />
              <MainBtn color="#9C27B0" text="🎨 Browse Gallery" onClick={() => navigate("/gallery")} />
            </>
          )}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={styles.howItWorks}>
        <h2 style={styles.sectionTitle}>How It Works</h2>
        <div style={styles.stepsGrid}>
          <Step num="1" color="#667eea" title="View 3D Cars" desc="Explore car models & download reference parts." />
          <Step num="2" color="#f5576c" title="Create in Blender" desc="Design custom parts and export as .glb files." />
          <Step num="3" color="#00f2fe" title="Submit & Vote" desc="Upload, vote on 25 others, and win prizes!" />
        </div>
      </section>

      {/* PRIZES */}
      <section style={styles.prizes}>
        <h2 style={styles.prizesTitle}>🎁 Weekly Rewards</h2>
        <div style={styles.prizesBox}>
          <ul style={styles.prizeList}>
            <li>✅ Lifetime Premium Access</li>
            <li>✅ Free Entry for 10 Weeks</li>
            <li>✅ Access to Full Part Library</li>
            <li>✅ £50 Weekly Cash Prize</li>
          </ul>
        </div>
      </section>

      {/* 🏆 Leaderboard */}
      <LeaderboardSection />

      {/* FOOTER */}
      <footer style={styles.footer}>
        <p>© 2025 CarMod Showdown · All rights reserved.</p>
        <p style={{ color: "#555" }}>Built with ❤️ by Vyobha Studios</p>
      </footer>
    </div>
  );
}

/* ------------------- Styles ------------------- */
const styles = {
  page: {
    position: "relative",
    color: "#fff",
    overflow: "hidden",
    fontFamily: "'Orbitron', sans-serif",
  },
  bgImage: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "120%",
    backgroundImage: "url('/nfs_bg.jpg')", // ⚡ Change your image name here
    backgroundSize: "cover",
    backgroundPosition: "center",
    zIndex: -2,
    transition: "background-position 0.2s ease-out",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.75)",
    zIndex: -1,
  },
  navbar: {
    padding: "25px 50px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "rgba(0,0,0,0.6)",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  logo: {
    fontSize: "32px",
    fontWeight: "900",
    background: "linear-gradient(135deg,#FFD700,#FFA500)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  hero: {
    textAlign: "center",
    padding: "160px 20px 100px",
  },
  heroTitle: {
    fontSize: "72px",
    fontWeight: "900",
    background: "linear-gradient(135deg,#00f2fe,#4facfe)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    marginBottom: "20px",
  },
  heroSubtitle: { fontSize: "26px", color: "#ccc", marginBottom: "40px" },
  heroBadge: {
    background: "linear-gradient(135deg,#f093fb,#f5576c)",
    padding: "16px 40px",
    borderRadius: "50px",
    display: "inline-block",
    marginBottom: "30px",
    fontWeight: "800",
  },
  countdown: {
    color: "#FFD700",
    fontSize: "22px",
    marginBottom: "50px",
    fontWeight: "700",
  },
  heroBtns: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    flexWrap: "wrap",
  },
  howItWorks: {
    background: "rgba(0,0,0,0.5)",
    padding: "80px 40px",
  },
  sectionTitle: {
    textAlign: "center",
    fontSize: "56px",
    background: "linear-gradient(135deg,#4facfe,#00f2fe)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    fontWeight: "900",
    marginBottom: "60px",
  },
  stepsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
    gap: "40px",
    textAlign: "center",
  },
  prizes: { padding: "80px 40px", textAlign: "center" },
  prizesTitle: {
    fontSize: "56px",
    background: "linear-gradient(135deg,#FFD700,#FFA500)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    fontWeight: "900",
    marginBottom: "30px",
  },
  prizesBox: {
    maxWidth: "900px",
    margin: "0 auto",
    background: "linear-gradient(135deg,rgba(255,215,0,0.1),rgba(255,140,0,0.1))",
    padding: "50px",
    borderRadius: "30px",
    border: "3px solid rgba(255,215,0,0.3)",
  },
  prizeList: { listStyle: "none", padding: 0, lineHeight: "2", fontSize: "24px" },
  footer: {
    background: "rgba(0,0,0,0.7)",
    padding: "40px",
    textAlign: "center",
    color: "#777",
    marginTop: "100px",
  },
};

/* ------------------- Small Components ------------------- */
const NavBtn = ({ label, color, onClick, emoji, gradient }) => (
  <button
    onClick={onClick}
    style={{
      padding: "12px 24px",
      borderRadius: "40px",
      fontSize: "17px",
      background: gradient ? `linear-gradient(135deg,${color},${color}aa)` : color,
      border: "none",
      color: "#fff",
      fontWeight: "700",
      cursor: "pointer",
      boxShadow: "0 3px 10px rgba(255,255,255,0.2)",
      transition: "0.3s",
    }}
    onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
  >
    {emoji} {label}
  </button>
);

const MainBtn = ({ color, text, onClick }) => (
  <button
    onClick={onClick}
    style={{
      padding: "22px 50px",
      fontSize: "26px",
      borderRadius: "60px",
      background: `linear-gradient(135deg,${color},${color}aa)`,
      border: "none",
      color: "#fff",
      fontWeight: "900",
      cursor: "pointer",
      transition: "0.3s",
    }}
    onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
  >
    {text}
  </button>
);

const Step = ({ num, color, title, desc }) => (
  <div>
    <div
      style={{
        width: "110px",
        height: "110px",
        borderRadius: "50%",
        margin: "0 auto 20px",
        background: color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "48px",
        fontWeight: "900",
        boxShadow: `0 0 25px ${color}66`,
      }}
    >
      {num}
    </div>
    <h3 style={{ fontSize: "28px", fontWeight: "800" }}>{title}</h3>
    <p style={{ color: "#aaa", fontSize: "20px", lineHeight: "1.6" }}>{desc}</p>
  </div>
);

export default HomePage;
