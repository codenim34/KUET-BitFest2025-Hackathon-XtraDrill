"use client";

import { useState, useEffect } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Languages } from "lucide-react";
import Link from "next/link";
import { getCanvasById, updateCanvas } from "@/lib/actions/canvas.actions";
import { useAuth } from "@clerk/nextjs";
import { CopyButton } from "@/components/ui/copy-button";
import { pusherClient } from "@/lib/utils/pusher";
import { useParams } from "next/navigation";

export default function CanvasPage({ params }) {
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [lastUpdateBy, setLastUpdateBy] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { canvasId } = useParams();
  const { userId } = useAuth();

  useEffect(() => {
    const fetchCanvas = async () => {
      const result = await getCanvasById(canvasId);
      if (result.success) {
        setContent(result.data.content);
        setTitle(result.data.title);
      }
      setIsLoading(false);
    };

    fetchCanvas();
  }, [canvasId]);

  // Subscribe to Pusher channel for real-time updates
  useEffect(() => {
    const channel = pusherClient.subscribe(`canvas-${canvasId}`);
    
    channel.bind('canvas-updated', ({ content: newContent, title: newTitle, userId: updatedBy }) => {
      // Only update if the change came from another user
      if (updatedBy !== userId) {
        setContent(newContent);
        setTitle(newTitle);
        setLastUpdateBy(updatedBy);
        setHasUnsavedChanges(false);
      }
    });

    return () => {
      pusherClient.unsubscribe(`canvas-${canvasId}`);
    };
  }, [canvasId, userId]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateCanvas(canvasId, { title, content, userId });
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error("Error saving canvas:", error);
    }
    setIsSaving(false);
  };

  const handleTranslate = async () => {
    setIsTranslating(true);
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: content }),
      });

      const data = await response.json();
      
      if (data.translatedText) {
        setContent(data.translatedText);
        // Save the translated content
        await handleSave();
      } else {
        console.error('Translation failed:', data.error);
      }
    } catch (error) {
      console.error('Translation error:', error);
    }
    setIsTranslating(false);
  };

  // Debounce content changes before saving
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (content && !isLoading && !isSaving) {
        handleSave();
      }
    }, 2000); // Increased to 2 seconds to give more time for multiple changes

    return () => clearTimeout(timeoutId);
  }, [content]);

  // Track unsaved changes
  useEffect(() => {
    if (!isLoading && !isSaving) {
      setHasUnsavedChanges(true);
    }
  }, [content, title]);

  if (isLoading) {
    return <div className="container mx-auto p-6">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/canvas" className="flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Canvases
          </Link>
          {hasUnsavedChanges && (
            <span className="text-orange-600 text-sm animate-pulse">
              ● Unsaved changes
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={handleSave}
            disabled={isSaving || !hasUnsavedChanges}
            className={`relative ${
              hasUnsavedChanges 
                ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
            }`}
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : hasUnsavedChanges ? (
              "Save Changes"
            ) : (
              "✓ Saved"
            )}
          </Button>
          <Button 
            onClick={handleTranslate}
            disabled={isTranslating}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Languages className="w-4 h-4" />
            {isTranslating ? "Converting..." : "Banglish to Bangla"}
          </Button>
          <CopyButton 
            text={`${process.env.NEXT_PUBLIC_APP_URL}/canvas/${canvasId}`}
            className="ml-2"
          />
        </div>
      </div>

      {lastUpdateBy && (
        <div className="mb-4 text-sm text-gray-500">
          Last updated by another user
        </div>
      )}

      <div className="mb-6">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-2xl font-bold w-full border-0 border-b-2 border-transparent hover:border-gray-200 focus:border-gray-300 focus:outline-none transition-colors"
          placeholder="Untitled Canvas"
        />
      </div>

      <div className="min-h-[500px] border rounded-lg">
        <Editor
          apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
          value={content}
          onEditorChange={(newContent) => {
            setContent(newContent);
            setHasUnsavedChanges(true);
          }}
          init={{
            height: 500,
            menubar: true,
            plugins: [
              "advlist", "autolink", "lists", "link", "image", "charmap", "preview",
              "anchor", "searchreplace", "visualblocks", "code", "fullscreen",
              "insertdatetime", "media", "table", "code", "help", "wordcount"
            ],
            toolbar: "undo redo | blocks | " +
              "bold italic forecolor | alignleft aligncenter " +
              "alignright alignjustify | bullist numlist outdent indent | " +
              "removeformat | help",
          }}
        />
      </div>
    </div>
  );
}
