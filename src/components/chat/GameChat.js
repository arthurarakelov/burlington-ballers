import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, Clock } from 'lucide-react';
import Button from '../ui/Button';
import { chatService } from '../../services/chatService';

const GameChat = ({ user, hideHeader }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Subscribe to chat messages
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

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + 
             ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  if (loading) {
    return (
      <div className={hideHeader ? "" : "min-h-screen bg-black text-white"}>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <MessageCircle className="w-8 h-8 text-gray-500 mx-auto mb-2 animate-pulse" />
            <p className="text-gray-400">Loading chat...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Message Input at Top */}
      {user && (
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-4">
          <div className="flex gap-3 items-center">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1 bg-gray-800/50 border border-gray-700 focus:border-blue-400 outline-none px-4 py-3 text-white rounded-lg resize-none transition-all duration-300"
              rows="1"
              maxLength={500}
              disabled={sending}
            />
            <Button
              onClick={handleSendMessage}
              loading={sending}
              disabled={!newMessage.trim() || sending}
              size="sm"
              className="px-3 h-12"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {newMessage.length}/500 characters
          </p>
        </div>
      )}

      {/* Messages */}
      {messages.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center max-w-sm">
            <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">No messages yet</h3>
            <p className="text-sm text-gray-500">
              Start the conversation! Let everyone know if you're running late or need to coordinate.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="flex items-start gap-3">
              {message.userPhoto && (
                <img 
                  src={message.userPhoto} 
                  alt={message.userName}
                  className="w-8 h-8 rounded-full flex-shrink-0 mt-1"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-200">
                    {message.userName}
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTime(message.createdAt)}
                  </span>
                </div>
                <div className="bg-gray-800/50 rounded-lg px-4 py-2 max-w-md">
                  <p className="text-sm text-gray-100 whitespace-pre-wrap">
                    {message.message}
                  </p>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
};

export default GameChat;