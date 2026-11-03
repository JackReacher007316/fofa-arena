import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Radio, RotateCcw, Flame, Trophy, MessageCircle, X, Send, Eye } from 'lucide-react';
import { io } from 'socket.io-client';

const USERNAME_COLORS = ['#38bdf8', '#60a5fa', '#f3c623', '#a78bfa', '#34d399', '#f87171'];
const REACTION_EMOJIS = ['🔥', '⚡', '🏆', '❤️', '😱', '👏'];

function getRelativeTime(timestamp) {
  const diff = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
  if (diff < 5) return 'now';
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

function getUsernameColor(username) {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  return USERNAME_COLORS[Math.abs(hash) % USERNAME_COLORS.length];
}

export default function WatchLive() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [iframeKey, setIframeKey] = useState(0);
  const [chatOpen, setChatOpen] = useState(true);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [viewerCount, setViewerCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [floatingEmojis, setFloatingEmojis] = useState([]);

  const socketRef = useRef(null);
  const chatEndRef = useRef(null);
  const chatOpenRef = useRef(chatOpen);
  const floatingIdRef = useRef(0);

  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('fantasy_user'))?.username || 'Viewer';
    } catch {
      return 'Viewer';
    }
  })();

  const sportParam = searchParams.get('sport');
  const sport = (sportParam === 'cricket' || sportParam === 'football') ? sportParam : 'f1';

  const reloadIframe = () => {
    setIframeKey((prev) => prev + 1);
  };

  const handleSportChange = (newSport) => {
    setSearchParams({ sport: newSport });
    setIframeKey(0);
  };

  const streamUrl =
    sport === 'football' ? 'https://colatvia.live/' :
    sport === 'cricket' ? 'https://eplayhd.com/' : 'https://fullraces.com/';

  const sportTitle =
    sport === 'football' ? 'Football Live Stream' :
    sport === 'cricket' ? 'Cricket Live Stream' : 'F1 Live Broadcast';

  const sportDesc =
    sport === 'football'
      ? 'Stream the full 2026 Football season matches live. Direct broadcast feed embedded right here inside FOFA Arena.'
      : sport === 'cricket'
      ? 'Stream the full 2026 Cricket calendar matches live. Direct broadcast feed embedded right here inside FOFA Arena.'
      : 'Stream the full F1 2026 Season sessions live. Direct broadcast feed embedded right here inside FOFA Arena.';

  useEffect(() => {
    chatOpenRef.current = chatOpen;
    if (chatOpen) setUnreadCount(0);
  }, [chatOpen]);

  // Socket connection & room management
  useEffect(() => {
    const socket = io({ transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join-live-chat', { sport });
    });

    socket.on('live-chat-message', (data) => {
      setMessages((prev) => {
        const updated = [...prev, data];
        return updated.length > 100 ? updated.slice(-100) : updated;
      });
      if (!chatOpenRef.current) {
        setUnreadCount((prev) => prev + 1);
      }
    });

    socket.on('live-viewer-count', (data) => {
      setViewerCount(data.count);
    });

    socket.on('live-reaction-event', (data) => {
      spawnFloatingEmoji(data.emoji);
    });

    return () => {
      socket.emit('leave-live-chat', { sport });
      socket.disconnect();
    };
  }, [sport]);

  // Handle sport change — leave old room, join new
  const prevSportRef = useRef(sport);
  useEffect(() => {
    if (prevSportRef.current !== sport && socketRef.current) {
      socketRef.current.emit('leave-live-chat', { sport: prevSportRef.current });
      socketRef.current.emit('join-live-chat', { sport });
      setMessages([]);
      setUnreadCount(0);
      prevSportRef.current = sport;
    }
  }, [sport]);

  // Auto-scroll chat
  useEffect(() => {
    if (chatOpen && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, chatOpen]);

  const sendMessage = () => {
    const trimmed = inputValue.trim();
    if (!trimmed || !socketRef.current) return;
    socketRef.current.emit('live-comment', {
      sport,
      message: trimmed,
      username: currentUser
    });
    setInputValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const spawnFloatingEmoji = (emoji) => {
    const id = ++floatingIdRef.current;
    const left = 10 + Math.random() * 80; // 10% to 90%
    setFloatingEmojis((prev) => [...prev, { id, emoji, left }]);
    setTimeout(() => {
      setFloatingEmojis((prev) => prev.filter((e) => e.id !== id));
    }, 3000);
  };

  const handleReaction = (emoji) => {
    if (socketRef.current) {
      socketRef.current.emit('live-reaction', {
        sport,
        emoji,
        username: currentUser
      });
    }
    spawnFloatingEmoji(emoji);
  };

  return (
    <div className="page-shell" style={{ animation: 'fadeIn 0.5s ease' }}>
      {/* Header Info Section */}
      <section style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ff4b44', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          <Radio size={16} style={{ animation: 'pulse 1.5s infinite' }} />
          LIVE CINEMA MULTICAST
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '8px 0 12px', color: '#ffffff' }}>
          {sportTitle}
        </h1>
        <p style={{ color: '#8f98a9', fontSize: '0.95rem', margin: 0, maxWidth: '800px', lineHeight: '1.6' }}>
          {sportDesc}
        </p>
      </section>

      {/* Stream Selector Navigation */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          paddingBottom: '8px',
          marginBottom: '24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
        }}
      >
        <button
          onClick={() => handleSportChange('f1')}
          style={{
            background: 'none',
            border: 'none',
            color: sport === 'f1' ? '#ffffff' : '#8f98a9',
            fontWeight: 600,
            fontSize: '1rem',
            padding: '8px 16px',
            borderBottom: `2px solid ${sport === 'f1' ? '#ff4b44' : 'transparent'}`,
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          Formula 1
        </button>
        <button
          onClick={() => handleSportChange('cricket')}
          style={{
            background: 'none',
            border: 'none',
            color: sport === 'cricket' ? '#ffffff' : '#8f98a9',
            fontWeight: 600,
            fontSize: '1rem',
            padding: '8px 16px',
            borderBottom: `2px solid ${sport === 'cricket' ? '#ff4b44' : 'transparent'}`,
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          Cricket
        </button>
        <button
          onClick={() => handleSportChange('football')}
          style={{
            background: 'none',
            border: 'none',
            color: sport === 'football' ? '#ffffff' : '#8f98a9',
            fontWeight: 600,
            fontSize: '1rem',
            padding: '8px 16px',
            borderBottom: `2px solid ${sport === 'football' ? '#ff4b44' : 'transparent'}`,
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          Football
        </button>
      </div>

      {/* Main Streaming Grid */}
      <div className={`live-stream-layout ${chatOpen ? 'has-sidebar' : ''}`}>
        {/* Left Video Panel */}
        <div>
          <div className="video-player-container">
            {/* Top Toolbar */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              padding: '12px 20px',
              background: 'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, transparent 100%)',
              zIndex: 10,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="status-pill is-live" style={{ padding: '3px 8px', fontSize: '0.75rem' }}>Live</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ffffff' }}>
                  FOFA Official Feed • {sportTitle}
                </span>
              </div>
              <button
                onClick={reloadIframe}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#ffffff',
                  borderRadius: '4px',
                  padding: '6px 12px',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              >
                <RotateCcw size={12} /> Reload Player
              </button>
            </div>

            {/* Embedded Iframe */}
            <iframe
              key={`${sport}-${iframeKey}`}
              src={streamUrl}
              title={sportTitle}
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />

            {/* Render Floating Emojis */}
            {floatingEmojis.map((fe) => (
              <span
                key={fe.id}
                className="floating-emoji"
                style={{ left: `${fe.left}%` }}
              >
                {fe.emoji}
              </span>
            ))}
          </div>

          {/* Emoji Reaction Tray */}
          <div className="reaction-bar">
            <span style={{ fontSize: '0.75rem', color: '#8f98a9', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: '6px' }}>
              Send Reaction
            </span>
            {REACTION_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleReaction(emoji)}
                className="emoji-btn"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Right Sidebar Live Chat */}
        {chatOpen && (
          <div className="live-chat-panel">
            <div className="chat-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageCircle size={16} color="#ff4b44" />
                <h3>Live Chat</h3>
                <span className="chat-viewer-count">
                  <Eye size={12} /> {viewerCount}
                </span>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                style={{ background: 'none', border: 'none', color: '#8f98a9', display: 'flex', padding: 4 }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="chat-messages">
              {messages.length === 0 && (
                <div style={{
                  margin: 'auto',
                  textAlign: 'center',
                  color: '#8f98a9',
                  fontSize: '0.85rem',
                  padding: '24px 16px'
                }}>
                  <MessageCircle size={32} style={{ margin: '0 auto 8px', opacity: 0.3, color: '#ff4b44' }} />
                  <p style={{ margin: 0 }}>Welcome to the stream chat! Be the first to start the conversation.</p>
                </div>
              )}
              {messages.map((msg) => (
                <div key={msg.id} className="message-item">
                  <span className="message-user" style={{ color: getUsernameColor(msg.username) }}>
                    {msg.username}
                  </span>
                  <span className="message-text">{msg.message}</span>
                  <span className="message-time">{getRelativeTime(msg.timestamp)}</span>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div className="chat-input-area">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Send a comment..."
                className="chat-input"
              />
              <button onClick={sendMessage} className="chat-send-btn">
                <Send size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="live-chat-toggle-btn"
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <MessageCircle size={16} /> Live Chat
          {unreadCount > 0 && (
            <span style={{
              background: '#ff2e55',
              color: '#ffffff',
              borderRadius: '50%',
              minWidth: '18px',
              height: '18px',
              padding: '0 4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.7rem',
              fontWeight: 'bold'
            }}>
              {unreadCount}
            </span>
          )}
        </button>
      )}
    </div>
  );
}
