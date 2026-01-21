// API Service for Frontend
// Configure this with your backend URL

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class APIService {
    constructor() {
        this.token = localStorage.getItem('authToken');
    }

    // Set authorization token
    setToken(token) {
        this.token = token;
        localStorage.setItem('authToken', token);
    }

    // Get authorization headers
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        return headers;
    }

    // Error handler
    handleError(error) {
        console.error('API Error:', error);
        throw error;
    }

    // ==================== AUTH ENDPOINTS ====================

    // Register user
    async register(name, email, password) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ name, email, password })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            this.setToken(data.token);
            return data;
        } catch (error) {
            return this.handleError(error);
        }
    }

    // Login user
    async login(email, password, userType = 'user') {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ email, password, userType })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            this.setToken(data.token);
            return data;
        } catch (error) {
            return this.handleError(error);
        }
    }

    // Verify token
    async verifyToken(token) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/verify`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ token })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            return data;
        } catch (error) {
            return this.handleError(error);
        }
    }

    // Logout
    async logout() {
        try {
            await fetch(`${API_BASE_URL}/auth/logout`, {
                method: 'POST',
                headers: this.getHeaders()
            });
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
            this.token = null;
        } catch (error) {
            return this.handleError(error);
        }
    }

    // ==================== USER ENDPOINTS ====================

    // Get all users (Admin only)
    async getAllUsers() {
        try {
            const response = await fetch(`${API_BASE_URL}/users`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            return data;
        } catch (error) {
            return this.handleError(error);
        }
    }

    // Get user by ID
    async getUserById(userId) {
        try {
            const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            return data;
        } catch (error) {
            return this.handleError(error);
        }
    }

    // Create new user (Admin only)
    async createUser(name, email, password, role = 'user') {
        try {
            const response = await fetch(`${API_BASE_URL}/users`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ name, email, password, role })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            return data;
        } catch (error) {
            return this.handleError(error);
        }
    }

    // Update user
    async updateUser(userId, updates) {
        try {
            const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(updates)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            return data;
        } catch (error) {
            return this.handleError(error);
        }
    }

    // Delete user (Admin only)
    async deleteUser(userId) {
        try {
            const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            return data;
        } catch (error) {
            return this.handleError(error);
        }
    }

    // Get user statistics
    async getUserStats(userId) {
        try {
            const response = await fetch(`${API_BASE_URL}/users/${userId}/stats`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            return data;
        } catch (error) {
            return this.handleError(error);
        }
    }

    // ==================== UPLOAD ENDPOINTS ====================

    // Upload file
    async uploadFile(file, onProgress) {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const xhr = new XMLHttpRequest();

            // Track progress
            if (onProgress) {
                xhr.upload.addEventListener('progress', (e) => {
                    if (e.lengthComputable) {
                        onProgress(Math.round((e.loaded / e.total) * 100));
                    }
                });
            }

            return new Promise((resolve, reject) => {
                xhr.addEventListener('load', () => {
                    if (xhr.status === 201) {
                        resolve(JSON.parse(xhr.responseText));
                    } else {
                        reject(JSON.parse(xhr.responseText));
                    }
                });

                xhr.addEventListener('error', () => {
                    reject({ error: 'Upload failed' });
                });

                xhr.open('POST', `${API_BASE_URL}/uploads/upload`);
                xhr.setRequestHeader('Authorization', `Bearer ${this.token}`);
                xhr.send(formData);
            });
        } catch (error) {
            return this.handleError(error);
        }
    }

    // Get upload history for user
    async getUploadHistory(userId) {
        try {
            const response = await fetch(`${API_BASE_URL}/uploads/history/${userId}`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            return data;
        } catch (error) {
            return this.handleError(error);
        }
    }

    // Get all uploads (Admin only)
    async getAllUploads() {
        try {
            const response = await fetch(`${API_BASE_URL}/uploads`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            return data;
        } catch (error) {
            return this.handleError(error);
        }
    }

    // Get upload by ID
    async getUploadById(uploadId) {
        try {
            const response = await fetch(`${API_BASE_URL}/uploads/${uploadId}`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            return data;
        } catch (error) {
            return this.handleError(error);
        }
    }

    // Delete upload
    async deleteUpload(uploadId) {
        try {
            const response = await fetch(`${API_BASE_URL}/uploads/${uploadId}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            return data;
        } catch (error) {
            return this.handleError(error);
        }
    }

    // Get system statistics (Admin only)
    async getSystemStats() {
        try {
            const response = await fetch(`${API_BASE_URL}/uploads/stats/system`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            return data;
        } catch (error) {
            return this.handleError(error);
        }
    }
}

// Create singleton instance
const api = new APIService();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
}
