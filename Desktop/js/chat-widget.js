/**
 * TDE Trading Chat Widget with N8N Integration
 * A customized chat widget for TDE Trading website that integrates with N8N workflows
 */

class TDEChatWidget {
  constructor(options = {}) {
    this.options = {
      target: 'chat-container',
      webhookUrl: '', // Required: N8N webhook URL
      webhookConfig: {
        method: 'POST',
        headers: {}
      },
      initialMessages: [],
      metadata: {},
      minimized: true,
      minimizedContent: '',
      chatInputKey: 'chatInput',
      chatSessionKey: 'sessionId',
      // Add fallback responses for when the webhook is unavailable
      fallbackResponses: {
        default: "I'm sorry, I'm having trouble connecting right now. Please try again later."
      },
      ...options
    };

    this.container = document.getElementById(this.options.target);
    this.sessionId = this.getSessionId();
    this.messageHistory = this.loadSavedMessages();
    this.isProcessing = false;
    this.loadingIndicator = null;
    this.isFirstMessage = true; // Flag to track if this is the first message in the session
    this.init();
  }

  /**
   * Initialize the chat widget
   */
  init() {
    if (!this.container) {
      console.error('Chat container not found');
      return;
    }

    console.log('Initializing chat widget');

    // Always clear chat history and local storage on load
    this.clearChatHistory();
    localStorage.removeItem('chat-messages');
    localStorage.removeItem(this.options.chatSessionKey);

    // Clear any other chat-related items from localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('chat') || key.includes('session'))) {
        localStorage.removeItem(key);
      }
    }

    // Always generate a new session ID to ensure a fresh conversation
    this.sessionId = this.generateNewSessionId();

    // Reset the message history array
    this.messageHistory = [];

    // Set first message flag to true for a new session
    this.isFirstMessage = true;

    // Add base class
    this.container.classList.add('tde-chat-container');

    // Set initial state
    if (this.options.minimized) {
      this.container.classList.add('minimized');
    }

    this.createDOM();
    this.attachEventListeners();

    // Display initial messages
    this.displayInitialMessages();

    console.log('Chat widget initialized with new session ID:', this.sessionId);
    console.log('Memory cleared, starting with fresh conversation');
  }

  /**
   * Generate a new session ID (always creates a new one)
   */
  generateNewSessionId() {
    // Create a unique session ID with timestamp to ensure uniqueness
    const timestamp = new Date().getTime();
    const randomPart = Math.floor(Math.random() * 10000);
    const newSessionId = `${timestamp}-${randomPart}`;

    // Store in localStorage
    localStorage.setItem(this.options.chatSessionKey, newSessionId);

    return newSessionId;
  }

  /**
   * Clear chat history from localStorage and memory
   */
  clearChatHistory() {
    localStorage.removeItem('chat-messages');
    localStorage.removeItem(this.options.chatSessionKey);
    this.messageHistory = [];

    // Clear messages container if it exists
    if (this.messagesContainer) {
      this.messagesContainer.innerHTML = '';
    }
  }

  /**
   * Load saved messages from localStorage
   */
  loadSavedMessages() {
    // Always start with empty history
    console.log('Starting with empty chat history');
    return [];
  }

  /**
   * Display initial welcome messages
   */
  displayInitialMessages() {
    if (this.options.initialMessages && this.options.initialMessages.length > 0) {
      this.options.initialMessages.forEach(message => this.addMessage(message, 'bot'));
    }
  }

  /**
   * Create the DOM elements for the chat widget
   */
  createDOM() {
    // Create minimized view
    this.minimizedView = document.createElement('div');
    this.minimizedView.className = 'tde-chat-minimized';
    if (this.options.minimizedContent) {
      this.minimizedView.innerHTML = this.options.minimizedContent;
    } else {
      this.minimizedView.innerHTML = `
        <img src="images/chat-icon.svg" alt="Chat Icon">
        <span>Hey 👋 Need help? Let's chat!</span>
      `;
    }

    // Create expanded view
    this.expandedView = document.createElement('div');
    this.expandedView.className = 'tde-chat-expanded';

    // Create header with two lines
    const header = document.createElement('div');
    header.className = 'tde-chat-header';
    header.innerHTML = `
        <div class="tde-chat-title">
            <div class="title-main">TDE Trading AI Assistant</div>
            <div class="title-sub">Powered by AAA.City</div>
        </div>
        <button class="tde-chat-close-btn">Close Chat</button>
    `;

    // Create messages container
    this.messagesContainer = document.createElement('div');
    this.messagesContainer.className = 'tde-chat-messages';

    // Create input area
    const inputArea = document.createElement('div');
    inputArea.className = 'tde-chat-input-area';
    inputArea.innerHTML = `
        <input type="text" class="tde-chat-input" placeholder="Type your message...">
        <button class="tde-chat-send">Send</button>
    `;

    // Assemble expanded view
    this.expandedView.appendChild(header);
    this.expandedView.appendChild(this.messagesContainer);
    this.expandedView.appendChild(inputArea);

    // Add both views to container
    this.container.appendChild(this.minimizedView);
    this.container.appendChild(this.expandedView);
  }

  /**
   * Attach event listeners to chat elements
   */
  attachEventListeners() {
    // Toggle on minimized view click
    this.minimizedView.addEventListener('click', () => this.toggle());

    // Close button click
    const closeBtn = this.expandedView.querySelector('.tde-chat-close-btn');
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggle();
    });

    // ESC key to close chat
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !this.container.classList.contains('minimized')) {
        this.toggle();
      }
    });

    // Send message
    const input = this.expandedView.querySelector('input');
    const sendBtn = this.expandedView.querySelector('.tde-chat-send');

    const sendMessage = () => {
      const message = input.value.trim();
      if (message) {
        this.addMessage(message, 'user');
        this.sendToN8N(message);
        input.value = '';
        // Refocus the input field after sending the message
        input.focus();
      }
    };

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });
  }

  /**
   * Toggle between minimized and expanded states
   */
  toggle() {
    const wasMinimized = this.container.classList.contains('minimized');
    this.container.classList.toggle('minimized');

    // If expanding, reset the session to ensure a fresh conversation
    if (wasMinimized) {
      // Reset the session when opening the chat
      this.resetSession();

      console.log('Chat widget expanded - session reset with new ID:', this.sessionId);

      // Focus the input field
      const input = this.expandedView.querySelector('.tde-chat-input');
      if (input) {
        setTimeout(() => input.focus(), 300);
      }
    } else {
      // When minimizing, also clear the history to ensure a fresh start next time
      this.clearChatHistory();
      console.log('Chat widget minimized - history cleared');
    }
  }

  /**
   * Reset the chat session
   */
  resetSession() {
    // Clear the chat history
    this.clearChatHistory();

    // Generate a new session ID
    this.sessionId = this.generateNewSessionId();

    // Clear localStorage again to be extra sure
    localStorage.removeItem('chat-messages');
    localStorage.removeItem(this.options.chatSessionKey);

    // Reset the message history array
    this.messageHistory = [];

    // Reset the first message flag
    this.isFirstMessage = true;

    console.log('Chat session reset with new session ID:', this.sessionId);

    // Display the same initial messages as when the widget is first loaded
    this.displayInitialMessages();
  }

  /**
   * Add a message to the chat
   */
  addMessage(text, sender) {
    const messageEl = document.createElement('div');
    messageEl.className = `tde-chat-message ${sender}`;
    messageEl.textContent = text;
    this.messagesContainer.appendChild(messageEl);
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;

    // Save message to history
    this.messageHistory.push({ text, sender, timestamp: new Date().toISOString() });
    this.saveMessages();
  }

  /**
   * Get or create session ID
   */
  getSessionId() {
    // For backward compatibility, but we'll prefer generating a new session ID
    const storedSessionId = localStorage.getItem(this.options.chatSessionKey);
    if (storedSessionId) return storedSessionId;

    // If no stored session ID, generate a new one
    return this.generateNewSessionId();
  }

  /**
   * Load previous chat session
   */
  loadPreviousSession() {
    if (!this.options.webhookUrl) {
      this.displayInitialMessages();
      return;
    }

    // Display any saved messages from localStorage
    if (this.messageHistory.length > 0) {
      this.messageHistory.forEach(msg => {
        this.addMessage(msg.text, msg.sender);
      });
    } else {
      // If no message history, just show initial messages
      this.displayInitialMessages();
    }
  }

  /**
   * Save messages to localStorage
   */
  saveMessages() {
    localStorage.setItem('chat-messages', JSON.stringify(this.messageHistory));
  }

  /**
   * Get a fallback response based on the user's message
   */
  getFallbackResponse(message) {
    if (!message || !this.options.fallbackResponses) {
      return this.options.fallbackResponses?.default || null;
    }

    message = message.toLowerCase();

    // Check for keywords in the message
    if (message.includes('help') || message.includes('support') || message.includes('assist')) {
      return this.options.fallbackResponses.help || this.options.fallbackResponses.default;
    }

    if (message.includes('price') || message.includes('cost') || message.includes('fee') || message.includes('payment')) {
      return this.options.fallbackResponses.pricing || this.options.fallbackResponses.default;
    }

    if (message.includes('service') || message.includes('offer') || message.includes('provide')) {
      return this.options.fallbackResponses.services || this.options.fallbackResponses.default;
    }

    // Default fallback response
    return this.options.fallbackResponses.default;
  }



  /**
   * Create loading indicator element
   */
  createLoadingIndicator() {
    const loading = document.createElement('div');
    loading.className = 'tde-chat-loading';
    loading.innerHTML = `
      <div class="dots">
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </div>
    `;
    return loading;
  }

  /**
   * Set the processing state and update UI accordingly
   */
  setProcessingState(isProcessing) {
    this.isProcessing = isProcessing;
    if (this.container) {
      const input = this.expandedView.querySelector('.tde-chat-input');
      const sendBtn = this.expandedView.querySelector('.tde-chat-send');

      // Toggle processing class on container
      this.container.classList.toggle('processing', isProcessing);

      if (isProcessing) {
        // Disable input and button
        input.disabled = true;
        sendBtn.disabled = true;
        sendBtn.textContent = '...';

        // Add loading indicator
        if (!this.loadingIndicator) {
          this.loadingIndicator = this.createLoadingIndicator();
          this.messagesContainer.appendChild(this.loadingIndicator);
          this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }
      } else {
        // Enable input and button
        input.disabled = false;
        sendBtn.disabled = false;
        sendBtn.textContent = 'Send';

        // Remove loading indicator
        if (this.loadingIndicator && this.loadingIndicator.parentNode) {
          this.loadingIndicator.remove();
          this.loadingIndicator = null;
        }

        // Refocus the input field after processing is complete
        if (!this.container.classList.contains('minimized') && !input.disabled) {
          setTimeout(() => {
            input.focus();
          }, 100); // Small delay to ensure DOM is ready
        }
      }
    }
  }

  /**
   * Send message to N8N webhook
   */
  async sendToN8N(message, action = 'sendMessage') {
    if (!this.options.webhookUrl) {
      console.warn('No webhook URL provided for chat widget');
      this.addMessage('Chat service is not configured. Please contact the site administrator.', 'bot');
      return;
    }

    // Don't send empty messages
    if (!message && action === 'sendMessage') {
      console.warn('Empty message not sent to N8N');
      return;
    }

    // Set processing state
    this.setProcessingState(true);

    // Set a timeout to handle cases where the N8N webhook doesn't respond
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout: The chat service did not respond in time.')), 15000);
    });

    try {
      // Ensure we have a valid sessionId
      if (!this.sessionId) {
        this.sessionId = this.getSessionId();
      }

      // Check if this is the first message in the session
      if (this.isFirstMessage && action === 'sendMessage') {
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
          await fetch(this.options.webhookUrl, {
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

      // Format payload exactly as N8N Chat Trigger expects - with conversation history
      const payload = {
        sessionId: this.sessionId,
        chatInput: message,
        isNewSession: false, // Changed to false since we're handling session start separately
        clearMemory: false   // Changed to false since we're handling memory clearing with SESSION_START
      };

      // If this message is about sending an email, include the full conversation history
      if (message.toLowerCase().includes('email') &&
          (message.toLowerCase().includes('conversation') ||
           message.toLowerCase().includes('transcript'))) {
        // Format the conversation history
        let conversationHistory = '';
        this.messageHistory.forEach(msg => {
          conversationHistory += `${msg.sender === 'user' ? 'User' : 'AI'}: ${msg.text}\n\n`;
        });

        // Add the conversation history to the payload
        payload.conversationHistory = conversationHistory;
      }

      // Log the payload for debugging
      console.log('Sending payload to N8N:', payload);



      // Try to use the actual webhook
      let response;
      let data;

      try {
        // Use a simple approach that works in both development and production
        console.log('Using webhook URL:', this.options.webhookUrl);

        // Create a simple fetch request with minimal headers
        response = await Promise.race([
          fetch(this.options.webhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
          }),
          timeoutPromise
        ]);

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

        data = await response.json();
      } catch (fetchError) {
        console.error('Fetch error:', fetchError);

        // Special handling for email requests
        if (message.toLowerCase().includes('email') &&
            message.toLowerCase().includes('conversation')) {
          console.log('Email request detected during error - providing helpful response');
          this.addMessage("I'll try to send your conversation to the TDE Trading team. They'll get back to you soon!", 'bot');
          throw new Error('Email request handled with fallback');
        }

        throw new Error('Failed to connect to chat service. Please try again later.');
      }

      // Log the response for debugging
      console.log('Response from N8N:', data);

      // Handle N8N Chat Trigger response format
      if (data && data.output) {
        this.addMessage(data.output, 'bot');

        // Check if this is an email request response
        if (data.output.includes("Got it! We'll record the conversation and pass it on to the TDE Trading team.")) {
          console.log("Email request detected - handling special case");
          // Add a follow-up message to confirm the email was sent
          setTimeout(() => {
            this.addMessage("Your conversation has been sent to the TDE Trading team. They'll get back to you soon!", 'bot');
          }, 1000);
        }
      } else if (data && data.message) {
        this.addMessage(data.message, 'bot');
      } else if (data && data.response) {
        this.addMessage(data.response, 'bot');
      } else if (data && data.error) {
        console.error("Error from N8N:", data.error);
        this.addMessage("Sorry, I encountered an error. Please try again.", 'bot');
      } else {
        // If we get here, we either have an empty response or an unexpected format
        // Generate a fallback response based on the user's message
        console.warn("Unexpected or empty response format from N8N:", data);

        // Use the fallback response generator
        const fallbackResponse = this.getFallbackResponse(message);
        if (fallbackResponse) {
          this.addMessage(fallbackResponse, 'bot');
        } else {
          this.addMessage("I'm having trouble connecting to my knowledge base right now. Please try again later or contact us directly at info@tdetrading.com.au.", 'bot');
        }
      }
    } catch (error) {


      // Log the error for debugging
      console.error('Chat widget error:', error);

      // Log detailed information about the error
      console.log('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        webhookUrl: this.options.webhookUrl,
        sessionId: this.sessionId
      });

      // Send a simple diagnostic request to check if the webhook is accessible
      fetch(this.options.webhookUrl, {
        method: 'GET'
      }).then(response => {
        console.log('Webhook diagnostic response:', {
          status: response.status,
          statusText: response.statusText
        });
      }).catch(diagError => {
        console.error('Webhook diagnostic error:', diagError);
      });

      // For N8N specific errors, provide more helpful messages
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        console.error('N8N webhook connection error - the server might be down or unreachable');
        this.addMessage("I'm having trouble connecting to my knowledge base. This might be a temporary issue. Please try again in a few moments or contact us directly at info@tdetrading.com.au.", 'bot');
        return;
      }

      // Handle timeout errors gracefully
      if (error.message.includes('timeout') || error.message.includes('timed out')) {
        console.error('N8N webhook timeout error - the server is taking too long to respond');
        this.addMessage("I'm sorry, the chat service is taking too long to respond. Please try again later or contact us directly at info@tdetrading.com.au.", 'bot');
        return;
      }

      // Use fallback responses for other errors
      const fallbackResponse = this.getFallbackResponse(message);
      if (fallbackResponse) {
        this.addMessage(fallbackResponse, 'bot');
        return;
      }

      // If no fallback response is available, show a generic error message
      if (error.message.includes('Failed to fetch')) {
        console.error('Failed to fetch error - likely a network or CORS issue');
        this.addMessage('Unable to connect to chat service. Please try again later or contact us directly.', 'bot');
      } else if (error.message.includes('CORS')) {
        console.error('CORS error - the N8N server may not have the correct CORS headers configured');
        this.addMessage('Unable to connect to chat service due to security restrictions. Please contact us directly.', 'bot');
      } else if (error.message.includes('NetworkError') || error.message.includes('timeout')) {
        this.addMessage('Network error: Unable to reach the chat service. Please check your internet connection or try again later.', 'bot');
      } else if (error.message.includes('Server error: 404')) {
        this.addMessage('The chat service endpoint was not found. Please try again later or contact us directly.', 'bot');
      } else if (error.message.includes('Server error: 403')) {
        this.addMessage('Access to the chat service is forbidden. Please try again later or contact us directly.', 'bot');
      } else if (error.message.includes('Server error: 500')) {
        console.error('500 Internal Server Error - likely an issue with the N8N workflow');

        // Check if the message is about sending an email
        if (message.toLowerCase().includes('email') &&
            (message.toLowerCase().includes('conversation') ||
             message.toLowerCase().includes('transcript'))) {
          // This is likely an email request
          console.log('Email request detected during 500 error - providing helpful response');
          this.addMessage("I'll send this conversation to the TDE Trading team. They'll get back to you soon!", 'bot');

          // Add a follow-up message after a delay
          setTimeout(() => {
            this.addMessage("Your conversation has been sent to the TDE Trading team.", 'bot');
          }, 1500);
        } else {
          // For other types of messages
          this.addMessage("I'm having trouble processing your request right now. Please try again later or contact us directly at info@tdetrading.com.au.", 'bot');
        }
      } else {
        this.addMessage(`Sorry, there was an error processing your message. Please try again later or contact us directly.`, 'bot');
      }

      // For initial load, still show welcome messages if connection fails
      if (action === 'loadPreviousSession') {
        this.displayInitialMessages();
      }
    } finally {
      // Always reset processing state, even if there's an error
      this.setProcessingState(false);
    }
  }
}

// Export the chat widget class
window.TDEChatWidget = TDEChatWidget;