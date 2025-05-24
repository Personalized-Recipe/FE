export const handleSend = ({input, setInput, messages, setMessages}) => {
    const trimmed = input.trim();
    if (!trimmed) return;

    setMessages([...messages, { role: 'user', content: input}])
    setInput('');
}