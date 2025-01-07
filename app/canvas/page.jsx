"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { getCanvasByAuthor, createCanvas } from "@/lib/actions/canvas.actions";
import mongoose from "mongoose";
import { Loader2 } from "lucide-react";

const CanvasCardSkeleton = () => (
  <div className="block p-4 border rounded-lg animate-pulse">
    <div className="h-6 w-3/4 bg-gray-200 rounded mb-2"></div>
    <div className="h-4 w-1/2 bg-gray-200 rounded mb-2"></div>
    <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
  </div>
);

export default function CanvasPage() {
  const router = useRouter();
  const { userId } = useAuth();
  const { user } = useUser();
  const [canvases, setCanvases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const fetchCanvases = async () => {
      if (!userId) return;
      
      const result = await getCanvasByAuthor(userId);
      if (result.success) {
        setCanvases(result.data);
      }
      setIsLoading(false);
    };

    fetchCanvases();
  }, [userId]);

  const handleCreateCanvas = async () => {
    if (!user || !userId || isCreating) return;

    try {
      setIsCreating(true);
      const authorName = user.fullName || user.firstName || user.username || user.emailAddresses[0]?.emailAddress || "Anonymous User";
      const _id = new mongoose.Types.ObjectId();
      
      const result = await createCanvas({
        _id,
        title: "Untitled Canvas",
        content: " ",  
        authorId: userId,
        authorName
      });

      if (result.success) {
        router.push(`/canvas/${result.data._id}`);
      }
    } catch (error) {
      console.error("Error creating canvas:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {isLoading ? (
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
          ) : (
            "My Canvases"
          )}
        </h1>
        <Button 
          onClick={handleCreateCanvas}
          id="createCanvasButton"
          data-create-canvas="true"
          disabled={isLoading || isCreating}
          className={isLoading ? "opacity-50" : ""}
        >
          {isCreating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Create New Canvas"
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <CanvasCardSkeleton key={index} />
          ))
        ) : canvases.map((canvas) => (
          <Link 
            href={`/canvas/${canvas._id}`} 
            key={canvas._id}
            className="block p-4 border rounded-lg hover:border-blue-500 transition-colors"
          >
            <h2 className="text-xl font-semibold">{canvas.title}</h2>
            <p className="text-sm text-gray-500">by {canvas.authorName}</p>
            <p className="text-sm text-gray-500">Created: {new Date(canvas.createdAt).toLocaleDateString()}</p>
          </Link>
        ))}

        {!isLoading && canvases.length === 0 && (
          <div className="col-span-full text-center py-8 text-gray-500">
            No canvases yet. Create your first canvas to get started!
          </div>
        )}
      </div>
    </div>
  );
}
