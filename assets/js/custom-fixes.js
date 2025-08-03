
// Enhanced Custom Fixes JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeMagicCursor();
    initializeFormEnhancements();
    initializeScrollEnhancements();
    initializeAccessibilityFeatures();

    // Safe intersection observer initialization
    if ('IntersectionObserver' in window) {
        const elements = document.querySelectorAll('[data-ani]');
        if (elements.length > 0) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && entry.target instanceof Element) {
                        entry.target.classList.add('animated');
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            });

            elements.forEach(element => {
                if (element instanceof Element) {
                    observer.observe(element);
                }
            });
        }
    }
});

function initializeMagicCursor() {
    // Only initialize on non-touch devices
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        const cursor = document.querySelector('.cursor');
        const follower = document.querySelector('.cursor-follower');

        if (cursor && follower) {
            let posX = 0, posY = 0, mouseX = 0, mouseY = 0;

            // Hide default cursor globally
            document.body.style.cursor = 'none';
            document.documentElement.style.cursor = 'none';

            // Update cursor position immediately
            document.addEventListener('mousemove', (e) => {
                mouseX = e.clientX;
                mouseY = e.clientY;
                
                // Update cursor position immediately
                cursor.style.left = mouseX + 'px';
                cursor.style.top = mouseY + 'px';
                cursor.style.transform = 'translate(-50%, -50%)';
            });

            // Smooth follower animation
            function animateFollower() {
                const delay = 0.08;
                posX += (mouseX - posX) * delay;
                posY += (mouseY - posY) * delay;

                follower.style.left = posX + 'px';
                follower.style.top = posY + 'px';
                follower.style.transform = 'translate(-50%, -50%)';

                requestAnimationFrame(animateFollower);
            }
            animateFollower();

            // Enhanced hover effects for all interactive elements
            const hoverElements = document.querySelectorAll('a, button, .btn, .th-btn, input[type="submit"], input[type="button"], .filter-tab, .swiper-slide, .gallery-card, .team-box, .tour-box, .icon-btn, .play-btn, .th-social a, .link-btn, .line-btn, .nav-link, .dropdown-item, [role="button"], [onclick], .clickable');

            hoverElements.forEach(element => {
                element.addEventListener('mouseenter', () => {
                    cursor.classList.add('active');
                    follower.classList.add('active');
                });

                element.addEventListener('mouseleave', () => {
                    cursor.classList.remove('active');
                    follower.classList.remove('active');
                });
            });

            // Show cursors when mouse is over the page
            document.addEventListener('mouseenter', () => {
                cursor.style.opacity = '1';
                follower.style.opacity = '1';
            });

            // Hide cursors when mouse leaves the page
            document.addEventListener('mouseleave', () => {
                cursor.style.opacity = '0';
                follower.style.opacity = '0';
            });

            // Initialize visibility
            cursor.style.opacity = '1';
            follower.style.opacity = '1';
        }
    }
}

// Enhanced Form Features
function initializeFormEnhancements() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('focus', function() {
                this.parentElement.classList.add('focused');
            });

            input.addEventListener('blur', function() {
                if (!this.value) {
                    this.parentElement.classList.remove('focused');
                }
            });
        });
    });
}

// Enhanced Scroll Features
function initializeScrollEnhancements() {
    let ticking = false;

    function updateScrollElements() {
        const scrolled = window.pageYOffset;

        // Parallax effect for elements with data-speed attribute
        const parallaxElements = document.querySelectorAll('[data-speed]');
        parallaxElements.forEach(element => {
            const speed = element.getAttribute('data-speed');
            const yPos = -(scrolled * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });

        ticking = false;
    }

    window.addEventListener('scroll', function() {
        if (!ticking) {
            requestAnimationFrame(updateScrollElements);
            ticking = true;
        }
    });
}

// Enhanced Accessibility Features
function initializeAccessibilityFeatures() {
    // Add focus indicators
    const focusableElements = document.querySelectorAll('a, button, input, select, textarea, [tabindex]');
    focusableElements.forEach(element => {
        element.addEventListener('focus', function() {
            this.classList.add('focused');
        });

        element.addEventListener('blur', function() {
            this.classList.remove('focused');
        });
    });

    // Keyboard navigation for sliders
    const sliders = document.querySelectorAll('.swiper-container');
    sliders.forEach(slider => {
        slider.addEventListener('keydown', function(e) {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                if (slider.swiper) slider.swiper.slidePrev();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                if (slider.swiper) slider.swiper.slideNext();
            }
        });
    });
}

// Form validation function
function validateField(field) {
    const value = field.value.trim();
    const type = field.type;
    let isValid = true;
    let message = '';

    // Check if field is required and empty
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        message = 'This field is required';
    }

    // Email validation
    if (type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
            message = 'Please enter a valid email address';
        }
    }

    // Phone validation
    if (type === 'tel' && value) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(value.replace(/\s/g, ''))) {
            isValid = false;
            message = 'Please enter a valid phone number';
        }
    }

    // Update field appearance
    if (isValid) {
        field.classList.remove('is-invalid');
        field.classList.add('is-valid');
    } else {
        field.classList.remove('is-valid');
        field.classList.add('is-invalid');
    }

    return { isValid, message };
}

// Enhanced Loading States
function showLoading(element) {
    element.classList.add('loading');
    element.setAttribute('aria-busy', 'true');
}

function hideLoading(element) {
    element.classList.remove('loading');
    element.removeAttribute('aria-busy');
}

// Enhanced Error Handling
function showError(message, container) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger';
    errorDiv.textContent = message;
    errorDiv.setAttribute('role', 'alert');

    container.appendChild(errorDiv);

    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// Enhanced Success Messages
function showSuccess(message, container) {
    const successDiv = document.createElement('div');
    successDiv.className = 'alert alert-success';
    successDiv.textContent = message;
    successDiv.setAttribute('role', 'alert');

    container.appendChild(successDiv);

    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function for scroll events
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Export functions for use in other scripts
window.MTKUtils = {
    showLoading,
    hideLoading,
    showError,
    showSuccess,
    debounce,
    throttle
};

// Enhanced notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
        </div>
    `;

    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#667eea'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        max-width: 300px;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Add CSS for notifications and cursor improvements
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }

    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }

    .notification-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
    }

    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 18px;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .th-header.scrolled {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
    }

    /* Enhanced cursor styles */
    .cursor {
        position: fixed;
        width: 8px;
        height: 8px;
        background: #667eea;
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999999;
        mix-blend-mode: difference;
        transition: transform 0.15s ease-out;
    }

    .cursor-follower {
        position: fixed;
        width: 40px;
        height: 40px;
        border: 2px solid #667eea;
        border-radius: 50%;
        pointer-events: none;
        z-index: 999998;
        transition: transform 0.15s ease-out, border-color 0.15s ease-out;
    }

    .cursor.active {
        transform: translate(-50%, -50%) scale(1.5) !important;
    }

    .cursor-follower.active {
        transform: translate(-50%, -50%) scale(1.2) !important;
        border-color: #764ba2;
    }

    /* Hide cursor on touch devices */
    @media (hover: none) and (pointer: coarse) {
        .cursor, .cursor-follower {
            display: none !important;
        }
    }
`;
document.head.appendChild(notificationStyles);

// Export functions for global use
window.showNotification = showNotification;
window.validateField = validateField;
