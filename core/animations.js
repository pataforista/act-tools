/**
 * ACT In-Session - Animation Utilities (Anime.js)
 */

export function animateBreathing(selector) {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    return anime({
        targets: selector,
        scale: [0.6, 1.2],
        duration: 4000,
        easing: 'easeInOutSine',
        direction: 'alternate',
        loop: true
    });
}

export function animateDefusion(selector) {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    return anime({
        targets: selector,
        translateX: () => anime.random(-15, 15),
        translateY: () => anime.random(-15, 15),
        rotate: () => anime.random(-3, 3),
        duration: () => anime.random(5000, 8000), // Slower for clinical comfort
        easing: 'easeInOutSine',
        direction: 'alternate',
        loop: true
    });
}

export function animateLeaves(selector) {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    return anime({
        targets: selector,
        translateX: ['-10%', '110%'],
        translateY: () => anime.random(-10, 10),
        rotate: () => anime.random(-20, 20),
        duration: () => anime.random(12000, 18000), // Very slow flow
        easing: 'linear',
        delay: anime.stagger(2000),
        loop: true
    });
}

export function animateWeather(selector) {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    return anime({
        targets: selector,
        translateX: ['-100%', '100%'],
        duration: 30000,
        easing: 'linear',
        loop: true
    });
}

export function animatePulse(selector) {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    return anime({
        targets: selector,
        opacity: [0.4, 0.8],
        scale: [1, 1.05],
        duration: 1500,
        easing: 'easeInOutSine',
        direction: 'alternate',
        loop: true
    });
}

export function animateHexaflexEntrance(selector) {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return anime({
            targets: selector,
            scale: [1, 1],
            opacity: [1, 1],
            duration: 0
        });
    }
    return anime({
        targets: selector,
        scale: [0, 1],
        opacity: [0, 1],
        delay: anime.stagger(100),
        duration: 800,
        easing: 'easeOutElastic(1, .6)'
    });
}
