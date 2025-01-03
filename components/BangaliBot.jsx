'use client';

import { useState, useRef, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { IoCopyOutline } from "react-icons/io5";
import { MdHistory, MdKeyboardArrowRight } from "react-icons/md";
import { FaAngleLeft, FaAngleRight, FaPaperPlane } from 'react-icons/fa';

export default function BangaliBot() {
  const { user } = useUser();
  const userAvatar = user?.profileImageUrl;
  const botAvatar = '/bot-avatar.webp';

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isChatHistoryVisible, setIsChatHistoryVisible] = useState(true);
  const messagesEndRef = useRef(null);

  const chatHistory = [
    
  ];

  const toggleChatHistory = () => {
    setIsChatHistoryVisible(!isChatHistoryVisible);
  };

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
                className={`max-w-[80%] rounded-2xl p-4 shadow-md ${
                  message.role === 'user'
                    ? 'bg-orange-500 text-white'
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
        </form>
      </div>
      <div className={`bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 ${isChatHistoryVisible ? 'w-80' : 'w-12'}`}>
        <div className="p-4 h-full flex flex-col">
          <button 
            onClick={toggleChatHistory} 
            className="text-gray-500 hover:text-gray-700 transition-colors mb-4 self-start"
          >
            {isChatHistoryVisible ? <MdKeyboardArrowRight className="w-6 h-6" /> : <MdHistory className="w-6 h-6" />}
          </button>
          {isChatHistoryVisible && (
            <div className="overflow-y-auto flex-1">
              {chatHistory.map((section, index) => (
                <div key={index} className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-500 mb-2">{section.date}</h3>
                  <ul className="space-y-2">
                    {section.messages.map((message, idx) => (
                      <li 
                        key={idx} 
                        className="text-sm bg-gray-50 hover:bg-gray-100 p-2 rounded-lg cursor-pointer transition-colors"
                      >
                        {message}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

