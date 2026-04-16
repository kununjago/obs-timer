const SUPABASE_URL = 'https://qgcwaroeeathmwuifopi.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnY3dhcm9lZWF0aG13dWlmb3BpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzMjM4NjksImV4cCI6MjA5MTg5OTg2OX0.Yz2SkIh2D0o5Mtu1xyQaPlC3NWUcPwcZvJmjF2PXDtQ';

// KITA UBAH NAMANYA MENJADI supabaseClient
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

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

async function syncToSupabase(status = 'idle') {
    // Pastikan menggunakan supabaseClient di sini
    const { error } = await supabaseClient.from('timers').update({
        remaining_time: remainingTime,
        status: status,
        is_visible: isVisible
    }).eq('id', 1);

    if (error) console.error("Gagal sinkronisasi ke Supabase:", error);
}

document.getElementById('btn-set-time').addEventListener('click', () => {
    const min = parseInt(inputMin.value) || 0;
    const sec = parseInt(inputSec.value) || 0;
    remainingTime = (min * 60) + sec;
    updateAdminUI();
    syncToSupabase(isRunning ? 'running' : 'idle');
});

document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const addSecs = parseInt(e.target.getAttribute('data-time'));
        remainingTime += addSecs;
        updateAdminUI();
        syncToSupabase(isRunning ? 'running' : 'idle');
    });
});

document.getElementById('btn-toggle-timer').addEventListener('click', () => {
    if (remainingTime <= 0) return; 
    
    isRunning = !isRunning;
    
    if (isRunning) {
        syncToSupabase('running');
        interval = setInterval(() => {
            if (remainingTime > 0) {
                remainingTime--;
                updateAdminUI();
                syncToSupabase('running'); 
            } else {
                clearInterval(interval);
                isRunning = false;
                updateAdminUI();
                syncToSupabase('finished');
            }
        }, 1000);
    } else {
        clearInterval(interval);
        syncToSupabase('paused');
        updateAdminUI();
    }
});

document.getElementById('btn-reset-timer').addEventListener('click', () => {
    clearInterval(interval);
    isRunning = false;
    remainingTime = 0;
    updateAdminUI();
    syncToSupabase('idle');
});

document.getElementById('btn-toggle-visibility').addEventListener('click', () => {
    isVisible = !isVisible;
    syncToSupabase(isRunning ? 'running' : 'idle');
});

async function init() {
    // Pastikan menggunakan supabaseClient di sini
    const { data, error } = await supabaseClient.from('timers').select('*').eq('id', 1).single();
    if (data) {
        remainingTime = data.remaining_time;
        isVisible = data.is_visible;
        updateAdminUI();
    }
}

init();