/**
 * Portfolio Website Script
 * Icuk Pande Sinaga - Electrical Engineering Semester 7
 * Focus: IoT, Embedded Systems, Robotics
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize functions
    initCircuitBackground();
    initMobileNav();
    initActiveNavLinks();
    initProjectFilter();
    initProjectModal();
    initContactForm();
});

/* ==========================================================================
   1. CANVAS CIRCUIT BACKGROUND ANIMATION
   ========================================================================== */
function initCircuitBackground() {
    const canvas = document.getElementById('circuitCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Track window resize
    window.addEventListener('resize', () => {
        width = (canvas.width = window.innerWidth);
        height = (canvas.height = window.innerHeight);
        generateCircuitGrid();
    });

    // Circuit generation settings
    const gridSize = 40;
    let nodes = [];
    let lines = [];
    let particles = [];

    // Helper to snap to grid
    const snap = (val) => Math.round(val / gridSize) * gridSize;

    function generateCircuitGrid() {
        nodes = [];
        lines = [];
        particles = [];

        const cols = Math.floor(width / gridSize) + 1;
        const rows = Math.floor(height / gridSize) + 1;

        // Generate static nodes randomly on grid intersections
        for (let c = 1; c < cols - 1; c++) {
            for (let r = 1; r < rows - 1; r++) {
                if (Math.random() < 0.08) { // Density of nodes
                    nodes.push({
                        x: c * gridSize,
                        y: r * gridSize,
                        r: Math.random() < 0.25 ? 3 : 1.5, // sizes
                        active: Math.random() < 0.15,
                        pulse: Math.random() * Math.PI
                    });
                }
            }
        }

        // Connect nodes to form trace lines
        for (let i = 0; i < nodes.length; i++) {
            const nodeA = nodes[i];
            let connections = 0;
            
            // Look for nearby nodes to connect
            for (let j = i + 1; j < nodes.length; j++) {
                const nodeB = nodes[j];
                const dx = Math.abs(nodeA.x - nodeB.x);
                const dy = Math.abs(nodeA.y - nodeB.y);
                
                // Allow L-shape trace connections (characteristic of PCBs)
                if ((dx <= gridSize * 3 && dy === 0) || (dy <= gridSize * 3 && dx === 0) || (dx === dy && dx <= gridSize * 2)) {
                    if (connections < 2 && Math.random() < 0.7) {
                        lines.push({
                            from: nodeA,
                            to: nodeB,
                            color: Math.random() < 0.3 ? 'cyan' : (Math.random() < 0.5 ? 'green' : 'purple')
                        });
                        connections++;
                    }
                }
            }
        }
    }

    // Spawn a particle that flows along a line
    function spawnParticle() {
        if (lines.length === 0 || particles.length > 25) return;
        
        const line = lines[Math.floor(Math.random() * lines.length)];
        particles.push({
            x: line.from.x,
            y: line.from.y,
            targetX: line.to.x,
            targetY: line.to.y,
            progress: 0,
            speed: 0.01 + Math.random() * 0.015,
            color: line.color
        });
    }

    generateCircuitGrid();
    
    // Periodically spawn particles
    setInterval(spawnParticle, 300);

    // Animation Loop
    function animate() {
        ctx.clearRect(0, 0, width, height);

        // Draw traces (lines)
        ctx.lineWidth = 1;
        lines.forEach(line => {
            ctx.beginPath();
            ctx.moveTo(line.from.x, line.from.y);
            ctx.lineTo(line.to.x, line.to.y);
            
            if (line.color === 'cyan') ctx.strokeStyle = 'rgba(0, 240, 255, 0.06)';
            else if (line.color === 'green') ctx.strokeStyle = 'rgba(0, 255, 170, 0.06)';
            else ctx.strokeStyle = 'rgba(189, 94, 255, 0.06)';
            
            ctx.stroke();
        });

        // Draw active particle electrons
        particles.forEach((p, idx) => {
            p.progress += p.speed;
            
            if (p.progress >= 1) {
                // Arrived, remove particle
                particles.splice(idx, 1);
                return;
            }

            const currentX = p.x + (p.targetX - p.x) * p.progress;
            const currentY = p.y + (p.targetY - p.y) * p.progress;

            ctx.beginPath();
            ctx.arc(currentX, currentY, 2, 0, Math.PI * 2);
            
            if (p.color === 'cyan') {
                ctx.fillStyle = '#00f0ff';
                ctx.shadowColor = '#00f0ff';
            } else if (p.color === 'green') {
                ctx.fillStyle = '#00ffaa';
                ctx.shadowColor = '#00ffaa';
            } else {
                ctx.fillStyle = '#bd5eff';
                ctx.shadowColor = '#bd5eff';
            }
            
            ctx.shadowBlur = 6;
            ctx.fill();
            ctx.shadowBlur = 0; // Reset
        });

        // Draw static junctions (nodes)
        nodes.forEach(node => {
            node.pulse += 0.02;
            const alpha = 0.15 + Math.abs(Math.sin(node.pulse)) * 0.2;
            
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
            
            if (node.active) {
                ctx.fillStyle = `rgba(0, 240, 255, ${alpha + 0.3})`;
                ctx.shadowColor = '#00f0ff';
                ctx.shadowBlur = 4;
            } else {
                ctx.fillStyle = `rgba(94, 102, 143, ${alpha})`;
            }
            
            ctx.fill();
            ctx.shadowBlur = 0; // Reset
        });

        requestAnimationFrame(animate);
    }

    animate();
}

/* ==========================================================================
   2. MOBILE NAVIGATION
   ========================================================================== */
function initMobileNav() {
    const mobileToggle = document.getElementById('mobileToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (!mobileToggle || !navMenu) return;

    mobileToggle.addEventListener('click', () => {
        mobileToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close menu when clicking link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileToggle.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && !mobileToggle.contains(e.target) && navMenu.classList.contains('active')) {
            mobileToggle.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });
}

/* ==========================================================================
   3. ACTIVE NAVIGATION LINK ON SCROLL
   ========================================================================== */
function initActiveNavLinks() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    const observerOptions = {
        root: null,
        rootMargin: '-30% 0px -60% 0px', // Trigger when section occupies center screen
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));
}

