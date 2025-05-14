// DOM Elements
document.addEventListener('DOMContentLoaded', function() {
    // Navigation
    const navButtons = document.querySelectorAll('.nav-btn');
    const contentSections = document.querySelectorAll('.content-section');
    
    // Brooder simulator
    const tempSlider = document.getElementById('temp-slider');
    const tempValue = document.getElementById('temp-value');
    const behaviorText = document.getElementById('behavior-text');
    const brooder = document.querySelector('.brooder-container');
    const chicks = document.querySelectorAll('.brooder-chick');
    
    // Location selector
    const locationButtons = document.querySelectorAll('.location-btn');
    const locationInfos = document.querySelectorAll('.location-details');
    
    // Schedule modal
    const showScheduleBtn = document.getElementById('show-schedule');
    const scheduleModal = document.getElementById('schedule-modal');
    const closeBtn = document.querySelector('.close-btn');
    
    // Health issues tabs
    const issueTabs = document.querySelectorAll('.issue-tab');
    const issueContents = document.querySelectorAll('.issue-details');
    
    // Pro tips tabs
    const tipBtns = document.querySelectorAll('.tip-btn');
    const tipDetails = document.querySelectorAll('.tip-details');
    
    // Add pixel movement effect to the chicken mascot
    const mascot = document.getElementById('chicken-mascot');
    if (mascot) {
        addPixelatedMovement(mascot);
    }
    
    // Add glow pulse effect to the text
    addGlowPulseEffect();
    
    // Add dramatic spotlight effect
    addDramaticSpotlight();
    
    // Navigation functionality
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetSection = button.getAttribute('data-section');
            
            // Update nav buttons
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Update content sections
            contentSections.forEach(section => section.classList.remove('active'));
            document.getElementById(targetSection).classList.add('active');
            
            // Add section entrance animation
            animateSectionEntrance(document.getElementById(targetSection));
        });
    });
    
    // Brooder temperature simulator
    if (tempSlider) {
        tempSlider.addEventListener('input', () => {
            const temp = tempSlider.value;
            tempValue.textContent = `${temp}°F`;
            
            // Update chick behavior based on temperature
            updateChickBehavior(temp);
            
            // Update heater glow intensity
            updateHeaterGlow(temp);
        });
    }
    
    // Location selector functionality
    locationButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetLocation = button.getAttribute('data-location');
            
            // Update buttons
            locationButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Update location info
            locationInfos.forEach(info => info.classList.remove('active'));
            document.getElementById(`${targetLocation}-info`).classList.add('active');
        });
    });
    
    // Schedule modal functionality
    if (showScheduleBtn && scheduleModal) {
        showScheduleBtn.addEventListener('click', () => {
            scheduleModal.style.display = 'flex';
            // Add entrance animation
            scheduleModal.querySelector('.modal-content').style.animation = 'modalEnter 0.3s forwards';
        });
        
        closeBtn.addEventListener('click', () => {
            // Add exit animation
            const modalContent = scheduleModal.querySelector('.modal-content');
            modalContent.style.animation = 'modalExit 0.3s forwards';
            
            // Wait for animation to complete before hiding
            setTimeout(() => {
                scheduleModal.style.display = 'none';
                // Reset animation for next open
                modalContent.style.animation = '';
            }, 300);
        });
        
        window.addEventListener('click', (e) => {
            if (e.target === scheduleModal) {
                // Add exit animation
                const modalContent = scheduleModal.querySelector('.modal-content');
                modalContent.style.animation = 'modalExit 0.3s forwards';
                
                // Wait for animation to complete before hiding
                setTimeout(() => {
                    scheduleModal.style.display = 'none';
                    // Reset animation for next open
                    modalContent.style.animation = '';
                }, 300);
            }
        });
    }
    
    // Health issues tabs functionality
    issueTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetIssue = tab.getAttribute('data-issue');
            
            // Update tabs
            issueTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Update content with fade transition
            issueContents.forEach(content => {
                content.classList.remove('active');
                content.style.opacity = '0';
            });
            
            const activeContent = document.getElementById(`${targetIssue}-content`);
            activeContent.classList.add('active');
            
            // Trigger reflow for animation
            void activeContent.offsetWidth;
            
            // Fade in the active content
            setTimeout(() => {
                activeContent.style.opacity = '1';
            }, 10);
        });
    });
    
    // Pro tips tabs functionality
    tipBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTip = btn.getAttribute('data-tip');
            
            // Update buttons
            tipBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update content with fade transition
            tipDetails.forEach(detail => {
                detail.classList.remove('active');
                detail.style.opacity = '0';
            });
            
            const activeTip = document.getElementById(`${targetTip}-tips`);
            activeTip.classList.add('active');
            
            // Trigger reflow for animation
            void activeTip.offsetWidth;
            
            // Fade in the active content
            setTimeout(() => {
                activeTip.style.opacity = '1';
            }, 10);
        });
    });
    
    // Add hover effects to equipment items
    const equipmentItems = document.querySelectorAll('.equipment-item');
    equipmentItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            addPixelatedHoverEffect(item);
        });
    });
    
    // Add temperature bar animation
    const tempBars = document.querySelectorAll('.temp-bar');
    tempBars.forEach(bar => {
        addTemperatureBarAnimation(bar);
    });
    
    // Initialize pixelated noise effect
    initPixelNoise();
    
    // Add interactive timeline animations
    initTimelineAnimations();
    
    // Add keyboard navigation
    addKeyboardNavigation();
    
    // Add accessibility features
    enhanceAccessibility();
    
    // Handle theme toggle if it exists
    initThemeToggle();
    
    // Initialize loading animation
    playLoadingAnimation();
});

// Update chick behavior based on temperature
function updateChickBehavior(temp: string | number) {
    const behaviorText = document.getElementById('behavior-text');
    const chicks = document.querySelectorAll('.brooder-chick');
    const brooder = document.querySelector('.brooder-container');
    
    if (!behaviorText || !brooder) return;
    
    const temperature = typeof temp === 'string' ? parseInt(temp) : temp;
    
    if (temperature > 90) {
        // Too hot - chicks spread to edges
        behaviorText.textContent = 'Too Hot!';
        behaviorText.style.color = '#FF5252';
        chicks.forEach(chick => {
            const randomEdge = Math.floor(Math.random() * 4);
            let x, y;
            
            switch (randomEdge) {
                case 0: // Top
                    x = Math.random() * 80 + 10;
                    y = 10;
                    break;
                case 1: // Right
                    x = 90;
                    y = Math.random() * 80 + 10;
                    break;
                case 2: // Bottom
                    x = Math.random() * 80 + 10;
                    y = 90;
                    break;
                case 3: // Left
                    x = 10;
                    y = Math.random() * 80 + 10;
                    break;
                default:
                    x = 50;
                    y = 50;
            }
            
            chick.style.transition = 'all 2s ease-in-out';
            chick.style.left = `${x}%`;
            chick.style.top = `${y}%`;
            
            // Remove any previous animation
            chick.style.animation = 'none';
            
            // Add distress animation
            chick.animate([
                { transform: 'rotate(0deg)' },
                { transform: 'rotate(5deg)' },
                { transform: 'rotate(-5deg)' },
                { transform: 'rotate(0deg)' }
            ], {
                duration: 500,
                iterations: 4
            });
        });
        
        brooder.style.boxShadow = 'inset 0 0 20px rgba(255, 82, 82, 0.8)';
        
        // Add heat shimmer effect
        addHeatShimmer(brooder);
    } else if (temperature < 75) {
        // Too cold - chicks huddled under heat source
        behaviorText.textContent = 'Too Cold!';
        behaviorText.style.color = '#2196F3';
        chicks.forEach((chick, index) => {
            const angle = (index / chicks.length) * Math.PI * 2;
            const distance = 10; // Close to heat source
            
            const x = 50 + Math.cos(angle) * distance;
            const y = 20 + Math.sin(angle) * distance;
            
            chick.style.transition = 'all 2s ease-in-out';
            chick.style.left = `${x}%`;
            chick.style.top = `${y}%`;
            
            // Remove any previous animation
            chick.style.animation = 'none';
            
            // Add shivering animation
            chick.animate([
                { transform: 'translate(0, 0)' },
                { transform: 'translate(1px, 1px)' },
                { transform: 'translate(-1px, -1px)' },
                { transform: 'translate(0, 0)' }
            ], {
                duration: 300,
                iterations: Infinity
            });
        });
        
        brooder.style.boxShadow = 'inset 0 0 20px rgba(33, 150, 243, 0.8)';
        
        // Remove heat shimmer if it exists
        removeHeatShimmer();
    } else {
        // Just right - chicks move freely
        behaviorText.textContent = 'Just Right';
        behaviorText.style.color = '#8BC34A';
        chicks.forEach((chick, index) => {
            chick.style.transition = 'none';
            
            // Reset positions and restart animations with delay
            chick.style.top = `${40 + index * 10}%`;
            chick.style.left = `${30 + index * 20}%`;
            
            // Stop any running animations
            const animations = chick.getAnimations();
            animations.forEach(animation => animation.cancel());
            
            // Add animated movement
            const animationDuration = 8 + index * 2;
            const animationDelay = index;
            chick.style.animation = `walkAround ${animationDuration}s infinite ${animationDelay}s`;
        });
        
        brooder.style.boxShadow = 'inset 0 0 20px rgba(139, 195, 74, 0.3)';
        
        // Remove heat shimmer if it exists
        removeHeatShimmer();
    }
}

