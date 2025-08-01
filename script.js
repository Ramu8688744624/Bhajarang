// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });

        // Close menu when clicking on a link
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!navToggle.contains(event.target) && !navMenu.contains(event.target)) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            }
        });
    }

    // Contact Form Handling
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get the submit button
            const submitBtn = contactForm.querySelector('.submit-btn');
            const originalText = submitBtn.innerHTML;
            
            // Show loading state
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitBtn.disabled = true;
            
            // Get form data
            const formData = new FormData(contactForm);
            const name = formData.get('name');
            const phone = formData.get('phone');
            const email = formData.get('email');
            const service = formData.get('service');
            const message = formData.get('message');

            // Basic validation
            if (!name || !phone || !message) {
                alert('Please fill in all required fields.');
                // Reset button
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                return;
            }

            // Phone number validation (basic)
            const phoneRegex = /^[6-9]\d{9}$/;
            if (!phoneRegex.test(phone.replace(/\D/g, '').slice(-10))) {
                alert('Please enter a valid 10-digit phone number.');
                // Reset button
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                return;
            }

            // Create WhatsApp message
            let whatsappMessage = `Hello! I'm interested in your services.\n\n`;
            whatsappMessage += `Name: ${name}\n`;
            whatsappMessage += `Phone: ${phone}\n`;
            if (email) whatsappMessage += `Email: ${email}\n`;
            if (service) whatsappMessage += `Service Required: ${service}\n`;
            whatsappMessage += `Message: ${message}`;

            // Encode message for URL
            const encodedMessage = encodeURIComponent(whatsappMessage);
            const whatsappURL = `https://wa.me/919515397690?text=${encodedMessage}`;

            // Simulate processing time then redirect
            setTimeout(() => {
                // Show success message
                alert('Thank you for your message! You will be redirected to WhatsApp to complete your inquiry.');
                
                // Open WhatsApp
                window.open(whatsappURL, '_blank');
                
                // Reset form and button
                contactForm.reset();
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }, 1500);
        });
    }

    // Smooth scrolling for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add scroll effect to navbar
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.backdropFilter = 'blur(10px)';
        } else {
            navbar.style.background = '#fff';
            navbar.style.backdropFilter = 'none';
        }
    });

    // Animate elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll('.service-card, .feature, .reason-card, .service-item');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Map iframe click handler (if needed for fallback)
    const mapIframes = document.querySelectorAll('iframe[src*="google.com/maps"]');
    mapIframes.forEach(iframe => {
        iframe.addEventListener('click', function() {
            // Google Maps link for the business
            const googleMapsURL = 'https://maps.app.goo.gl/PPKEPtSCzc2Fjhmz6';
            window.open(googleMapsURL, '_blank');
        });
    });

    // Phone number formatting
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    phoneInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 10) {
                value = value.slice(0, 10);
            }
            e.target.value = value;
        });
    });

    // Loading state is now handled within the form submission handler

    // Add hover effects to cards
    const cards = document.querySelectorAll('.service-card, .reason-card, .feature');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Lazy loading for images (if any are added later)
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));

    // Add ripple effect to buttons
    function createRipple(event) {
        const button = event.currentTarget;
        const circle = document.createElement('span');
        const diameter = Math.max(button.clientWidth, button.clientHeight);
        const radius = diameter / 2;

        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${event.clientX - button.offsetLeft - radius}px`;
        circle.style.top = `${event.clientY - button.offsetTop - radius}px`;
        circle.classList.add('ripple');

        const ripple = button.getElementsByClassName('ripple')[0];
        if (ripple) {
            ripple.remove();
        }

        button.appendChild(circle);
    }

    const rippleButtons = document.querySelectorAll('.cta-button, .contact-btn, .action-btn, .submit-btn');
    rippleButtons.forEach(button => {
        button.addEventListener('click', createRipple);
        
        // Add ripple styles
        button.style.position = 'relative';
        button.style.overflow = 'hidden';
    });

    // Add CSS for ripple effect
    const style = document.createElement('style');
    style.textContent = `
        .ripple {
            position: absolute;
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 600ms linear;
            background-color: rgba(255, 255, 255, 0.6);
        }
        
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
});

// Utility functions
function formatPhoneNumber(phoneNumber) {
    const cleaned = phoneNumber.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
        return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return phoneNumber;
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Performance optimization
window.addEventListener('load', function() {
    // Remove loading states
    document.body.classList.add('loaded');
    
    // Preload critical resources
    const criticalLinks = document.querySelectorAll('a[href$=".html"]');
    criticalLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && !href.startsWith('http')) {
            const linkElement = document.createElement('link');
            linkElement.rel = 'prefetch';
            linkElement.href = href;
            document.head.appendChild(linkElement);
        }
    });
});
