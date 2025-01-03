"use client";

import { useEffect, useState } from "react";
import { getStoryById, deleteStory } from "@/lib/actions/story.actions";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CalendarDays, User2, ArrowLeft, Edit2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function StoryPage({ params }) {
  const { user } = useUser();
  const [story, setStory] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const { success, data, error } = await getStoryById(params.id);
        if (success) {
          setStory(data);
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
  }, [params.id]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteStory(params.id);
      if (result.success) {
        router.push("/stories");
      } else {
        alert("Error deleting story: " + result.error);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while deleting the story");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="text-red-600">Error: {error}</div>
        </div>
        <Link href="/stories">
          <Button variant="outline" className="hover:bg-gray-100">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Stories
          </Button>
        </Link>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-gray-500 mb-4">Story not found</div>
        <Link href="/stories">
          <Button variant="outline" className="hover:bg-gray-100">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Stories
          </Button>
        </Link>
      </div>
    );
  }

  const isAuthor = story.authorId === user?.id;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <Link href="/stories">
            <Button variant="outline" className="hover:bg-gray-100">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Stories
            </Button>
          </Link>
          {isAuthor && (
            <div className="flex gap-2">
              <Link href={`/stories/${story._id}/edit`}>
                <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Story
                </Button>
              </Link>
              <Button 
                variant="outline" 
                className="border-red-200 hover:bg-red-50 text-red-600"
                onClick={() => setShowDeleteDialog(true)}
                disabled={isDeleting}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          )}
        </div>
        <h1 className="text-4xl font-bold mb-4 text-gray-900">
          {story.title}
        </h1>
        <div className="flex items-center gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4" />
            <span>{new Date(story.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <User2 className="w-4 h-4" />
            <span>{story.authorName} {isAuthor && "(You)"}</span>
          </div>
        </div>
      </div>

      <div 
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: story.content }}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this story?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your story.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? "Deleting..." : "Delete Story"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
