# BVEX: Balloon-borne Very Long Baseline Interferometry Experiment

## Project Overview

The Balloon-borne Very Long Baseline Interferometry Experiment (BVEX) is a pioneering 22-GHz radio telescope designed to demonstrate that balloon-borne telescopes can be successfully used as Very Long Baseline Interferometry (VLBI) stations. This pathfinder mission aims to make the first-ever VLBI measurements between a balloon-borne telescope and ground-based telescopes, opening new frontiers in high-frequency astronomical observations.

**[PLACEHOLDER: Insert hero image of BVEX payload on gondola]**

### Mission Objectives

1. **Characterize positional stability** of stratospheric balloon-borne payloads to:
   - 40 micron precision over 0.1 second timescales
   - 100 micron precision over 1 second timescales
   
2. **Measure 3D position** of balloon-borne telescope to better than 1 meter accuracy on 1 second timescales

3. **Operate a high-frequency radio telescope** on a stratospheric balloon platform to characterize phase stability

4. **Generate interference fringes** by combining simultaneous observations with ground-based radio telescopes, demonstrating balloon-borne VLBI

5. **Train students** in building radio telescopes, VLBI techniques, and near-space experiment design

## My Contributions

As a PhD student, I have been the lead developer and system architect for the majority of BVEX's control software and data systems. My work spans across both flight computers (Ophiuchus and Sagittarius) and encompasses critical real-time control systems, data acquisition, telemetry, and ground station operations.

### Collaborators
- **Felix Thiel** - Co-developer on BCP command system and ground station architecture
- **Terry Yang** - Integration support and testing
- **Rafael Costa** - System testing and validation

---

## System Architecture

BVEX employs a distributed computing architecture with two primary flight computers:

**[PLACEHOLDER: Insert system architecture diagram showing Ophiuchus and Sagittarius computers with all subsystems]**

### Ophiuchus Computer
Handles telescope control, star camera operations, motor control, and primary housekeeping

### Sagittarius Computer  
Manages receiver operations, RFSoC backend, VLBI data acquisition, timing systems, and GPS

---

## Software Systems I Developed

### 1. BVEX Control Program (BCP) - Core Architecture

The BCP is a distributed control system operating across both flight computers, implemented primarily in C with Python components. I designed and developed the complete architecture with modular safety systems and comprehensive error handling.

**[PLACEHOLDER: Insert BCP software architecture flowchart]**

#### Key Features:
- **Real-time command processing** with UDP packet-based protocol
- **Checksum verification** for data integrity
- **Command counters** for reliable acknowledgment
- **Watchdog timers** for system safety
- **Comprehensive logging** for post-flight analysis