/* ==========================================================================
   4. PROJECT FILTER
   ========================================================================== */
function initProjectFilter() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active from all buttons
            filterButtons.forEach(b => b.classList.remove('active'));
            // Add active to current
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            projectCards.forEach(card => {
                const category = card.getAttribute('data-category');
                
                // Add animate transitions
                card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

                if (filterValue === 'all' || category === filterValue) {
                    card.style.display = 'flex';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    }, 50);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
}

/* ==========================================================================
   5. PROJECT DETAIL MODAL
   ========================================================================== */
// Static data for projects details
const projectDetailsData = {
    '1': {
        title: 'Smart Agriculture Telemetry System',
        category: 'Internet of Things',
        class: 'iot',
        tools: ['ESP32', 'LoRa SX1278', 'MQTT Broker', 'ThingsBoard Cloud', 'Arduino C++'],
        metrics: {
            'Jangkauan Transmisi': 'Hingga 2.5 KM (LoRa)',
            'Konsumsi Daya': 'Deep-Sleep Mode (15uA)',
            'Akurasi Sensor': 'Kelembaban Tanah ±3%',
            'Update Interval': '15 Menit'
        },
        problem: 'Petani sering mengalami kesulitan memantau kelembaban tanah dan iklim mikro di lahan perkebunan yang luas secara efisien tanpa harus pergi ke lokasi sensor secara fisik.',
        solution: 'Mengembangkan node sensor nirkabel bertenaga baterai yang ditenagai oleh mikrokontroler ESP32 dan transceiver LoRa. Data dari sensor dikirimkan ke IoT Gateway pusat yang kemudian mempublikasikannya melalui protokol MQTT ke Dashboard visual ThingsBoard untuk monitoring real-time dan analisis prediktif pengairan otomatis.',
        implementation: `Untuk memastikan ketahanan baterai hingga 1.5 tahun menggunakan sel LiFePO4, mikrokontroler diprogram dengan siklus hidup state-machine yang ketat. ESP32 bangun dari kondisi Deep-Sleep, menyalakan catu daya sensor melalui sakelar MOSFET transistor, melakukan pembacaan ADC sensor kelembaban tanah kapasitif (yang dikalibrasi untuk mencegah korosi), menginisialisasi modul LoRa, mengirim payload biner kompak, mematikan modul sensor, dan masuk kembali ke siklus Deep-Sleep dalam waktu aktif kurang dari 2.5 detik.`
    },
    '2': {
        title: 'Low-Power Weather Station Node',
        category: 'Embedded Systems',
        class: 'embedded',
        tools: ['STM32L432KB', 'FreeRTOS', 'I2C/SPI Bus', 'KiCad (Custom PCB)', 'C Language'],
        metrics: {
            'Konsumsi Aktif': '3.2 mA',
            'Konsumsi Sleep': '8.5 uA',
            'Catu Daya': 'Li-Ion 18650 / Solar Panel',
            'Kecepatan Bus': '400 kHz (I2C)'
        },
        problem: 'Stasiun pemantau cuaca komersial biasanya memakan biaya tinggi, berdimensi besar, dan boros daya, menyulitkan penyebaran stasiun cuaca sekunder di area remote.',
        solution: 'Merancang PCB sirkuit ganda kustom dengan mikrokontroler ultra-low-power ARM Cortex-M4 STM32L4. Node ini membaca parameter sensor BME280 (Suhu, Tekanan, Kelembaban udara) dan LDR (Intensitas Cahaya) menggunakan bus I2C/ADC, mengolahnya dengan firmware C terstruktur di atas sistem penjadwalan FreeRTOS.',
        implementation: `Desain sirkuit PCB mencakup sirkuit pengisian baterai solar TP4056 terintegrasi dan regulator LDO efisiensi tinggi AP2112. Firmware ditulis murni menggunakan STM32 HAL library dalam C, dioptimalkan untuk mematikan periferal yang tidak digunakan (seperti GPIO floating pins) dan menggunakan DMA (Direct Memory Access) untuk transmisi UART guna mengurangi waktu aktif CPU. Task-task FreeRTOS dijadwalkan secara dinamis untuk mengaktifkan Low Power Mode.`
    },
    '3': {
        title: 'Autonomous Warehouse AGV',
        category: 'Robotics',
        class: 'robotics',
        tools: ['ROS 2 Humble', 'Raspberry Pi 4', 'RPLiDAR A1 M8', 'Motor Driver Sabertooth', 'Python/C++'],
        metrics: {
            'Akurasi SLAM': '±1.8 cm',
            'LiDAR Scan Rate': '8 Hz',
            'Kecepatan Maks': '0.6 m/s',
            'Payload Maks': '8 Kg'
        },
        problem: 'Otomasi pergudangan membutuhkan robot pemandu jalan (AGV) yang andal dalam pemetaan ruang, menghindari rintangan dinamis secara real-time, dan mengikuti rute logistik dengan biaya pembuatan minimal.',
        solution: 'Mengembangkan prototipe AGV beroda diferensial yang terintegrasi dengan LiDAR dan ROS 2 Humble. Robot ini mampu membangun peta 2D ruangan menggunakan Cartographer SLAM, serta menentukan navigasi otonom berbasis path planning menggunakan Nav2 (Navigation 2 stack).',
        implementation: `Sistem kontrol tingkat rendah digerakkan oleh Arduino Mega yang berkomunikasi via Micro-ROS dengan SBC Raspberry Pi 4. Arduino mengontrol putaran roda menggunakan motor encoder DC metal gear dengan algoritma feedback PID tertutup. RPLiDAR menscan lingkungan untuk mendeteksi rintangan dinamis secara 360 derajat. Navigasi Nav2 mengimplementasikan algoritma Costmap untuk mencegah tabrakan.`
    },
    '4': {
        title: 'IoT-Enabled Robotic Sorting Arm',
        category: 'Robotics / IoT',
        class: 'robotics',
        tools: ['Python OpenCV', 'ESP32 NodeMCU', 'Servo PCA9685', 'ThingsBoard MQTT', 'C++ / Python'],
        metrics: {
            'Akurasi Deteksi': '96%',
            'Kapasitas Urut': '18 barang/menit',
            'Sumbu Gerak': '4-Degree of Freedom',
            'Latency Data': '<120 ms'
        },
        problem: 'Proses penyortiran barang berdasarkan properti visual di industri berskala kecil masih didominasi secara manual yang rentan terhadap human error dan tidak terintegrasi ke sistem data pabrik.',
        solution: 'Membangun lengan robot 4 sumbu (4-DOF) yang dikombinasikan dengan kamera webcam dan sistem computer vision Python OpenCV di komputer pusat. Lengan mendeteksi jenis/warna barang, menyortirnya secara dinamis, dan mengirimkan metrik operasional harian ke sistem server dashboard ThingsBoard.',
        implementation: `Kamera webcam mengambil gambar secara real-time dari conveyor. Script Python mendeteksi warna barang dengan filter ruang warna HSV dan melacak centroid objek menggunakan OpenCV. Koordinat target dikonversi menjadi sudut servo menggunakan kinematika balik. Sudut servo dikirimkan ke ESP32 melalui protokol serial, yang menggerakkan driver PWM PCA9685. Data jumlah barang tersortir dipublikasikan ke cloud via broker MQTT.`
    }
};

