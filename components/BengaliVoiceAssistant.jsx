'use client';

import { useState, useEffect, useCallback } from 'react';
import { IoMicOutline, IoMicOffOutline } from 'react-icons/io5';
import { motion } from 'framer-motion';

export default function BengaliVoiceAssistant({ onTranscript, isListening, setIsListening }) {
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'bn-BD'; // Set language to Bengali

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        onTranscript(transcript);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognition);
    }
  }, [onTranscript, setIsListening]);

  const toggleListening = useCallback(() => {
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  }, [recognition, isListening, setIsListening]);

  if (!recognition) {
    return null;
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      type="button"
      onClick={toggleListening}
      className={`p-3 rounded-full transition-all ${
        isListening
          ? 'bg-red-500 text-white shadow-lg animate-pulse'
          : 'text-gray-500 hover:text-orange-500 hover:bg-orange-50'
      }`}
      title={isListening ? 'রেকর্ডিং বন্ধ করুন' : 'ভয়েস ইনপুট শুরু করুন'}
    >
      {isListening ? (
        <IoMicOffOutline className="w-6 h-6" />
      ) : (
        <IoMicOutline className="w-6 h-6" />
      )}
    </motion.button>
  );
}
