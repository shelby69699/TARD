// TARD Token Website Interactive Elements

// DOM Elements
const hero = document.querySelector('.hero');
const tardCharacter = document.querySelector('.tard-character');
const ctaButtons = document.querySelectorAll('.cta-button, .mega-buy-button');
const featureCards = document.querySelectorAll('.feature-card');
const aboutCards = document.querySelectorAll('.about-card');

// Create floating meme texts
const memeTexts = [
    "TO THE MOON! 🚀",
    "DIAMOND HANDS! 💎",
    "HODL! 📈",
    "MOON SOON! 🌙",
    "TARD STRONG! 💪",
    "SNEK POWER! 🐍",
    "RETARD ENERGY! ⚡",
    "MEME MAGIC! ✨"
];

// Sound effects (using Web Audio API)
let audioContext;

function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function createBeep(frequency = 440, duration = 200, type = 'sine') {
    initAudio();
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration / 1000);
}

// Play meme sound function
function playMemeSound() {
    // Play a sequence of silly beeps
    createBeep(440, 100);
    setTimeout(() => createBeep(880, 100), 100);
    setTimeout(() => createBeep(660, 100), 200);
    setTimeout(() => createBeep(1320, 200), 300);
    
    // Add visual feedback
    const button = event.target;
    button.style.transform = 'scale(0.9) rotate(360deg)';
    setTimeout(() => {
        button.style.transform = 'scale(1) rotate(0deg)';
    }, 500);
    
    // Create floating text
    createFloatingMeme(button);
}

// Create floating meme text
function createFloatingMeme(origin) {
    const memeText = document.createElement('div');
    memeText.textContent = memeTexts[Math.floor(Math.random() * memeTexts.length)];
    memeText.style.cssText = `
        position: fixed;
        z-index: 9999;
        font-size: 2rem;
        font-weight: bold;
        color: #ffd700;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
        pointer-events: none;
        font-family: 'Comic Neue', cursive;
    `;
    
    const rect = origin.getBoundingClientRect();
    memeText.style.left = rect.left + 'px';
    memeText.style.top = rect.top + 'px';
    
    document.body.appendChild(memeText);
    
    // Animate the floating text
    memeText.animate([
        { 
            transform: 'translateY(0) scale(1) rotate(0deg)', 
            opacity: 1 
        },
        { 
            transform: 'translateY(-100px) scale(1.5) rotate(10deg)', 
            opacity: 0 
        }
    ], {
        duration: 2000,
        easing: 'ease-out'
    }).onfinish = () => {
        document.body.removeChild(memeText);
    };
}

// Create random stars
function createStar() {
    const star = document.createElement('div');
    star.innerHTML = '⭐';
    star.style.cssText = `
        position: fixed;
        z-index: -1;
        font-size: ${Math.random() * 20 + 10}px;
        left: ${Math.random() * 100}vw;
        top: ${Math.random() * 100}vh;
        animation: twinkle ${Math.random() * 3 + 2}s infinite;
        pointer-events: none;
    `;
    
    document.body.appendChild(star);
    
    setTimeout(() => {
        if (star.parentNode) {
            document.body.removeChild(star);
        }
    }, 5000);
}

// Create shooting stars
function createShootingStar() {
    const star = document.createElement('div');
    star.innerHTML = '💫';
    star.style.cssText = `
        position: fixed;
        z-index: -1;
        font-size: 20px;
        left: -50px;
        top: ${Math.random() * 50}vh;
        pointer-events: none;
    `;
    
    document.body.appendChild(star);
    
    star.animate([
        { left: '-50px', top: star.style.top },
        { left: '100vw', top: `${parseInt(star.style.top) + 200}px` }
    ], {
        duration: 3000,
        easing: 'linear'
    }).onfinish = () => {
        if (star.parentNode) {
            document.body.removeChild(star);
        }
    };
}

