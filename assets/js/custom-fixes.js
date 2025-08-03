
// Custom fixes for magic cursor and other functionality
$(document).ready(function() {
    // Magic cursor implementation
    if ($('.magic-cursor').length > 0) {
        const cursor = document.querySelector('.cursor');
        const cursorFollower = document.querySelector('.cursor-follower');
        
        if (cursor && cursorFollower) {
            let mouseX = 0, mouseY = 0;
            let followerX = 0, followerY = 0;
            
            document.addEventListener('mousemove', function(e) {
                mouseX = e.clientX;
                mouseY = e.clientY;
                
                cursor.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
            });
            
            function animateFollower() {
                const speed = 0.1;
                followerX += (mouseX - followerX) * speed;
                followerY += (mouseY - followerY) * speed;
                
                cursorFollower.style.transform = `translate(${followerX}px, ${followerY}px)`;
                requestAnimationFrame(animateFollower);
            }
            
            animateFollower();
            
            // Add cursor effects on hover
            document.querySelectorAll('a, button, .gsap-cursor').forEach(element => {
                element.addEventListener('mouseenter', function() {
                    cursor.classList.add('cursor-hover');
                    cursorFollower.classList.add('cursor-hover');
                });
                
                element.addEventListener('mouseleave', function() {
                    cursor.classList.remove('cursor-hover');
                    cursorFollower.classList.remove('cursor-hover');
                });
            });
        }
    }
    
    // Initialize nice-select only if elements exist
    if (typeof $.fn.niceSelect !== 'undefined' && $('.nice-select').length > 0) {
        $('.nice-select').niceSelect();
    }
});
