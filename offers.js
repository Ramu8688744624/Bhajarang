// Offers Page JavaScript
class OffersManager {
    constructor() {
        this.offers = [];
        this.init();
    }

    init() {
        this.loadOffers();
        this.renderOffers();
    }

    loadOffers() {
        try {
            const storedOffers = localStorage.getItem('bhajarang_offers');
            this.offers = storedOffers ? JSON.parse(storedOffers) : [];
            
            // Add sample offers if none exist (for demo purposes)
            if (this.offers.length === 0) {
                this.addSampleOffers();
            }
        } catch (error) {
            console.error('Error loading offers:', error);
            this.offers = [];
        }
    }

    addSampleOffers() {
        const sampleOffers = [
            {
                id: 'offer_1',
                title: '🎉 20% Off Screen Replacement',
                description: 'Get 20% discount on all mobile screen replacements. Valid for all brands including iPhone, Samsung, OnePlus, and more. Professional installation with 6-month warranty included.',
                validity: this.getDateString(30), // 30 days from now
                image: '',
                createdAt: new Date().toISOString()
            },
            {
                id: 'offer_2',
                title: '🔋 Free Battery Check + 15% Off Replacement',
                description: 'Free battery health check for all smartphones. If replacement needed, get 15% off on genuine batteries. Includes installation and 1-year warranty.',
                validity: this.getDateString(45), // 45 days from now
                image: '',
                createdAt: new Date().toISOString()
            },
            {
                id: 'offer_3',
                title: '📱 Buy 2 Accessories, Get 1 FREE',
                description: 'Purchase any 2 mobile accessories (cases, chargers, screen guards, etc.) and get the lowest priced item absolutely FREE. Mix and match from our wide collection.',
                validity: this.getDateString(60), // 60 days from now
                image: '',
                createdAt: new Date().toISOString()
            }
        ];

        this.offers = sampleOffers;
        this.saveOffers();
    }

    getDateString(daysFromNow) {
        const date = new Date();
        date.setDate(date.getDate() + daysFromNow);
        return date.toISOString().split('T')[0];
    }

    saveOffers() {
        try {
            localStorage.setItem('bhajarang_offers', JSON.stringify(this.offers));
        } catch (error) {
            console.error('Error saving offers:', error);
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
        card.innerHTML = `
            <div class="offer-image">
                ${offer.image ? 
                    `<img src="${offer.image}" alt="${offer.title}" onerror="this.parentElement.innerHTML='<div class=\\'default-icon\\'><i class=\\'fas fa-gift\\'></i></div>'">` :
                    `<div class="default-icon"><i class="fas fa-gift"></i></div>`
                }
            </div>
            <div class="offer-content">
                <h3 class="offer-title">${offer.title}</h3>
                <p class="offer-description">${offer.description}</p>
                ${offer.validity ? `
                    <div class="offer-validity ${this.isExpired(offer.validity) ? 'expired' : ''}">
                        <i class="fas fa-calendar-alt"></i>
                        <span>Valid until: ${this.formatDate(offer.validity)}</span>
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
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }
}

// Initialize offers manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new OffersManager();
});

// Refresh offers when page becomes visible (in case admin updated offers)
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        // Small delay to ensure any admin changes are saved
        setTimeout(() => {
            const offersManager = new OffersManager();
        }, 500);
    }
});
