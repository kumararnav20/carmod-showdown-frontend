// src/pages/CarMod.jsx
import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";

// 🔌 UI / Theme
import futuristicTheme from "../styles/futuristicTheme";

// 🔗 Panels (adjust paths only if your files live elsewhere)
import VotingPanel from "../VotingPanel";
import StatusPanel from "../StatusPanel";

// ADD THESE
import AIChatBox from "../components/AIChatBox";

/**
 * CarMod — "Cyber Garage" Edition
 * - Keeps your original logic for scene, loading, parts, upload, admin, gallery
 * - Fixes template-literal bug for API URL in upload request
 * - Adds premium neon/glass styling via a theme (no libraries required)
 * - Non-destructive: no logic removed, only visual + minor quality updates
 */

function CarMod() {
  const mountRef = useRef(null);

  // ----------------- core state -----------------
  const [selectedCar, setSelectedCar] = useState("bmw_e38_cyberbody.glb");
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(null);
  const [debugInfo, setDebugInfo] = useState("Initializing...");

  const [carParts, setCarParts] = useState([]);
  const [selectedParts, setSelectedParts] = useState([]);
  const [filterText, setFilterText] = useState("");

  // ----------------- ui panels -----------------
  const [showModPanel, setShowModPanel] = useState(false);
  const [showUploadPanel, setShowUploadPanel] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showGalleryPanel, setShowGalleryPanel] = useState(false);
  const [showVotingPanel, setShowVotingPanel] = useState(false);
  const [showStatusPanel, setShowStatusPanel] = useState(false);

  // ----------------- layout / resize -----------------
  const [panelWidth, setPanelWidth] = useState(560);
  const [isDraggingResize, setIsDraggingResize] = useState(false);

  // ----------------- auth / flags -----------------
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  // ----------------- upload form -----------------
  const [uploadData, setUploadData] = useState({
    userName: "",
    email: "",
    partName: "",
    partType: "",
    carModel: "",
    description: "",
    file: null,
    agreedToTerms: false,
  });

  // AI busy flag
  const [aiBusy, setAIBusy] = useState(false);

  // give AI a list of known parts (you already compute carParts[])
  const getCarContext = () => ({
    knownParts: carParts.map(p => p.name.toLowerCase()),
    themes: ["neon_night", "luxury", "offroad", "street_racer"]
  });
  
  // Apply Level-1 AI actions to current model
  const applyAIActions = async (actions = []) => {
   if (!modelRef.current) return;
   setAIBusy(true);

   const aliasMap = {
     body: ["body","car_body","paint","mesh_body"],
     roof: ["roof"],
     window: ["glass","window"],
     spoiler: ["spoiler","wing"],
     grille: ["grille"],
     light_head: ["headlight","front_light","frontlight"],
      light_tail: ["taillight","rear_light","rearlight"],
     mirror: ["mirror"],
     hood: ["hood","bonnet"],
      trunk: ["trunk","boot"],
     diffuser: ["diffuser"],
     skirt: ["skirt","side_skirt","sideskirt"],
     rim_sport: ["rim_sport","sport_rim","wheel_sport"],
     rim_offroad: ["rim_offroad","offroad_rim","wheel_offroad"],
     underglow: ["underglow"]
   };

    const findTargets = (target) => {
      const t = (target||"").toLowerCase();
     const candidates = aliasMap[t] || [target];
      const found = [];
     modelRef.current.traverse((child) => {
       if (child.isMesh) {
         const nm = (child.name||"").toLowerCase();
         if (candidates.some(c => nm.includes(c.toLowerCase()))) found.push(child);
       }
     });
     return found;
   };

   const clamp01 = (v) => Math.max(0, Math.min(1, v));

   try {
     for (const action of actions) {
       const type = action.type;

       if (type === "MATERIAL_EDIT") {
         const parts = findTargets(action.target);
         for (const mesh of parts) {
           if (!mesh.material) continue;
           mesh.material = mesh.material.clone();
           const p = action.parameters || {};
           if (p.color) mesh.material.color.set(p.color);
           if (p.emissive && mesh.material.emissive) mesh.material.emissive.set(p.emissive);
           if (typeof p.metalness === "number") mesh.material.metalness = clamp01(p.metalness);
           if (typeof p.roughness === "number") mesh.material.roughness = clamp01(p.roughness);
           mesh.material.needsUpdate = true;
         }
       }

       if (type === "TOGGLE_PART") {
         const parts = findTargets(action.target);
         for (const mesh of parts) mesh.visible = !!action.visible;
         // reflect in your UI list:
         setCarParts(prev => prev.map(p => {
           if (p.name.toLowerCase().includes((action.target||"").toLowerCase())) {
             return { ...p, visible: !!action.visible };
           }
           return p;
         }));
       }
  
       if (type === "ADD_UNDERGLOW") {
         const p = action.parameters || {};
         const existing = [];
          modelRef.current.traverse(c => { if (c.userData?.tag==="UNDERGLOW") existing.push(c) });
          if (existing.length) {
           existing.forEach(m=>{
             if (m.material.emissive) m.material.emissive.set(p.color || "#00ffff");
             m.material.emissiveIntensity = p.intensity ?? 2.2;
             m.material.needsUpdate = true;
           });
         } else {
           const plane = new THREE.Mesh(
             new THREE.CircleGeometry(2.8, 48),
             new THREE.MeshStandardMaterial({
               color: "#000000",
               emissive: p.color || "#00ffff",
               emissiveIntensity: p.intensity ?? 2.2,
               transparent: true,
               opacity: 0.85
             })
            );
            plane.rotation.x = -Math.PI/2;
            plane.position.y = 0.01;
            plane.userData.tag = "UNDERGLOW";
            modelRef.current.add(plane);
          }
        }

        if (type === "SET_SUSPENSION") {
          const lift = action?.parameters?.lift ?? 0.1; // meters
          modelRef.current.position.y += lift;
        }

        if (type === "SWAP_PRESET") {
          const preset = action?.parameters?.preset;
          if (preset === "sport_rims") {
            findTargets("rim_offroad").forEach(m=>m.visible=false);
            findTargets("rim_sport").forEach(m=>m.visible=true);
          } else if (preset === "offroad_rims") {
            findTargets("rim_sport").forEach(m=>m.visible=false);
            findTargets("rim_offroad").forEach(m=>m.visible=true);
          } else if (preset === "luxury_theme") {
            const body = findTargets("body");
            body.forEach(mesh=>{
              if (!mesh.material) return;
             mesh.material = mesh.material.clone();
              mesh.material.color.set("#202020");
              mesh.material.metalness = 0.8;
              mesh.material.roughness = 0.25;
              mesh.material.needsUpdate = true;
            });
            await applyAIActions([{ type:"ADD_UNDERGLOW", parameters:{ color:"#ffd6a0", intensity:1.6 }}]);
          }
        }
     }
   } finally {
      setAIBusy(false);
   }
  };



  const modelRef = useRef(null);
    // ✅ Export the currently edited 3D model
  const exportEditedGLB = async () => {
    if (!modelRef.current) return;
    const { GLTFExporter } = await import("three/examples/jsm/exporters/GLTFExporter.js");
    const exporter = new GLTFExporter();

    exporter.parse(
      modelRef.current,
      (bin) => {
        const blob = new Blob([bin], { type: "model/gltf-binary" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `carmod_edited_${Date.now()}.glb`;
        a.click();
        URL.revokeObjectURL(url);
      },
      { binary: true }
    );
  };

  // ----------------- data: cars & part types -----------------
  const cars = [
    { name: "Aston Martin Valkyrie", file: "aston_martin_valkyrie.glb" },
    { name: "BMW", file: "bmw.glb" },
    { name: "BMW 507", file: "bmw_507.glb" },
    { name: "BMW E38 Cyberbody", file: "bmw_e38_cyberbody.glb" },
    { name: "BMW F22 Eurofighter", file: "bmw_f22_eurofighter_free.glb", offset: { y: 0.4 } },
    { name: "BMW M4 Competition", file: "bmw_m4_competition.glb" },
    { name: "BMW M5 F90", file: "bmw_m5_f90.glb" },
    { name: "Ferrari SF90", file: "ferrari_sf90.glb" },
    { name: "BMW M3 E30", file: "free_bmw_m3_e30.glb" },
    { name: "Mercedes 190E Evo 1982", file: "mercedes_190e_evo_1982_3d_model_free.glb" },
    { name: "Mercedes R-Class", file: "mercedes_r-class.glb" },
    { name: "Porsche 911 GT3 RS", file: "porsche_911_gt3_rs.glb" },
    { name: "Rolls Royce Boattail", file: "rolls_royce_boattail.glb" },
    { name: "Rolls Royce Cullinan", file: "rolls_royce_cullinan.glb", offset: { z: -7.0 } },
    { name: "Rolls Royce Ghost", file: "rolls_royce_ghost.glb" },
    { name: "Rolls Royce Ghost Alt", file: "rolls-royce_ghost.glb" },
  ];

  const partTypes = [
    "Front Bumper",
    "Rear Bumper",
    "Side Skirt",
    "Wheel/Rim",
    "Hood",
    "Trunk/Boot",
    "Spoiler/Wing",
    "Diffuser",
    "Grille",
    "Mirror",
    "Door",
    "Fender",
    "Exhaust",
    "Headlight",
    "Taillight",
    "Roof",
    "Other",
  ];

  // ----------------- auth bootstrap -----------------
  useEffect(() => {
    const token = localStorage.getItem("token");
    const adminStatus = localStorage.getItem("isAdmin");
    const userId = localStorage.getItem("userId");
    setIsLoggedIn(!!token);
    setIsAdmin(adminStatus === "true");
    setCurrentUserId(userId ? parseInt(userId) : null);
  }, []);

  // ----------------- resizable panel mouse handlers -----------------
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDraggingResize) {
        const newWidth = window.innerWidth - e.clientX;
        setPanelWidth(Math.max(420, Math.min(940, newWidth)));
      }
    };
    const handleMouseUp = () => setIsDraggingResize(false);

    if (isDraggingResize) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingResize]);

  // ----------------- file upload handlers -----------------
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const valid = [".glb", ".gltf"];
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (!valid.includes(ext)) {
      alert("Please upload a .glb or .gltf file");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      alert("File size must be less than 50MB");
      return;
    }
    setUploadData((p) => ({ ...p, file }));
  };

  const handleSubmitUpload = async (e) => {
    e.preventDefault();

    const required =
      uploadData.userName &&
      uploadData.email &&
      uploadData.partName &&
      uploadData.partType &&
      uploadData.carModel &&
      uploadData.file &&
      uploadData.agreedToTerms;

    if (!required) {
      alert("❌ Please fill in all required fields and agree to the terms");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(uploadData.email)) {
      alert("❌ Please enter a valid email address");
      return;
    }

    const formData = new FormData();
    formData.append("userName", uploadData.userName);
    formData.append("email", uploadData.email);
    formData.append("partName", uploadData.partName);
    formData.append("partType", uploadData.partType);
    formData.append("carModel", uploadData.carModel);
    formData.append("description", uploadData.description);
    formData.append("file", uploadData.file);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("❌ Please login first!");
        return;
      }

      // ✅ FIXED: use backticks, not quotes
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/upload-part`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      const data = await response.json();
      if (response.ok) {
        alert("✅ " + data.message);
        setUploadData({
          userName: "",
          email: "",
          partName: "",
          partType: "",
          carModel: "",
          description: "",
          file: null,
          agreedToTerms: false,
        });
        setShowUploadPanel(false);
        setTimeout(() => setShowStatusPanel(true), 600);
      } else {
        alert("❌ Upload failed: " + (data.error || "Please try again"));
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("❌ Upload failed. Please check your connection and try again.");
    }
  };

  // ----------------- part toggles & edits -----------------
  const togglePartVisibility = (partName) => {
    if (!modelRef.current) return;

    modelRef.current.traverse((child) => {
      if (child.isMesh && child.name === partName) {
        child.visible = !child.visible;
      }
    });

    setCarParts((prev) =>
      prev.map((p) => (p.name === partName ? { ...p, visible: !p.visible } : p))
    );
  };

  const changePartColor = (partName, color) => {
    if (!modelRef.current) return;

    modelRef.current.traverse((child) => {
      if (child.isMesh && child.name === partName) {
        if (child.material) {
          child.material = child.material.clone();
          child.material.color.set(color);
        }
      }
    });

    setCarParts((prev) =>
      prev.map((p) => (p.name === partName ? { ...p, color } : p))
    );
  };

  const togglePartSelection = (partName) => {
    setSelectedParts((prev) =>
      prev.includes(partName) ? prev.filter((n) => n !== partName) : [...prev, partName]
    );
  };

  const hideAllExceptSelected = () => {
    if (!modelRef.current) return;

    modelRef.current.traverse((child) => {
      if (child.isMesh) child.visible = selectedParts.includes(child.name);
    });

    setCarParts((prev) =>
      prev.map((p) => ({ ...p, visible: selectedParts.includes(p.name) }))
    );
  };

  const showAllParts = () => {
    if (!modelRef.current) return;

    modelRef.current.traverse((child) => {
      if (child.isMesh) child.visible = true;
    });

    setCarParts((prev) => prev.map((p) => ({ ...p, visible: true })));
  };

  const colorSelectedParts = (color) => {
    selectedParts.forEach((partName) => changePartColor(partName, color));
  };

  const exportPartAsGLB = async (partName) => {
    if (!modelRef.current) return;

    try {
      let target = null;
      modelRef.current.traverse((child) => {
        if (child.isMesh && child.name === partName) target = child;
      });

      if (!target) {
        alert("Part not found!");
        return;
      }

      const clone = target.clone();
      const tempScene = new THREE.Scene();
      tempScene.add(clone);

      const { GLTFExporter } = await import(
        "three/examples/jsm/exporters/GLTFExporter.js"
      );
      const exporter = new GLTFExporter();

      exporter.parse(
        tempScene,
        (result) => {
          const blob = new Blob([result], { type: "application/octet-stream" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `${partName}_reference.glb`;
          link.click();
          URL.revokeObjectURL(url);
          alert(`✅ Downloaded ${partName}!`);
        },
        (err) => {
          console.error("Export error:", err);
          alert("Failed to export part. Please try again.");
        },
        { binary: true }
      );
    } catch (err) {
      console.error("Export error:", err);
      alert("Failed to export part.");
    }
  };

  const setPartLabel = (partName, label) => {
    setCarParts((prev) =>
      prev.map((p) => (p.name === partName ? { ...p, label } : p))
    );
  };

  const downloadBlenderGuide = () => {
    const guide =
      `CAR PART CUSTOMIZATION GUIDE\n\n` +
      `• Export from Blender as .glb\n` +
      `• Keep scale & origin sane\n` +
      `• Name your meshes clearly (e.g. front_bumper_low)\n` +
      `• Target < 50 MB\n` +
      `• Submit .glb with details from the Upload panel\n`;
    const blob = new Blob([guide], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Car_Part_Guide.txt";
    a.click();
    URL.revokeObjectURL(url);
    alert("📖 Guide downloaded!");
  };

  // ----------------- three.js scene -----------------
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    setDebugInfo("Setting up scene...");

    let scene, camera, renderer, currentModel;
    let isDragging = false;
    let isPanning = false;
    let prevMouse = { x: 0, y: 0 };
    let cameraRadius = 8;
    let cameraTheta = 0;
    let cameraPhi = Math.PI / 4;
    const cameraTarget = new THREE.Vector3(0, 1, 0);
    const panOffset = new THREE.Vector3(0, 0, 0);

    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b0b0f); // darker cyber bay

    // Camera
    camera = new THREE.PerspectiveCamera(
      50,
      mount.clientWidth / mount.clientHeight,
      0.1,
      1000
    );

    const updateCameraPos = () => {
      camera.position.x =
        cameraRadius * Math.sin(cameraPhi) * Math.cos(cameraTheta) + panOffset.x;
      camera.position.y = cameraRadius * Math.cos(cameraPhi) + panOffset.y;
      camera.position.z =
        cameraRadius * Math.sin(cameraPhi) * Math.sin(cameraTheta) + panOffset.z;
      camera.lookAt(
        cameraTarget.x + panOffset.x,
        cameraTarget.y + panOffset.y,
        cameraTarget.z + panOffset.z
      );
    };
    updateCameraPos();

    // Renderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      renderer.shadowMap.enabled = true;
      mount.appendChild(renderer.domElement);
    } catch (err) {
      setLoadingError("Failed to create renderer");
      return;
    }

    // Cyber Garage floor & glow grid
    const groundGeo = new THREE.PlaneGeometry(80, 80);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x141418,
      metalness: 0.2,
      roughness: 0.8,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    scene.add(ground);

    const grid = new THREE.GridHelper(80, 80, 0x5a3bff, 0x2b2055);
    grid.position.y = 0.01;
    scene.add(grid);

    // Lighting — cool overhead + warm side = cyber garage contrast
    const amb = new THREE.AmbientLight(0xffffff, 0.55);
    scene.add(amb);

    const dirCool = new THREE.DirectionalLight(0x8ab4ff, 0.9);
    dirCool.position.set(-6, 8, 5);
    dirCool.castShadow = true;
    scene.add(dirCool);

    const dirWarm = new THREE.DirectionalLight(0xff7a3f, 0.6);
    dirWarm.position.set(7, 6, -5);
    dirWarm.castShadow = true;
    scene.add(dirWarm);

    // A tiny debug cube (kept for parity)
    const testCube = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshBasicMaterial({ color: 0xff0080, wireframe: true })
    );
    testCube.position.set(0, 0.5, 0);
    scene.add(testCube);

    // Mouse handlers
    const onDown = (e) => {
      if (e.button === 2 || e.button === 1) {
        isPanning = true;
        e.preventDefault();
      } else if (e.button === 0) {
        isDragging = true;
      }
      prevMouse = { x: e.clientX, y: e.clientY };
    };
    const onMove = (e) => {
      const dx = e.clientX - prevMouse.x;
      const dy = e.clientY - prevMouse.y;

      if (isDragging) {
        cameraTheta -= dx * 0.01;
        cameraPhi -= dy * 0.01;
        cameraPhi = Math.max(0.1, Math.min(Math.PI - 0.1, cameraPhi));
        updateCameraPos();
      } else if (isPanning) {
        const panSpeed = 0.005 * cameraRadius;
        const right = new THREE.Vector3();
        const up = new THREE.Vector3(0, 1, 0);

        camera.getWorldDirection(right);
        right.cross(up).normalize();

        panOffset.add(right.multiplyScalar(-dx * panSpeed));
        panOffset.y += dy * panSpeed;
        updateCameraPos();
      }
      prevMouse = { x: e.clientX, y: e.clientY };
    };
    const onUp = () => {
      isDragging = false;
      isPanning = false;
    };
    const onWheel = (e) => {
      e.preventDefault();
      const zoomSpeed = 0.1;
      cameraRadius += e.deltaY * zoomSpeed * 0.01;
      cameraRadius = Math.max(2, Math.min(22, cameraRadius));
      updateCameraPos();
    };
    const onContext = (e) => e.preventDefault();

    document.addEventListener("mousedown", onDown);
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    document.addEventListener("wheel", onWheel, { passive: false });
    document.addEventListener("contextmenu", onContext);

    // Load a car
    const loadCar = async () => {
      setIsLoading(true);
      setCarParts([]);
      setSelectedParts([]);

      try {
        const { GLTFLoader } = await import(
          "three/examples/jsm/loaders/GLTFLoader.js"
        );
        const loader = new GLTFLoader();

        loader.load(
          `/models/${selectedCar}`,
          (gltf) => {
            // clear testcube after first model load
            if (testCube.parent) testCube.parent.remove(testCube);

            if (currentModel) scene.remove(currentModel);

            currentModel = gltf.scene;
            modelRef.current = currentModel;

            // collect parts
            const parts = [];
            currentModel.traverse((child) => {
              if (child.isMesh) {
                const bbox = new THREE.Box3().setFromObject(child);
                const center = bbox.getCenter(new THREE.Vector3());
                const size = bbox.getSize(new THREE.Vector3());

                let autoLabel = "body";
                if (size.x < 1 && size.z < 1 && center.y < 0.5) autoLabel = "wheel";
                else if (center.z > 1.5) autoLabel = "front";
                else if (center.z < -1.5) autoLabel = "rear";
                else if (center.y > 1) autoLabel = "top";

                parts.push({
                  name: child.name,
                  visible: true,
                  color: child.material?.color
                    ? "#" + child.material.color.getHexString()
                    : "#ffffff",
                  position: {
                    x: center.x.toFixed(2),
                    y: center.y.toFixed(2),
                    z: center.z.toFixed(2),
                  },
                  size: {
                    x: size.x.toFixed(2),
                    y: size.y.toFixed(2),
                    z: size.z.toFixed(2),
                  },
                  label: autoLabel,
                });

                child.castShadow = true;
                child.receiveShadow = true;
              }
            });
            setCarParts(parts);

            // center & scale
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

              const nBox = new THREE.Box3().setFromObject(currentModel);
              const nCenter = nBox.getCenter(new THREE.Vector3());
              currentModel.position.x = -nCenter.x;
              currentModel.position.z = -nCenter.z;
              currentModel.position.y = -nBox.min.y;
            }

            const cfg = cars.find((c) => c.file === selectedCar);
            if (cfg?.offset) {
              if (cfg.offset.x) currentModel.position.x += cfg.offset.x;
              if (cfg.offset.y) currentModel.position.y += cfg.offset.y;
              if (cfg.offset.z) currentModel.position.z += cfg.offset.z;
            }

            scene.add(currentModel);
            setIsLoading(false);
            setDebugInfo(`Loaded: ${parts.length} parts`);
          },
          undefined,
          () => {
            setLoadingError("Failed to load car");
            setIsLoading(false);
          }
        );
      } catch (err) {
        setLoadingError("Failed to load");
        setIsLoading(false);
      }
    };

    loadCar();

    // animate
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // resize
    const onResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.removeEventListener("wheel", onWheel);
      document.removeEventListener("contextmenu", onContext);

      if (mount && renderer.domElement && mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      if (renderer) renderer.dispose();
    };
  }, [selectedCar]); // reload when car changes

  // ----------------- filter -----------------
  const filteredParts = carParts.filter(
    (p) =>
      p.name.toLowerCase().includes(filterText.toLowerCase()) ||
      p.label.toLowerCase().includes(filterText.toLowerCase())
  );

  // ----------------- theme helpers -----------------
  const T = futuristicTheme || {};
  const c = (path, fallback) =>
    path.split(".").reduce((a, k) => (a && a[k] !== undefined ? a[k] : null), T) ??
    fallback;

  // -------------------------------------------------
  // RENDER
  // -------------------------------------------------
  return (
    <div style={styles.page}>
      {/* Cyber Garage gradient + scanlines + vignette */}
      <div style={styles.cyberGradient} />
      <div style={styles.scanlines} />
      <div style={styles.vignette} />

      {/* Top HUD Bar */}
      <div style={styles.topBar}>
        <button style={styles.hudBtn} onClick={() => (window.location.href = "/")}>
          🏠 Home
        </button>

        <select
          value={selectedCar}
          onChange={(e) => setSelectedCar(e.target.value)}
          style={styles.hudSelect}
        >
          {cars.map((car) => (
            <option key={car.file} value={car.file}>
              {car.name}
            </option>
          ))}
        </select>
        <input
          type="file"
          accept=".glb,.gltf"
          onChange={(e)=>{
            const f = e.target.files?.[0];
            if (!f) return;
            if (f.size > 200*1024*1024) return alert("Max 200MB");
            const url = URL.createObjectURL(f); // blob: URL
            setSelectedCar(url); // your GLTFLoader can load blob URLs
          }}
          style={{ 
            padding: '12px 16px',
            borderRadius: 10,
            background: '#222',
            color: '#fff',
            border: '1px solid #555',
            cursor: 'pointer',
            fontWeight: 800
          }}
        />

         {/* ✅ Export Edited Car */}
         <button
           style={{ ...styles.hudBtn, background: "linear-gradient(135deg,#2dde6e,#17a84d)" }}
           onClick={exportEditedGLB}
         >
          💾 Export .GLB
         </button>


        <button
          onClick={() => setShowModPanel((s) => !s)}
          disabled={carParts.length === 0}
          style={{
            ...styles.hudBtn,
            ...(carParts.length === 0
              ? styles.hudBtnDisabled
              : showModPanel
              ? styles.hudBtnActiveGreen
              : {}),
          }}
        >
          🔧 Parts ({carParts.length})
        </button>

        <button
          onClick={() => setShowVotingPanel((s) => !s)}
          style={{ ...styles.hudBtn, ...(showVotingPanel ? styles.hudBtnActiveBlue : {}) }}
        >
          🗳️ Vote
        </button>

        <button
          onClick={() => setShowStatusPanel((s) => !s)}
          style={{ ...styles.hudBtn, ...(showStatusPanel ? styles.hudBtnActivePurple : {}) }}
        >
          📊 My Status
        </button>

        <button
          onClick={() => setShowGalleryPanel((s) => !s)}
          style={{ ...styles.hudBtn, ...(showGalleryPanel ? styles.hudBtnActivePurple : {}) }}
        >
          🏆 Gallery
        </button>

        {isAdmin && (
          <button
            onClick={() => setShowAdminPanel((s) => !s)}
            style={{ ...styles.hudBtn, ...(showAdminPanel ? styles.hudBtnActiveRed : {}) }}
          >
            ⚙️ Admin
          </button>
        )}

        <button
          onClick={() => setShowUploadPanel((s) => !s)}
          style={{ ...styles.hudBtn, ...styles.ctaBtn }}
        >
          🏆 Win Access!
        </button>
      </div>

      {/* Mod Panel (Resizable) */}
      {showModPanel && carParts.length > 0 && (
        <>
          <div
            style={styles.dragHandle(panelWidth)}
            onMouseDown={() => setIsDraggingResize(true)}
          >
            <div style={styles.dragGrip} />
          </div>

          <div style={styles.modPanel(panelWidth)} onWheel={(e) => e.stopPropagation()}>
            <h3 style={styles.panelTitle}>🔧 Part Manager</h3>

            <input
              type="text"
              placeholder="🔍 Search parts..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              style={styles.searchInput}
            />

            <div style={styles.toolRow}>
              <button style={styles.toolBtnGreen} onClick={showAllParts}>
                👁️ Show All
              </button>
              <button
                style={{
                  ...styles.toolBtnAmber,
                  ...(selectedParts.length === 0 ? styles.disabled : {}),
                }}
                disabled={selectedParts.length === 0}
                onClick={hideAllExceptSelected}
              >
                🎯 Isolate ({selectedParts.length})
              </button>
              <button style={styles.toolBtnPurple} onClick={downloadBlenderGuide}>
                📖 Guide
              </button>
            </div>

            {selectedParts.length > 0 && (
              <div style={styles.colorBlock}>
                <label style={styles.colorLabel}>🎨 Color Selected Parts:</label>
                <input
                  type="color"
                  onChange={(e) => colorSelectedParts(e.target.value)}
                  style={styles.colorPicker}
                />
              </div>
            )}

            <div style={styles.partsMeta}>
              Showing {filteredParts.length} of {carParts.length} parts
            </div>

            <div style={styles.partsList} onWheel={(e) => e.stopPropagation()}>
              {filteredParts.map((part, idx) => {
                const selected = selectedParts.includes(part.name);
                return (
                  <div
                    key={`${part.name}_${idx}`}
                    style={styles.partCard(selected)}
                  >
                    <div style={styles.partHeader}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => togglePartSelection(part.name)}
                          style={styles.partCheckbox}
                        />
                        <span
                          style={{
                            color: part.visible ? "#fff" : "#666",
                            fontSize: 20,
                            fontFamily: "monospace",
                            fontWeight: 800,
                          }}
                        >
                          {part.name}
                        </span>
                      </div>

                      <div style={{ display: "flex", gap: 10 }}>
                        <button
                          title="Download this part"
                          onClick={() => exportPartAsGLB(part.name)}
                          style={styles.partIconBtnBlue}
                        >
                          📥
                        </button>
                        <button
                          onClick={() => togglePartVisibility(part.name)}
                          style={part.visible ? styles.partIconBtnGreen : styles.partIconBtnRed}
                        >
                          {part.visible ? "👁️" : "🚫"}
                        </button>
                      </div>
                    </div>

                    <div style={styles.partInfo}>
                      📍 Position: ({part.position.x}, {part.position.y}, {part.position.z})
                      <br />
                      📏 Size: ({part.size.x}, {part.size.y}, {part.size.z})
                    </div>

                    <div style={styles.partFooterRow}>
                      <select
                        value={part.label}
                        onChange={(e) => setPartLabel(part.name, e.target.value)}
                        style={styles.partSelect}
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
                        style={styles.partColor}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Panels */}
      {showVotingPanel && (
        <VotingPanel userId={currentUserId} onClose={() => setShowVotingPanel(false)} />
      )}
      {showStatusPanel && (
        <StatusPanel userId={currentUserId} onClose={() => setShowStatusPanel(false)} />
      )}

      {/* Winners Gallery */}
      {showGalleryPanel && (
        <ModalShell onClose={() => setShowGalleryPanel(false)} border="#9C27B0">
          <h2 style={{ ...styles.modalTitle, color: "#9C27B0" }}>🏆 Winners Gallery</h2>
          <div style={styles.modalBodyCenter}>
            <p style={{ color: "#fff", fontSize: 18 }}>
              🎨 Winners will appear here once the first competition concludes!
            </p>
            <p style={{ color: "#888", marginTop: 10 }}>
              Check back soon to see amazing custom car parts from our community.
            </p>
          </div>
        </ModalShell>
      )}

      {/* Admin */}
      {showAdminPanel && (
        <ModalShell onClose={() => setShowAdminPanel(false)} border="#f44336" maxWidth={1400}>
          <h2 style={{ ...styles.modalTitle, color: "#f44336" }}>⚙️ Admin Dashboard</h2>

          <div style={styles.adminGrid}>
            <AdminStatCard color="#FF9800" bg="#2d1810" border="#4a2818" title="📊 Total Submissions" value="0" />
            <AdminStatCard color="#4CAF50" bg="#1a2d1e" border="#2d4a38" title="⏳ Pending Review" value="0" />
            <AdminStatCard color="#2196F3" bg="#1a1d2d" border="#2d384a" title="✅ Approved" value="0" />
            <AdminStatCard color="#9C27B0" bg="#2d1a2d" border="#4a2d4a" title="🏆 Winners" value="0" />
          </div>

          <div style={styles.adminTable}>
            <h3 style={{ color: "#fff", margin: "0 0 15px 0", fontSize: 24, fontWeight: 700 }}>
              📋 Recent Submissions
            </h3>
            <div style={{ color: "#888", textAlign: "center", padding: 40, fontSize: 18 }}>
              No submissions yet. Once users start submitting, they'll appear here for review.
            </div>
          </div>
        </ModalShell>
      )}

      {/* Upload */}
      {showUploadPanel && (
        <ModalShell onClose={() => setShowUploadPanel(false)} border="#FF9800" maxWidth={640}>
          <h2 style={{ ...styles.modalTitle, color: "#FF9800" }}>🧑‍🎨 Submit Your Part — Win Lifetime Access!</h2>

          <div style={styles.noticeCard}>
            <h3 style={{ color: "#4CAF50", margin: "0 0 12px 0", fontSize: 20, fontWeight: 700 }}>
              🏁 10-Week Launch Competition
            </h3>
            <p style={{ color: "#fff", margin: 0, lineHeight: 1.7, fontSize: 15 }}>
              • Weekly Winner: Lifetime Premium Access<br />
              • Grand Prize: £50 Cash
            </p>
            <div style={styles.noticeWarning}>
              ⚠️ After 10 weeks, only £50 prizes remain!
            </div>
          </div>

          <form onSubmit={handleSubmitUpload}>
            <Field
              label="Your Name *"
              type="text"
              value={uploadData.userName}
              onChange={(v) => setUploadData((p) => ({ ...p, userName: v }))}
              placeholder="John Doe"
            />
            <Field
              label="Email Address *"
              type="email"
              value={uploadData.email}
              onChange={(v) => setUploadData((p) => ({ ...p, email: v }))}
              placeholder="john@example.com"
            />
            <Field
              label="Part Name *"
              type="text"
              value={uploadData.partName}
              onChange={(v) => setUploadData((p) => ({ ...p, partName: v }))}
              placeholder="e.g., Carbon Fiber Sport Bumper"
            />

            <SelectField
              label="Part Type *"
              value={uploadData.partType}
              onChange={(v) => setUploadData((p) => ({ ...p, partType: v }))}
              options={partTypes}
              placeholder="Select part type..."
            />

            <SelectField
              label="Compatible Car Model *"
              value={uploadData.carModel}
              onChange={(v) => setUploadData((p) => ({ ...p, carModel: v }))}
              options={[...cars.map((c) => c.name), "Universal"]}
              placeholder="Select car model..."
            />

            <TextArea
              label="Description"
              value={uploadData.description}
              onChange={(v) => setUploadData((p) => ({ ...p, description: v }))}
              placeholder="Describe your custom part..."
            />

            <FileField
              label={
                <>
                  Upload File (.glb or .gltf) *{" "}
                  <span style={{ color: "#bbb", fontSize: 13 }}>(Max 50MB)</span>
                </>
              }
              onChange={handleFileUpload}
              file={uploadData.file}
            />

            <div style={styles.termsBox}>
              <label style={styles.termsLabel}>
                <input
                  type="checkbox"
                  required
                  checked={uploadData.agreedToTerms}
                  onChange={(e) =>
                    setUploadData((p) => ({ ...p, agreedToTerms: e.target.checked }))
                  }
                  style={styles.termsCheckbox}
                />
                <span>
                  I agree to the Terms & Conditions. This is my original work and I grant
                  full rights. *
                </span>
              </label>
            </div>

            <button
              type="submit"
              style={{
                ...styles.submitBtn,
                ...(uploadData.agreedToTerms ? {} : styles.disabled),
              }}
              disabled={!uploadData.agreedToTerms}
            >
              🚀 Submit Entry
            </button>
          </form>
        </ModalShell>
      )}

      {/* Left Debug HUD */}
      <div style={styles.debugHud}>{debugInfo}</div>

      {/* 3D MOUNT */}
      <div ref={mountRef} style={styles.mount} />

      {/* Bottom Controls Helper */}
      <div style={styles.helperBox}>
        <div style={{ fontWeight: 800 }}>
          🖱️ Left Click: Rotate • Right Click: Pan • Scroll: Zoom
        </div>
        <div style={{ fontSize: 18, marginTop: 8, color: "#FFD700", fontWeight: 800 }}>
          ⚡ Submit & Vote to Win! Fair & Square Competition!
        </div>
      </div>
      {/* ✅ AI Chatbox — Level 1 Mechanic */}
      <AIChatBox
        onActions={applyAIActions}
        getCarContext={getCarContext}
        busy={aiBusy}
      />
    </div>
  );
}

/* ===========================================================
   Reusable UI bits (styled inline to avoid external deps)
=========================================================== */

const ModalShell = ({ children, onClose, border = "#666", maxWidth = 1200 }) => (
  <div style={styles.modalOverlay}>
    <div style={styles.modal(border, maxWidth)}>
      <div style={styles.modalCloseWrap}>
        <button style={styles.modalCloseBtn} onClick={onClose}>
          ×
        </button>
      </div>
      {children}
    </div>
  </div>
);

const AdminStatCard = ({ color, bg, border, title, value }) => (
  <div style={styles.adminCard(bg, border)}>
    <h3 style={{ color, margin: "0 0 10px 0", fontSize: 18 }}>{title}</h3>
    <p style={{ color: "#fff", fontSize: 30, fontWeight: 800, margin: 0 }}>{value}</p>
  </div>
);

const Field = ({ label, type = "text", value, onChange, placeholder }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={styles.label}>{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={styles.input}
      required
    />
  </div>
);

const TextArea = ({ label, value, onChange, placeholder }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={styles.label}>{label}</label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={styles.textarea}
    />
  </div>
);

const SelectField = ({ label, value, onChange, options = [], placeholder }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={styles.label}>{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={styles.select}
      required
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);

const FileField = ({ label, onChange, file }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={styles.label}>{label}</label>
    <input type="file" accept=".glb,.gltf" onChange={onChange} style={styles.input} required />
    {file && (
      <div style={{ color: "#4CAF50", fontSize: 14, marginTop: 8, fontWeight: 600 }}>
        ✓ {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
      </div>
    )}
  </div>
);

/* ===========================================================
   Styles (Cyber Garage look)
=========================================================== */

const styles = {
  page: {
    width: "100vw",
    height: "100vh",
    background: "#000",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Orbitron', system-ui, sans-serif",
  },

  cyberGradient: {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(1200px 800px at 70% 120%, rgba(255,127,63,0.12), transparent 60%)," +
      "radial-gradient(1200px 800px at 30% -20%, rgba(102,126,234,0.14), transparent 60%)," +
      "linear-gradient(180deg, #09090c 0%, #0b0b10 60%, #07070a 100%)",
    zIndex: 0,
  },
  scanlines: {
    position: "absolute",
    inset: 0,
    background:
      "repeating-linear-gradient( to bottom, rgba(255,255,255,0.025), rgba(255,255,255,0.025) 1px, transparent 2px )",
    pointerEvents: "none",
    zIndex: 1,
  },
  vignette: {
    position: "absolute",
    inset: 0,
    boxShadow: "inset 0 0 220px rgba(0,0,0,0.8)",
    zIndex: 2,
    pointerEvents: "none",
  },

  mount: { width: "100%", height: "100%", position: "absolute", inset: 0, zIndex: 3 },

  // Top HUD
  topBar: {
    position: "absolute",
    top: 18,
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 5,
    display: "flex",
    gap: 14,
    flexWrap: "wrap",
    justifyContent: "center",
    maxWidth: "96vw",
    background: "rgba(10,10,16,0.65)",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 8px 26px rgba(0,0,0,0.45)",
    padding: "12px 16px",
    borderRadius: 16,
    backdropFilter: "blur(10px)",
  },
  hudBtn: {
    padding: "14px 22px",
    fontSize: 16,
    borderRadius: 12,
    background: "linear-gradient(135deg,#181824,#1d1d2e)",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.1)",
    cursor: "pointer",
    fontWeight: 800,
    transition: "transform .2s ease, box-shadow .2s ease",
    boxShadow: "0 6px 14px rgba(0,0,0,0.35)",
  },
  hudBtnDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  hudBtnActiveGreen: {
    borderColor: "#2dde6e",
    boxShadow: "0 0 20px rgba(45,222,110,0.35)",
  },
  hudBtnActiveBlue: {
    borderColor: "#00b3ff",
    boxShadow: "0 0 20px rgba(0,179,255,0.35)",
  },
  hudBtnActivePurple: {
    borderColor: "#9C27B0",
    boxShadow: "0 0 20px rgba(156,39,176,0.35)",
  },
  hudBtnActiveRed: {
    borderColor: "#f44336",
    boxShadow: "0 0 20px rgba(244,67,54,0.35)",
  },
  hudSelect: {
    padding: "14px 22px",
    fontSize: 16,
    borderRadius: 12,
    background: "linear-gradient(135deg,#171722,#1c1c2b)",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.12)",
    cursor: "pointer",
    fontWeight: 800,
  },
  ctaBtn: {
    background: "linear-gradient(135deg,#FF9800,#F57C00)",
    border: "1px solid #FFB74D",
    boxShadow: "0 6px 22px rgba(255,152,0,0.45)",
  },

  // Mod panel + resizer
  dragHandle: (panelWidth) => ({
    position: "absolute",
    top: 0,
    right: panelWidth,
    bottom: 0,
    width: 10,
    background: "transparent",
    cursor: "ew-resize",
    zIndex: 10,
  }),
  dragGrip: {
    position: "absolute",
    left: "50%",
    top: "50%",
    transform: "translate(-50%,-50%)",
    width: 4,
    height: 56,
    background: "#6868a0",
    borderRadius: 3,
    boxShadow: "0 0 10px rgba(104,104,160,0.45)",
  },
  modPanel: (panelWidth) => ({
    position: "absolute",
    top: 86,
    right: 0,
    bottom: 0,
    width: `${panelWidth}px`,
    background: "rgba(10,10,16,0.92)",
    borderLeft: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 0 50px rgba(0,0,0,0.6)",
    borderRadius: "16px 0 0 0",
    padding: 24,
    zIndex: 8,
    display: "flex",
    flexDirection: "column",
    backdropFilter: "blur(8px)",
  }),
  panelTitle: {
    color: "#fff",
    margin: "0 0 16px 0",
    fontSize: 34,
    fontWeight: 900,
    background: "linear-gradient(135deg,#667eea,#a770ef)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  searchInput: {
    width: "100%",
    padding: 14,
    marginBottom: 14,
    borderRadius: 12,
    background: "#13131c",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.12)",
    fontSize: 18,
    fontWeight: 700,
  },
  toolRow: {
    display: "flex",
    gap: 12,
    marginBottom: 14,
    flexWrap: "wrap",
  },
  toolBtnGreen: {
    padding: "12px 18px",
    fontSize: 16,
    borderRadius: 10,
    background: "linear-gradient(135deg,#2dde6e,#17a84d)",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    fontWeight: 800,
  },
  toolBtnAmber: {
    padding: "12px 18px",
    fontSize: 16,
    borderRadius: 10,
    background: "linear-gradient(135deg,#ffa739,#ff8a00)",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    fontWeight: 800,
  },
  toolBtnPurple: {
    padding: "12px 18px",
    fontSize: 16,
    borderRadius: 10,
    background: "linear-gradient(135deg,#9C27B0,#7b1fa2)",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    fontWeight: 800,
  },
  disabled: { opacity: 0.45, cursor: "not-allowed" },

  colorBlock: {
    padding: 14,
    background: "rgba(25,60,35,0.8)",
    borderRadius: 12,
    marginBottom: 16,
    border: "1px solid rgba(45,122,79,0.6)",
  },
  colorLabel: { color: "#fff", fontSize: 16, display: "block", marginBottom: 10, fontWeight: 800 },
  colorPicker: {
    width: "100%",
    height: 52,
    border: "1px solid #2d7a4f",
    borderRadius: 10,
    cursor: "pointer",
    background: "#0f1a14",
  },

  partsMeta: { fontSize: 14, color: "#aaa", marginBottom: 10, fontWeight: 700 },
  partsList: {
    flex: 1,
    overflowY: "auto",
    overflowX: "hidden",
    paddingRight: 4,
  },
  partCard: (selected) => ({
    background: selected ? "rgba(20,37,66,0.7)" : "rgba(20,20,28,0.7)",
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    border: selected ? "2px solid #2dde6e" : "1px solid rgba(255,255,255,0.08)",
  }),
  partHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  partCheckbox: {
    width: 22,
    height: 22,
    accentColor: "#2dde6e",
    cursor: "pointer",
  },
  partIconBtnBlue: {
    padding: "10px 14px",
    fontSize: 18,
    borderRadius: 10,
    background: "#2196F3",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },
  partIconBtnGreen: {
    padding: "10px 14px",
    fontSize: 18,
    borderRadius: 10,
    background: "#2dde6e",
    color: "#000",
    border: "none",
    cursor: "pointer",
    fontWeight: 800,
  },
  partIconBtnRed: {
    padding: "10px 14px",
    fontSize: 18,
    borderRadius: 10,
    background: "#f44336",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    fontWeight: 800,
  },
  partInfo: {
    fontSize: 14,
    color: "#d8d8d8",
    marginBottom: 10,
    fontFamily: "monospace",
    fontWeight: 700,
    lineHeight: 1.7,
  },
  partFooterRow: { display: "flex", gap: 10, alignItems: "center" },
  partSelect: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    borderRadius: 10,
    background: "#151522",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.12)",
    cursor: "pointer",
    fontWeight: 800,
  },
  partColor: {
    width: 64,
    height: 52,
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: 10,
    cursor: "pointer",
    background: "#0f0f16",
  },

  // Modal
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.88)",
    backdropFilter: "blur(10px)",
    zIndex: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  modal: (borderColor, maxWidth) => ({
    width: "100%",
    maxWidth,
    maxHeight: "90vh",
    overflowY: "auto",
    background: "rgba(12,12,20,0.95)",
    border: `2px solid ${borderColor}`,
    borderRadius: 18,
    padding: 24,
    boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
  }),
  modalCloseWrap: { display: "flex", justifyContent: "flex-end" },
  modalCloseBtn: {
    background: "transparent",
    border: "none",
    color: "#fff",
    fontSize: 36,
    cursor: "pointer",
    lineHeight: 1,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: 900,
    margin: "0 0 16px 0",
  },
  modalBodyCenter: { color: "#fff", fontSize: 16, textAlign: "center", padding: 24 },

  adminGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
    gap: 16,
    marginBottom: 24,
  },
  adminCard: (bg, border) => ({
    background: bg,
    padding: 16,
    borderRadius: 12,
    border: `2px solid ${border}`,
  }),
  adminTable: {
    background: "#161620",
    padding: 18,
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.08)",
  },

  // Upload
  noticeCard: {
    background: "rgba(20,60,32,0.85)",
    border: "1px solid rgba(45,122,79,0.6)",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  noticeWarning: {
    marginTop: 10,
    fontSize: 14,
    color: "#ffd3d3",
    background: "#4a1818",
    padding: "6px 10px",
    borderRadius: 8,
    display: "inline-block",
  },
  label: {
    color: "#eaeaea",
    fontSize: 14,
    display: "block",
    marginBottom: 8,
    fontWeight: 700,
  },
  input: {
    width: "100%",
    padding: 13,
    borderRadius: 10,
    background: "#141420",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.12)",
    fontSize: 15,
  },
  textarea: {
    width: "100%",
    padding: 13,
    borderRadius: 10,
    background: "#141420",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.12)",
    fontSize: 15,
    minHeight: 90,
    resize: "vertical",
  },
  select: {
    width: "100%",
    padding: 13,
    borderRadius: 10,
    background: "#141420",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.12)",
    fontSize: 15,
    cursor: "pointer",
  },
  termsBox: {
    background: "#2c1810",
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
    border: "1px solid #4a2818",
  },
  termsLabel: {
    display: "flex",
    alignItems: "flex-start",
    color: "#fff",
    fontSize: 14,
    gap: 10,
    cursor: "pointer",
  },
  termsCheckbox: { width: 18, height: 18, cursor: "pointer", marginTop: 2 },
  submitBtn: {
    width: "100%",
    padding: 16,
    borderRadius: 12,
    background: "linear-gradient(135deg,#FF9800,#F57C00)",
    color: "#fff",
    border: "none",
    fontSize: 18,
    fontWeight: 800,
    cursor: "pointer",
  },

  // Debug HUD
  debugHud: {
    position: "absolute",
    top: 86,
    left: 18,
    color: "#a2ff9a",
    fontSize: 16,
    background: "rgba(4,8,6,0.9)",
    padding: 12,
    borderRadius: 10,
    fontFamily: "monospace",
    zIndex: 9,
    fontWeight: 800,
    border: "1px solid rgba(45,122,79,0.5)",
  },

  // Bottom help
  helperBox: {
    position: "absolute",
    bottom: 16,
    left: "50%",
    transform: "translateX(-50%)",
    color: "#fff",
    fontSize: 18,
    background: "rgba(10,10,16,0.8)",
    padding: "14px 22px",
    borderRadius: 12,
    zIndex: 6,
    textAlign: "center",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
  },
};

export default CarMod;
