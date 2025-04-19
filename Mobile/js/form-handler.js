/**
 * TDE Trading Form Handler - Mobile Version
 * This file contains the form handling code for the contact form
 * Updated with reCAPTCHA integration for improved security
 */

// Initialize EmailJS
(function() {
    emailjs.init(EMAIL_CONFIG.PUBLIC_KEY);
})();

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contactForm');
    if (!form) return; // Exit if form doesn't exist

    const messageTextarea = document.getElementById('message');
    const submitButton = form.querySelector('button[type="submit"]');

    // Message length validation
    messageTextarea.addEventListener('input', function() {
        const currentLength = this.value.length;
        if (currentLength > 1000) {
            this.classList.add('is-invalid');
            this.nextElementSibling.textContent = 'Message cannot exceed 1000 characters.';
        } else {
            this.classList.remove('is-invalid');
            this.nextElementSibling.textContent = 'Message must be at least 2 characters long.';
        }
        // Update submit button state when message changes
        updateSubmitButton();
    });

    // Real-time validation on input (except message field)
    const inputs = form.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            // Clear previous validation state
            this.classList.remove('is-invalid');

            if (!this.checkValidity()) {
                this.classList.add('is-invalid');
            }

            // Update submit button state
            updateSubmitButton();
        });
    });

    // Update submit button state based on form validity
    function updateSubmitButton() {
        const messageValid = messageTextarea.value.length >= 2 && messageTextarea.value.length <= 1000;
        const otherFieldsValid = Array.from(inputs).every(input => input.checkValidity());
        submitButton.disabled = !messageValid || !otherFieldsValid;
    }

    // Initial button state
    updateSubmitButton();

    // Form submission handler
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const messageLength = messageTextarea.value.length;
        if (!this.checkValidity() || messageLength < 2 || messageLength > 1000) {
            e.stopPropagation();
            this.classList.add('was-validated');
            return;
        }

        // No reCAPTCHA verification needed

        // Show loading state
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="spinner"></span> Sending...';

        // Prepare form data
        const formData = {
            from_name: `${this.fname.value} ${this.lname.value}`,
            from_email: this.email.value,
            phone: this.phone.value,
            message: this.message.value
        };

        // Send email using EmailJS
        emailjs.send(EMAIL_CONFIG.SERVICE_ID, EMAIL_CONFIG.TEMPLATE_ID, formData)
            .then(function(response) {
                showMessage('success', 'Thank you for reaching out! Our team will get back to you as soon as possible.');
                form.reset();
                form.classList.remove('was-validated');
                inputs.forEach(input => input.classList.remove('is-invalid'));
                messageTextarea.classList.remove('is-invalid');
            })
            .catch(function(error) {
                console.error('EmailJS error:', error);
                showMessage('error', 'Oops! Something went wrong. Please try again later.');
            })
            .finally(function() {
                // Reset button state
                submitButton.disabled = false;
                submitButton.innerHTML = 'Send Message';
                // Update button state after form reset
                updateSubmitButton();
            });
    });

    // Show message function
    function showMessage(type, message) {
        const msgSubmit = document.getElementById('msgSubmit');
        msgSubmit.className = type === 'success' ? 'alert-success' : 'alert-danger';
        msgSubmit.textContent = message;
        msgSubmit.style.display = 'block';

        // Hide message after 5 seconds
        setTimeout(() => {
            msgSubmit.style.display = 'none';
        }, 5000);
    }
});
