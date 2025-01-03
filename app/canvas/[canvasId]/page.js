"use client";

import { useState, useEffect } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Languages } from "lucide-react";
import Link from "next/link";
import { getCanvasById, updateCanvas } from "@/lib/actions/canvas.actions";
import { useAuth } from "@clerk/nextjs";
import { CopyButton } from "@/components/ui/copy-button";

export default function CanvasPage({ params }) {
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const { canvasId } = params;
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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateCanvas(canvasId, { title, content });
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
      } else {
        console.error('Translation failed:', data.error);
      }
    } catch (error) {
      console.error('Translation error:', error);
    }
    setIsTranslating(false);
  };

  if (isLoading) {
    return <div className="container mx-auto p-6">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-4 flex items-center justify-between">
        <Link href="/canvas" className="flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Canvases
        </Link>
        <div className="flex items-center gap-2">
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
          onEditorChange={(newContent) => setContent(newContent)}
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

      <div className="mt-4 flex justify-end">
        <Button 
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save Canvas"}
        </Button>
      </div>
    </div>
  );
}
