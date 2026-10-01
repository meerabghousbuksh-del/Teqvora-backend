document.addEventListener('DOMContentLoaded', () => {

    // --- 1. SCROLL REVEAL ANIMATION LOGIC ---
    const revealElements = document.querySelectorAll('.scroll-reveal');

    const revealOnScroll = () => {
        const triggerBottom = window.innerHeight * 0.85;

        revealElements.forEach(el => {
            const elTop = el.getBoundingClientRect().top;
            const delay = el.getAttribute('data-delay') || 0;

            if (elTop < triggerBottom) {
                setTimeout(() => {
                    el.classList.add('revealed');
                }, delay);
            }
        });
    };

    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Initial check


    // --- 2. INTERACTIVE 3D TILT EFFECT ON MOUSEMOVE ---
    const cards = document.querySelectorAll('.card-3d');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -10;
            const rotateY = ((x - centerX) / centerX) * 10;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)`;
        });
    });
});
// cursor
let lastX = 0;
        let lastY = 0;

        window.addEventListener('mousemove', function(e) {
            const distX = e.pageX - lastX;
            const distY = e.pageY - lastY;
            const distance = Math.hypot(distX, distY);

            // Distance / 2 kiya hai taaki chote dots ke beech gap na bane
            const steps = Math.max(1, Math.floor(distance / 2));

            for (let i = 0; i < steps; i++) {
                const x = lastX + (distX / steps) * i;
                const y = lastY + (distY / steps) * i;

                createTrailDot(x, y);
            }

            lastX = e.pageX;
            lastY = e.pageY;
        });

        function createTrailDot(x, y) {
            const trail = document.createElement('div');
            trail.className = 'trail';
            trail.style.left = x + 'px';
            trail.style.top = y + 'px';

            document.body.appendChild(trail);

            setTimeout(() => {
                trail.remove();
            }, 400); // Fast animation time for sleeker look
        }