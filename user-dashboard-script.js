// Check if user is logged in
function checkUserLogin() {
    const userType = localStorage.getItem('userType');
    const authToken = localStorage.getItem('authToken');
    if (userType !== 'user' || !authToken) {
        window.location.href = 'login.html';
    }
}

checkUserLogin();

// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Get auth token
function getAuthToken() {
    return localStorage.getItem('authToken');
}

// Global variables
let selectedFile = null;
let uploadHistory = JSON.parse(localStorage.getItem('uploadHistory')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser'));

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    loadUserInfo();
    updateStats();
    setupEventListeners();
    loadUploadHistory();
});

// Load user info
function loadUserInfo() {
    const userName = currentUser?.name || 'User';
    document.getElementById('userName').textContent = userName;
    document.getElementById('welcomeMsg').textContent = `Welcome back, ${userName}! Ready to manage your data?`;
    document.getElementById('settingsEmail').value = currentUser?.email || '';
    document.getElementById('settingsName').value = userName || '';
}

// Setup event listeners
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', handleNavigation);
    });

    // Upload area
    const uploadArea = document.getElementById('uploadArea');
    uploadArea.addEventListener('click', () => document.getElementById('fileInput').click());
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.backgroundColor = 'rgba(52, 152, 219, 0.1)';
    });
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.backgroundColor = '';
    });
    uploadArea.addEventListener('drop', handleFileDrop);

    // File input
    document.getElementById('fileInput').addEventListener('change', handleFileSelect);

    // Menu toggle for mobile
    document.querySelector('.menu-toggle').addEventListener('click', toggleSidebar);
    document.querySelector('.close-sidebar').addEventListener('click', closeSidebar);

    // Search in history
    document.getElementById('searchHistory').addEventListener('input', searchHistory);
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

// Handle file drop
function handleFileDrop(e) {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length) {
        document.getElementById('fileInput').files = files;
        handleFileSelect({ target: { files: files } });
    }
}

// Handle file select
function handleFileSelect(e) {
    const files = e.target.files;
    if (files.length) {
        selectedFile = files[0];
        const fileName = selectedFile.name;
        const fileSize = (selectedFile.size / 1024 / 1024).toFixed(2);

        document.getElementById('uploadArea').style.display = 'none';
        document.getElementById('fileInfo').style.display = 'flex';
        document.getElementById('fileName').textContent = `📄 ${fileName}`;
        document.getElementById('fileSize').textContent = `${fileSize} MB`;
    }
}

// Clear file
function clearFile() {
    selectedFile = null;
    document.getElementById('fileInput').value = '';
    document.getElementById('uploadArea').style.display = 'block';
    document.getElementById('fileInfo').style.display = 'none';
    document.getElementById('uploadProgress').style.display = 'none';
    document.getElementById('uploadStatus').style.display = 'none';
}

// Upload file
function uploadFile() {
    if (!selectedFile) return;

    // Show progress
    document.getElementById('uploadProgress').style.display = 'block';
    document.getElementById('fileInfo').style.display = 'none';

    const formData = new FormData();
    formData.append('file', selectedFile);

    const xhr = new XMLHttpRequest();

    // Track progress
    xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100);
            document.getElementById('progressFill').style.width = progress + '%';
            document.getElementById('progressText').textContent = progress + '%';
        }
    });

    xhr.addEventListener('load', () => {
        if (xhr.status === 201) {
            const response = JSON.parse(xhr.responseText);
            handleUploadSuccess(response.upload);
        } else {
            const error = JSON.parse(xhr.responseText);
            showUploadError('Upload failed: ' + error.error);
        }
    });

    xhr.addEventListener('error', () => {
        showUploadError('Upload failed: Network error');
    });

    xhr.open('POST', `${API_BASE_URL}/uploads/upload`);
    xhr.setRequestHeader('Authorization', `Bearer ${getAuthToken()}`);
    xhr.send(formData);
}

// Handle upload success
function handleUploadSuccess(uploadRecord) {
    // Save locally
    uploadHistory.push(uploadRecord);
    localStorage.setItem('uploadHistory', JSON.stringify(uploadHistory));

    // Show success message
    document.getElementById('uploadProgress').style.display = 'none';
    document.getElementById('uploadStatus').classList.add('success');
    document.getElementById('uploadStatus').classList.remove('error');
    document.getElementById('uploadStatus').style.display = 'block';
    document.getElementById('statusMsg').textContent = 
        `✓ Successfully uploaded ${uploadRecord.recordCount} records from ${uploadRecord.fileName}`;

    // Clear after 3 seconds
    setTimeout(() => {
        clearFile();
        document.getElementById('uploadStatus').style.display = 'none';
        updateStats();
        loadUploadHistory();
    }, 3000);
}

// Show upload error
function showUploadError(message) {
    document.getElementById('uploadProgress').style.display = 'none';
    document.getElementById('uploadStatus').classList.remove('success');
    document.getElementById('uploadStatus').classList.add('error');
    document.getElementById('uploadStatus').style.display = 'block';
    document.getElementById('statusMsg').textContent = message;
}

