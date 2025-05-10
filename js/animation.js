/**
 * Animation script for Dipesh Bham's Portfolio
 * Creates animated particles in the hero section background
 */

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    // Initialize particles
    initParticles();
});

// Create and animate particles
function initParticles() {
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer) return;
    
    // Clear any existing particles
    particlesContainer.innerHTML = '';
    
    // Create particles - adjust count based on device size and performance
    let particleCount;
    if (window.innerWidth < 480) {
        particleCount = 15; // Very small devices
    } else if (window.innerWidth < 768) {
        particleCount = 25; // Mobile devices
    } else if (window.innerWidth < 1200) {
        particleCount = 40; // Tablets and small laptops
    } else {
        particleCount = 50; // Large screens
    }
    
    // Reduce particles further if device might have performance issues
    if (navigator.userAgent.match(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i)) {
        particleCount = Math.floor(particleCount * 0.6); // 40% reduction for mobile devices
    }
    
    for (let i = 0; i < particleCount; i++) {
        createParticle(particlesContainer);
    }
}

// Create a single particle
function createParticle(container) {
    const particle = document.createElement('div');
    particle.classList.add('particle');
    
    // Random size between 2-8px
    const size = Math.random() * 6 + 2;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    
    // Random position
    const posX = Math.random() * 100;
    const posY = Math.random() * 100;
    particle.style.left = `${posX}%`;
    particle.style.top = `${posY}%`;
    
    // Random opacity
    particle.style.opacity = Math.random() * 0.5 + 0.1;
    
    // Random color variation (shades of blue)
    const hue = 220 + Math.random() * 40; // Blue range
    const saturation = 70 + Math.random() * 30;
    const lightness = 50 + Math.random() * 20;
    particle.style.backgroundColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    
    // Add animation
    const duration = Math.random() * 20 + 10; // 10-30 seconds
    const delay = Math.random() * 5;
    
    // Animate movement
    particle.style.animation = `
        floatParticle ${duration}s ease-in-out ${delay}s infinite alternate,
        fadeInOut ${duration / 2}s ease-in-out ${delay}s infinite alternate
    `;
    
    // Add to container
    container.appendChild(particle);
}

// Add animation keyframes
const style = document.createElement('style');
style.textContent = `
    @keyframes floatParticle {
        0% {
            transform: translate(0, 0);
        }
        100% {
            transform: translate(${Math.random() > 0.5 ? '+' : '-'}${Math.random() * 100 + 50}px, 
                               ${Math.random() > 0.5 ? '+' : '-'}${Math.random() * 100 + 50}px);
        }
    }
    
    @keyframes fadeInOut {
        0% {
            opacity: 0.1;
        }
        50% {
            opacity: 0.5;
        }
        100% {
            opacity: 0.1;
        }
    }
`;
document.head.appendChild(style);

// Reinitialize particles on window resize
window.addEventListener('resize', function() {
    // Debounce resize event
    clearTimeout(window.resizeTimer);
    window.resizeTimer = setTimeout(function() {
        initParticles();
    }, 250);
});
