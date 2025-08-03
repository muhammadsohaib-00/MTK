// Custom JavaScript fixes for MTK website - Comprehensive responsive and functionality fixes

// Global variables
let currentUser = null;
let isScrolling = false;

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing...');

    // Initialize all components
    initializeMagicCursor();
    initializeSliders();
    initializeMobileMenu();
    initializeScrollEffects();
    initializeResponsiveImages();
    initializeFormValidation();
    initializeAnimations();

    // Fix for events loading
    if (typeof loadHomeEvents === 'function') {
        loadHomeEvents();
    }

    // Fix for authentication
    if (typeof checkAuth === 'function') {
        checkAuth();
    }

    // Initialize nice select if available
    if (typeof $.fn.niceSelect !== 'undefined') {
        $('.nice-select').niceSelect();
    }

    // Initialize magnific popup if available
    if (typeof $.fn.magnificPopup !== 'undefined') {
        $('.popup-image').magnificPopup({
            type: 'image',
            gallery: {
                enabled: true
            }
        });
    }
});

// Magic Cursor Implementation
function initializeMagicCursor() {
    const cursor = document.querySelector('.cursor');
    const cursorFollower = document.querySelector('.cursor-follower');

    if (!cursor || !cursorFollower) {
        console.log('Cursor elements not found, creating them...');
        createCursorElements();
        return;
    }

    let mouseX = 0;
    let mouseY = 0;
    let followerX = 0;
    let followerY = 0;

    document.addEventListener('mousemove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;

        cursor.style.left = mouseX + 'px';
        cursor.style.top = mouseY + 'px';
    });

    // Smooth follower animation
    function animateFollower() {
        followerX += (mouseX - followerX) * 0.1;
        followerY += (mouseY - followerY) * 0.1;

        cursorFollower.style.left = followerX + 'px';
        cursorFollower.style.top = followerY + 'px';

        requestAnimationFrame(animateFollower);
    }

    animateFollower();

    // Cursor interactions
    const interactiveElements = document.querySelectorAll('a, button, .swiper-slide, .gallery-card, .tour-box');

    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            cursor.classList.add('active');
            cursorFollower.classList.add('active');
        });

        element.addEventListener('mouseleave', () => {
            cursor.classList.remove('active');
            cursorFollower.classList.remove('active');
        });
    });
}

function createCursorElements() {
    const magicCursor = document.querySelector('.magic-cursor');
    if (!magicCursor) return;

    const cursor = document.createElement('div');
    cursor.className = 'cursor';
    magicCursor.appendChild(cursor);

    const cursorFollower = document.createElement('div');
    cursorFollower.className = 'cursor-follower';
    magicCursor.appendChild(cursorFollower);

    // Retry initialization
    setTimeout(initializeMagicCursor, 100);
}

