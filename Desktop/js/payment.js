// Preloader
window.addEventListener('load', function() {
    document.querySelector('.preloader').classList.add('hide');
});

// Stripe Implementation
const stripe = Stripe('pk_test_TYooMQauvdEDq54NiTphI7jx');
const elements = stripe.elements();

// Create and style the Card Element
const card = elements.create('card', {
    style: {
        base: {
            color: '#004052',
            fontFamily: '"DM Sans", sans-serif',
            fontSize: '16px',
            '::placeholder': {
                color: '#aab7c4',
            },
            iconColor: '#00CC61',
        },
        invalid: {
            color: '#dc3545',
            iconColor: '#dc3545',
        }
    }
});

// Mount the Card Element
card.mount('#card-element');

// Handle validation errors
card.addEventListener('change', function(event) {
    const displayError = document.getElementById('card-errors');
    if (event.error) {
        displayError.textContent = event.error.message;
    } else {
        displayError.textContent = '';
    }
});

// Handle form submission
const form = document.getElementById('payment-form');
if (form) {
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        document.getElementById('submit-button').disabled = true;
        
        // Demo payment processing
        setTimeout(function() {
            alert('This is a demo. In a real implementation, this would process payment through Stripe.');
            window.location.href = 'index.html';
        }, 1500);
    });
} 