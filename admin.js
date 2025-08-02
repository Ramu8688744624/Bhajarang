// Admin Login JavaScript
class AdminAuth {
    constructor() {
        // Simple password - you can change this
        this.adminPassword = 'bhajarang2025';
        this.init();
    }

    init() {
        this.checkExistingAuth();
        this.setupEventListeners();
    }

    checkExistingAuth() {
        // Check if admin is already logged in
        const isLoggedIn = sessionStorage.getItem('bhajarang_admin_auth');
        if (isLoggedIn === 'true') {
            window.location.href = 'admin-dashboard.html';
        }
    }

    setupEventListeners() {
        const loginForm = document.getElementById('admin-login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Allow Enter key to submit
        const passwordInput = document.getElementById('admin-password');
        if (passwordInput) {
            passwordInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.handleLogin(e);
                }
            });

            // Clear error on input
            passwordInput.addEventListener('input', () => {
                this.hideError();
            });
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const passwordInput = document.getElementById('admin-password');
        const loginBtn = document.querySelector('.login-btn');
        const password = passwordInput.value.trim();

        if (!password) {
            this.showError('Please enter the admin password');
            return;
        }

        // Show loading state
        const originalText = loginBtn.innerHTML;
        loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
        loginBtn.disabled = true;

        // Simulate authentication delay
        setTimeout(() => {
            if (password === this.adminPassword) {
                // Success
                sessionStorage.setItem('bhajarang_admin_auth', 'true');
                
                // Show success state briefly
                loginBtn.innerHTML = '<i class="fas fa-check"></i> Login Successful!';
                loginBtn.style.background = '#10b981';
                
                // Redirect to dashboard
                setTimeout(() => {
                    window.location.href = 'admin-dashboard.html';
                }, 1000);
                
            } else {
                // Failed
                this.showError('Incorrect password. Please try again.');
                passwordInput.value = '';
                passwordInput.focus();
                
                // Reset button
                loginBtn.innerHTML = originalText;
                loginBtn.disabled = false;
                
                // Add shake animation to form
                const loginContainer = document.querySelector('.login-container');
                loginContainer.style.animation = 'shake 0.5s ease-in-out';
                setTimeout(() => {
                    loginContainer.style.animation = '';
                }, 500);
            }
        }, 1200);
    }

    showError(message) {
        const errorEl = document.getElementById('login-error');
        const errorText = errorEl.querySelector('span');
        
        errorText.textContent = message;
        errorEl.style.display = 'flex';
        
        // Auto hide after 5 seconds
        setTimeout(() => {
            this.hideError();
        }, 5000);
    }

    hideError() {
        const errorEl = document.getElementById('login-error');
        errorEl.style.display = 'none';
    }
}

// Add shake animation CSS
const shakeCSS = `
@keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
}
`;

// Inject CSS
const style = document.createElement('style');
style.textContent = shakeCSS;
document.head.appendChild(style);

// Initialize admin auth when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AdminAuth();
});

// Prevent back button after logout
window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        window.location.reload();
    }
});
