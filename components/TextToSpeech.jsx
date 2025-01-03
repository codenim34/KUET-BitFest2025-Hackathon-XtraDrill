'use client';

import { useState, useRef } from 'react';
import { IoVolumeHighOutline, IoVolumeMuteOutline } from 'react-icons/io5';

export default function TextToSpeech({ text }) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef(new Audio());

  const toggleSpeech = async () => {
    if (isSpeaking) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsSpeaking(false);
      return;
    }

    try {
      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error('Failed to get audio');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      audioRef.current.src = audioUrl;
      
      audioRef.current.onplay = () => setIsSpeaking(true);
      audioRef.current.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };
      audioRef.current.onerror = (error) => {
        console.error('Audio playback error:', error);
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };

      await audioRef.current.play();
    } catch (error) {
      console.error('Text-to-speech error:', error);
      setIsSpeaking(false);
    }
  };

  return (
    <button
      onClick={toggleSpeech}
      className={`
        p-2 rounded-full transition-all duration-200
        ${isSpeaking 
          ? 'bg-orange-500 text-white shadow-md scale-110' 
          : 'text-gray-400 hover:bg-orange-50 hover:text-orange-500'
        }
        transform hover:scale-110 active:scale-95
      `}
      title={isSpeaking ? 'Stop speaking' : 'Read message'}
    >
      {isSpeaking ? (
        <div className="relative">
          <IoVolumeMuteOutline className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
          </span>
        </div>
      ) : (
        <IoVolumeHighOutline className="w-5 h-5" />
      )}
    </button>
  );
}
