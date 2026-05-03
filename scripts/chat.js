document.addEventListener('DOMContentLoaded', () => {
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const chatMessages = document.getElementById('chat-messages');

    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    async function sendMessage() {
        const message = messageInput.value.trim();
        if (!message) return;

        // Add user message to chat
        addMessage(message, 'user');
        messageInput.value = '';

        // Show typing indicator
        const typingIndicator = addMessage('Escribiendo...', 'bot');
        typingIndicator.classList.add('typing');

        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message }),
            });

            const data = await response.json();
            if (response.ok) {
                // Remove typing indicator
                chatMessages.removeChild(typingIndicator);
                addMessage(data.response, 'bot');
            } else {
                chatMessages.removeChild(typingIndicator);
                addMessage('Error: ' + data.error, 'bot');
            }
        } catch (error) {
            chatMessages.removeChild(typingIndicator);
            addMessage('Error al conectar con el servidor.', 'bot');
        }

        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender);
        messageDiv.textContent = text;
        chatMessages.appendChild(messageDiv);
        return messageDiv;
    }
});