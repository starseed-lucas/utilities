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
        });
        
        closeBtn.addEventListener('click', () => {
            scheduleModal.style.display = 'none';
        });
        
        window.addEventListener('click', (e) => {
            if (e.target === scheduleModal) {
                scheduleModal.style.display = 'none';
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
            
            // Update content
            issueContents.forEach(content => content.classList.remove('active'));
            document.getElementById(`${targetIssue}-content`).classList.add('active');
        });
    });
    
    // Pro tips tabs functionality
    tipBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTip = btn.getAttribute('data-tip');
            
            // Update buttons
            tipBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update content
            tipDetails.forEach(detail => detail.classList.remove('active'));
            document.getElementById(`${targetTip}-tips`).classList.add('active');
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
});

// Update chick behavior based on temperature
function updateChickBehavior(temp) {
    const behaviorText = document.getElementById('behavior-text');
    const chicks = document.querySelectorAll('.brooder-chick');
    const brooder = document.querySelector('.brooder-container');
    
    if (temp > 90) {
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
            }
            
            chick.style.transition = 'all 2s ease-in-out';
            chick.style.left = `${x}%`;
            chick.style.top = `${y}%`;
            
            // Remove any previous animation
            chick.style.animation = 'none';
        });
        
        brooder.style.boxShadow = 'inset 0 0 20px rgba(255, 82, 82, 0.8)';
    } else if (temp < 75) {
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
        });
        
        brooder.style.boxShadow = 'inset 0 0 20px rgba(33, 150, 243, 0.8)';
    } else {
        // Just right - chicks move freely
        behaviorText.textContent = 'Just Right';
        behaviorText.style.color = '#8BC34A';
        chicks.forEach((chick, index) => {
            chick.style.transition = 'none';
            
            // Reset positions and restart animations with delay
            chick.style.top = `${40 + index * 10}%`;
            chick.style.left = `${30 + index * 20}%`;
            
            // Add animated movement
            const animationDuration = 8 + index * 2;
            const animationDelay = index;
            chick.style.animation = `walkAround ${animationDuration}s infinite ${animationDelay}s`;
        });
        
        brooder.style.boxShadow = 'inset 0 0 20px rgba(139, 195, 74, 0.3)';
    }
}

// Update heater glow intensity based on temperature
function updateHeaterGlow(temp) {
    const heater = document.querySelector('.brooder-heater');
    const intensity = (temp - 65) / 30; // Map 65-95 to 0-1
    
    heater.style.boxShadow = `0 0 ${20 * intensity}px rgba(255, 82, 82, ${0.4 + intensity * 0.4})`;
}

// Add pixelated movement effect
function addPixelatedMovement(element) {
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
}

// Add glow pulse effect to elements
function addGlowPulseEffect() {
    const glowElements = document.querySelectorAll('.pixel-text.glow-text');
    
    glowElements.forEach(element => {
        // Random start delay for more natural effect
        const delay = Math.random() * 3;
        element.style.animationDelay = `${delay}s`;
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
function addPixelatedHoverEffect(element) {
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
    
    // Remove after animation completes
    setTimeout(() => {
        element.removeChild(highlight);
    }, 300);
}

// Add temperature bar animation
function addTemperatureBarAnimation(bar) {
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
                    }, 100);
                }, 200);
                
                observer.unobserve(bar);
            }
        });
    });
    
    observer.observe(bar);
}

// Add section entrance animation
function animateSectionEntrance(section) {
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
        }, 100 * index);
    });
}

// Initialize pixelated noise effect
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
}
