const SUPABASE_URL = 'https://qgcwaroeeathmwuifopi.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnY3dhcm9lZWF0aG13dWlmb3BpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzMjM4NjksImV4cCI6MjA5MTg5OTg2OX0.Yz2SkIh2D0o5Mtu1xyQaPlC3NWUcPwcZvJmjF2PXDtQ';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

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
    // 1. Cek apakah disembunyikan atau dimunculkan
    if (data.is_visible) {
        notch.classList.add('show');
    } else {
        notch.classList.remove('show');
        notch.classList.remove('finished', 'critical');
        audio.pause();
        audio.currentTime = 0; 
        return; 
    }

    // 2. Update Angka Waktu
    timeDisplay.innerText = formatTime(data.remaining_time);
    notch.classList.remove('finished', 'critical');

    // 3. TULISAN DINAMIS BERDASARKAN STATUS (Ini yang kita ubah!)
    if (data.status === 'running') {
        label.innerText = "TIMER BERJALAN";
    } else if (data.status === 'paused') {
        label.innerText = "TIMER DIJEDA";
    } else if (data.status === 'idle') {
        label.innerText = "SIAP DIMULAI";
    }

    // 4. Efek 5 Detik Terakhir
    if (data.remaining_time > 0 && data.remaining_time <= 5) {
        notch.classList.add('critical');
        label.innerText = "WAKTU HAMPIR HABIS!"; // Tambahan biar seru
    }

    // 5. Efek Waktu Habis (00:00)
    if (data.status === 'finished' && data.remaining_time === 0) {
        label.innerText = "WAKTU HABIS!";
        timeDisplay.innerText = "00:00";
        notch.classList.add('finished');
        
        if (audio.paused) {
            audio.play().catch(e => console.log("Autoplay ditahan", e));
        }
    }
}

// Subscribe ke Supabase
supabaseClient
  .channel('custom-update-channel')
  .on(
    'postgres_changes',
    { event: 'UPDATE', schema: 'public', table: 'timers' },
    (payload) => {
      updateUI(payload.new);
    }
  )
  .subscribe();

// Load Data Awal
async function loadInitial() {
    const { data } = await supabaseClient.from('timers').select('*').eq('id', 1).single();
    if (data) updateUI(data);
}

loadInitial();