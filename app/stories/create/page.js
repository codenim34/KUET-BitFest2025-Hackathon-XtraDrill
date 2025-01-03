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
import { transliterateText } from "@/lib/actions/transliteration";

export default function CreateStory() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentWord, setCurrentWord] = useState("");
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
  const router = useRouter();
  const { userId } = useAuth();
  const { user, isLoaded } = useUser();

  // Track pending requests globally for both title and editor
  const pendingRequests = new Map();

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

  const handleTitleChange = async (e) => {
    const inputValue = e.target.value;
    const cursorPosition = e.target.selectionStart;
    setTitle(inputValue);

    // Skip if it's a double space or if there's no word to transliterate
    if (inputValue.endsWith("  ") || !inputValue.trim()) {
      return;
    }

    // Only proceed if space or punctuation is typed
    if (/[\s,.!?]$/.test(inputValue)) {
      try {
        // Get the text before the cursor
        const textBeforeCursor = inputValue.substring(0, cursorPosition);
        
        // Find the last word before the cursor
        const matches = textBeforeCursor.match(/\b\w+([,.!?\s]*)$/);
        if (!matches) return;
        
        const lastWord = matches[0].trim();
        const separator = matches[1] || '';
        
        if (lastWord && !/[\u0980-\u09FF]/.test(lastWord)) {
          const timestamp = Date.now();
          const requestInfo = {
            timestamp,
            element: e.target,
            text: inputValue,
            lastWord,
            lastWordStart: textBeforeCursor.lastIndexOf(lastWord),
            cursorPosition,
            separator
          };
          
          // Store the request info
          pendingRequests.set(timestamp, requestInfo);
          
          console.log('Sending for transliteration:', lastWord);
          const transliterated = await transliterateText(lastWord);
          
          // Check if this is still the most recent request
          const isLatestRequest = Array.from(pendingRequests.keys())
            .filter(t => t > timestamp)
            .length === 0;
            
          if (!isLatestRequest) {
            console.log('Skipping outdated transliteration response');
            pendingRequests.delete(timestamp);
            return;
          }
          
          if (transliterated) {
            const currentRequest = pendingRequests.get(timestamp);
            const currentValue = currentRequest.element.value;
            
            // Only apply if the text context hasn't changed significantly
            if (currentValue.includes(currentRequest.lastWord)) {
              // Calculate new cursor position
              const cursorOffset = currentRequest.cursorPosition - 
                (currentRequest.lastWordStart + currentRequest.lastWord.length);
              
              // Construct the new text while preserving the rest
              const newText = 
                currentValue.substring(0, currentRequest.lastWordStart) + 
                transliterated + 
                currentRequest.separator +
                currentValue.substring(currentRequest.cursorPosition);
              
              const newCursorPosition = currentRequest.lastWordStart + 
                transliterated.length + 
                cursorOffset;
              
              // Update the input value and cursor position
              setTitle(newText);
              requestAnimationFrame(() => {
                currentRequest.element.value = newText;
                currentRequest.element.setSelectionRange(newCursorPosition, newCursorPosition);
              });
            }
          }
          
          // Clean up the request
          pendingRequests.delete(timestamp);
        }
      } catch (error) {
        console.error("Transliteration error:", error);
      }
    }
  };

  const handleEditorChange = async (content, editor) => {
    setContent(content);
  };

  const handleEditorSetup = (editor) => {
    let lastProcessedText = '';
    
    editor.on('keyup', async function (e) {
      // Only handle space or punctuation
      if (!/^[,.!?\s]$/.test(e.key)) {
        return;
      }

      try {
        const selection = editor.selection;
        const node = selection.getNode();
        const range = selection.getRng();
        
        if (!node || !node.textContent) return;
        
        const text = node.textContent;
        const cursorPosition = range.startOffset;
        
        // Skip if it's a double space or if the text hasn't changed
        if (text === lastProcessedText || text.endsWith("  ")) {
          return;
        }
        
        // Get the text before the cursor
        const textBeforeCursor = text.substring(0, cursorPosition);
        
        // Find the last word before the cursor
        const matches = textBeforeCursor.match(/\b\w+([,.!?\s]*)$/);
        if (!matches) return;
        
        const lastWord = matches[0].trim();
        const separator = matches[1] || '';
        
        if (lastWord && !/[\u0980-\u09FF]/.test(lastWord)) {
          const timestamp = Date.now();
          const requestInfo = {
            timestamp,
            editor,
            node,
            text,
            lastWord,
            lastWordStart: textBeforeCursor.lastIndexOf(lastWord),
            cursorPosition,
            separator
          };
          
          // Store the request info
          pendingRequests.set(timestamp, requestInfo);
          
          console.log('Sending for transliteration:', lastWord);
          const transliterated = await transliterateText(lastWord);
          
          // Check if this is still the most recent request
          const isLatestRequest = Array.from(pendingRequests.keys())
            .filter(t => t > timestamp)
            .length === 0;
            
          if (!isLatestRequest) {
            console.log('Skipping outdated transliteration response');
            pendingRequests.delete(timestamp);
            return;
          }
          
          if (transliterated) {
            const currentRequest = pendingRequests.get(timestamp);
            const currentText = currentRequest.node.textContent;
            
            // Only apply if the text context hasn't changed significantly
            if (currentText.includes(currentRequest.lastWord)) {
              // Calculate new cursor position
              const cursorOffset = currentRequest.cursorPosition - 
                (currentRequest.lastWordStart + currentRequest.lastWord.length);
              
              // Construct the new text while preserving the rest
              const newText = 
                currentText.substring(0, currentRequest.lastWordStart) + 
                transliterated + 
                currentRequest.separator +
                currentText.substring(currentRequest.cursorPosition);
              
              const newCursorPosition = currentRequest.lastWordStart + 
                transliterated.length + 
                cursorOffset;
              
              // Update content
              currentRequest.node.textContent = newText;
              lastProcessedText = newText;
              
              // Restore cursor position
              const newRange = currentRequest.editor.dom.createRng();
              newRange.setStart(currentRequest.node.firstChild, newCursorPosition);
              newRange.setEnd(currentRequest.node.firstChild, newCursorPosition);
              currentRequest.editor.selection.setRng(newRange);
              
              currentRequest.editor.setDirty(true);
            }
          }
          
          // Clean up the request
          pendingRequests.delete(timestamp);
        }
      } catch (error) {
        console.error("Transliteration error:", error);
      }
    });
  };

  const generateTitle = async () => {
    try {
      const editorContent = content;
      if (!editorContent) {
        alert('Please write some content first');
        return;
      }

      setIsGeneratingTitle(true);
      const response = await fetch('/api/generate-title', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: editorContent }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate title');
      }

      const data = await response.json();
      if (data.generatedTitle) {
        setTitle(data.generatedTitle);
      }
    } catch (error) {
      console.error('Title generation error:', error);
      alert('Failed to generate title');
    } finally {
      setIsGeneratingTitle(false);
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
        <div className="flex flex-col gap-5">
          <div className="relative">
            <input
              type="text"
              id="title"
              value={title}
              onChange={handleTitleChange}
              className="w-full p-3 pr-32 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
              required
              placeholder="Enter your story title..."
            />
            <button
              onClick={generateTitle}
              disabled={isGeneratingTitle}
              className={`absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2
                ${isGeneratingTitle 
                  ? 'bg-orange-100 text-orange-600 cursor-not-allowed'
                  : 'bg-orange-600 text-white hover:bg-orange-700 active:bg-orange-800'
                }
                focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2`}
              type="button"
            >
              {isGeneratingTitle ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-orange-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Generating...</span>
                </div>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 2L8 6M20 8L16 8M18 2L15 5M15 11L18 14M3 10C3 9.73478 3.10536 9.48043 3.29289 9.29289C3.48043 9.10536 3.73478 9 4 9H7.59L8.3 8.29C8.48753 8.10247 8.74187 8 9 8C9.25813 8 9.51247 8.10247 9.7 8.29L15.71 14.29C15.8993 14.4778 16.0058 14.7334 16.0058 15C16.0058 15.2666 15.8993 15.5222 15.71 15.71L15 16.41V20C15 20.2652 14.8946 20.5196 14.7071 20.7071C14.5196 20.8946 14.2652 21 14 21H4C3.73478 21 3.48043 20.8946 3.29289 20.7071C3.10536 20.5196 3 20.2652 3 20V10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Generate Title</span>
                </>
              )}
            </button>
          </div>
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
                menubar: false,
                plugins: [
                  "advlist",
                  "autolink",
                  "lists",
                  "link",
                  "image",
                  "charmap",
                  "preview",
                  "anchor",
                  "searchreplace",
                  "visualblocks",
                  "code",
                  "fullscreen",
                  "insertdatetime",
                  "media",
                  "table",
                  "code",
                  "help",
                  "wordcount",
                ],
                toolbar:
                  "undo redo | blocks | " +
                  "bold italic forecolor | alignleft aligncenter " +
                  "alignright alignjustify | bullist numlist outdent indent | " +
                  "removeformat | help",
                content_style: "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                body_class: "prose max-w-none",
              }}
              value={content}
              onEditorChange={handleEditorChange}
              onInit={(evt, editor) => handleEditorSetup(editor)}
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