// Initialize Swiper sliders with comprehensive responsive settings
function initializeSliders() {
    console.log('Initializing sliders...');

    // Check if Swiper is available
    if (typeof Swiper === 'undefined') {
        console.log('Swiper not found, loading fallback...');
        return;
    }

    // Hero slider
    if (document.querySelector('#heroSlide1')) {
        new Swiper('#heroSlide1', {
            effect: 'fade',
            loop: true,
            autoplay: {
                delay: 5000,
                disableOnInteraction: false,
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            navigation: {
                nextEl: '[data-slider-next="#heroSlide1"]',
                prevEl: '[data-slider-prev="#heroSlide1"]',
            },
        });
    }

    // Category slider
    if (document.querySelector('#categorySlide')) {
        new Swiper('#categorySlide', {
            slidesPerView: 1,
            spaceBetween: 20,
            loop: true,
            autoplay: {
                delay: 3000,
                disableOnInteraction: false,
            },
            breakpoints: {
                480: {
                    slidesPerView: 2,
                    spaceBetween: 20,
                },
                768: {
                    slidesPerView: 3,
                    spaceBetween: 30,
                },
                1024: {
                    slidesPerView: 4,
                    spaceBetween: 30,
                }
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
        });
    }

    // Destination slider
    if (document.querySelector('#aboutSlider1')) {
        new Swiper('#aboutSlider1', {
            slidesPerView: 1,
            spaceBetween: 30,
            centeredSlides: true,
            loop: true,
            autoplay: {
                delay: 4000,
                disableOnInteraction: false,
            },
            effect: 'coverflow',
            coverflowEffect: {
                rotate: 0,
                stretch: 95,
                depth: 212,
                modifier: 1,
                slideShadows: true,
            },
            breakpoints: {
                576: {
                    slidesPerView: 2,
                },
                992: {
                    slidesPerView: 3,
                }
            },
        });
    }

    // Events slider
    if (document.querySelector('#eventsSlider')) {
        new Swiper('#eventsSlider', {
            slidesPerView: 1,
            spaceBetween: 20,
            loop: true,
            autoplay: {
                delay: 3500,
                disableOnInteraction: false,
            },
            breakpoints: {
                576: {
                    slidesPerView: 1,
                    spaceBetween: 20,
                },
                768: {
                    slidesPerView: 2,
                    spaceBetween: 30,
                },
                1200: {
                    slidesPerView: 3,
                    spaceBetween: 30,
                },
                1300: {
                    slidesPerView: 4,
                    spaceBetween: 30,
                }
            },
        });
    }

    // Team slider
    if (document.querySelector('#teamSlider1')) {
        new Swiper('#teamSlider1', {
            slidesPerView: 1,
            spaceBetween: 20,
            loop: true,
            autoplay: {
                delay: 3000,
                disableOnInteraction: false,
            },
            breakpoints: {
                576: {
                    slidesPerView: 1,
                    spaceBetween: 20,
                },
                768: {
                    slidesPerView: 2,
                    spaceBetween: 30,
                },
                992: {
                    slidesPerView: 3,
                    spaceBetween: 30,
                },
                1200: {
                    slidesPerView: 4,
                    spaceBetween: 30,
                }
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
        });
    }

    // Testimonial slider
    if (document.querySelector('#testiSlider1')) {
        new Swiper('#testiSlider1', {
            slidesPerView: 1,
            spaceBetween: 30,
            centeredSlides: true,
            loop: true,
            autoplay: {
                delay: 4000,
                disableOnInteraction: false,
            },
            breakpoints: {
                767: {
                    slidesPerView: 2,
                    centeredSlides: true,
                },
                992: {
                    slidesPerView: 2,
                    centeredSlides: true,
                },
                1400: {
                    slidesPerView: 3,
                    centeredSlides: true,
                }
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
        });
    }
}

// Mobile menu initialization
function initializeMobileMenu() {
    const menuToggle = document.querySelector('.th-menu-toggle');
    const menuWrapper = document.querySelector('.th-menu-wrapper');
    const menuClose = document.querySelector('.th-menu-wrapper .th-menu-toggle');
    const menuLinks = document.querySelectorAll('.th-mobile-menu a');

    if (menuToggle && menuWrapper) {
        menuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            menuWrapper.classList.add('th-body-visible');
            document.body.style.overflow = 'hidden';
        });
    }

    if (menuClose && menuWrapper) {
        menuClose.addEventListener('click', function(e) {
            e.preventDefault();
            menuWrapper.classList.remove('th-body-visible');
            document.body.style.overflow = '';
        });
    }

    // Close menu when clicking on a link
    menuLinks.forEach(link => {
        link.addEventListener('click', () => {
            menuWrapper.classList.remove('th-body-visible');
            document.body.style.overflow = '';
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (menuWrapper && menuWrapper.classList.contains('th-body-visible')) {
            if (!menuWrapper.contains(e.target) && !menuToggle.contains(e.target)) {
                menuWrapper.classList.remove('th-body-visible');
                document.body.style.overflow = '';
            }
        }
    });
}

// Scroll effects
function initializeScrollEffects() {
    // Sticky header
    const header = document.querySelector('.sticky-wrapper');
    let lastScrollTop = 0;

    window.addEventListener('scroll', function() {
        if (isScrolling) return;

        isScrolling = true;
        requestAnimationFrame(() => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

            if (header) {
                if (scrollTop > 100) {
                    header.classList.add('sticky');
                } else {
                    header.classList.remove('sticky');
                }
            }

            lastScrollTop = scrollTop;
            isScrolling = false;
        });
    });

    // Scroll to top button
    const scrollTop = document.querySelector('.scroll-top');
    if (scrollTop) {
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                scrollTop.classList.add('show');
            } else {
                scrollTop.classList.remove('show');
            }
        });

        scrollTop.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// Responsive image handling
function initializeResponsiveImages() {
    function fixImageSizes() {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            if (!img.style.maxWidth) {
                img.style.maxWidth = '100%';
                img.style.height = 'auto';
            }
        });

        const videos = document.querySelectorAll('video');
        videos.forEach(video => {
            video.style.width = '100%';
            video.style.height = '100%';
            video.style.objectFit = 'cover';
        });
    }

    // Initial fix
    fixImageSizes();

    // Fix on window resize
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(fixImageSizes, 100);
    });

    // Fix images that load after page load
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { // Element node
                        const newImages = node.querySelectorAll ? node.querySelectorAll('img') : [];
                        const newVideos = node.querySelectorAll ? node.querySelectorAll('video') : [];

                        newImages.forEach(img => {
                            img.style.maxWidth = '100%';
                            img.style.height = 'auto';
                        });

                        newVideos.forEach(video => {
                            video.style.width = '100%';
                            video.style.height = '100%';
                            video.style.objectFit = 'cover';
                        });
                    }
                });
            }
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });
}