// Add heat shimmer effect
function addHeatShimmer(element: Element) {
    // Remove existing shimmer if any
    removeHeatShimmer();
    
    const shimmer = document.createElement('div');
    shimmer.className = 'heat-shimmer';
    shimmer.style.position = 'absolute';
    shimmer.style.top = '0';
    shimmer.style.left = '0';
    shimmer.style.right = '0';
    shimmer.style.bottom = '0';
    shimmer.style.background = 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'100%25\' height=\'100%25\'%3E%3Cdefs%3E%3Cfilter id=\'heat-shimmer\' x=\'0\' y=\'0\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.01\' numOctaves=\'3\' result=\'noise\' /%3E%3CfeDisplacementMap in=\'SourceGraphic\' in2=\'noise\' scale=\'5\' xChannelSelector=\'R\' yChannelSelector=\'G\' /%3E%3C/filter%3E%3C/defs%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23heat-shimmer)\' opacity=\'0.3\' /%3E%3C/svg%3E")';
    shimmer.style.pointerEvents = 'none';
    shimmer.style.zIndex = '5';
    shimmer.style.opacity = '0.5';
    shimmer.style.animation = 'shimmerAnimation 2s infinite';
    
    const keyframes = `
        @keyframes shimmerAnimation {
            0% { opacity: 0.3; }
            50% { opacity: 0.5; }
            100% { opacity: 0.3; }
        }
    `;
    
    const style = document.createElement('style');
    style.id = 'shimmer-style';
    style.innerHTML = keyframes;
    document.head.appendChild(style);
    
    element.appendChild(shimmer);
}

// Remove heat shimmer effect
function removeHeatShimmer() {
    const shimmer = document.querySelector('.heat-shimmer');
    if (shimmer) {
        shimmer.parentNode?.removeChild(shimmer);
    }
    
    const style = document.getElementById('shimmer-style');
    if (style) {
        document.head.removeChild(style);
    }
}

// Update heater glow intensity based on temperature
function updateHeaterGlow(temp: string | number) {
    const heater = document.querySelector('.brooder-heater');
    if (!heater) return;
    
    const temperature = typeof temp === 'string' ? parseInt(temp) : temp;
    const intensity = (temperature - 65) / 30; // Map 65-95 to 0-1
    
    heater.style.boxShadow = `0 0 ${20 * intensity}px rgba(255, 82, 82, ${0.4 + intensity * 0.4})`;
    
    // Animate the heater with a pulse effect
    if (temperature > 85) {
        heater.animate([
            { boxShadow: `0 0 ${20 * intensity}px rgba(255, 82, 82, ${0.4 + intensity * 0.4})` },
            { boxShadow: `0 0 ${25 * intensity}px rgba(255, 82, 82, ${0.5 + intensity * 0.5})` },
            { boxShadow: `0 0 ${20 * intensity}px rgba(255, 82, 82, ${0.4 + intensity * 0.4})` }
        ], {
            duration: 2000,
            iterations: Infinity
        });
    } else {
        const animations = heater.getAnimations();
        animations.forEach(animation => animation.cancel());
    }
}

// Add pixelated movement effect
function addPixelatedMovement(element: Element) {
    let pixelSize = 2;
    let lastMouseX = 0;
    let lastMouseY = 0;
    
    document.addEventListener('mousemove', (e) => {
        // Only update on significant movement to create pixelated effect
        if (Math.abs(e.clientX - lastMouseX) > pixelSize * 5 || 
            Math.abs(e.clientY - lastMouseY) > pixelSize * 5) {
            
            // Round to nearest pixel grid
            const moveX = Math.round((e.clientX - lastMouseX) / pixelSize) * pixelSize * 0.01;
            const moveY = Math.round((e.clientY - lastMouseY) / pixelSize) * pixelSize * 0.01;
            
            // Apply small movement to element
            element.style.transform = `translate(${moveX}px, ${moveY}px)`;
            
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
        }
    });
    
    // Add occasional random movement for idle animation
    setInterval(() => {
        if (Math.random() > 0.7) {
            const randomX = (Math.random() - 0.5) * pixelSize * 0.05;
            const randomY = (Math.random() - 0.5) * pixelSize * 0.05;
            
            element.animate([
                { transform: 'translate(0, 0)' },
                { transform: `translate(${randomX}px, ${randomY}px)` },
                { transform: 'translate(0, 0)' }
            ], {
                duration: 1000,
                easing: 'ease-in-out'
            });
        }
    }, 3000);
}

// Add glow pulse effect to elements
function addGlowPulseEffect() {
    const glowElements = document.querySelectorAll('.pixel-text.glow-text');
    
    glowElements.forEach(element => {
        // Random start delay for more natural effect
        const delay = Math.random() * 3;
        element.style.animationDelay = `${delay}s`;
        
        // Add random subtle movement
        element.animate([
            { textShadow: '0 0 5px var(--accent), 0 0 10px var(--accent)' },
            { textShadow: '0 0 10px var(--accent), 0 0 20px var(--accent), 0 0 30px var(--accent)' },
            { textShadow: '0 0 5px var(--accent), 0 0 10px var(--accent)' }
        ], {
            duration: 3000 + Math.random() * 2000,
            iterations: Infinity,
            delay: delay * 1000
        });
    });
}

// Add dramatic spotlight effect
function addDramaticSpotlight() {
    const spotlight = document.createElement('div');
    spotlight.className = 'spotlight';
    spotlight.style.position = 'fixed';
    spotlight.style.width = '300px';
    spotlight.style.height = '300px';
    spotlight.style.borderRadius = '50%';
    spotlight.style.background = 'radial-gradient(rgba(255, 255, 255, 0.1), transparent 70%)';
    spotlight.style.pointerEvents = 'none';
    spotlight.style.zIndex = '999';
    spotlight.style.opacity = '0';
    spotlight.style.transition = 'opacity 0.5s';
    
    document.body.appendChild(spotlight);
    
    // Only show spotlight on specific elements
    const spotlightTargets = document.querySelectorAll('.pixel-card, .equipment-item, .health-item');
    
    spotlightTargets.forEach(target => {
        target.addEventListener('mouseenter', () => {
            spotlight.style.opacity = '1';
            
            // Add subtle scale effect to the target
            target.animate([
                { transform: 'scale(1)' },
                { transform: 'scale(1.02)' },
                { transform: 'scale(1)' }
            ], {
                duration: 300,
                easing: 'ease-out'
            });
        });
        
        target.addEventListener('mouseleave', () => {
            spotlight.style.opacity = '0';
        });
    });
    
    document.addEventListener('mousemove', (e) => {
        // Pixelate movement by rounding to nearest pixel grid
        const pixelSize = 8;
        const x = Math.round(e.clientX / pixelSize) * pixelSize;
        const y = Math.round(e.clientY / pixelSize) * pixelSize;
        
        spotlight.style.transform = `translate(${x - 150}px, ${y - 150}px)`;
    });
}

// Add pixelated hover effect to elements
function addPixelatedHoverEffect(element: Element) {
    // Create pixelated highlight overlay
    const highlight = document.createElement('div');
    highlight.className = 'pixel-highlight';
    highlight.style.position = 'absolute';
    highlight.style.top = '0';
    highlight.style.left = '0';
    highlight.style.width = '100%';
    highlight.style.height = '100%';
    highlight.style.background = 'rgba(139, 195, 74, 0.2)';
    highlight.style.pointerEvents = 'none';
    highlight.style.zIndex = '1';
    
    // Create pixelated pattern
    const pattern = document.createElement('div');
    pattern.style.width = '100%';
    pattern.style.height = '100%';
    pattern.style.backgroundImage = `
        linear-gradient(0deg, rgba(139, 195, 74, 0.1) 25%, transparent 25%),
        linear-gradient(90deg, rgba(139, 195, 74, 0.1) 25%, transparent 25%)
    `;
    pattern.style.backgroundSize = '4px 4px';
    
    highlight.appendChild(pattern);
    element.appendChild(highlight);
    
    // Add a subtle "glitch" effect
    const glitchInterval = setInterval(() => {
        // Random glitch pattern
        pattern.style.backgroundSize = `${4 + Math.floor(Math.random() * 2)}px ${4 + Math.floor(Math.random() * 2)}px`;
        pattern.style.opacity = `${0.8 + Math.random() * 0.2}`;
        
        // Reset after a short delay
        setTimeout(() => {
            pattern.style.backgroundSize = '4px 4px';
            pattern.style.opacity = '1';
        }, 100);
    }, 300);
    
    // Remove after animation completes
    setTimeout(() => {
        clearInterval(glitchInterval);
        element.removeChild(highlight);
    }, 300);
}

