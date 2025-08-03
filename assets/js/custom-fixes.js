
// Custom fixes for magic cursor and other functionality
$(document).ready(function() {
    // Magic cursor implementation
    const cursor = document.querySelector('.cursor');
    const cursorFollower = document.querySelector('.cursor-follower');
    
    if (cursor && cursorFollower) {
        let mouseX = 0, mouseY = 0;
        let followerX = 0, followerY = 0;
        
        // Show cursor elements
        cursor.style.display = 'block';
        cursorFollower.style.display = 'block';
        
        document.addEventListener('mousemove', function(e) {
            mouseX = e.pageX;
            mouseY = e.pageY;
            
            cursor.style.left = mouseX + 'px';
            cursor.style.top = mouseY + 'px';
        });
        
        function animateFollower() {
            const speed = 0.1;
            followerX += (mouseX - followerX) * speed;
            followerY += (mouseY - followerY) * speed;
            
            cursorFollower.style.left = followerX + 'px';
            cursorFollower.style.top = followerY + 'px';
            requestAnimationFrame(animateFollower);
        }
        
        animateFollower();
        
        // Add cursor effects on hover
        document.querySelectorAll('a, button, .gsap-cursor').forEach(element => {
            element.addEventListener('mouseenter', function() {
                cursor.classList.add('active');
                cursorFollower.classList.add('active');
            });
            
            element.addEventListener('mouseleave', function() {
                cursor.classList.remove('active');
                cursorFollower.classList.remove('active');
            });
        });
    }
    
    // Initialize nice-select only if elements exist
    if (typeof $.fn.niceSelect !== 'undefined' && $('.nice-select').length > 0) {
        $('.nice-select').niceSelect();
    }
});
