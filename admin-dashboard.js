// Admin Dashboard JavaScript
class AdminDashboard {
    constructor() {
        this.offers = [];
        this.currentEditingOffer = null;
        this.init();
    }

    async init() {
        this.checkAuth();
        await this.loadOffers();
        this.setupEventListeners();
        this.renderOffers();
    }

    checkAuth() {
        const isLoggedIn = sessionStorage.getItem('bhajarang_admin_auth');
        if (isLoggedIn !== 'true') {
            window.location.href = 'admin.html';
            return;
        }
    }

    setupEventListeners() {
        // Add offer button
        document.getElementById('add-offer-btn').addEventListener('click', () => {
            this.showOfferForm();
        });

        // Form close buttons
        document.getElementById('close-form-btn').addEventListener('click', () => {
            this.hideOfferForm();
        });
        document.getElementById('cancel-form-btn').addEventListener('click', () => {
            this.hideOfferForm();
        });

        // Form submission
        document.getElementById('offer-form').addEventListener('submit', (e) => {
            this.handleFormSubmit(e);
        });

        // Modal close buttons
        document.getElementById('close-modal-btn').addEventListener('click', () => {
            this.hideDeleteModal();
        });
        document.getElementById('cancel-delete-btn').addEventListener('click', () => {
            this.hideDeleteModal();
        });
        document.getElementById('confirm-delete-btn').addEventListener('click', () => {
            this.confirmDelete();
        });

        // Close form/modal on outside click
        document.getElementById('offer-form-section').addEventListener('click', (e) => {
            if (e.target.id === 'offer-form-section') {
                this.hideOfferForm();
            }
        });

        document.getElementById('delete-modal').addEventListener('click', (e) => {
            if (e.target.id === 'delete-modal') {
                this.hideDeleteModal();
            }
        });
    }

    async loadOffers() {
        try {
            // Check if we're on live site (has domain) or local (file:// or localhost)
            const isLive = window.location.protocol === 'https:' && !window.location.hostname.includes('localhost');
            
            if (isLive) {
                // Live site - use Vercel API
                const response = await fetch('/api/offers');
                const data = await response.json();
                this.offers = data.offers || [];
            } else {
                // Local development - use localStorage
                const storedOffers = localStorage.getItem('bhajarang_offers');
                this.offers = storedOffers ? JSON.parse(storedOffers) : [];
            }
        } catch (error) {
            console.error('Error loading offers:', error);
            // Fallback to localStorage
            const storedOffers = localStorage.getItem('bhajarang_offers');
            this.offers = storedOffers ? JSON.parse(storedOffers) : [];
        }
    }

    async saveOffers() {
        try {
            // Check if we're on live site (has domain) or local (file:// or localhost)
            const isLive = window.location.protocol === 'https:' && !window.location.hostname.includes('localhost');
            
            if (isLive) {
                // Live site - use Vercel API
                const response = await fetch('/api/offers', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ offers: this.offers })
                });
                
