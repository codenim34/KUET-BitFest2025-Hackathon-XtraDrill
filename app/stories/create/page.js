"use client";

import { useState, useEffect } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useRouter } from "next/navigation";
import { createStory } from "@/lib/actions/story.actions";
import { useAuth, useUser } from "@clerk/nextjs";
import { ArrowLeft, Lock, Globe } from "lucide-react";
import Link from "next/link";

export default function CreateStory() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { userId } = useAuth();
  const { user, isLoaded } = useUser();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isLoaded || !user) {
      alert("Please wait while we load your user data...");
      return;
    }

    setIsSubmitting(true);

    try {
      const authorName = user.fullName || user.firstName || user.username || user.emailAddresses[0]?.emailAddress || "Anonymous User";
      
      console.log("Creating story with author name:", authorName);

      const result = await createStory({
        title,
        content,
        authorId: userId,
        authorName: authorName,
        isPrivate,
      });

      if (result.success) {
        router.push("/stories");
      } else {
        console.error("Error details:", result.error);
        alert("Error creating story: " + result.error);
      }
    } catch (error) {
      console.error("Error details:", error);
      alert("An error occurred while creating the story");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (isLoaded && user) {
      console.log("User data loaded:", {
        fullName: user.fullName,
        firstName: user.firstName,
        username: user.username,
        email: user.emailAddresses[0]?.emailAddress
      });
    }
  }, [isLoaded, user]);

  if (!isLoaded) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-40 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Link href="/stories">
        <Button variant="outline" className="hover:bg-gray-100 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Stories
        </Button>
      </Link>

      <h1 className="text-4xl font-bold mb-6 text-gray-900">
        Create New Story
      </h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-2 text-gray-700">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
            required
            placeholder="Enter your story title..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Content
          </label>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <Editor
              apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
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
                skin: "oxide",
                content_css: "default",
                body_class: "prose max-w-none",
              }}
              value={content}
              onEditorChange={(newContent) => setContent(newContent)}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            checked={isPrivate}
            onCheckedChange={setIsPrivate}
            id="visibility"
          />
          <label 
            htmlFor="visibility" 
            className="text-sm font-medium text-gray-700 select-none cursor-pointer flex items-center gap-2"
          >
            {isPrivate ? (
              <>
                <Lock className="w-4 h-4" />
                Private Story
              </>
            ) : (
              <>
                <Globe className="w-4 h-4" />
                Public Story
              </>
            )}
          </label>
        </div>

        <div className="flex gap-4 pt-4">
          <Button 
            type="submit" 
            disabled={isSubmitting || !isLoaded}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            {isSubmitting ? "Publishing..." : "Publish Story"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/stories")}
            disabled={isSubmitting}
            className="hover:bg-gray-100"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