// Add temperature bar animation
function addTemperatureBarAnimation(bar: Element) {
    bar.style.height = '0';
    
    // Create observer to animate when in viewport
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    const targetHeight = bar.style.height;
                    bar.style.height = '0';
                    bar.style.transition = 'height 1s ease-out';
                    
                    setTimeout(() => {
                        bar.style.height = targetHeight;
                        
                        // Add subtle pulse animation after initial height animation
                        setTimeout(() => {
                            bar.animate([
                                { boxShadow: '0 0 10px rgba(139, 195, 74, 0.5)' },
                                { boxShadow: '0 0 15px rgba(139, 195, 74, 0.7)' },
                                { boxShadow: '0 0 10px rgba(139, 195, 74, 0.5)' }
                            ], {
                                duration: 2000,
                                iterations: 2,
                                easing: 'ease-in-out'
                            });
                        }, 1000);
                    }, 100);
                }, 200);
                
                observer.unobserve(bar);
            }
        });
    });
    
    observer.observe(bar);
}

// Add section entrance animation
function animateSectionEntrance(section: HTMLElement | null) {
    if (!section) return;
    
    // Find all major elements in the section
    const elements = section.querySelectorAll('.pixel-card, h2, .pixel-divider');
    
    // Reset opacity to 0
    elements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.5s, transform 0.5s';
    });
    
    // Animate each element with a delay
    elements.forEach((element, index) => {
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
            
            // Add a subtle pop effect
            element.animate([
                { transform: 'translateY(0) scale(1)' },
                { transform: 'translateY(-5px) scale(1.02)' },
                { transform: 'translateY(0) scale(1)' }
            ], {
                duration: 300,
                delay: 300,
                easing: 'ease-out'
            });
        }, 100 * index);
    });
    
    // Add a pixelated "scan line" effect
    const scanLine = document.createElement('div');
    scanLine.style.position = 'absolute';
    scanLine.style.left = '0';
    scanLine.style.width = '100%';
    scanLine.style.height = '4px';
    scanLine.style.backgroundColor = 'rgba(139, 195, 74, 0.2)';
    scanLine.style.boxShadow = '0 0 10px rgba(139, 195, 74, 0.5)';
    scanLine.style.zIndex = '1';
    scanLine.style.pointerEvents = 'none';
    
    section.style.position = 'relative';
    section.appendChild(scanLine);
    
    // Animate scan line from top to bottom
    scanLine.animate([
        { top: '0' },
        { top: '100%' }
    ], {
        duration: 1500,
        easing: 'ease-in-out'
    });
    
    // Remove scan line after animation
    setTimeout(() => {
        section.removeChild(scanLine);
    }, 1500);
}

// Initialize pixelated noise effect (continued)
function initPixelNoise() {
    const noise = document.createElement('div');
    noise.className = 'pixel-noise';
    noise.style.position = 'fixed';
    noise.style.top = '0';
    noise.style.left = '0';
    noise.style.width = '100vw';
    noise.style.height = '100vh';
    noise.style.backgroundColor = 'transparent';
    noise.style.backgroundImage = 'url("data:image/png;base64,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")';
    noise.style.pointerEvents = 'none';
    noise.style.zIndex = '998';
    noise.style.opacity = '0.04';
    
    document.body.appendChild(noise);
    
    // Animate noise to create TV static effect
    setInterval(() => {
        noise.style.backgroundPosition = `${Math.random() * 100}px ${Math.random() * 100}px`;
    }, 50);
    
    // Occasionally add glitch effect
    setInterval(() => {
        if (Math.random() > 0.97) { // Rare glitch effect
            noise.style.opacity = '0.2';
            
            // Displace the entire page slightly
            document.body.style.transform = `translate(${(Math.random() - 0.5) * 5}px, ${(Math.random() - 0.5) * 5}px)`;
            
            // Reset after short time
            setTimeout(() => {
                noise.style.opacity = '0.04';
                document.body.style.transform = 'translate(0, 0)';
            }, 100);
        }
    }, 5000);
}

// Add interactive timeline animations
function initTimelineAnimations() {
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    timelineItems.forEach(item => {
        // Create observer to animate when in viewport
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    item.style.opacity = '0';
                    item.style.transform = 'translateX(-20px)';
                    
                    // Animate with delay based on position
                    setTimeout(() => {
                        item.style.transition = 'opacity 0.5s, transform 0.5s';
                        item.style.opacity = '1';
                        item.style.transform = 'translateX(0)';
                    }, 200 * Array.from(timelineItems).indexOf(item));
                    
                    observer.unobserve(item);
                }
            });
        });
        
        observer.observe(item);
    });
    
    // Add pulsing effect to timeline marker
    const marker = document.querySelector('.timeline-marker');
    if (marker) {
        marker.animate([
            { opacity: 0.5 },
            { opacity: 1 },
            { opacity: 0.5 }
        ], {
            duration: 3000,
            iterations: Infinity
        });
    }
}

// Add keyboard navigation
function addKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
        // Get currently active section
        const activeSection = document.querySelector('.content-section.active');
        if (!activeSection) return;
        
        const activeIndex = Array.from(document.querySelectorAll('.content-section')).indexOf(activeSection);
        const navButtons = document.querySelectorAll('.nav-btn');
        
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            // Navigate to next section
            const nextIndex = (activeIndex + 1) % navButtons.length;
            navButtons[nextIndex]?.click();
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            // Navigate to previous section
            const prevIndex = (activeIndex - 1 + navButtons.length) % navButtons.length;
            navButtons[prevIndex]?.click();
        }
    });
}

// Add accessibility features
function enhanceAccessibility() {
    // Add proper ARIA roles and labels
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.setAttribute('role', 'tab');
        btn.setAttribute('aria-selected', btn.classList.contains('active') ? 'true' : 'false');
    });
    
    document.querySelectorAll('.content-section').forEach(section => {
        section.setAttribute('role', 'tabpanel');
        section.setAttribute('aria-hidden', section.classList.contains('active') ? 'false' : 'true');
    });
    
    // Update ARIA states when navigation changes
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update ARIA selected state
            navButtons.forEach(btn => {
                btn.setAttribute('aria-selected', 'false');
            });
            button.setAttribute('aria-selected', 'true');
            
            // Update ARIA hidden state for sections
            document.querySelectorAll('.content-section').forEach(section => {
                section.setAttribute('aria-hidden', 'true');
            });
            
            const targetSection = document.getElementById(button.getAttribute('data-section') || '');
            if (targetSection) {
                targetSection.setAttribute('aria-hidden', 'false');
            }
        });
    });
    
    // Add skip to content link for keyboard users
    const skipLink = document.createElement('a');
    skipLink.textContent = 'Skip to main content';
    skipLink.href = '#main';
    skipLink.className = 'skip-link';
    skipLink.style.position = 'absolute';
    skipLink.style.top = '-40px';
    skipLink.style.left = '0';
    skipLink.style.padding = '8px';
    skipLink.style.backgroundColor = 'var(--primary)';
    skipLink.style.color = '#000';
    skipLink.style.zIndex = '1001';
    skipLink.style.transition = 'top 0.3s';
    
    skipLink.addEventListener('focus', () => {
        skipLink.style.top = '0';
    });
    
    skipLink.addEventListener('blur', () => {
        skipLink.style.top = '-40px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Add element to receive focus
    const mainContent = document.querySelector('main');
    if (mainContent) {
        mainContent.id = 'main';
        mainContent.setAttribute('tabindex', '-1');
    }
}

// Initialize theme toggle
function initThemeToggle() {
    // Check if theme toggle exists or create one
    let themeToggle = document.getElementById('theme-toggle');
    
    if (!themeToggle) {
        // Create theme toggle
        themeToggle = document.createElement('button');
        themeToggle.id = 'theme-toggle';
        themeToggle.className = 'theme-toggle';
        themeToggle.innerHTML = '🌙';
        themeToggle.style.position = 'fixed';
        themeToggle.style.bottom = '20px';
        themeToggle.style.right = '20px';
        themeToggle.style.width = '40px';
        themeToggle.style.height = '40px';
        themeToggle.style.borderRadius = '50%';
        themeToggle.style.backgroundColor = 'var(--card-bg)';
        themeToggle.style.border = '2px solid var(--primary)';
        themeToggle.style.color = 'var(--text)';
        themeToggle.style.fontSize = '1.2rem';
        themeToggle.style.cursor = 'pointer';
        themeToggle.style.zIndex = '1000';
        themeToggle.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
        themeToggle.style.transition = 'all 0.3s';
        
        document.body.appendChild(themeToggle);
    }
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('pixelChickTheme');
    if (savedTheme === 'light') {
        applyLightTheme();
    }
    
    // Add toggle functionality
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        
        if (currentTheme === 'dark') {
            applyLightTheme();
            localStorage.setItem('pixelChickTheme', 'light');
        } else {
            applyDarkTheme();
            localStorage.setItem('pixelChickTheme', 'dark');
        }
    });
}

