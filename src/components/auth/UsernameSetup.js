import React, { useState } from 'react';
import FloatingOrbs from '../ui/FloatingOrbs';
import { useMouseTracking } from '../../hooks/useMouseTracking';

const UsernameSetup = ({ user, onUsernameSet, loading }) => {
  const mousePosition = useMouseTracking();
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }
    
    if (username.trim().length < 2) {
      setError('Username must be at least 2 characters');
      return;
    }
    
    if (username.trim().length > 20) {
      setError('Username must be 20 characters or less');
      return;
    }
    
    // Basic validation for inappropriate characters
    if (!/^[a-zA-Z0-9\s\-_]+$/.test(username.trim())) {
      setError('Username can only contain letters, numbers, spaces, hyphens, and underscores');
      return;
    }
    
    setError('');
    onUsernameSet(username.trim());
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <FloatingOrbs mousePosition={mousePosition} />

      <div className="relative z-10">
        <div className="max-w-md mx-auto px-8 py-16">
          {/* Header */}
          <div className="flex items-center justify-between mb-20">
            <div>
              <h1 className="text-xl font-light tracking-wide text-white mb-1">
                Burlington Ballers
              </h1>
            </div>
          </div>
          
          {/* Username setup */}
          <div className="text-center mb-16">
            <div className="mb-8">
              {user?.photo && (
                <img 
                  src={user.photo} 
                  alt="Profile" 
                  className="w-16 h-16 rounded-full mx-auto mb-4"
                />
              )}
              <h2 className="text-2xl font-light mb-2">Welcome!</h2>
              <p className="text-sm text-gray-400 mb-8">
                Choose a username that other players will see
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full bg-transparent border-0 border-b border-gray-800 focus:border-orange-400 outline-none py-4 text-lg font-light text-gray-300 text-center transition-all duration-500 placeholder:text-gray-600"
                  maxLength={20}
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-2">
                  This will be visible to other players
                </p>
              </div>
              
              {error && (
                <p className="text-red-400 text-sm font-light">{error}</p>
              )}
              
              <button 
                type="submit"
                disabled={loading || !username.trim()}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Setting up...' : 'Continue'}
              </button>
            </form>
            
            <p className="text-xs text-gray-600 mt-6">
              You can change this later in your profile
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsernameSetup;