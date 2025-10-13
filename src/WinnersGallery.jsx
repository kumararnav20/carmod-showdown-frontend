import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function WinnersGallery() {
  const navigate = useNavigate();
  const [winners, setWinners] = useState([]);

  useEffect(() => {
    fetchWinners();
  }, []);

  const fetchWinners = async () => {
    try {
      const response = await fetch('${process.env.REACT_APP_API_URL}/api/weekly-winners');
      const data = await response.json();
      if (response.ok && data.winners) {
        setWinners(data.winners);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
        padding: '40px',
        color: '#fff',
      }}
    >
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <h1
          style={{
            fontSize: '56px',
            fontWeight: '900',
            textAlign: 'center',
            marginBottom: '50px',
            background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          🏆 Winners Gallery
        </h1>

        {winners.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: '80px', marginBottom: '20px' }}>🎯</div>
            <h2 style={{ fontSize: '32px', marginBottom: '15px' }}>No Winners Yet!</h2>
            <p style={{ fontSize: '20px', color: '#888' }}>
              Be the first to win this week's competition!
            </p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: '30px',
            }}
          >
            {winners.map((winner) => (
              <div
                key={winner.id}
                style={{
                  background:
                    'linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 140, 0, 0.15) 100%)',
                  padding: '30px',
                  borderRadius: '20px',
                  border: '3px solid #FFD700',
                  boxShadow: '0 10px 30px rgba(255, 215, 0, 0.3)',
                }}
              >
                <div
                  style={{
                    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                    padding: '10px 20px',
                    borderRadius: '50px',
                    fontSize: '18px',
                    fontWeight: '900',
                    color: '#000',
                    marginBottom: '20px',
                    display: 'inline-block',
                  }}
                >
                  🏆 Week {winner.week_number} Winner
                </div>

                <h3 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '15px' }}>
                  {winner.part_name}
                </h3>

                <p style={{ fontSize: '20px', color: '#aaa', marginBottom: '10px' }}>
                  👤 {winner.user_name}
                </p>
                <p style={{ fontSize: '18px', color: '#888', marginBottom: '10px' }}>
                  📦 {winner.part_type}
                </p>
                <p style={{ fontSize: '18px', color: '#888', marginBottom: '20px' }}>
                  🚗 {winner.car_model}
                </p>

                {/* ✅ FIXED ANCHOR TAG */}
                <a
                  href={winner.file_path}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'block',
                    padding: '14px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: '#fff',
                    textDecoration: 'none',
                    fontSize: '18px',
                    fontWeight: '700',
                    textAlign: 'center',
                  }}
                >
                  📥 View 3D Model
                </a>
              </div>
            ))}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '60px' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '18px 40px',
              fontSize: '22px',
              borderRadius: '50px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '800',
              boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)',
            }}
          >
            🏠 Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default WinnersGallery;