// Apply light theme
function applyLightTheme() {
    document.documentElement.setAttribute('data-theme', 'light');
    document.documentElement.style.setProperty('--background', '#f0f0f0');
    document.documentElement.style.setProperty('--card-bg', '#ffffff');
    document.documentElement.style.setProperty('--text', '#333333');
    
    // Update theme toggle icon
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.innerHTML = '☀️';
    }
    
    // Add pixel-based light mode transition effect
    const pixels = document.createElement('div');
    pixels.className = 'theme-transition';
    pixels.style.position = 'fixed';
    pixels.style.top = '0';
    pixels.style.left = '0';
    pixels.style.width = '100vw';
    pixels.style.height = '100vh';
    pixels.style.backgroundColor = '#f0f0f0';
    pixels.style.zIndex = '9999';
    pixels.style.pointerEvents = 'none';
    pixels.style.transition = 'opacity 0.5s';
    
    // Create pixelated pattern
    for (let i = 0; i < 50; i++) {
        const pixel = document.createElement('div');
        pixel.style.position = 'absolute';
        pixel.style.width = `${Math.random() * 20 + 10}px`;
        pixel.style.height = `${Math.random() * 20 + 10}px`;
        pixel.style.backgroundColor = '#ffffff';
        pixel.style.left = `${Math.random() * 100}%`;
        pixel.style.top = `${Math.random() * 100}%`;
        pixel.style.opacity = '0';
        
        pixels.appendChild(pixel);
        
        // Animate each pixel separately
        setTimeout(() => {
            pixel.style.transition = 'opacity 0.3s';
            pixel.style.opacity = '1';
        }, Math.random() * 500);
    }
    
    document.body.appendChild(pixels);
    
    // Remove transition effect after animation
    setTimeout(() => {
        pixels.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(pixels);
        }, 500);
    }, 1000);
}

// Apply dark theme
function applyDarkTheme() {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.documentElement.style.setProperty('--background', '#0a0a12');
    document.documentElement.style.setProperty('--card-bg', '#1a1a2a');
    document.documentElement.style.setProperty('--text', '#f0f0f0');
    
    // Update theme toggle icon
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.innerHTML = '🌙';
    }
    
    // Add pixel-based dark mode transition effect
    const pixels = document.createElement('div');
    pixels.className = 'theme-transition';
    pixels.style.position = 'fixed';
    pixels.style.top = '0';
    pixels.style.left = '0';
    pixels.style.width = '100vw';
    pixels.style.height = '100vh';
    pixels.style.backgroundColor = '#0a0a12';
    pixels.style.zIndex = '9999';
    pixels.style.pointerEvents = 'none';
    pixels.style.transition = 'opacity 0.5s';
    
    // Create pixelated pattern
    for (let i = 0; i < 50; i++) {
        const pixel = document.createElement('div');
        pixel.style.position = 'absolute';
        pixel.style.width = `${Math.random() * 20 + 10}px`;
        pixel.style.height = `${Math.random() * 20 + 10}px`;
        pixel.style.backgroundColor = '#1a1a2a';
        pixel.style.left = `${Math.random() * 100}%`;
        pixel.style.top = `${Math.random() * 100}%`;
        pixel.style.opacity = '0';
        
        pixels.appendChild(pixel);
        
        // Animate each pixel separately
        setTimeout(() => {
            pixel.style.transition = 'opacity 0.3s';
            pixel.style.opacity = '1';
        }, Math.random() * 500);
    }
    
    document.body.appendChild(pixels);
    
    // Remove transition effect after animation
    setTimeout(() => {
        pixels.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(pixels);
        }, 500);
    }, 1000);
}

