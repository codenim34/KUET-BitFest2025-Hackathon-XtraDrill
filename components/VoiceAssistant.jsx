'use client';

import { useState, useEffect } from 'react';
import { IoMicOutline, IoMicOffOutline } from 'react-icons/io5';

export default function VoiceAssistant({ onTranscript, isListening, setIsListening }) {
  const [recognition, setRecognition] = useState(null);

  const startListening = () => {
    const recognitionInstance = new webkitSpeechRecognition();
    recognitionInstance.lang = 'bn-BD';
    recognitionInstance.continuous = true; // Keep listening
    recognitionInstance.interimResults = true;

    recognitionInstance.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      onTranscript(transcript);
    };

    // Only stop when there's an error
    recognitionInstance.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      setRecognition(null);
    };

    // Restart recognition if it stops due to timeout
    recognitionInstance.onend = () => {
      if (isListening) {
        recognitionInstance.start();
      }
    };

    try {
      recognitionInstance.start();
      setRecognition(recognitionInstance);
      setIsListening(true);
    } catch (error) {
      console.error('Error starting recognition:', error);
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
      setRecognition(null);
    }
  };

  const toggleListening = () => {
    if (!isListening) {
      startListening();
    } else {
      stopListening();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [recognition]);

  return (
    <button
      onClick={toggleListening}
      type="button"
      className={`
        p-3 rounded-full transition-all duration-200 
        ${isListening 
          ? 'bg-red-500 text-white shadow-lg scale-110' 
          : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-500'
        }
        transform hover:scale-110 active:scale-95
      `}
    >
      {isListening ? (
        <div className="relative">
          <IoMicOutline className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        </div>
      ) : (
        <IoMicOffOutline className="w-6 h-6" />
      )}
    </button>
  );
}
