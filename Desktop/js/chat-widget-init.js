/**
 * TDE Trading Chat Widget Initialization
 * This file contains the common initialization code for the chat widget
 */

$(document).ready(function() {
    // Check if we need to auto-open the chat
    const urlParams = new URLSearchParams(window.location.search);
    const shouldOpenChat = urlParams.get('openChat') === 'true';

    // Clear any existing chat data from localStorage
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('chat') || key.includes('session'))) {
            localStorage.removeItem(key);
        }
    }

    console.log('Cleared all chat-related data from localStorage');

    // Initialize chat widget with a fresh session
    const chatWidget = new TDEChatWidget({
        target: 'chat-container',
        webhookUrl: 'https://n8n.aaa-city.com/webhook/b65d66e7-3096-4fb0-8265-21418a9fb73c/chat',
        // Add a fallback response for when the webhook is unavailable
        fallbackResponses: {
            default: "I'm sorry, I'm having trouble connecting to my knowledge base right now. Please try again later or contact us directly at info@tdetrading.com.au.",
            help: "For immediate assistance, please email us at info@tdetrading.com.au or call (+61) 430 333 813.",
            pricing: "For pricing information, please visit our pricing page or contact us directly.",
            services: "We offer various trading education services. You can find more details on our services page."
        },
        initialMessages: [
            'Hi there! 👋',
            'Welcome to TDE Trading. How can I help you today?',
            'Feel free to ask me anything about our trading services, courses, or mentorship programs.'
        ],
        metadata: {
            source: 'website',
            page: window.location.pathname.split('/').pop().split('.')[0] || 'home',
            fromChatIcon: shouldOpenChat
        },
        minimized: !shouldOpenChat, // Auto-expand if openChat=true
        minimizedContent: `
            <div class="tde-chat-minimized">
                <img src="images/chat-icon.svg" alt="Chat Icon">
                <span>Hey 👋 Need help? Let's chat!</span>
            </div>
        `
    });
});