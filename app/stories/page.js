"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getStories } from "@/lib/actions/story.actions";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, User2 } from "lucide-react";

export default function StoriesPage() {
  const { user } = useUser();
  const [stories, setStories] = useState([]);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchStories = async () => {
      const { success, data, error } = await getStories();
      if (success) {
        setStories(data);
      } else {
        setError(error);
      }
    };
    fetchStories();
  }, []);

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  const truncateContent = (content) => {
    const plainText = content.replace(/<[^>]+>/g, '');
    return plainText.length > 100 ? plainText.substring(0, 100) + "..." : plainText;
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Stories</h1>
          <p className="text-gray-600 mt-2">Share your thoughts and experiences</p>
        </div>
        <Link href="/stories/create">
          <Button className="bg-orange-600 hover:bg-orange-700 text-white">
            Create New Story
          </Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stories.map((story) => (
          <div
            key={story._id}
            onClick={() => router.push(`/stories/${story._id}`)}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer border border-gray-100"
          >
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-3 text-gray-900 hover:text-orange-600 transition-colors">
                {story.title}
              </h2>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {truncateContent(story.content)}
              </p>
              <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4" />
                  <span>{new Date(story.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User2 className="w-4 h-4" />
                  <span>{story.authorName}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {stories.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-gray-600">No stories yet</h3>
          <p className="text-gray-500 mt-2">Be the first to create a story!</p>
        </div>
      )}
    </div>
  );
}
