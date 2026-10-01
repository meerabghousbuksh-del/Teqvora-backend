/* =============================================================
   TEQVORA — ADVANCED ANIMATED & OPTIMIZED JAVASCRIPT
============================================================= */

document.addEventListener('DOMContentLoaded', function () {

    /* ---------------------------------------------------------
       0. REMOVE UNWANTED AVATAR IMAGES + SAFE IMAGE FALLBACK
    --------------------------------------------------------- */

    document.querySelectorAll('img').forEach(function (img) {

        var src = img.getAttribute('src') || '';

        /* Remove avatar-1.jpg, avatar-2.jpg ... avatar-10.jpg */
        if (/avatar-\d+\.jpg$/i.test(src)) {
            img.remove();
            return;
        }

        img.addEventListener('error', function () {
            img.classList.add('img-fallback');
        });

    });


    /* ---------------------------------------------------------
       1. NAVBAR SCROLL STATE (Optimized Frame Throttling)
    --------------------------------------------------------- */

    var header = document.querySelector('.site-header');
    var isTicking = false;

    function updateHeaderState() {
        if (!header) return;

        if (window.scrollY > 20) {
            header.classList.add('is-scrolled');
        } else {
            header.classList.remove('is-scrolled');
        }

        isTicking = false;
    }

    window.addEventListener('scroll', function () {
        if (!isTicking) {
            window.requestAnimationFrame(updateHeaderState);
            isTicking = true;
        }
    }, { passive: true });


    /* ---------------------------------------------------------
       2. SERVICES DROPDOWN
    --------------------------------------------------------- */

    var dropdown = document.querySelector('.nav-dropdown');
    var dropdownBtn = document.querySelector('.nav-dropdown-btn');

    if (dropdown && dropdownBtn) {

        dropdownBtn.addEventListener('click', function (e) {

            e.stopPropagation();

            var isOpen =
                dropdown.classList.contains('is-open');

            dropdown.classList.toggle(
                'is-open',
                !isOpen
            );

            dropdownBtn.setAttribute(
                'aria-expanded',
                String(!isOpen)
            );

        });


        document.addEventListener('click', function (e) {

            if (!dropdown.contains(e.target)) {

                dropdown.classList.remove('is-open');

                dropdownBtn.setAttribute(
                    'aria-expanded',
                    'false'
                );

            }

        });

    }


    /* ---------------------------------------------------------
       3. MOBILE DRAWER WITH SMOOTH GSAP ENTRANCE
    --------------------------------------------------------- */

    var menuToggle =
        document.getElementById('menuToggle');

    var mobileDrawer =
        document.getElementById('mobileDrawer');

    var drawerClose =
        document.getElementById('drawerClose');

    var drawerOverlay =
        document.getElementById('drawerOverlay');

    var mobileNavLinks =
        document.querySelectorAll('.mobile-nav a');


    function openDrawer() {

        if (!mobileDrawer) return;

        mobileDrawer.classList.add('is-open');

        if (drawerOverlay) {
            drawerOverlay.classList.add('is-active');
        }

        document.body.classList.add('drawer-open');


        if (window.gsap) {

            gsap.fromTo(
                '.mobile-nav a, .mobile-nav-cta',

                { opacity: 0, x: 30 },

                {
                    opacity: 1,
                    x: 0,
                    duration: 0.4,
                    stagger: 0.08,
                    ease: 'power3.out'
                }
            );

        }

    }


    function closeDrawer() {

        if (!mobileDrawer) return;

        mobileDrawer.classList.remove('is-open');

        if (drawerOverlay) {
            drawerOverlay.classList.remove('is-active');
        }

        document.body.classList.remove('drawer-open');

    }


    if (menuToggle) {
        menuToggle.addEventListener(
            'click',
            openDrawer
        );
    }

    if (drawerClose) {
        drawerClose.addEventListener(
            'click',
            closeDrawer
        );
    }

    if (drawerOverlay) {
        drawerOverlay.addEventListener(
            'click',
            closeDrawer
        );
    }

    mobileNavLinks.forEach(function (link) {
        link.addEventListener(
            'click',
            closeDrawer
        );
    });


    /* ---------------------------------------------------------
       4. FAQ ACCORDION (Enhanced Spring Height Transition)
    --------------------------------------------------------- */

    var faqItems =
        document.querySelectorAll('.faq-item');


    faqItems.forEach(function (item) {

        var question =
            item.querySelector('.faq-question');

        var answer =
            item.querySelector('.faq-answer');


        if (!question || !answer) return;


        question.addEventListener('click', function () {

            var isOpen =
                item.classList.contains('is-open');


            faqItems.forEach(function (other) {

                if (
                    other !== item &&
                    other.classList.contains('is-open')
                ) {

                    other.classList.remove('is-open');

                    var otherAns =
                        other.querySelector('.faq-answer');


                    if (otherAns) {

                        if (window.gsap) {

                            gsap.to(
                                otherAns,
                                {
                                    height: 0,
                                    duration: 0.35,
                                    ease: 'power2.inOut'
                                }
                            );

                        } else {

                            otherAns.style.height =
                                '0px';

                        }

                    }

                }

            });


            if (isOpen) {

                item.classList.remove('is-open');

                if (window.gsap) {

                    gsap.to(
                        answer,
                        {
                            height: 0,
                            duration: 0.35,
                            ease: 'power2.inOut'
                        }
                    );

                } else {

                    answer.style.height =
                        '0px';

                }

            } else {

                item.classList.add('is-open');

                if (window.gsap) {

                    gsap.fromTo(
                        answer,
                        { height: 0 },
                        {
                            height: 'auto',
                            duration: 0.45,
                            ease: 'power2.out'
                        }
                    );

                } else {

                    answer.style.height =
                        'auto';

                }

            }

        });

    });


    /* ---------------------------------------------------------
       5. ADVANCED GSAP & SCROLLTRIGGER ENGINE
    --------------------------------------------------------- */

    if (window.gsap) {

        if (window.ScrollTrigger) {
            gsap.registerPlugin(ScrollTrigger);
        }


        /* --- Hero Entrance Timeline --- */

        var heroTl =
            gsap.timeline({
                defaults: {
                    ease: 'power4.out',
                    duration: 1
                }
            });


        heroTl

            .from(
                '.site-header',
                {
                    y: -60,
                    opacity: 0
                }
            )

            .from(
                '.hero-content .eyebrow',
                {
                    y: 30,
                    opacity: 0
                },
                '-=0.6'
            )

            .from(
                '.hero-content h1',
                {
                    y: 40,
                    opacity: 0,
                    duration: 1.2
                },
                '-=0.7'
            )

            .from(
                '.hero-description',
                {
                    y: 20,
                    opacity: 0
                },
                '-=0.8'
            )

            .from(
                '.hero-actions .btn',
                {
                    y: 20,
                    opacity: 0,
                    stagger: 0.15
                },
                '-=0.7'
            )

            .from(
                '.hero-image-wrap',
                {
                    scale: 0.85,
                    opacity: 0,
                    duration: 1.4,
                    ease: 'expo.out'
                },
                '-=1'
            );


        /* --- Parallax Floating Hero Cards --- */

        gsap.utils
            .toArray('.metric-card')
            .forEach(function (card, i) {

                gsap.to(card, {

                    y: i % 2 === 0
                        ? -25
                        : 25,

                    duration: 3 + i,

                    repeat: -1,

                    yoyo: true,

                    ease: 'sine.inOut'

                });

            });


        /* --- Staggered Scroll Reveals (Grid Batching) --- */

        var animateSelectors = [
            '.service-card',
            '.portfolio-card',
            '.package-card',
            '.why-feature',
            '.highlight-item'
        ];


        animateSelectors.forEach(function (selector) {

            var elements =
                gsap.utils.toArray(selector);

            if (!elements.length) return;


            ScrollTrigger.batch(
                elements,
                {

                    start: 'top 85%',

                    onEnter: function (batch) {

                        gsap.fromTo(
                            batch,

                            {
                                y: 50,
                                opacity: 0,
                                scale: 0.95
                            },

                            {
                                y: 0,
                                opacity: 1,
                                scale: 1,
                                duration: 0.8,
                                stagger: 0.15,
                                ease: 'power3.out',
                                overwrite: 'auto'
                            }
                        );

                    }

                }
            );

        });


        /* --- Image Parallax Effect on Scroll --- */

        gsap.utils
            .toArray(
                '.about-image, .success-visual'
            )
            .forEach(function (visual) {

                gsap.fromTo(

                    visual,

                    { y: 60 },

                    {
                        y: -40,

                        ease: 'none',

                        scrollTrigger: {

                            trigger: visual,

                            start: 'top bottom',

                            end: 'bottom top',

                            scrub: 1.2

                        }

                    }

                );

            });


        /* --- Micro-interactions (Hover Elevate) --- */

        var hoverCards =
            document.querySelectorAll(
                '.service-card, .portfolio-card, .btn'
            );


        hoverCards.forEach(function (card) {

            card.addEventListener(
                'mouseenter',
                function () {

                    gsap.to(
                        card,
                        {
                            y: -8,
                            scale: 1.01,
                            duration: 0.3,
                            ease: 'power2.out'
                        }
                    );

                }
            );


            card.addEventListener(
                'mouseleave',
                function () {

                    gsap.to(
                        card,
                        {
                            y: 0,
                            scale: 1,
                            duration: 0.3,
                            ease: 'power2.out'
                        }
                    );

                }
            );

        });


    } else {

        /* Fallback if GSAP is not loaded */

        document.body.classList.add(
            'no-gsap'
        );

    }

});


/* ---------------------------------------------------------
   5. TESTIMONIAL SWIPER
--------------------------------------------------------- */

if (typeof Swiper !== 'undefined') {

    var testimonialSwiperElement =
        document.querySelector(
            '.testimonial-swiper'
        );


    if (testimonialSwiperElement) {

        var testimonialSwiper =
            new Swiper(
                '.testimonial-swiper',
                {

                    /* =========================
                       BASIC SETTINGS
                    ========================= */

                    slidesPerView: 1,

                    spaceBetween: 24,

                    speed: 700,

                    loop: true,

                    grabCursor: true,


                    /* =========================
                       AUTOPLAY
                    ========================= */

                    autoplay: {

                        delay: 4500,

                        disableOnInteraction:
                            false,

                        pauseOnMouseEnter:
                            true

                    },


                    /* =========================
                       ARROWS
                    ========================= */

                    navigation: {

                        nextEl:
                            '.testimonial-next',

                        prevEl:
                            '.testimonial-prev'

                    },


                    /* =========================
                       PAGINATION
                    ========================= */

                    pagination: {

                        el:
                            '.testimonial-pagination',

                        clickable:
                            true

                    },


                    /* =========================
                       RESPONSIVE
                    ========================= */

                    breakpoints: {

                        /* Mobile */

                        0: {

                            slidesPerView: 1,

                            spaceBetween: 18

                        },


                        /* Tablet */

                        768: {

                            slidesPerView: 2,

                            spaceBetween: 24

                        },


                        /* Desktop */

                        1100: {

                            slidesPerView: 3,

                            spaceBetween: 28

                        }

                    }

                }
            );

    }

} else {

    console.warn(
        'Swiper.js is not loaded. Check the Swiper CDN script.'
    );

}
 let lastX = 0;
        let lastY = 0;

        window.addEventListener('mousemove', function(e) {
            // Calculate distance between mouse points to fill gaps
            const distX = e.pageX - lastX;
            const distY = e.pageY - lastY;
            const distance = Math.hypot(distX, distY);

            // Interpolation: Fill gaps when cursor moves fast
            const steps = Math.max(1, Math.floor(distance / 3));

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
            }, 500);
        }
        document.addEventListener("DOMContentLoaded", function() {
    const progressBar = document.getElementById("dashedProgress");
    const preloader = document.getElementById("preloader");
    
    let currentProgress = 0;

    // Loading progress simulator
    const interval = setInterval(() => {
        // Random progress increment (smooth feel ke liye)
        currentProgress += Math.floor(Math.random() * 12) + 5;

        if (currentProgress >= 100) {
            currentProgress = 100;
            progressBar.style.width = currentProgress + "%";
            clearInterval(interval);

            // Loading complete hone ke 300ms baad fade-out karein
            setTimeout(() => {
                preloader.classList.add("hide");
            }, 300);
        } else {
            progressBar.style.width = currentProgress + "%";
        }
    }, 120); // Har 120ms par progress update hoga
});