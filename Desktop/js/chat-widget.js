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
      ...options
    };

    this.container = document.getElementById(this.options.target);
    this.sessionId = this.getSessionId();
    this.messageHistory = this.loadSavedMessages();
    this.isProcessing = false;
    this.loadingIndicator = null;
    this.init();
  }

  /**
   * Initialize the chat widget
   */
  init() {
    if (!this.container) {

      return;
    }

    // Clear chat history on load
    this.clearChatHistory();

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
  }

  /**
   * Clear chat history from localStorage and memory
   */
  clearChatHistory() {
    localStorage.removeItem('chat-messages');
    localStorage.removeItem(this.options.chatSessionKey);
    this.messageHistory = [];
    this.sessionId = this.getSessionId(); // Generate new session ID

    // Clear messages container if it exists
    if (this.messagesContainer) {
      this.messagesContainer.innerHTML = '';
    }
  }

  /**
   * Load saved messages from localStorage
   */
  loadSavedMessages() {
    return []; // Always start with empty history
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
    this.container.classList.toggle('minimized');
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
    const storedSessionId = localStorage.getItem(this.options.chatSessionKey);
    if (storedSessionId) return storedSessionId;

    const newSessionId = Math.random().toString(36).substring(2, 15);
    localStorage.setItem(this.options.chatSessionKey, newSessionId);
    return newSessionId;
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
      }
    }
  }

  /**
   * Send message to N8N webhook
   */
  async sendToN8N(message, action = 'sendMessage') {
    if (!this.options.webhookUrl) {

      return;
    }

    // Don't send empty messages
    if (!message && action === 'sendMessage') {

      return;
    }

    // Set processing state
    this.setProcessingState(true);

    try {
      // Ensure we have a valid sessionId
      if (!this.sessionId) {
        this.sessionId = this.getSessionId();
      }

      // Format payload exactly as N8N Chat Trigger expects
      const payload = {
        sessionId: this.sessionId,
        chatInput: message,
        action: action,
        metadata: {
          ...this.options.metadata,
          timestamp: new Date().toISOString(),
          source: window.location.href
        }
      };



      const response = await fetch(this.options.webhookUrl, {
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

      const data = await response.json();


      // Handle N8N Chat Trigger response format
      if (data.output) {
        this.addMessage(data.output, 'bot');
      } else if (data.message) {
        this.addMessage(data.message, 'bot');
      } else if (data.response) {
        this.addMessage(data.response, 'bot');
      } else if (data.error) {

        this.addMessage("Sorry, I encountered an error. Please try again.", 'bot');
      } else {

        this.addMessage("I received a response but couldn't understand it. Please check the N8N workflow configuration.", 'bot');
      }
    } catch (error) {


      if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {

        this.addMessage('Unable to connect to chat service. Please make sure this domain is allowed in N8N settings.', 'bot');
      } else {
        this.addMessage('Sorry, there was an error processing your message. Please check the browser console for details.', 'bot');
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