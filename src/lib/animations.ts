// GSAP animation presets for Digital Darzi

export const fadeUp = {
  from: { opacity: 0, y: 40 },
  to: { opacity: 1, y: 0, duration: 0.7, ease: "power4.out" },
};

export const fadeIn = {
  from: { opacity: 0 },
  to: { opacity: 1, duration: 0.5, ease: "power2.out" },
};

export const slideInLeft = {
  from: { opacity: 0, x: -60 },
  to: { opacity: 1, x: 0, duration: 0.7, ease: "power4.out" },
};

export const slideInRight = {
  from: { opacity: 0, x: 60 },
  to: { opacity: 1, x: 0, duration: 0.7, ease: "power4.out" },
};

export const scaleIn = {
  from: { opacity: 0, scale: 0.9 },
  to: { opacity: 1, scale: 1, duration: 0.6, ease: "power3.out" },
};

export const scrollTriggerDefaults = {
  start: "top 80%",
  toggleActions: "play none none none",
};

export const STAGGER_TEXT = 0.06;
export const STAGGER_CARDS = 0.08;
export const STAGGER_ITEMS = 0.1;
