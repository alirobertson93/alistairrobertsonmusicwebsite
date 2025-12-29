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
        aboutCreditsLink: document.getElementById('aboutCreditsLink'),
        creditsModal: document.getElementById('creditsModal'),
        modalClose: document.getElementById('modalClose'),
        playBtn: document.getElementById('playBtn'),
        prevBtn: document.getElementById('prevBtn'),
        nextBtn: document.getElementById('nextBtn'),
        tracks: document.querySelectorAll('.track'),
        trackList: document.querySelector('.track-list'),
        trackListToggle: document.getElementById('trackListToggle'),
        progressBar: document.querySelector('.progress-bar'),
        progress: document.querySelector('.progress'),
        currentTimeEl: document.querySelector('.current-time'),
        totalTimeEl: document.querySelector('.total-time'),
        nowPlayingTitle: document.querySelector('.now-playing-title'),
        nowPlayingAlbum: document.querySelector('.now-playing-album'),
        nowPlayingArtwork: document.getElementById('nowPlayingArtwork'),
        // Miniplayer elements
        miniplayer: document.getElementById('miniplayer'),
        miniplayerArtwork: document.getElementById('miniplayerArtwork'),
        miniPlayBtn: document.getElementById('miniPlayBtn'),
        miniPrevBtn: document.getElementById('miniPrevBtn'),
        miniNextBtn: document.getElementById('miniNextBtn'),
        miniTitle: document.querySelector('.miniplayer-title'),
        miniAlbum: document.querySelector('.miniplayer-album'),
        miniCurrent: document.querySelector('.miniplayer-current'),
        miniTotal: document.querySelector('.miniplayer-total'),
        miniProgressFill: document.querySelector('.miniplayer-progress-fill'),
        miniTextWrapper: document.querySelector('.miniplayer-text-wrapper'),
        playerControls: document.querySelector('.player-controls')
    };

    // =====================================================
    // State
    // =====================================================
    const state = {
        currentTrack: 0,
        isPlaying: false,
        audio: null,
        audioCache: new Map(), // Cache for preloaded audio elements
        hasInteracted: false   // Track if user has interacted with player
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
        if (!elements.creditsModal) return;

        // Footer credits button
        if (elements.creditsBtn) {
            elements.creditsBtn.addEventListener('click', openModal);
        }
        
        // About section credits link
        if (elements.aboutCreditsLink) {
            elements.aboutCreditsLink.addEventListener('click', (e) => {
                e.preventDefault();
                openModal();
            });
        }

        if (elements.modalClose) {
            elements.modalClose.addEventListener('click', closeModal);
        }
        
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
    // Music Player (Lazy Loading with Smart Preloading)
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

        // Track list expand/collapse toggle
        if (elements.trackListToggle && elements.trackList) {
            elements.trackListToggle.addEventListener('click', toggleTrackList);
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

    // Toggle track list expand/collapse
    function toggleTrackList() {
        const isExpanded = elements.trackList.classList.toggle('expanded');
        elements.trackListToggle.classList.toggle('expanded', isExpanded);
        
        const toggleText = elements.trackListToggle.querySelector('.toggle-text');
        if (toggleText) {
            toggleText.textContent = isExpanded ? 'Show Less' : 'Show More';
        }
    }

    // =====================================================
    // Track Text Scrolling (Independent title/album scroll)
    // =====================================================
    function initTrackTextScrolling() {
        elements.tracks.forEach((track, index) => {
            const trackInfo = track.querySelector('.track-info');
            if (!trackInfo) return;

            const titleEl = trackInfo.querySelector('.track-title');
            const albumEl = trackInfo.querySelector('.track-album');

            // Wrap title in a wrapper div
            if (titleEl && !titleEl.parentElement.classList.contains('track-title-wrapper')) {
                const titleWrapper = document.createElement('div');
                titleWrapper.className = 'track-title-wrapper';
                titleEl.parentNode.insertBefore(titleWrapper, titleEl);
                titleWrapper.appendChild(titleEl);
            }

            // Wrap album in a wrapper div
            if (albumEl && !albumEl.parentElement.classList.contains('track-album-wrapper')) {
                const albumWrapper = document.createElement('div');
                albumWrapper.className = 'track-album-wrapper';
                albumEl.parentNode.insertBefore(albumWrapper, albumEl);
                albumWrapper.appendChild(albumEl);
            }

            // Set up hover events for scrolling
            track.addEventListener('mouseenter', () => {
                checkAndEnableScrolling(track);
            });

            track.addEventListener('mouseleave', () => {
                // Only stop scrolling if track is not playing
                if (index !== state.currentTrack || !state.isPlaying) {
                    stopTrackScrolling(track);
                }
            });
        });
    }

    function checkAndEnableScrolling(track) {
        const trackInfo = track.querySelector('.track-info');
        const titleWrapper = track.querySelector('.track-title-wrapper');
        const albumWrapper = track.querySelector('.track-album-wrapper');
        const titleEl = track.querySelector('.track-title');
        const albumEl = track.querySelector('.track-album');

        if (!trackInfo) return;

        // Get the available width for track-info (the middle column)
        const trackInfoWidth = trackInfo.clientWidth;
        const hasAlbum = albumEl && albumEl.textContent.trim();
        
        // Calculate max width for title based on whether album exists
        // 80% if album present, 100% otherwise (matching CSS)
        const titleMaxWidth = hasAlbum ? trackInfoWidth * 0.8 : trackInfoWidth;
        
        // Check and scroll title if needed - compare text width to max allowed width
        if (titleWrapper && titleEl) {
            const titleTextWidth = titleEl.scrollWidth;
            if (titleTextWidth > titleMaxWidth) {
                titleWrapper.classList.add('scroll-active');
                enableScrolling(titleEl, titleWrapper);
            }
        }

        // Check and scroll album if needed - album wrapper always fills remaining space
        if (hasAlbum && albumWrapper && albumEl) {
            const albumWrapperWidth = albumWrapper.clientWidth;
            const albumTextWidth = albumEl.scrollWidth;
            
            if (albumTextWidth > albumWrapperWidth) {
                enableScrolling(albumEl, albumWrapper);
            }
        }
    }

    function enableScrolling(textEl, wrapper) {
        // Don't duplicate if already scrolling
        if (textEl.classList.contains('scrolling')) return;

        const originalText = textEl.textContent;
        const textWidth = textEl.scrollWidth;

        // Calculate animation duration based on text length (pixels per second)
        const pixelsPerSecond = 30;
        const scrollDistance = textWidth;
        const duration = Math.max(5, scrollDistance / pixelsPerSecond);

        // Set custom duration
        textEl.style.setProperty('--scroll-duration', `${duration}s`);

        // Add scroll-active to wrapper for overflow:hidden
        wrapper.classList.add('scroll-active');

        // Duplicate content for seamless scroll
        textEl.innerHTML = originalText + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + originalText;
        textEl.classList.add('scrolling');
    }

    function stopTrackScrolling(track) {
        const titleEl = track.querySelector('.track-title');
        const titleWrapper = track.querySelector('.track-title-wrapper');
        const albumEl = track.querySelector('.track-album');
        const albumWrapper = track.querySelector('.track-album-wrapper');

        if (titleEl && titleEl.classList.contains('scrolling')) {
            titleEl.classList.remove('scrolling');
            // Restore original text (remove duplicate)
            const text = titleEl.textContent;
            const separator = '\u00A0\u00A0\u00A0\u00A0\u00A0'; // 5 non-breaking spaces
            const parts = text.split(separator);
            if (parts.length > 1) {
                titleEl.textContent = parts[0];
            }
        }
        // Remove scroll-active from title wrapper
        if (titleWrapper) {
            titleWrapper.classList.remove('scroll-active');
        }

        if (albumEl && albumEl.classList.contains('scrolling')) {
            albumEl.classList.remove('scrolling');
            // Restore original text (remove duplicate)
            const text = albumEl.textContent;
            const separator = '\u00A0\u00A0\u00A0\u00A0\u00A0';
            const parts = text.split(separator);
            if (parts.length > 1) {
                albumEl.textContent = parts[0];
            }
        }
    }

    // Get clean text from an element (without scroll duplication)
    function getCleanText(el) {
        if (!el) return '';
        const text = el.textContent;
        const separator = '\u00A0\u00A0\u00A0\u00A0\u00A0';
        const parts = text.split(separator);
        return parts[0] || text;
    }

    function updatePlayingTrackScrolling() {
        // Enable scrolling on the currently playing track
        if (state.isPlaying && elements.tracks[state.currentTrack]) {
            checkAndEnableScrolling(elements.tracks[state.currentTrack]);
        }
    }

    // Extract clean title from filename (fallback if no metadata)
    function getTitleFromFilename(src) {
        const filename = src.split('/').pop();
        return filename
            .replace(/^\d+\s*/, '')           // Remove leading track number
            .replace(/\.(mp3|wav)$/i, '');    // Remove extension
    }

    // Load ID3/metadata tags for all tracks
    function loadAllTrackTags() {
        // First, immediately set all titles from filenames (so nothing says "Loading...")
        elements.tracks.forEach((track, index) => {
            const src = track.dataset.src;
            if (!src) return;
            const titleEl = track.querySelector('.track-title');
            if (titleEl && (titleEl.textContent === 'Loading...' || titleEl.textContent === '')) {
                titleEl.textContent = getTitleFromFilename(src);
            }
            // Also update now playing if this is the first track
            if (index === 0 && elements.nowPlayingTitle) {
                elements.nowPlayingTitle.textContent = getTitleFromFilename(src);
            }
        });

        // Then try to load actual metadata (will update if successful)
        if (typeof jsmediatags === 'undefined') {
            console.warn('jsmediatags not loaded, using filenames');
            return;
        }

        console.log('jsmediatags loaded, reading tags...');

        elements.tracks.forEach((track, index) => {
            const src = track.dataset.src;
            if (!src) return;

            // Use fetch to get the file as a blob for better CORS handling
            fetch(src)
                .then(response => response.blob())
                .then(blob => {
                    jsmediatags.read(blob, {
                        onSuccess: function(tag) {
                            const tags = tag.tags;
                            console.log('Tags for track', index, ':', tags.title, '-', tags.album);
                            
                            const titleEl = track.querySelector('.track-title');
                            const albumEl = track.querySelector('.track-album');

                            // Set title from metadata or keep filename
                            if (titleEl && tags.title) {
                                titleEl.textContent = tags.title;
                            }

                            // Set album if available
                            if (albumEl && tags.album) {
                                albumEl.textContent = tags.album;
                            }

                            // Extract album artwork if available
                            let artworkDataUrl = null;
                            if (tags.picture) {
                                const picture = tags.picture;
                                const base64String = btoa(
                                    picture.data.reduce((data, byte) => data + String.fromCharCode(byte), '')
                                );
                                artworkDataUrl = `data:${picture.format};base64,${base64String}`;
                                // Store artwork on the track element for later retrieval
                                track.dataset.artwork = artworkDataUrl;
                            }

                            // Update now playing if this is the current track
                            if (index === state.currentTrack) {
                                if (elements.nowPlayingTitle && tags.title) {
                                    elements.nowPlayingTitle.textContent = tags.title;
                                }
                                if (elements.nowPlayingAlbum && tags.album) {
                                    elements.nowPlayingAlbum.textContent = tags.album;
                                }
                                // Only update artwork if user has already interacted (pressed play)
                                if (state.hasInteracted) {
                                    updateArtwork(artworkDataUrl);
                                }
                            }
                        },
                        onError: function(error) {
                            console.log('Error reading tags for:', src, error.type, error.info);
                        }
                    });
                })
                .catch(err => {
                    console.log('Fetch error for:', src, err);
                });
        });
    }

    // Preload metadata for all tracks to show durations immediately
    function preloadAllTrackMetadata() {
        elements.tracks.forEach((track, index) => {
            const src = track.dataset.src;
            if (!src) return;

            // Create a temporary audio element just for metadata
            const audio = new Audio();
            audio.preload = 'metadata';
            
            audio.addEventListener('loadedmetadata', () => {
                const duration = formatTime(Math.floor(audio.duration));
                const durationEl = track.querySelector('.track-duration');
                if (durationEl) {
                    durationEl.textContent = duration;
                }
                // Update total time if this is the current track
                if (index === state.currentTrack && elements.totalTimeEl) {
                    elements.totalTimeEl.textContent = duration;
                }
                // Cache this audio element for later use
                if (!state.audioCache.has(index)) {
                    // Add event listeners for when this becomes the active track
                    audio.addEventListener('ended', () => {
                        playNext();
                    });
                    audio.addEventListener('timeupdate', () => {
                        if (index === state.currentTrack) {
                            updateProgressUI();
                        }
                    });
                    state.audioCache.set(index, audio);
                }
            });

            audio.addEventListener('error', (e) => {
                console.log('Error loading metadata for track', index, src, e);
            });

            // Set src AFTER adding listeners, then trigger load
            audio.src = src;
            audio.load(); // Explicitly trigger loading
        });
    }

    // Get or create audio element for a track (lazy loading)
    function getAudio(index) {
        const track = elements.tracks[index];
        if (!track) return null;
        
        const src = track.dataset.src;
        if (!src) return null;

        // Return cached audio if available
        if (state.audioCache.has(index)) {
            return state.audioCache.get(index);
        }

        // Create new audio element (lazy load)
        const audio = new Audio();
        audio.preload = 'metadata'; // Only load metadata initially
        audio.src = src;
        
        // Update duration when metadata loads
        audio.addEventListener('loadedmetadata', () => {
            const duration = formatTime(Math.floor(audio.duration));
            const durationEl = track.querySelector('.track-duration');
            if (durationEl) {
                durationEl.textContent = duration;
            }
            // Update total time if this is the current track
            if (index === state.currentTrack && elements.totalTimeEl) {
                elements.totalTimeEl.textContent = duration;
            }
        });

        // Handle track ending
        audio.addEventListener('ended', () => {
            playNext();
        });

        // Update progress during playback
        audio.addEventListener('timeupdate', () => {
            if (index === state.currentTrack) {
                updateProgressUI();
            }
        });

        // Cache the audio element
        state.audioCache.set(index, audio);
        
        return audio;
    }

    // Preload adjacent tracks after user starts playing
    function preloadAdjacentTracks(currentIndex) {
        // Preload next track
        const nextIndex = currentIndex < elements.tracks.length - 1 ? currentIndex + 1 : 0;
        const nextAudio = getAudio(nextIndex);
        if (nextAudio && nextAudio.preload === 'metadata') {
            nextAudio.preload = 'auto';
        }

        // Preload previous track
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : elements.tracks.length - 1;
        const prevAudio = getAudio(prevIndex);
        if (prevAudio && prevAudio.preload === 'metadata') {
            prevAudio.preload = 'auto';
        }
    }

    function togglePlay() {
        if (!state.audio) {
            // First play - load the current track
            state.audio = getAudio(state.currentTrack);
            if (!state.audio) return;
        }

        if (state.isPlaying) {
            state.audio.pause();
            state.isPlaying = false;
            updatePlayButton();
            updateMiniplayerVisibility();
            // Stop scrolling on current track when paused
            if (elements.tracks[state.currentTrack]) {
                stopTrackScrolling(elements.tracks[state.currentTrack]);
            }
        } else {
            // Set hasInteracted before play so artwork can show
            const isFirstInteraction = !state.hasInteracted;
            state.hasInteracted = true;
            
            // If first interaction, show artwork for current track immediately
            if (isFirstInteraction) {
                const artworkDataUrl = elements.tracks[state.currentTrack]?.dataset.artwork || null;
                updateArtwork(artworkDataUrl);
            }
            
            state.audio.play().then(() => {
                state.isPlaying = true;
                updatePlayButton();
                updateMiniplayerVisibility();
                updatePlayingTrackScrolling();
                // Start preloading adjacent tracks after first interaction
                setTimeout(() => preloadAdjacentTracks(state.currentTrack), 2000);
            }).catch(err => {
                console.log('Playback failed:', err);
            });
        }
    }

    function updateArtwork(artworkDataUrl) {
        // Update main player artwork
        if (elements.nowPlayingArtwork) {
            if (artworkDataUrl) {
                elements.nowPlayingArtwork.src = artworkDataUrl;
                elements.nowPlayingArtwork.classList.add('visible');
            } else {
                elements.nowPlayingArtwork.src = '';
                elements.nowPlayingArtwork.classList.remove('visible');
            }
        }
        
        // Update miniplayer artwork
        if (elements.miniplayerArtwork) {
            if (artworkDataUrl) {
                elements.miniplayerArtwork.src = artworkDataUrl;
                elements.miniplayerArtwork.classList.add('visible');
            } else {
                elements.miniplayerArtwork.src = '';
                elements.miniplayerArtwork.classList.remove('visible');
            }
        }
    }

    function updatePlayButton() {
        console.log('updatePlayButton called, isPlaying:', state.isPlaying, 'playBtn:', elements.playBtn);
        if (state.isPlaying) {
            elements.playBtn.classList.add('playing');
            console.log('Added playing class, classList:', elements.playBtn.classList.toString());
            if (elements.miniPlayBtn) {
                elements.miniPlayBtn.classList.add('playing');
            }
        } else {
            elements.playBtn.classList.remove('playing');
            if (elements.miniPlayBtn) {
                elements.miniPlayBtn.classList.remove('playing');
            }
        }
    }

    function selectTrack(index) {
        // Stop scrolling on previously playing track
        if (elements.tracks[state.currentTrack]) {
            stopTrackScrolling(elements.tracks[state.currentTrack]);
        }

        // Stop current audio if playing
        if (state.audio) {
            state.audio.pause();
            state.audio.currentTime = 0;
        }

        state.currentTrack = index;
        
        // Update active track styling
        elements.tracks.forEach((track, i) => {
            track.classList.toggle('active', i === index);
        });

        // Update now playing title and album (get clean text without scroll duplication)
        const titleEl = elements.tracks[index].querySelector('.track-title');
        const albumEl = elements.tracks[index].querySelector('.track-album');
        const trackTitle = getCleanText(titleEl);
        const albumText = getCleanText(albumEl);
        
        if (elements.nowPlayingTitle) {
            elements.nowPlayingTitle.textContent = trackTitle;
        }
        if (elements.nowPlayingAlbum) {
            elements.nowPlayingAlbum.textContent = albumText;
        }

        // Update miniplayer title and album
        if (elements.miniTitle) {
            elements.miniTitle.textContent = trackTitle;
        }
        if (elements.miniAlbum) {
            elements.miniAlbum.textContent = albumText;
        }

        // Clicking a track counts as interaction - show artwork from now on
        state.hasInteracted = true;

        // Update artwork from cached data on track element
        const artworkDataUrl = elements.tracks[index].dataset.artwork || null;
        updateArtwork(artworkDataUrl);
        
        // Check if text needs to scroll
        checkMiniplayerTextScroll();

        // Reset progress display
        if (elements.currentTimeEl) {
            elements.currentTimeEl.textContent = '0:00';
        }
        if (elements.progress) {
            elements.progress.style.width = '0%';
        }

        // Get or create audio for this track
        state.audio = getAudio(index);
        
        if (state.audio) {
            // Update duration display
            if (state.audio.duration) {
                const duration = formatTime(Math.floor(state.audio.duration));
                if (elements.totalTimeEl) {
                    elements.totalTimeEl.textContent = duration;
                }
            }

            // Auto-play on track selection
            state.audio.play().then(() => {
                state.isPlaying = true;
                state.hasInteracted = true;
                updatePlayButton();
                updatePlayingTrackScrolling();
                // Preload adjacent tracks
                setTimeout(() => preloadAdjacentTracks(index), 2000);
            }).catch(err => {
                console.log('Playback failed:', err);
                state.isPlaying = false;
                updatePlayButton();
            });
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
        if (!state.audio || !state.audio.duration) return;
        
        const rect = elements.progressBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        state.audio.currentTime = percent * state.audio.duration;
        updateProgressUI();
    }

    function updateProgressUI() {
        if (!state.audio || !state.audio.duration) return;

        const percent = (state.audio.currentTime / state.audio.duration) * 100;
        
        if (elements.progress) {
            elements.progress.style.width = `${percent}%`;
        }

        if (elements.currentTimeEl) {
            elements.currentTimeEl.textContent = formatTime(Math.floor(state.audio.currentTime));
        }

        if (elements.totalTimeEl) {
            elements.totalTimeEl.textContent = formatTime(Math.floor(state.audio.duration));
        }

        // Update miniplayer progress
        if (elements.miniProgressFill) {
            elements.miniProgressFill.style.width = `${percent}%`;
        }
        if (elements.miniCurrent) {
            elements.miniCurrent.textContent = formatTime(Math.floor(state.audio.currentTime));
        }
        if (elements.miniTotal) {
            elements.miniTotal.textContent = formatTime(Math.floor(state.audio.duration));
        }
    }

    function formatTime(seconds) {
        if (isNaN(seconds)) return '--:--';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
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
    // Miniplayer
    // =====================================================
    function initMiniplayer() {
        if (!elements.miniplayer) {
            console.log('Miniplayer element not found');
            return;
        }
        if (!elements.playerControls) {
            console.log('Player controls element not found');
            return;
        }

        console.log('Miniplayer initialized');

        // Miniplayer control buttons
        if (elements.miniPlayBtn) {
            elements.miniPlayBtn.addEventListener('click', togglePlay);
        }
        if (elements.miniPrevBtn) {
            elements.miniPrevBtn.addEventListener('click', playPrevious);
        }
        if (elements.miniNextBtn) {
            elements.miniNextBtn.addEventListener('click', playNext);
        }

        // Check visibility on scroll
        window.addEventListener('scroll', () => {
            updateMiniplayerVisibility();
        });

        // Also check on resize
        window.addEventListener('resize', () => {
            updateMiniplayerVisibility();
            checkMiniplayerTextScroll();
        });
    }

    function updateMiniplayerVisibility() {
        if (!elements.miniplayer || !elements.playerControls) return;

        // Only show miniplayer if audio is playing
        if (!state.isPlaying) {
            elements.miniplayer.classList.remove('visible');
            return;
        }

        // Check if main player controls are visible in viewport
        const rect = elements.playerControls.getBoundingClientRect();
        const navHeight = 70;
        const viewportHeight = window.innerHeight;
        
        // Player is visible if any part of it is in the viewport (above the nav)
        const isPlayerVisible = rect.bottom > 0 && rect.top < (viewportHeight - navHeight);

        console.log('updateMiniplayerVisibility:', { isPlaying: state.isPlaying, isPlayerVisible, rect: rect.top + '-' + rect.bottom });

        if (isPlayerVisible) {
            elements.miniplayer.classList.remove('visible');
        } else {
            console.log('Adding visible class to miniplayer');
            elements.miniplayer.classList.add('visible');
        }
    }

    function checkMiniplayerTextScroll() {
        if (!elements.miniTextWrapper) return;

        // Reset scrolling class
        elements.miniTextWrapper.classList.remove('scrolling');
        
        // Check if text overflows
        const wrapper = elements.miniTextWrapper;
        const container = elements.miniplayer?.querySelector('.miniplayer-info');
        
        if (container && wrapper.scrollWidth > container.clientWidth) {
            // Duplicate content for seamless scroll
            const originalContent = wrapper.innerHTML;
            wrapper.innerHTML = originalContent + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + originalContent;
            wrapper.classList.add('scrolling');
        }
    }

    // =====================================================
    // Video Carousel
    // =====================================================
    function initVideoCarousel() {
        const carousel = document.querySelector('.video-carousel');
        if (!carousel) return;

        const track = carousel.querySelector('.carousel-track');
        const items = Array.from(track.querySelectorAll('.video-item'));
        const prevBtn = carousel.querySelector('.carousel-prev');
        const nextBtn = carousel.querySelector('.carousel-next');
        const dotsContainer = document.querySelector('.carousel-dots');
        const overlay = document.getElementById('videoExpandedOverlay');
        const expandedIframe = document.getElementById('expandedVideoIframe');
        const closeBtn = overlay?.querySelector('.video-close-btn');
        const expandedTitle = overlay?.querySelector('.video-expanded-title');
        const expandedDesc = overlay?.querySelector('.video-expanded-description');

        let currentIndex = 0;
        const totalItems = items.length;

        // Create dots
        items.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
            dot.setAttribute('aria-label', `Go to video ${i + 1}`);
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
        });

        const dots = dotsContainer.querySelectorAll('.carousel-dot');

        function updateCarousel() {
            const containerWidth = carousel.querySelector('.carousel-track-container').offsetWidth;
            const itemWidth = items[0].offsetWidth;
            const gap = parseInt(getComputedStyle(track).gap) || 24;
            
            // Calculate offset to center the current item
            const centerOffset = (containerWidth - itemWidth) / 2;
            const translateX = -(currentIndex * (itemWidth + gap)) + centerOffset;
            
            track.style.transform = `translateX(${translateX}px)`;

            // Update item classes for styling
            items.forEach((item, i) => {
                item.classList.remove('center', 'adjacent', 'edge');
                const distance = Math.abs(i - currentIndex);
                
                if (distance === 0) {
                    item.classList.add('center');
                } else if (distance === 1) {
                    item.classList.add('adjacent');
                } else {
                    item.classList.add('edge');
                }
            });

            // Update dots
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === currentIndex);
            });

            // Update button states
            prevBtn.disabled = currentIndex === 0;
            nextBtn.disabled = currentIndex === totalItems - 1;
        }

        function goToSlide(index) {
            currentIndex = Math.max(0, Math.min(index, totalItems - 1));
            updateCarousel();
        }

        function nextSlide() {
            if (currentIndex < totalItems - 1) {
                currentIndex++;
                updateCarousel();
            }
        }

        function prevSlide() {
            if (currentIndex > 0) {
                currentIndex--;
                updateCarousel();
            }
        }

        // Open expanded video overlay
        function openExpandedVideo(item) {
            const placeholder = item.querySelector('.video-placeholder');
            if (!placeholder || !overlay) return;

            const videoSrc = placeholder.dataset.src;
            const title = item.querySelector('.video-title')?.textContent || '';
            const description = item.querySelector('.video-description')?.textContent || '';

            // Set iframe src with autoplay
            expandedIframe.src = videoSrc + '&autoplay=1';
            if (expandedTitle) expandedTitle.textContent = title;
            if (expandedDesc) expandedDesc.textContent = description;

            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        // Close expanded video overlay
        function closeExpandedVideo() {
            if (!overlay) return;
            
            overlay.classList.remove('active');
            document.body.style.overflow = '';
            
            // Stop video by clearing src
            setTimeout(() => {
                expandedIframe.src = '';
            }, 400);
        }

        // Event listeners
        prevBtn.addEventListener('click', prevSlide);
        nextBtn.addEventListener('click', nextSlide);

        // Click on center video to expand
        items.forEach((item, i) => {
            item.addEventListener('click', () => {
                if (i === currentIndex) {
                    // Center item - open expanded view
                    openExpandedVideo(item);
                } else {
                    // Other items - navigate to them
                    goToSlide(i);
                }
            });
        });

        // Close overlay events
        if (closeBtn) {
            closeBtn.addEventListener('click', closeExpandedVideo);
        }
        
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    closeExpandedVideo();
                }
            });
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (overlay?.classList.contains('active')) {
                if (e.key === 'Escape') {
                    closeExpandedVideo();
                }
            } else if (document.activeElement?.closest('.video-carousel')) {
                if (e.key === 'ArrowLeft') {
                    prevSlide();
                } else if (e.key === 'ArrowRight') {
                    nextSlide();
                }
            }
        });

        // Touch/swipe support
        let touchStartX = 0;
        let touchEndX = 0;

        track.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        track.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });

        function handleSwipe() {
            const diff = touchStartX - touchEndX;
            const threshold = 50;

            if (Math.abs(diff) > threshold) {
                if (diff > 0) {
                    nextSlide();
                } else {
                    prevSlide();
                }
            }
        }

        // Handle window resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(updateCarousel, 100);
        });

        // Initial update
        updateCarousel();
    }

    // =====================================================
    // Parallax Effect (Hero)
    // =====================================================
    function initParallax() {
        const hero = document.querySelector('.hero');
        const heroOverlay = document.querySelector('.hero-overlay[data-parallax]');
        
        if (!hero || !heroOverlay) return;

        let ticking = false;

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const scrolled = window.pageYOffset;
                    const heroHeight = hero.offsetHeight;
                    
                    if (scrolled < heroHeight) {
                        const rate = scrolled * 0.6;
                        heroOverlay.style.transform = `translateY(${rate}px)`;
                    }
                    
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    // =====================================================
    // Preloader / Loading Screen
    // =====================================================
    function initPreloader() {
        const loader = document.getElementById('loader');
        const heroImage = new Image();
        
        // Add loading class to prevent scroll
        document.body.classList.add('loading');
        
        // Preload critical hero image
        heroImage.src = 'images/tramontano-hero.webp';
        
        const hideLoader = () => {
            if (loader) {
                loader.classList.add('loaded');
                document.body.classList.remove('loading');
            }
        };
        
        // Wait for hero image OR timeout (whichever comes first)
        const timeout = setTimeout(hideLoader, 3000); // Max 3s wait
        
        heroImage.onload = () => {
            clearTimeout(timeout);
            // Small delay to allow progress bar animation to complete
            setTimeout(hideLoader, 800);
        };
        
        heroImage.onerror = () => {
            clearTimeout(timeout);
            hideLoader();
        };
    }

    // =====================================================
    // Lazy Image Loading with Staggered Reveal
    // =====================================================
    function initLazyImages() {
        // Handle image load events for fade-in
        const lazyImages = document.querySelectorAll('.score-image img, .video-thumbnail img');
        lazyImages.forEach(img => {
            if (img.complete) {
                img.classList.add('loaded');
            } else {
                img.addEventListener('load', () => {
                    img.classList.add('loaded');
                });
            }
        });
        
        // Staggered reveal for score items using Intersection Observer
        const scoreItems = document.querySelectorAll('.score-item');
        
        if ('IntersectionObserver' in window) {
            const observerOptions = {
                root: null,
                rootMargin: '0px 0px -50px 0px',
                threshold: 0.1
            };
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry, index) => {
                    if (entry.isIntersecting) {
                        // Stagger the reveal based on position
                        const item = entry.target;
                        const itemIndex = Array.from(scoreItems).indexOf(item);
                        const delay = (itemIndex % 4) * 100; // Stagger by column position
                        
                        setTimeout(() => {
                            item.classList.add('visible');
                        }, delay);
                        
                        observer.unobserve(item);
                    }
                });
            }, observerOptions);
            
            scoreItems.forEach(item => observer.observe(item));
        } else {
            // Fallback for older browsers
            scoreItems.forEach(item => item.classList.add('visible'));
        }
    }

    // =====================================================
    // Initialize
    // =====================================================
    function init() {
        initPreloader();
        initSmoothScroll();
        initScrollSpy();
        initCreditsModal();
        initMusicPlayer();
        initTrackTextScrolling();     // Set up independent title/album scrolling
        loadAllTrackTags();           // Load ID3 metadata (title, album)
        preloadAllTrackMetadata();    // Load track durations immediately
        initScrollAnimations();
        initMiniplayer();
        initVideoCarousel();
        initParallax();
        initLazyImages();

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
