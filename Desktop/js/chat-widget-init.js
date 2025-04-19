/**
 * TDE Trading Chat Widget Initialization
 * This file contains the common initialization code for the chat widget
 */

$(document).ready(function() {
    // Check if we need to auto-open the chat
    const urlParams = new URLSearchParams(window.location.search);
    const shouldOpenChat = urlParams.get('openChat') === 'true';

    // Initialize chat widget
    const chatWidget = new TDEChatWidget({
        target: 'chat-container',
        webhookUrl: 'https://n8n.aaa-city.com/webhook/b65d66e7-3096-4fb0-8265-21418a9fb73c/chat',
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