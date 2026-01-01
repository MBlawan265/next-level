/* ==========================================================================
   NEXT LEVEL - AI FITNESS COACH
   Main JavaScript - Particle System & Interactions
   ========================================================================== */

// ============================================================================
// PARTICLE SYSTEM (Canvas-based floating energy particles)
// ============================================================================

class ParticleSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.mouseX = 0;
        this.mouseY = 0;
        this.targetMouseX = 0;
        this.targetMouseY = 0;

        // Configuration
        this.config = {
            particleCount: 200,
            minSize: 1,
            maxSize: 3,
            minSpeed: 0.05,
            maxSpeed: 0.2,
            color: { r: 0, g: 175, b: 255 },
            fadeSpeed: 0.005,
            parallaxStrength: 0.02
        };

        this.init();
        this.bindEvents();
        this.animate();
    }

    init() {
        this.resize();
        this.createParticles();
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    createParticles() {
        this.particles = [];
        for (let i = 0; i < this.config.particleCount; i++) {
            this.particles.push(this.createParticle());
        }
    }

    createParticle(x = null, y = null) {
        const size = this.randomRange(this.config.minSize, this.config.maxSize);
        return {
            x: x !== null ? x : Math.random() * this.width,
            y: y !== null ? y : Math.random() * this.height,
            baseX: 0,
            baseY: 0,
            size: size,
            baseSize: size,
            speedX: this.randomRange(-this.config.maxSpeed, this.config.maxSpeed),
            speedY: this.randomRange(-this.config.maxSpeed, this.config.maxSpeed),
            opacity: Math.random(),
            opacityDirection: Math.random() > 0.5 ? 1 : -1,
            pulseSpeed: this.randomRange(0.002, 0.008)
        };
    }

    randomRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    bindEvents() {
        window.addEventListener('resize', () => {
            this.resize();
        });

        window.addEventListener('mousemove', (e) => {
            this.targetMouseX = e.clientX - this.width / 2;
            this.targetMouseY = e.clientY - this.height / 2;
        });

        // Reduce particles on mobile for performance
        if (window.innerWidth < 768) {
            this.config.particleCount = 40;
            this.createParticles();
        }
    }

    update() {
        // Smooth mouse movement
        this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
        this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;

        for (let particle of this.particles) {
            // Move particles
            particle.x += particle.speedX;
            particle.y += particle.speedY;

            // Parallax effect based on mouse
            const parallaxX = this.mouseX * this.config.parallaxStrength * (particle.size / this.config.maxSize);
            const parallaxY = this.mouseY * this.config.parallaxStrength * (particle.size / this.config.maxSize);

            // Wrap around screen
            if (particle.x < -50) particle.x = this.width + 50;
            if (particle.x > this.width + 50) particle.x = -50;
            if (particle.y < -50) particle.y = this.height + 50;
            if (particle.y > this.height + 50) particle.y = -50;

            // Fade in/out
            particle.opacity += particle.opacityDirection * particle.pulseSpeed;
            if (particle.opacity >= 1) {
                particle.opacity = 1;
                particle.opacityDirection = -1;
            } else if (particle.opacity <= 0.1) {
                particle.opacity = 0.1;
                particle.opacityDirection = 1;
            }

            // Store parallax offset
            particle.baseX = parallaxX;
            particle.baseY = parallaxY;
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        for (let particle of this.particles) {
            const x = particle.x + particle.baseX;
            const y = particle.y + particle.baseY;
            const { r, g, b } = this.config.color;

            // Draw sharp sand-like particle (no blur/glow)
            this.ctx.beginPath();
            this.ctx.arc(x, y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${particle.opacity})`;
            this.ctx.fill();

            // Optional: Add a subtle lighter center for depth
            if (particle.size > 1.5) {
                this.ctx.beginPath();
                this.ctx.arc(x, y, particle.size * 0.4, 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(${r + 50}, ${g + 50}, ${b + 50}, ${particle.opacity * 0.8})`;
                this.ctx.fill();
            }
        }
    }

    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

// ============================================================================
// NAVIGATION
// ============================================================================

class Navigation {
    constructor() {
        this.navbar = document.getElementById('navbar');
        this.navToggle = document.getElementById('nav-toggle');
        this.navMenu = document.getElementById('nav-menu');
        this.navLinks = document.querySelectorAll('.nav-link');

        this.init();
    }

    init() {
        // Scroll behavior
        window.addEventListener('scroll', () => this.onScroll());

        // Mobile toggle
        if (this.navToggle) {
            this.navToggle.addEventListener('click', () => this.toggleMenu());
        }

        // Close menu on link click
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => this.closeMenu());
        });

        // Close menu on outside click
        document.addEventListener('click', (e) => {
            if (!this.navMenu.contains(e.target) && !this.navToggle.contains(e.target)) {
                this.closeMenu();
            }
        });
    }

    onScroll() {
        if (window.scrollY > 50) {
            this.navbar.classList.add('scrolled');
        } else {
            this.navbar.classList.remove('scrolled');
        }
    }

    toggleMenu() {
        this.navToggle.classList.toggle('active');
        this.navMenu.classList.toggle('active');
    }

    closeMenu() {
        this.navToggle.classList.remove('active');
        this.navMenu.classList.remove('active');
    }
}

