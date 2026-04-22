// Import library Firebase langsung dari CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";

// GANTI DENGAN CONFIG FIREBASE KAMU TADI!
const firebaseConfig = {
  apiKey: "AIzaSyCXxpAi-t-_OcdchBFPhv16WlLkEWGqESA",
  authDomain: "timer-artq.firebaseapp.com",
  databaseURL: "https://timer-artq-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "timer-artq",
  storageBucket: "timer-artq.firebasestorage.app",
  messagingSenderId: "767180448957",
  appId: "1:767180448957:web:7f901ac4649fdd6e8403d4"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const timerRef = ref(db, 'timer'); // Kita simpan data di path /timer

let remainingTime = 0;
let isRunning = false;
let isVisible = false;
let interval;

const timeDisplay = document.getElementById('admin-time');
const statusDisplay = document.getElementById('admin-status');
const inputMin = document.getElementById('input-min');
const inputSec = document.getElementById('input-sec');

function formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

function updateAdminUI() {
    timeDisplay.innerText = formatTime(remainingTime);
    statusDisplay.innerText = isRunning ? 'Running' : 'Paused / Idle';
    statusDisplay.style.color = isRunning ? '#10b981' : '#ffffff';
}

// Fungsi Simpan ke Firebase
async function syncToFirebase(status = 'idle') {
    await set(timerRef, {
        remaining_time: remainingTime,
        status: status,
        is_visible: isVisible
    }).catch((error) => console.error("Error nulis ke Firebase:", error));
}

document.getElementById('btn-set-time').addEventListener('click', () => {
    const min = parseInt(inputMin.value) || 0;
    const sec = parseInt(inputSec.value) || 0;
    remainingTime = (min * 60) + sec;
    updateAdminUI();
    syncToFirebase(isRunning ? 'running' : 'idle');
});

document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const addSecs = parseInt(e.target.getAttribute('data-time'));
        remainingTime += addSecs;
        updateAdminUI();
        syncToFirebase(isRunning ? 'running' : 'idle');
    });
});

document.getElementById('btn-toggle-timer').addEventListener('click', () => {
    if (remainingTime <= 0) return; 
    
    isRunning = !isRunning;
    
    if (isRunning) {
        syncToFirebase('running');
        interval = setInterval(() => {
            if (remainingTime > 0) {
                remainingTime--;
                updateAdminUI();
                syncToFirebase('running'); 
            } else {
                clearInterval(interval);
                isRunning = false;
                updateAdminUI();
                syncToFirebase('finished');
            }
        }, 1000);
    } else {
        clearInterval(interval);
        syncToFirebase('paused');
        updateAdminUI();
    }
});

document.getElementById('btn-reset-timer').addEventListener('click', () => {
    clearInterval(interval);
    isRunning = false;
    remainingTime = 0;
    updateAdminUI();
    syncToFirebase('idle');
});

document.getElementById('btn-toggle-visibility').addEventListener('click', () => {
    isVisible = !isVisible;
    syncToFirebase(isRunning ? 'running' : 'idle');
});

// Ambil data awal saat Admin dibuka
async function init() {
    const snapshot = await get(timerRef);
    if (snapshot.exists()) {
        const data = snapshot.val();
        remainingTime = data.remaining_time;
        isVisible = data.is_visible;
        updateAdminUI();
    }
}
init();