// Form validation
function initializeFormValidation() {
    const forms = document.querySelectorAll('form');

    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
            let isValid = true;

            inputs.forEach(input => {
                if (!input.value.trim()) {
                    input.classList.add('is-invalid');
                    isValid = false;
                } else {
                    input.classList.remove('is-invalid');
                }
            });

            if (!isValid) {
                e.preventDefault();
                console.log('Form validation failed');
            }
        });
    });
}

// Animation initialization
function initializeAnimations() {
    // Counter animation
    const counters = document.querySelectorAll('.counter-number');

    const animateCounter = (counter) => {
        const target = parseInt(counter.textContent);
        const increment = target / 100;
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            counter.textContent = Math.floor(current);

            if (current >= target) {
                counter.textContent = target;
                clearInterval(timer);
            }
        }, 20);
    };

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (entry.target.classList.contains('counter-number')) {
                    animateCounter(entry.target);
                }

                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';

                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll('.counter-number, .tour-box, .category-card, .team-box, .testi-card');

    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
}

// Utility functions
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
    }
}

// Responsive breakpoint detection
function getBreakpoint() {
    const width = window.innerWidth;
    if (width < 576) return 'xs';
    if (width < 768) return 'sm';
    if (width < 992) return 'md';
    if (width < 1200) return 'lg';
    if (width < 1400) return 'xl';
    return 'xxl';
}

// Export functions for external use
window.MTK = {
    initializeSliders,
    initializeMagicCursor,
    getBreakpoint,
    debounce,
    throttle
};

// Error handling
window.addEventListener('error', function(e) {
    console.log('JavaScript error caught:', e.error);
    return true;
});

// Prevent horizontal scroll
function preventHorizontalScroll() {
    document.documentElement.style.overflowX = 'hidden';
    document.body.style.overflowX = 'hidden';
}

// Initialize on load
document.addEventListener('DOMContentLoaded', preventHorizontalScroll);

console.log('Custom fixes loaded successfully');