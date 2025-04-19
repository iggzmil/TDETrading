// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get all FAQ question buttons
    const faqQuestions = document.querySelectorAll('.faq-question');

    // Initialize FAQ items - ensure all answers are hidden initially
    document.querySelectorAll('.faq-answer').forEach(answer => {
        answer.classList.remove('active');
        answer.style.display = 'none'; // Fallback for iOS
    });

    document.querySelectorAll('.faq-question').forEach(question => {
        question.classList.remove('active');
    });

    // Add click event listener to each FAQ question
    faqQuestions.forEach(question => {
        question.addEventListener('click', function(e) {
            // Prevent default button behavior
            e.preventDefault();

            // Toggle active class on the question
            this.classList.toggle('active');

            // Get the answer element
            const answer = this.nextElementSibling;

            // Check if answer is active
            const isActive = answer.classList.contains('active');

            // Toggle active class and display
            if (isActive) {
                answer.classList.remove('active');
                // Use setTimeout to allow the CSS transition to complete before hiding
                setTimeout(() => {
                    answer.style.display = 'none';
                }, 300);
            } else {
                // Show the element first, then add the active class for transition
                answer.style.display = 'block';
                // Force a reflow before adding the active class
                answer.offsetHeight;
                answer.classList.add('active');
            }
        });
    });

    // Add animation to the FAQs title
    const faqsTitle = document.querySelector('.faqs-title');
    setTimeout(() => {
        if (faqsTitle) faqsTitle.classList.add('fade-in');
    }, 1800);

    // Add animation to FAQ items with staggered delay
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach((item, index) => {
        setTimeout(() => {
            item.classList.add('fade-in');
        }, 2000 + (index * 200)); // Staggered delay for each FAQ item
    });
});
