import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";

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

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const timerRef = ref(db, 'timer');

const notch = document.getElementById('notch');
const timeDisplay = document.getElementById('time-display');
const label = document.getElementById('label');
const audio = document.getElementById('alarm-audio');

function formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

function updateUI(data) {
    console.log("Firebase Update:", data);
    
    if (data.is_visible) {
        notch.classList.add('show');
    } else {
        notch.classList.remove('show');
        notch.classList.remove('finished', 'critical');
        audio.pause();
        audio.currentTime = 0; 
        return; 
    }

    timeDisplay.innerText = formatTime(data.remaining_time);
    notch.classList.remove('finished', 'critical');

    if (data.status === 'running') {
        label.innerText = "TIMER BERJALAN";
    } else if (data.status === 'paused') {
        label.innerText = "TIMER DIJEDA";
    } else if (data.status === 'idle') {
        label.innerText = "SIAP DIMULAI";
    }

    if (data.remaining_time > 0 && data.remaining_time <= 5) {
        notch.classList.add('critical');
        label.innerText = "WAKTU HAMPIR HABIS!";
    }

    if (data.status === 'finished' && data.remaining_time === 0) {
        label.innerText = "WAKTU HABIS!";
        timeDisplay.innerText = "00:00";
        notch.classList.add('finished');
        
        if (audio.paused) {
            audio.play().catch(e => console.log("Autoplay ditahan", e));
        }
    }
}

// Ini fungsi Realtime-nya Firebase. Sangat simpel dan stabil!
onValue(timerRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
        updateUI(data);
    }
});