**GitHub Repository:** [https://github.com/fissellab/BVEX_command](https://github.com/fissellab/BVEX_command)

### Command Categories Implemented:

#### System Commands
- Connection testing and health monitoring
- Command counter management
- Graceful shutdown procedures
- Safety interlocks

#### Telescope Control (Ophiuchus)
- Motor control with PID loops
- Position tracking (azimuth/elevation)
- Celestial coordinate tracking (RA/Dec)
- Dither scanning for calibration
- Emergency stop capabilities

---

### 2. Star Camera System (bvexcam)

I developed the complete star camera control system for telescope pointing verification and astrometry.

**[PLACEHOLDER: Insert star camera mounted on telescope]**

#### Features:
- **High-precision lens control** with integrated safety checks
- **Exposure control** (9.6-1000ms range)
- **Real-time astrometry solving** for pointing verification
- **Auto-focus capabilities**
- **JPEG compression** for bandwidth-efficient downlink
- **Blob detection algorithm** for star identification

---

### 3. Telemetry & Downlink System

I implemented the complete telemetry architecture for real-time data downlink during flight operations.

**[PLACEHOLDER: Insert telemetry data flow diagram]**

#### Components:
- **Communications server** for PASTIS network integration
- **Packet prioritization** with bandwidth allocation
- **C library** ([bvex-link](https://github.com/oliverdantzer/bvex-link/tree/main/telemetry-uplink)) for serialization
- **UDP-based protocol** for reliability over satellite links

#### Telemetry Channels:
- GPS position, altitude, heading
- Spectrometer data (2048-point spectra)
- System health metrics
- Environmental sensors
- Power consumption monitoring

---

### 4. Housekeeping System

I designed and implemented the comprehensive housekeeping system using LabJack T7 with Mux80 expansion.

**[PLACEHOLDER: Insert housekeeping box with LabJack T7 and Mux80]**

#### Monitoring Capabilities:
- **84 analog input channels** via Mux80 expansion
- **Temperature monitoring** across all critical subsystems:
  - OCXO and timing chain
  - RFSoC backend
  - Power distribution units
  - Motor controllers
- **Pressure monitoring** for pressure vessel
- **Power monitoring** for all subsystems

**GitHub Repository:** [https://github.com/mayukh4/bcp](https://github.com/mayukh4/bcp)

---

### 5. Position Tracking System

I developed the high-precision position tracking system for characterizing payload motion and vibrations.

**[PLACEHOLDER: Insert position sensor box with Raspberry Pi and sensors]**

#### Hardware Integration:
- **Raspberry Pi 5** central controller
- **3x ADXL355 accelerometers** (1000 Hz sampling)
  - 2 on telescope outer frame
  - 1 inside pressure vessel
- **ADXRS453 gyroscope** for elevation angle measurement
- **ADCMXL3021 accelerometer** (22 kHz, 10 μg/√Hz noise density)
- **TDK InvenSense SmartMotion gyroscope** for orientation

#### Software Features:
- **Real-time data acquisition** via SPI bus
- **Binary packet protocol** for efficient data transfer
- **Timestamping** with nanosecond precision
- **Network streaming** to flight computers

---

### 6. Heater Control System

I implemented the distributed heating system to maintain operational temperatures during stratospheric flight.

**[PLACEHOLDER: Insert heater system schematic with 5 circuits]**

#### Components:
- **5 independent Kapton heater circuits** (20W each)
- **LM35 temperature sensors** (±0.5°C accuracy)
- **Solid-state relay control** via LabJack
- **Software PID control loops**
- **Thermal fuse protection** (72°C cutoff)

#### Protected Subsystems:
- Star camera enclosure
- Elevation drive motor
- Pressure vessel interior
- Data storage system
- Lock pin actuator

---

### 7. Timing System Integration

I developed the software integration for the precision timing chain critical for VLBI correlation.

**[PLACEHOLDER: Insert timing box with TICC and components]**

#### Components:
- **TAPR TICC board** (60 picosecond resolution)
- **10 MHz OCXO reference**
- **GPS 1 PPS signal**
- **Phase comparison logging**
- **Arduino Mega 2560 interface**

#### Capabilities:
- Continuous phase offset measurement
- Sub-nanosecond timing precision
- Data logging for post-flight correlation

---

### 8. GPS Data Acquisition

I implemented the GPS integration for precise position and heading determination.

**[PLACEHOLDER: Insert GPS unit with dual antennas]**

#### Hardware:
- **Hemisphere VEGA 40** dual-antenna GNSS board
- **Tallysman TW7972 antennas** (triple-band, L1/L2/L5)
- **2-meter antenna separation** for heading precision

#### Software Features:
- Multi-constellation support (GPS, GLONASS, BeiDou, Galileo)
- 10 Hz position updates
- 1 PPS timing output integration
- Error checking and validation
- Telemetry integration via bvex-link

---

### 9. RFSoC Backend Control

I developed the control software for the AMD-Xilinx RFSoC Gen3 FPGA backend system.

**[PLACEHOLDER: Insert RFSoC 4x2 board in enclosure]**

#### Capabilities:
- **5 GSPS digitization** of 2-4 GHz IF signals
- **Real-time spectroscopy** via polyphase filterbank
- **2-bit requantization** for VLBI standards
- **100 Gbps Ethernet** data streaming
- **Power management** with 40-second boot sequencing
- **OCXO configuration** for timing reference

---

### 10. Data Storage System

I implemented the high-speed data storage system for VLBI observations.

**[PLACEHOLDER: Insert backend computer with SSDs and NIC]**

#### Components:
- **Mellanox ConnectX-5** 100 GbE NIC
- **2x 8TB NVMe SSDs** in redundant configuration
- **Fanless MIC-770 V3** flight computer

#### Software Features:
- Real-time data streaming from RFSoC
- Redundant storage management
- Storage status monitoring
- Automatic failover capabilities

---

### 11. Ground Station GUI

I developed a comprehensive PyQt6-based ground station application for real-time monitoring and control during flight operations.

**[PLACEHOLDER: Insert screenshot of three-window ground station interface]**

#### Architecture:
- **Three-window design** for distributed operations:
  - Pointing Window (telescope operations)
  - Telescope Data Window (scientific instruments)
  - Housekeeping Window (system monitoring)

#### Features:
- **Multi-instrument telemetry** (10+ concurrent streams)
- **Real-time visualization** with scientific-grade displays
- **Session-based data logging** with automatic cleanup
- **Network-resilient operation** with auto-reconnection
- **Celestial object tracking** with sky chart display

**GitHub Repository:** [https://github.com/fissellab/bvex_gs](https://github.com/fissellab/bvex_gs)

#### Data Logging Capabilities:
- GPS coordinates and heading
- Complete spectrometer data (2048 points)
- Star camera images with metadata
- Motor positions and status
- Temperature readings (8+ channels)
- Power consumption metrics
- System health monitoring

---

## Technical Specifications

### Network Architecture
- **Local subnet:** 172.30.3.X/24
- **Ethernet switch:** TRENDnet TI-G162 (14 ports + 2 SFP)
- **Protocol:** UDP for reliability in balloon environment
- **Telemetry rate:** Configurable based on satellite bandwidth

### Power Distribution
- **Input:** 28V from CSA gondola
- **Distribution:** Multiple Power Breakout Boxes (PBoB)
- **Protection:** Slow-blow fuses and DC-DC converters
- **Monitoring:** Real-time current sensing via LabJack

### Environmental Operating Conditions
- **Temperature range:** -60°C to +40°C
- **Altitude:** Up to 40 km
- **Pressure:** Near-vacuum conditions
- **Duration:** 8-24 hour flights

---

## Current Status & Future Work

### Completed Systems
✅ All control software implemented and tested  
✅ Ground station fully operational  
✅ Telemetry system integrated  
✅ Housekeeping and monitoring active  
✅ Position tracking validated  
✅ Thermal management tested  

### Upcoming Milestones
- Integration testing with VLBA ground stations
- Full system thermal-vacuum testing
- Flight readiness review
- Target launch: 2025 from Palestine, Texas

---

## Publications & Documentation

### Technical Reports
- BVEX System Design Document (2024)
- Software Architecture Specification
- Interface Control Documents

### Conference Presentations
- [Upcoming] American Astronomical Society Meeting
- [Upcoming] URSI Radio Science Meeting

---

## Acknowledgments

This project represents extensive collaborative effort with the BVEX team at Columbia University. Special thanks to my advisors and the NASA Balloon Program Office for their support.

---

## Contact & Links

**GitHub Repositories:**
- BCP Command System: [https://github.com/fissellab/BVEX_command](https://github.com/fissellab/BVEX_command)
- BCP Implementation: [https://github.com/fissellab/bcp](https://github.com/fissellab/bcp)
- Personal Fork: [https://github.com/mayukh4/bcp](https://github.com/mayukh4/bcp)
- Ground Station: [https://github.com/fissellab/bvex_gs](https://github.com/fissellab/bvex_gs)

**Email:** [Your email]  
**LinkedIn:** [Your LinkedIn]  
**ORCID:** [Your ORCID]

---

*Last Updated: November 
2024*