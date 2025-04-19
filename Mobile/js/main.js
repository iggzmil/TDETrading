// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get the CTA button
    const ctaButton = document.querySelector('.cta-button');
    
    // Add click event listener to the button
    ctaButton.addEventListener('click', function() {
        // Redirect to the main app or registration page
        // This can be updated with the actual URL when available
        window.location.href = 'registration.html';
    });
    
    // Add animation to the main content
    const mainContent = document.querySelector('.main-content');
    setTimeout(() => {
        mainContent.classList.add('fade-in');
    }, 300);
});

// Add a simple fade-in animation when the page loads
window.addEventListener('load', function() {
    document.body.classList.add('loaded');
});
