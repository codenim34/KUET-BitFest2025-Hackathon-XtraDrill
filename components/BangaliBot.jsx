'use client';

import { useState, useRef, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { IoCopyOutline, IoBookOutline, IoSearchOutline } from "react-icons/io5";
import { MdHistory, MdKeyboardArrowRight } from "react-icons/md";
import { FaPaperPlane } from 'react-icons/fa';

export default function BangaliBot() {
  const { user } = useUser();
  const userAvatar = user?.profileImageUrl;
  const botAvatar = '/bot-avatar.webp';

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isChatHistoryVisible, setIsChatHistoryVisible] = useState(true);
  const [stories, setStories] = useState([]);
  const [selectedStory, setSelectedStory] = useState(null);
  const [isStoryDropdownOpen, setIsStoryDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchStories();
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsStoryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchStories = async () => {
    try {
      const response = await fetch('/api/stories');
      const data = await response.json();
      setStories(data);
    } catch (error) {
      console.error('Error fetching stories:', error);
    }
  };

  const toggleChatHistory = () => {
    setIsChatHistoryVisible(!isChatHistoryVisible);
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

  const filteredStories = stories.filter(story =>
    story.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

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
          storyContext: selectedStory ? selectedStory.content : null,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      } else {
        console.error('Error:', data.error);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 flex h-[calc(100vh-10rem)]">
      <div className="flex-1 mr-4 bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
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

              {/* Story Dropdown */}
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

      {/* Chat History Sidebar */}
      <div className={`bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 ${isChatHistoryVisible ? 'w-80' : 'w-12'}`}>
        <div className="p-4 h-full flex flex-col">
          <button 
            onClick={toggleChatHistory} 
            className="text-gray-500 hover:text-gray-700 transition-colors mb-4 self-start"
          >
            {isChatHistoryVisible ? <MdKeyboardArrowRight className="w-6 h-6" /> : <MdHistory className="w-6 h-6" />}
          </button>
          {isChatHistoryVisible && selectedStory && (
            <div className="mb-4 p-3 bg-orange-50 rounded-lg">
              <h3 className="font-medium text-orange-600">Current Story Context:</h3>
              <p className="text-sm text-gray-600">{selectedStory.title}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
