# CAT Sentinel™ | Smart Operator Assistant for Heavy Machinery

[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6.svg)](https://www.typescriptlang.org/)
[![Three.js](https://img.shields.io/badge/Three.js-r128-black.svg)](https://threejs.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF.svg)](https://vitejs.dev/)

An end-to-end intelligent operator companion and telematics cockpit designed for **Caterpillar CAT 336 NextGen Excavators**. Built to assist heavy equipment operators throughout their workday by maximizing efficiency, ensuring zero-harm safety compliance, detecting machine strain anomalies, predicting task durations, and delivering 3D simulation training.

---

## 🏗️ Key Modules

### 1. 🚀 Live Cockpit HUD & Telemetry Center
* Real-time CAN-bus ECM gauges: Engine Tachometer (RPM), Main Hydraulic Pressure (bar), Fuel Burn Flow (L/h), DEF fluid, and Coolant Temperature.
* Digital Inclinometer (Pitch & Roll) with lateral slope rollover warnings (> 18° threshold).
* Dynamic engine throttle switching (`ECO SAVE -18% Fuel`, `STANDARD WORK`, `POWER PLUS +20% Force`).
* Daily shift work order dashboard with live progress sliders, task timers, and instant dispatching.

### 2. 🛡️ 360° Safety Radar & Proximity Sentinel
* Ultrasonic top-down radar scanning a 30-meter radius around the machine.
* Color-coded proximity hazard zones:
  * 🔴 **Critical Red Zone (< 5.5m)**: Automatic swing interlock brake engagement.
  * 🟡 **Warning Yellow Zone (5.5m - 11m)**: Proximity beeps & blindspot visual alerts.
  * 🟢 **Clear Green Zone (> 11m)**: Safe working perimeter.
* **Seatbelt Compliance Interlock**: Live cabin harness sensor with OSHA non-compliance logging and auto-lockout.
* **Incident Blackbox Recorder**: 1-tap incident logger with GPS coordinates (`37.7749° N, 122.4194° W`), weather snapshot, and emergency broadcast.

### 3. 🧠 AI Predictive Task Time Estimator
* Deep regression heuristic algorithm modeling:
  * **Task Types**: Earth Excavation, Trenching, Material Loading, Grading, Demolition, Quarry Hauling.
  * **Environmental Weather**: Sunny (1.0x), Cloudy (1.05x), Rainy (+18%), Windy (+15%), Stormy (+35%).
  * **Operator Skill**: Expert, Intermediate, Beginner.
  * **Machine Age Degradation**: Hydraulic wear coefficient (+2.2%/yr).
* Outputs predicted minutes, confidence score (%), fuel burn rate (L), CO2 emissions (kg), and variance decomposition breakdown.
* Validated against historical benchmark shift datasets (T001 - T005).

### 4. 📊 Telematics & Idle Behavior AI
* **Excessive Idling Watchdog**: Detects 50+ minute continuous idle spikes, calculating wasted fuel cost ($) and carbon footprint.
* **Unsafe Pattern Recognition**: Slew shock braking, extreme hydraulic pressure surges (> 330 bar), and rollover angle alerts.

### 5. 🚜 Interactive 3D WebGL Excavator Simulator
* True 3D kinematic physics powered by **Three.js**.
* Full articulated arm control: Boom Reach, Stick/Arm, Bucket Scoop/Dump, Cab Slew, and Track Travel.
* **Interactive Personnel Proximity & Walkthrough Test**:
  * Animated 3D ground worker avatar with high-vis vest and safety hardhat.
  * **"TEST: WALK TOWARDS VEHICLE"** mode: Ground worker walks from 24m outer site into the swing radius with live stage-by-stage proximity detections.
* **Haul Truck Loading**: Scoop soil from trench pit and dump into the CAT 745 truck to load 14.0 Tons payload.

### 6. 🎓 Operator Training Academy & Instructor Booking
* Micro-learning course library with syllabus breakdown and certification exam tracking.
* 1-on-1 Certified CAT Field Coach booking calendar (On-site Cab Coaching, Remote VR, Telemetry Review).
* Pre-Shift 7-point 360° digital walkaround inspection checklist.

---

## 💻 Tech Stack

* **Frontend**: React 18, TypeScript, Vite
* **3D Graphics**: Three.js, WebGL
* **Styling**: Tailwind CSS, Custom Industrial Cockpit Theme
* **Audio & Voice**: Web Audio API (synthetic buzzer/chimes), Web Speech API (pilot speech synthesis)
* **Icons & Animation**: Lucide React, Canvas Confetti

---

## ⚡ Quick Start

```bash
# Clone repository
git clone https://github.com/Srigan17/smart-operator-assistant.git

# Navigate to folder
cd smart-operator-assistant

# Install dependencies
npm install

# Start local development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📦 Build for Production

```bash
npm run build
```

---

## 📜 License
MIT License
