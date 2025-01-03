'use client';

import { useState, useRef, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { IoCopyOutline, IoBookOutline, IoSearchOutline, IoAddCircleOutline, IoTrashOutline } from "react-icons/io5";
import { FaPaperPlane } from 'react-icons/fa';
import VoiceAssistant from './VoiceAssistant';

export default function BangaliBot() {
  const { user } = useUser();
  const userAvatar = user?.profileImageUrl;
  const botAvatar = '/bot-avatar.webp';

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stories, setStories] = useState([]);
  const [selectedStory, setSelectedStory] = useState(null);
  const [isStoryDropdownOpen, setIsStoryDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [isStoriesLoading, setIsStoriesLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const dropdownRef = useRef(null);

  const fetchChatHistory = async () => {
    try {
      console.log('Fetching chat history...');
      const response = await fetch(`/api/chat-history?userId=${user.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch chat history');
      }
      const data = await response.json();
      console.log('Chat history loaded:', data.length, 'chats');
      setChatHistory(data);
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };

  const startNewChat = async () => {
    try {
      const response = await fetch('/api/chat-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
        }),
      });
      const newChat = await response.json();
      setChatHistory(prev => [newChat, ...prev]);
      setCurrentChatId(newChat._id);
      setMessages([]);
      setSelectedStory(null);
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
  };

  const loadChat = async (chat) => {
    try {
      const response = await fetch(`/api/chat-history/${chat._id}`);
      const fullChat = await response.json();
      
      if (response.ok) {
        setCurrentChatId(fullChat._id);
        setMessages(fullChat.messages);
        if (fullChat.storyContext) {
          setSelectedStory({
            _id: fullChat.storyContext.storyId,
            title: fullChat.storyContext.title,
            content: fullChat.storyContext.content
          });
        } else {
          setSelectedStory(null);
        }
      }
    } catch (error) {
      console.error('Error loading chat:', error);
    }
  };

  const deleteChat = async (e, chatId) => {
    e.stopPropagation();
    
    try {
      const response = await fetch(`/api/chat-history/${chatId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setChatHistory(prev => prev.filter(chat => chat._id !== chatId));
        
        if (currentChatId === chatId) {
          setCurrentChatId(null);
          setMessages([]);
          setSelectedStory(null);
        }
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!input.trim() || !user) return;

    const userMessage = { role: 'user', content: input };
    setInput('');
    setMessages(prev => [...prev, userMessage]);

    try {
      setIsLoading(true);
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          storyContext: selectedStory,
          chatId: currentChatId,
          userId: user.id,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
        if (!currentChatId) {
          setCurrentChatId(data.chatId);
          fetchChatHistory();
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'দুঃখিত, একটি ত্রুটি হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = (transcript) => {
    setInput(transcript);
  };

  const fetchStories = async () => {
    try {
      setIsStoriesLoading(true);
      setFetchError(null);
      
      console.log('Fetching stories...');
      const response = await fetch('/api/stories');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch stories');
      }
      
      const data = await response.json();
      console.log('Stories response:', data);
      
      if (!Array.isArray(data)) {
        console.error('Invalid stories response:', data);
        throw new Error('Invalid response format');
      }
      
      setStories(data);
      console.log('Stories set:', data.length);
    } catch (error) {
      console.error('Error fetching stories:', error);
      setFetchError(error.message);
      setStories([]);
    } finally {
      setIsStoriesLoading(false);
    }
  };

  const handleStorySelect = (story) => {
    console.log('Selected story:', story);
    setSelectedStory(story);
    setIsStoryDropdownOpen(false);
    setSearchQuery('');
    setMessages(prev => [...prev, {
      role: 'system',
      content: `Selected story context: ${story.title}`
    }]);
  };

  const filteredStories = stories.filter(story =>
    story.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (user) {
      fetchChatHistory();
      if (isStoryDropdownOpen) {
        fetchStories();
      }
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [user, messages, isStoryDropdownOpen]);

  return (
    <div className="max-w-7xl mx-auto p-4 flex h-[calc(100vh-10rem)] gap-4">
      {/* Sidebar */}
      <div className="w-64 bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
        <div className="p-4">
          <button
            onClick={startNewChat}
            className="w-full flex items-center justify-center gap-2 bg-orange-500 text-white py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors"
          >
            <IoAddCircleOutline className="w-5 h-5" />
            <span>New Chat</span>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2">
          {chatHistory.map((chat) => (
            <div
              key={chat._id}
              onClick={() => loadChat(chat)}
              className={`p-3 cursor-pointer rounded-lg transition-colors mb-2 ${
                currentChatId === chat._id 
                  ? 'bg-orange-100 text-orange-700'
                  : 'hover:bg-gray-100'
              }`}
            >
              <div className="flex items-start justify-between group">
                <h3 className="font-medium text-sm truncate flex-1">
                  {chat.title}
                </h3>
                <button 
                  onClick={(e) => deleteChat(e, chat._id)}
                  className="text-gray-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete chat"
                >
                  <IoTrashOutline className="w-4 h-4" />
                </button>
              </div>
              {chat.storyContext && (
                <div className="mt-1 text-xs text-orange-600 flex items-center gap-1">
                  <IoBookOutline className="w-3 h-3" />
                  {chat.storyContext.title}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              } items-start`}
            >
              {message.role === 'assistant' && (
                <img
                  src={botAvatar}
                  alt="Bot Avatar"
                  className="w-10 h-10 rounded-full mr-3 border-2 border-gray-200"
                />
              )}
              <div
                className={`max-w-[80%] rounded-2xl p-4 shadow-md relative ${
                  message.role === 'user'
                    ? 'bg-orange-500 text-white'
                    : message.role === 'system'
                    ? 'bg-gray-200 text-gray-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <p className="text-sm md:text-base">{message.content}</p>
                {message.role === 'assistant' && (
                  <button
                    onClick={() => navigator.clipboard.writeText(message.content)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Copy message"
                  >
                    <IoCopyOutline className="w-5 h-5" />
                  </button>
                )}
              </div>
              {message.role === 'user' && (
                <img
                  src={userAvatar}
                  alt="User Avatar"
                  className="w-10 h-10 rounded-full ml-3 border-2 border-orange-200"
                />
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl p-4 shadow-md">
                <div className="animate-pulse flex space-x-2">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => {
                  setIsStoryDropdownOpen(!isStoryDropdownOpen);
                  if (!isStoryDropdownOpen) {
                    fetchStories();
                  }
                }}
                className={`p-3 rounded-full transition-colors ${
                  selectedStory 
                    ? 'text-orange-500 bg-orange-50' 
                    : 'text-gray-500 hover:text-orange-500'
                }`}
                title="Select Story Context"
              >
                <IoBookOutline className="w-6 h-6" />
              </button>

              {isStoryDropdownOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-hidden">
                  <div className="p-2 border-b sticky top-0 bg-white">
                    <div className="relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search stories..."
                        className="w-full pl-8 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      <IoSearchOutline className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>
                  <div className="overflow-y-auto max-h-80">
                    {isStoriesLoading ? (
                      <div className="p-4 text-center text-gray-500">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                        <p className="mt-2">Loading stories...</p>
                      </div>
                    ) : fetchError ? (
                      <div className="p-4 text-center text-red-500">
                        <p>{fetchError}</p>
                        <button
                          onClick={fetchStories}
                          className="mt-2 text-orange-500 hover:text-orange-600"
                        >
                          Try Again
                        </button>
                      </div>
                    ) : stories.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        No stories available
                      </div>
                    ) : (
                      filteredStories.map((story) => (
                        <div
                          key={story._id}
                          onClick={() => handleStorySelect(story)}
                          className={`p-3 cursor-pointer hover:bg-orange-50 transition-colors ${
                            selectedStory?._id === story._id ? 'bg-orange-100' : ''
                          }`}
                        >
                          <h3 className="font-medium text-gray-800">{story.title}</h3>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <VoiceAssistant
              onTranscript={handleVoiceInput}
              isListening={isListening}
              setIsListening={setIsListening}
            />

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? 'Listening...' : 'Type your message in Banglish or Bengali...'}
              className="flex-1 p-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-shadow"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="bg-orange-500 text-white p-3 rounded-full hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaPaperPlane className="w-5 h-5" />
            </button>
          </div>
          {selectedStory && (
            <div className="mt-2 px-14">
              <p className="text-xs text-gray-500">
                Current context: {selectedStory.title}
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
