// DOM Elements
const darkModeBtn = document.querySelector('.dark-mode');
const body = document.body;
const darkModeIcon = darkModeBtn.querySelector('i');
const darkModeText = darkModeBtn.querySelector('span');

// Check for saved user preference
const darkMode = localStorage.getItem('darkMode');

// Function to update dark mode UI
const updateDarkModeUI = (isDark) => {
    darkModeIcon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    darkModeText.textContent = isDark ? 'Light' : 'Dark';
};

// Apply dark mode if previously saved
if (darkMode === 'enabled') {
    body.classList.add('dark-theme');
    updateDarkModeUI(true);
}

// Dark mode toggle
darkModeBtn.addEventListener('click', () => {
    body.classList.toggle('dark-theme');
    const isDark = body.classList.contains('dark-theme');
    
    localStorage.setItem('darkMode', isDark ? 'enabled' : null);
    updateDarkModeUI(isDark);
});

// Smooth scroll with header offset
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        const headerOffset = 80;
        const elementPosition = target.offsetTop;
        const offsetPosition = elementPosition - headerOffset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    });
});

// Active link highlighting
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-links a');

const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.7
};

const observerCallback = (entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href').slice(1) === entry.target.id) {
                    link.classList.add('active');
                }
            });
        }
    });
};

const observer = new IntersectionObserver(observerCallback, observerOptions);
sections.forEach(section => observer.observe(section));

// Navbar scroll effect
const navbar = document.querySelector('.navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll <= 0) {
        navbar.classList.remove('scroll-up');
        return;
    }
    
    if (currentScroll > lastScroll && !navbar.classList.contains('scroll-down')) {
        navbar.classList.remove('scroll-up');
        navbar.classList.add('scroll-down');
    } else if (currentScroll < lastScroll && navbar.classList.contains('scroll-down')) {
        navbar.classList.remove('scroll-down');
        navbar.classList.add('scroll-up');
    }
    
    lastScroll = currentScroll;
});

// Mobile menu functionality
const menuToggle = document.querySelector('.menu-toggle');
const menuClose = document.querySelector('.menu-close');
const mobileMenu = document.querySelector('.mobile-menu');
const mobileMenuLinks = document.querySelectorAll('.mobile-menu .menu-links a');

const toggleMenu = () => {
    mobileMenu.classList.toggle('active');
    document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
};

menuToggle.addEventListener('click', toggleMenu);
menuClose.addEventListener('click', toggleMenu);

// Close menu when clicking a link
mobileMenuLinks.forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
    });
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (mobileMenu.classList.contains('active') && 
        !mobileMenu.contains(e.target) && 
        !menuToggle.contains(e.target)) {
        toggleMenu();
    }
});

// Projects carousel functionality
const carousel = document.querySelector('.projects-carousel');
const prevBtn = document.querySelector('.carousel-btn.prev');
const nextBtn = document.querySelector('.carousel-btn.next');
const carouselDots = document.querySelector('.carousel-dots');
const cards = document.querySelectorAll('.project-card');

// Create dots and progress bar
const progressBar = document.createElement('div');
progressBar.className = 'carousel-progress';
progressBar.innerHTML = '<div class="progress-bar"></div>';
carousel.parentElement.appendChild(progressBar);

cards.forEach((_, index) => {
    const dot = document.createElement('div');
    dot.classList.add('dot');
    if (index === 0) dot.classList.add('active');
    carouselDots.appendChild(dot);
});

const dots = document.querySelectorAll('.dot');
const progress = document.querySelector('.progress-bar');

// Carousel state
let isDragging = false;
let startPos = 0;
let currentTranslate = 0;
let prevTranslate = 0;
let currentIndex = 0;
let animationID = 0;
let startTime = 0;

// Calculate card width including gap
const cardWidth = cards[0].offsetWidth + 24; // 24px is the gap
const maxScroll = (cards.length - 1) * cardWidth;

// Update UI
const updateUI = (index) => {
    // Update dots
    dots.forEach(dot => dot.classList.remove('active'));
    dots[index].classList.add('active');

    // Update progress bar
    const progress = (index / (cards.length - 1)) * 100;
    document.querySelector('.progress-bar').style.width = `${progress}%`;
};

// Smooth scroll to position
const smoothScrollTo = (position) => {
    carousel.scrollTo({
        left: position,
        behavior: 'smooth'
    });
};

// Handle drag start
const dragStart = (e) => {
    isDragging = true;
    startPos = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
    startTime = Date.now();
    
    carousel.style.cursor = 'grabbing';
    cancelAnimationFrame(animationID);
};

// Handle drag move
const dragMove = (e) => {
    if (!isDragging) return;
    
    e.preventDefault();
    const currentPosition = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
    const diff = currentPosition - startPos;
    
    currentTranslate = prevTranslate + diff;
    setSliderPosition();
};

// Handle drag end
const dragEnd = (e) => {
    isDragging = false;
    const movedBy = currentTranslate - prevTranslate;
    const timeTaken = Date.now() - startTime;
    
    // Quick swipe detection
    if (Math.abs(movedBy) > 100 && timeTaken < 300) {
        if (movedBy < 0 && currentIndex < cards.length - 1) {
            currentIndex++;
        } else if (movedBy > 0 && currentIndex > 0) {
            currentIndex--;
        }
    } else {
        // Snap to nearest card
        currentIndex = Math.round(-currentTranslate / cardWidth);
    }
    
    currentIndex = Math.max(0, Math.min(currentIndex, cards.length - 1));
    smoothScrollTo(currentIndex * cardWidth);
    updateUI(currentIndex);
    
    carousel.style.cursor = 'grab';
};

// Set up event listeners
carousel.addEventListener('mousedown', dragStart);
carousel.addEventListener('touchstart', dragStart);

carousel.addEventListener('mousemove', dragMove);
carousel.addEventListener('touchmove', dragMove);

carousel.addEventListener('mouseup', dragEnd);
carousel.addEventListener('touchend', dragEnd);
carousel.addEventListener('mouseleave', dragEnd);

// Navigation buttons
prevBtn?.addEventListener('click', () => {
    if (currentIndex > 0) {
        currentIndex--;
        smoothScrollTo(currentIndex * cardWidth);
        updateUI(currentIndex);
    }
});

nextBtn?.addEventListener('click', () => {
    if (currentIndex < cards.length - 1) {
        currentIndex++;
        smoothScrollTo(currentIndex * cardWidth);
        updateUI(currentIndex);
    }
});

// Dot navigation
dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
        currentIndex = index;
        smoothScrollTo(currentIndex * cardWidth);
        updateUI(currentIndex);
    });
});

// Handle scroll events for sync
carousel.addEventListener('scroll', () => {
    const scrollPercentage = carousel.scrollLeft / maxScroll;
    progress.style.width = `${scrollPercentage * 100}%`;
    
    // Update current index and dots based on scroll position
    currentIndex = Math.round(carousel.scrollLeft / cardWidth);
    updateUI(currentIndex);
});

// Initial setup
updateUI(0); 