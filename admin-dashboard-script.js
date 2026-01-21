// Check if admin is logged in
function checkAdminLogin() {
    const userType = localStorage.getItem('userType');
    const authToken = localStorage.getItem('authToken');
    if (userType !== 'admin' || !authToken) {
        window.location.href = 'login.html';
    }
}

checkAdminLogin();

// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Get auth token
function getAuthToken() {
    return localStorage.getItem('authToken');
}

// Global variables
let currentAdmin = JSON.parse(localStorage.getItem('currentUser'));
let allUsers = [];
let allUploads = [];
let currentEditingUserId = null;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    loadAdminInfo();
    loadAllUsers();
    loadAllUploads();
    updateSystemStats();
    setupEventListeners();
});

// Load admin info
function loadAdminInfo() {
    const adminName = currentAdmin?.name || 'Admin';
    document.getElementById('adminName').textContent = adminName;
}

// Load all users from API
async function loadAllUsers() {
    try {
        const response = await fetch(`${API_BASE_URL}/users`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        const data = await response.json();
        if (data.success) {
            allUsers = data.users;
            localStorage.setItem('allUsers', JSON.stringify(allUsers));
            displayUsers(allUsers);
        }
    } catch (error) {
        console.error('Error loading users:', error);
        allUsers = JSON.parse(localStorage.getItem('allUsers')) || [];
        displayUsers(allUsers);
    }
}

// Load all uploads from API
async function loadAllUploads() {
    try {
        const response = await fetch(`${API_BASE_URL}/uploads`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        const data = await response.json();
        if (data.success) {
            allUploads = data.uploads;
            localStorage.setItem('allUploads', JSON.stringify(allUploads));
            displayUploads(allUploads);
        }
    } catch (error) {
        console.error('Error loading uploads:', error);
        allUploads = JSON.parse(localStorage.getItem('allUploads')) || [];
        displayUploads(allUploads);
    }
}

// Update system stats from API
async function updateSystemStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/uploads/stats/system`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        const data = await response.json();
        if (data.success) {
            document.getElementById('totalUsers').textContent = data.stats.totalUsers;
            document.getElementById('totalSystemUploads').textContent = data.stats.totalUploads;
            document.getElementById('totalSystemRecords').textContent = data.stats.totalRecords;
            document.getElementById('totalStorageUsed').textContent = data.stats.totalStorageUsed + ' MB';
            document.getElementById('activeUsers').textContent = allUsers.filter(u => u.status === 'active').length;
            document.getElementById('pendingUsers').textContent = allUsers.filter(u => u.status === 'pending').length;
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', handleNavigation);
    });

    // Add User Form
    document.getElementById('addUserForm').addEventListener('submit', handleAddUser);
    document.getElementById('editUserForm').addEventListener('submit', handleEditUser);

    // Filters
    document.getElementById('userSearchInput').addEventListener('input', filterUsers);
    document.getElementById('roleFilter').addEventListener('change', filterUsers);
    document.getElementById('statusFilter').addEventListener('change', filterUsers);

    // Upload filters
    document.getElementById('uploadSearchInput').addEventListener('input', filterUploads);
    document.getElementById('uploadDateFilter').addEventListener('change', filterUploads);

    // Menu toggle
    document.querySelector('.menu-toggle').addEventListener('click', toggleSidebar);
    document.querySelector('.close-sidebar').addEventListener('click', closeSidebar);
}

// Handle navigation
function handleNavigation(e) {
    e.preventDefault();
    
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    this.classList.add('active');
    
    const sectionName = this.getAttribute('data-section');
    document.getElementById('page-title').textContent = 
        sectionName.charAt(0).toUpperCase() + sectionName.slice(1);
    
    document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));
    document.getElementById(sectionName).classList.add('active');
    
    closeSidebar();
}

// Load all users
function loadAllUsers() {
    localStorage.setItem('allUsers', JSON.stringify(allUsers));
    displayUsers(allUsers);
}

// Display users in table
function displayUsers(users) {
    const tbody = document.getElementById('usersTableBody');
    
    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 40px; color: #7f8c8d;">No users found</td></tr>';
        return;
    }

    tbody.innerHTML = users.map(user => `
        <tr>
            <td>#${user.id}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td><span class="badge badge-${user.role}">${user.role}</span></td>
            <td><span class="badge badge-${user.status}">${user.status}</span></td>
            <td>${user.joined}</td>
            <td>${user.uploads || 0}</td>
            <td>
                <button class="btn-secondary" onclick="openEditUserModal(${user.id})" style="padding: 5px 10px; font-size: 12px;">Edit</button>
                <button class="btn-secondary btn-delete" onclick="deleteUser(${user.id})" style="padding: 5px 10px; font-size: 12px;">Delete</button>
            </td>
        </tr>
    `).join('');
}

// Filter users
function filterUsers() {
    const searchTerm = document.getElementById('userSearchInput').value.toLowerCase();
    const roleFilter = document.getElementById('roleFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;

    const filtered = allUsers.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm) || 
                            user.email.toLowerCase().includes(searchTerm);
        const matchesRole = !roleFilter || user.role === roleFilter;
        const matchesStatus = !statusFilter || user.status === statusFilter;

        return matchesSearch && matchesRole && matchesStatus;
    });

    displayUsers(filtered);
}

// Open add user modal
function openAddUserModal() {
    document.getElementById('addUserForm').reset();
    document.getElementById('addUserModal').classList.add('active');
}

// Close add user modal
function closeAddUserModal() {
    document.getElementById('addUserModal').classList.remove('active');
}

// Handle add user
function handleAddUser(e) {
    e.preventDefault();

    const formData = {
        name: document.getElementById('newUserName').value,
        email: document.getElementById('newUserEmail').value,
        password: document.getElementById('newUserPassword').value,
        role: document.getElementById('newUserRole').value
    };

    fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            allUsers.push(data.user);
            localStorage.setItem('allUsers', JSON.stringify(allUsers));
            displayUsers(allUsers);
            closeAddUserModal();
            alert('User added successfully!');
            updateSystemStats();
        } else {
            alert('Error: ' + data.error);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to add user');
    });
}

// Open edit user modal
function openEditUserModal(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;

    currentEditingUserId = userId;
    document.getElementById('editUserName').value = user.name;
    document.getElementById('editUserEmail').value = user.email;
    document.getElementById('editUserRole').value = user.role;
    document.getElementById('editUserStatus').value = user.status;

    document.getElementById('editUserModal').classList.add('active');
}

// Close edit user modal
function closeEditUserModal() {
    document.getElementById('editUserModal').classList.remove('active');
    currentEditingUserId = null;
}

// Handle edit user
function handleEditUser(e) {
    e.preventDefault();

    const formData = {
        name: document.getElementById('editUserName').value,
        role: document.getElementById('editUserRole').value,
        status: document.getElementById('editUserStatus').value
    };

    fetch(`${API_BASE_URL}/users/${currentEditingUserId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const userIndex = allUsers.findIndex(u => u.userId === currentEditingUserId);
            if (userIndex !== -1) {
                allUsers[userIndex] = data.user;
            }
            localStorage.setItem('allUsers', JSON.stringify(allUsers));
            displayUsers(allUsers);
            closeEditUserModal();
            alert('User updated successfully!');
            updateSystemStats();
        } else {
            alert('Error: ' + data.error);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to update user');
    });
}

