import React, { useState, useEffect, useCallback } from 'react';
import { Send, MessageCircle } from 'lucide-react';
import Button from '../ui/Button';
import { chatService } from '../../services/chatService';

const ChatMessage = React.memo(({ message, formatTime }) => (
  <div className="flex items-start gap-3">
    {message.userPhoto ? (
      <img src={message.userPhoto} alt={message.userName} className="w-8 h-8 rounded-full flex-shrink-0 mt-0.5" />
    ) : (
      <div className="w-8 h-8 rounded-full bg-white/10 flex-shrink-0 mt-0.5" />
    )}
    <div className="flex-1 min-w-0">
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-sm font-medium text-white/80">{message.userName}</span>
        <span className="text-xs text-white/30">{formatTime(message.createdAt)}</span>
      </div>
      <div className="bg-white/[0.06] rounded-2xl rounded-tl-md px-4 py-2.5">
        <p className="text-[15px] text-white/90 whitespace-pre-wrap break-words">{message.message}</p>
      </div>
    </div>
  </div>
));

const GameChat = ({ user, hideHeader }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = chatService.subscribeToMessages((messagesData) => {
      setMessages(messagesData);
      setLoading(false);
    }, (error) => {
      console.error('Error loading messages:', error);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || sending) return;
    setSending(true);
    try {
      await chatService.sendMessage(newMessage.trim(), user);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = useCallback((timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) +
           ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, []);

  if (loading) {
    return (
      <div className={hideHeader ? "" : "min-h-screen bg-[#09090b] text-white"}>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <MessageCircle className="w-8 h-8 text-white/20 mx-auto mb-2 animate-pulse" />
            <p className="text-white/40 text-sm">Loading chat...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-4">
      {/* Message Input */}
      {user && (
        <div className="bg-white/[0.05] rounded-2xl p-4">
          <div className="flex gap-3 items-center">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="flex-1 bg-white/[0.07] rounded-xl px-4 py-3 text-white placeholder-white/30 outline-none focus:ring-2 focus:ring-orange-500/40 resize-none transition-all"
              rows="1"
              maxLength={500}
              disabled={sending}
            />
            <Button
              onClick={handleSendMessage}
              loading={sending}
              disabled={!newMessage.trim() || sending}
              size="sm"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-white/20 mt-2 px-1">{newMessage.length}/500</p>
        </div>
      )}

      {/* Messages */}
      {messages.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center max-w-xs">
            <MessageCircle className="w-10 h-10 text-white/10 mx-auto mb-3" />
            <h3 className="text-[15px] font-medium text-white/60 mb-1">No messages yet</h3>
            <p className="text-sm text-white/30">Start the conversation</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} formatTime={formatTime} />
          ))}
        </div>
      )}
    </div>
  );
};

export default GameChat;
