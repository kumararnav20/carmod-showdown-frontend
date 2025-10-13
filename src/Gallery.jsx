import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';

function Gallery() {
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCarModel, setFilterCarModel] = useState('all');
  const [filterPartType, setFilterPartType] = useState('all');
  const [searchText, setSearchText] = useState('');
  const viewerRef = useRef(null);

  const carModels = [
    'Aston Martin Valkyrie', 'BMW', 'BMW 507', 'BMW E38 Cyberbody',
    'BMW F22 Eurofighter', 'BMW M4 Competition', 'BMW M5 F90',
    'Ferrari SF90', 'BMW M3 E30', 'Mercedes 190E Evo 1982',
    'Mercedes R-Class', 'Porsche 911 GT3 RS', 'Rolls Royce Boattail',
    'Rolls Royce Cullinan', 'Rolls Royce Ghost', 'Universal'
  ];

  const partTypes = [
    'Front Bumper', 'Rear Bumper', 'Side Skirt', 'Wheel/Rim', 'Hood',
    'Trunk/Boot', 'Spoiler/Wing', 'Diffuser', 'Grille', 'Mirror',
    'Door', 'Fender', 'Exhaust', 'Headlight', 'Taillight', 'Roof', 'Other'
  ];

  useEffect(() => {
    fetchSubmissions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [submissions, filterStatus, filterCarModel, filterPartType, searchText]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/gallery');
      const data = await response.json();
      
      if (response.ok) {
        // Map file_path to file_url for consistency
        const mappedSubmissions = (data.submissions || []).map(sub => ({
          ...sub,
          file_url: sub.file_path || sub.file_url
        }));
        setSubmissions(mappedSubmissions);
      } else {
        console.error('Failed to fetch submissions:', data.error);
        alert('Failed to load submissions');
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
      alert('Error loading gallery. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedSubmission && viewerRef.current) {
      load3DModel(selectedSubmission.file_url || selectedSubmission.file_path);
    }
  }, [selectedSubmission]);

  const load3DModel = async (fileUrl) => {
    if (!viewerRef.current) return;

    // Clear previous content
    viewerRef.current.innerHTML = '';

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);

    const camera = new THREE.PerspectiveCamera(
      50,
      viewerRef.current.clientWidth / viewerRef.current.clientHeight,
      0.1,
      1000
    );

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(viewerRef.current.clientWidth, viewerRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    viewerRef.current.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Ground
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    scene.add(ground);

    const gridHelper = new THREE.GridHelper(20, 20, 0x666666, 0x444444);
    scene.add(gridHelper);

    // Load model
    try {
      const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
      const loader = new GLTFLoader();

      loader.load(
        fileUrl,
        (gltf) => {
          const model = gltf.scene;

          // Center and scale model
          const box = new THREE.Box3().setFromObject(model);
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());

          model.position.x = -center.x;
          model.position.z = -center.z;
          model.position.y = -box.min.y;

          const maxDim = Math.max(size.x, size.y, size.z);
          if (maxDim > 3) {
            const scale = 3 / maxDim;
            model.scale.multiplyScalar(scale);
          }

          model.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });

          scene.add(model);

          // Camera position
          camera.position.set(4, 3, 4);
          camera.lookAt(0, 1, 0);
        },
        undefined,
        (error) => {
          console.error('Error loading 3D model:', error);
        }
      );
    } catch (error) {
      console.error('Error loading GLTFLoader:', error);
    }

    // Controls
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let cameraRadius = 6;
    let cameraTheta = Math.PI / 4;
    let cameraPhi = Math.PI / 4;

    const updateCamera = () => {
      camera.position.x = cameraRadius * Math.sin(cameraPhi) * Math.cos(cameraTheta);
      camera.position.y = cameraRadius * Math.cos(cameraPhi);
      camera.position.z = cameraRadius * Math.sin(cameraPhi) * Math.sin(cameraTheta);
      camera.lookAt(0, 1, 0);
    };

    const onMouseDown = (e) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e) => {
      if (isDragging) {
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;

        cameraTheta -= deltaX * 0.01;
        cameraPhi -= deltaY * 0.01;
        cameraPhi = Math.max(0.1, Math.min(Math.PI - 0.1, cameraPhi));

        updateCamera();
        previousMousePosition = { x: e.clientX, y: e.clientY };
      }
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e) => {
      e.preventDefault();
      cameraRadius += e.deltaY * 0.01;
      cameraRadius = Math.max(2, Math.min(15, cameraRadius));
      updateCamera();
    };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('wheel', onWheel);

    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('mouseup', onMouseUp);
      renderer.domElement.removeEventListener('wheel', onWheel);
      if (viewerRef.current && renderer.domElement) {
        viewerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  };

  const applyFilters = () => {
    let filtered = [...submissions];

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(sub => sub.status === filterStatus);
    }

    // Filter by car model
    if (filterCarModel !== 'all') {
      filtered = filtered.filter(sub => sub.car_model === filterCarModel);
    }

    // Filter by part type
    if (filterPartType !== 'all') {
      filtered = filtered.filter(sub => sub.part_type === filterPartType);
    }

    // Filter by search text
    if (searchText) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(sub => 
        sub.part_name.toLowerCase().includes(search) ||
        sub.user_name.toLowerCase().includes(search) ||
        sub.description?.toLowerCase().includes(search)
      );
    }

    setFilteredSubmissions(filtered);
  };

  const openViewer = (submission) => {
    setSelectedSubmission(submission);
  };

  const closeViewer = () => {
    setSelectedSubmission(null);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { color: '#FFA500', bg: '#2d1810', border: '#4a2818', text: '⏳ Pending' },
      approved: { color: '#4CAF50', bg: '#1a2d1e', border: '#2d4a38', text: '✅ Approved' },
      winner: { color: '#FFD700', bg: '#2d2810', border: '#4a4418', text: '🏆 Winner' },
      rejected: { color: '#f44336', bg: '#2d1010', border: '#4a1818', text: '❌ Rejected' }
    };
    
    const badge = badges[status] || badges.pending;
    
    return (
      <span style={{
        padding: '8px 16px',
        borderRadius: '8px',
        background: badge.bg,
        color: badge.color,
        border: `2px solid ${badge.border}`,
        fontSize: '16px',
        fontWeight: '800',
      }}>
        {badge.text}
      </span>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
        borderBottom: '3px solid #333',
        padding: '30px 20px',
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h1 style={{ fontSize: '48px', fontWeight: '900', margin: 0, color: '#9C27B0' }}>
              🎨 Submissions Gallery
            </h1>
            <button
              onClick={() => window.location.href = '/carmod'}
              style={{
                padding: '16px 32px',
                fontSize: '20px',
                borderRadius: '12px',
                background: '#222',
                color: '#fff',
                border: '3px solid #555',
                cursor: 'pointer',
                fontWeight: '800',
              }}
            >
              🏠 Back to CarMod
            </button>
          </div>
          
          <p style={{ fontSize: '20px', color: '#aaa', margin: 0 }}>
            Browse all custom car parts from our talented community
          </p>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        background: '#111',
        borderBottom: '2px solid #222',
        padding: '25px 20px',
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            marginBottom: '20px',
          }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '16px', fontWeight: '700' }}>
                🔍 Search
              </label>
              <input
                type="text"
                placeholder="Search by name, part, creator..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px',
                  fontSize: '16px',
                  borderRadius: '10px',
                  background: '#1a1a1a',
                  color: '#fff',
                  border: '2px solid #333',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '16px', fontWeight: '700' }}>
                📊 Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px',
                  fontSize: '16px',
                  borderRadius: '10px',
                  background: '#1a1a1a',
                  color: '#fff',
                  border: '2px solid #333',
                  cursor: 'pointer',
                }}
              >
                <option value="all">All Status</option>
                <option value="pending">⏳ Pending</option>
                <option value="approved">✅ Approved</option>
                <option value="winner">🏆 Winners Only</option>
                <option value="rejected">❌ Rejected</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '16px', fontWeight: '700' }}>
                🚗 Car Model
              </label>
              <select
                value={filterCarModel}
                onChange={(e) => setFilterCarModel(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px',
                  fontSize: '16px',
                  borderRadius: '10px',
                  background: '#1a1a1a',
                  color: '#fff',
                  border: '2px solid #333',
                  cursor: 'pointer',
                }}
              >
                <option value="all">All Models</option>
                {carModels.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '16px', fontWeight: '700' }}>
                🔧 Part Type
              </label>
              <select
                value={filterPartType}
                onChange={(e) => setFilterPartType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px',
                  fontSize: '16px',
                  borderRadius: '10px',
                  background: '#1a1a1a',
                  color: '#fff',
                  border: '2px solid #333',
                  cursor: 'pointer',
                }}
              >
                <option value="all">All Parts</option>
                {partTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: '18px', color: '#888', margin: 0 }}>
              Showing <strong style={{ color: '#9C27B0' }}>{filteredSubmissions.length}</strong> of {submissions.length} submissions
            </p>
            <button
              onClick={() => {
                setFilterStatus('all');
                setFilterCarModel('all');
                setFilterPartType('all');
                setSearchText('');
              }}
              style={{
                padding: '12px 24px',
                fontSize: '16px',
                borderRadius: '8px',
                background: '#333',
                color: '#fff',
                border: '2px solid #555',
                cursor: 'pointer',
                fontWeight: '700',
              }}
            >
              🔄 Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 20px' }}>
        {loading ? (
          <div style={{
            textAlign: 'center',
            padding: '100px 20px',
            fontSize: '24px',
            color: '#888',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
            Loading submissions...
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '100px 20px',
            fontSize: '24px',
            color: '#888',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>📭</div>
            No submissions found matching your filters
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '30px',
          }}>
            {filteredSubmissions.map((submission, index) => (
              <div
                key={submission.id || index}
                style={{
                  background: '#1a1a1a',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '3px solid #333',
                  transition: 'transform 0.2s, border-color 0.2s',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.borderColor = '#9C27B0';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = '#333';
                }}
                onClick={() => openViewer(submission)}
              >
                {/* Thumbnail */}
                <div style={{
                  background: 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)',
                  height: '250px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '72px',
                  borderBottom: '2px solid #333',
                }}>
                  🎨
                </div>

                {/* Info */}
                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <h3 style={{
                      fontSize: '22px',
                      fontWeight: '800',
                      margin: 0,
                      color: '#fff',
                      flex: 1,
                    }}>
                      {submission.part_name}
                    </h3>
                    {getStatusBadge(submission.status)}
                  </div>

                  <p style={{
                    fontSize: '16px',
                    color: '#888',
                    margin: '0 0 12px 0',
                  }}>
                    By <strong style={{ color: '#9C27B0' }}>{submission.user_name}</strong>
                  </p>

                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    flexWrap: 'wrap',
                    marginBottom: '12px',
                  }}>
                    <span style={{
                      padding: '6px 12px',
                      background: '#2a2a2a',
                      borderRadius: '6px',
                      fontSize: '14px',
                      color: '#4CAF50',
                    }}>
                      🚗 {submission.car_model}
                    </span>
                    <span style={{
                      padding: '6px 12px',
                      background: '#2a2a2a',
                      borderRadius: '6px',
                      fontSize: '14px',
                      color: '#2196F3',
                    }}>
                      🔧 {submission.part_type}
                    </span>
                  </div>

                  {submission.description && (
                    <p style={{
                      fontSize: '14px',
                      color: '#aaa',
                      margin: '12px 0 0 0',
                      lineHeight: '1.6',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}>
                      {submission.description}
                    </p>
                  )}

                  <button
                    style={{
                      width: '100%',
                      marginTop: '16px',
                      padding: '14px',
                      fontSize: '18px',
                      fontWeight: '800',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)',
                      color: '#fff',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    👁️ View in 3D
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3D Viewer Modal */}
      {selectedSubmission && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.95)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}>
          <div style={{
            width: '100%',
            maxWidth: '1200px',
            height: '90vh',
            background: '#1a1a1a',
            borderRadius: '20px',
            border: '3px solid #9C27B0',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '20px 30px',
              borderBottom: '2px solid #333',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div>
                <h2 style={{ fontSize: '32px', fontWeight: '900', margin: '0 0 8px 0', color: '#9C27B0' }}>
                  {selectedSubmission.part_name}
                </h2>
                <p style={{ fontSize: '18px', color: '#888', margin: 0 }}>
                  By <strong>{selectedSubmission.user_name}</strong> • {selectedSubmission.car_model} • {selectedSubmission.part_type}
                </p>
              </div>
              <button
                onClick={closeViewer}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#fff',
                  fontSize: '48px',
                  cursor: 'pointer',
                  lineHeight: 1,
                  padding: 0,
                }}
              >
                ×
              </button>
            </div>

            {/* 3D Viewer */}
            <div style={{
              flex: 1,
              background: '#0a0a0a',
              position: 'relative',
            }}>
              <div ref={viewerRef} style={{ width: '100%', height: '100%' }} />
              <div style={{
                position: 'absolute',
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(0,0,0,0.8)',
                padding: '12px 24px',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                fontWeight: '600',
                pointerEvents: 'none',
              }}>
                🖱️ Click + Drag to Rotate • Scroll to Zoom
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '20px 30px',
              borderTop: '2px solid #333',
              background: '#111',
            }}>
              {selectedSubmission.description && (
                <p style={{ fontSize: '16px', color: '#aaa', margin: '0 0 16px 0', lineHeight: '1.6' }}>
                  <strong style={{ color: '#fff' }}>Description:</strong> {selectedSubmission.description}
                </p>
              )}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                {getStatusBadge(selectedSubmission.status)}
                <span style={{ color: '#666', fontSize: '14px' }}>
                  Submitted: {new Date(selectedSubmission.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Gallery;