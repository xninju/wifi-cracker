let currentSession = null;
let statusInterval = null;

document.getElementById('crackForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const button = e.target.querySelector('button');
    
    button.disabled = true;
    button.textContent = '🚀 Cracking...';
    
    try {
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        
        currentSession = data.session_id;
        document.getElementById('sessionInfo').textContent = `Session: ${data.session_id}`;
        document.getElementById('status').classList.remove('hidden');
        
        pollStatus();
        loadSessions();
        
    } catch (error) {
        console.error('Error:', error);
    }
});

async function pollStatus() {
    if (!currentSession) return;
    
    try {
        const response = await fetch(`/api/status/${currentSession}`);
        const data = await response.json();
        
        const uptime = formatTime(data.uptime);
        document.getElementById('uptime').textContent = uptime;
        
        // Check for cracked passwords
        if (data.cracked && data.passwords.length > 0) {
            showResults(data.passwords);
            clearInterval(statusInterval);
            return;
        }
        
        statusInterval = setTimeout(pollStatus, 3000);
        
    } catch (error) {
        console.error('Status check failed:', error);
    }
}

function showResults(passwords) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = `
        <h2>✅ PASSWORD CRACKED!</h2>
        ${passwords.map(pw => `<div class="password">${pw.split(':')[1] || pw}</div>`).join('')}
        <a href="/api/download/${currentSession}" class="download-btn">📥 Download Full Results</a>
    `;
    resultsDiv.classList.remove('hidden');
}

async function loadSessions() {
    const response = await fetch('/api/sessions');
    const data = await response.json();
    
    const sessionsDiv = document.getElementById('sessions');
    sessionsDiv.innerHTML = data.sessions.map(session => `
        <div class="session-card">
            <h3>${session.id}</h3>
            <p class="status-${session.status}">${session.status.toUpperCase()}</p>
            ${session.cracked ? '<span style="color:#00ff41">✅ CRACKED</span>' : ''}
            <br><a href="/api/status/${session.id}" target="_blank">Details</a>
        </div>
    `).join('');
}

function formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
}

// Auto-refresh sessions every 30s
setInterval(loadSessions, 30000);
loadSessions();