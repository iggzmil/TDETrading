// Enhanced Animation System
// This file provides a unified approach to animations using GSAP

// Initialize GSAP and ScrollTrigger with proper error handling
let gsapInitialized = false;

function initializeGSAP() {
    if (typeof gsap === 'undefined') {

        return false;
    }

    if (typeof ScrollTrigger === 'undefined') {

        return false;
    }

    try {
        gsap.registerPlugin(ScrollTrigger);
        gsapInitialized = true;
        return true;
    } catch (error) {

        return false;
    }
}

// Animation presets mapping with improved timing and easing
const animationPresets = {
  fadeIn: {
    opacity: 0,
    animation: { opacity: 1, duration: 0.8, ease: "power2.out" }
  },
  fadeInUp: {
    opacity: 0,
    y: 40, // Reduced from 50 for subtler effect
    animation: { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" }
  },
  fadeInDown: {
    opacity: 0,
    y: -40, // Reduced from -50 for subtler effect
    animation: { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" }
  },
  fadeInLeft: {
    opacity: 0,
    x: -40, // Reduced from -50 for subtler effect
    animation: { opacity: 1, x: 0, duration: 0.7, ease: "power2.out" }
  },
  fadeInRight: {
    opacity: 0,
    x: 40, // Reduced from 50 for subtler effect
    animation: { opacity: 1, x: 0, duration: 0.7, ease: "power2.out" }
  },
  zoomIn: {
    opacity: 0,
    scale: 0.85, // Changed from 0.7 for subtler effect
    animation: { opacity: 1, scale: 1, duration: 0.7, ease: "back.out(1.2)" }
  },
  bounceIn: {
    opacity: 0,
    scale: 0.5, // Changed from 0.3 for better effect
    animation: { opacity: 1, scale: 1, duration: 0.8, ease: "elastic.out(1, 0.5)" }
  },
  // Special animation for service-steps-box items
  serviceStepItem: {
    opacity: 0,
    y: 20, // Reduced from 30 for subtler effect
    scale: 0.97, // Increased from 0.95 for subtler effect
    animation: { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power2.out" }
  }
};

// Initialize animations for elements with animation classes
function initScrollAnimations() {
  // Only proceed if GSAP is properly initialized
  if (!gsapInitialized && !initializeGSAP()) {

    return;
  }

  // Enhanced handling for service-step-item elements in service-steps-box
  const serviceStepItems = document.querySelectorAll('.service-steps-box .service-step-item');
  if (serviceStepItems.length > 0) {
    // Get the parent container for all service step items
    const container = serviceStepItems[0].closest('.service-steps-box');

    // Create an array of items that haven't been processed yet
    const unprocessedItems = Array.from(serviceStepItems).filter(item => !item.hasAttribute('data-animation-processed'));

    if (unprocessedItems.length > 0) {
      // Mark all items as processed
      unprocessedItems.forEach(item => {
        item.setAttribute('data-animation-processed', 'true');
      });

      // Apply the special service step animation
      const preset = animationPresets['serviceStepItem'];

      // Apply initial state to all items at once (better performance)
      gsap.set(unprocessedItems, preset);

      // Create a single ScrollTrigger for the entire container
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top 85%",
          toggleActions: "play none none none",
          once: true,
          markers: false
        }
      });

      // Add all items to the timeline with staggered animation
      tl.to(unprocessedItems, {
        ...preset.animation,
        stagger: 0.08, // Reduced from 0.15 for faster overall animation
        ease: "power2.out",
        clearProps: "transform", // Clean up transform properties after animation
        onComplete: function() {}
      });
    }
  }

  // Find all elements with animation classes, including those with 'wow' class
  const animationElements = document.querySelectorAll('.fadeIn, .fadeInUp, .fadeInDown, .fadeInLeft, .fadeInRight, .zoomIn, .bounceIn, .wow');

  // Process each element
  animationElements.forEach(element => {
    // Skip elements that have already been processed
    if (element.hasAttribute('data-animation-processed')) {
      return;
    }

    // Skip service-step-items as they're handled separately
    if (element.classList.contains('service-step-item') &&
        element.closest('.service-steps-box')) {
      return;
    }

    // Mark element as processed to avoid duplicate animations
    element.setAttribute('data-animation-processed', 'true');

    // Determine animation type from class names
    const classes = Array.from(element.classList);
    let animationType = classes.find(cls => animationPresets[cls]);

    // Handle elements with 'wow' class
    if (!animationType && classes.includes('wow')) {
      // Check for fadeIn, fadeUp, etc. in the class list
      if (classes.includes('fadeInUp')) animationType = 'fadeInUp';
      else if (classes.includes('fadeIn')) animationType = 'fadeIn';
      else if (classes.includes('fadeInDown')) animationType = 'fadeInDown';
      else if (classes.includes('fadeInLeft')) animationType = 'fadeInLeft';
      else if (classes.includes('fadeInRight')) animationType = 'fadeInRight';
      else if (classes.includes('zoomIn')) animationType = 'zoomIn';
      else if (classes.includes('bounceIn')) animationType = 'bounceIn';
      else animationType = 'fadeIn'; // Default animation for 'wow' class
    }

    if (!animationType) return;

    // Get animation settings
    const preset = animationPresets[animationType];
    if (!preset) return;

    // Get delay if specified with data attribute
    let delay = 0;
    const delayAttr = element.getAttribute('data-delay') || element.getAttribute('data-wow-delay');
    if (delayAttr) {
      // Parse the delay value (e.g., "0.2s" -> 0.2)
      const delayMatch = delayAttr.match(/^([\d.]+)s?$/);
      if (delayMatch) {
        delay = parseFloat(delayMatch[1]);
      }
    }

    // Get duration if specified
    let duration = preset.animation.duration;
    const durationAttr = element.getAttribute('data-duration') || element.getAttribute('data-wow-duration');
    if (durationAttr) {
      const durationMatch = durationAttr.match(/^([\d.]+)s?$/);
      if (durationMatch) {
        duration = parseFloat(durationMatch[1]);
      }
    }

    // Get iteration count if specified
    let repeat = 0; // 0 means play once (no repeat)
    const iterationAttr = element.getAttribute('data-iteration');
    if (iterationAttr) {
      repeat = parseInt(iterationAttr) - 1; // GSAP repeat is 0-based
      if (isNaN(repeat) || repeat < 0) {
        repeat = 0;
      }
    }

    // Apply initial state
    gsap.set(element, preset);

    // Create ScrollTrigger animation with improved trigger settings
    gsap.to(element, {
      ...preset.animation,
      duration: duration,
      delay: delay,
      repeat: repeat,
      scrollTrigger: {
        trigger: element,
        start: "top 85%", // Trigger earlier (when element is 15% into the viewport)
        toggleActions: "play none none none", // Play animation once when enters viewport
        once: true // Ensure animation only plays once
      }
    });
  });
}

