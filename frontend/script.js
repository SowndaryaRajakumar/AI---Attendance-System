const API_BASE = 'http://localhost:3000';

function getAuth() {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!userStr || !token) return null;
    try {
        return { user: JSON.parse(userStr), token };
    } catch {
        return null;
    }
}

function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

function requireAuth() {
    const auth = getAuth();
    if (!auth) {
        window.location.href = 'index.html';
        return null;
    }
    return auth;
}

function showError(id, message) {
    const el = document.getElementById(id);
    if (el) {
        el.textContent = message;
        el.style.display = 'block';
    }
}

function clearError(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
}

function showSuccess(id, message) {
    const el = document.getElementById(id);
    if (el) {
        el.textContent = message;
        el.style.display = 'block';
    }
}

function showGlobalLoading() {
    let loader = document.getElementById('global-loader');
    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'global-loader';
        loader.innerHTML = '<div class="spinner"></div><span>Loading...</span>';
        loader.style.cssText = 'position:fixed; top:1rem; left:50%; transform:translateX(-50%); background:var(--bg-panel); border:1px solid var(--border); color:white; padding:0.5rem 1rem; border-radius:8px; display:flex; align-items:center; z-index:9999; box-shadow:0 10px 15px -3px rgba(0,0,0,0.5); transition: opacity 0.2s;';
        document.body.appendChild(loader);
    }
    loader.style.display = 'flex';
    loader.style.opacity = '1';
}

function hideGlobalLoading() {
    const loader = document.getElementById('global-loader');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => loader.style.display = 'none', 200);
    }
}

async function apiFetch(endpoint, method = 'GET', body = null) {
    const auth = getAuth();
    const headers = { 'Content-Type': 'application/json' };
    
    if (auth && auth.token) {
        headers['Authorization'] = `Bearer ${auth.token}`;
    }

    showGlobalLoading();
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : null
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                // Token invalid or expired
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                alert('Session expired. Please log in again.');
                window.location.href = 'index.html';
                throw new Error('Session expired');
            }
            throw new Error(data.error || 'Something went wrong');
        }
        
        return data;
    } catch (err) {
        if(err.message === "Failed to fetch") {
            throw new Error("Cannot connect to server (Is backend running?)");
        }
        throw err;
    } finally {
        hideGlobalLoading();
    }
}

function injectNavbar() {
    const auth = getAuth();
    if (!auth) return;

    const nav = document.createElement('nav');
    nav.className = 'navbar';
    
    let linksHTML = `
        <a href="dashboard.html">Dashboard</a>
        <a href="attendance.html">My Stats</a>
        <a href="chat.html">AI Chat</a>
    `;

    if (auth.user.role === 'faculty' || auth.user.role === 'admin') {
        linksHTML += `<a href="mark.html">Mark Attendance</a>`;
    }

    nav.innerHTML = `
        <div class="brand">AttendoAI</div>
        <div class="nav-links" style="align-items: center;">
            <span style="color:var(--text-muted); font-size:0.875rem; margin-right:1rem; border-right:1px solid var(--border); padding-right:1rem;">
                ${auth.user.name} <strong style="text-transform:capitalize; color:var(--text-main);">(${auth.user.role})</strong>
            </span>
            ${linksHTML}
            <a href="#" onclick="handleLogout()" style="color: var(--error); font-weight:600;">Logout</a>
        </div>
    `;
    
    document.body.insertBefore(nav, document.body.firstChild);
}

document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    const isPublic = path.endsWith('index.html') || path.endsWith('signup.html') || path === '/' || path.match(/.*\/$/);
    
    if (!isPublic) {
        requireAuth();
        injectNavbar();
    } else {
        if (getAuth()) window.location.href = 'dashboard.html';
    }
});
