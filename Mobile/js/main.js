// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get the CTA button
    const ctaButtons = document.querySelectorAll('.cta-button');
    
    // Add click event listener to all buttons
    ctaButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Show an alert instead of redirecting
            alert('Thank you for your interest! This feature will be available soon.');
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
    setTimeout(() => {
        if (aboutTitle) aboutTitle.classList.add('fade-in');
        if (aboutText) aboutText.classList.add('fade-in');
    }, 600);
    
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
    setTimeout(() => {
        if (servicesTitle) servicesTitle.classList.add('fade-in');
        if (servicesText) servicesText.classList.add('fade-in');
    }, 1400);
    
    // Add animation to service items with staggered delay
    const serviceItems = document.querySelectorAll('.service-item');
    serviceItems.forEach((item, index) => {
        setTimeout(() => {
            item.classList.add('fade-in');
        }, 1600 + (index * 200)); // Staggered delay for each service item
    });
});

// Add a simple fade-in animation when the page loads
window.addEventListener('load', function() {
    document.body.classList.add('loaded');
});