// Load upload history
function loadUploadHistory() {
    const historyList = document.getElementById('historyList');
    
    if (uploadHistory.length === 0) {
        historyList.innerHTML = '<p class="no-data">No uploads yet. Start by uploading a file!</p>';
        return;
    }

    historyList.innerHTML = uploadHistory.map(record => `
        <div class="history-item">
            <div class="history-item-info">
                <div class="history-item-name">📄 ${record.fileName}</div>
                <div class="history-item-date">📅 ${record.uploadDate}</div>
                <div class="history-item-stats">
                    <span class="history-stat">📊 ${record.recordCount} records</span>
                    <span class="history-stat">💾 ${record.fileSize} MB</span>
                </div>
            </div>
            <div class="history-item-actions">
                <button class="btn-secondary" onclick="previewData(${record.id})">👁️ View</button>
                <button class="btn-secondary" onclick="downloadRecord(${record.id})">📥 Download</button>
                <button class="btn-secondary" onclick="deleteRecord(${record.id})" style="background-color: #ffebee; color: #e74c3c;">🗑️ Delete</button>
            </div>
        </div>
    `).join('');
}

// Search history
function searchHistory(e) {
    const searchTerm = e.target.value.toLowerCase();
    const items = document.querySelectorAll('.history-item');
    
    items.forEach(item => {
        const fileName = item.querySelector('.history-item-name').textContent.toLowerCase();
        if (fileName.includes(searchTerm)) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
}

// Preview data
function previewData(recordId) {
    const record = uploadHistory.find(r => r.id === recordId);
    if (!record) return;

    const modal = document.getElementById('previewModal');
    const previewData = document.getElementById('previewData');

    // Create table
    let html = `
        <div style="margin-bottom: 20px;">
            <h3>${record.fileName}</h3>
            <p style="color: #7f8c8d;">Uploaded: ${record.uploadDate}</p>
        </div>
        <table>
            <thead>
                <tr>
                    ${Object.keys(record.data[0]).map(key => `<th>${key}</th>`).join('')}
                </tr>
            </thead>
            <tbody>
                ${record.data.map(row => `
                    <tr>
                        ${Object.values(row).map(val => `<td>${val}</td>`).join('')}
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    previewData.innerHTML = html;
    modal.classList.add('active');
}

// Close preview
function closePreview() {
    document.getElementById('previewModal').classList.remove('active');
}

// Download record
function downloadRecord(recordId) {
    const record = uploadHistory.find(r => r.id === recordId);
    if (!record) return;

    // Convert to CSV
    const headers = Object.keys(record.data[0]);
    const csv = [
        headers.join(','),
        ...record.data.map(row => 
            headers.map(header => {
                const value = row[header];
                return `"${value}"`;
            }).join(',')
        )
    ].join('\n');

    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${record.fileName}-backup-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

// Delete record
function deleteRecord(recordId) {
    if (confirm('Are you sure you want to delete this upload record?')) {
        uploadHistory = uploadHistory.filter(r => r.id !== recordId);
        localStorage.setItem('uploadHistory', JSON.stringify(uploadHistory));
        loadUploadHistory();
        updateStats();
    }
}

// Export history
function exportHistory() {
    if (uploadHistory.length === 0) {
        alert('No uploads to export!');
        return;
    }

    const historyData = uploadHistory.map(r => ({
        fileName: r.fileName,
        fileSize: r.fileSize,
        uploadDate: r.uploadDate,
        recordCount: r.recordCount
    }));

    const csv = [
        'File Name,File Size (MB),Upload Date,Record Count',
        ...historyData.map(r => `"${r.fileName}",${r.fileSize},"${r.uploadDate}",${r.recordCount}`)
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `upload-history-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

// Update stats
function updateStats() {
    const totalUploads = uploadHistory.length;
    const totalRecords = uploadHistory.reduce((sum, r) => sum + r.recordCount, 0);
    const lastUpload = uploadHistory.length > 0 ? uploadHistory[uploadHistory.length - 1].uploadDate : '--';
    const totalDataStored = (uploadHistory.reduce((sum, r) => sum + parseFloat(r.fileSize), 0)).toFixed(2);
    const avgFileSize = totalUploads > 0 ? (totalDataStored / totalUploads).toFixed(2) : 0;

    document.getElementById('totalUploads').textContent = totalUploads;
    document.getElementById('totalRecords').textContent = totalRecords;
    document.getElementById('lastUpload').textContent = lastUpload;
    document.getElementById('totalDataStored').textContent = totalDataStored + ' MB';
    document.getElementById('avgFileSize').textContent = avgFileSize + ' MB';
}

// Save settings
function saveSettings() {
    const newName = document.getElementById('settingsName').value;
    
    if (currentUser) {
        currentUser.name = newName;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        loadUserInfo();
        alert('Settings saved successfully!');
    }
}

// Toggle sidebar for mobile
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
        localStorage.removeItem('userEmail');
        localStorage.removeItem('authToken');
        window.location.href = 'login.html';
    }
}

// Close modal when clicking outside
document.addEventListener('click', function(e) {
    const modal = document.getElementById('previewModal');
    if (e.target === modal) {
        modal.classList.remove('active');
    }
});

// Real-time clock
function updateClock() {
    const now = new Date();
    document.title = `User Dashboard - ${now.toLocaleTimeString()}`;
}

setInterval(updateClock, 1000);
