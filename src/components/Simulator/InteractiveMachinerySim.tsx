import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { 
  Gamepad2, 
  RotateCw, 
  RotateCcw, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight, 
  AlertTriangle, 
  Play, 
  Pause, 
  RefreshCw, 
  Layers, 
  Eye, 
  User, 
  ShieldAlert, 
  ShieldCheck, 
  Radio, 
  FlaskConical, 
  X, 
  Footprints, 
  Octagon, 
  CheckCircle2, 
  Sparkles,
  Volume2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { audioService } from '../../services/audioService';

type CameraViewMode = 'ORBIT' | 'CABIN_FPV' | 'WORKER_CAM' | 'TOP_DOWN';

export const InteractiveMachinerySim: React.FC = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  // Machine Kinematics State
  const [cabAngle, setCabAngle] = useState(0); // degrees
  const [boomAngle, setBoomAngle] = useState(-30); // degrees
  const [stickAngle, setStickAngle] = useState(65); // degrees
  const [bucketAngle, setBucketAngle] = useState(35); // degrees
  const [trackPositionX, setTrackPositionX] = useState(0);

  // Ground Worker State
  const [selectedPerson, setSelectedPerson] = useState<string>('Surveyor Dave');
  const [isTestWalking, setIsTestWalking] = useState<boolean>(false);
  const [testWalkProgress, setTestWalkProgress] = useState<number>(0);
  const [workerPos, setWorkerPos] = useState({ x: 20, z: 12 });
  const [workerDistance, setWorkerDistance] = useState(23.3);
  const [workerZone, setWorkerZone] = useState<'SAFE' | 'WARNING' | 'DANGER'>('SAFE');
  const [interlockActive, setInterlockActive] = useState(false);
  const [overrideInterlock, setOverrideInterlock] = useState(false);

  // Live Detection Message
  const [activeAlertMessage, setActiveAlertMessage] = useState<string>('PERIMETER CLEAR: Ground worker at safe distance (> 15m). Press "TEST: WALK TOWARDS VEHICLE" to simulate proximity breach.');
  const [testReportLog, setTestReportLog] = useState<{
    person: string;
    stage: string;
    distance: number;
    zone: 'SAFE' | 'WARNING' | 'DANGER';
    timestamp: string;
  } | null>(null);

  // Sim Game State
  const [cameraMode, setCameraMode] = useState<CameraViewMode>('ORBIT');
  const [payloadTons, setPayloadTons] = useState(0);
  const [dirtLoaded, setDirtLoaded] = useState(false);
  const [hornActive, setHornActive] = useState(false);

  // References for Three.js objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  
  // Meshes
  const excavatorCabGroup = useRef<THREE.Group | null>(null);
  const boomGroup = useRef<THREE.Group | null>(null);
  const stickGroup = useRef<THREE.Group | null>(null);
  const bucketMesh = useRef<THREE.Mesh | null>(null);
  const excavatorBaseGroup = useRef<THREE.Group | null>(null);
  const workerGroup = useRef<THREE.Group | null>(null);
  const workerLegL = useRef<THREE.Mesh | null>(null);
  const workerLegR = useRef<THREE.Mesh | null>(null);
  const workerArmL = useRef<THREE.Mesh | null>(null);
  const workerArmR = useRef<THREE.Mesh | null>(null);
  const dirtMeshInBucket = useRef<THREE.Mesh | null>(null);
  const truckPayloadMesh = useRef<THREE.Mesh | null>(null);
  const dangerRingMatRef = useRef<THREE.MeshBasicMaterial | null>(null);

  // Animation Loop State
  const animState = useRef({
    time: 0,
    isWalkingTowardsVehicle: false,
    walkSpeed: 3.2,
    workerCurrentX: 20,
    workerCurrentZ: 12,
    startX: 20,
    startZ: 12,
    targetX: 2.8,
    targetZ: 1.8,
    workerAngle: 0,
    camAngle: 0.6,
    camDistance: 32,
    camPitch: 0.4,
    isDraggingMouse: false,
    prevMouseX: 0,
    prevMouseY: 0
  });

  // Start Test Walk towards vehicle
  const handleStartTestWalk = () => {
    // Reset to starting outer point (22m away)
    animState.current.workerCurrentX = 20;
    animState.current.workerCurrentZ = 12;
    animState.current.isWalkingTowardsVehicle = true;
    setIsTestWalking(true);
    setWorkerZone('SAFE');
    setInterlockActive(false);
    setTestWalkProgress(0);

    setActiveAlertMessage(`🚶 TEST STARTED: ${selectedPerson} is walking towards machine EXC001 from outer perimeter (23.3m)...`);
    audioService.speakVoice(`Test initiated. ${selectedPerson} is now walking towards the excavator.`);
  };

  // Stop / Reset Test Walk
  const handleResetTestWalk = () => {
    animState.current.isWalkingTowardsVehicle = false;
    animState.current.workerCurrentX = 20;
    animState.current.workerCurrentZ = 12;
    setIsTestWalking(false);
    setWorkerPos({ x: 20, z: 12 });
    setWorkerDistance(23.3);
    setWorkerZone('SAFE');
    setInterlockActive(false);
    setTestWalkProgress(0);
    setActiveAlertMessage('PERIMETER CLEAR: Ground worker returned to safe outer station (23.3m).');
    audioService.speakVoice('Test reset. Worker returned to safe perimeter.');
  };

  // Three.js 3D Scene Initialization
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = 480;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0d0f14');
    scene.fog = new THREE.FogExp2('#0d0f14', 0.012);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 300);
    camera.position.set(24, 18, 24);
    camera.lookAt(0, 3, 0);
    cameraRef.current = camera;

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight('#ffffff', 0.85);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight('#fff5e6', 2.0);
    sunLight.position.set(35, 50, 30);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 120;
    sunLight.shadow.camera.left = -35;
    sunLight.shadow.camera.right = 35;
    sunLight.shadow.camera.top = 35;
    sunLight.shadow.camera.bottom = -35;
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight('#38bdf8', 0.5);
    rimLight.position.set(-25, 20, -25);
    scene.add(rimLight);

    // 4. Ground Terrain & Trench
    const groundGeo = new THREE.PlaneGeometry(140, 140, 32, 32);
    const groundMat = new THREE.MeshStandardMaterial({ color: '#241b16', roughness: 0.95, metalness: 0.05 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const grid = new THREE.GridHelper(120, 60, '#ffcd11', '#283142');
    grid.position.y = 0.02;
    scene.add(grid);

    // Trench Pit Hole
    const pitGeo = new THREE.BoxGeometry(16, 3.5, 11);
    const pitMat = new THREE.MeshStandardMaterial({ color: '#130a05', roughness: 1.0 });
    const pit = new THREE.Mesh(pitGeo, pitMat);
    pit.position.set(8, -1.7, 0);
    scene.add(pit);

    // 5. 3D Exclusion Danger Rings (Red 5.5m, Yellow 11m)
    const dangerRingGeo = new THREE.RingGeometry(0.1, 5.5, 64);
    const dangerRingMat = new THREE.MeshBasicMaterial({ 
      color: '#ef4444', 
      side: THREE.DoubleSide, 
      transparent: true, 
      opacity: 0.28 
    });
    dangerRingMatRef.current = dangerRingMat;
    const dangerRing = new THREE.Mesh(dangerRingGeo, dangerRingMat);
    dangerRing.rotation.x = -Math.PI / 2;
    dangerRing.position.y = 0.06;
    scene.add(dangerRing);

    const warningRingGeo = new THREE.RingGeometry(5.5, 11.0, 64);
    const warningRingMat = new THREE.MeshBasicMaterial({ 
      color: '#f59e0b', 
      side: THREE.DoubleSide, 
      transparent: true, 
      opacity: 0.12 
    });
    const warningRing = new THREE.Mesh(warningRingGeo, warningRingMat);
    warningRing.rotation.x = -Math.PI / 2;
    warningRing.position.y = 0.04;
    scene.add(warningRing);

    // 6. Detailed CAT 336 Excavator 3D Model
    const baseGroup = new THREE.Group();
    scene.add(baseGroup);
    excavatorBaseGroup.current = baseGroup;

    const trackMat = new THREE.MeshStandardMaterial({ color: '#16171a', metalness: 0.85, roughness: 0.35 });
    const trackGeo = new THREE.BoxGeometry(7.0, 1.5, 1.6);
    
    const trackL = new THREE.Mesh(trackGeo, trackMat);
    trackL.position.set(0, 0.75, 1.9);
    trackL.castShadow = true;
    baseGroup.add(trackL);

    const trackR = new THREE.Mesh(trackGeo, trackMat);
    trackR.position.set(0, 0.75, -1.9);
    trackR.castShadow = true;
    baseGroup.add(trackR);

    // Cab Upperstructure
    const cabGroup = new THREE.Group();
    cabGroup.position.set(0, 1.6, 0);
    baseGroup.add(cabGroup);
    excavatorCabGroup.current = cabGroup;

    const catYellowMat = new THREE.MeshStandardMaterial({ color: '#ffcd11', roughness: 0.25, metalness: 0.35 });
    const cabBody = new THREE.Mesh(new THREE.BoxGeometry(5.2, 2.3, 3.6), catYellowMat);
    cabBody.position.set(-0.7, 1.15, 0);
    cabBody.castShadow = true;
    cabGroup.add(cabBody);

    const counterweight = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 2.1, 3.55),
      new THREE.MeshStandardMaterial({ color: '#0f1115', roughness: 0.7, metalness: 0.4 })
    );
    counterweight.position.set(-2.8, 1.15, 0);
    counterweight.castShadow = true;
    cabGroup.add(counterweight);

    const glassMat = new THREE.MeshPhysicalMaterial({ color: '#0284c7', transparent: true, opacity: 0.6, transmission: 0.9 });
    const cabGlass = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.1, 1.6), glassMat);
    cabGlass.position.set(0.7, 1.25, 1.0);
    cabGroup.add(cabGlass);

    // 7. Boom, Stick & Bucket
    const boomG = new THREE.Group();
    boomG.position.set(1.6, 1.7, -0.4);
    cabGroup.add(boomG);
    boomGroup.current = boomG;

    const boomMesh = new THREE.Mesh(new THREE.BoxGeometry(6.6, 1.1, 0.9), catYellowMat);
    boomMesh.position.set(3.2, 0, 0);
    boomMesh.castShadow = true;
    boomG.add(boomMesh);

    const stickG = new THREE.Group();
    stickG.position.set(6.4, 0, 0);
    boomG.add(stickG);
    stickGroup.current = stickG;

    const stickMesh = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.8, 0.7), catYellowMat);
    stickMesh.position.set(2.4, 0, 0);
    stickMesh.castShadow = true;
    stickG.add(stickMesh);

    const bucketG = new THREE.Mesh(
      new THREE.BoxGeometry(1.9, 1.5, 1.5),
      new THREE.MeshStandardMaterial({ color: '#27272a', metalness: 0.85, roughness: 0.3 })
    );
    bucketG.position.set(5.0, 0, 0);
    bucketG.castShadow = true;
    stickG.add(bucketG);
    bucketMesh.current = bucketG;

    const dirtInB = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.75),
      new THREE.MeshStandardMaterial({ color: '#78350f', roughness: 0.95 })
    );
    dirtInB.position.set(0.2, 0.2, 0);
    dirtInB.visible = false;
    bucketG.add(dirtInB);
    dirtMeshInBucket.current = dirtInB;

    // 8. Hauler Truck
    const truckGroup = new THREE.Group();
    truckGroup.position.set(-15, 0, -4);
    scene.add(truckGroup);

    const truckCab = new THREE.Mesh(new THREE.BoxGeometry(3.6, 3.4, 3.4), catYellowMat);
    truckCab.position.set(-3.6, 2.1, 0);
    truckCab.castShadow = true;
    truckGroup.add(truckCab);

    const truckBed = new THREE.Mesh(new THREE.BoxGeometry(7.5, 2.6, 3.6), catYellowMat);
    truckBed.position.set(2.2, 2.3, 0);
    truckBed.castShadow = true;
    truckGroup.add(truckBed);

    const tPayload = new THREE.Mesh(
      new THREE.BoxGeometry(7.0, 1.3, 3.2),
      new THREE.MeshStandardMaterial({ color: '#5c3317', roughness: 0.9 })
    );
    tPayload.position.set(2.2, 3.2, 0);
    tPayload.visible = false;
    truckGroup.add(tPayload);
    truckPayloadMesh.current = tPayload;

    // 9. Ground Worker Avatar
    const wGroup = new THREE.Group();
    wGroup.position.set(20, 0, 12);
    scene.add(wGroup);
    workerGroup.current = wGroup;

    const vestMat = new THREE.MeshStandardMaterial({ color: '#ff5722', emissive: '#e64a19', emissiveIntensity: 0.3, roughness: 0.4 });
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.95, 0.5), vestMat);
    torso.position.y = 1.3;
    torso.castShadow = true;
    wGroup.add(torso);

    const stripe = new THREE.Mesh(
      new THREE.BoxGeometry(0.78, 0.16, 0.52),
      new THREE.MeshStandardMaterial({ color: '#ffffff', metalness: 0.9, roughness: 0.1 })
    );
    stripe.position.y = 1.3;
    wGroup.add(stripe);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.25, 16, 16), new THREE.MeshStandardMaterial({ color: '#fbcfe8' }));
    head.position.y = 2.05;
    wGroup.add(head);

    const hardhat = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.38, 0.22, 16), new THREE.MeshStandardMaterial({ color: '#facc15', metalness: 0.3 }));
    hardhat.position.y = 2.22;
    wGroup.add(hardhat);

    const legMat = new THREE.MeshStandardMaterial({ color: '#1e3a8a' });
    const legL = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.85, 0.28), legMat);
    legL.position.set(0.22, 0.48, 0);
    legL.castShadow = true;
    wGroup.add(legL);
    workerLegL.current = legL;

    const legR = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.85, 0.28), legMat);
    legR.position.set(-0.22, 0.48, 0);
    legR.castShadow = true;
    wGroup.add(legR);
    workerLegR.current = legR;

    const armMat = new THREE.MeshStandardMaterial({ color: '#ea580c' });
    const armL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.75, 0.22), armMat);
    armL.position.set(0.48, 1.25, 0);
    wGroup.add(armL);
    workerArmL.current = armL;

    const armR = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.75, 0.22), armMat);
    armR.position.set(-0.48, 1.25, 0);
    wGroup.add(armR);
    workerArmR.current = armR;

    const beacon = new THREE.PointLight('#ff3b30', 1.2, 10);
    beacon.position.set(0, 2.7, 0);
    wGroup.add(beacon);

    // 10. Mouse Camera Orbit Handlers
    const onMouseDown = (e: MouseEvent) => {
      animState.current.isDraggingMouse = true;
      animState.current.prevMouseX = e.clientX;
      animState.current.prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!animState.current.isDraggingMouse) return;
      const deltaX = e.clientX - animState.current.prevMouseX;
      const deltaY = e.clientY - animState.current.prevMouseY;
      animState.current.prevMouseX = e.clientX;
      animState.current.prevMouseY = e.clientY;

      animState.current.camAngle -= deltaX * 0.008;
      animState.current.camPitch = Math.max(0.1, Math.min(1.4, animState.current.camPitch + deltaY * 0.006));
    };

    const onMouseUp = () => {
      animState.current.isDraggingMouse = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      animState.current.camDistance = Math.max(12, Math.min(65, animState.current.camDistance + e.deltaY * 0.04));
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('wheel', onWheel, { passive: false });

    // State trackers for speech alerts during walking
    let warned10m = false;
    let breached5m = false;

    // 11. Main 3D Animation & Real-Time Walk Towards Vehicle Loop
    let animId: number;
    let lastTime = performance.now();

    const animate = () => {
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      animState.current.time += dt;

      // Kinematics updates
      if (excavatorCabGroup.current) excavatorCabGroup.current.rotation.y = (cabAngle * Math.PI) / 180;
      if (boomGroup.current) boomGroup.current.rotation.z = (boomAngle * Math.PI) / 180;
      if (stickGroup.current) stickGroup.current.rotation.z = (stickAngle * Math.PI) / 180;
      if (bucketMesh.current) bucketMesh.current.rotation.z = (bucketAngle * Math.PI) / 180;
      if (excavatorBaseGroup.current) excavatorBaseGroup.current.position.x = trackPositionX;

      const st = animState.current;

      // When "TEST WALK" is active: Move worker towards excavator center (0, 0)
      if (st.isWalkingTowardsVehicle) {
        const dx = st.targetX - st.workerCurrentX;
        const dz = st.targetZ - st.workerCurrentZ;
        const distToTarget = Math.sqrt(dx * dx + dz * dz);

        if (distToTarget > 0.2) {
          st.workerCurrentX += (dx / distToTarget) * st.walkSpeed * dt;
          st.workerCurrentZ += (dz / distToTarget) * st.walkSpeed * dt;
          st.workerAngle = Math.atan2(dx, dz);

          // Limb swinging walk animation
          const legSwing = Math.sin(st.time * 9) * 0.45;
          if (workerLegL.current) workerLegL.current.rotation.x = legSwing;
          if (workerLegR.current) workerLegR.current.rotation.x = -legSwing;
          if (workerArmL.current) workerArmL.current.rotation.x = -legSwing;
          if (workerArmR.current) workerArmR.current.rotation.x = legSwing;
        } else {
          // Reached Danger Zone target
          st.isWalkingTowardsVehicle = false;
          setIsTestWalking(false);
        }
      } else {
        if (workerLegL.current) workerLegL.current.rotation.x = 0;
        if (workerLegR.current) workerLegR.current.rotation.x = 0;
        if (workerArmL.current) workerArmL.current.rotation.x = 0;
        if (workerArmR.current) workerArmR.current.rotation.x = 0;
      }

      // Position worker mesh
      if (workerGroup.current) {
        workerGroup.current.position.set(st.workerCurrentX, 0, st.workerCurrentZ);
        workerGroup.current.rotation.y = st.workerAngle;
      }

      // Real-Time Distance & Detection Evaluation
      const currentDist = Number(Math.sqrt(st.workerCurrentX ** 2 + st.workerCurrentZ ** 2).toFixed(1));
      setWorkerPos({ x: Number(st.workerCurrentX.toFixed(1)), z: Number(st.workerCurrentZ.toFixed(1)) });
      setWorkerDistance(currentDist);

      // Detection Multi-Phase Alerts
      if (currentDist <= 5.5) {
        setWorkerZone('DANGER');
        setInterlockActive(true);
        setActiveAlertMessage(`🚨 DANGER ZONE BREACH DETECTED: ${selectedPerson} is at ${currentDist}m within machine swing kill radius! Automatic swing interlock engaged.`);
        
        if (dangerRingMatRef.current) {
          dangerRingMatRef.current.opacity = 0.35 + Math.sin(st.time * 8) * 0.15;
        }

        if (!breached5m) {
          breached5m = true;
          audioService.playWarningAlarm();
          audioService.speakVoice(`Danger zone violation! ${selectedPerson} walked within ${currentDist} meters. Slew brake locked.`);
          setTestReportLog({
            person: selectedPerson,
            stage: 'CRITICAL DANGER ZONE BREACH',
            distance: currentDist,
            zone: 'DANGER',
            timestamp: new Date().toLocaleTimeString()
          });
        }
      } else if (currentDist <= 11.0) {
        setWorkerZone('WARNING');
        setInterlockActive(false);
        setActiveAlertMessage(`⚠️ PROXIMITY WARNING: ${selectedPerson} is walking through 10m outer perimeter (${currentDist}m). Buzzer sounding.`);
        
        if (!warned10m) {
          warned10m = true;
          audioService.playProximityBlip(false);
          audioService.speakVoice(`Warning. ${selectedPerson} entered proximity perimeter at ${currentDist} meters.`);
        }
      } else {
        setWorkerZone('SAFE');
        setInterlockActive(false);
        warned10m = false;
        breached5m = false;
      }

      // Camera positioning
      if (cameraRef.current) {
        if (cameraMode === 'ORBIT') {
          const r = st.camDistance;
          const x = r * Math.sin(st.camAngle) * Math.cos(st.camPitch);
          const y = r * Math.sin(st.camPitch) + 3;
          const z = r * Math.cos(st.camAngle) * Math.cos(st.camPitch);
          cameraRef.current.position.set(x, y, z);
          cameraRef.current.lookAt(0, 2.5, 0);
        } else if (cameraMode === 'CABIN_FPV') {
          const rad = (cabAngle * Math.PI) / 180;
          cameraRef.current.position.set(
            trackPositionX + 0.6 * Math.cos(rad) + 0.9 * Math.sin(rad),
            3.0,
            0.6 * Math.sin(rad) - 0.9 * Math.cos(rad)
          );
          cameraRef.current.lookAt(
            trackPositionX + 15 * Math.sin(rad),
            1.5,
            -15 * Math.cos(rad)
          );
        } else if (cameraMode === 'WORKER_CAM') {
          cameraRef.current.position.set(st.workerCurrentX - 4, 3.5, st.workerCurrentZ + 4);
          cameraRef.current.lookAt(st.workerCurrentX, 1.6, st.workerCurrentZ);
        } else if (cameraMode === 'TOP_DOWN') {
          cameraRef.current.position.set(0, 44, 0.1);
          cameraRef.current.lookAt(0, 0, 0);
        }
      }

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('wheel', onWheel);
      renderer.dispose();
    };
  }, [cabAngle, boomAngle, stickAngle, bucketAngle, trackPositionX, cameraMode, selectedPerson]);

  // Digging & Dumping Handlers
  const handleScoopDirt = () => {
    if (interlockActive && !overrideInterlock) {
      audioService.playWarningAlarm();
      audioService.speakVoice('Hydraulic movement locked. Clear ground worker from red danger zone first.');
      return;
    }

    setBoomAngle(-55);
    setStickAngle(95);
    setBucketAngle(65);
    setDirtLoaded(true);
    if (dirtMeshInBucket.current) dirtMeshInBucket.current.visible = true;
    audioService.playHydraulicClick();
    audioService.speakVoice('Bucket engaged. 3.5 Tons loaded.');
  };

  const handleDumpToTruck = () => {
    if (interlockActive && !overrideInterlock) {
      audioService.playWarningAlarm();
      audioService.speakVoice('Hydraulic movement locked. Personnel in swing path.');
      return;
    }

    setCabAngle(145);
    setBoomAngle(-20);
    setStickAngle(45);
    setBucketAngle(-35);

    setTimeout(() => {
      setDirtLoaded(false);
      if (dirtMeshInBucket.current) dirtMeshInBucket.current.visible = false;
      if (truckPayloadMesh.current) truckPayloadMesh.current.visible = true;

      setPayloadTons(t => {
        const next = Math.min(14, t + 3.5);
        if (next >= 14) {
          confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
          audioService.speakVoice('CAT 745 Hauler reached maximum 14.0 Ton payload capacity!');
        }
        return next;
      });
      audioService.playSeatbeltChime(true);
    }, 600);
  };

  const handleSlew = (delta: number) => {
    if (interlockActive && !overrideInterlock) {
      audioService.playWarningAlarm();
      audioService.speakVoice('Swing brake locked. Safety hazard in perimeter.');
      return;
    }
    setCabAngle(a => (a + delta) % 360);
    audioService.playHydraulicClick();
  };

  return (
    <div className="space-y-4">
      {/* Top Banner Alert Bar */}
      <div className={`rounded-2xl p-4 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl ${
        workerZone === 'DANGER' 
          ? 'bg-rose-950/90 border-rose-500 animate-pulse shadow-rose-950/60' 
          : workerZone === 'WARNING'
          ? 'bg-amber-950/70 border-amber-500 shadow-amber-950/40'
          : 'bg-[#14161b] border-cat-border'
      }`}>
        <div className="flex items-center space-x-3">
          {workerZone === 'DANGER' ? (
            <ShieldAlert className="w-8 h-8 text-rose-400 animate-bounce shrink-0" />
          ) : workerZone === 'WARNING' ? (
            <AlertTriangle className="w-7 h-7 text-amber-400 shrink-0" />
          ) : (
            <ShieldCheck className="w-7 h-7 text-emerald-400 shrink-0" />
          )}
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-black font-mono text-white tracking-wider">
                {workerZone === 'DANGER' ? 'DANGER ZONE BREACH DETECTED' :
                 workerZone === 'WARNING' ? 'PROXIMITY PERIMETER WARNING' :
                 'WORK ZONE PERIMETER SECURED'}
              </h3>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                workerZone === 'DANGER' ? 'bg-rose-600 text-white' :
                workerZone === 'WARNING' ? 'bg-amber-500 text-black' :
                'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
              }`}>
                {workerDistance} METERS
              </span>
            </div>
            <p className="text-xs text-slate-200 mt-0.5 font-sans">
              {activeAlertMessage}
            </p>
          </div>
        </div>

        {/* Action controls & Primary TEST WALK Button */}
        <div className="flex items-center space-x-2">
          {!isTestWalking ? (
            <button
              onClick={handleStartTestWalk}
              className="px-4 py-2.5 bg-cat-yellow hover:bg-cat-gold text-black font-black text-xs font-mono rounded-xl shadow-lg shadow-cat-yellow/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <FlaskConical className="w-4 h-4 text-black animate-bounce" />
              <span>TEST: WALK TOWARDS VEHICLE</span>
            </button>
          ) : (
            <button
              onClick={handleResetTestWalk}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs font-mono rounded-xl shadow-lg transition-all flex items-center gap-1.5"
            >
              <Pause className="w-4 h-4" />
              <span>STOP & RESET TEST</span>
            </button>
          )}

          {interlockActive && (
            <button
              onClick={() => setOverrideInterlock(!overrideInterlock)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border ${
                overrideInterlock 
                  ? 'bg-amber-500 text-black border-amber-400' 
                  : 'bg-rose-900/60 text-rose-200 border-rose-600 hover:bg-rose-800'
              }`}
            >
              {overrideInterlock ? '⚠️ OVERRIDDEN' : 'OVERRIDE LOCK'}
            </button>
          )}
        </div>
      </div>

      {/* Personnel Selector & Walking Progress Bar */}
      <div className="hud-panel-active rounded-xl p-4 border border-cat-border space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cat-border/60 pb-2.5">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-cat-yellow" />
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Select Personnel to Test:
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {['Surveyor Dave', 'Ground Spotter Mike', 'Site Engineer Sarah', 'Trench Laborer Alex'].map((person) => (
              <button
                key={person}
                onClick={() => setSelectedPerson(person)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all border ${
                  selectedPerson === person
                    ? 'bg-cat-yellow text-black border-cat-yellow shadow'
                    : 'bg-cat-surface text-slate-300 border-cat-border hover:border-slate-500'
                }`}
              >
                {person}
              </button>
            ))}
          </div>
        </div>

        {/* Live Distance Meter / Walking Phase Track */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-mono text-slate-300">
            <span className="flex items-center gap-1.5">
              <Footprints className="w-4 h-4 text-cat-yellow" />
              Live Proximity Tracker: <strong className="text-white">{selectedPerson}</strong>
            </span>
            <span className={`font-bold ${
              workerZone === 'DANGER' ? 'text-rose-400 animate-pulse' :
              workerZone === 'WARNING' ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {workerDistance} METERS ({workerZone} ZONE)
            </span>
          </div>

          {/* Graphical Zone Meter Bar */}
          <div className="w-full bg-cat-black h-3 rounded-full overflow-hidden border border-cat-border relative flex">
            {/* Red Zone (0 - 5.5m) */}
            <div className="h-full bg-rose-500/80 border-r border-rose-400" style={{ width: '25%' }} title="0 - 5.5m Critical Red Danger Zone" />
            {/* Yellow Zone (5.5 - 11m) */}
            <div className="h-full bg-amber-500/80 border-r border-amber-400" style={{ width: '30%' }} title="5.5 - 11m Yellow Warning Zone" />
            {/* Safe Zone (> 11m) */}
            <div className="h-full bg-emerald-500/60" style={{ width: '45%' }} title="> 11m Safe Zone" />

            {/* Position Marker */}
            <div 
              className="absolute top-0 bottom-0 w-3 bg-white rounded-full shadow-lg -ml-1.5 transition-all duration-150 border-2 border-black"
              style={{ left: `${Math.max(4, Math.min(98, 100 - (workerDistance / 24) * 100))}%` }}
            />
          </div>

          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>Machine Pivot (0m)</span>
            <span className="text-rose-400">🔴 Danger (&lt; 5.5m)</span>
            <span className="text-amber-400">🟡 Warning (5.5 - 11m)</span>
            <span className="text-emerald-400">🟢 Safe (&gt; 11m)</span>
            <span>Outer Start (24m)</span>
          </div>
        </div>
      </div>

      {/* 3D Simulation Viewport Container */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-cat-border bg-[#0b0c10] shadow-2xl">
        <div ref={mountRef} className="w-full h-[480px] cursor-grab active:cursor-grabbing" />

        {/* Top-Left HUD Telemetry Overlay */}
        <div className="absolute top-4 left-4 bg-cat-black/85 backdrop-blur-md p-3.5 rounded-xl border border-cat-border text-xs font-mono space-y-1.5 pointer-events-none">
          <div className="text-cat-yellow font-bold border-b border-cat-border/60 pb-1 flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5"><Layers className="w-3.5 h-3.5" /> CAT 336 3D TELEMETRY</span>
            <span className="text-[10px] text-emerald-400 font-bold">1530.2h</span>
          </div>
          <div className="flex justify-between gap-4 text-slate-300">
            <span>CAB SLEW:</span>
            <span className="text-white font-bold">{Math.round(cabAngle)}°</span>
          </div>
          <div className="flex justify-between gap-4 text-slate-300">
            <span>BOOM REACH:</span>
            <span className="text-white font-bold">{Math.round(boomAngle)}°</span>
          </div>
          <div className="flex justify-between gap-4 text-slate-300">
            <span>BUCKET LOAD:</span>
            <span className={dirtLoaded ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
              {dirtLoaded ? 'LOADED (3.5T)' : 'EMPTY'}
            </span>
          </div>
          <div className="flex justify-between gap-4 text-slate-300">
            <span>HAULER PAYLOAD:</span>
            <span className="text-cat-yellow font-bold">{payloadTons.toFixed(1)} / 14.0 T</span>
          </div>
        </div>

        {/* Top-Right Camera Switcher */}
        <div className="absolute top-4 right-4 bg-cat-black/85 backdrop-blur-md p-2 rounded-xl border border-cat-border flex items-center space-x-1">
          <button
            onClick={() => setCameraMode('ORBIT')}
            className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-all ${
              cameraMode === 'ORBIT' ? 'bg-cat-yellow text-black' : 'text-slate-400 hover:text-white'
            }`}
            title="3D Free Orbit Camera"
          >
            3D Orbit
          </button>
          <button
            onClick={() => setCameraMode('CABIN_FPV')}
            className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-all ${
              cameraMode === 'CABIN_FPV' ? 'bg-cat-yellow text-black' : 'text-slate-400 hover:text-white'
            }`}
            title="Cockpit FPV"
          >
            Cab FPV
          </button>
          <button
            onClick={() => setCameraMode('WORKER_CAM')}
            className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-all ${
              cameraMode === 'WORKER_CAM' ? 'bg-cat-yellow text-black' : 'text-slate-400 hover:text-white'
            }`}
            title="Worker Cam"
          >
            Worker Cam
          </button>
          <button
            onClick={() => setCameraMode('TOP_DOWN')}
            className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-all ${
              cameraMode === 'TOP_DOWN' ? 'bg-cat-yellow text-black' : 'text-slate-400 hover:text-white'
            }`}
            title="Top-Down"
          >
            Top-Down
          </button>
        </div>

        {/* Bottom-Right Worker Live Tracker */}
        <div className="absolute bottom-4 right-4 bg-cat-black/90 backdrop-blur-md p-3 rounded-xl border border-cat-border text-xs font-mono space-y-1">
          <div className="flex items-center space-x-2">
            <User className={`w-4 h-4 ${workerZone === 'DANGER' ? 'text-rose-400 animate-bounce' : 'text-cat-yellow'}`} />
            <span className="text-white font-bold">{selectedPerson}</span>
          </div>
          <div className="text-[11px] text-slate-300">
            Coordinates: ({workerPos.x}m, {workerPos.z}m)
          </div>
          <div className={`text-[11px] font-bold ${
            workerZone === 'DANGER' ? 'text-rose-400 animate-pulse' :
            workerZone === 'WARNING' ? 'text-amber-400' : 'text-emerald-400'
          }`}>
            Zone: {workerZone} ({workerDistance}m)
          </div>
          <div className="text-[10px] text-slate-400">
            Status: {isTestWalking ? '🏃 Walking towards machine' : '🛑 Standing stationary'}
          </div>
        </div>

        {/* Bottom-Left Quick Instructions */}
        <div className="absolute bottom-4 left-4 bg-cat-black/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-cat-border text-[10px] font-mono text-slate-400">
          💡 Click "TEST: WALK TOWARDS VEHICLE" to watch the 3D person walk in and trigger live detections
        </div>
      </div>

      {/* Interactive Control Console Strip */}
      <div className="hud-panel-active rounded-xl p-5 border border-cat-border space-y-4">
        <div className="flex items-center justify-between border-b border-cat-border pb-2">
          <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Gamepad2 className="w-4 h-4 text-cat-yellow" /> Excavator Actuators & Digging Controls
          </h4>
          <span className="text-xs font-mono text-emerald-400 font-bold">
            TRUCK LOAD: {payloadTons.toFixed(1)} / 14 TONS
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Cab Slew */}
          <div className="bg-cat-surface p-3 rounded-xl border border-cat-border space-y-2">
            <span className="text-[11px] font-mono text-slate-400 block text-center">1. CAB SLEW ROTATION</span>
            <div className="flex justify-center space-x-2">
              <button
                onClick={() => handleSlew(-15)}
                className="px-3 py-2 bg-cat-black hover:bg-cat-card text-cat-yellow border border-cat-border rounded-lg text-xs font-mono font-bold flex items-center gap-1 active:scale-95 flex-1 justify-center"
              >
                <RotateCcw className="w-3.5 h-3.5" /> SLEW LEFT
              </button>
              <button
                onClick={() => handleSlew(15)}
                className="px-3 py-2 bg-cat-black hover:bg-cat-card text-cat-yellow border border-cat-border rounded-lg text-xs font-mono font-bold flex items-center gap-1 active:scale-95 flex-1 justify-center"
              >
                <RotateCw className="w-3.5 h-3.5" /> SLEW RIGHT
              </button>
            </div>
          </div>

          {/* Boom Reach */}
          <div className="bg-cat-surface p-3 rounded-xl border border-cat-border space-y-2">
            <span className="text-[11px] font-mono text-slate-400 block text-center">2. MAIN BOOM REACH</span>
            <div className="flex justify-center space-x-2">
              <button
                onClick={() => setBoomAngle(b => Math.max(-60, b - 5))}
                className="px-3 py-2 bg-cat-black hover:bg-cat-card text-cat-yellow border border-cat-border rounded-lg text-xs font-mono font-bold flex items-center gap-1 active:scale-95 flex-1 justify-center"
              >
                <ArrowUp className="w-3.5 h-3.5" /> BOOM UP
              </button>
              <button
                onClick={() => setBoomAngle(b => Math.min(10, b + 5))}
                className="px-3 py-2 bg-cat-black hover:bg-cat-card text-cat-yellow border border-cat-border rounded-lg text-xs font-mono font-bold flex items-center gap-1 active:scale-95 flex-1 justify-center"
              >
                <ArrowDown className="w-3.5 h-3.5" /> BOOM DOWN
              </button>
            </div>
          </div>

          {/* Track Travel */}
          <div className="bg-cat-surface p-3 rounded-xl border border-cat-border space-y-2">
            <span className="text-[11px] font-mono text-slate-400 block text-center">3. MACHINE TRACK TRAVEL</span>
            <div className="flex justify-center space-x-2">
              <button
                onClick={() => setTrackPositionX(x => Math.max(-8, x - 1))}
                className="px-3 py-2 bg-cat-black hover:bg-cat-card text-slate-200 border border-cat-border rounded-lg text-xs font-mono font-bold flex items-center gap-1 active:scale-95 flex-1 justify-center"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> REVERSE
              </button>
              <button
                onClick={() => setTrackPositionX(x => Math.min(8, x + 1))}
                className="px-3 py-2 bg-cat-black hover:bg-cat-card text-slate-200 border border-cat-border rounded-lg text-xs font-mono font-bold flex items-center gap-1 active:scale-95 flex-1 justify-center"
              >
                <ArrowRight className="w-3.5 h-3.5" /> FORWARD
              </button>
            </div>
          </div>

          {/* Excavate & Dump */}
          <div className="bg-cat-surface p-3 rounded-xl border border-cat-border space-y-2">
            <span className="text-[11px] font-mono text-slate-400 block text-center">4. QUICK EXCAVATE & LOAD</span>
            <div className="flex justify-center space-x-2">
              <button
                onClick={handleScoopDirt}
                className="px-3 py-2 bg-cat-yellow hover:bg-cat-gold text-black rounded-lg text-xs font-mono font-black active:scale-95 shadow flex-1 text-center"
              >
                1. SCOOP DIRT
              </button>
              <button
                onClick={handleDumpToTruck}
                className="px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-black rounded-lg text-xs font-mono font-black active:scale-95 shadow flex-1 text-center"
              >
                2. DUMP TRUCK
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
