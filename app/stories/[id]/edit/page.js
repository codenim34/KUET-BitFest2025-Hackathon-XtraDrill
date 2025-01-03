"use client";

import { useState, useEffect } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { getStoryById, updateStory } from "@/lib/actions/story.actions";
import { useAuth, useUser } from "@clerk/nextjs";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function EditStory({ params }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { userId } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const { success, data, error } = await getStoryById(params.id);
        if (success) {
          // Check if the user is the author
          if (data.authorId !== userId) {
            setError("You don't have permission to edit this story");
            return;
          }
          setTitle(data.title);
          setContent(data.content);
        } else {
          setError(error);
        }
      } catch (err) {
        setError("Failed to load story");
      } finally {
        setLoading(false);
      }
    };

    fetchStory();
  }, [params.id, userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await updateStory(params.id, {
        title,
        content,
      });

      if (result.success) {
        router.push(`/stories/${params.id}`);
      } else {
        alert("Error updating story: " + result.error);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while updating the story");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
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

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="text-red-600">{error}</div>
        </div>
        <Link href={`/stories/${params.id}`}>
          <Button variant="outline" className="hover:bg-gray-100">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Story
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Link href={`/stories/${params.id}`}>
        <Button variant="outline" className="hover:bg-gray-100 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Story
        </Button>
      </Link>

      <h1 className="text-4xl font-bold mb-6 text-gray-900">
        Edit Story
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

        <div className="flex gap-4 pt-4">
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/stories/${params.id}`)}
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