// Play loading animation (continued)
function playLoadingAnimation() {
    // Create loading overlay
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'loading-overlay';
    loadingOverlay.style.position = 'fixed';
    loadingOverlay.style.top = '0';
    loadingOverlay.style.left = '0';
    loadingOverlay.style.width = '100vw';
    loadingOverlay.style.height = '100vh';
    loadingOverlay.style.backgroundColor = 'var(--background)';
    loadingOverlay.style.zIndex = '9999';
    loadingOverlay.style.display = 'flex';
    loadingOverlay.style.justifyContent = 'center';
    loadingOverlay.style.alignItems = 'center';
    loadingOverlay.style.flexDirection = 'column';
    
    // Create pixel chicken loader
    const loadingChicken = document.createElement('div');
    loadingChicken.className = 'loading-chicken';
    loadingChicken.style.width = '60px';
    loadingChicken.style.height = '60px';
    loadingChicken.style.backgroundColor = '#FFC107';
    loadingChicken.style.position = 'relative';
    loadingChicken.style.marginBottom = '20px';
    loadingChicken.style.animation = 'chickenWalk 1s infinite steps(4)';
    
    // Add chicken features
    const chickenHead = document.createElement('div');
    chickenHead.style.width = '30px';
    chickenHead.style.height = '20px';
    chickenHead.style.backgroundColor = '#FFC107';
    chickenHead.style.position = 'absolute';
    chickenHead.style.top = '-20px';
    chickenHead.style.left = '15px';
    
    const chickenComb = document.createElement('div');
    chickenComb.style.width = '10px';
    chickenComb.style.height = '10px';
    chickenComb.style.backgroundColor = '#FF5252';
    chickenComb.style.position = 'absolute';
    chickenComb.style.top = '-30px';
    chickenComb.style.left = '20px';
    
    const chickenEye = document.createElement('div');
    chickenEye.style.width = '5px';
    chickenEye.style.height = '5px';
    chickenEye.style.backgroundColor = '#000';
    chickenEye.style.position = 'absolute';
    chickenEye.style.top = '-15px';
    chickenEye.style.left = '25px';
    
    const chickenBeak = document.createElement('div');
    chickenBeak.style.width = '10px';
    chickenBeak.style.height = '5px';
    chickenBeak.style.backgroundColor = '#FF9800';
    chickenBeak.style.position = 'absolute';
    chickenBeak.style.top = '-12px';
    chickenBeak.style.left = '10px';
    
    const chickenLeg1 = document.createElement('div');
    chickenLeg1.style.width = '5px';
    chickenLeg1.style.height = '15px';
    chickenLeg1.style.backgroundColor = '#FF9800';
    chickenLeg1.style.position = 'absolute';
    chickenLeg1.style.bottom = '-15px';
    chickenLeg1.style.left = '15px';
    chickenLeg1.style.animation = 'legWalk 0.5s infinite alternate';
    
    const chickenLeg2 = document.createElement('div');
    chickenLeg2.style.width = '5px';
    chickenLeg2.style.height = '15px';
    chickenLeg2.style.backgroundColor = '#FF9800';
    chickenLeg2.style.position = 'absolute';
    chickenLeg2.style.bottom = '-15px';
    chickenLeg2.style.right = '15px';
    chickenLeg2.style.animation = 'legWalk 0.5s infinite alternate-reverse';
    
    loadingChicken.appendChild(chickenHead);
    loadingChicken.appendChild(chickenComb);
    loadingChicken.appendChild(chickenEye);
    loadingChicken.appendChild(chickenBeak);
    loadingChicken.appendChild(chickenLeg1);
    loadingChicken.appendChild(chickenLeg2);
    
    // Create loading text
    const loadingText = document.createElement('div');
    loadingText.className = 'loading-text';
    loadingText.textContent = 'HATCHING...';
    loadingText.style.fontFamily = "'Press Start 2P', cursive";
    loadingText.style.color = 'var(--primary)';
    loadingText.style.fontSize = '1rem';
    loadingText.style.marginTop = '20px';
    loadingText.style.letterSpacing = '2px';
    loadingText.style.animation = 'textBlink 1s infinite';
    
    // Create progress bar
    const progressContainer = document.createElement('div');
    progressContainer.style.width = '200px';
    progressContainer.style.height = '20px';
    progressContainer.style.backgroundColor = 'var(--card-bg)';
    progressContainer.style.border = '2px solid var(--primary)';
    progressContainer.style.marginTop = '20px';
    progressContainer.style.position = 'relative';
    
    const progressBar = document.createElement('div');
    progressBar.style.width = '0%';
    progressBar.style.height = '100%';
    progressBar.style.backgroundColor = 'var(--primary)';
    progressBar.style.transition = 'width 0.2s';
    
    progressContainer.appendChild(progressBar);
    
    // Add keyframes for animations
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes chickenWalk {
            0% { transform: translateX(-20px); }
            100% { transform: translateX(20px); }
        }
        
        @keyframes legWalk {
            0% { height: 15px; bottom: -15px; }
            100% { height: 10px; bottom: -10px; }
        }
        
        @keyframes textBlink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
    `;
    
    document.head.appendChild(style);
    
    // Add elements to overlay
    loadingOverlay.appendChild(loadingChicken);
    loadingOverlay.appendChild(loadingText);
    loadingOverlay.appendChild(progressContainer);
    
    // Add overlay to body
    document.body.appendChild(loadingOverlay);
    
    // Simulate progress
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += Math.random() * 5 + 1;
        if (progress >= 100) {
            progress = 100;
            clearInterval(progressInterval);
            
            // Change text to ready
            loadingText.textContent = 'READY!';
            
            // Add pixel exit animation
            setTimeout(() => {
                // Create pixelated exit effect
                for (let y = 0; y < 10; y++) {
                    for (let x = 0; x < 10; x++) {
                        const pixel = document.createElement('div');
                        pixel.style.position = 'absolute';
                        pixel.style.width = `${window.innerWidth / 10}px`;
                        pixel.style.height = `${window.innerHeight / 10}px`;
                        pixel.style.top = `${y * (window.innerHeight / 10)}px`;
                        pixel.style.left = `${x * (window.innerWidth / 10)}px`;
                        pixel.style.backgroundColor = 'var(--background)';
                        pixel.style.transition = 'transform 0.5s, opacity 0.5s';
                        pixel.style.transformOrigin = 'center';
                        pixel.style.zIndex = '10000';
                        
                        loadingOverlay.appendChild(pixel);
                        
                        // Stagger the animation
                        setTimeout(() => {
                            const randomX = (Math.random() - 0.5) * 200;
                            const randomY = (Math.random() - 0.5) * 200;
                            pixel.style.transform = `translate(${randomX}px, ${randomY}px) scale(0)`;
                            pixel.style.opacity = '0';
                        }, (x + y) * 50);
                    }
                }
                
                // Remove overlay after animation completes
                setTimeout(() => {
                    document.body.removeChild(loadingOverlay);
                    document.head.removeChild(style);
                }, 1500);
                
            }, 1000);
        }
        
        progressBar.style.width = `${progress}%`;
    }, 200);
}

// Add modal animations for entry and exit
const style = document.createElement('style');
style.innerHTML = `
    @keyframes modalEnter {
        from {
            transform: translateY(20px) scale(0.95);
            opacity: 0;
        }
        to {
            transform: translateY(0) scale(1);
            opacity: 1;
        }
    }
    
    @keyframes modalExit {
        from {
            transform: translateY(0) scale(1);
            opacity: 1;
        }
        to {
            transform: translateY(20px) scale(0.95);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Add easter egg
function addEasterEgg() {
    // Konami code sequence
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let konamiIndex = 0;
    
    document.addEventListener('keydown', (e) => {
        // Reset if key doesn't match the sequence
        if (e.key !== konamiCode[konamiIndex]) {
            konamiIndex = 0;
            return;
        }
        
        // Move to next key in sequence
        konamiIndex++;
        
        // Check if code is complete
        if (konamiIndex === konamiCode.length) {
            triggerEasterEgg();
            konamiIndex = 0;
        }
    });
    
    // Also add a secret click pattern
    const clickPattern = document.createElement('div');
    clickPattern.style.position = 'fixed';
    clickPattern.style.bottom = '10px';
    clickPattern.style.left = '10px';
    clickPattern.style.width = '30px';
    clickPattern.style.height = '30px';
    clickPattern.style.backgroundColor = 'transparent';
    clickPattern.style.cursor = 'default';
    clickPattern.style.zIndex = '1001';
    
    document.body.appendChild(clickPattern);
    
    let clickCount = 0;
    clickPattern.addEventListener('click', () => {
        clickCount++;
        
        // Add a small visual feedback
        const ripple = document.createElement('div');
        ripple.style.position = 'absolute';
        ripple.style.width = '5px';
        ripple.style.height = '5px';
        ripple.style.backgroundColor = 'var(--primary)';
        ripple.style.borderRadius = '50%';
        ripple.style.top = '50%';
        ripple.style.left = '50%';
        ripple.style.transform = 'translate(-50%, -50%)';
        
        clickPattern.appendChild(ripple);
        
        ripple.animate([
            { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
            { transform: 'translate(-50%, -50%) scale(10)', opacity: 0 }
        ], {
            duration: 300,
            easing: 'ease-out'
        });
        
        setTimeout(() => {
            clickPattern.removeChild(ripple);
        }, 300);
        
        if (clickCount >= 10) {
            triggerEasterEgg();
            clickCount = 0;
        }
    });
}

// Trigger easter egg
function triggerEasterEgg() {
    // Create a flock of pixelated chickens that fly across the screen
    for (let i = 0; i < 20; i++) {
        const chicken = document.createElement('div');
        chicken.className = 'easter-egg-chicken';
        chicken.style.position = 'fixed';
        chicken.style.width = '30px';
        chicken.style.height = '30px';
        chicken.style.backgroundColor = '#FFC107';
        chicken.style.zIndex = '9999';
        
        // Add basic chicken features
        const head = document.createElement('div');
        head.style.width = '15px';
        head.style.height = '10px';
        head.style.backgroundColor = '#FFC107';
        head.style.position = 'absolute';
        head.style.top = '-10px';
        head.style.left = '7px';
        
        const comb = document.createElement('div');
        comb.style.width = '5px';
        comb.style.height = '5px';
        comb.style.backgroundColor = '#FF5252';
        comb.style.position = 'absolute';
        comb.style.top = '-15px';
        comb.style.left = '10px';
        
        const eye = document.createElement('div');
        eye.style.width = '3px';
        eye.style.height = '3px';
        eye.style.backgroundColor = '#000';
        eye.style.position = 'absolute';
        eye.style.top = '-7px';
        eye.style.left = '15px';
        
        const beak = document.createElement('div');
        beak.style.width = '5px';
        beak.style.height = '3px';
        beak.style.backgroundColor = '#FF9800';
        beak.style.position = 'absolute';
        beak.style.top = '-6px';
        beak.style.left = '5px';
        
        const wing = document.createElement('div');
        wing.style.width = '10px';
        wing.style.height = '15px';
        wing.style.backgroundColor = '#FFD54F';
        wing.style.position = 'absolute';
        wing.style.top = '5px';
        wing.style.left = '-2px';
        wing.style.transformOrigin = 'top right';
        wing.style.animation = 'wingFlap 0.2s infinite alternate';
        
        chicken.appendChild(head);
        chicken.appendChild(comb);
        chicken.appendChild(eye);
        chicken.appendChild(beak);
        chicken.appendChild(wing);
        
        // Set initial position below the screen
        chicken.style.top = `${window.innerHeight + Math.random() * 200}px`;
        chicken.style.left = `${Math.random() * window.innerWidth}px`;
        
        document.body.appendChild(chicken);
        
        // Add wing flap animation
        const wingFlapStyle = document.createElement('style');
        wingFlapStyle.innerHTML = `
            @keyframes wingFlap {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(-30deg); }
            }
        `;
        document.head.appendChild(wingFlapStyle);
        
        // Animate chicken flying upward
        const flyDuration = 5000 + Math.random() * 5000;
        chicken.animate([
            { transform: 'translateY(0) rotate(0deg)' },
            { transform: `translateY(-${window.innerHeight + 200}px) rotate(${Math.random() * 720 - 360}deg)` }
        ], {
            duration: flyDuration,
            easing: 'cubic-bezier(0.1, 0.7, 1.0, 0.1)'
        });
        
        // Remove chicken after animation
        setTimeout(() => {
            document.body.removeChild(chicken);
        }, flyDuration);
    }
    
    // Add rainbow effect to all headings
    const headings = document.querySelectorAll('h1, h2, h3, h4');
    headings.forEach(heading => {
        heading.style.transition = 'color 0.5s';
        heading.style.animation = 'rainbowText 2s infinite';
    });
    
    // Add rainbow text animation
    const rainbowStyle = document.createElement('style');
    rainbowStyle.innerHTML = `
        @keyframes rainbowText {
            0% { color: #ff5252; }
            16.6% { color: #ffeb3b; }
            33.3% { color: #8bc34a; }
            50% { color: #03a9f4; }
            66.6% { color: #9c27b0; }
            83.3% { color: #ff9800; }
            100% { color: #ff5252; }
        }
    `;
    document.head.appendChild(rainbowStyle);
    
    // Reset headings after a while
    setTimeout(() => {
        headings.forEach(heading => {
            heading.style.animation = 'none';
            heading.style.color = '';
        });
        document.head.removeChild(rainbowStyle);
    }, 10000);
    
    // Play a chicken sound if available
    const audio = new Audio();
    audio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQQAAAAbGBkXGxwcGxkYFxsdHRsaGBgaHBwbGhkYGhscGxoZGRgaHR0cGhoZGRgYGhwdHRsaGBkZGBocHh0bGRkYFxgaHB0cGhkYFxgZGx0dGhkZGBcZGhwdHBsZGBgYGRocHRwaGRkYGBkaHB0bGRkYGBkaHBwbGRgYGBkaHB0cGRgYGBkaHB0cGhkYGBgZGhwdHBoZGBcYGRsdHRwaGRgYGBkcHRwaGRgXGBocHRwbGRgXFxkaHB0cGhkYFxgaGx0cGhkXFxgaHB0cGhkYFxgZGxwdGxoYGBcZGhwdHBoZGBcYGRseHRsZGBcXGRscHRwZGBcXGBocHh0aGRcXGBkcHR0bGRgXFxkaHB0cGhgXFxkaHB0cGhkYFxgZGx0dGxkYFxcZGhweHBoZFxcYGRweHRsZFxcXGRsdHRwZGBcXGBocHh0aGRcXGBkcHh0bGRcXFxkaHB0cGRgXFxgaHB0cGhkXFxgZGx0dGxkYFxcYGhwdHBoZFxcYGRsdHBoZGBcXGRsdHRsZGBcXGBocHRwaGRgXFxgaHB0cGhkXFxgZGx0dGxkYFxYYGhweHBoZFxcXGRsdHRwZGBcWGBocHh0aGRcXFxkbHR0bGRgXFxgaHB0cGhkXFxgZGx0dGxkXFxcYGhwdHBoZFxcXGRsdHRsZGBcXGBocHR0aGRcXFxkaHB0cGhgXFxgZGx0dGxkYFxcYGhwdHBoZFxcYGRsdHRsZGBcXGBocHR0aGRcXFxkaHB0cGhgXFxgZGx0dGxkYFxcYGhwdHBoZFxcXGRsdHRsZGBcXGBocHR0aGRcXFxkaHB0cGhgXFxgZGx0dGxkYFxcYGhwdHBoZFxcXGRsdHRsZGBcXGBocHR0aGRcXFxkaHB0cGhgXFxgZGx0dGxkYFxcYGhwdHBoZFxcXGRsdHRsZGBcXGBocHR0aGRcXFxkaHB0cGhgXFxgZGx0dGxkYFxcYGhwdHBoZFxcXGRsdHRsZFxcXGBocHR0aGRcXFxkaHB0cGhgXFxgZGx0dGxkXFxcYGhwdHBoZFxcXGRsdHRsZFxcXGBocHR0aGRcXFxkaHB0cGhgXFxgZGx0dGxkXFxcYGhwdHBoZFxcXGRsdHRsZFxcXGBocHR0aGRcXFxkaHB0cGhgXFxgZGx0dGxkXFxcYGhwdHBoZFxcXGRsdHRsZFxcXGBocHR0aGRcXFxkaHB0cGhgXFxgZGx0dGxkXFxcYGhwdHBoZFxcXGRsdHRsZFxcXGBocHR0aGRcXFxkaHB0cGhgXFxgZGx0dGxkXFxcYGhwdHBoZFxcXGRsdHRsZFxcXGBocHR0aGRcXFxkaHB0cGhgXFxgZGx0dGxkXFxcYGhwdHBoZFxcXGRsdHRsZFxcXGBocHR0aGRcXFxkaHB0cGhgXFxgZGx0dGxkXFxcYGhwdHBoZFxcXGRsdHRsZFxcXGBocHR0aGRcXFxkaHB0cGhgXFxgZGx0dGxkXFxcYGhwdHBoZFxcXGRsdHRsZFxcXGBocHR0aGRcXFxkaHB0c';
    
    // Play the sound
    try {
        audio.play();
    } catch (error) {
        console.log("Browser blocked autoplay, no chicken sounds today!");
    }
    
    // Turn on "egg mode" for the page
    document.documentElement.classList.add('egg-mode');
    
    // Reset after 10 seconds
    setTimeout(() => {
        document.documentElement.classList.remove('egg-mode');
    }, 10000);
}

// Initialize easter egg when everything else is done
setTimeout(addEasterEgg, 3000);

// Add responsive design improvements
function enhanceResponsiveness() {
    // Get device information
    const isMobile = window.innerWidth <= 768;
    const isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;
    
    // Adjust for mobile
    if (isMobile) {
        // Make navigation more mobile-friendly
        const navContainer = document.querySelector('.nav-container');
        if (navContainer) {
            navContainer.style.flexDirection = 'column';
            navContainer.style.gap = '5px';
        }
        
        // Adjust font sizes
        document.querySelectorAll('h1').forEach(h1 => {
            h1.style.fontSize = '1.5rem';
        });
        
        document.querySelectorAll('h2').forEach(h2 => {
            h2.style.fontSize = '1.2rem';
        });
        
        // Add swipe navigation for mobile
        addSwipeNavigation();
    }
    
    // Listen for orientation changes
    window.addEventListener('orientationchange', () => {
        // Reload the page to ensure proper layout
        setTimeout(() => {
            location.reload();
        }, 100);
    });
    
    // Listen for resize events
    let resizeTimeout: number;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            // Only reload if significant size change occurs
            const currentIsMobile = window.innerWidth <= 768;
            const currentIsTablet = window.innerWidth > 768 && window.innerWidth <= 1024;
            
            if (currentIsMobile !== isMobile || currentIsTablet !== isTablet) {
                location.reload();
            }
        }, 500) as unknown as number;
    });
}