// ============================================================================
// SCROLL REVEAL
// ============================================================================

class ScrollReveal {
    constructor() {
        this.elements = document.querySelectorAll('[data-reveal]');
        this.init();
    }

    init() {
        if (!this.elements.length) return;

        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    // Staggered delay based on element index
                    setTimeout(() => {
                        entry.target.classList.add('revealed');
                    }, index * 100);
                    observer.unobserve(entry.target);
                }
            });
        }, options);

        this.elements.forEach(element => observer.observe(element));
    }
}

// ============================================================================
// BETA FORM HANDLER
// ============================================================================

class BetaForm {
    constructor() {
        this.form = document.getElementById('beta-form');
        this.emailInput = document.getElementById('beta-email');
        this.feedback = document.getElementById('form-feedback');
        this.submitBtn = this.form?.querySelector('.btn-submit');
        this.btnText = this.submitBtn?.querySelector('.btn-text');
        this.btnLoading = this.submitBtn?.querySelector('.btn-loading');

        if (this.form) {
            this.init();
        }
    }

    init() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    async handleSubmit(e) {
        e.preventDefault();

        const email = this.emailInput.value.trim();

        if (!this.validateEmail(email)) {
            this.showFeedback('Please enter a valid email address.', 'error');
            return;
        }

        // Show loading state
        this.setLoading(true);

        // Get Google Script URL from localStorage (set by admin)
        const scriptUrl = localStorage.getItem('nextlevel_script_url');

        if (scriptUrl) {
            try {
                // Send to Google Apps Script
                const response = await fetch(scriptUrl, {
                    method: 'POST',
                    mode: 'no-cors', // Required for Google Apps Script
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email: email })
                });

                // Since no-cors doesn't return response data, we assume success
                console.log('Beta signup submitted:', email);
                this.showFeedback('🎮 Welcome to the Hunter Program! Check your email for updates.', 'success');
                this.form.reset();

            } catch (error) {
                console.error('Error submitting form:', error);
                // Still show success since no-cors mode
                console.log('Beta signup (fallback):', email);
                this.showFeedback('🎮 Welcome to the Hunter Program! Check your email for updates.', 'success');
                this.form.reset();
            }
        } else {
            // Fallback: log to console if no script URL configured
            console.log('Beta signup (no endpoint configured):', email);
            this.showFeedback('🎮 Welcome to the Hunter Program! Check your email for updates.', 'success');
            this.form.reset();
        }

        this.setLoading(false);
    }

    validateEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    setLoading(loading) {
        if (loading) {
            this.btnText.style.display = 'none';
            this.btnLoading.style.display = 'inline';
            this.submitBtn.disabled = true;
        } else {
            this.btnText.style.display = 'inline';
            this.btnLoading.style.display = 'none';
            this.submitBtn.disabled = false;
        }
    }

    showFeedback(message, type) {
        this.feedback.textContent = message;
        this.feedback.className = 'form-feedback ' + type;

        // Auto-hide after 5 seconds
        setTimeout(() => {
            this.feedback.className = 'form-feedback';
        }, 5000);
    }
}

// ============================================================================
// DOWNLOAD HANDLER
// ============================================================================

class DownloadHandler {
    constructor() {
        this.downloadBtn = document.getElementById('download-btn');
        this.downloadHeroBtn = document.getElementById('download-hero-btn');

        this.init();
    }

