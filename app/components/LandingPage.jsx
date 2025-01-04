"use client";

import { useUser } from "@clerk/nextjs"; // Import useUser from Clerk
import {
  Bot,
  ChevronRight,
  Code2,
  Globe2,
  GraduationCap,
  MessageSquare,
  Scale,
  Terminal,
  Users,
  Youtube,
} from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import Image from 'next/image';
import okkhorLogo from '../../public/okkhor-logo.png';
import publish3d from '../../public/3d/publish.png';
import read3d from '../../public/3d/read.png';
import translate3d from '../../public/3d/translate.png';
import chatbot3d from '../../public/3d/chatbot.png';
import heroImage from '../../public/hero-image.png';
import FloatingImage from '../../components/ui/floating-image';

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
      <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 mb-6">
        {icon}
      </div>
      <h3 className="text-2xl font-semibold mb-3">{title}</h3>
      <p className="text-gray-700">{description}</p>
    </div>
  );
}

function SDGCard({ icon, number, title, description }) {
  return (
    <div className="bg-white p-6 md:p-10 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-200">
      <div className="flex flex-col sm:flex-row sm:items-center mb-6">
        <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 mb-4 sm:mb-0 sm:mr-6">
          {icon}
        </div>
        <div>
          <div className="text-sm text-orange-600 font-semibold">
            SDG {number}
          </div>
          <h3 className="text-2xl font-bold">{title}</h3>
        </div>
      </div>
      <p className="text-gray-700">{description}</p>
    </div>
  );
}

const LandingPage = () => {
  const { isSignedIn, isLoaded } = useUser(); // Access user authentication state
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State for mobile menu

  // While the user state is loading, you might want to show a loader or nothing
  if (!isLoaded) {
    return null; // Or a loader component
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header and Navigation */}
      <header className="relative overflow-hidden">
        <nav className="fixed top-0 w-full z-20 bg-white shadow-md">
          <div className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-8 py-4">
            {/* Logo */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Image 
                src={okkhorLogo}
                alt="Orkkhor Logo" 
                width={90} 
                height={30} 
                className="text-2xl sm:text-3xl font-bold text-gray-900"
              />
            </div>

            {/* Hamburger Menu Button (Visible on Mobile) */}
            <button
              className="md:hidden focus:outline-none"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle Menu"
            >
              {isMenuOpen ? (
                <svg
                  className="w-6 h-6 text-gray-900"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6 text-gray-900"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>

            {/* Desktop Navigation Links (Hidden on Mobile) */}
            <div className="hidden md:flex space-x-6 items-center">
              <Link href={isSignedIn ? "/dashboard" : "/sign-in"}>
                <button className="bg-[#000033] text-white px-6 py-2 rounded-full text-lg font-semibold hover:bg-orange-700 transition-colors">
                  Get Started
                </button>
              </Link>
            </div>
          </div>

          {/* Mobile Navigation Links (Visible on Mobile Only) */}
          {isMenuOpen && (
            <div className="md:hidden bg-white shadow-md">
              <div className="flex flex-col space-y-4 px-4 py-6">
                <Link
                  href={isSignedIn ? "/dashboard" : "/sign-in"}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <button className="bg-[#000033] text-white px-6 py-2 rounded-full text-lg font-semibold hover:bg-orange-700 transition-colors w-full">
                    Get Started
                  </button>
                </Link>
              </div>
            </div>
          )}
        </nav>

        {/* Hero Section */}
        <div className="relative pt-40 sm:pt-48 pb-28 sm:pb-32 px-4 sm:px-8 bg-gradient-to-r from-orange-400 to-white">
          <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-transparent to-white opacity-100"></div>
          <div className="relative max-w-7xl mx-auto flex items-center justify-between">
            <div className="max-w-lg">
              <h1 className="text-5xl font-bold text-gray-900">Where Bangla Stories Come Alive</h1>
              <p className="mt-4 text-lg text-gray-700">Write, Share, and Connect in Your Language</p>
              <button className="mt-8 bg-orange-500 text-white px-6 py-3 rounded-full text-lg font-semibold hover:bg-orange-600 transition-all">Start Writing</button>
            </div>
            <div className="w-1/2 flex justify-center items-center">
              <div className="w-4/5">
                <Image 
                  src={heroImage}
                  alt="Hero Image"
                  layout="responsive"
                  width={100}
                  height={100}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Publishing Section */}
        <section className="py-16 bg-white h-full flex items-center justify-center">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center">
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold text-gray-900">Easy Publishing</h2>
              <p className="mt-4 text-lg text-gray-700">Publish your stories effortlessly with our tools.</p>
            </div>
            <div className="md:w-1/2 relative">
              <FloatingImage src={publish3d} alt="Publishing" className="w-32 h-auto object-contain" />
            </div>
          </div>
        </section>

        {/* Explore Stories Section */}
        <section className="py-16 bg-light-orange h-full flex items-center justify-center">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 relative">
              <FloatingImage src={read3d} alt="Explore Stories" className="w-32 h-auto object-contain" />
            </div>
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold text-gray-900">Discover Stories</h2>
              <p className="mt-4 text-lg text-gray-700">Find amazing stories by talented writers.</p>
              {/* Story preview cards */}
              <div className="story-cards mt-8">
                {/* Add story cards here */}
              </div>
            </div>
          </div>
        </section>

        {/* Translation Feature Section */}
        <section className="py-16 bg-white h-full flex items-center justify-center">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center">
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold text-gray-900">Translate Effortlessly</h2>
              <p className="mt-4 text-lg text-gray-700">Experience seamless translation from Banglish to Bangla.</p>
            </div>
            <div className="md:w-1/2 relative">
              <FloatingImage src={translate3d} alt="Translation" className="w-32 h-auto object-contain" />
            </div>
          </div>
        </section>

        {/* AI Chatbot Section */}
        <section className="py-16 bg-light-orange h-full flex items-center justify-center">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 relative">
              <FloatingImage src={chatbot3d} alt="AI Chatbot" className="w-32 h-auto object-contain" />
            </div>
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold text-gray-900">Chat with Bengali AI</h2>
              <p className="mt-4 text-lg text-gray-700">Get help from our AI Bengali chatbot anytime. Chat in Banglish or Bangla, it knows everything.</p>
              {/* Chat interface preview */}
              <div className="chat-interface mt-8">
                {/* Add chat interface preview here */}
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-16 bg-gray-900 text-center">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold text-white">Join Us</h2>
            <p className="mt-4 text-lg text-gray-300">Be part of our community of writers and readers.</p>
            <button className="mt-8 bg-orange-500 text-white px-6 py-3 rounded-full text-lg font-semibold hover:bg-orange-600 transition-all">Join Now</button>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 bg-gray-900 text-white text-center">
          <div className="max-w-7xl mx-auto">
            <p className="text-lg"> 2025 All Rights Reserved.</p>
          </div>
        </footer>
      </header>
    </div>
  );
};

export default LandingPage;