// Add swipe navigation for mobile devices
function addSwipeNavigation() {
    let touchStartX = 0;
    let touchEndX = 0;
    
    document.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
    }, false);
    
    document.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].clientX;
        handleSwipe();
    }, false);
    
    function handleSwipe() {
        const swipeThreshold = 100; // Minimum swipe distance
        
        if (touchEndX - touchStartX > swipeThreshold) {
            // Swipe right - go to previous section
            const activeSection = document.querySelector('.content-section.active');
            if (!activeSection) return;
            
            const activeIndex = Array.from(document.querySelectorAll('.content-section')).indexOf(activeSection);
            const navButtons = document.querySelectorAll('.nav-btn');
            
            // Navigate to previous section
            const prevIndex = (activeIndex - 1 + navButtons.length) % navButtons.length;
            navButtons[prevIndex]?.click();
            
            // Add haptic feedback if available
            if (navigator.vibrate) {
                navigator.vibrate(50);
            }
        } else if (touchStartX - touchEndX > swipeThreshold) {
            // Swipe left - go to next section
            const activeSection = document.querySelector('.content-section.active');
            if (!activeSection) return;
            
            const activeIndex = Array.from(document.querySelectorAll('.content-section')).indexOf(activeSection);
            const navButtons = document.querySelectorAll('.nav-btn');
            
            // Navigate to next section
            const nextIndex = (activeIndex + 1) % navButtons.length;
            navButtons[nextIndex]?.click();
            
            // Add haptic feedback if available
            if (navigator.vibrate) {
                navigator.vibrate(50);
            }
        }
    }
}

// Call responsive enhancement after page loads
setTimeout(enhanceResponsiveness, 1000);

// Function to save user preferences to localStorage
function handleUserPreferences() {
    // Check if first visit
    const isFirstVisit = !localStorage.getItem('pixelChickVisited');
    
    if (isFirstVisit) {
        // Mark as visited
        localStorage.setItem('pixelChickVisited', 'true');
        
        // Show welcome modal on first visit
        showWelcomeModal();
    }
    
    // Add preference button
    const prefButton = document.createElement('button');
    prefButton.className = 'pref-button';
    prefButton.innerHTML = '⚙️';
    prefButton.style.position = 'fixed';
    prefButton.style.bottom = '20px';
    prefButton.style.left = '20px';
    prefButton.style.width = '40px';
    prefButton.style.height = '40px';
    prefButton.style.borderRadius = '50%';
    prefButton.style.backgroundColor = 'var(--card-bg)';
    prefButton.style.border = '2px solid var(--primary)';
    prefButton.style.color = 'var(--text)';
    prefButton.style.fontSize = '1.2rem';
    prefButton.style.cursor = 'pointer';
    prefButton.style.zIndex = '1000';
    prefButton.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
    
    prefButton.addEventListener('click', showPreferencesModal);
    
    document.body.appendChild(prefButton);
}

// Show welcome modal (continued)
function showWelcomeModal() {
    // Create modal container
    const modal = document.createElement('div');
    modal.className = 'welcome-modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '9999';
    
    // Create modal content
    const content = document.createElement('div');
    content.className = 'modal-content';
    content.style.backgroundColor = 'var(--card-bg)';
    content.style.padding = '30px';
    content.style.borderRadius = '5px';
    content.style.maxWidth = '500px';
    content.style.width = '90%';
    content.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.5)';
    content.style.position = 'relative';
    content.style.animation = 'modalEnter 0.5s forwards';
    
    // Welcome message
    const title = document.createElement('h2');
    title.textContent = 'Welcome to Pixel Chick Care!';
    title.style.color = 'var(--primary)';
    title.style.marginBottom = '20px';
    title.style.textAlign = 'center';
    
    const message = document.createElement('p');
    message.textContent = 'Your ultimate guide to raising happy and healthy chicks with a retro gaming twist. Navigate through sections using the menu above or swipe on mobile.';
    message.style.marginBottom = '20px';
    message.style.lineHeight = '1.6';
    
    const tip = document.createElement('p');
    tip.textContent = 'TIP: Try adjusting the temperature in the brooder simulator to see how chicks behave!';
    tip.style.backgroundColor = 'rgba(139, 195, 74, 0.2)';
    tip.style.padding = '10px';
    tip.style.borderLeft = '4px solid var(--primary)';
    tip.style.marginBottom = '20px';
    
    // Close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Start Exploring';
    closeButton.style.backgroundColor = 'var(--primary)';
    closeButton.style.color = '#000';
    closeButton.style.border = 'none';
    closeButton.style.padding = '10px 20px';
    closeButton.style.borderRadius = '5px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.display = 'block';
    closeButton.style.margin = '0 auto';
    closeButton.style.fontFamily = "'Press Start 2P', cursive";
    closeButton.style.fontSize = '0.7rem';
    
    closeButton.addEventListener('click', () => {
        // Add exit animation
        content.style.animation = 'modalExit 0.5s forwards';
        
        // Remove modal after animation
        setTimeout(() => {
            document.body.removeChild(modal);
        }, 500);
    });
    
    // Add chicken mascot
    const mascot = document.createElement('div');
    mascot.style.width = '80px';
    mascot.style.height = '80px';
    mascot.style.margin = '0 auto 20px';
    mascot.style.position = 'relative';
    
    // Simple pixel chicken
    mascot.innerHTML = `
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <rect x="40" y="55" width="20" height="20" fill="#FFC107" />
            <rect x="35" y="50" width="5" height="25" fill="#FFC107" />
            <rect x="60" y="50" width="5" height="25" fill="#FFC107" />
            <rect x="40" y="45" width="20" height="10" fill="#FFC107" />
            <rect x="40" y="35" width="20" height="10" fill="#FFC107" />
            <rect x="35" y="40" width="5" height="5" fill="#FFC107" />
            <rect x="60" y="40" width="5" height="5" fill="#FFC107" />
            <rect x="40" y="30" width="5" height="5" fill="#FF5252" />
            <rect x="45" y="25" width="5" height="5" fill="#FF5252" />
            <rect x="50" y="30" width="5" height="5" fill="#FF5252" />
            <rect x="40" y="40" width="5" height="5" fill="#FF9800" />
            <rect x="45" y="38" width="3" height="3" fill="#000000" />
            <rect x="55" y="38" width="3" height="3" fill="#000000" />
            <rect x="40" y="75" width="5" height="5" fill="#FF9800" />
            <rect x="55" y="75" width="5" height="5" fill="#FF9800" />
        </svg>
    `;
    
    // Add bouncing animation to the mascot
    mascot.animate([
        { transform: 'translateY(0)' },
        { transform: 'translateY(-10px)' },
        { transform: 'translateY(0)' }
    ], {
        duration: 1000,
        iterations: Infinity,
        easing: 'ease-in-out'
    });
    
    // Assemble the modal
    content.appendChild(mascot);
    content.appendChild(title);
    content.appendChild(message);
    content.appendChild(tip);
    content.appendChild(closeButton);
    modal.appendChild(content);
    
    // Add to document
    document.body.appendChild(modal);
}

