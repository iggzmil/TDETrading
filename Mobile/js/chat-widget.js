/**
 * TDE Trading Chat Widget - Mobile Version
 * A simplified chat widget for mobile devices
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
        this.sessionId = this.generateSessionId();

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
                    <span>Chat With Us</span>
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
                    <h3 class="tde-chat-title">TDE Trading Support</h3>
                    <div class="tde-chat-controls">
                        <button class="tde-chat-control tde-chat-minimize" aria-label="Minimize chat">−</button>
                    </div>
                </div>
                <div class="tde-chat-body"></div>
                <div class="tde-chat-footer">
                    <input type="text" class="tde-chat-input" placeholder="Type your message..." aria-label="Type your message">
                    <button class="tde-chat-send" aria-label="Send message">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22 2L11 13" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
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

            if (e.target.closest('.tde-chat-minimize')) {
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
        this.config.minimized = false;
        this.renderFullWidget();
        this.addEventListeners();

        // Reset the first message flag when expanding the widget
        this.isFirstMessage = true;

        this.showInitialMessages();

        // Focus on input
        setTimeout(() => {
            this.chatInput.focus();
        }, 300);
    }

    minimizeWidget() {
        // Save the first message flag state
        const wasFirstMessage = this.isFirstMessage;

        this.config.minimized = true;
        this.createWidgetStructure();
        this.addEventListeners();

        // Restore the first message flag
        this.isFirstMessage = wasFirstMessage;
    }

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
        const messageElement = document.createElement('div');
        messageElement.className = `tde-chat-message tde-chat-message-${sender}`;
        messageElement.textContent = text;

        this.chatBody.appendChild(messageElement);

        // Scroll to bottom
        this.chatBody.scrollTop = this.chatBody.scrollHeight;

        // Store message
        this.messages.push({
            text,
            sender,
            timestamp: new Date().toISOString()
        });
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
        // Check if this is the first message in the session
        if (this.isFirstMessage && this.config.webhookUrl) {
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

        // Simulate response for demo purposes
        setTimeout(() => {
            this.hideTypingIndicator();

            // Add bot response
            const responses = [
                "Thanks for your message! Our team will get back to you soon.",
                "I appreciate your question. Let me check with our trading experts and get back to you.",
                "That's a great question about trading. Our mentors would be happy to discuss this with you in detail.",
                "Thanks for reaching out! For more detailed information, I recommend checking our desktop site or contacting us directly."
            ];

            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            this.addMessage(randomResponse, 'bot');
        }, 2000);

        // In a real implementation, you would send the message to the webhook
        // fetch(this.config.webhookUrl, {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify({
        //         message,
        //         sessionId: this.sessionId,
        //         timestamp: new Date().toISOString(),
        //         metadata: this.config.metadata
        //     })
        // })
        // .then(response => response.json())
        // .then(data => {
        //     this.hideTypingIndicator();
        //     if (data.reply) {
        //         this.addMessage(data.reply, 'bot');
        //     }
        // })
        // .catch(error => {
        //     console.error('Error sending message to webhook:', error);
        //     this.hideTypingIndicator();
        //     this.addMessage("Sorry, I'm having trouble connecting. Please try again later.", 'bot');
        // });
    }

    generateSessionId() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}
