'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { IoMicOutline, IoMicOffOutline, IoSend } from 'react-icons/io5';
import { FaRobot, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';

const COMMANDS = {
  HOME: {
    patterns: ['home', 'হোম', 'go to home', 'হোমে যাও', 'হোম পেজ', 'homepage', 'main page', 'মূল পাতা', 'প্রথম পাতা'],
    route: '/'
  },
  DASHBOARD: {
    patterns: ['dashboard', 'ড্যাশবোর্ড', 'go to dashboard', 'ড্যাশবোর্ডে যাও', 'show dashboard', 'open dashboard'],
    route: '/dashboard'
  },
  CHAT: {
    patterns: ['chat', 'চ্যাট', 'go to chat', 'চ্যাটে যাও', 'open chat', 'start chat', 'messaging'],
    route: '/chat'
  },
  BENGALI_CHAT: {
    patterns: ['bengali chat', 'বাংলা চ্যাট', 'go to bengali chat', 'বাংলা চ্যাটে যাও', 'bangla chat'],
    route: '/bengali-chat'
  },
  STORIES: {
    patterns: ['stories', 'গল্প', 'go to stories', 'গল্পে যাও', 'story page', 'show stories'],
    route: '/stories'
  },
  PROFILE: {
    patterns: ['profile', 'প্রোফাইল', 'go to profile', 'প্রোফাইলে যাও', 'my profile', 'show profile'],
    route: '/profile'
  },
  LEARN: {
    patterns: ['learn', 'শেখা', 'learning', 'go to learn', 'শিখতে যাও', 'start learning'],
    route: '/learn'
  },
  COURSES: {
    patterns: ['courses', 'কোর্স', 'go to courses', 'কোর্সে যাও', 'show courses', 'all courses'],
    route: '/courses'
  },
  BACK: {
    patterns: ['back', 'go back', 'পিছনে', 'পিছনে যাও', 'ফিরে যাও', 'return', 'previous page'],
    route: 'back'
  }
};

export default function VoiceAgent() {
  const router = useRouter();
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputText, setInputText] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'bn-BD';

      recognition.onstart = () => {
        setIsListening(true);
        toast.info('🎤 Listening... | শুনছি...', {
          position: "bottom-center",
          autoClose: 2000
        });
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase().trim();
        handleCommand(transcript);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast.error('Voice recognition failed. Please try again. | আবার চেষ্টা করুন।');
      };

      setRecognition(recognition);
    }
  }, []);

  const handleCommand = useCallback((command) => {
    let commandFound = false;

    Object.entries(COMMANDS).forEach(([key, cmd]) => {
      if (cmd.patterns.some(pattern => 
        command.includes(pattern.toLowerCase()) || 
        pattern.toLowerCase().includes(command)
      )) {
        commandFound = true;
        if (cmd.route === 'back') {
          router.back();
          toast.info('Going back... | পিছনে যাচ্ছি...', {
            icon: "🔙"
          });
        } else {
          router.push(cmd.route);
          toast.success(`Navigating to ${cmd.route} | নতুন পাতায় যাচ্ছি...`, {
            icon: "🚀"
          });
        }
      }
    });

    if (!commandFound) {
      toast.warning('Command not recognized. Try saying "go to home" or "হোমে যাও"', {
        icon: "❓",
        autoClose: 3000
      });
    }

    // Reset UI state after command
    setIsExpanded(false);
    setInputText('');
    setSuggestions([]);
  }, [router]);

  const toggleListening = useCallback(() => {
    if (!recognition) {
      toast.error('Voice recognition is not supported in your browser');
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      try {
        recognition.start();
      } catch (error) {
        console.error('Recognition error:', error);
        recognition.stop();
        setIsListening(false);
      }
    }
  }, [recognition, isListening]);

  const handleInputChange = (e) => {
    const text = e.target.value.toLowerCase();
    setInputText(text);

    if (text.length > 0) {
      const matchingSuggestions = Object.values(COMMANDS)
        .flatMap(cmd => cmd.patterns)
        .filter(pattern => pattern.toLowerCase().includes(text))
        .slice(0, 5);
      setSuggestions(matchingSuggestions);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    handleCommand(suggestion);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputText.trim()) {
      handleCommand(inputText.trim());
    }
  };

  if (!recognition) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <motion.div
        initial={false}
        animate={isExpanded ? "expanded" : "collapsed"}
        className="relative"
      >
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute bottom-full right-0 mb-4 bg-white rounded-lg shadow-xl p-4 w-80"
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={handleInputChange}
                  placeholder="Type a command | কমান্ড টাইপ করুন"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-700"
                >
                  <IoSend className="w-5 h-5" />
                </button>
              </div>

              {suggestions.length > 0 && (
                <div className="bg-white rounded-lg shadow-lg border border-gray-100">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </form>
          </motion.div>
        )}

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/50 transition-all duration-300 hover:shadow-xl"
          >
            <FaRobot className="w-6 h-6" />
          </motion.button>

          {isExpanded && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleListening}
              className={`
                w-12 h-12 rounded-full flex items-center justify-center
                ${isListening 
                  ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/50'
                  : 'bg-blue-500 text-white shadow-lg shadow-blue-500/50'
                }
                transition-all duration-300 hover:shadow-xl
              `}
            >
              {isListening ? (
                <IoMicOffOutline className="w-5 h-5" />
              ) : (
                <IoMicOutline className="w-5 h-5" />
              )}
            </motion.button>
          )}
        </div>

        <AnimatePresence>
          {showTooltip && !isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute bottom-full mb-2 right-0 bg-white rounded-lg shadow-lg p-2 text-sm whitespace-nowrap"
            >
              Click for voice or text commands
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