// Delete user
function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
        fetch(`${API_BASE_URL}/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                allUsers = allUsers.filter(u => u.userId !== userId);
                localStorage.setItem('allUsers', JSON.stringify(allUsers));
                displayUsers(allUsers);
                updateSystemStats();
            } else {
                alert('Error: ' + data.error);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to delete user');
        });
    }
}

// Load all uploads
function loadAllUploads() {
    // Get all uploads from all users
    const userUploads = JSON.parse(localStorage.getItem('uploadHistory')) || [];
    allUploads = userUploads.map(upload => ({
        ...upload,
        userName: currentAdmin?.name || 'User',
        userEmail: currentAdmin?.email || 'user@example.com'
    }));
    
    displayUploads(allUploads);
}

// Display uploads
function displayUploads(uploads) {
    const uploadsList = document.getElementById('uploadsList');

    if (uploads.length === 0) {
        uploadsList.innerHTML = '<p style="text-align: center; padding: 40px; color: #7f8c8d;">No uploads yet.</p>';
        return;
    }

    uploadsList.innerHTML = uploads.map(upload => `
        <div class="upload-item">
            <div class="upload-item-info">
                <div class="upload-item-name">📄 ${upload.fileName}</div>
                <div class="upload-item-meta">
                    <span>👤 ${upload.userName}</span>
                    <span>📧 ${upload.userEmail}</span>
                    <span>📊 ${upload.recordCount} records</span>
                    <span>💾 ${upload.fileSize} MB</span>
                    <span>📅 ${upload.uploadDate}</span>
                </div>
            </div>
            <button class="btn-secondary" onclick="previewUpload(${upload.id})" style="margin-left: 10px;">👁️ View</button>
        </div>
    `).join('');
}

// Filter uploads
function filterUploads() {
    const searchTerm = document.getElementById('uploadSearchInput').value.toLowerCase();
    const dateFilter = document.getElementById('uploadDateFilter').value;

    const filtered = allUploads.filter(upload => {
        const matchesSearch = upload.fileName.toLowerCase().includes(searchTerm);
        const matchesDate = !dateFilter || upload.uploadDate.startsWith(dateFilter);

        return matchesSearch && matchesDate;
    });

    displayUploads(filtered);
}

// Preview upload
function previewUpload(uploadId) {
    const upload = allUploads.find(u => u.id === uploadId);
    if (!upload) return;

    alert(`File: ${upload.fileName}\nRecords: ${upload.recordCount}\nSize: ${upload.fileSize} MB\nDate: ${upload.uploadDate}`);
}

// Update system stats
function updateSystemStats() {
    const totalUsers = allUsers.length;
    const totalSystemUploads = allUploads.length;
    const totalRecords = allUploads.reduce((sum, u) => sum + u.recordCount, 0);
    const totalStorage = allUploads.reduce((sum, u) => sum + parseFloat(u.fileSize), 0);
    const activeUsers = allUsers.filter(u => u.status === 'active').length;
    const pendingUsers = allUsers.filter(u => u.status === 'pending').length;
    const todayUploads = allUploads.filter(u => u.uploadDate.startsWith(new Date().toLocaleDateString())).length;

    document.getElementById('totalUsers').textContent = totalUsers;
    document.getElementById('totalSystemUploads').textContent = totalSystemUploads;
    document.getElementById('totalSystemRecords').textContent = totalRecords;
    document.getElementById('totalStorageUsed').textContent = totalStorage.toFixed(2) + ' MB';
    document.getElementById('activeUsers').textContent = activeUsers;
    document.getElementById('pendingUsers').textContent = pendingUsers;
    document.getElementById('todayUploads').textContent = todayUploads;
}

// Generate report
function generateReport(format) {
    let content = '';

    if (format === 'csv') {
        content = 'User ID,Name,Email,Role,Status,Joined,Uploads\n';
        content += allUsers.map(u => 
            `${u.id},"${u.name}","${u.email}","${u.role}","${u.status}","${u.joined}",${u.uploads}`
        ).join('\n');
    } else if (format === 'excel') {
        content = 'User ID\tName\tEmail\tRole\tStatus\tJoined\tUploads\n';
        content += allUsers.map(u => 
            `${u.id}\t${u.name}\t${u.email}\t${u.role}\t${u.status}\t${u.joined}\t${u.uploads}`
        ).join('\n');
    } else if (format === 'pdf') {
        content = `ADMIN REPORT\n\nGenerated: ${new Date().toLocaleString()}\n\nTotal Users: ${allUsers.length}\nTotal Uploads: ${allUploads.length}\n\nUser List:\n`;
        content += allUsers.map(u => `${u.id}. ${u.name} (${u.email}) - ${u.role}`).join('\n');
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report.${format === 'csv' ? 'csv' : format === 'excel' ? 'txt' : 'txt'}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

// Save admin settings
function saveAdminSettings() {
    alert('Admin settings saved successfully!');
}

// Toggle sidebar
function toggleSidebar() {
    document.querySelector('.sidebar').classList.add('active');
}

function closeSidebar() {
    document.querySelector('.sidebar').classList.remove('active');
}

// Logout
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('userType');
        localStorage.removeItem('adminId');
        localStorage.removeItem('authToken');
        window.location.href = 'login.html';
    }
}

// Close modals when clicking outside
document.addEventListener('click', function(e) {
    const addModal = document.getElementById('addUserModal');
    const editModal = document.getElementById('editUserModal');
    
    if (e.target === addModal) {
        closeAddUserModal();
    }
    if (e.target === editModal) {
        closeEditUserModal();
    }
});
