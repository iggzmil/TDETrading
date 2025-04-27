/**
 * TDE Trading Chat Widget - Mobile Version
 * Styled to match the desktop version exactly
 */

class TDEChatWidget {
    constructor(config) {
        this.config = {
            target: 'chat-container',
            webhookUrl: '',
            initialMessages: [],
            metadata: {},
            minimized: true,
            minimizedContent: '',
            ...config
        };

        this.messages = [];
        this.isTyping = false;
        this.isFirstMessage = true; // Flag to track if this is the first message in the session

        // Clear any existing chat history
        localStorage.removeItem('tde-chat-messages');
        localStorage.removeItem('tde-pending-messages');

        // Generate a new session ID for each visit
        this.sessionId = this.generateSessionId();
        localStorage.setItem('tde-chat-session-id', this.sessionId);

        this.init();
    }

    init() {
        // Get target element
        this.targetElement = document.getElementById(this.config.target);
        if (!this.targetElement) {
            console.error('Chat widget target element not found');
            return;
        }

        // Create widget structure
        this.createWidgetStructure();

        // Add event listeners
        this.addEventListeners();

        // Show initial messages
        this.showInitialMessages();
    }

    createWidgetStructure() {
        if (this.config.minimized) {
            this.targetElement.innerHTML = `
                <button class="tde-chat-minimized">
                    <img src="images/chat-icon.svg" alt="Chat Icon">
                    <span>Hey 👋 Need help? Let's chat!</span>
                </button>
            `;
        } else {
            this.renderFullWidget();
        }
    }

    renderFullWidget() {
        this.targetElement.innerHTML = `
            <div class="tde-chat-widget">
                <div class="tde-chat-header">
                    <div class="tde-chat-title">
                        <div class="title-main">TDE Trading</div>
                        <div class="title-main">AI Assistant</div>
                        <div class="title-sub">Powered by AAA.City</div>
                    </div>
                    <button class="tde-chat-close-btn">Close Chat</button>
                </div>
                <div class="tde-chat-body"></div>
                <div class="tde-chat-footer">
                    <input type="text" class="tde-chat-input" placeholder="Type your message..." aria-label="Type your message">
                    <button class="tde-chat-send" aria-label="Send message">Send</button>
                </div>
            </div>
        `;

        this.chatBody = this.targetElement.querySelector('.tde-chat-body');
        this.chatInput = this.targetElement.querySelector('.tde-chat-input');
        this.sendButton = this.targetElement.querySelector('.tde-chat-send');
    }