function initProjectModal() {
    const modal = document.getElementById('projectModal');
    const modalBody = document.getElementById('modalBody');
    const closeBtn = document.getElementById('modalCloseBtn');
    const triggers = document.querySelectorAll('.btn-detail-trigger');

    if (!modal || !modalBody || !closeBtn) return;

    // Open Modal
    triggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const projectId = trigger.getAttribute('data-project-id');
            const data = projectDetailsData[projectId];
            
            if (!data) return;

            // Generate sidebar tags
            const toolsHtml = data.tools.map(tool => `<span>${tool}</span>`).join('');
            
            // Generate metrics html
            const metricsHtml = Object.entries(data.metrics).map(([key, value]) => `
                <div class="metric-item">
                    <span class="metric-label">${key}</span>
                    <span class="metric-value">${value}</span>
                </div>
            `).join('');

            // Ingest modal body HTML
            modalBody.innerHTML = `
                <div class="modal-header">
                    <span class="modal-project-cat ${data.class}">${data.category}</span>
                    <h3 class="modal-title">${data.title}</h3>
                </div>
                <div class="modal-grid">
                    <div class="modal-main">
                        <h4>Latar Belakang &amp; Masalah</h4>
                        <p>${data.problem}</p>
                        
                        <h4>Solusi Yang Dikembangkan</h4>
                        <p>${data.solution}</p>
                        
                        <h4>Rincian Implementasi Teknis</h4>
                        <p>${data.implementation}</p>
                        
                        <h4>Firmware / Kode Snippet</h4>
                        <div class="code-snippet-box">${getProjectCodeSnippet(projectId)}</div>
                    </div>
                    
                    <div class="modal-sidebar">
                        <div class="sidebar-block">
                            <h5>Teknologi &amp; Alat</h5>
                            <div class="sidebar-tags">
                                ${toolsHtml}
                            </div>
                        </div>
                        
                        <div class="sidebar-block">
                            <h5>Metrik Kinerja</h5>
                            <div class="metric-list">
                                ${metricsHtml}
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Open Modal Transitions
            modal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Disable background scroll
        });
    });

    // Close Modal Function
    const closeModal = () => {
        modal.classList.remove('active');
        document.body.style.overflow = ''; // Enable background scroll
    };

    closeBtn.addEventListener('click', closeModal);
    
    // Close on click outside modal content
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Close on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

// Helper to provide fake code snippets for modal display
function getProjectCodeSnippet(id) {
    if (id === '1') {
        return `// ESP32 LoRa Sleep Cycle
#include <SPI.h>
#include <LoRa.h>
#include "esp_sleep.h"

#define SENSOR_POWER_PIN 23
#define SOIL_ADC_PIN     34

void setup() {
  pinMode(SENSOR_POWER_PIN, OUTPUT);
  digitalWrite(SENSOR_POWER_PIN, HIGH); // Sensor ON
  delay(100);
  
  int val = analogRead(SOIL_ADC_PIN);
  float soilMoisture = convertToPercentage(val);
  
  initLoRa();
  sendPayload(soilMoisture);
  
  digitalWrite(SENSOR_POWER_PIN, LOW); // Sensor OFF
  LoRa.end();
  
  esp_sleep_enable_timer_wakeup(15 * 60 * 1000000ULL); // 15 mins
  esp_deep_sleep_start();
}`;
    } else if (id === '2') {
        return `/* STM32 FreeRTOS Task Scheduler */
#include "FreeRTOS.h"
#include "task.h"
#include "bme280.h"

void StartBME280Task(void const * argument) {
  BME280_Init(&hI2C1);
  for(;;) {
    BME280_ReadData(&temp, &press, &humid);
    osDelay(5000); // RTOS Scheduler Delay
    
    // Put STM32 to Stop Mode if idle
    if (allTasksSuspended()) {
      HAL_PWR_EnterSTOPMode(PWR_LOWPOWERREGULATOR_ON, 
                            PWR_STOPENTRY_WFI);
    }
  }
}`;
    } else if (id === '3') {
        return `# ROS2 Differential Robot Odometry Node
import rclpy
from rclpy.node import Node
from nav_msgs.msg import Odometry

class RobotOdomNode(Node):
    def __init__(self):
        super().__init__('robot_odom_publisher')
        self.odom_pub = self.create_publisher(Odometry, 'odom', 10)
        self.timer = self.create_timer(0.05, self.publish_odom)
        self.x = 0.0
        self.y = 0.0
        self.th = 0.0

    def publish_odom(self):
        msg = Odometry()
        msg.header.stamp = self.get_clock().now().to_msg()
        msg.header.frame_id = "odom"
        # Calculate kinematics updates...
        self.odom_pub.publish(msg)
`;
    } else {
        return `# Python OpenCV Color Detection
import cv2
import numpy as np

def detect_object_color(frame):
    hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
    
    # Range for Green target sorting
    lower_green = np.array([35, 50, 50])
    upper_green = np.array([85, 255, 255])
    
    mask = cv2.inRange(hsv, lower_green, upper_green)
    contours, _ = cv2.findContours(mask, cv2.RETR_TREE, 
                                   cv2.CHAIN_APPROX_SIMPLE)
    
    for cnt in contours:
        if cv2.contourArea(cnt) > 500:
            M = cv2.moments(cnt)
            cx = int(M['m10']/M['m00'])
            cy = int(M['m01']/M['m00'])
            return cx, cy # Target center coordinate
    return None`;
}
}

/* ==========================================================================
   6. CONTACT FORM SIMULATION
   ========================================================================== */
function initContactForm() {
    // Dinonaktifkan sementara untuk mendukung pengiriman langsung dari file lokal (CORS bypass)
    // Pengiriman menggunakan metode redirect standar HTML FormSubmit
}

// Add CSS keyframe spinning dynamically for contact spinner icon
const styleSheet = document.createElement("style");
styleSheet.innerText = `
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}`;
document.head.appendChild(styleSheet);