// Mouse trail effect
let mouseTrail = [];
function createMouseTrail(e) {
    const trail = document.createElement('div');
    trail.innerHTML = '🐍';
    trail.style.cssText = `
        position: fixed;
        z-index: 9998;
        font-size: 20px;
        left: ${e.clientX}px;
        top: ${e.clientY}px;
        pointer-events: none;
        transition: opacity 1s ease-out;
    `;
    
    document.body.appendChild(trail);
    mouseTrail.push(trail);
    
    // Limit trail length
    if (mouseTrail.length > 5) {
        const oldTrail = mouseTrail.shift();
        if (oldTrail.parentNode) {
            document.body.removeChild(oldTrail);
        }
    }
    
    // Fade out and remove
    setTimeout(() => {
        trail.style.opacity = '0';
        setTimeout(() => {
            if (trail.parentNode) {
                document.body.removeChild(trail);
            }
        }, 1000);
    }, 200);
}

// Konami code easter egg
let konamiCode = [];
const konamiSequence = [
    'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
    'KeyB', 'KeyA'
];

function checkKonamiCode(key) {
    konamiCode.push(key);
    
    if (konamiCode.length > konamiSequence.length) {
        konamiCode.shift();
    }
    
    if (konamiCode.length === konamiSequence.length &&
        konamiCode.every((key, index) => key === konamiSequence[index])) {
        activateSecretMode();
        konamiCode = [];
    }
}

function activateSecretMode() {
    // Create explosion of emojis
    const emojis = ['🚀', '💎', '🌙', '⚡', '🔥', '💰', '🎉', '🎊'];
    
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const emoji = document.createElement('div');
            emoji.innerHTML = emojis[Math.floor(Math.random() * emojis.length)];
            emoji.style.cssText = `
                position: fixed;
                z-index: 9999;
                font-size: 30px;
                left: ${Math.random() * 100}vw;
                top: ${Math.random() * 100}vh;
                pointer-events: none;
            `;
            
            document.body.appendChild(emoji);
            
            emoji.animate([
                { transform: 'scale(1) rotate(0deg)', opacity: 1 },
                { transform: 'scale(2) rotate(360deg)', opacity: 0 }
            ], {
                duration: 2000,
                easing: 'ease-out'
            }).onfinish = () => {
                if (emoji.parentNode) {
                    document.body.removeChild(emoji);
                }
            };
        }, i * 50);
    }
    
    // Play celebration sound
    for (let i = 0; i < 8; i++) {
        setTimeout(() => {
            createBeep(440 + i * 110, 100);
        }, i * 100);
    }
    
    // Show secret message
    const secretMsg = document.createElement('div');
    secretMsg.innerHTML = '🎉 ULTRA TARD MODE ACTIVATED! 🎉';
    secretMsg.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 10000;
        font-size: 3rem;
        font-weight: bold;
        color: #ffd700;
        text-shadow: 3px 3px 6px rgba(0,0,0,0.8);
        text-align: center;
        background: rgba(0,0,0,0.8);
        padding: 2rem;
        border-radius: 20px;
        border: 3px solid #ffd700;
    `;
    
    document.body.appendChild(secretMsg);
    
    setTimeout(() => {
        if (secretMsg.parentNode) {
            document.body.removeChild(secretMsg);
        }
    }, 3000);
}

// Add crazy hover effects to TARD character
function addTardEffects() {
    if (tardCharacter) {
        tardCharacter.addEventListener('mouseenter', () => {
            tardCharacter.style.animation = 'shake 0.5s infinite';
            createBeep(800, 300, 'square');
        });
        
        tardCharacter.addEventListener('mouseleave', () => {
            tardCharacter.style.animation = 'float 3s ease-in-out infinite';
        });
        
        tardCharacter.addEventListener('click', () => {
            // Spin the character
            tardCharacter.style.transform = 'rotate(720deg) scale(1.2)';
            tardCharacter.style.transition = 'transform 1s ease';
            
            setTimeout(() => {
                tardCharacter.style.transform = 'rotate(0deg) scale(1)';
            }, 1000);
            
            // Create explosion effect
            createFloatingMeme(tardCharacter);
            
            // Play sound effect
            createBeep(1000, 500, 'sawtooth');
        });
    }
}

// Add click effects to buy buttons
function addButtonEffects() {
    ctaButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            // Create ripple effect
            const ripple = document.createElement('span');
            const rect = button.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.5);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            `;
            
            button.style.position = 'relative';
            button.style.overflow = 'hidden';
            button.appendChild(ripple);
            
            setTimeout(() => {
                if (ripple.parentNode) {
                    ripple.parentNode.removeChild(ripple);
                }
            }, 600);
            
            // Play buy sound
            createBeep(660, 100);
            setTimeout(() => createBeep(880, 200), 100);
        });
    });
}

