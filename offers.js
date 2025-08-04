// Offers Page JavaScript - Firebase Only Version
class OffersManager {
    constructor() {
        this.offers = [];
        this.db = null;
        this.init();
    }

    async init() {
        // Initialize Firebase if not already done
        if (typeof firebase !== 'undefined' && !this.db) {
            this.db = firebase.firestore();
        }
        
        await this.loadOffers();
        this.renderOffers();
    }

    async loadOffers() {
        try {
            console.log('Loading offers from Firebase...');
            
            if (!this.db) {
                console.error('Firebase not initialized');
                this.offers = [];
                return;
            }

            // Load active offers from Firebase Firestore
            // First get current date in YYYY-MM-DD format for comparison
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todayStr = today.toISOString().split('T')[0];
            
            console.log('Loading active offers with today:', todayStr);
            
            const snapshot = await this.db.collection('offers')
                .where('isActive', '==', true)
                .orderBy('createdAt', 'desc')
                .get();
                
            console.log('Raw offers from Firestore:', snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate().toString() : doc.data().createdAt,
                updatedAt: doc.data().updatedAt?.toDate ? doc.data().updatedAt.toDate().toString() : doc.data().updatedAt
            })));
            
            this.offers = [];
            snapshot.forEach(doc => {
                const offer = doc.data();
                offer.id = doc.id;
                this.offers.push(offer);
            });
            
            console.log('Loaded', this.offers.length, 'offers from Firebase');
            
        } catch (error) {
            console.error('Error loading offers from Firebase:', error);
            this.offers = [];
        }
    }



    renderOffers() {
        const loadingEl = document.getElementById('offers-loading');
        const noOffersEl = document.getElementById('no-offers');
        const gridEl = document.getElementById('offers-grid');

        // Show loading initially
        loadingEl.style.display = 'block';
        noOffersEl.style.display = 'none';
        gridEl.style.display = 'none';

        // Simulate loading delay for better UX
        setTimeout(() => {
            loadingEl.style.display = 'none';

            if (this.offers.length === 0) {
                noOffersEl.style.display = 'block';
            } else {
                gridEl.style.display = 'grid';
                this.renderOffersGrid();
            }
        }, 800);
    }

    renderOffersGrid() {
        const gridEl = document.getElementById('offers-grid');
        gridEl.innerHTML = '';

        // Filter out expired offers for public view
        const activeOffers = this.offers.filter(offer => !this.isExpired(offer.validity));

        if (activeOffers.length === 0) {
            document.getElementById('no-offers').style.display = 'block';
            gridEl.style.display = 'none';
            return;
        }

        activeOffers.forEach(offer => {
            const offerCard = this.createOfferCard(offer);
            gridEl.appendChild(offerCard);
        });
    }

    createOfferCard(offer) {
        const card = document.createElement('div');
        card.className = 'offer-card';
        
        // Format dates
        const formattedValidTill = offer.validTill ? this.formatDate(offer.validTill) : null;
        const isExpired = formattedValidTill ? this.isExpired(offer.validTill) : false;
        
        // Determine what to show in the image container
        let imageContent = '';
        if (offer.imageUrl && offer.imageUrl.trim() !== '') {
            imageContent = `
                <img src="${offer.imageUrl}" 
                     alt="${offer.title}" 
                     class="offer-image"
                     onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\'default-icon\'><i class=\'fas fa-gift\'></i></div>'">
            `;
        } else {
            imageContent = `
                <div class="default-icon">
                    <i class="fas fa-gift"></i>
                </div>
            `;
        }
        
        card.innerHTML = `
            <div class="offer-image-container">
                ${imageContent}
            </div>
            <div class="offer-content">
                <h3 class="offer-title">${this.escapeHtml(offer.title)}</h3>
                <p class="offer-description">${this.escapeHtml(offer.description)}</p>
                ${formattedValidTill ? `
                    <div class="offer-validity ${isExpired ? 'expired' : ''}">
                        <i class="fas fa-calendar-alt"></i>
                        <span>Valid until: ${formattedValidTill}</span>
                    </div>
                ` : ''}
            </div>
        `;

        // Add click animation
        card.addEventListener('click', () => {
            card.style.transform = 'scale(0.98)';
            setTimeout(() => {
                card.style.transform = '';
            }, 150);
        });

        return card;
    }

    isExpired(validityDate) {
        if (!validityDate) return false;
        const today = new Date();
        const validity = new Date(validityDate);
        return validity < today;
    }

    formatDate(dateString) {
        if (!dateString) return '';
        
        let date;
        // Handle both string dates and Firestore Timestamp objects
        if (typeof dateString === 'string') {
            date = new Date(dateString);
        } else if (dateString.toDate) {
            // Handle Firestore Timestamp
            date = dateString.toDate();
        } else if (dateString.seconds) {
            // Handle Firestore Timestamp (compat mode)
            date = new Date(dateString.seconds * 1000);
        } else {
            return '';
        }
        
        if (isNaN(date.getTime())) return '';
        
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    }

    // Helper function to prevent XSS
    escapeHtml(unsafe) {
        if (!unsafe) return '';
        return String(unsafe)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}

// Initialize offers manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new OffersManager();

    // Refresh offers when page becomes visible (in case admin updated offers)
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            // Small delay to ensure any admin changes are saved
            setTimeout(() => {
                new OffersManager();
            }, 500);
        }
    });
});
