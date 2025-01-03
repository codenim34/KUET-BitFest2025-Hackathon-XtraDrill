'use client';

import BengaliChatBot from "@/components/BengaliChatBot";

export default function BengaliChatPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
            বাংলা চ্যাটবট
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            আপনার বাংলা ভাষার সহায়ক
          </p>
        </div>
        <BengaliChatBot />
      </div>
    </main>
  );
}