// Add CSS for ripple animation
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Parallax scrolling effect
function handleScroll() {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.tard-character, .hero-title');
    
    parallaxElements.forEach(element => {
        const speed = 0.5;
        element.style.transform = `translateY(${scrolled * speed}px)`;
    });
}

// Random meme popup
function showRandomMeme() {
    if (Math.random() < 0.1) { // 10% chance
        const memes = [
            "💎 DIAMOND HANDS ACTIVATED!",
            "🚀 NEXT STOP: MOON!",
            "🐍 SNEK ENERGY RISING!",
            "💰 TARD MAKING YOU RICH!",
            "⚡ MEME POWER OVER 9000!"
        ];
        
        const meme = document.createElement('div');
        meme.innerHTML = memes[Math.floor(Math.random() * memes.length)];
        meme.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            background: linear-gradient(45deg, #ff6b6b, #ffd700);
            color: #000;
            padding: 1rem;
            border-radius: 10px;
            font-weight: bold;
            box-shadow: 0 10px 20px rgba(0,0,0,0.3);
            animation: slideIn 0.5s ease-out;
        `;
        
        document.body.appendChild(meme);
        
        setTimeout(() => {
            meme.style.animation = 'slideOut 0.5s ease-in';
            setTimeout(() => {
                if (meme.parentNode) {
                    document.body.removeChild(meme);
                }
            }, 500);
        }, 3000);
    }
}

// Add slide animations
const slideStyle = document.createElement('style');
slideStyle.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(slideStyle);

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🐍 TARD Token Website Loaded! Welcome to the dumbest token on Cardano! 🚀');
    
    // Add all effects
    addTardEffects();
    addButtonEffects();
    
    // Event listeners
    document.addEventListener('mousemove', createMouseTrail);
    document.addEventListener('keydown', (e) => checkKonamiCode(e.code));
    window.addEventListener('scroll', handleScroll);
    
    // Start background effects
    setInterval(createStar, 2000);
    setInterval(createShootingStar, 5000);
    setInterval(showRandomMeme, 10000);
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Add intersection observer for animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 1s ease-out';
            }
        });
    });
    
    // Observe all cards and sections
    document.querySelectorAll('.about-card, .feature-card, .roadmap-item').forEach(el => {
        observer.observe(el);
    });
    
    // Easter egg: Click logo 10 times
    let logoClicks = 0;
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.addEventListener('click', () => {
            logoClicks++;
            if (logoClicks >= 10) {
                activateSecretMode();
                logoClicks = 0;
            }
        });
    }
});

// Add fade in animation
const fadeStyle = document.createElement('style');
fadeStyle.textContent = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(fadeStyle);

// Prevent context menu on meme elements (for fun)
document.addEventListener('contextmenu', (e) => {
    if (e.target.closest('.tard-character, .hero-title')) {
        e.preventDefault();
        createFloatingMeme(e.target);
    }
});

// Console easter eggs
console.log(`
🐍 Welcome to $TARD Token! 🐍

Try these easter eggs:
1. Click the TARD character
2. Use the Konami Code: ↑↑↓↓←→←→BA
3. Click the logo 10 times
4. Right-click on the character or title

$TARD: Making your wallet look sexy since 2024!
`);

// Export for global access
window.playMemeSound = playMemeSound;
window.createFloatingMeme = createFloatingMeme;