// Function to handle animations for dynamically added content
function refreshAnimations() {
  // Check for new service-step-item elements
  const newServiceStepItems = document.querySelectorAll('.service-steps-box .service-step-item:not([data-animation-processed])');

  // Find all other elements that haven't been processed yet
  const newElements = document.querySelectorAll('.fadeIn:not([data-animation-processed]), .fadeInUp:not([data-animation-processed]), .fadeInDown:not([data-animation-processed]), .fadeInLeft:not([data-animation-processed]), .fadeInRight:not([data-animation-processed]), .zoomIn:not([data-animation-processed]), .bounceIn:not([data-animation-processed]), .wow:not([data-animation-processed])');

  if (newServiceStepItems.length > 0 || newElements.length > 0) {

    initScrollAnimations();
  }
}

// Initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initial animation setup
  initScrollAnimations();

  // Set up a MutationObserver to detect new content
  const observer = new MutationObserver(function(mutations) {
    let needsRefresh = false;

    mutations.forEach(function(mutation) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        // Check if any added nodes have animation classes
        mutation.addedNodes.forEach(function(node) {
          if (node.nodeType === 1) { // Element node
            if (
              node.classList &&
              (node.classList.contains('fadeIn') ||
               node.classList.contains('fadeInUp') ||
               node.classList.contains('fadeInDown') ||
               node.classList.contains('fadeInLeft') ||
               node.classList.contains('fadeInRight') ||
               node.classList.contains('zoomIn') ||
               node.classList.contains('bounceIn') ||
               node.classList.contains('wow'))
            ) {
              needsRefresh = true;
            } else if (node.querySelector) {
              // Check for animation classes in children
              const hasAnimatedChildren = node.querySelector('.fadeIn, .fadeInUp, .fadeInDown, .fadeInLeft, .fadeInRight, .zoomIn, .bounceIn, .wow');
              if (hasAnimatedChildren) {
                needsRefresh = true;
              }
            }
          }
        });
      }
    });

    if (needsRefresh) {
      // Debounce the refresh to avoid multiple calls
      clearTimeout(window.animationRefreshTimeout);
      window.animationRefreshTimeout = setTimeout(refreshAnimations, 100);
    }
  });

  // Start observing the document with the configured parameters
  observer.observe(document.body, { childList: true, subtree: true });
});

// For dynamic content or single-page applications
// Export function to be called after content updates
window.initScrollAnimations = initScrollAnimations;
window.refreshAnimations = refreshAnimations;

// Backward compatibility for any code that might expect the old API
window.syncAnimations = initScrollAnimations;