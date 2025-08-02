// ==== 1. Firebase Config & Init ====
const firebaseConfig = {
  apiKey: "AIzaSyBnvVzRwCzwGdPzInwC1J1b2MpVh_zQlew",
  authDomain: "bhajarang-offers.firebaseapp.com",
  projectId: "bhajarang-offers",
  storageBucket: "bhajarang-offers.firebasestorage.app",
  messagingSenderId: "585545255878",
  appId: "1:585545255878:web:bc728387d933b1fed540c7",
  measurementId: "G-29J69VBDVH"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// ==== 2. Auth Logic ====
const loginForm = document.getElementById('login-form');
const logoutSection = document.getElementById('logout-section');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('login-btn');
const googleLoginBtn = document.getElementById('google-login-btn');
const logoutBtn = document.getElementById('logout-btn');
const userEmailSpan = document.getElementById('user-email');
const loginError = document.getElementById('login-error');

auth.onAuthStateChanged(user => {
  if (user) {
    loginForm.style.display = 'none';
    logoutSection.style.display = 'block';
    userEmailSpan.textContent = user.email;
    document.getElementById('offers-section').style.display = 'block';
    loadOffers();
  } else {
    loginForm.style.display = 'block';
    logoutSection.style.display = 'none';
    document.getElementById('offers-section').style.display = 'none';
  }
});

loginBtn.onclick = async () => {
  loginError.textContent = '';
  try {
    await auth.signInWithEmailAndPassword(emailInput.value, passwordInput.value);
  } catch (e) {
    loginError.textContent = e.message;
  }
};
googleLoginBtn.onclick = async () => {
  loginError.textContent = '';
  const provider = new firebase.auth.GoogleAuthProvider();
  try {
    await auth.signInWithPopup(provider);
  } catch (e) {
    loginError.textContent = e.message;
  }
};
logoutBtn.onclick = () => auth.signOut();

// ==== 3. Offers CRUD Logic ====
const offersTableBody = document.querySelector('#offers-table tbody');
const addOfferBtn = document.getElementById('add-offer-btn');
const offerModal = document.getElementById('offer-modal');
const closeModal = document.getElementById('close-modal');
const offerForm = document.getElementById('offer-form');
const offerIdInput = document.getElementById('offer-id');
const offerTitleInput = document.getElementById('offer-title');
const offerDescriptionInput = document.getElementById('offer-description');
const offerPriceInput = document.getElementById('offer-price');
const offerValidTillInput = document.getElementById('offer-validTill');
const offerImageInput = document.getElementById('offer-image');
const offerImagePreview = document.getElementById('offer-image-preview');
const offerFormError = document.getElementById('offer-form-error');

let offersUnsubscribe = null;

function loadOffers() {
  if (offersUnsubscribe) offersUnsubscribe();
  offersUnsubscribe = db.collection('offers').orderBy('validTill').onSnapshot(snapshot => {
    offersTableBody.innerHTML = '';
    snapshot.forEach(doc => {
      const offer = doc.data();
      offer.id = doc.id;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${offer.imageUrl ? `<img src="${offer.imageUrl}" style="width:60px;max-height:60px;object-fit:contain;">` : ''}</td>
        <td>${offer.title}</td>
        <td>${offer.description}</td>
        <td>${offer.price}</td>
        <td>${offer.validTill}</td>
        <td>
          <button onclick="editOffer('${offer.id}')">Edit</button>
          <button onclick="deleteOffer('${offer.id}')">Delete</button>
        </td>
      `;
      offersTableBody.appendChild(tr);
    });
  });
}

window.editOffer = function(id) {
  db.collection('offers').doc(id).get().then(doc => {
    if (!doc.exists) return;
    const offer = doc.data();
    offerIdInput.value = id;
    offerTitleInput.value = offer.title;
    offerDescriptionInput.value = offer.description;
    offerPriceInput.value = offer.price;
    offerValidTillInput.value = offer.validTill;
    offerImagePreview.src = offer.imageUrl || '';
    offerImagePreview.style.display = offer.imageUrl ? 'block' : 'none';
    offerImageInput.value = '';
    offerModal.style.display = 'block';
    offerFormError.textContent = '';
    document.getElementById('modal-title').textContent = 'Edit Offer';
  });
};

window.deleteOffer = function(id) {
  if (confirm('Delete this offer?')) {
    db.collection('offers').doc(id).delete();
  }
};

addOfferBtn.onclick = () => {
  offerIdInput.value = '';
  offerTitleInput.value = '';
  offerDescriptionInput.value = '';
  offerPriceInput.value = '';
  offerValidTillInput.value = '';
  offerImagePreview.src = '';
  offerImagePreview.style.display = 'none';
  offerImageInput.value = '';
  offerModal.style.display = 'block';
  offerFormError.textContent = '';
  document.getElementById('modal-title').textContent = 'Add Offer';
};

closeModal.onclick = () => {
  offerModal.style.display = 'none';
};

window.onclick = function(event) {
  if (event.target === offerModal) offerModal.style.display = 'none';
};

offerImageInput.onchange = function() {
  if (offerImageInput.files && offerImageInput.files[0]) {
    const reader = new FileReader();
    reader.onload = e => {
      offerImagePreview.src = e.target.result;
      offerImagePreview.style.display = 'block';
    };
    reader.readAsDataURL(offerImageInput.files[0]);
  }
};

offerForm.onsubmit = async function(e) {
  e.preventDefault();
  offerFormError.textContent = '';
  const id = offerIdInput.value;
  const title = offerTitleInput.value.trim();
  const description = offerDescriptionInput.value.trim();
  const price = offerPriceInput.value.trim();
  const validTill = offerValidTillInput.value;
  let imageUrl = offerImagePreview.src || '';

  // Upload image if a new one is selected
  if (offerImageInput.files && offerImageInput.files[0]) {
    const file = offerImageInput.files[0];
    const storageRef = storage.ref().child('offers/' + Date.now() + '_' + file.name);
    try {
      const snapshot = await storageRef.put(file);
      imageUrl = await snapshot.ref.getDownloadURL();
    } catch (err) {
      offerFormError.textContent = 'Image upload failed.';
      return;
    }
  }

  const offerData = { title, description, price, validTill, imageUrl };
  try {
    if (id) {
      await db.collection('offers').doc(id).update(offerData);
    } else {
      await db.collection('offers').add(offerData);
    }
    offerModal.style.display = 'none';
  } catch (err) {
    offerFormError.textContent = 'Failed to save offer.';
  }
};

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
