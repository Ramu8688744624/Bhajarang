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
/* ========================================================
   JAI BHAJARANG MOBILES - GLOBAL AI ASSISTANT WIDGET
   ======================================================== */
(function() {
  // 1. Inject Styles dynamically with Slate/Navy high-contrast palette
  const style = document.createElement("style");
  style.innerHTML = `
    #jb-chat-btn {
      position: fixed;
      bottom: 24px;
      right: 24px;
      height: 52px;
      padding: 0 20px;
      background: #0f172a;
      color: #ffffff;
      border-radius: 30px;
      border: 2px solid rgba(255, 255, 255, 0.15);
      cursor: pointer;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.35);
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 15px;
      font-weight: 600;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      z-index: 999999;
      transition: all 0.25s ease;
    }
    #jb-chat-btn:hover {
      transform: translateY(-2px);
      background: #1e293b;
      box-shadow: 0 14px 30px rgba(0, 0, 0, 0.45);
    }
    .jb-btn-pulse {
      width: 10px;
      height: 10px;
      background: #22c55e;
      border-radius: 50%;
      box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.3);
    }

    #jb-chat-window {
      position: fixed;
      bottom: 88px;
      right: 24px;
      width: 375px;
      max-width: calc(100vw - 32px);
      height: 530px;
      max-height: 80vh;
      background: #ffffff;
      border-radius: 18px;
      box-shadow: 0 20px 45px rgba(0, 0, 0, 0.3);
      display: none;
      flex-direction: column;
      overflow: hidden;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      border: 1px solid #e2e8f0;
      animation: jbPop 0.25s ease-out;
    }
    @keyframes jbPop {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }

    #jb-chat-header {
      background: #0f172a;
      color: #ffffff;
      padding: 14px 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    .jb-h-left { display: flex; align-items: center; gap: 10px; }
    .jb-avatar-box {
      width: 36px;
      height: 36px;
      background: #dc2626;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 14px;
    }
    .jb-h-title { font-size: 15px; font-weight: 700; }
    .jb-h-sub { font-size: 11px; color: #94a3b8; display: flex; align-items: center; gap: 5px; }
    .jb-h-dot { width: 7px; height: 7px; background: #22c55e; border-radius: 50%; }

    #jb-chat-close {
      background: transparent;
      border: none;
      color: #94a3b8;
      font-size: 20px;
      cursor: pointer;
      line-height: 1;
    }
    #jb-chat-close:hover { color: #ffffff; }

    #jb-chat-messages {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
      background: #f8fafc;
    }

    .jb-bubble {
      max-width: 82%;
      padding: 11px 15px;
      border-radius: 14px;
      line-height: 1.45;
      font-size: 13.5px;
      word-break: break-word;
    }
    .jb-bot {
      background: #ffffff;
      color: #1e293b;
      align-self: flex-start;
      border-bottom-left-radius: 3px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.02);
    }
    .jb-user {
      background: #0f172a;
      color: #ffffff;
      align-self: flex-end;
      border-bottom-right-radius: 3px;
    }

    #jb-chat-input-bar {
      display: flex;
      padding: 12px;
      background: #ffffff;
      border-top: 1px solid #f1f5f9;
      gap: 8px;
    }
    #jb-chat-input {
      flex: 1;
      border: 1.5px solid #cbd5e1;
      border-radius: 24px;
      padding: 10px 16px;
      outline: none;
      font-size: 13.5px;
    }
    #jb-chat-input:focus { border-color: #0f172a; }
    #jb-chat-send {
      background: #0f172a;
      color: white;
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      transition: background 0.2s;
    }
    #jb-chat-send:hover { background: #334155; }

    @media (max-width: 480px) {
      #jb-chat-window {
        width: 100vw;
        height: 100vh;
        max-width: 100vw;
        max-height: 100vh;
        bottom: 0;
        right: 0;
        border-radius: 0;
      }
      #jb-chat-btn {
        bottom: 16px;
        right: 16px;
        padding: 0 16px;
        height: 46px;
        font-size: 13.5px;
      }
    }
  `;
  document.head.appendChild(style);

  // 2. Inject HTML UI
  const widgetContainer = document.createElement("div");
  widgetContainer.innerHTML = `
    <button id="jb-chat-btn" onclick="toggleJbWidget()" aria-label="Open AI Assistant">
      <span class="jb-btn-pulse"></span>
      <span>💬 Assistant</span>
    </button>

    <div id="jb-chat-window">
      <div id="jb-chat-header">
        <div class="jb-h-left">
          <div class="jb-avatar-box">JB</div>
          <div>
            <div class="jb-h-title">Jai Bhajarang Assistant</div>
            <div class="jb-h-sub"><span class="jb-h-dot"></span> Online | Karimnagar</div>
          </div>
        </div>
        <button id="jb-chat-close" onclick="toggleJbWidget()">✕</button>
      </div>

      <div id="jb-chat-messages">
        <div class="jb-bubble jb-bot">
          Namaste! 🙏 Welcome to Jai Bhajarang Mobiles.<br><br>
          Accessories, display repair, battery ledha doorstep service gurinchi adagandi — I'm here to help!
        </div>
      </div>

      <div id="jb-chat-input-bar">
        <input type="text" id="jb-chat-input" placeholder="Ask in English or Telugu..." onkeypress="handleJbKey(event)" />
        <button id="jb-chat-send" onclick="sendJbChat()">➔</button>
      </div>
    </div>
  `;
  document.body.appendChild(widgetContainer);

  // 3. Helper Functions
  window.toggleJbWidget = function() {
    const win = document.getElementById("jb-chat-window");
    const isVisible = win.style.display === "flex";
    win.style.display = isVisible ? "none" : "flex";
    if (!isVisible) document.getElementById("jb-chat-input").focus();
  };

  window.handleJbKey = function(e) {
    if (e.key === "Enter") sendJbChat();
  };

  window.sendJbChat = async function() {
    const input = document.getElementById("jb-chat-input");
    const text = input.value.trim();
    if (!text) return;

    const messages = document.getElementById("jb-chat-messages");

    // Add User Message
    const userBubble = document.createElement("div");
    userBubble.className = "jb-bubble jb-user";
    userBubble.innerText = text;
    messages.appendChild(userBubble);
    input.value = "";
    messages.scrollTop = messages.scrollHeight;

    // Add Loading Indicator
    const botBubble = document.createElement("div");
    botBubble.className = "jb-bubble jb-bot";
    botBubble.innerText = "Checking inventory & services...";
    messages.appendChild(botBubble);
    messages.scrollTop = messages.scrollHeight;

    try {
      const res = await fetch("https://bhajarang-ai-backend.onrender.com/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text })
      });
      const data = await res.json();
      botBubble.innerText = data.reply || "Sorry, no response received.";
    } catch (err) {
      botBubble.innerText = "Server is waking up, please try in 10 seconds!";
    }
    messages.scrollTop = messages.scrollHeight;
  };
})();
