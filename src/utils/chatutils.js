export const handleSend = ({ input, setInput, messages, setMessages }) => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMessage = { role: 'user', content: trimmed };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
};