// Show preferences modal
function showPreferencesModal() {
    // Create modal container
    const modal = document.createElement('div');
    modal.className = 'preferences-modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '9999';
    
    // Create modal content
    const content = document.createElement('div');
    content.className = 'modal-content';
    content.style.backgroundColor = 'var(--card-bg)';
    content.style.padding = '30px';
    content.style.borderRadius = '5px';
    content.style.maxWidth = '500px';
    content.style.width = '90%';
    content.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.5)';
    content.style.position = 'relative';
    content.style.animation = 'modalEnter 0.5s forwards';
    
    // Title
    const title = document.createElement('h2');
    title.textContent = 'Preferences';
    title.style.color = 'var(--primary)';
    title.style.marginBottom = '20px';
    title.style.textAlign = 'center';
    
    // Create preference options
    const prefsList = document.createElement('div');
    prefsList.style.marginBottom = '20px';
    
    // Theme preference
    const themeLabel = document.createElement('div');
    themeLabel.textContent = 'Theme:';
    themeLabel.style.fontWeight = 'bold';
    themeLabel.style.marginBottom = '10px';
    
    const themeOptions = document.createElement('div');
    themeOptions.style.display = 'flex';
    themeOptions.style.gap = '10px';
    themeOptions.style.marginBottom = '20px';
    
    const darkThemeBtn = document.createElement('button');
    darkThemeBtn.textContent = 'Dark';
    darkThemeBtn.style.backgroundColor = '#0a0a12';
    darkThemeBtn.style.color = '#f0f0f0';
    darkThemeBtn.style.border = '2px solid var(--primary)';
    darkThemeBtn.style.padding = '8px 15px';
    darkThemeBtn.style.borderRadius = '5px';
    darkThemeBtn.style.cursor = 'pointer';
    darkThemeBtn.style.fontFamily = "'Press Start 2P', cursive";
    darkThemeBtn.style.fontSize = '0.7rem';
    
    darkThemeBtn.addEventListener('click', () => {
        applyDarkTheme();
        localStorage.setItem('pixelChickTheme', 'dark');
    });
    
    const lightThemeBtn = document.createElement('button');
    lightThemeBtn.textContent = 'Light';
    lightThemeBtn.style.backgroundColor = '#f0f0f0';
    lightThemeBtn.style.color = '#333333';
    lightThemeBtn.style.border = '2px solid var(--primary)';
    lightThemeBtn.style.padding = '8px 15px';
    lightThemeBtn.style.borderRadius = '5px';
    lightThemeBtn.style.cursor = 'pointer';
    lightThemeBtn.style.fontFamily = "'Press Start 2P', cursive";
    lightThemeBtn.style.fontSize = '0.7rem';
    
    lightThemeBtn.addEventListener('click', () => {
        applyLightTheme();
        localStorage.setItem('pixelChickTheme', 'light');
    });
    
    // Animation preference
    const animLabel = document.createElement('div');
    animLabel.textContent = 'Animations:';
    animLabel.style.fontWeight = 'bold';
    animLabel.style.marginBottom = '10px';
    
    const animOptions = document.createElement('div');
    animOptions.style.display = 'flex';
    animOptions.style.gap = '10px';
    animOptions.style.marginBottom = '20px';
    
    const animOnBtn = document.createElement('button');
    animOnBtn.textContent = 'On';
    animOnBtn.style.backgroundColor = 'var(--primary)';
    animOnBtn.style.color = '#000';
    animOnBtn.style.border = 'none';
    animOnBtn.style.padding = '8px 15px';
    animOnBtn.style.borderRadius = '5px';
    animOnBtn.style.cursor = 'pointer';
    animOnBtn.style.fontFamily = "'Press Start 2P', cursive";
    animOnBtn.style.fontSize = '0.7rem';
    
    animOnBtn.addEventListener('click', () => {
        document.body.classList.remove('reduce-animations');
        localStorage.setItem('pixelChickAnimations', 'on');
    });
    
    const animOffBtn = document.createElement('button');
    animOffBtn.textContent = 'Reduced';
    animOffBtn.style.backgroundColor = 'var(--card-bg)';
    animOffBtn.style.color = 'var(--text)';
    animOffBtn.style.border = '2px solid var(--primary)';
    animOffBtn.style.padding = '8px 15px';
    animOffBtn.style.borderRadius = '5px';
    animOffBtn.style.cursor = 'pointer';
    animOffBtn.style.fontFamily = "'Press Start 2P', cursive";
    animOffBtn.style.fontSize = '0.7rem';
    
    animOffBtn.addEventListener('click', () => {
        document.body.classList.add('reduce-animations');
        
        // Add reduced animations style
        const reduceAnimStyle = document.createElement('style');
        reduceAnimStyle.id = 'reduce-animations-style';
        reduceAnimStyle.innerHTML = `
            .reduce-animations * {
                animation-duration: 0.001s !important;
                transition-duration: 0.001s !important;
            }
        `;
        
        document.head.appendChild(reduceAnimStyle);
        localStorage.setItem('pixelChickAnimations', 'off');
    });
    
    // Reset button
    const resetBtn = document.createElement('button');
    resetBtn.textContent = 'Reset All Preferences';
    resetBtn.style.backgroundColor = '#ff5252';
    resetBtn.style.color = '#fff';
    resetBtn.style.border = 'none';
    resetBtn.style.padding = '8px 15px';
    resetBtn.style.borderRadius = '5px';
    resetBtn.style.cursor = 'pointer';
    resetBtn.style.fontFamily = "'Press Start 2P', cursive";
    resetBtn.style.fontSize = '0.7rem';
    resetBtn.style.display = 'block';
    resetBtn.style.margin = '0 auto';
    
    resetBtn.addEventListener('click', () => {
        localStorage.removeItem('pixelChickTheme');
        localStorage.removeItem('pixelChickAnimations');
        location.reload();
    });
    
    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '&times;';
    closeBtn.style.position = 'absolute';
    closeBtn.style.top = '10px';
    closeBtn.style.right = '10px';
    closeBtn.style.backgroundColor = 'transparent';
    closeBtn.style.border = 'none';
    closeBtn.style.fontSize = '1.5rem';
    closeBtn.style.color = 'var(--text)';
    closeBtn.style.cursor = 'pointer';
    
    closeBtn.addEventListener('click', () => {
        // Add exit animation
        content.style.animation = 'modalExit 0.5s forwards';
        
        // Remove modal after animation
        setTimeout(() => {
            document.body.removeChild(modal);
        }, 500);
    });
    
    // Set active buttons based on current preferences
    const currentTheme = localStorage.getItem('pixelChickTheme') || 'dark';
    if (currentTheme === 'dark') {
        darkThemeBtn.style.backgroundColor = 'var(--primary)';
        darkThemeBtn.style.color = '#000';
        darkThemeBtn.style.border = 'none';
        
        lightThemeBtn.style.backgroundColor = 'var(--card-bg)';
        lightThemeBtn.style.color = 'var(--text)';
        lightThemeBtn.style.border = '2px solid var(--primary)';
    } else {
        lightThemeBtn.style.backgroundColor = 'var(--primary)';
        lightThemeBtn.style.color = '#000';
        lightThemeBtn.style.border = 'none';
        
        darkThemeBtn.style.backgroundColor = 'var(--card-bg)';
        darkThemeBtn.style.color = 'var(--text)';
        darkThemeBtn.style.border = '2px solid var(--primary)';
    }
    
    const currentAnim = localStorage.getItem('pixelChickAnimations') || 'on';
    if (currentAnim === 'on') {
        animOnBtn.style.backgroundColor = 'var(--primary)';
        animOnBtn.style.color = '#000';
        animOnBtn.style.border = 'none';
        
        animOffBtn.style.backgroundColor = 'var(--card-bg)';
        animOffBtn.style.color = 'var(--text)';
        animOffBtn.style.border = '2px solid var(--primary)';
    } else {
        animOffBtn.style.backgroundColor = 'var(--primary)';
        animOffBtn.style.color = '#000';
        animOffBtn.style.border = 'none';
        
        animOnBtn.style.backgroundColor = 'var(--card-bg)';
        animOnBtn.style.color = 'var(--text)';
        animOnBtn.style.border = '2px solid var(--primary)';
    }
    
    // Assemble the options
    themeOptions.appendChild(darkThemeBtn);
    themeOptions.appendChild(lightThemeBtn);
    
    animOptions.appendChild(animOnBtn);
    animOptions.appendChild(animOffBtn);
    
    prefsList.appendChild(themeLabel);
    prefsList.appendChild(themeOptions);
    prefsList.appendChild(animLabel);
    prefsList.appendChild(animOptions);
    
    // Assemble the modal
    content.appendChild(closeBtn);
    content.appendChild(title);
    content.appendChild(prefsList);
    content.appendChild(resetBtn);
    modal.appendChild(content);
    
    // Add to document
    document.body.appendChild(modal);
}

