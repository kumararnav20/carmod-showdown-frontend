import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [showVotingPanel, setShowVotingPanel] = useState(false);
  const [showStatusPanel, setShowStatusPanel] = useState(false);
  const [stats, setStats] = useState({
    currentWeek: 0,
    totalSubmissions: 0,
    totalWinners: 0
  });

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    setIsLoggedIn(!!token);
    setCurrentUserId(userId ? parseInt(userId) : null);

    // Fetch competition stats
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('${process.env.REACT_APP_API_URL}/api/competition-stats');
      const data = await response.json();
      if (response.ok) {
        setStats({
          currentWeek: data.currentWeek,
          totalSubmissions: data.totalSubmissions,
          totalWinners: data.totalWinners
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setIsLoggedIn(false);
    setCurrentUserId(null);
    window.location.reload();
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
      color: '#fff',
      overflow: 'hidden'
    }}>
      {/* Navigation Bar */}
      <nav style={{
        padding: '25px 50px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(10px)',
        borderBottom: '2px solid rgba(255,255,255,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ 
          fontSize: '32px', 
          fontWeight: '900',
          background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          🏎️ CarMod Showdown
        </div>

        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          {isLoggedIn ? (
            <>
              <button
                onClick={() => setShowVotingPanel(true)}
                style={{
                  padding: '14px 28px',
                  fontSize: '18px',
                  borderRadius: '50px',
                  background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '700',
                  boxShadow: '0 5px 15px rgba(33, 150, 243, 0.4)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(33, 150, 243, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 5px 15px rgba(33, 150, 243, 0.4)';
                }}
              >
                🗳️ Vote
              </button>

              <button
                onClick={() => setShowStatusPanel(true)}
                style={{
                  padding: '14px 28px',
                  fontSize: '18px',
                  borderRadius: '50px',
                  background: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '700',
                  boxShadow: '0 5px 15px rgba(156, 39, 176, 0.4)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(156, 39, 176, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 5px 15px rgba(156, 39, 176, 0.4)';
                }}
              >
                📊 My Status
              </button>

              <button
                onClick={() => navigate('/my-submissions')}
                style={{
                  padding: '14px 28px',
                  fontSize: '18px',
                  borderRadius: '50px',
                  background: 'rgba(255,255,255,0.1)',
                  color: '#fff',
                  border: '2px solid rgba(255,255,255,0.2)',
                  cursor: 'pointer',
                  fontWeight: '700',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                📊 Dashboard
              </button>
              <button
                onClick={handleLogout}
                style={{
                  padding: '14px 28px',
                  fontSize: '18px',
                  borderRadius: '50px',
                  background: 'rgba(255,255,255,0.1)',
                  color: '#fff',
                  border: '2px solid rgba(255,255,255,0.2)',
                  cursor: 'pointer',
                  fontWeight: '700',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                }}
              >
                🚪 Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                style={{
                  padding: '14px 28px',
                  fontSize: '18px',
                  borderRadius: '50px',
                  background: 'rgba(255,255,255,0.1)',
                  color: '#fff',
                  border: '2px solid rgba(255,255,255,0.2)',
                  cursor: 'pointer',
                  fontWeight: '700',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                }}
              >
                🔐 Login
              </button>
              <button
                onClick={() => navigate('/register')}
                style={{
                  padding: '14px 28px',
                  fontSize: '18px',
                  borderRadius: '50px',
                  background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '700',
                  boxShadow: '0 5px 15px rgba(255, 152, 0, 0.4)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(255, 152, 0, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 5px 15px rgba(255, 152, 0, 0.4)';
                }}
              >
                ✨ Sign Up
              </button>
            </>
          )}
        </div>
      </nav>

      {/* VOTING PANEL */}
      {showVotingPanel && <VotingPanel userId={currentUserId} onClose={() => setShowVotingPanel(false)} />}

      {/* STATUS PANEL */}
      {showStatusPanel && <StatusPanel userId={currentUserId} onClose={() => setShowStatusPanel(false)} />}

      {/* Hero Section */}
      <div style={{
        textAlign: 'center',
        padding: '100px 20px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <h1 style={{
          fontSize: '72px',
          fontWeight: '900',
          marginBottom: '30px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: '0 0 80px rgba(102, 126, 234, 0.5)',
          lineHeight: '1.2'
        }}>
          Customize Cars,<br/>Win Amazing Prizes! 🏆
        </h1>

        <p style={{
          fontSize: '28px',
          color: '#aaa',
          marginBottom: '50px',
          fontWeight: '500',
          lineHeight: '1.6'
        }}>
          Create custom 3D car parts in Blender, compete weekly,<br/>
          and win <strong style={{ color: '#FFD700' }}>Lifetime Premium Access</strong> + <strong style={{ color: '#4CAF50' }}>£50 Cash Prize!</strong>
        </p>

        {/* Competition Status Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          padding: '20px 40px',
          borderRadius: '50px',
          display: 'inline-block',
          marginBottom: '50px',
          boxShadow: '0 10px 30px rgba(240, 147, 251, 0.4)'
        }}>
          <span style={{ fontSize: '24px', fontWeight: '800' }}>
            🔥 Week {stats.currentWeek} Active! • {stats.totalSubmissions} Submissions • {stats.totalWinners} Winners
          </span>
        </div>

        {/* CTA Buttons */}
        <div style={{
          display: 'flex',
          gap: '25px',
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginBottom: '80px'
        }}>
          {isLoggedIn ? (
            <>
              <button
                onClick={() => navigate('/carmod')}
                style={{
                  padding: '24px 50px',
                  fontSize: '26px',
                  borderRadius: '50px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '900',
                  boxShadow: '0 10px 30px rgba(102, 126, 234, 0.5)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px) scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 15px 40px rgba(102, 126, 234, 0.7)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(102, 126, 234, 0.5)';
                }}
              >
                🎨 Start Creating
              </button>

              <button
                onClick={() => setShowVotingPanel(true)}
                style={{
                  padding: '24px 50px',
                  fontSize: '26px',
                  borderRadius: '50px',
                  background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '900',
                  boxShadow: '0 10px 30px rgba(33, 150, 243, 0.5)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px) scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 15px 40px rgba(33, 150, 243, 0.7)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(33, 150, 243, 0.5)';
                }}
              >
                🗳️ Vote on Entries
              </button>

              <button
                onClick={() => navigate('/gallery')}
                style={{
                  padding: '24px 50px',
                  fontSize: '26px',
                  borderRadius: '50px',
                  background: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '900',
                  boxShadow: '0 10px 30px rgba(156, 39, 176, 0.5)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px) scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 15px 40px rgba(156, 39, 176, 0.7)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(156, 39, 176, 0.5)';
                }}
              >
                🎨 Browse Gallery
              </button>

              <button
                onClick={() => navigate('/my-submissions')}
                style={{
                  padding: '24px 50px',
                  fontSize: '26px',
                  borderRadius: '50px',
                  background: 'rgba(255,255,255,0.1)',
                  color: '#fff',
                  border: '3px solid rgba(255,255,255,0.3)',
                  cursor: 'pointer',
                  fontWeight: '900',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                  e.currentTarget.style.transform = 'translateY(-5px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                📊 My Dashboard
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('/register')}
                style={{
                  padding: '24px 50px',
                  fontSize: '26px',
                  borderRadius: '50px',
                  background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '900',
                  boxShadow: '0 10px 30px rgba(255, 152, 0, 0.5)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px) scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 15px 40px rgba(255, 152, 0, 0.7)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(255, 152, 0, 0.5)';
                }}
              >
                🚀 Join the Competition - FREE!
              </button>
              
              <button
                onClick={() => navigate('/gallery')}
                style={{
                  padding: '24px 50px',
                  fontSize: '26px',
                  borderRadius: '50px',
                  background: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '900',
                  boxShadow: '0 10px 30px rgba(156, 39, 176, 0.5)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px) scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 15px 40px rgba(156, 39, 176, 0.7)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(156, 39, 176, 0.5)';
                }}
              >
                🎨 Browse Gallery
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Action Cards */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0 40px 80px 40px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '30px'
        }}>
          {/* CarMod Creator Card */}
          <div
            onClick={() => isLoggedIn ? navigate('/carmod') : navigate('/login')}
            style={{
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)',
              padding: '50px 40px',
              borderRadius: '30px',
              border: '2px solid rgba(102, 126, 234, 0.3)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textAlign: 'center'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-10px)';
              e.currentTarget.style.boxShadow = '0 20px 50px rgba(102, 126, 234, 0.4)';
              e.currentTarget.style.border = '2px solid rgba(102, 126, 234, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.border = '2px solid rgba(102, 126, 234, 0.3)';
            }}
          >
            <div style={{ fontSize: '80px', marginBottom: '20px' }}>🎨</div>
            <h2 style={{ fontSize: '36px', fontWeight: '900', marginBottom: '15px' }}>
              3D Car Creator
            </h2>
            <p style={{ fontSize: '20px', color: '#aaa', lineHeight: '1.6' }}>
              View 16 car models in 3D, download reference parts, and create custom designs in Blender
            </p>
          </div>

          {/* Vote Card - NEW! */}
          <div
            onClick={() => isLoggedIn ? setShowVotingPanel(true) : navigate('/login')}
            style={{
              background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.2) 0%, rgba(25, 118, 210, 0.2) 100%)',
              padding: '50px 40px',
              borderRadius: '30px',
              border: '2px solid rgba(33, 150, 243, 0.3)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textAlign: 'center'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-10px)';
              e.currentTarget.style.boxShadow = '0 20px 50px rgba(33, 150, 243, 0.4)';
              e.currentTarget.style.border = '2px solid rgba(33, 150, 243, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.border = '2px solid rgba(33, 150, 243, 0.3)';
            }}
          >
            <div style={{ fontSize: '80px', marginBottom: '20px' }}>🗳️</div>
            <h2 style={{ fontSize: '36px', fontWeight: '900', marginBottom: '15px' }}>
              Vote on Entries
            </h2>
            <p style={{ fontSize: '20px', color: '#aaa', lineHeight: '1.6' }}>
              Vote on 25 entries to qualify your submission for winning. Fair & square competition!
            </p>
          </div>

          {/* Gallery Card */}
          <div
            onClick={() => navigate('/gallery')}
            style={{
              background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.2) 0%, rgba(123, 31, 162, 0.2) 100%)',
              padding: '50px 40px',
              borderRadius: '30px',
              border: '2px solid rgba(156, 39, 176, 0.3)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textAlign: 'center'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-10px)';
              e.currentTarget.style.boxShadow = '0 20px 50px rgba(156, 39, 176, 0.4)';
              e.currentTarget.style.border = '2px solid rgba(156, 39, 176, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.border = '2px solid rgba(156, 39, 176, 0.3)';
            }}
          >
            <div style={{ fontSize: '80px', marginBottom: '20px' }}>🎨</div>
            <h2 style={{ fontSize: '36px', fontWeight: '900', marginBottom: '15px' }}>
              Submissions Gallery
            </h2>
            <p style={{ fontSize: '20px', color: '#aaa', lineHeight: '1.6' }}>
              Browse all community submissions, view 3D models, and get inspired
            </p>
          </div>

          {/* My Dashboard Card */}
          <div
            onClick={() => isLoggedIn ? navigate('/my-submissions') : navigate('/login')}
            style={{
              background: 'linear-gradient(135deg, rgba(240, 147, 251, 0.2) 0%, rgba(245, 87, 108, 0.2) 100%)',
              padding: '50px 40px',
              borderRadius: '30px',
              border: '2px solid rgba(240, 147, 251, 0.3)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textAlign: 'center'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-10px)';
              e.currentTarget.style.boxShadow = '0 20px 50px rgba(240, 147, 251, 0.4)';
              e.currentTarget.style.border = '2px solid rgba(240, 147, 251, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.border = '2px solid rgba(240, 147, 251, 0.3)';
            }}
          >
            <div style={{ fontSize: '80px', marginBottom: '20px' }}>📊</div>
            <h2 style={{ fontSize: '36px', fontWeight: '900', marginBottom: '15px' }}>
              My Dashboard
            </h2>
            <p style={{ fontSize: '20px', color: '#aaa', lineHeight: '1.6' }}>
              Track your submissions, check win status, and manage your competition entries
            </p>
          </div>

          {/* Winners Gallery Card */}
          <div
            onClick={() => navigate('/winners')}
            style={{
              background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 140, 0, 0.2) 100%)',
              padding: '50px 40px',
              borderRadius: '30px',
              border: '2px solid rgba(255, 215, 0, 0.3)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textAlign: 'center'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-10px)';
              e.currentTarget.style.boxShadow = '0 20px 50px rgba(255, 215, 0, 0.4)';
              e.currentTarget.style.border = '2px solid rgba(255, 215, 0, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.border = '2px solid rgba(255, 215, 0, 0.3)';
            }}
          >
            <div style={{ fontSize: '80px', marginBottom: '20px' }}>🏆</div>
            <h2 style={{ fontSize: '36px', fontWeight: '900', marginBottom: '15px' }}>
              Winners Gallery
            </h2>
            <p style={{ fontSize: '20px', color: '#aaa', lineHeight: '1.6' }}>
              View weekly winners, browse winning designs, and see the competition leaderboard
            </p>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div style={{
        background: 'rgba(0,0,0,0.5)',
        padding: '80px 40px',
        borderTop: '2px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '56px',
            fontWeight: '900',
            textAlign: 'center',
            marginBottom: '60px',
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            How It Works
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '40px'
          }}>
            {/* Step 1 */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '72px',
                marginBottom: '20px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px auto',
                boxShadow: '0 10px 30px rgba(102, 126, 234, 0.5)'
              }}>
                1
              </div>
              <h3 style={{ fontSize: '28px', fontWeight: '800', marginBottom:'15px' }}>
                View 3D Cars
              </h3>
              <p style={{ fontSize: '20px', color: '#aaa', lineHeight: '1.6' }}>
                Explore 16 car models in our interactive 3D viewer. Download reference parts.
              </p>
            </div>

            {/* Step 2 */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '72px',
                marginBottom: '20px',
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px auto',
                boxShadow: '0 10px 30px rgba(240, 147, 251, 0.5)'
              }}>
                2
              </div>
              <h3 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '15px' }}>
                Create in Blender
              </h3>
              <p style={{ fontSize: '20px', color: '#aaa', lineHeight: '1.6' }}>
                Design custom car parts using Blender. Export as .glb file.
              </p>
            </div>

            {/* Step 3 */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '72px',
                marginBottom: '20px',
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px auto',
                boxShadow: '0 10px 30px rgba(79, 172, 254, 0.5)'
              }}>
                3
              </div>
              <h3 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '15px' }}>
                Submit & Vote
              </h3>
              <p style={{ fontSize: '20px', color: '#aaa', lineHeight: '1.6' }}>
                Upload your part, vote on 25 entries to qualify, and win prizes!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Prizes Section */}
      <div style={{ padding: '80px 40px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontSize: '56px',
            fontWeight: '900',
            marginBottom: '30px',
            background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            🎁 Amazing Prizes
          </h2>

          <div style={{
            background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 140, 0, 0.1) 100%)',
            padding: '50px',
            borderRadius: '30px',
            border: '3px solid rgba(255, 215, 0, 0.3)',
            marginBottom: '30px'
          }}>
            <h3 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '20px', color: '#FFD700' }}>
              First 10 Weeks Only! ⚡
            </h3>
            <ul style={{ fontSize: '24px', textAlign: 'left', lineHeight: '2', listStyle: 'none', padding: 0 }}>
              <li>✅ <strong>Lifetime Premium Access</strong></li>
              <li>✅ <strong>Full Part Library</strong> Access</li>
              <li>✅ <strong>Free Entry</strong> to All Future Competitions</li>
              <li>✅ <strong>£50 Grand Prize</strong> for Best Overall</li>
            </ul>
          </div>

          <p style={{ fontSize: '20px', color: '#ff6b6b', fontWeight: '700' }}>
            ⚠️ After Week 10: Only £50 weekly cash prizes!
          </p>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        background: 'rgba(0,0,0,0.5)',
        padding: '40px',
        textAlign: 'center',
        borderTop: '2px solid rgba(255,255,255,0.1)'
      }}>
        <p style={{ fontSize: '18px', color: '#666', marginBottom: '10px' }}>
          © 2025 CarMod Showdown. All rights reserved.
        </p>
        <p style={{ fontSize: '16px', color: '#444' }}>
          Built with ❤️ for car enthusiasts and 3D creators
        </p>
      </div>
    </div>
  );
}