                const result = await response.json();
                if (result.success) {
                    this.showMessage('Offers updated successfully! Changes are live across all devices.', 'success');
                } else {
                    throw new Error(result.message || 'Failed to save offers');
                }
            } else {
                // Local development - use localStorage
                localStorage.setItem('bhajarang_offers', JSON.stringify(this.offers));
                this.showMessage('Offers updated successfully!', 'success');
            }
        } catch (error) {
            console.error('Error saving offers:', error);
            // Fallback to localStorage
            localStorage.setItem('bhajarang_offers', JSON.stringify(this.offers));
            this.showMessage('Saved locally. May not sync across devices.', 'error');
        }
    }

    renderOffers() {
        const loadingEl = document.getElementById('admin-loading');
        const noOffersEl = document.getElementById('admin-no-offers');
        const tableEl = document.getElementById('offers-table-container');
        const countEl = document.getElementById('offers-count');

        // Show loading initially
        loadingEl.style.display = 'block';
        noOffersEl.style.display = 'none';
        tableEl.style.display = 'none';

        setTimeout(() => {
            loadingEl.style.display = 'none';
            countEl.textContent = this.offers.length;

            if (this.offers.length === 0) {
                noOffersEl.style.display = 'block';
            } else {
                tableEl.style.display = 'block';
                this.renderOffersTable();
            }
        }, 500);
    }

    renderOffersTable() {
        const tbody = document.getElementById('offers-table-body');
        tbody.innerHTML = '';

        this.offers.forEach(offer => {
            const row = this.createOfferRow(offer);
            tbody.appendChild(row);
        });
    }

    createOfferRow(offer) {
        const row = document.createElement('tr');
        const isExpired = this.isExpired(offer.validity);
        
        row.innerHTML = `
            <td class="offer-title-cell">${offer.title}</td>
            <td class="offer-description-cell" title="${offer.description}">
                ${offer.description}
            </td>
            <td class="offer-validity-cell ${isExpired ? 'expired' : 'active'}">
                ${offer.validity ? 
                    (isExpired ? 'Expired' : this.formatDate(offer.validity)) : 
                    'No expiry'
                }
            </td>
            <td>${this.formatDate(offer.createdAt.split('T')[0])}</td>
            <td>
                <div class="offer-actions">
                    <button class="action-btn edit" onclick="adminDashboard.editOffer('${offer.id}')">
                        <i class="fas fa-edit"></i>
                        Edit
                    </button>
                    <button class="action-btn delete" onclick="adminDashboard.deleteOffer('${offer.id}')">
                        <i class="fas fa-trash"></i>
                        Delete
                    </button>
                </div>
            </td>
        `;

        return row;
    }

    showOfferForm(offer = null) {
        this.currentEditingOffer = offer;
        const formSection = document.getElementById('offer-form-section');
        const formTitle = document.getElementById('form-title');
        const saveBtn = document.getElementById('save-btn-text');
        const form = document.getElementById('offer-form');

        if (offer) {
            formTitle.textContent = 'Edit Offer';
            saveBtn.textContent = 'Update Offer';
            this.populateForm(offer);
        } else {
            formTitle.textContent = 'Add New Offer';
            saveBtn.textContent = 'Save Offer';
            form.reset();
        }

        formSection.style.display = 'flex';
        document.getElementById('offer-title').focus();
    }

    hideOfferForm() {
        document.getElementById('offer-form-section').style.display = 'none';
        document.getElementById('offer-form').reset();
        this.currentEditingOffer = null;
    }

    populateForm(offer) {
        document.getElementById('offer-id').value = offer.id;
        document.getElementById('offer-title').value = offer.title;
        document.getElementById('offer-description').value = offer.description;
        document.getElementById('offer-validity').value = offer.validity || '';
        document.getElementById('offer-image').value = offer.image || '';
    }

    handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const offerData = {
            id: formData.get('id') || this.generateId(),
            title: formData.get('title').trim(),
            description: formData.get('description').trim(),
            validity: formData.get('validity') || null,
            image: formData.get('image').trim() || null,
            createdAt: this.currentEditingOffer ? this.currentEditingOffer.createdAt : new Date().toISOString()
        };

        // Validation
        if (!offerData.title || !offerData.description) {
            this.showMessage('Please fill in all required fields.', 'error');
            return;
        }

        if (offerData.validity && this.isExpired(offerData.validity)) {
            const proceed = confirm('The validity date is in the past. Do you want to continue?');
            if (!proceed) return;
        }

        // Save offer
        if (this.currentEditingOffer) {
            // Update existing offer
            const index = this.offers.findIndex(o => o.id === offerData.id);
            if (index !== -1) {
                this.offers[index] = offerData;
            }
        } else {
            // Add new offer
            this.offers.unshift(offerData);
        }

        this.saveOffers();
        this.renderOffers();
        this.hideOfferForm();
    }

    editOffer(offerId) {
        const offer = this.offers.find(o => o.id === offerId);
        if (offer) {
            this.showOfferForm(offer);
        }
    }

    deleteOffer(offerId) {
        const offer = this.offers.find(o => o.id === offerId);
        if (offer) {
            document.getElementById('delete-offer-title').textContent = offer.title;
            document.getElementById('delete-modal').style.display = 'flex';
            this.offerToDelete = offerId;
        }
    }

    hideDeleteModal() {
        document.getElementById('delete-modal').style.display = 'none';
        this.offerToDelete = null;
    }

    confirmDelete() {
        if (this.offerToDelete) {
            this.offers = this.offers.filter(o => o.id !== this.offerToDelete);
            this.saveOffers();
            this.renderOffers();
            this.hideDeleteModal();
        }
    }

    generateId() {
        return 'offer_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    isExpired(validityDate) {
        if (!validityDate) return false;
        const today = new Date();
        const validity = new Date(validityDate);
        return validity < today;
    }

    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    }

    showMessage(text, type = 'success') {
        const messageEl = document.getElementById('admin-message');
        const iconEl = document.getElementById('message-icon');
        const textEl = document.getElementById('message-text');

        // Set content
        textEl.textContent = text;
        
        // Set type
        messageEl.className = `admin-message ${type}`;
        iconEl.className = type === 'success' ? 'fas fa-check' : 'fas fa-exclamation-triangle';

        // Show message
        messageEl.style.display = 'block';

        // Auto hide after 4 seconds
        setTimeout(() => {
            messageEl.style.display = 'none';
        }, 4000);
    }
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        sessionStorage.removeItem('bhajarang_admin_auth');
        window.location.href = 'admin.html';
    }
}

// Global variable for access from HTML onclick handlers
let adminDashboard;

// Initialize admin dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    adminDashboard = new AdminDashboard();
});

// Prevent back button after logout
window.addEventListener('beforeunload', () => {
    // Clear any unsaved form data
});

// Auto-save form data on input (optional enhancement)
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('offer-form');
    if (form) {
        const inputs = form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                // Could implement auto-save draft functionality here
            });
        });
    }
});
