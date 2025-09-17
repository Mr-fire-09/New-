// Authentication Management
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        // Check if user is logged in on page load
        const token = localStorage.getItem('token');
        if (token) {
            apiClient.setToken(token);
            this.loadUserProfile();
        } else {
            this.updateUI();
        }
    }

    async loadUserProfile() {
        try {
            const profile = await apiClient.getProfile();
            this.currentUser = profile;
            this.updateUI();
        } catch (error) {
            console.error('Failed to load user profile:', error);
            this.logout();
        }
    }

    async login(email, password) {
        try {
            const response = await apiClient.login(email, password);
            apiClient.setToken(response.token);
            this.currentUser = {
                id: response.id,
                name: response.name,
                email: response.email,
                role: response.role
            };
            this.updateUI();
            showNotification('Login successful!', 'success');
            return true;
        } catch (error) {
            console.error('Login failed:', error);
            showNotification('Login failed. Please check your credentials.', 'error');
            return false;
        }
    }

    async register(name, email, password) {
        try {
            await apiClient.register(name, email, password);
            showNotification('Registration successful! Please login.', 'success');
            return true;
        } catch (error) {
            console.error('Registration failed:', error);
            showNotification('Registration failed. Please try again.', 'error');
            return false;
        }
    }

    logout() {
        apiClient.clearToken();
        this.currentUser = null;
        this.updateUI();
        showNotification('Logged out successfully', 'info');
        
        // Redirect to home page if not already there
        if (window.location.pathname.includes('admin.html')) {
            window.location.href = 'index.html';
        }
    }

    updateUI() {
        const navAuth = document.getElementById('navAuth');
        const navUser = document.getElementById('navUser');
        const userName = document.getElementById('userName');
        const adminName = document.getElementById('adminName');

        if (this.currentUser) {
            // Hide auth buttons, show user info
            if (navAuth) navAuth.style.display = 'none';
            if (navUser) navUser.style.display = 'flex';
            if (userName) userName.textContent = this.currentUser.name;
            if (adminName) adminName.textContent = this.currentUser.name;

            // Check if user is admin and on admin page
            if (window.location.pathname.includes('admin.html')) {
                if (this.currentUser.role !== 'ROLE_ADMIN') {
                    showNotification('Access denied. Admin privileges required.', 'error');
                    window.location.href = 'index.html';
                }
            }
        } else {
            // Show auth buttons, hide user info
            if (navAuth) navAuth.style.display = 'flex';
            if (navUser) navUser.style.display = 'none';

            // Redirect to home if trying to access protected pages
            if (window.location.pathname.includes('admin.html')) {
                window.location.href = 'index.html';
            }
        }
    }

    isLoggedIn() {
        return this.currentUser !== null;
    }

    isAdmin() {
        return this.currentUser && this.currentUser.role === 'ROLE_ADMIN';
    }

    getCurrentUser() {
        return this.currentUser;
    }
}

// Create global auth manager instance
const authManager = new AuthManager();

// Modal functions
function showLoginModal() {
    document.getElementById('loginModal').style.display = 'block';
}

function showRegisterModal() {
    document.getElementById('registerModal').style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Login form handler
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            const success = await authManager.login(email, password);
            if (success) {
                closeModal('loginModal');
                loginForm.reset();
                
                // Reload page to update content
                window.location.reload();
            }
        });
    }

    // Register form handler
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const name = document.getElementById('registerName').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            
            const success = await authManager.register(name, email, password);
            if (success) {
                closeModal('registerModal');
                registerForm.reset();
            }
        });
    }
});

// Logout function
function logout() {
    authManager.logout();
    window.location.reload();
}
