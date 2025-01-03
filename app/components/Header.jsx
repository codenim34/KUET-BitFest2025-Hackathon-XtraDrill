// Add this directive to make Header a Client Component
"use client";

import { UserButton } from "@clerk/nextjs";
import { Pen, Terminal, Search } from "lucide-react";
import Link from "next/link";
import Image from 'next/image';
import { useRouter } from "next/navigation";
import { useState } from "react";
import okkhorLogo from '../../public/okkhor-logo.png';

const Header = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");


  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-20 flex items-center justify-between px-8 py-4 bg-gray-900">
      {/* Logo Section - Replaced with Terminal icon and text */}
      <Link href="/" className="flex items-center">
        <Image 
          src={okkhorLogo}
          alt="Orkkhor Logo" 
          width={90} 
          height={30} 
          className="text-2xl sm:text-3xl font-bold text-gray-900"
        />
      </Link>

      <div className="flex-1 max-w-2xl mx-8">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stories, canvas..."
            className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
          >
            <Search size={20} />
          </button>
        </form>
      </div>

      {/* Optional: Add navigation links or user-related buttons */}
      <div className="flex items-center space-x-4">
        {/* Example: User Button */}
        <UserButton
          afterSignOutUrl="/"
          signOutCallback={() => {
            router.push("/");
          }}
        />
      </div>
    </nav>
  );
};

export default Header;