// ========================================
// 🗳️ VOTING PANEL COMPONENT
// ========================================
function VotingPanel({ userId, onClose }) {
  const [entries, setEntries] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [votesCompleted, setVotesCompleted] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadVotingBatch();
    }
  }, [userId]);

  const loadVotingBatch = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/voting/batch/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setEntries(data.entries);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error loading voting batch:', error);
      alert('Failed to load entries for voting');
    }
  };

  const handleVote = async (voteValue) => {
    const currentEntry = entries[currentIndex];
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('${process.env.REACT_APP_API_URL}/api/vote', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          voterId: userId,
          submissionId: currentEntry.id,
          voteValue: voteValue
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setVotesCompleted(data.votesCompleted);
        
        if (data.qualified) {
          alert('🎉 ' + data.message);
          onClose();
        } else if (currentIndex < entries.length - 1) {
          setCurrentIndex(currentIndex + 1);
        } else {
          alert(`✅ Voting complete! You've voted on ${data.votesCompleted} entries.`);
          onClose();
        }
      }
    } catch (error) {
      console.error('Error submitting vote:', error);
      alert('Failed to submit vote');
    }
  };

  if (!userId) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.9)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          background: '#1a1a1a',
          padding: '40px',
          borderRadius: '16px',
          border: '3px solid #2196F3',
          textAlign: 'center',
        }}>
          <h2 style={{ color: '#2196F3', fontSize: '32px', marginBottom: '20px' }}>Please Login First</h2>
          <p style={{ color: '#fff', fontSize: '18px', marginBottom: '30px' }}>You need to be logged in to vote on entries.</p>
          <button
            onClick={onClose}
            style={{
              padding: '15px 40px',
              fontSize: '18px',
              background: '#2196F3',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: '800',
            }}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.9)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ color: '#fff', fontSize: '24px' }}>Loading entries...</div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.9)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          background: '#1a1a1a',
          padding: '40px',
          borderRadius: '16px',
          border: '3px solid #2196F3',
          textAlign: 'center',
        }}>
          <h2 style={{ color: '#2196F3', fontSize: '32px', marginBottom: '20px' }}>No More Entries</h2>
          <p style={{ color: '#fff', fontSize: '18px', marginBottom: '30px' }}>
            You've voted on all available entries! Check back later for more submissions.
          </p>
          <button
            onClick={onClose}
            style={{
              padding: '15px 40px',
              fontSize: '18px',
              background: '#2196F3',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: '800',
            }}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const currentEntry = entries[currentIndex];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.9)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      overflow: 'auto',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '800px',
        background: '#1a1a1a',
        border: '3px solid #2196F3',
        borderRadius: '16px',
        padding: '30px',
      }}>
        <div style={{ marginBottom: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h2 style={{ color: '#2196F3', margin: 0, fontSize: '32px', fontWeight: '800' }}>
              🗳️ Vote on Submissions
            </h2>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#fff',
                fontSize: '36px',
                cursor: 'pointer',
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>
          
          <div style={{ color: '#4CAF50', fontSize: '18px', fontWeight: '700', marginBottom: '10px' }}>
            Progress: {votesCompleted} / 25 votes
          </div>
          
          <div style={{
            width: '100%',
            height: '20px',
            background: '#222',
            borderRadius: '10px',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${(votesCompleted / 25) * 100}%`,
              background: 'linear-gradient(90deg, #4CAF50 0%, #8BC34A 100%)',
              transition: 'width 0.3s ease',
            }} />
          </div>
        </div>

        <div style={{
          background: '#222',
          padding: '30px',
          borderRadius: '12px',
          border: '3px solid #333',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
          }}>
            <h3 style={{ color: '#9C27B0', fontSize: '28px', fontWeight: '800', margin: 0 }}>
              {currentEntry.anonymous_id}
            </h3>
            <span style={{ color: '#666', fontSize: '16px' }}>
              Entry {currentIndex + 1} of {entries.length}
            </span>
          </div>

          <div style={{
            background: '#0a0a0a',
            borderRadius: '15px',
            height: '300px',
            marginBottom: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '72px',
          }}>
            🚗
          </div>

          <div style={{ marginBottom: '30px' }}>
            <p style={{ fontSize: '18px', color: '#aaa', marginBottom: '10px' }}>
              <strong style={{ color: '#fff' }}>Part:</strong> {currentEntry.part_name}
            </p>
            <p style={{ fontSize: '18px', color: '#aaa', marginBottom: '10px' }}>
              <strong style={{ color: '#fff' }}>Type:</strong> {currentEntry.part_type}
            </p>
            <p style={{ fontSize: '18px', color: '#aaa', marginBottom: '10px' }}>
              <strong style={{ color: '#fff' }}>Car:</strong> {currentEntry.car_model}
            </p>
            {currentEntry.description && (
              <p style={{ fontSize: '18px', color: '#aaa', marginBottom: '10px' }}>
                <strong style={{ color: '#fff' }}>Description:</strong> {currentEntry.description}
              </p>
            )}
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
          }}>
            <button
              onClick={() => handleVote(0)}
              style={{
                padding: '20px',
                fontSize: '20px',
                fontWeight: '800',
                background: '#f44336',
                color: '#fff',
                border: 'none',
                borderRadius: '15px',
                cursor: 'pointer',
              }}
            >
              👎 Not Good
            </button>
            <button
              onClick={() => handleVote(1)}
              style={{
                padding: '20px',
                fontSize: '20px',
                fontWeight: '800',
                background: '#4CAF50',
                color: '#fff',
                border: 'none',
                borderRadius: '15px',
                cursor: 'pointer',
              }}
            >
              👍 Good
            </button>
          </div>
        </div>

        <div style={{
          marginTop: '20px',
          padding: '15px',
          background: '#2d1810',
          borderRadius: '10px',
          border: '2px solid #4a2818',
          textAlign: 'center',
        }}>
          <p style={{ color: '#FFA500', fontSize: '16px', margin: 0 }}>
            ⚠️ Vote on 25 entries to qualify your submission for winning!
          </p>
        </div>
      </div>
    </div>
  );
}

// ========================================
// 📊 STATUS PANEL COMPONENT
// ========================================
function StatusPanel({ userId, onClose }) {
  const [submission, setSubmission] = useState(null);
  const [votesCompleted, setVotesCompleted] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadSubmissionStatus();
    }
  }, [userId]);

  const loadSubmissionStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/submission/status/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setSubmission(data.submission);
        setVotesCompleted(data.votesCompleted);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error loading submission status:', error);
      setLoading(false);
    }
  };

  if (!userId) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.9)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          background: '#1a1a1a',
          padding: '40px',
          borderRadius: '16px',
          border: '3px solid #9C27B0',
          textAlign: 'center',
        }}>
          <h2 style={{ color: '#9C27B0', fontSize: '32px', marginBottom: '20px' }}>Please Login First</h2>
          <p style={{ color: '#fff', fontSize: '18px', marginBottom: '30px' }}>You need to be logged in to view your status.</p>
          <button
            onClick={onClose}
            style={{
              padding: '15px 40px',
              fontSize: '18px',
              background: '#9C27B0',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: '800',
            }}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.9)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ color: '#fff', fontSize: '24px' }}>Loading your status...</div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.9)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          background: '#1a1a1a',
          padding: '40px',
          borderRadius: '16px',
          border: '3px solid #9C27B0',
          textAlign: 'center',
        }}>
          <h2 style={{ color: '#9C27B0', fontSize: '32px', marginBottom: '20px' }}>No Submission Yet</h2>
          <p style={{ color: '#fff', fontSize: '18px', marginBottom: '30px' }}>
            You haven't submitted an entry yet. Go to CarMod Creator to submit your custom car part!
          </p>
          <button
            onClick={onClose}
            style={{
              padding: '15px 40px',
              fontSize: '18px',
              background: '#9C27B0',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: '800',
            }}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.9)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      overflow: 'auto',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '700px',
        background: '#1a1a1a',
        border: '3px solid #9C27B0',
        borderRadius: '16px',
        padding: '30px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h2 style={{ color: '#9C27B0', margin: 0, fontSize: '32px', fontWeight: '800' }}>
            📊 Your Submission Status
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#fff',
              fontSize: '36px',
              cursor: 'pointer',
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        <div style={{
          background: '#222',
          padding: '25px',
          borderRadius: '12px',
          border: '3px solid #333',
          marginBottom: '25px',
        }}>
          <div style={{ fontSize: '24px', color: '#9C27B0', fontWeight: '800', marginBottom: '15px' }}>
            {submission.anonymous_id}
          </div>
          <div style={{ fontSize: '18px', color: '#fff', marginBottom: '10px' }}>
            <strong>Part Name:</strong> {submission.part_name}
          </div>
          <div style={{ fontSize: '18px', color: '#fff', marginBottom: '10px' }}>
            <strong>Type:</strong> {submission.part_type}
          </div>
          <div style={{ fontSize: '18px', color: '#fff', marginBottom: '10px' }}>
            <strong>Car Model:</strong> {submission.car_model}
          </div>
        </div>

        {submission.status === 'PENDING' ? (
          <div style={{
            background: '#2d1810',
            padding: '25px',
            borderRadius: '12px',
            border: '3px solid #4a2818',
          }}>
            <div style={{
              display: 'inline-block',
              padding: '10px 20px',
              background: '#FF9800',
              color: '#000',
              fontWeight: '800',
              borderRadius: '50px',
              marginBottom: '20px',
              fontSize: '18px',
            }}>
              ⏳ PENDING QUALIFICATION
            </div>
            
            <p style={{ color: '#FFA500', fontSize: '18px', fontWeight: '700', marginBottom: '10px' }}>
              Your entry is NOT eligible to win yet!
            </p>
            <p style={{ color: '#fff', fontSize: '20px', fontWeight: '800', marginBottom: '20px' }}>
              Vote on 25 entries to qualify for winning
            </p>

            <div style={{
              width: '100%',
              height: '20px',
              background: '#222',
              borderRadius: '10px',
              overflow: 'hidden',
              marginBottom: '10px',
            }}>
              <div style={{
                height: '100%',
                width: `${(votesCompleted / 25) * 100}%`,
                background: 'linear-gradient(90deg, #FF9800 0%, #F57C00 100%)',
                transition: 'width 0.3s ease',
              }} />
            </div>
            
            <div style={{ color: '#FF9800', fontSize: '18px', fontWeight: '700', marginBottom: '30px' }}>
              {votesCompleted} / 25 votes completed
            </div>

            <button
              onClick={onClose}
              style={{
                width: '100%',
                padding: '18px',
                fontSize: '20px',
                fontWeight: '800',
                background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
              }}
            >
              Close (Click Vote button to start voting)
            </button>
          </div>
        ) : (
          <div style={{
            background: '#1a2d1e',
            padding: '25px',
            borderRadius: '12px',
            border: '3px solid #2d4a38',
          }}>
            <div style={{
              display: 'inline-block',
              padding: '10px 20px',
              background: '#4CAF50',
              color: '#fff',
              fontWeight: '800',
              borderRadius: '50px',
              marginBottom: '20px',
              fontSize: '18px',
            }}>
              ✅ QUALIFIED
            </div>
            
            <p style={{ color: '#4CAF50', fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>
              Your entry is eligible to win! 🏆
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '15px',
              fontSize: '18px',
              color: '#fff',
            }}>
              <div>
                <div style={{ color: '#aaa', fontSize: '14px' }}>Times Shown</div>
                <div style={{ fontSize: '24px', fontWeight: '800' }}>👀 {submission.times_shown || 0}</div>
              </div>
              <div>
                <div style={{ color: '#aaa', fontSize: '14px' }}>Total Votes</div>
                <div style={{ fontSize: '24px', fontWeight: '800' }}>🗳️ {submission.total_votes || 0}</div>
              </div>
              <div>
                <div style={{ color: '#aaa', fontSize: '14px' }}>Approval</div>
                <div style={{ fontSize: '24px', fontWeight: '800', color: '#4CAF50' }}>
                  📊 {submission.total_votes > 0 ? Math.round((submission.thumbs_up / submission.total_votes) * 100) : 0}%
                </div>
              </div>
            </div>

            <div style={{
              marginTop: '20px',
              padding: '15px',
              background: '#0f2415',
              borderRadius: '8px',
              textAlign: 'center',
            }}>
              <p style={{ color: '#4CAF50', fontSize: '16px', margin: 0 }}>
                ✅ Keep voting to help other creators qualify too!
              </p>
            </div>

            <button
              onClick={onClose}
              style={{
                width: '100%',
                marginTop: '20px',
                padding: '18px',
                fontSize: '20px',
                fontWeight: '800',
                background: '#4CAF50',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;