// Apply stored preferences on page load
function applyStoredPreferences() {
    const storedTheme = localStorage.getItem('pixelChickTheme');
    if (storedTheme === 'light') {
        applyLightTheme();
    } else {
        applyDarkTheme();
    }
    
    const storedAnim = localStorage.getItem('pixelChickAnimations');
    if (storedAnim === 'off') {
        document.body.classList.add('reduce-animations');
        
        // Add reduced animations style
        const reduceAnimStyle = document.createElement('style');
        reduceAnimStyle.id = 'reduce-animations-style';
        reduceAnimStyle.innerHTML = `
            .reduce-animations * {
                animation-duration: 0.001s !important;
                transition-duration: 0.001s !important;
            }
        `;
        
        document.head.appendChild(reduceAnimStyle);
    }
}

// Initialize user preferences
setTimeout(() => {
    applyStoredPreferences();
    handleUserPreferences();
}, 2000);

// Performance optimizations
function optimizePerformance() {
    // Lazy load images
    document.querySelectorAll('img').forEach(img => {
        img.setAttribute('loading', 'lazy');
    });
    
    // Debounce scroll events
    let scrollTimeout: number;
    window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            // Check which sections are in view
            document.querySelectorAll('.content-section').forEach(section => {
                if (isElementInViewport(section)) {
                    // Animate elements within the visible section
                    animateVisibleElements(section);
                }
            });
        }, 100) as unknown as number;
    });
    
    // Throttle resize events
    let resizeThrottleTimeout: number;
    window.addEventListener('resize', () => {
        if (!resizeThrottleTimeout) {
            resizeThrottleTimeout = setTimeout(() => {
                resizeThrottleTimeout = 0;
                // Handle resize if needed
            }, 250) as unknown as number;
        }
    });
}

// Check if element is in viewport
function isElementInViewport(el: Element) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.bottom >= 0
    );
}

// Animate elements that become visible
function animateVisibleElements(container: Element) {
    const animElements = container.querySelectorAll('.equipment-item, .health-item, .timeline-item, .feed-item');
    
    animElements.forEach((element, index) => {
        if (isElementInViewport(element) && !element.classList.contains('has-animated')) {
            setTimeout(() => {
                element.classList.add('has-animated');
                element.animate([
                    { opacity: 0, transform: 'translateY(20px)' },
                    { opacity: 1, transform: 'translateY(0)' }
                ], {
                    duration: 300,
                    easing: 'ease-out',
                    fill: 'forwards'
                });
            }, index * 100);
        }
    });
}

// Initialize performance optimizations
setTimeout(optimizePerformance, 2000);

// Add debug mode (hidden feature for developers)
function initDebugMode() {
    // Detect debug mode activation
    const debugSequence = [];
    const debugCode = 'debug';
    
    document.addEventListener('keydown', (e) => {
        debugSequence.push(e.key);
        
        // Keep only the last 5 keys
        if (debugSequence.length > 5) {
            debugSequence.shift();
        }
        
        // Check if sequence matches debug code
        if (debugSequence.join('').toLowerCase() === debugCode) {
            toggleDebugMode();
            debugSequence.length = 0; // Clear sequence
        }
    });
}

// Toggle debug mode
function toggleDebugMode() {
    const isDebugMode = document.body.classList.toggle('debug-mode');
    
    if (isDebugMode) {
        // Create debug panel
        const debugPanel = document.createElement('div');
        debugPanel.id = 'debug-panel';
        debugPanel.style.position = 'fixed';
        debugPanel.style.top = '0';
        debugPanel.style.right = '0';
        debugPanel.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        debugPanel.style.color = '#00ff00';
        debugPanel.style.padding = '10px';
        debugPanel.style.fontFamily = 'monospace';
        debugPanel.style.fontSize = '12px';
        debugPanel.style.zIndex = '10000';
        debugPanel.style.maxHeight = '300px';
        debugPanel.style.overflow = 'auto';
        debugPanel.style.width = '300px';
        
        // Add debug info
        debugPanel.innerHTML = `
            <h3>Debug Mode</h3>
            <p>User Agent: ${navigator.userAgent}</p>
            <p>Screen: ${window.innerWidth}x${window.innerHeight}</p>
            <p>Theme: ${localStorage.getItem('pixelChickTheme') || 'dark'}</p>
            <p>Animations: ${localStorage.getItem('pixelChickAnimations') || 'on'}</p>
            <hr>
            <button id="debug-reset">Reset Storage</button>
            <button id="debug-simulate-mobile">Simulate Mobile</button>
            <button id="debug-force-error">Test Error Handling</button>
            <hr>
            <div id="debug-log"></div>
        `;
        
        document.body.appendChild(debugPanel);
        
        // Add event listeners for debug buttons
        document.getElementById('debug-reset')?.addEventListener('click', () => {
            localStorage.clear();
            logDebug('Storage cleared');
        });
        
        document.getElementById('debug-simulate-mobile')?.addEventListener('click', () => {
            document.body.style.width = '360px';
            document.body.style.margin = '0 auto';
            logDebug('Mobile simulation active');
        });
        
        document.getElementById('debug-force-error')?.addEventListener('click', () => {
            try {
                throw new Error('Test error triggered');
            } catch (error) {
                logDebug(`Error: ${error.message}`);
                handleError(error);
            }
        });
        
        // Override console.log for debugging
        const originalLog = console.log;
        console.log = function() {
            // Call the original console.log
            originalLog.apply(console, arguments);
            
            // Add to debug log
            const logMessage = Array.from(arguments).join(' ');
            logDebug(logMessage);
        };
        
        logDebug('Debug mode activated');
    } else {
        // Remove debug panel if it exists
        const debugPanel = document.getElementById('debug-panel');
        if (debugPanel) {
            document.body.removeChild(debugPanel);
        }
        
        // Restore console.log
        console.log = window.console.log;
    }
}

// Log to debug panel
function logDebug(message: string) {
    const debugLog = document.getElementById('debug-log');
    if (debugLog) {
        const logEntry = document.createElement('div');
        logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        logEntry.style.borderBottom = '1px solid #333';
        logEntry.style.padding = '3px 0';
        
        debugLog.appendChild(logEntry);
        debugLog.scrollTop = debugLog.scrollHeight;
    }
}

// Error handling
function handleError(error: Error) {
    console.error('Error:', error);
    
    // Only show user-friendly error in production
    if (!document.body.classList.contains('debug-mode')) {
        // Create a pixel-styled error toast
        const errorToast = document.createElement('div');
        errorToast.style.position = 'fixed';
        errorToast.style.bottom = '20px';
        errorToast.style.left = '50%';
        errorToast.style.transform = 'translateX(-50%)';
        errorToast.style.backgroundColor = '#ff5252';
        errorToast.style.color = '#fff';
        errorToast.style.padding = '10px 20px';
        errorToast.style.borderRadius = '5px';
        errorToast.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
        errorToast.style.fontFamily = "'Press Start 2P', cursive";
        errorToast.style.fontSize = '0.7rem';
        errorToast.style.zIndex = '10000';
        errorToast.textContent = 'Something went wrong. Please refresh the page.';
        
        document.body.appendChild(errorToast);
        
        // Remove after 5 seconds
        setTimeout(() => {
            document.body.removeChild(errorToast);
        }, 5000);
    }
}

// Initialize debug mode
initDebugMode();

// Global error handling
window.addEventListener('error', (event) => {
    handleError(event.error);
});

// Init function to start application
function initApp() {
    console.log('Pixel Chick Care Guide initialized!');
    
    // Set application version (for debug purposes)
    window.appVersion = '1.0.0';
    
    // Add any final initialization steps here
}

// Call init after everything else is loaded
setTimeout(initApp, 3000);
