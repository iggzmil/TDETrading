// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add animation to the contact title
    const contactTitle = document.querySelector('.contact-title');
    setTimeout(() => {
        if (contactTitle) contactTitle.classList.add('fade-in');
    }, 2200); // After FAQs animations

    // Add subtle animation to contact info items with staggered delay
    const contactItems = document.querySelectorAll('.contact-info-item');
    contactItems.forEach((item, index) => {
        // Make sure items are visible first
        item.style.opacity = '1';
        item.style.transform = 'translateY(0)';

        // Add a subtle animation
        setTimeout(() => {
            item.classList.add('animate');
        }, 2400 + (index * 200)); // Staggered delay for each contact item
    });

    // Add animation to contact form
    const contactForm = document.querySelector('.contact-form');
    setTimeout(() => {
        if (contactForm) contactForm.classList.add('fade-in');
    }, 3000); // After contact items
});

// Also ensure contact items are visible when the page loads
window.addEventListener('load', function() {
    // Force contact items to be visible
    document.querySelectorAll('.contact-info-item').forEach(item => {
        item.style.opacity = '1';
        item.style.transform = 'translateY(0)';
    });
});
