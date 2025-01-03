'use client';

import { useState, useRef, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { IoCopyOutline, IoBookOutline, IoSearchOutline, IoAddCircleOutline, IoTrashOutline } from "react-icons/io5";
import { MdKeyboardArrowRight } from "react-icons/md";
import { FaPaperPlane } from 'react-icons/fa';

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
  const messagesEndRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (user) {
      fetchChatHistory();
      fetchStories();
    }
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [user, messages]);

  const fetchChatHistory = async () => {
    try {
      const response = await fetch(`/api/chat-history?userId=${user.id}`);
      const data = await response.json();
      setChatHistory(data);
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };

  const fetchStories = async () => {
    try {
      const response = await fetch('/api/stories');
      const data = await response.json();
      setStories(data);
    } catch (error) {
      console.error('Error fetching stories:', error);
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
      } else {
        console.error('Error loading chat:', fullChat.error);
      }
    } catch (error) {
      console.error('Error loading chat:', error);
    }
  };

  const deleteChat = async (e, chatId) => {
    e.stopPropagation(); // Prevent chat from being loaded when clicking delete
    
    try {
      const response = await fetch(`/api/chat-history/${chatId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove chat from local state
        setChatHistory(prev => prev.filter(chat => chat._id !== chatId));
        
        // If the deleted chat was the current chat, clear the current chat
        if (currentChatId === chatId) {
          setCurrentChatId(null);
          setMessages([]);
          setSelectedStory(null);
        }
      } else {
        const data = await response.json();
        console.error('Error deleting chat:', data.error);
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  const handleStorySelect = (story) => {
    setSelectedStory(story);
    setIsStoryDropdownOpen(false);
    setSearchQuery('');
    setMessages(prev => [...prev, {
      role: 'system',
      content: `Selected story context: ${story.title}`
    }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || !user) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setInput('');

    try {
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
      } else {
        console.error('Error:', data.error);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStories = stories.filter(story =>
    story.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                onClick={() => setIsStoryDropdownOpen(!isStoryDropdownOpen)}
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
                    {filteredStories.length > 0 ? (
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
                    ) : (
                      <div className="p-3 text-gray-500 text-center">
                        No stories found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message in Banglish or Bengali..."
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
