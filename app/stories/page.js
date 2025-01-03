"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getStories } from "@/lib/actions/story.actions";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, User2, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

export default function StoriesPage() {
  const { user } = useUser();
  const [stories, setStories] = useState([]);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchStories = async () => {
      const { success, data, error } = await getStories();
      if (success) {
        // Initialize love state for each story
        const storiesWithLoveState = data.map(story => ({
          ...story,
          isLoved: story.loves?.includes(user?.id),
          loveCount: story.loves?.length || 0
        }));
        setStories(storiesWithLoveState);
      } else {
        setError(error);
      }
    };
    fetchStories();
  }, [user]);

  const handleLove = async (e, storyId) => {
    e.stopPropagation(); // Prevent navigation when clicking love button
    
    if (!user) {
      router.push("/sign-in");
      return;
    }

    try {
      const response = await fetch('/api/stories/love', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ storyId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to toggle love');
      }

      if (result.success) {
        setStories(stories.map(story => 
          story._id === storyId ? result.data : story
        ));
      }
    } catch (error) {
      console.error('Error toggling love:', error);
    }
  };

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
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer border border-gray-100 flex flex-col h-[220px]"
          >
            <div className="p-6 flex flex-col h-full">
              <div>
                <h2 className="text-xl font-semibold mb-2 text-gray-900 hover:text-orange-600 transition-colors line-clamp-2">
                  {story.title}
                </h2>
                <p className="text-gray-600 text-sm line-clamp-3">
                  {truncateContent(story.content)}
                </p>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100 mt-auto">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4" />
                    <span>{new Date(story.createdAt).toLocaleDateString()}</span>
                  </div>
                  <button 
                    onClick={(e) => handleLove(e, story._id)}
                    className="flex items-center gap-1 hover:text-red-500 transition-colors"
                    title={story.isLoved ? "Unlike" : "Like"}
                  >
                    <Heart 
                      className={cn(
                        "w-4 h-4 transition-colors", 
                        story.isLoved ? "fill-red-500 text-red-500" : ""
                      )} 
                    />
                    <span className="text-sm">
                      {story.loveCount || 0}
                    </span>
                  </button>
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
