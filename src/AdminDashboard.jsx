import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const navigate = useNavigate();

  // Fetch all submissions
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

      const response = await fetch('${process.env.REACT_APP_API_URL}/api/admin/submissions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 403) {
        alert('⛔ Admin access required!');
        navigate('/');
        return;
      }

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

  const selectWinner = async (submissionId) => {
    if (!window.confirm('Are you sure you want to select this as the winner?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/select-winner/${submissionId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        alert('🏆 Winner selected successfully!');
        fetchSubmissions(); // Refresh the list
      } else {
        alert('❌ Failed to select winner: ' + data.error);
      }
    } catch (err) {
      console.error('Error selecting winner:', err);
      alert('❌ Failed to select winner');
    }
  };

  // Filter submissions
  const filteredSubmissions = submissions.filter(sub => {
    const weekMatch = selectedWeek === 'all' || sub.week_number === parseInt(selectedWeek);
    const statusMatch = filterStatus === 'all' || 
                       (filterStatus === 'winner' && sub.is_winner) ||
                       (filterStatus === 'pending' && !sub.is_winner);
    return weekMatch && statusMatch;
  });

  // Get unique weeks
  const weeks = [...new Set(submissions.map(s => s.week_number))].sort((a, b) => b - a);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '32px',
        fontWeight: '700'
      }}>
        Loading submissions...
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
        fontSize: '28px',
        color: '#f44',
        fontWeight: '700'
      }}>
        ❌ {error}
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '40px', 
      background: '#0a0a0a', 
      minHeight: '100vh',
      color: '#fff'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ 
          fontSize: '48px', 
          fontWeight: '900', 
          margin: '0 0 10px 0',
          background: 'linear-gradient(135deg, #FF9800, #F57C00)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          🔧 Admin Dashboard
        </h1>
        <p style={{ fontSize: '20px', color: '#888', margin: 0 }}>
          Manage submissions and select weekly winners
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        <div style={{ 
          background: '#1a1a1a', 
          padding: '30px', 
          borderRadius: '12px',
          border: '2px solid #333'
        }}>
          <div style={{ fontSize: '48px', fontWeight: '900', color: '#4CAF50' }}>
            {submissions.length}
          </div>
          <div style={{ fontSize: '18px', color: '#888', marginTop: '8px' }}>
            Total Submissions
          </div>
        </div>

        <div style={{ 
          background: '#1a1a1a', 
          padding: '30px', 
          borderRadius: '12px',
          border: '2px solid #333'
        }}>
          <div style={{ fontSize: '48px', fontWeight: '900', color: '#FFD700' }}>
            {submissions.filter(s => s.is_winner).length}
          </div>
          <div style={{ fontSize: '18px', color: '#888', marginTop: '8px' }}>
            Winners Selected
          </div>
        </div>

        <div style={{ 
          background: '#1a1a1a', 
          padding: '30px', 
          borderRadius: '12px',
          border: '2px solid #333'
        }}>
          <div style={{ fontSize: '48px', fontWeight: '900', color: '#2196F3' }}>
            {submissions.filter(s => !s.is_winner).length}
          </div>
          <div style={{ fontSize: '18px', color: '#888', marginTop: '8px' }}>
            Pending Review
          </div>
        </div>

        <div style={{ 
          background: '#1a1a1a', 
          padding: '30px', 
          borderRadius: '12px',
          border: '2px solid #333'
        }}>
          <div style={{ fontSize: '48px', fontWeight: '900', color: '#FF9800' }}>
            {weeks.length}
          </div>
          <div style={{ fontSize: '18px', color: '#888', marginTop: '8px' }}>
            Active Weeks
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ 
        background: '#1a1a1a', 
        padding: '25px', 
        borderRadius: '12px',
        marginBottom: '30px',
        border: '2px solid #333',
        display: 'flex',
        gap: '20px',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <div>
          <label style={{ 
            display: 'block', 
            fontSize: '18px', 
            fontWeight: '700', 
            marginBottom: '8px',
            color: '#fff'
          }}>
            Filter by Week:
          </label>
          <select
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value)}
            style={{
              padding: '12px 20px',
              fontSize: '18px',
              borderRadius: '8px',
              background: '#222',
              color: '#fff',
              border: '2px solid #555',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            <option value="all">All Weeks</option>
            {weeks.map(week => (
              <option key={week} value={week}>Week {week}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ 
            display: 'block', 
            fontSize: '18px', 
            fontWeight: '700', 
            marginBottom: '8px',
            color: '#fff'
          }}>
            Filter by Status:
          </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              padding: '12px 20px',
              fontSize: '18px',
              borderRadius: '8px',
              background: '#222',
              color: '#fff',
              border: '2px solid #555',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending Only</option>
            <option value="winner">Winners Only</option>
          </select>
        </div>

        <div style={{ marginLeft: 'auto' }}>
          <button
            onClick={fetchSubmissions}
            style={{
              padding: '12px 24px',
              fontSize: '18px',
              borderRadius: '8px',
              background: '#4CAF50',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '700'
            }}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Submissions Table */}
      <div style={{ 
        background: '#1a1a1a', 
        borderRadius: '12px',
        border: '2px solid #333',
        overflow: 'hidden'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            fontSize: '16px'
          }}>
            <thead>
              <tr style={{ background: '#222' }}>
                <th style={{ padding: '20px', textAlign: 'left', fontWeight: '800', fontSize: '18px', borderBottom: '2px solid #333' }}>Week</th>
                <th style={{ padding: '20px', textAlign: 'left', fontWeight: '800', fontSize: '18px', borderBottom: '2px solid #333' }}>User</th>
                <th style={{ padding: '20px', textAlign: 'left', fontWeight: '800', fontSize: '18px', borderBottom: '2px solid #333' }}>Part Name</th>
                <th style={{ padding: '20px', textAlign: 'left', fontWeight: '800', fontSize: '18px', borderBottom: '2px solid #333' }}>Type</th>
                <th style={{ padding: '20px', textAlign: 'left', fontWeight: '800', fontSize: '18px', borderBottom: '2px solid #333' }}>Car Model</th>
                <th style={{ padding: '20px', textAlign: 'left', fontWeight: '800', fontSize: '18px', borderBottom: '2px solid #333' }}>Status</th>
                <th style={{ padding: '20px', textAlign: 'left', fontWeight: '800', fontSize: '18px', borderBottom: '2px solid #333' }}>File</th>
                <th style={{ padding: '20px', textAlign: 'left', fontWeight: '800', fontSize: '18px', borderBottom: '2px solid #333' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ 
                    padding: '40px', 
                    textAlign: 'center',
                    fontSize: '20px',
                    color: '#888'
                  }}>
                    No submissions found
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map(sub => (
                  <tr key={sub.id} style={{ 
                    borderBottom: '1px solid #222',
                    background: sub.is_winner ? '#1a3a1a' : 'transparent'
                  }}>
                    <td style={{ padding: '20px', fontSize: '18px', fontWeight: '700' }}>
                      Week {sub.week_number}
                    </td>
                    <td style={{ padding: '20px', fontSize: '16px' }}>
                      <div style={{ fontWeight: '700' }}>{sub.user_name}</div>
                      <div style={{ fontSize: '14px', color: '#888' }}>{sub.email}</div>
                    </td>
                    <td style={{ padding: '20px', fontSize: '16px', fontWeight: '600' }}>
                      {sub.part_name}
                    </td>
                    <td style={{ padding: '20px', fontSize: '16px' }}>
                      {sub.part_type}
                    </td>
                    <td style={{ padding: '20px', fontSize: '16px' }}>
                      {sub.car_model}
                    </td>
                    <td style={{ padding: '20px' }}>
                      {sub.is_winner ? (
                        <span style={{ 
                          background: '#FFD700', 
                          color: '#000', 
                          padding: '6px 12px', 
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontWeight: '800'
                        }}>
                          🏆 WINNER
                        </span>
                      ) : (
                        <span style={{ 
                          background: '#333', 
                          color: '#fff', 
                          padding: '6px 12px', 
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontWeight: '600'
                        }}>
                          Pending
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '20px' }}>
                      <a 
                        href={sub.file_path} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{
                          color: '#2196F3',
                          textDecoration: 'none',
                          fontSize: '16px',
                          fontWeight: '600'
                        }}
                      >
                        📥 View File
                      </a>
                    </td>
                    <td style={{ padding: '20px' }}>
                      {!sub.is_winner && (
                        <button
                          onClick={() => selectWinner(sub.id)}
                          style={{
                            padding: '10px 20px',
                            fontSize: '16px',
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, #FF9800, #F57C00)',
                            color: '#fff',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: '700'
                          }}
                        >
                          Select Winner
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;