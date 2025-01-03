'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { IoMicOutline, IoMicOffOutline, IoSend } from 'react-icons/io5';
import { FaRobot } from 'react-icons/fa';
import { toast } from 'react-toastify';

const COMMANDS = {
  NAVIGATION: {
    HOME: {
      patterns: ['home', 'হোম', 'go to home', 'হোমে যাও', 'হোম পেজ', 'homepage', 'main page', 'মূল পাতা'],
      action: (router) => router.push('/')
    },
    DASHBOARD: {
      patterns: ['dashboard', 'ড্যাশবোর্ড', 'go to dashboard', 'ড্যাশবোর্ডে যাও'],
      action: (router) => router.push('/dashboard')
    },
    BACK: {
      patterns: ['back', 'go back', 'পিছনে', 'পিছনে যাও', 'ফিরে যাও', 'আগের পেজে যাও'],
      action: (router) => router.back()
    }
  },

  CHAT: {
    NEW_CHAT: {
      patterns: [
        'new chat', 'নতুন চ্যাট', 
        'start new chat', 'নতুন চ্যাট শুরু করো',
        'create chat', 'চ্যাট তৈরি করো',
        'notun chat', 'নতুন চ্যাট খোলো',
        'notun chat khulo', 'chat khulo'
      ],
      action: (router) => router.push('/chat/new')
    },
    OPEN_CHAT: {
      patterns: ['chat', 'চ্যাট', 'open chat', 'চ্যাটে যাও'],
      action: (router) => router.push('/chat')
    },
    NEW_BENGALI_CHAT: {
      patterns: [
        'new bengali chat', 'নতুন বাংলা চ্যাট',
        'start bengali chat', 'বাংলা চ্যাট শুরু করো',
        'notun bangla chat', 'নতুন বাংলা চ্যাট খোলো'
      ],
      action: (router) => router.push('/bengali-chat/new')
    },
    BENGALI_CHAT: {
      patterns: ['bengali chat', 'বাংলা চ্যাট', 'bangla chat', 'বাংলা চ্যাটে যাও'],
      action: (router) => router.push('/bengali-chat')
    }
  },

  CANVAS: {
    CREATE_CANVAS: {
      patterns: [
        'create canvas', 'ক্যানভাস তৈরি করো',
        'new canvas', 'নতুন ক্যানভাস',
        'start canvas', 'ক্যানভাস শুরু করো',
        'canvas create koro', 'ক্যানভাস খোলো'
      ],
      action: (router) => {
        const createButton = document.querySelector('#createCanvasButton');
        if (createButton) {
          createButton.click();
        } else {
          router.push('/canvas');
        }
      }
    },
    OPEN_CANVAS: {
      patterns: ['canvas', 'ক্যানভাস', 'open canvas', 'ক্যানভাসে যাও'],
      action: (router) => router.push('/canvas')
    }
  },

  STORIES: {
    CREATE_STORY: {
      patterns: [
        'create story', 'গল্প তৈরি করো',
        'new story', 'নতুন গল্প',
        'write story', 'গল্প লেখো',
        'golpo likho', 'গল্প লিখো'
      ],
      action: (router) => router.push('/stories/create')
    },
    VIEW_STORIES: {
      patterns: ['stories', 'গল্প', 'all stories', 'সব গল্প দেখাও'],
      action: (router) => router.push('/stories')
    }
  },

  PROFILE: {
    VIEW_PROFILE: {
      patterns: ['profile', 'প্রোফাইল', 'my profile', 'আমার প্রোফাইল'],
      action: (router) => router.push('/profile')
    },
    EDIT_PROFILE: {
      patterns: [
        'edit profile', 'প্রোফাইল এডিট করো',
        'update profile', 'প্রোফাইল আপডেট করো',
        'change profile', 'প্রোফাইল পরিবর্তন করো'
      ],
      action: (router) => router.push('/profile/edit')
    }
  }
};

export default function VoiceAgent() {
  const router = useRouter();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [showCommands, setShowCommands] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        toast('🎤 Listening...', {
          position: "bottom-center",
          autoClose: 1000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          progress: undefined,
        });
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onresult = (event) => {
        const current = event.resultIndex;
        const transcriptText = event.results[current][0].transcript.toLowerCase();
        setTranscript(transcriptText);

        if (event.results[current].isFinal) {
          handleCommand(transcriptText);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast.error('Error with voice recognition', {
          position: "bottom-center",
          autoClose: 2000,
          hideProgressBar: true,
        });
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [router]);

  const handleCommand = useCallback((transcriptText) => {
    let commandFound = false;

    Object.values(COMMANDS).forEach(category => {
      Object.values(category).forEach(command => {
        if (command.patterns.some(pattern => transcriptText.includes(pattern.toLowerCase()))) {
          command.action(router);
          commandFound = true;
          toast('✓', {
            position: "bottom-center",
            autoClose: 500,
            hideProgressBar: true,
          });
        }
      });
    });

    if (!commandFound) {
      toast.info('Command not recognized', {
        position: "bottom-center",
        autoClose: 1000,
        hideProgressBar: true,
      });
    }

    setTranscript('');
  }, [router]);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition not supported', {
        position: "bottom-center",
        autoClose: 2000,
        hideProgressBar: true,
      });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  }, [isListening]);

  const handleManualCommand = useCallback(() => {
    if (transcript) {
      handleCommand(transcript.toLowerCase());
    }
  }, [transcript, handleCommand]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 right-4 flex items-center space-x-2"
    >
      <AnimatePresence>
        {showCommands && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white p-4 rounded-lg shadow-lg mr-2"
          >
            <h3 className="text-lg font-semibold mb-2">Voice Commands:</h3>
            <ul className="space-y-1">
              <li>• "Home" - Go to home page</li>
              <li>• "Create Canvas" - Create new canvas</li>
              <li>• "New Chat" - Start new chat</li>
              <li>• "Profile" - View profile</li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "auto", opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="flex items-center bg-white rounded-full shadow-lg p-2"
          >
            <input
              type="text"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Type or speak command..."
              className="px-4 py-2 rounded-l-full focus:outline-none"
            />
            <button
              onClick={handleManualCommand}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <IoSend className="w-5 h-5 text-blue-500" />
            </button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleListening}
              className={`p-2 rounded-full ${
                isListening ? 'bg-red-500 text-white' : 'hover:bg-gray-100'
              }`}
            >
              {isListening ? (
                <IoMicOffOutline className="w-5 h-5" />
              ) : (
                <IoMicOutline className="w-5 h-5 text-blue-500" />
              )}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          setIsOpen(!isOpen);
          if (showCommands) setShowCommands(false);
        }}
        className="bg-blue-500 p-3 rounded-full text-white shadow-lg z-50"
      >
        <FaRobot className="w-6 h-6" />
      </motion.button>
    </motion.div>
  );
}
