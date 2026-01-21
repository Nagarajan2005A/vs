// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Initialize current user
const currentUser = {
    isLoggedIn: false,
    userType: null,
    email: null,
    name: null
};

// Login type toggle
document.querySelectorAll('.type-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const type = this.getAttribute('data-type');
        
        // Remove active class from all type buttons
        document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        
        // Hide all forms
        document.querySelectorAll('.login-form').forEach(form => form.classList.remove('active'));
        
        // Show selected form
        if (type === 'user') {
            document.getElementById('userLoginForm').classList.add('active');
        } else {
            document.getElementById('adminLoginForm').classList.add('active');
        }
    });
});

// Toggle password visibility
document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.preventDefault();
        const input = this.parentElement.querySelector('input');
        const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
        input.setAttribute('type', type);
        this.textContent = type === 'password' ? '👁️' : '🙈';
    });
});

// User Login
document.getElementById('userLoginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('userEmail').value;
    const password = document.getElementById('userPassword').value;
    const remember = document.getElementById('userRemember').checked;
    
    // Clear previous errors
    document.getElementById('userEmailError').textContent = '';
    document.getElementById('userPasswordError').textContent = '';
    
    // Validate
    let isValid = true;
    
    if (!email) {
        document.getElementById('userEmailError').textContent = 'Email is required';
        isValid = false;
    } else if (!email.includes('@')) {
        document.getElementById('userEmailError').textContent = 'Please enter valid email';
        isValid = false;
    }
    
    if (!password) {
        document.getElementById('userPasswordError').textContent = 'Password is required';
        isValid = false;
    }
    
    if (!isValid) return;

    try {
        // Show loading state
        const btn = document.querySelector('#userLoginForm button[type="submit"]');
        btn.textContent = 'Logging in...';
        btn.disabled = true;

        // Call API
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, userType: 'user' })
        });

        const data = await response.json();

        if (!response.ok) {
            document.getElementById('userPasswordError').textContent = data.error || 'Login failed';
            btn.textContent = 'Login as User';
            btn.disabled = false;
            return;
        }

        // Success
        currentUser.isLoggedIn = true;
        currentUser.userType = 'user';
        currentUser.email = email;
        currentUser.name = data.user.name;

        if (remember) {
            localStorage.setItem('rememberedEmail', email);
        }

        // Store in localStorage
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        localStorage.setItem('userType', 'user');
        localStorage.setItem('userEmail', email);
        localStorage.setItem('authToken', data.token);

        // Redirect to user dashboard
        window.location.href = 'user-dashboard.html';
    } catch (error) {
        console.error('Login error:', error);
        document.getElementById('userPasswordError').textContent = 'Login failed: ' + error.message;
        const btn = document.querySelector('#userLoginForm button[type="submit"]');
        btn.textContent = 'Login as User';
        btn.disabled = false;
    }
});

// Admin Login
document.getElementById('adminLoginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const adminId = document.getElementById('adminId').value;
    const password = document.getElementById('adminPassword').value;
    const remember = document.getElementById('adminRemember').checked;
    
    // Clear previous errors
    document.getElementById('adminIdError').textContent = '';
    document.getElementById('adminPasswordError').textContent = '';
    
    // Validate
    let isValid = true;
    
    if (!adminId) {
        document.getElementById('adminIdError').textContent = 'Admin ID is required';
        isValid = false;
    }
    
    if (!password) {
        document.getElementById('adminPasswordError').textContent = 'Password is required';
        isValid = false;
    }
    
    if (!isValid) return;

    try {
        // Show loading state
        const btn = document.querySelector('#adminLoginForm button[type="submit"]');
        btn.textContent = 'Logging in...';
        btn.disabled = true;

        // Call API
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: adminId, password, userType: 'admin' })
        });

        const data = await response.json();

        if (!response.ok) {
            document.getElementById('adminPasswordError').textContent = data.error || 'Login failed';
            btn.textContent = 'Login as Admin';
            btn.disabled = false;
            return;
        }

        // Success
        currentUser.isLoggedIn = true;
        currentUser.userType = 'admin';
        currentUser.email = adminId;
        currentUser.name = data.user.name;

        if (remember) {
            localStorage.setItem('rememberedAdminId', adminId);
        }

        // Store in localStorage
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        localStorage.setItem('userType', 'admin');
        localStorage.setItem('adminId', adminId);
        localStorage.setItem('authToken', data.token);

        // Redirect to admin dashboard
        window.location.href = 'admin-dashboard.html';
    } catch (error) {
        console.error('Login error:', error);
        document.getElementById('adminPasswordError').textContent = 'Login failed: ' + error.message;
        const btn = document.querySelector('#adminLoginForm button[type="submit"]');
        btn.textContent = 'Login as Admin';
        btn.disabled = false;
    }
});

// Load remembered email
window.addEventListener('load', function() {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
        document.getElementById('userEmail').value = rememberedEmail;
        document.getElementById('userRemember').checked = true;
    }
    
    const rememberedAdminId = localStorage.getItem('rememberedAdminId');
    if (rememberedAdminId) {
        document.getElementById('adminId').value = rememberedAdminId;
        document.getElementById('adminRemember').checked = true;
    }
});

// Prevent going back if already logged in
if (localStorage.getItem('currentUser')) {
    const userType = localStorage.getItem('userType');
    if (userType === 'user') {
        window.location.href = 'user-dashboard.html';
    } else if (userType === 'admin') {
        window.location.href = 'admin-dashboard.html';
    }
}
