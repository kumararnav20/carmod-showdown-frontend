import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

function CarMod() {
  const mountRef = useRef(null);
  const [selectedCar, setSelectedCar] = useState('bmw_e38_cyberbody.glb');
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(null);
  const [debugInfo, setDebugInfo] = useState('Initializing...');
  const [carParts, setCarParts] = useState([]);
  const [showModPanel, setShowModPanel] = useState(false);
  const [showUploadPanel, setShowUploadPanel] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showGalleryPanel, setShowGalleryPanel] = useState(false);
  const [showVotingPanel, setShowVotingPanel] = useState(false);
  const [showStatusPanel, setShowStatusPanel] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [selectedParts, setSelectedParts] = useState([]);
  const [panelWidth, setPanelWidth] = useState(550);
  const [isDraggingResize, setIsDraggingResize] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [uploadData, setUploadData] = useState({
    userName: '',
    email: '',
    partName: '',
    partType: '',
    carModel: '',
    description: '',
    file: null,
    agreedToTerms: false
  });
  const modelRef = useRef(null);

  const cars = [
    { name: 'Aston Martin Valkyrie', file: 'aston_martin_valkyrie.glb' },
    { name: 'BMW', file: 'bmw.glb' },
    { name: 'BMW 507', file: 'bmw_507.glb' },
    { name: 'BMW E38 Cyberbody', file: 'bmw_e38_cyberbody.glb' },
    { name: 'BMW F22 Eurofighter', file: 'bmw_f22_eurofighter_free.glb', offset: { y: 0.4 } },
    { name: 'BMW M4 Competition', file: 'bmw_m4_competition.glb' },
    { name: 'BMW M5 F90', file: 'bmw_m5_f90.glb' },
    { name: 'Ferrari SF90', file: 'ferrari_sf90.glb' },
    { name: 'BMW M3 E30', file: 'free_bmw_m3_e30.glb' },
    { name: 'Mercedes 190E Evo 1982', file: 'mercedes_190e_evo_1982_3d_model_free.glb' },
    { name: 'Mercedes R-Class', file: 'mercedes_r-class.glb' },
    { name: 'Porsche 911 GT3 RS', file: 'porsche_911_gt3_rs.glb' },
    { name: 'Rolls Royce Boattail', file: 'rolls_royce_boattail.glb' },
    { name: 'Rolls Royce Cullinan', file: 'rolls_royce_cullinan.glb', offset: { z: -7.0 } },
    { name: 'Rolls Royce Ghost', file: 'rolls_royce_ghost.glb' },
    { name: 'Rolls Royce Ghost Alt', file: 'rolls-royce_ghost.glb' },
  ];

  const partTypes = [
    'Front Bumper', 'Rear Bumper', 'Side Skirt', 'Wheel/Rim', 'Hood', 'Trunk/Boot',
    'Spoiler/Wing', 'Diffuser', 'Grille', 'Mirror', 'Door', 'Fender', 'Exhaust',
    'Headlight', 'Taillight', 'Roof', 'Other'
  ];

  useEffect(() => {
    const token = localStorage.getItem('token');
    const adminStatus = localStorage.getItem('isAdmin');
    const userId = localStorage.getItem('userId');
    setIsLoggedIn(!!token);
    setIsAdmin(adminStatus === 'true');
    setCurrentUserId(userId ? parseInt(userId) : null);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDraggingResize) {
        const newWidth = window.innerWidth - e.clientX;
        setPanelWidth(Math.max(400, Math.min(900, newWidth)));
      }
    };

    const handleMouseUp = () => {
      setIsDraggingResize(false);
    };

    if (isDraggingResize) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingResize]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['.glb', '.gltf'];
      const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      
      if (!validTypes.includes(fileExtension)) {
        alert('Please upload a .glb or .gltf file');
        return;
      }
      
      if (file.size > 50 * 1024 * 1024) {
        alert('File size must be less than 50MB');
        return;
      }
      
      setUploadData(prev => ({ ...prev, file: file }));
    }
  };

  const handleSubmitUpload = async (e) => {
    e.preventDefault();
    
    if (!uploadData.userName || !uploadData.email || !uploadData.partName || 
        !uploadData.partType || !uploadData.carModel || !uploadData.file || 
        !uploadData.agreedToTerms) {
      alert('❌ Please fill in all required fields and agree to the terms');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(uploadData.email)) {
      alert('❌ Please enter a valid email address');
      return;
    }
    
    const formData = new FormData();
    formData.append('userName', uploadData.userName);
    formData.append('email', uploadData.email);
    formData.append('partName', uploadData.partName);
    formData.append('partType', uploadData.partType);
    formData.append('carModel', uploadData.carModel);
    formData.append('description', uploadData.description);
    formData.append('file', uploadData.file);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('❌ Please login first!');
        return;
      }
      
      const response = await fetch('${process.env.REACT_APP_API_URL}/api/upload-part', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert('✅ ' + data.message);
        
        setUploadData({
          userName: '',
          email: '',
          partName: '',
          partType: '',
          carModel: '',
          description: '',
          file: null,
          agreedToTerms: false
        });
        
        setShowUploadPanel(false);
        
        // Show the status panel to remind them to vote
        setTimeout(() => {
          setShowStatusPanel(true);
        }, 1000);
        
      } else {
        alert('❌ Upload failed: ' + (data.error || 'Please try again'));
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      alert('❌ Upload failed. Please check your connection and try again.');
    }
  };

  const togglePartVisibility = (partName) => {
    if (modelRef.current) {
      modelRef.current.traverse((child) => {
        if (child.isMesh && child.name === partName) {
          child.visible = !child.visible;
        }
      });
      
      setCarParts(prev => 
        prev.map(part => 
          part.name === partName 
            ? { ...part, visible: !part.visible }
            : part
        )
      );
    }
  };

  const changePartColor = (partName, color) => {
    if (modelRef.current) {
      modelRef.current.traverse((child) => {
        if (child.isMesh && child.name === partName) {
          if (child.material) {
            child.material = child.material.clone();
            child.material.color.set(color);
          }
        }
      });
      
      setCarParts(prev => 
        prev.map(part => 
          part.name === partName 
            ? { ...part, color: color }
            : part
        )
      );
    }
  };

  const togglePartSelection = (partName) => {
    setSelectedParts(prev => {
      if (prev.includes(partName)) {
        return prev.filter(p => p !== partName);
      } else {
        return [...prev, partName];
      }
    });
  };

  const hideAllExceptSelected = () => {
    if (modelRef.current) {
      modelRef.current.traverse((child) => {
        if (child.isMesh) {
          child.visible = selectedParts.includes(child.name);
        }
      });
      
      setCarParts(prev => 
        prev.map(part => ({
          ...part,
          visible: selectedParts.includes(part.name)
        }))
      );
    }
  };

  const showAllParts = () => {
    if (modelRef.current) {
      modelRef.current.traverse((child) => {
        if (child.isMesh) {
          child.visible = true;
        }
      });
      
      setCarParts(prev => 
        prev.map(part => ({
          ...part,
          visible: true
        }))
      );
    }
  };

  const colorSelectedParts = (color) => {
    selectedParts.forEach(partName => {
      changePartColor(partName, color);
    });
  };

  const exportPartAsGLB = async (partName) => {
    if (!modelRef.current) return;

    try {
      let partToExport = null;
      modelRef.current.traverse((child) => {
        if (child.isMesh && child.name === partName) {
          partToExport = child;
        }
      });

      if (!partToExport) {
        alert('Part not found!');
        return;
      }

      const clonedPart = partToExport.clone();
      const tempScene = new THREE.Scene();
      tempScene.add(clonedPart);

      const { GLTFExporter } = await import('three/examples/jsm/exporters/GLTFExporter.js');
      const exporter = new GLTFExporter();

      exporter.parse(
        tempScene,
        (result) => {
          const blob = new Blob([result], { type: 'application/octet-stream' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${partName}_reference.glb`;
          link.click();
          URL.revokeObjectURL(url);
          
          alert(`✅ Downloaded ${partName}!`);
        },
        (error) => {
          console.error('Export error:', error);
          alert('Failed to export part. Please try again.');
        },
        { binary: true }
      );
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export part.');
    }
  };

  const setPartLabel = (partName, label) => {
    setCarParts(prev =>
      prev.map(part =>
        part.name === partName
          ? { ...part, label: label }
          : part
      )
    );
  };

  const downloadBlenderGuide = () => {
    const guide = `CAR PART CUSTOMIZATION GUIDE - Full instructions for creating custom car parts`;
    const blob = new Blob([guide], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Car_Part_Guide.txt';
    link.click();
    URL.revokeObjectURL(url);
    alert('📖 Guide downloaded!');
  };

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    setDebugInfo('Setting up scene...');

    let scene, camera, renderer, currentModel;
    let isDragging = false;
    let isPanning = false;
    let previousMousePosition = { x: 0, y: 0 };
    let cameraRadius = 8;
    let cameraTheta = 0;
    let cameraPhi = Math.PI / 4;
    let cameraTarget = new THREE.Vector3(0, 1, 0);
    let panOffset = new THREE.Vector3(0, 0, 0);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);

    camera = new THREE.PerspectiveCamera(
      50,
      currentMount.clientWidth / currentMount.clientHeight,
      0.1,
      1000
    );
    
    const updateCameraPosition = () => {
      camera.position.x = cameraRadius * Math.sin(cameraPhi) * Math.cos(cameraTheta) + panOffset.x;
      camera.position.y = cameraRadius * Math.cos(cameraPhi) + panOffset.y;
      camera.position.z = cameraRadius * Math.sin(cameraPhi) * Math.sin(cameraTheta) + panOffset.z;
      camera.lookAt(cameraTarget.x + panOffset.x, cameraTarget.y + panOffset.y, cameraTarget.z + panOffset.z);
    };
    
    updateCameraPosition();

    try {
      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
      renderer.shadowMap.enabled = true;
      currentMount.appendChild(renderer.domElement);
    } catch (error) {
      setLoadingError('Failed to create renderer');
      return;
    }

    const testCube = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true })
    );
    testCube.position.set(0, 0.5, 0);
    scene.add(testCube);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const groundGeometry = new THREE.PlaneGeometry(50, 50);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    scene.add(ground);

    const gridHelper = new THREE.GridHelper(50, 50, 0x666666, 0x444444);
    scene.add(gridHelper);

    const onMouseDown = (e) => {
      if (e.button === 2 || e.button === 1) {
        isPanning = true;
        e.preventDefault();
      } else if (e.button === 0) {
        isDragging = true;
      }
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e) => {
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;
      
      if (isDragging) {
        cameraTheta -= deltaX * 0.01;
        cameraPhi -= deltaY * 0.01;
        cameraPhi = Math.max(0.1, Math.min(Math.PI - 0.1, cameraPhi));
        updateCameraPosition();
      } else if (isPanning) {
        const panSpeed = 0.005 * cameraRadius;
        const right = new THREE.Vector3();
        const up = new THREE.Vector3(0, 1, 0);
        
        camera.getWorldDirection(right);
        right.cross(up).normalize();
        
        panOffset.add(right.multiplyScalar(-deltaX * panSpeed));
        panOffset.y += deltaY * panSpeed;
        
        updateCameraPosition();
      }
      
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
      isPanning = false;
    };

    const onWheel = (e) => {
      e.preventDefault();
      const zoomSpeed = 0.1;
      cameraRadius += e.deltaY * zoomSpeed * 0.01;
      cameraRadius = Math.max(2, Math.min(20, cameraRadius));
      updateCameraPosition();
    };

    const onContextMenu = (e) => {
      e.preventDefault();
    };

    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('wheel', onWheel, { passive: false });
    document.addEventListener('contextmenu', onContextMenu);

    const loadCar = async () => {
      setIsLoading(true);
      setCarParts([]);
      setSelectedParts([]);

      try {
        const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
        const loader = new GLTFLoader();

        loader.load(
          `/models/${selectedCar}`,
          (gltf) => {
            scene.remove(testCube);
            
            if (currentModel) {
              scene.remove(currentModel);
            }

            currentModel = gltf.scene;
            modelRef.current = currentModel;

            const parts = [];
            currentModel.traverse((child) => {
              if (child.isMesh) {
                const bbox = new THREE.Box3().setFromObject(child);
                const center = bbox.getCenter(new THREE.Vector3());
                const size = bbox.getSize(new THREE.Vector3());
                
                let autoLabel = 'body';
                
                if (size.x < 1 && size.z < 1 && center.y < 0.5) {
                  autoLabel = 'wheel';
                } else if (center.z > 1.5) {
                  autoLabel = 'front';
                } else if (center.z < -1.5) {
                  autoLabel = 'rear';
                } else if (center.y > 1) {
                  autoLabel = 'top';
                }
                
                parts.push({
                  name: child.name,
                  visible: true,
                  color: child.material?.color ? '#' + child.material.color.getHexString() : '#ffffff',
                  position: { x: center.x.toFixed(2), y: center.y.toFixed(2), z: center.z.toFixed(2) },
                  size: { x: size.x.toFixed(2), y: size.y.toFixed(2), z: size.z.toFixed(2) },
                  label: autoLabel
                });
              }
            });
            
            setCarParts(parts);

            const box = new THREE.Box3().setFromObject(currentModel);
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());

            currentModel.position.x = -center.x;
            currentModel.position.z = -center.z;
            currentModel.position.y = -box.min.y;

            const maxDim = Math.max(size.x, size.y, size.z);
            if (maxDim > 3) {
              const scale = 3 / maxDim;
              currentModel.scale.multiplyScalar(scale);
              
              const newBox = new THREE.Box3().setFromObject(currentModel);
              const newCenter = newBox.getCenter(new THREE.Vector3());
              currentModel.position.x = -newCenter.x;
              currentModel.position.z = -newCenter.z;
              currentModel.position.y = -newBox.min.y;
            }

            const carConfig = cars.find(c => c.file === selectedCar);
            if (carConfig?.offset) {
              if (carConfig.offset.x) currentModel.position.x += carConfig.offset.x;
              if (carConfig.offset.y) currentModel.position.y += carConfig.offset.y;
              if (carConfig.offset.z) currentModel.position.z += carConfig.offset.z;
            }

            currentModel.traverse((child) => {
              if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
              }
            });

            scene.add(currentModel);
            setIsLoading(false);
            setDebugInfo(`Loaded: ${parts.length} parts`);
          },
          undefined,
          (error) => {
            setLoadingError(`Failed to load car`);
            setIsLoading(false);
          }
        );
      } catch (error) {
        setLoadingError('Failed to load');
        setIsLoading(false);
      }
    };

    loadCar();

    const animate = () => {
      requestAnimationFrame(animate);
      if (testCube.parent) {
        testCube.rotation.y += 0.01;
      }
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!currentMount) return;
      const width = currentMount.clientWidth;
      const height = currentMount.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('wheel', onWheel);
      document.removeEventListener('contextmenu', onContextMenu);
      
      if (currentMount && renderer.domElement && currentMount.contains(renderer.domElement)) {
        currentMount.removeChild(renderer.domElement);
      }
      
      if (renderer) {
        renderer.dispose();
      }
    };
  }, [selectedCar]);

  const filteredParts = carParts.filter(part => 
    part.name.toLowerCase().includes(filterText.toLowerCase()) ||
    part.label.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000', position: 'relative', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10,
        display: 'flex',
        gap: '20px',
        flexWrap: 'wrap',
        justifyContent: 'center',
        maxWidth: '95vw',
      }}>
        <button
          onClick={() => window.location.href = '/'}
          style={{
            padding: '22px 40px',
            fontSize: '26px',
            borderRadius: '14px',
            background: '#222',
            color: '#fff',
            border: '3px solid #555',
            cursor: 'pointer',
            fontWeight: '800',
          }}
        >
          🏠 Home
        </button>

        <select
          value={selectedCar}
          onChange={(e) => setSelectedCar(e.target.value)}
          style={{
            padding: '22px 40px',
            fontSize: '26px',
            borderRadius: '14px',
            background: '#222',
            color: '#fff',
            border: '3px solid #555',
            cursor: 'pointer',
            fontWeight: '800',
          }}
        >
          {cars.map((car) => (
            <option key={car.file} value={car.file}>
              {car.name}
            </option>
          ))}
        </select>

        <button
          onClick={() => setShowModPanel(!showModPanel)}
          disabled={carParts.length === 0}
          style={{
            padding: '22px 40px',
            fontSize: '26px',
            borderRadius: '14px',
            background: carParts.length === 0 ? '#333' : (showModPanel ? '#4CAF50' : '#222'),
            color: carParts.length === 0 ? '#666' : '#fff',
            border: showModPanel ? '3px solid #4CAF50' : '3px solid #555',
            cursor: carParts.length === 0 ? 'not-allowed' : 'pointer',
            fontWeight: '800',
          }}
        >
          🔧 Parts ({carParts.length})
        </button>

        <button
          onClick={() => setShowVotingPanel(!showVotingPanel)}
          style={{
            padding: '22px 40px',
            fontSize: '26px',
            borderRadius: '14px',
            background: showVotingPanel ? '#2196F3' : '#222',
            color: '#fff',
            border: showVotingPanel ? '3px solid #2196F3' : '3px solid #555',
            cursor: 'pointer',
            fontWeight: '800',
          }}
        >
          🗳️ Vote
        </button>

        <button
          onClick={() => setShowStatusPanel(!showStatusPanel)}
          style={{
            padding: '22px 40px',
            fontSize: '26px',
            borderRadius: '14px',
            background: showStatusPanel ? '#9C27B0' : '#222',
            color: '#fff',
            border: showStatusPanel ? '3px solid #9C27B0' : '3px solid #555',
            cursor: 'pointer',
            fontWeight: '800',
          }}
        >
          📊 My Status
        </button>

        <button
          onClick={() => setShowGalleryPanel(!showGalleryPanel)}
          style={{
            padding: '22px 40px',
            fontSize: '26px',
            borderRadius: '14px',
            background: showGalleryPanel ? '#9C27B0' : '#222',
            color: '#fff',
            border: showGalleryPanel ? '3px solid #9C27B0' : '3px solid #555',
            cursor: 'pointer',
            fontWeight: '800',
          }}
        >
          🏆 Gallery
        </button>

        {isAdmin && (
          <button
            onClick={() => setShowAdminPanel(!showAdminPanel)}
            style={{
              padding: '22px 40px',
              fontSize: '26px',
              borderRadius: '14px',
              background: showAdminPanel ? '#f44336' : '#222',
              color: '#fff',
              border: showAdminPanel ? '3px solid #f44336' : '3px solid #555',
              cursor: 'pointer',
              fontWeight: '800',
            }}
          >
            ⚙️ Admin
          </button>
        )}

        <button
          onClick={() => setShowUploadPanel(!showUploadPanel)}
          style={{
            padding: '22px 40px',
            fontSize: '26px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
            color: '#fff',
            border: '3px solid #FFB74D',
            cursor: 'pointer',
            fontWeight: '900',
            boxShadow: '0 6px 16px rgba(255,152,0,0.5)',
          }}
        >
          🏆 Win Access!
        </button>
      </div>

      {showModPanel && carParts.length > 0 && (
        <>
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: panelWidth,
              bottom: 0,
              width: '10px',
              background: 'transparent',
              cursor: 'ew-resize',
              zIndex: 15,
            }}
            onMouseDown={() => setIsDraggingResize(true)}
          >
            <div style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: '4px',
              height: '60px',
              background: '#555',
              borderRadius: '2px',
            }} />
          </div>

          <div 
            style={{
              position: 'absolute',
              top: '90px',
              right: '0',
              bottom: '0',
              width: `${panelWidth}px`,
              background: 'rgba(0,0,0,0.95)',
              border: '3px solid #444',
              borderRight: 'none',
              borderRadius: '16px 0 0 0',
              padding: '30px',
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
            }}
            onWheel={(e) => e.stopPropagation()}
          >
            <h3 style={{ color: '#fff', margin: '0 0 25px 0', fontSize: '42px', fontWeight: '900' }}>
              🔧 Part Manager
            </h3>

            <input
              type="text"
              placeholder="🔍 Search parts..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              style={{
                width: '100%',
                padding: '20px',
                marginBottom: '20px',
                borderRadius: '12px',
                background: '#222',
                color: '#fff',
                border: '3px solid #555',
                fontSize: '24px',
                fontWeight: '700',
              }}
            />

            <div style={{ 
              display: 'flex', 
              gap: '14px', 
              marginBottom: '24px',
              flexWrap: 'wrap',}}>
              <button
                onClick={showAllParts}
                style={{
                  padding: '18px 28px',
                  fontSize: '22px',
                  borderRadius: '10px',
                  background: '#4CAF50',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '800',
                }}
              >
                👁️ Show All
              </button>
              <button
                onClick={hideAllExceptSelected}
                disabled={selectedParts.length === 0}
                style={{
                  padding: '18px 28px',
                  fontSize: '22px',
                  borderRadius: '10px',
                  background: selectedParts.length === 0 ? '#333' : '#ff9800',
                  color: '#fff',
                  border: 'none',
                  cursor: selectedParts.length === 0 ? 'not-allowed' : 'pointer',
                  fontWeight: '800',
                }}
              >
                🎯 Isolate ({selectedParts.length})
              </button>
              <button
                onClick={downloadBlenderGuide}
                style={{
                  padding: '18px 28px',
                  fontSize: '22px',
                  borderRadius: '10px',
                  background: '#9C27B0',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '800',
                }}
              >
                📖 Guide
              </button>
            </div>

            {selectedParts.length > 0 && (
              <div style={{
                padding: '20px',
                background: '#1a4d2e',
                borderRadius: '12px',
                marginBottom: '24px',
                border: '3px solid #2d7a4f',
              }}>
                <label style={{ color: '#fff', fontSize: '22px', display: 'block', marginBottom: '14px', fontWeight: '800' }}>
                  🎨 Color Selected Parts:
                </label>
                <input
                  type="color"
                  onChange={(e) => colorSelectedParts(e.target.value)}
                  style={{
                    width: '100%',
                    height: '60px',
                    border: '3px solid #2d7a4f',
                    borderRadius: '10px',
                    cursor: 'pointer',
                  }}
                />
              </div>
            )}
            
            <div style={{ fontSize: '20px', color: '#aaa', marginBottom: '20px', fontWeight: '800' }}>
              Showing {filteredParts.length} of {carParts.length} parts
            </div>

            <div 
              style={{ 
                flex: 1, 
                overflowY: 'auto',
                overflowX: 'hidden',
              }}
              onWheel={(e) => e.stopPropagation()}
            >
              {filteredParts.map((part, index) => (
                <div key={index} style={{
                  background: selectedParts.includes(part.name) ? '#1a3a5a' : '#222',
                  padding: '20px',
                  marginBottom: '16px',
                  borderRadius: '12px',
                  border: selectedParts.includes(part.name) ? '4px solid #4CAF50' : '3px solid #333',
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px',
                  }}>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                      <input
                        type="checkbox"
                        checked={selectedParts.includes(part.name)}
                        onChange={() => togglePartSelection(part.name)}
                        style={{ 
                          marginRight: '16px', 
                          cursor: 'pointer',
                          width: '28px',
                          height: '28px',
                          accentColor: '#4CAF50',
                        }}
                      />
                      <span style={{
                        color: part.visible ? '#fff' : '#666',
                        fontSize: '22px',
                        fontFamily: 'monospace',
                        fontWeight: '800',
                      }}>
                        {part.name}
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        onClick={() => exportPartAsGLB(part.name)}
                        title="Download this part"
                        style={{
                          padding: '14px 20px',
                          fontSize: '24px',
                          borderRadius: '10px',
                          background: '#2196F3',
                          color: '#fff',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        📥
                      </button>
                      <button
                        onClick={() => togglePartVisibility(part.name)}
                        style={{
                          padding: '14px 20px',
                          fontSize: '24px',
                          borderRadius: '10px',
                          background: part.visible ? '#4CAF50' : '#f44',
                          color: '#fff',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        {part.visible ? '👁️' : '🚫'}
                      </button>
                    </div>
                  </div>

                  <div style={{ fontSize: '18px', color: '#ddd', marginBottom: '14px', fontFamily: 'monospace', fontWeight: '700', lineHeight: '1.8' }}>
                    📍 Position: ({part.position.x}, {part.position.y}, {part.position.z})<br/>
                    📏 Size: ({part.size.x}, {part.size.y}, {part.size.z})
                  </div>

                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <select
                      value={part.label}
                      onChange={(e) => setPartLabel(part.name, e.target.value)}
                      style={{
                        flex: 1,
                        padding: '14px',
                        fontSize: '20px',
                        borderRadius: '10px',
                        background: '#333',
                        color: '#fff',
                        border: '3px solid #555',
                        cursor: 'pointer',
                        fontWeight: '800',
                      }}
                    >
                      <option value="body">Body</option>
                      <option value="wheel">Wheel</option>
                      <option value="front">Front</option>
                      <option value="rear">Rear</option>
                      <option value="top">Top</option>
                      <option value="bumper">Bumper</option>
                      <option value="door">Door</option>
                      <option value="hood">Hood</option>
                      <option value="trunk">Trunk</option>
                      <option value="window">Window</option>
                      <option value="mirror">Mirror</option>
                      <option value="light">Light</option>
                      <option value="grille">Grille</option>
                      <option value="spoiler">Spoiler</option>
                    </select>

                    <input
                      type="color"
                      value={part.color}
                      onChange={(e) => changePartColor(part.name, e.target.value)}
                      style={{
                        width: '70px',
                        height: '56px',
                        border: '3px solid #666',
                        borderRadius: '10px',
                        cursor: 'pointer',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* VOTING PANEL */}
      {showVotingPanel && <VotingPanel userId={currentUserId} onClose={() => setShowVotingPanel(false)} />}

      {/* STATUS PANEL */}
      {showStatusPanel && <StatusPanel userId={currentUserId} onClose={() => setShowStatusPanel(false)} />}

      {showGalleryPanel && (
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
            maxWidth: '1200px',
            maxHeight: '90vh',
            overflowY: 'auto',
            background: '#1a1a1a',
            border: '3px solid #9C27B0',
            borderRadius: '16px',
            padding: '30px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
              <h2 style={{ color: '#9C27B0', margin: 0, fontSize: '32px', fontWeight: '800' }}>
                🏆 Winners Gallery
              </h2>
              <button
                onClick={() => setShowGalleryPanel(false)}
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
            
            <div style={{ color: '#fff', fontSize: '18px', textAlign: 'center', padding: '40px' }}>
              <p>🎨 Winners will appear here once the first competition concludes!</p>
              <p style={{ color: '#888', marginTop: '10px' }}>Check back soon to see amazing custom car parts from our community.</p>
            </div>
          </div>
        </div>
      )}

      {showAdminPanel && (
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
            maxWidth: '1400px',
            maxHeight: '90vh',
            overflowY: 'auto',
            background: '#1a1a1a',
            border: '3px solid #f44336',
            borderRadius: '16px',
            padding: '30px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
              <h2 style={{ color: '#f44336', margin: 0, fontSize: '32px', fontWeight: '800' }}>
                ⚙️ Admin Dashboard
              </h2>
              <button
                onClick={() => setShowAdminPanel(false)}
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
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px',
              marginBottom: '30px',
            }}>
              <div style={{
                background: '#2d1810',
                padding: '20px',
                borderRadius: '12px',
                border: '2px solid #4a2818',
              }}>
                <h3 style={{ color: '#FF9800', margin: '0 0 10px 0', fontSize: '20px' }}>📊 Total Submissions</h3>
                <p style={{ color: '#fff', fontSize: '32px', fontWeight: '800', margin: 0 }}>0</p>
              </div>

              <div style={{
                background: '#1a2d1e',
                padding: '20px',
                borderRadius: '12px',
                border: '2px solid #2d4a38',
              }}>
                <h3 style={{ color: '#4CAF50', margin: '0 0 10px 0', fontSize: '20px' }}>⏳ Pending Review</h3>
                <p style={{ color: '#fff', fontSize: '32px', fontWeight: '800', margin: 0 }}>0</p>
              </div>

              <div style={{
                background: '#1a1d2d',
                padding: '20px',
                borderRadius: '12px',
                border: '2px solid #2d384a',
              }}>
                <h3 style={{ color: '#2196F3', margin: '0 0 10px 0', fontSize: '20px' }}>✅ Approved</h3>
                <p style={{ color: '#fff', fontSize: '32px', fontWeight: '800', margin: 0 }}>0</p>
              </div>

              <div style={{
                background: '#2d1a2d',
                padding: '20px',
                borderRadius: '12px',
                border: '2px solid #4a2d4a',
              }}>
                <h3 style={{ color: '#9C27B0', margin: '0 0 10px 0', fontSize: '20px' }}>🏆 Winners</h3>
                <p style={{ color: '#fff', fontSize: '32px', fontWeight: '800', margin: 0 }}>0</p>
              </div>
            </div>

            <div style={{
              background: '#222',
              padding: '20px',
              borderRadius: '12px',
              border: '2px solid #444',
            }}>
              <h3 style={{ color: '#fff', margin: '0 0 15px 0', fontSize: '24px', fontWeight: '700' }}>
                📋 Recent Submissions
              </h3>
              <div style={{ color: '#888', textAlign: 'center', padding: '40px', fontSize: '18px' }}>
                No submissions yet. Once users start submitting, they'll appear here for review.
              </div>
            </div>
          </div>
        </div>
      )}

      {showUploadPanel && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          overflow: 'auto',
        }}>
          <div style={{
            width: '100%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto',
            background: '#1a1a1a',
            border: '3px solid #FF9800',
            borderRadius: '16px',
            padding: '30px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
              <h2 style={{ color: '#FF9800', margin: 0, fontSize: '32px', fontWeight: '800' }}>
                🏆 Win Lifetime Access!
              </h2>
              <button
                onClick={() => setShowUploadPanel(false)}
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
              background: '#1a4d2e',
              padding: '20px',
              borderRadius: '12px',
              marginBottom: '25px',
              border: '3px solid #2d7a4f',
            }}>
              <h3 style={{ color: '#4CAF50', margin: '0 0 15px 0', fontSize: '22px', fontWeight: '700' }}>
                🏆 10-Week Launch Competition!
              </h3>
              <p style={{ color: '#fff', fontSize: '16px', margin: 0, lineHeight: '1.8' }}>
                <strong>First 10 Weeks Only:</strong><br/>
                • Weekly Winner: Lifetime Premium Access<br/>
                • Grand Prize: £50 Cash<br/>
                <br/>
                <span style={{ fontSize: '15px', color: '#ffcccc', background: '#4a1818', padding: '8px 12px', borderRadius: '8px', display: 'inline-block' }}>
                  ⚠️ After 10 weeks, only £50 prizes remain!
                </span>
              </p>
            </div>

            <form onSubmit={handleSubmitUpload}>
              <div style={{ marginBottom: '18px' }}>
                <label style={{ color: '#fff', fontSize: '16px', display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  value={uploadData.userName}
                  onChange={(e) => setUploadData(prev => ({ ...prev, userName: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '8px',
                    background: '#222',
                    color: '#fff',
                    border: '2px solid #555',
                    fontSize: '16px',
                  }}
                  placeholder="John Doe"
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ color: '#fff', fontSize: '16px', display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={uploadData.email}
                  onChange={(e) => setUploadData(prev => ({ ...prev, email: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '8px',
                    background: '#222',
                    color: '#fff',
                    border: '2px solid #555',
                    fontSize: '16px',
                  }}
                  placeholder="john@example.com"
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ color: '#fff', fontSize: '16px', display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Part Name *
                </label>
                <input
                  type="text"
                  required
                  value={uploadData.partName}
                  onChange={(e) => setUploadData(prev => ({ ...prev, partName: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '8px',
                    background: '#222',
                    color: '#fff',
                    border: '2px solid #555',
                    fontSize: '16px',
                  }}
                  placeholder="e.g., Carbon Fiber Sport Bumper"
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ color: '#fff', fontSize: '16px', display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Part Type *
                </label>
                <select
                  required
                  value={uploadData.partType}
                  onChange={(e) => setUploadData(prev => ({ ...prev, partType: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '8px',
                    background: '#222',
                    color: '#fff',
                    border: '2px solid #555',
                    fontSize: '16px',
                    cursor: 'pointer',
                  }}
                >
                  <option value="">Select part type...</option>
                  {partTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ color: '#fff', fontSize: '16px', display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Compatible Car Model *
                </label>
                <select
                  required
                  value={uploadData.carModel}
                  onChange={(e) => setUploadData(prev => ({ ...prev, carModel: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '8px',
                    background: '#222',
                    color: '#fff',
                    border: '2px solid #555',
                    fontSize: '16px',
                    cursor: 'pointer',
                  }}
                >
                  <option value="">Select car model...</option>
                  {cars.map(car => (
                    <option key={car.file} value={car.name}>{car.name}</option>
                  ))}
                  <option value="Universal">Universal</option>
                </select>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ color: '#fff', fontSize: '16px', display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Description
                </label>
                <textarea
                  value={uploadData.description}
                  onChange={(e) => setUploadData(prev => ({ ...prev, description: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '8px',
                    background: '#222',
                    color: '#fff',
                    border: '2px solid #555',
                    fontSize: '16px',
                    minHeight: '80px',
                    resize: 'vertical',
                  }}
                  placeholder="Describe your custom part..."
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ color: '#fff', fontSize: '16px', display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Upload File (.glb or .gltf) * <span style={{ color: '#888', fontSize: '14px' }}>(Max 50MB)</span>
                </label>
                <input
                  type="file"
                  required
                  accept=".glb,.gltf"
                  onChange={handleFileUpload}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '8px',
                    background: '#222',
                    color: '#fff',
                    border: '2px solid #555',
                    fontSize: '15px',
                    cursor: 'pointer',
                  }}
                />
                {uploadData.file && (
                  <div style={{ color: '#4CAF50', fontSize: '14px', marginTop: '8px', fontWeight: '600' }}>
                    ✓ {uploadData.file.name} ({(uploadData.file.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                )}
              </div>

              <div style={{
                background: '#2c1810',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '20px',
                border: '2px solid #4a2818',
              }}>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  cursor: 'pointer',
                  color: '#fff',
                  fontSize: '15px',
                }}>
                  <input
                    type="checkbox"
                    required
                    checked={uploadData.agreedToTerms}
                    onChange={(e) => setUploadData(prev => ({ ...prev, agreedToTerms: e.target.checked }))}
                    style={{
                      marginRight: '12px',
                      marginTop: '3px',
                      cursor: 'pointer',
                      width: '20px',
                      height: '20px',
                    }}
                  />
                  <span>
                    I agree to the Terms & Conditions. This is my original work and I grant full rights. *
                  </span>
                </label>
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '18px',
                  borderRadius: '10px',
                  background: uploadData.agreedToTerms ? 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)' : '#333',
                  color: '#fff',
                  border: 'none',
                  fontSize: '20px',
                  fontWeight: '800',
                  cursor: uploadData.agreedToTerms ? 'pointer' : 'not-allowed',
                }}
                disabled={!uploadData.agreedToTerms}
              >
                🚀 Submit Entry
              </button>
            </form>
          </div>
        </div>
      )}

      <div style={{
        position: 'absolute',
        top: '90px',
        left: '20px',
        color: '#0f0',
        fontSize: '20px',
        background: 'rgba(0,0,0,0.9)',
        padding: '18px',
        borderRadius: '10px',
        fontFamily: 'monospace',
        zIndex: 10,
        fontWeight: '800',
      }}>
        {debugInfo}
      </div>

      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />

      {isLoading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#fff',
          fontSize: '32px',
          background: 'rgba(0,0,0,0.95)',
          padding: '50px 80px',
          borderRadius: '16px',
          zIndex: 20,
          fontWeight: '800',
          border: '4px solid #444',
        }}>
          Loading {cars.find(c => c.file === selectedCar)?.name}...
        </div>
      )}

      {loadingError && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#f44',
          fontSize: '28px',
          background: 'rgba(0,0,0,0.95)',
          padding: '60px',
          borderRadius: '16px',
          textAlign: 'center',
          zIndex: 20,
          fontWeight: '800',
          border: '4px solid #f44',
        }}>
          ⚠️ {loadingError}
        </div>
      )}

      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        color: '#fff',
        fontSize: '22px',
        background: 'rgba(0,0,0,0.9)',
        padding: '20px 35px',
        borderRadius: '14px',
        zIndex: 10,
        textAlign: 'center',
      }}>
        <div style={{ fontWeight: '800' }}>🖱️ Left Click: Rotate • Right Click: Pan • Scroll: Zoom</div>
        <div style={{ fontSize: '20px', marginTop: '10px', color: '#FFD700', fontWeight: '800' }}>
          ⚡ Submit & Vote to Win! Fair & Square Competition!
        </div>
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
            You haven't submitted an entry yet. Click "Win Access!" to submit your custom car part!
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
              onClick={() => {
                onClose();
                // This will be handled by parent component
                window.location.hash = '#vote';
              }}
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
              🗳️ Start Voting Now →
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
          </div>
        )}
      </div>
    </div>
  );
}

export default CarMod;