    init() {
        // Main download button
        if (this.downloadBtn) {
            this.setupButton(this.downloadBtn);
        }

        // Hero download button
        if (this.downloadHeroBtn) {
            this.setupButton(this.downloadHeroBtn);
        }

        // Update button states on load
        this.updateButtonStates();
    }

    setupButton(button) {
        button.addEventListener('click', (e) => this.handleDownload(e, button));
    }

    handleDownload(e, button) {
        e.preventDefault();

        // Get download URL from localStorage (set by admin)
        const downloadUrl = localStorage.getItem('nextlevel_download_url');

        if (downloadUrl && this.isValidUrl(downloadUrl)) {
            // Open download link in new tab
            window.open(downloadUrl, '_blank');

            // Visual feedback
            button.classList.add('clicked');
            setTimeout(() => button.classList.remove('clicked'), 300);

            console.log('Download initiated:', downloadUrl);
        } else {
            // No URL configured - show message
            this.showNoDownloadMessage(button);
        }
    }

    isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    updateButtonStates() {
        const downloadUrl = localStorage.getItem('nextlevel_download_url');
        const hasValidUrl = downloadUrl && this.isValidUrl(downloadUrl);

        [this.downloadBtn, this.downloadHeroBtn].forEach(btn => {
            if (btn) {
                if (!hasValidUrl) {
                    btn.disabled = true;
                    btn.title = 'Download coming soon';
                } else {
                    btn.disabled = false;
                    btn.title = 'Download the latest version';
                }
            }
        });
    }

    showNoDownloadMessage(button) {
        const originalText = button.querySelector('.btn-text')?.textContent || 'Download Beta';
        const textElement = button.querySelector('.btn-text');

        if (textElement) {
            textElement.textContent = 'Coming Soon...';
            setTimeout(() => {
                textElement.textContent = originalText;
            }, 2000);
        }
    }
}

// ============================================================================
// SMOOTH SCROLL ENHANCEMENT
// ============================================================================

class SmoothScroll {
    constructor() {
        this.init();
    }

    init() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = anchor.getAttribute('href');
                const target = document.querySelector(targetId);

                if (target) {
                    const offsetTop = target.offsetTop - 80; // Account for fixed navbar
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
}

// ============================================================================
// XP BAR ANIMATION
// ============================================================================

class XPAnimation {
    constructor() {
        this.xpFill = document.querySelector('.xp-fill');
        this.statFills = document.querySelectorAll('.stat-fill');

        this.init();
    }

    init() {
        // Animate XP bar when visible
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateBars();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        const levelingSection = document.getElementById('leveling');
        if (levelingSection) {
            observer.observe(levelingSection);
        }
    }

    animateBars() {
        // Animate with slight delay
        if (this.xpFill) {
            this.xpFill.style.width = '0%';
            setTimeout(() => {
                this.xpFill.style.width = getComputedStyle(this.xpFill).getPropertyValue('--xp-percent');
            }, 300);
        }

        this.statFills.forEach((fill, index) => {
            fill.style.width = '0%';
            setTimeout(() => {
                fill.style.width = getComputedStyle(fill).getPropertyValue('--stat-percent');
            }, 500 + (index * 200));
        });
    }
}

// ============================================================================
// BUTTON CLICK EFFECTS
// ============================================================================

class ButtonEffects {
    constructor() {
        this.buttons = document.querySelectorAll('.btn');
        this.init();
    }

    init() {
        this.buttons.forEach(button => {
            button.addEventListener('click', (e) => this.createRipple(e, button));
        });
    }

    createRipple(e, button) {
        const ripple = document.createElement('span');
        ripple.classList.add('ripple');

        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: rippleEffect 0.6s ease-out;
            pointer-events: none;
        `;

        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
    }
}

// Add ripple keyframes dynamically
const rippleStyles = document.createElement('style');
rippleStyles.textContent = `
    @keyframes rippleEffect {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(rippleStyles);

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all modules
    new ParticleSystem('particle-canvas');
    new Navigation();
    new ScrollReveal();
    new BetaForm();
    new DownloadHandler();
    new SmoothScroll();
    new XPAnimation();
    new ButtonEffects();

    console.log('🎮 Next Level - AI Fitness Coach initialized');
    console.log('⚔️ Become the Hunter of your fitness goals!');
});

// ============================================================================
// UTILITY: Check if user is on admin page
// ============================================================================

function isAdminPage() {
    return window.location.pathname.includes('admin');
}
