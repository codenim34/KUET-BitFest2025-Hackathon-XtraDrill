"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { getCanvasByAuthor, createCanvas } from "@/lib/actions/canvas.actions";
import mongoose from "mongoose";

export default function CanvasPage() {
  const router = useRouter();
  const { userId } = useAuth();
  const { user } = useUser();
  const [canvases, setCanvases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
    if (!user || !userId) return;

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
  };

  if (isLoading) {
    return <div className="container mx-auto p-6">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Canvases</h1>
        <Button 
          onClick={handleCreateCanvas}
          id="createCanvasButton" // Add an ID for easy reference
          data-create-canvas="true" // Add a data attribute for easier selection
        >
          Create New Canvas
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {canvases.map((canvas) => (
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
      </div>
    </div>
  );
}
