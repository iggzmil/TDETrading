// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get the CTA button
    const ctaButtons = document.querySelectorAll('.cta-button');

    // Add click event listener to all buttons
    ctaButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Scroll to the Contact Us section
            const contactSection = document.getElementById('contact-section');
            if (contactSection) {
                contactSection.scrollIntoView({ behavior: 'smooth' });
                // Focus on the first form input after scrolling
                setTimeout(() => {
                    const firstInput = document.getElementById('fname');
                    if (firstInput) firstInput.focus();
                }, 800); // Delay to allow smooth scrolling to complete
            }
        });
    });

    // Add animation to the main content
    const mainContent = document.querySelector('.main-content');
    setTimeout(() => {
        mainContent.classList.add('fade-in');
    }, 300);

    // Add animation to the about title and text
    const aboutTitle = document.querySelector('.about-title');
    const aboutText = document.querySelector('.about-text');
    const aboutImage = document.querySelector('.about-image');
    setTimeout(() => {
        if (aboutTitle) aboutTitle.classList.add('fade-in');
        if (aboutText) aboutText.classList.add('fade-in');
    }, 600);

    // Add animation to the about image with a slight delay
    setTimeout(() => {
        if (aboutImage) {
            aboutImage.style.opacity = '0';
            aboutImage.style.transform = 'translateY(20px)';
            aboutImage.style.transition = 'opacity 0.8s ease, transform 0.8s ease';

            // Force a reflow
            aboutImage.offsetHeight;

            // Apply the animation
            aboutImage.style.opacity = '1';
            aboutImage.style.transform = 'translateY(0)';
        }
    }, 1000);

    // Add animation to features with staggered delay
    const features = document.querySelectorAll('.feature');
    features.forEach((feature, index) => {
        setTimeout(() => {
            feature.classList.add('fade-in');
        }, 800 + (index * 200)); // Staggered delay for each feature
    });

    // Add animation to the services title and text
    const servicesTitle = document.querySelector('.services-title');
    const servicesText = document.querySelector('.services-text');
    const servicesImage = document.querySelector('.services-image');
    setTimeout(() => {
        if (servicesTitle) servicesTitle.classList.add('fade-in');
        if (servicesText) servicesText.classList.add('fade-in');
    }, 1400);

    // Add animation to the services image with a slight delay
    setTimeout(() => {
        if (servicesImage) {
            servicesImage.style.opacity = '0';
            servicesImage.style.transform = 'translateY(20px)';
            servicesImage.style.transition = 'opacity 0.8s ease, transform 0.8s ease';

            // Force a reflow
            servicesImage.offsetHeight;

            // Apply the animation
            servicesImage.style.opacity = '1';
            servicesImage.style.transform = 'translateY(0)';
        }
    }, 2200);

    // Add animation to service items with staggered delay
    const serviceItems = document.querySelectorAll('.service-item');
    serviceItems.forEach((item, index) => {
        setTimeout(() => {
            item.classList.add('fade-in');
        }, 1600 + (index * 200)); // Staggered delay for each service item
    });
});

// Add a simple fade-in animation when the page loads and scroll to top
window.addEventListener('load', function() {
    // Add loaded class for animations
    document.body.classList.add('loaded');

    // Scroll to the top of the page
    window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'auto' // Use 'auto' for immediate scrolling without animation
    });

    // Handle image loading errors
    handleImageErrors();
});

// Function to handle image loading errors
function handleImageErrors() {
    // Get all images on the page
    const images = document.querySelectorAll('img');

    // Add error handler to each image
    images.forEach(img => {
        img.onerror = function() {
            console.log('Error loading image:', this.src);

            // Try alternative paths
            if (this.src.includes('/Mobile/images/')) {
                // Try without the /Mobile prefix
                this.src = this.src.replace('/Mobile/images/', 'images/');
            } else if (this.src.includes('webp')) {
                // Try JPG instead of WebP
                this.src = this.src.replace('.webp', '.jpg');
            }

            // If it's one of our specific images, try a direct path
            if (this.alt === 'About TDE Trading') {
                this.src = 'images/about-us-mobile.jpg';
            } else if (this.alt === 'Our Services') {
                this.src = 'images/our-service-mobile.jpg';
            }
        };
    });
}

// Also reset scroll position when navigating through history (back/forward buttons)
window.addEventListener('pageshow', function(event) {
    // Check if the page is loaded from cache (back/forward navigation)
    if (event.persisted) {
        // Scroll to top immediately
        window.scrollTo(0, 0);
    }
});
