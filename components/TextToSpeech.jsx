'use client';

import { useState } from 'react';
import { IoVolumeHighOutline, IoVolumeMuteOutline } from 'react-icons/io5';

export default function TextToSpeech({ text }) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speakText = () => {
    if (!window.speechSynthesis) {
      console.error('Speech synthesis not supported');
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    if (isSpeaking) {
      setIsSpeaking(false);
      return;
    }

    // Create new utterance
    const utterance = new SpeechSynthesisUtterance(text);

    // Get available voices
    const voices = window.speechSynthesis.getVoices();
    console.log('Available voices:', voices.map(v => `${v.name} (${v.lang})`));

    // Try to find a Bengali voice, fall back to any available voice
    const voice = voices.find(v => v.lang === 'bn-IN') ||
                 voices.find(v => v.lang === 'bn-BD') ||
                 voices.find(v => v.lang.startsWith('bn')) ||
                 voices.find(v => v.lang === 'en-IN') ||
                 voices[0];

    if (voice) {
      console.log('Using voice:', voice.name, voice.lang);
      utterance.voice = voice;
    }

    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      console.log('Speech started');
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      console.log('Speech ended');
      setIsSpeaking(false);
    };

    utterance.onerror = (event) => {
      console.error('Speech error:', event);
      setIsSpeaking(false);
    };

    // Start speaking
    window.speechSynthesis.speak(utterance);
  };

  // Force voice list to load
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.getVoices();
  }

  return (
    <button
      onClick={speakText}
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