    addEventListeners() {
        // Toggle between minimized and full widget
        this.targetElement.addEventListener('click', (e) => {
            if (e.target.closest('.tde-chat-minimized')) {
                this.expandWidget();
            }

            if (e.target.closest('.tde-chat-close-btn')) {
                this.minimizeWidget();
            }
        });

        // Only add these listeners if the widget is expanded
        if (!this.config.minimized) {
            // Send message on button click
            this.sendButton.addEventListener('click', () => {
                this.sendMessage();
            });

            // Send message on Enter key
            this.chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage();
                }
            });

            // Enable/disable send button based on input
            this.chatInput.addEventListener('input', () => {
                this.sendButton.disabled = !this.chatInput.value.trim();
            });
        }
    }

    expandWidget() {
        // Save current messages before expanding
        const currentMessages = [...this.messages];
        const isFirstOpen = currentMessages.length === 0;

        // Update state and recreate structure
        this.config.minimized = false;
        this.renderFullWidget();
        this.addEventListeners();

        // Restore messages
        this.messages = currentMessages;

        // Reset the first message flag when expanding the widget
        this.isFirstMessage = true;

        // If this is the first time opening, show initial messages
        // Otherwise, display the existing conversation
        if (isFirstOpen) {
            this.showInitialMessages();
        } else {
            this.displayExistingMessages();
        }

        // Get the position of the chat widget for scrolling
        const chatWidgetRect = this.targetElement.getBoundingClientRect();
        const scrollPosition = window.scrollY + chatWidgetRect.top - 20; // 20px buffer above the widget

        // Scroll the page to show the expanded widget
        // Use a slight delay to ensure the DOM has updated
        setTimeout(() => {
            // Detect iOS devices
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

            if (isIOS) {
                // iOS-specific approach - more reliable on iOS
                // First, try to use scrollIntoView which works better on iOS
                this.targetElement.scrollIntoView({ block: 'center' });

                // As a backup, also use window.scrollTo with auto behavior
                setTimeout(() => {
                    window.scrollTo({
                        top: scrollPosition,
                        behavior: 'auto' // Use instant scroll on iOS
                    });

                    // Focus on input after a short delay
                    setTimeout(() => {
                        this.chatInput.focus();
                    }, 100);
                }, 50);
            } else {
                // Standard approach for other browsers
                window.scrollTo({
                    top: scrollPosition,
                    behavior: 'smooth'
                });

                // Focus on input after scrolling
                setTimeout(() => {
                    this.chatInput.focus();
                }, 300);

                // Also call our helper method as a backup
                setTimeout(() => {
                    this.ensureWidgetVisible();
                }, 500);
            }
        }, 50);
    }

    minimizeWidget() {
        // Save current messages before minimizing
        const currentMessages = [...this.messages];

        // Save the first message flag state
        const wasFirstMessage = this.isFirstMessage;

        // Update state and recreate structure
        this.config.minimized = true;
        this.createWidgetStructure();
        this.addEventListeners();

        // Restore only the messages from this session
        this.messages = currentMessages;

        // Restore the first message flag
        this.isFirstMessage = wasFirstMessage;
    }

    /**
     * Display initial welcome messages with typing animation
     */
    showInitialMessages() {
        if (this.config.minimized) return;

        // Clear chat body
        this.chatBody.innerHTML = '';

        // Show typing indicator
        this.showTypingIndicator();

        // Show initial messages with delay
        let delay = 1000;
        this.config.initialMessages.forEach((message, index) => {
            setTimeout(() => {
                // Hide typing indicator before showing the last message
                if (index === this.config.initialMessages.length - 1) {
                    this.hideTypingIndicator();
                }

                this.addMessage(message, 'bot');
            }, delay);

            delay += 1000;
        });
    }

    /**
     * Display existing messages from the current session
     * without animations or duplications
     */
    displayExistingMessages() {
        if (this.config.minimized) return;

        // Clear chat body first
        this.chatBody.innerHTML = '';

        // Display all messages in the current session
        this.messages.forEach(msg => {
            const messageElement = document.createElement('div');
            messageElement.className = `tde-chat-message tde-chat-message-${msg.sender}`;
            messageElement.textContent = msg.text;
            this.chatBody.appendChild(messageElement);
        });

        // Scroll to bottom
        if (this.messages.length > 0) {
            this.chatBody.scrollTop = this.chatBody.scrollHeight;
        }
    }

    sendMessage() {
        if (!this.chatInput.value.trim()) return;

        const message = this.chatInput.value.trim();
        this.chatInput.value = '';
        this.sendButton.disabled = true;

        // Add user message to chat
        this.addMessage(message, 'user');

        // Show typing indicator
        this.showTypingIndicator();

        // Send message to webhook
        this.sendToWebhook(message);
    }

    addMessage(text, sender) {
        // Don't add empty messages
        if (!text || !text.trim()) return;

        // Check if this exact message already exists to prevent duplicates
        // This can happen when reopening the chat
        const isDuplicate = this.messages.some(msg =>
            msg.text === text &&
            msg.sender === sender &&
            // Only check messages from the last 5 seconds to allow repeating the same message intentionally
            (new Date() - new Date(msg.timestamp)) < 5000
        );

        if (isDuplicate) {
            return null;
        }

        // Create message object
        const messageObj = {
            text,
            sender,
            timestamp: new Date().toISOString()
        };

        // Store message in memory
        this.messages.push(messageObj);

        // Don't add to DOM if minimized
        if (this.config.minimized) return;

        // Create message element
        const messageElement = document.createElement('div');
        messageElement.className = `tde-chat-message tde-chat-message-${sender}`;
        messageElement.textContent = text;

        // Add to chat body
        this.chatBody.appendChild(messageElement);

        // Scroll to bottom
        this.chatBody.scrollTop = this.chatBody.scrollHeight;

        // Ensure the widget is visible on screen
        this.ensureWidgetVisible();

        // Save to localStorage (limit to last 50 messages to prevent storage issues)
        if (this.messages.length > 50) {
            this.messages = this.messages.slice(-50);
        }
        localStorage.setItem('tde-chat-messages', JSON.stringify(this.messages));

        return messageObj;
    }

    showTypingIndicator() {
        if (this.isTyping || this.config.minimized) return;
        this.isTyping = true;

        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'tde-chat-typing';
        typingIndicator.innerHTML = `
            <div class="tde-chat-typing-dot"></div>
            <div class="tde-chat-typing-dot"></div>
            <div class="tde-chat-typing-dot"></div>
        `;

        typingIndicator.id = 'typing-indicator';
        this.chatBody.appendChild(typingIndicator);
        this.chatBody.scrollTop = this.chatBody.scrollHeight;
    }

    hideTypingIndicator() {
        if (!this.isTyping) return;
        this.isTyping = false;

        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    async sendToWebhook(message) {
        // Don't send empty messages
        if (!message || message.trim() === '') {
            return;
        }

        // Show typing indicator
        this.showTypingIndicator();

        try {
            // Check if this is the first message in the session
            if (this.isFirstMessage) {
                console.log('First message in session - sending SESSION_START signal');

                // Send the SESSION_START message first
                try {
                    const sessionStartPayload = {
                        sessionId: this.sessionId,
                        chatInput: "SESSION_START",
                        isNewSession: true,
                        clearMemory: true
                    };

                    // Send the SESSION_START message
                    await fetch(this.config.webhookUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(sessionStartPayload)
                    });

                    console.log('SESSION_START signal sent successfully');

                    // Small delay to ensure the SESSION_START is processed before the actual message
                    await new Promise(resolve => setTimeout(resolve, 500));
                } catch (sessionStartError) {
                    console.error('Error sending SESSION_START signal:', sessionStartError);
                    // Continue with the user message even if SESSION_START fails
                }

                // Set the flag to false after sending the first message
                this.isFirstMessage = false;
            }

            // Format payload exactly as N8N Chat Trigger expects (matching desktop version)
            const payload = {
                sessionId: this.sessionId,
                chatInput: message,
                isNewSession: false, // Changed to false since we're handling session start separately
                clearMemory: false,  // Changed to false since we're handling memory clearing with SESSION_START
                metadata: {
                    ...this.config.metadata,
                    timestamp: new Date().toISOString(),
                    source: window.location.href
                }
            };

            // Send request with headers matching the desktop version
            const response = await fetch(this.config.webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Origin': window.location.origin,
                    'X-Session-ID': this.sessionId
                },
                credentials: 'omit',
                body: JSON.stringify(payload)
            });

            // Handle error responses
            if (!response.ok) {
                let errorMessage = '';
                try {
                    const errorText = await response.text();
                    errorMessage = JSON.parse(errorText).message;
                } catch (e) {
                    errorMessage = `Server error: ${response.status}`;
                }
                throw new Error(errorMessage);
            }

            // Parse the response
            const data = await response.json();

            // Hide typing indicator
            this.hideTypingIndicator();

            // Handle N8N Chat Trigger response format (matching desktop version)
            if (data.output) {
                this.addMessage(data.output, 'bot');
            } else if (data.message) {
                this.addMessage(data.message, 'bot');
            } else if (data.response) {
                this.addMessage(data.response, 'bot');
            } else if (data.error) {
                this.addMessage("Sorry, I encountered an error. Please try again.", 'bot');
            } else {
                this.addMessage("I received a response but couldn't understand it. Please try again.", 'bot');
            }
        } catch (error) {
            console.error('Error sending message to webhook:', error);
            this.hideTypingIndicator();

            if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
                this.addMessage('Unable to connect to chat service. Please make sure this domain is allowed in N8N settings.', 'bot');
            } else {
                this.addMessage('Sorry, there was an error processing your message. Please try again later.', 'bot');
            }
        }
    }

    generateSessionId() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    /**
     * Helper method to ensure the chat widget is visible
     * This is called when a new message is added or when the widget is expanded
     */
    ensureWidgetVisible() {
        // Only proceed if the widget is expanded
        if (this.config.minimized) return;

        // Get the position of the chat widget
        const chatWidgetRect = this.targetElement.getBoundingClientRect();

        // Check if the widget is partially or fully out of view
        const isPartiallyOutOfView = (
            chatWidgetRect.bottom > window.innerHeight ||
            chatWidgetRect.top < 0
        );

        if (isPartiallyOutOfView) {
            // Detect iOS devices
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

            // Use the appropriate scrolling method based on the device
            if (isIOS) {
                this.targetElement.scrollIntoView({ block: 'center' });
            } else {
                const scrollPosition = window.scrollY + chatWidgetRect.top - 20;
                window.scrollTo({
                    top: scrollPosition,
                    behavior: 'smooth'
                });
            }
        }
    }
}
