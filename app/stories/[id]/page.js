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
import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';
import "@/app/styles/fonts.css";

export default function StoryPage({ params }) {
  const { user } = useUser();
  const [story, setStory] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedFont, setSelectedFont] = useState("আবু জে এম আক্কাস");
  const router = useRouter();

  const fonts = [
    "আবু জে এম আক্কাস",
    "চায়না তিস্তা",
    "হাসান প্রতিলিপি",
    "শহীদ শাফকাত সামির",
    "শহীদ তাহমিদ তামিম"
  ];

  const generatePDF = async () => {
    if (!story) return;

    try {
      console.log('Starting PDF generation...');
      
      // Create a temporary div to render the content
      const tempDiv = document.createElement('div');
      tempDiv.style.padding = '60px'; // Increased padding for better margins
      tempDiv.style.width = '595px'; // A4 width in pixels
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.backgroundColor = 'white';
      
      // Add content to the div with styling
      tempDiv.innerHTML = `
        <style>
          @font-face {
            font-family: '${selectedFont}';
            src: url('/fonts-ttf/${selectedFont}.ttf') format('truetype');
          }
          @page {
            margin: 60px;
          }
        </style>
        <div style="font-family: '${selectedFont}', Arial; opacity: 1; max-width: 475px; margin: 0 auto;">
          <h1 style="font-size: 24px; margin-bottom: 30px; font-family: '${selectedFont}', Arial; text-align: center;">${story.title}</h1>
          <div style="font-size: 12px; margin-bottom: 15px; color: #666;">
            Date: ${new Date(story.createdAt).toLocaleDateString()}
          </div>
          <div style="font-size: 12px; margin-bottom: 30px; color: #666;">
            Author: ${story.authorName || "Anonymous"}
          </div>
          <div style="font-size: 14px; line-height: 1.8; white-space: pre-wrap; font-family: '${selectedFont}', Arial; text-align: justify;">
            ${story.content}
          </div>
        </div>
      `;
      
      // Add the temporary div to the document
      document.body.appendChild(tempDiv);

      // Wait for fonts to load
      await document.fonts.ready;
      
      console.log('Converting content to canvas...');
      const canvas = await html2canvas(tempDiv, {
        scale: 2, // Higher resolution
        useCORS: true,
        logging: true,
        backgroundColor: 'white',
        onclone: (clonedDoc) => {
          const clonedDiv = clonedDoc.querySelector('div');
          clonedDiv.style.position = 'static';
          clonedDiv.style.left = '0';
        }
      });
      
      // Remove the temporary div
      document.body.removeChild(tempDiv);

      console.log('Creating PDF...');
      const imgData = canvas.toDataURL('image/png');
      
      // Create PDF with proper dimensions
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'px',
        format: 'a4',
        compress: true
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const marginTop = 40; // Top margin in pixels
      const marginBottom = 40; // Bottom margin in pixels
      
      const aspectRatio = canvas.width / canvas.height;
      const imgWidth = pdfWidth;
      const imgHeight = pdfWidth / aspectRatio;

      let heightLeft = imgHeight;
      let position = marginTop; // Start from top margin

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, '', 'FAST');
      heightLeft -= (pdfHeight - marginTop - marginBottom); // Subtract margins from available height

      // Add other pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + marginTop; // Add top margin to each page
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, '', 'FAST');
        heightLeft -= (pdfHeight - marginTop - marginBottom); // Subtract margins from available height
      }

      console.log('Saving PDF...');
      pdf.save(`${story.title}.pdf`);
      console.log('PDF generation completed successfully');

    } catch (error) {
      console.error('PDF Generation Error:', {
        message: error.message,
        stack: error.stack,
        font: selectedFont,
        story: {
          title: story.title,
          contentLength: story.content?.length
        }
      });
      alert(`Error generating PDF: ${error.message}`);
    }
  };

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
          <div className="flex items-center gap-4">
            {isAuthor && (
              <>
                <Link href={`/stories/${story._id}/edit`}>
                  <Button variant="outline" className="hover:bg-gray-100">
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Story
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="hover:bg-red-50 text-red-600 border-red-200"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={isDeleting}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
              </>
            )}
            <div className="flex items-center gap-2">
              <select
                value={selectedFont}
                onChange={(e) => setSelectedFont(e.target.value)}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ fontFamily: selectedFont }}
              >
                {fonts.map((font) => (
                  <option key={font} value={font} style={{ fontFamily: font }}>
                    {font}
                  </option>
                ))}
              </select>
              <Button onClick={generatePDF} variant="outline" className="hover:bg-gray-100">
                Download PDF
              </Button>
            </div>
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-4 text-gray-900" style={{ fontFamily: selectedFont }}>
          {story.title}
        </h1>
        <div className="flex items-center gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4" />
            <span>{new Date(story.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <User2 className="w-4 h-4" />
            {story.authorUsername ? (
              <Link href={`/${story.authorUsername}`} className="hover:text-orange-600 transition-colors">
                <span>{story.authorName} {isAuthor && "(You)"}</span>
              </Link>
            ) : (
              <span>{story.authorName} {isAuthor && "(You)"}</span>
            )}
          </div>
        </div>
      </div>

      <div 
        className="prose max-w-none"
        style={{ fontFamily: selectedFont }}
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
