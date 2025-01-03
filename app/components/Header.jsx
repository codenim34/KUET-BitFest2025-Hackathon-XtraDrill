// Add this directive to make Header a Client Component
"use client";

import { UserButton } from "@clerk/nextjs";
import { Pen, Terminal } from "lucide-react";
import Link from "next/link";
import Image from 'next/image';
import { useRouter } from "next/navigation";
import okkhorLogo from '../../public/okkhor-logo.png';

const Header = () => {
  const router = useRouter();

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
