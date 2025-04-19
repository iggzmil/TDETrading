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
                        <div class="title-main">TDE Trading AI Assistant</div>
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

        // If this is the first time opening, show initial messages
        // Otherwise, display the existing conversation
        if (isFirstOpen) {
            this.showInitialMessages();
        } else {
            this.displayExistingMessages();
        }

        // Focus on input
        setTimeout(() => {
            this.chatInput.focus();
        }, 300);
    }

    minimizeWidget() {
        // Save current messages before minimizing
        const currentMessages = [...this.messages];

        // Update state and recreate structure
        this.config.minimized = true;
        this.createWidgetStructure();
        this.addEventListeners();

        // Restore only the messages from this session
        this.messages = currentMessages;
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
        if (!text || text.trim() === '') return;

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

        // Add to DOM if chat is expanded
        if (this.chatBody && !this.config.minimized) {
            const messageElement = document.createElement('div');
            messageElement.className = `tde-chat-message tde-chat-message-${sender}`;
            messageElement.textContent = text;
            this.chatBody.appendChild(messageElement);

            // Scroll to bottom
            this.chatBody.scrollTop = this.chatBody.scrollHeight;
        }

        // Save to localStorage (limit to last 50 messages to prevent storage issues)
        if (this.messages.length > 50) {
            this.messages = this.messages.slice(-50);
        }
        localStorage.setItem('tde-chat-messages', JSON.stringify(this.messages));

        return messageObj;
    }

    showTypingIndicator() {
        if (this.isTyping) return;

        this.isTyping = true;

        const typingElement = document.createElement('div');
        typingElement.className = 'tde-chat-typing';
        typingElement.innerHTML = `
            <div class="tde-chat-typing-dot"></div>
            <div class="tde-chat-typing-dot"></div>
            <div class="tde-chat-typing-dot"></div>
        `;

        this.chatBody.appendChild(typingElement);

        // Scroll to bottom
        this.chatBody.scrollTop = this.chatBody.scrollHeight;
    }

    hideTypingIndicator() {
        if (!this.isTyping) return;

        this.isTyping = false;

        const typingElement = this.chatBody.querySelector('.tde-chat-typing');
        if (typingElement) {
            typingElement.remove();
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
            // Format payload exactly as N8N Chat Trigger expects (matching desktop version)
            const payload = {
                sessionId: this.sessionId,
                chatInput: message,
                action: 'sendMessage',
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
}
