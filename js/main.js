/* =====================================================
   ALISTAIR ROBERTSON - COMPOSER WEBSITE
   Main JavaScript
   ===================================================== */

(function() {
    'use strict';

    // =====================================================
    // DOM Elements
    // =====================================================
    const elements = {
        navLinks: document.querySelectorAll('.nav-link'),
        sections: document.querySelectorAll('section[id]'),
        creditsBtn: document.getElementById('creditsBtn'),
        creditsModal: document.getElementById('creditsModal'),
        modalClose: document.getElementById('modalClose'),
        playBtn: document.getElementById('playBtn'),
        prevBtn: document.getElementById('prevBtn'),
        nextBtn: document.getElementById('nextBtn'),
        tracks: document.querySelectorAll('.track'),
        progressBar: document.querySelector('.progress-bar'),
        progress: document.querySelector('.progress'),
        currentTimeEl: document.querySelector('.current-time'),
        totalTimeEl: document.querySelector('.total-time'),
        nowPlayingTitle: document.querySelector('.now-playing-title')
    };

    // =====================================================
    // State
    // =====================================================
    const state = {
        currentTrack: 0,
        isPlaying: false,
        progress: 0,
        audio: null
    };

    // =====================================================
    // Smooth Scroll Navigation
    // =====================================================
    function initSmoothScroll() {
        elements.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    const navHeight = document.querySelector('.sticky-nav').offsetHeight;
                    const targetPosition = targetSection.offsetTop - navHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // =====================================================
    // Active Navigation on Scroll
    // =====================================================
    function initScrollSpy() {
        const observerOptions = {
            root: null,
            rootMargin: '-20% 0px -70% 0px',
            threshold: 0
        };

        const observerCallback = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    updateActiveNav(id);
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);

        elements.sections.forEach(section => {
            observer.observe(section);
        });
    }

    function updateActiveNav(activeId) {
        elements.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${activeId}`) {
                link.classList.add('active');
            }
        });
    }

    // =====================================================
    // Credits Modal
    // =====================================================
    function initCreditsModal() {
        if (!elements.creditsBtn || !elements.creditsModal) return;

        elements.creditsBtn.addEventListener('click', openModal);
        elements.modalClose.addEventListener('click', closeModal);
        
        elements.creditsModal.addEventListener('click', (e) => {
            if (e.target === elements.creditsModal) {
                closeModal();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && elements.creditsModal.classList.contains('active')) {
                closeModal();
            }
        });
    }

    function openModal() {
        elements.creditsModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        elements.creditsModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // =====================================================
    // Music Player (UI Only - Placeholder)
    // =====================================================
    function initMusicPlayer() {
        if (!elements.playBtn) return;

        // Play/Pause button
        elements.playBtn.addEventListener('click', togglePlay);

        // Previous/Next buttons
        if (elements.prevBtn) {
            elements.prevBtn.addEventListener('click', playPrevious);
        }
        if (elements.nextBtn) {
            elements.nextBtn.addEventListener('click', playNext);
        }

        // Track selection
        elements.tracks.forEach((track, index) => {
            track.addEventListener('click', () => {
                selectTrack(index);
            });
        });

        // Progress bar click
        if (elements.progressBar) {
            elements.progressBar.addEventListener('click', seekTrack);
        }

        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            switch(e.code) {
                case 'Space':
                    e.preventDefault();
                    togglePlay();
                    break;
                case 'ArrowLeft':
                    playPrevious();
                    break;
                case 'ArrowRight':
                    playNext();
                    break;
            }
        });
    }

    function togglePlay() {
        state.isPlaying = !state.isPlaying;
        updatePlayButton();
        
        if (state.isPlaying) {
            simulateProgress();
        }
    }

    function updatePlayButton() {
        const playIcon = elements.playBtn.querySelector('.play-icon');
        const pauseIcon = elements.playBtn.querySelector('.pause-icon');
        
        if (state.isPlaying) {
            playIcon.classList.add('hidden');
            pauseIcon.classList.remove('hidden');
        } else {
            playIcon.classList.remove('hidden');
            pauseIcon.classList.add('hidden');
        }
    }

    function selectTrack(index) {
        state.currentTrack = index;
        state.progress = 0;
        
        // Update active track styling
        elements.tracks.forEach((track, i) => {
            track.classList.toggle('active', i === index);
        });

        // Update now playing
        const trackTitle = elements.tracks[index].querySelector('.track-title').textContent;
        const trackDuration = elements.tracks[index].querySelector('.track-duration').textContent;
        
        if (elements.nowPlayingTitle) {
            elements.nowPlayingTitle.textContent = trackTitle;
        }
        if (elements.totalTimeEl) {
            elements.totalTimeEl.textContent = trackDuration;
        }
        if (elements.currentTimeEl) {
            elements.currentTimeEl.textContent = '0:00';
        }
        if (elements.progress) {
            elements.progress.style.width = '0%';
        }

        // Auto-play on track selection
        if (!state.isPlaying) {
            state.isPlaying = true;
            updatePlayButton();
            simulateProgress();
        }
    }

    function playPrevious() {
        const newIndex = state.currentTrack > 0 
            ? state.currentTrack - 1 
            : elements.tracks.length - 1;
        selectTrack(newIndex);
    }

    function playNext() {
        const newIndex = state.currentTrack < elements.tracks.length - 1 
            ? state.currentTrack + 1 
            : 0;
        selectTrack(newIndex);
    }

    function seekTrack(e) {
        const rect = elements.progressBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        state.progress = Math.max(0, Math.min(100, percent * 100));
        updateProgressUI();
    }

    function simulateProgress() {
        // This is a placeholder simulation
        // Replace with actual audio integration
        if (!state.isPlaying) return;

        const interval = setInterval(() => {
            if (!state.isPlaying) {
                clearInterval(interval);
                return;
            }

            state.progress += 0.5;
            
            if (state.progress >= 100) {
                state.progress = 0;
                playNext();
                clearInterval(interval);
            }

            updateProgressUI();
        }, 100);
    }

    function updateProgressUI() {
        if (elements.progress) {
            elements.progress.style.width = `${state.progress}%`;
        }

        // Update time display (placeholder)
        const totalSeconds = parseTimeToSeconds(elements.totalTimeEl?.textContent || '3:00');
        const currentSeconds = Math.floor((state.progress / 100) * totalSeconds);
        
        if (elements.currentTimeEl) {
            elements.currentTimeEl.textContent = formatTime(currentSeconds);
        }
    }

    function parseTimeToSeconds(timeStr) {
        const parts = timeStr.split(':');
        return parseInt(parts[0]) * 60 + parseInt(parts[1]);
    }

    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    // =====================================================
    // Scroll Animations
    // =====================================================
    function initScrollAnimations() {
        const animatedElements = document.querySelectorAll(
            '.about-content, .score-item, .video-item, .contact-content'
        );

        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -100px 0px',
            threshold: 0.1
        };

        const observerCallback = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    observer.unobserve(entry.target);
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);

        animatedElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });

        // Add animation class styles
        const style = document.createElement('style');
        style.textContent = `
            .animate-in {
                opacity: 1 !important;
                transform: translateY(0) !important;
            }
        `;
        document.head.appendChild(style);
    }

    // =====================================================
    // Video Lazy Loading
    // =====================================================
    function initVideoLazyLoad() {
        const videos = document.querySelectorAll('.video-wrapper iframe');
        
        const observerOptions = {
            root: null,
            rootMargin: '100px',
            threshold: 0
        };

        const observerCallback = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const iframe = entry.target;
                    if (iframe.dataset.src) {
                        iframe.src = iframe.dataset.src;
                    }
                    observer.unobserve(iframe);
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);

        videos.forEach(video => {
            observer.observe(video);
        });
    }

    // =====================================================
    // Parallax Effect (Hero)
    // =====================================================
    function initParallax() {
        const hero = document.querySelector('.hero');
        const heroOverlay = document.querySelector('.hero-overlay');
        
        if (!hero || !heroOverlay) return;

        let ticking = false;

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const scrolled = window.pageYOffset;
                    const rate = scrolled * 0.3;
                    
                    if (scrolled < window.innerHeight) {
                        heroOverlay.style.transform = `translateY(${rate}px)`;
                    }
                    
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    // =====================================================
    // Preloader
    // =====================================================
    function initPreloader() {
        window.addEventListener('load', () => {
            document.body.classList.add('loaded');
        });
    }

    // =====================================================
    // Initialize
    // =====================================================
    function init() {
        initSmoothScroll();
        initScrollSpy();
        initCreditsModal();
        initMusicPlayer();
        initScrollAnimations();
        initVideoLazyLoad();
        initParallax();
        initPreloader();

        // Log initialization
        console.log('Alistair Robertson Music Website initialized');
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
