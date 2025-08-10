
// MTK Custom Fixes JavaScript
// Colorful enhancements and cursor disabling

document.addEventListener('DOMContentLoaded', function() {
    
    // Disable all cursor-related functionality
    const cursors = document.querySelectorAll('.magic-cursor, .cursor, .cursor-follower, .mouse-pointer');
    cursors.forEach(cursor => {
        if (cursor) {
            cursor.style.display = 'none';
            cursor.style.visibility = 'hidden';
            cursor.style.opacity = '0';
            cursor.style.pointerEvents = 'none';
        }
    });

    // Enhanced category slider centering
    function initializeCategorySlider() {
        const categorySlider = document.getElementById('categorySlide');
        if (categorySlider && categorySlider.swiper) {
            // Initialize slider to start from center
            const totalSlides = categorySlider.swiper.slides.length;
            const centerIndex = Math.floor(totalSlides / 2);

            categorySlider.swiper.slideTo(centerIndex, 0);
            categorySlider.swiper.update();

            // Force center alignment
            const swiperWrapper = categorySlider.querySelector('.swiper-wrapper');
            if (swiperWrapper) {
                swiperWrapper.style.justifyContent = 'center';
                swiperWrapper.style.alignItems = 'center';
                swiperWrapper.style.display = 'flex';
            }

            // Handle slide events to maintain centering
            categorySlider.swiper.on('slideChange', function () {
                this.update();
            });
        }
    }

    // Initialize slider with delay to ensure swiper is loaded
    setTimeout(initializeCategorySlider, 500);
    setTimeout(initializeCategorySlider, 1000);
    setTimeout(initializeCategorySlider, 2000);

    // Add colorful scroll animations
    function addScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        // Observe elements for animation
        const animateElements = document.querySelectorAll('.category-card, .counter-card, .th-team, .testi-card, .gallery-card');
        animateElements.forEach(el => {
            if (el) {
                el.style.opacity = '0';
                el.style.transform = 'translateY(30px)';
                el.style.transition = 'all 0.6s ease';
                observer.observe(el);
            }
        });
    }

    // Add rainbow text effect to titles
    function addRainbowEffect() {
        const titles = document.querySelectorAll('.sec-title, .hero-title, .breadcumb-title');
        titles.forEach(title => {
            if (title && !title.classList.contains('rainbow-animated')) {
                title.classList.add('rainbow-animated');
                title.style.background = 'linear-gradient(135deg, #FF6B9D, #4ECDC4, #45B7D1, #FFB74D, #9C27B0)';
                title.style.backgroundSize = '400% 400%';
                title.style.webkitBackgroundClip = 'text';
                title.style.webkitTextFillColor = 'transparent';
                title.style.backgroundClip = 'text';
                title.style.animation = 'rainbow-gradient 3s ease infinite';
            }
        });
    }

    // Add CSS for rainbow gradient animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes rainbow-gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }

        .bounce-on-hover:hover {
            animation: bounce-effect 0.6s ease;
        }

        @keyframes bounce-effect {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-10px); }
            60% { transform: translateY(-5px); }
        }
    `;
    document.head.appendChild(style);

    // Add bounce effect to interactive elements
    function addBounceEffects() {
        const bounceElements = document.querySelectorAll('.category-card, .th-btn, .counter-card');
        bounceElements.forEach(el => {
            if (el) {
                el.classList.add('bounce-on-hover');
            }
        });
    }

    // Enhanced destination slider initialization
    function enhanceDestinationSlider() {
        const destSlider = document.getElementById('aboutSlider1');
        if (destSlider && destSlider.swiper) {
            destSlider.swiper.on('slideChange', function () {
                // Add active slide effects
                const slides = this.slides;
                slides.forEach((slide, index) => {
                    if (index === this.activeIndex) {
                        slide.style.transform = 'scale(1.05)';
                        slide.style.zIndex = '10';
                    } else {
                        slide.style.transform = 'scale(0.9)';
                        slide.style.zIndex = '1';
                    }
                });
            });
        }
    }

    // Initialize all enhancements
    setTimeout(() => {
        addScrollAnimations();
        addRainbowEffect();
        addBounceEffects();
        enhanceDestinationSlider();
    }, 100);

    // Re-initialize on window resize
    window.addEventListener('resize', function() {
        setTimeout(initializeCategorySlider, 300);
    });

    // Add emoji floating animation
    function addEmojiAnimations() {
        const emojis = ['🎭', '🎤', '💃', '🎵', '✨', '🌟', '🎨', '🎪'];
        let emojiCount = 0;

        setInterval(() => {
            if (emojiCount < 3) { // Limit number of floating emojis
                const emoji = document.createElement('div');
                emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
                emoji.style.position = 'fixed';
                emoji.style.fontSize = '2rem';
                emoji.style.left = Math.random() * window.innerWidth + 'px';
                emoji.style.top = window.innerHeight + 'px';
                emoji.style.zIndex = '9999';
                emoji.style.pointerEvents = 'none';
                emoji.style.animation = `float-up 4s ease-out forwards`;

                document.body.appendChild(emoji);
                emojiCount++;

                setTimeout(() => {
                    if (emoji.parentNode) {
                        emoji.parentNode.removeChild(emoji);
                        emojiCount--;
                    }
                }, 4000);
            }
        }, 3000);
    }

    // Add floating emoji CSS
    const emojiStyle = document.createElement('style');
    emojiStyle.textContent = `
        @keyframes float-up {
            0% {
                transform: translateY(0) rotate(0deg);
                opacity: 1;
            }
            100% {
                transform: translateY(-100vh) rotate(360deg);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(emojiStyle);

    // Start emoji animations after page load
    setTimeout(addEmojiAnimations, 3000);

    // Add sparkle effect on scroll
    function addSparkleEffect() {
        let sparkleTimer;

        window.addEventListener('scroll', () => {
            clearTimeout(sparkleTimer);
            sparkleTimer = setTimeout(() => {
                const sparkle = document.createElement('div');
                sparkle.innerHTML = '✨';
                sparkle.style.position = 'fixed';
                sparkle.style.right = '20px';
                sparkle.style.top = '50%';
                sparkle.style.fontSize = '1.5rem';
                sparkle.style.zIndex = '9999';
                sparkle.style.pointerEvents = 'none';
                sparkle.style.animation = 'sparkle-fade 1s ease-out forwards';

                document.body.appendChild(sparkle);

                setTimeout(() => {
                    if (sparkle.parentNode) {
                        sparkle.parentNode.removeChild(sparkle);
                    }
                }, 1000);
            }, 100);
        });
    }

    // Add sparkle CSS
    const sparkleStyle = document.createElement('style');
    sparkleStyle.textContent = `
        @keyframes sparkle-fade {
            0% {
                opacity: 1;
                transform: scale(1) rotate(0deg);
            }
            100% {
                opacity: 0;
                transform: scale(1.5) rotate(180deg);
            }
        }
    `;
    document.head.appendChild(sparkleStyle);

    // Initialize sparkle effect
    addSparkleEffect();
});

// Ensure swiper initialization happens correctly
document.addEventListener('swiperInitialized', function() {
    setTimeout(() => {
        const categorySlider = document.getElementById('categorySlide');
        if (categorySlider && categorySlider.swiper) {
            const totalSlides = categorySlider.swiper.slides.length;
            const centerIndex = Math.floor(totalSlides / 2);
            categorySlider.swiper.slideTo(centerIndex, 0);
        }
    }, 100);
});
