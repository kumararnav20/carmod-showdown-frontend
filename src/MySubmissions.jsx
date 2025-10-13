import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function MySubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all'); // all, winner, pending
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('Please login first!');
        navigate('/login');
        return;
      }

      const response = await fetch('${process.env.REACT_APP_API_URL}/api/my-submissions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        setSubmissions(data.submissions);
        setLoading(false);
      } else {
        setError(data.error || 'Failed to fetch submissions');
        setLoading(false);
      }
    } catch (err) {
      console.error('Error fetching submissions:', err);
      setError('Failed to connect to server');
      setLoading(false);
    }
  };

  // Filter submissions based on selected filter
  const filteredSubmissions = submissions.filter(sub => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'winner') return sub.is_winner;
    if (filterStatus === 'pending') return !sub.is_winner;
    return true;
  });

  // Count stats
  const totalSubmissions = submissions.length;
  const winnerCount = submissions.filter(s => s.is_winner).length;
  const pendingCount = submissions.filter(s => !s.is_winner).length;

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#0a0a0a',
        color: '#fff',
        fontSize: '32px',
        fontWeight: '700'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>⏳</div>
          Loading your submissions...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#0a0a0a',
        color: '#f44',
        fontSize: '28px',
        fontWeight: '700',
        flexDirection: 'column'
      }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>❌</div>
        {error}
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
      padding: '40px 20px',
      color: '#fff'
    }}>
      {/* Container */}
      <div style={{ 
        maxWidth: '1400px', 
        margin: '0 auto'
      }}>
        
        {/* Header */}
        <div style={{ marginBottom: '40px', textAlign: 'center' }}>
          <h1 style={{ 
            fontSize: '56px', 
            fontWeight: '900', 
            margin: '0 0 15px 0',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 30px rgba(102, 126, 234, 0.3)'
          }}>
            🎨 My Submissions
          </h1>
          <p style={{ 
            fontSize: '22px', 
            color: '#888', 
            margin: 0,
            fontWeight: '500'
          }}>
            Track your competition entries and wins
          </p>
        </div>

        {/* Stats Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '25px',
          marginBottom: '50px'
        }}>
          {/* Total Submissions Card */}
          <div style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '35px', 
            borderRadius: '20px',
            boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            cursor: 'pointer',
            border: '2px solid rgba(255,255,255,0.1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 15px 40px rgba(102, 126, 234, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 10px 30px rgba(102, 126, 234, 0.3)';
          }}>
            <div style={{ fontSize: '54px', fontWeight: '900', color: '#fff', marginBottom: '10px' }}>
              {totalSubmissions}
            </div>
            <div style={{ fontSize: '20px', color: 'rgba(255,255,255,0.9)', fontWeight: '600' }}>
              Total Submissions
            </div>
          </div>

          {/* Winners Card */}
          <div style={{ 
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            padding: '35px', 
            borderRadius: '20px',
            boxShadow: '0 10px 30px rgba(240, 147, 251, 0.3)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            cursor: 'pointer',
            border: '2px solid rgba(255,255,255,0.1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 15px 40px rgba(240, 147, 251, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 10px 30px rgba(240, 147, 251, 0.3)';
          }}>
            <div style={{ fontSize: '54px', fontWeight: '900', color: '#fff', marginBottom: '10px' }}>
              🏆 {winnerCount}
            </div>
            <div style={{ fontSize: '20px', color: 'rgba(255,255,255,0.9)', fontWeight: '600' }}>
              Wins
            </div>
          </div>

          {/* Pending Card */}
          <div style={{ 
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            padding: '35px', 
            borderRadius: '20px',
            boxShadow: '0 10px 30px rgba(79, 172, 254, 0.3)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            cursor: 'pointer',
            border: '2px solid rgba(255,255,255,0.1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 15px 40px rgba(79, 172, 254, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 10px 30px rgba(79, 172, 254, 0.3)';
          }}>
            <div style={{ fontSize: '54px', fontWeight: '900', color: '#fff', marginBottom: '10px' }}>
              {pendingCount}
            </div>
            <div style={{ fontSize: '20px', color: 'rgba(255,255,255,0.9)', fontWeight: '600' }}>
              Pending Review
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div style={{ 
          display: 'flex',
          gap: '15px',
          marginBottom: '40px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => setFilterStatus('all')}
            style={{
              padding: '16px 32px',
              fontSize: '20px',
              borderRadius: '50px',
              background: filterStatus === 'all' 
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                : 'rgba(255,255,255,0.1)',
              color: '#fff',
              border: filterStatus === 'all' ? '2px solid #667eea' : '2px solid rgba(255,255,255,0.2)',
              cursor: 'pointer',
              fontWeight: '700',
              transition: 'all 0.3s ease',
              boxShadow: filterStatus === 'all' ? '0 5px 15px rgba(102, 126, 234, 0.4)' : 'none'
            }}
          >
            All ({totalSubmissions})
          </button>

          <button
            onClick={() => setFilterStatus('winner')}
            style={{
              padding: '16px 32px',
              fontSize: '20px',
              borderRadius: '50px',
              background: filterStatus === 'winner' 
                ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' 
                : 'rgba(255,255,255,0.1)',
              color: '#fff',
              border: filterStatus === 'winner' ? '2px solid #f093fb' : '2px solid rgba(255,255,255,0.2)',
              cursor: 'pointer',
              fontWeight: '700',
              transition: 'all 0.3s ease',
              boxShadow: filterStatus === 'winner' ? '0 5px 15px rgba(240, 147, 251, 0.4)' : 'none'
            }}
          >
            🏆 Winners ({winnerCount})
          </button>

          <button
            onClick={() => setFilterStatus('pending')}
            style={{
              padding: '16px 32px',
              fontSize: '20px',
              borderRadius: '50px',
              background: filterStatus === 'pending' 
                ? 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' 
                : 'rgba(255,255,255,0.1)',
              color: '#fff',
              border: filterStatus === 'pending' ? '2px solid #4facfe' : '2px solid rgba(255,255,255,0.2)',
              cursor: 'pointer',
              fontWeight: '700',
              transition: 'all 0.3s ease',
              boxShadow: filterStatus === 'pending' ? '0 5px 15px rgba(79, 172, 254, 0.4)' : 'none'
            }}
          >
            Pending ({pendingCount})
          </button>
        </div>

        {/* No Submissions Message */}
        {filteredSubmissions.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '80px 20px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '20px',
            border: '2px dashed rgba(255,255,255,0.2)'
          }}>
            <div style={{ fontSize: '80px', marginBottom: '20px' }}>📦</div>
            <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '15px' }}>
              No submissions yet
            </h2>
            <p style={{ fontSize: '20px', color: '#888', marginBottom: '30px' }}>
              Start creating custom car parts and join the competition!
            </p>
            <button
              onClick={() => navigate('/carmod')}
              style={{
                padding: '18px 40px',
                fontSize: '22px',
                borderRadius: '50px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '700',
                boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)'
              }}
            >
              Create Your First Part 🚀
            </button>
          </div>
        )}

        {/* Submissions Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
          gap: '30px'
        }}>
          {filteredSubmissions.map(sub => (
            <div 
              key={sub.id} 
              style={{
                background: sub.is_winner 
                  ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 140, 0, 0.15) 100%)'
                  : 'rgba(255,255,255,0.05)',
                padding: '30px',
                borderRadius: '20px',
                border: sub.is_winner 
                  ? '3px solid #FFD700' 
                  : '2px solid rgba(255,255,255,0.1)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: sub.is_winner 
                  ? '0 10px 40px rgba(255, 215, 0, 0.3)'
                  : '0 5px 20px rgba(0,0,0,0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = sub.is_winner
                  ? '0 15px 50px rgba(255, 215, 0, 0.5)'
                  : '0 10px 30px rgba(102, 126, 234, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = sub.is_winner
                  ? '0 10px 40px rgba(255, 215, 0, 0.3)'
                  : '0 5px 20px rgba(0,0,0,0.3)';
              }}
            >
              {/* Winner Badge */}
              {sub.is_winner && (
                <div style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                  padding: '10px 20px',
                  borderRadius: '50px',
                  fontSize: '18px',
                  fontWeight: '900',
                  color: '#000',
                  boxShadow: '0 5px 15px rgba(255, 215, 0, 0.5)',
                  animation: 'pulse 2s infinite'
                }}>
                  🏆 WINNER!
                </div>
              )}

              {/* Part Name */}
              <h3 style={{ 
                fontSize: '28px', 
                fontWeight: '800', 
                marginBottom: '15px',
                color: '#fff',
                marginTop: sub.is_winner ? '50px' : '0'
              }}>
                {sub.part_name}
              </h3>

              {/* Details */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ 
                  fontSize: '18px', 
                  color: '#aaa', 
                  marginBottom: '10px',
                  fontWeight: '600'
                }}>
                  <span style={{ color: '#667eea' }}>📦</span> {sub.part_type}
                </div>
                <div style={{ 
                  fontSize: '18px', 
                  color: '#aaa', 
                  marginBottom: '10px',
                  fontWeight: '600'
                }}>
                  <span style={{ color: '#667eea' }}>🚗</span> {sub.car_model}
                </div>
                <div style={{ 
                  fontSize: '18px', 
                  color: '#aaa', 
                  marginBottom: '10px',
                  fontWeight: '600'
                }}>
                  <span style={{ color: '#667eea' }}>📅</span> Week {sub.week_number}
                </div>
                <div style={{ 
                  fontSize: '18px', 
                  color: '#aaa',
                  fontWeight: '600'
                }}>
                  <span style={{ color: '#667eea' }}>📊</span> {(sub.file_size / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>

              {/* Status Badge */}
              <div style={{ marginBottom: '25px' }}>
                {sub.is_winner ? (
                  <span style={{ 
                    background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                    color: '#fff', 
                    padding: '10px 20px', 
                    borderRadius: '50px',
                    fontSize: '16px',
                    fontWeight: '800',
                    display: 'inline-block',
                    boxShadow: '0 5px 15px rgba(76, 175, 80, 0.4)'
                  }}>
                    ✅ Winner - Premium Active
                  </span>
                ) : (
                  <span style={{ 
                    background: 'rgba(255,255,255,0.1)',
                    color: '#FFD700', 
                    padding: '10px 20px', 
                    borderRadius: '50px',
                    fontSize: '16px',
                    fontWeight: '800',
                    display: 'inline-block',
                    border: '2px solid rgba(255, 215, 0, 0.3)'
                  }}>
                    ⏳ Under Review
                  </span>
                )}
              </div>

              {/* Download Button */}
              <a 
                href={sub.file_path} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  display: 'block',
                  padding: '16px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: '#fff',
                  textDecoration: 'none',
                  fontSize: '20px',
                  fontWeight: '700',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 5px 15px rgba(102, 126, 234, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 5px 15px rgba(102, 126, 234, 0.3)';
                }}
              >
                📥 Download File
              </a>

              {/* Date */}
              <div style={{ 
                marginTop: '20px',
                fontSize: '16px',
                color: '#666',
                textAlign: 'center',
                fontWeight: '600'
              }}>
                Submitted: {new Date(sub.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Back Button */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: '60px'
        }}>
          <button
            onClick={() => navigate('/carmod')}
            style={{
              padding: '20px 50px',
              fontSize: '24px',
              borderRadius: '50px',
              background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '800',
              boxShadow: '0 10px 30px rgba(255, 152, 0, 0.4)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 15px 40px rgba(255, 152, 0, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(255, 152, 0, 0.4)';
            }}
          >
            ✨ Create New Submission
          </button>
        </div>
      </div>

      {/* Add pulse animation for winner badge */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
      `}</style>
    </div>
  );
}

export default MySubmissions;