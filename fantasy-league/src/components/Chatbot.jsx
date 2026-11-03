import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Sparkles } from 'lucide-react';

const SUGGESTED_QUESTIONS = [
  "What sports can I track here?",
  "How do I draft a team?",
  "Scoring rules breakdown",
  "Show me the current standings",
  "How does F1 telemetry work?",
  "Tips for picking a Captain",
];

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hey — I'm **Carlos** 🏎️, your AI companion for FOFA Arena. Ask me anything about drafts, live scores, streaming, or sports strategy.", sender: 'ai' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).slice(2)}`);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages, isTyping]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    const userMessage = { id: Date.now(), text, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, sessionId })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { id: Date.now(), text: data.text || "I'm not sure about that.", sender: 'ai' }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { id: Date.now(), text: "Lost connection to server. Try again! ⚡", sender: 'ai' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = (e) => { e.preventDefault(); sendMessage(input); };

  // Simple markdown: **bold** and `code`
  const renderText = (text) => {
    return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/).map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**'))
        return <strong key={i} style={{ color: '#f3c623' }}>{part.slice(2, -2)}</strong>;
      if (part.startsWith('`') && part.endsWith('`'))
        return <code key={i} style={{ background: 'rgba(255,255,255,0.1)', padding: '1px 5px', borderRadius: '4px', fontSize: '0.8rem' }}>{part.slice(1, -1)}</code>;
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <>
      {/* Floating Action Button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="chatbot-trigger"
        style={{
          display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer',
          transform: isOpen ? 'scale(0.85) rotate(90deg)' : 'scale(1)',
          animation: !isOpen ? 'float 3s ease-in-out infinite' : 'none'
        }}
      >
        {isOpen ? <X size={26} color="#fff" /> : <MessageCircle size={26} color="#fff" />}
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div
          className="glass-panel chatbot-panel"
          style={{
            display: 'flex', flexDirection: 'column', padding: 0,
            animation: 'slideInUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}
        >
          {/* Header */}
          <div style={{
            padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center', gap: '12px',
            background: 'linear-gradient(135deg, rgba(93,42,143,0.08), rgba(243,198,35,0.05))'
          }}>
            <div style={{
              width: '42px', height: '42px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #f3c623, #5d2a8f)',
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              boxShadow: '0 0 20px rgba(93,42,143,0.3)'
            }}>
              <Bot size={22} color="#fff" />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: 0, fontSize: '1rem', color: '#fff', fontFamily: 'var(--font-heading)', letterSpacing: '1px' }}>Carlos</h3>
              <span style={{ fontSize: '0.7rem', color: '#00c0f9', display: 'flex', alignItems: 'center', gap: '5px', fontFamily: 'var(--font-heading)', letterSpacing: '1px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00c0f9', boxShadow: '0 0 8px #00c0f9' }}></span> AI COMPANION • GEMINI
              </span>
            </div>
            <Sparkles size={18} color="#f3c623" style={{ opacity: 0.6 }} />
          </div>

          {/* Messages Area */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  padding: '10px 14px',
                  borderRadius: msg.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                  background: msg.sender === 'user'
                    ? 'linear-gradient(135deg, #f3c623, #5d2a8f)'
                    : 'rgba(255,255,255,0.06)',
                  border: msg.sender === 'ai' ? '1px solid rgba(255,255,255,0.06)' : 'none',
                  color: '#fff', fontSize: '0.85rem', lineHeight: '1.5',
                  animation: 'fadeIn 0.2s ease',
                  boxShadow: msg.sender === 'user' ? '0 4px 15px rgba(93,42,143,0.2)' : 'none'
                }}
              >
                {msg.sender === 'ai' ? renderText(msg.text) : msg.text}
              </div>
            ))}

            {isTyping && (
              <div style={{
                alignSelf: 'flex-start', padding: '12px 16px', borderRadius: '14px 14px 14px 2px',
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', gap: '4px', alignItems: 'center'
              }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: '7px', height: '7px', borderRadius: '50%', background: '#5d2a8f',
                    animation: `typingDot 1.2s ease-in-out ${i * 0.2}s infinite`
                  }} />
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions (show only when few messages) */}
          {messages.length <= 2 && !isTyping && (
            <div style={{ padding: '0 16px 12px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <button key={i} onClick={() => sendMessage(q)} style={{
                  padding: '6px 12px', fontSize: '0.7rem', borderRadius: '20px', cursor: 'pointer',
                  background: 'rgba(243,198,35,0.08)', border: '1px solid rgba(243,198,35,0.2)',
                  color: '#f3c623', fontFamily: 'var(--font-body)', transition: 'all 0.2s',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={e => { e.target.style.background = 'rgba(243,198,35,0.15)'; e.target.style.boxShadow = '0 0 10px rgba(243,198,35,0.15)'; }}
                onMouseLeave={e => { e.target.style.background = 'rgba(243,198,35,0.08)'; e.target.style.boxShadow = 'none'; }}
                >{q}</button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <form onSubmit={handleSend} style={{
            padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.3)'
          }}>
            <input
              type="text" value={input} onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Carlos anything..."
              style={{
                flex: 1, padding: '10px 16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.04)', color: '#fff', outline: 'none', fontSize: '0.85rem',
                transition: 'border-color 0.3s'
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(93,42,143,0.3)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
            />
            <button type="submit" disabled={!input.trim()} style={{
              width: '40px', height: '40px', borderRadius: '12px', border: 'none',
              background: input.trim() ? 'linear-gradient(135deg, #f3c623, #5d2a8f)' : 'rgba(255,255,255,0.05)',
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              cursor: input.trim() ? 'pointer' : 'not-allowed', color: '#fff',
              transition: 'all 0.3s', boxShadow: input.trim() ? '0 0 15px rgba(93,42,143,0.2)' : 'none'
            }}>
              <Send size={16} />
            </button>
          </form>
        </div>
      )}

      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        @keyframes slideInUp { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes typingDot { 0%, 60%, 100% { transform: translateY(0); opacity: 0.4; } 30% { transform: translateY(-6px); opacity: 1; } }
        input::placeholder { color: rgba(255,255,255,0.25); }
      `}</style>
    </>
  );
};

export default Chatbot;
