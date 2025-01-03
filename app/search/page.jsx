'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Book, PenTool, Loader2, Search, Calendar } from 'lucide-react';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error('Search failed');
        const data = await response.json();
        setResults(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      fetchResults();
    }
  }, [query]);

  const handleResultClick = (result) => {
    if (result.type === 'story') {
      router.push(`/stories/${result.id}`);
    } else if (result.type === 'canvas') {
      router.push(`/canvas/${result.id}`);
    }
  };

  if (!query) {
    return (
      <div className="min-h-screen pt-24 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="text-center py-16">
          <Search className="w-16 h-16 text-orange-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Start Your Search</h1>
          <p className="text-gray-400">Enter a search term to find stories and canvases</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Search Results</h1>
        <p className="text-gray-400">
          Showing results for: <span className="text-orange-600">{query}</span>
        </p>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-12 h-12 animate-spin text-orange-600" />
        </div>
      ) : error ? (
        <div className="bg-red-900/20 border border-red-900 rounded-lg p-4 text-red-500">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {results?.stories?.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Book className="w-5 h-5 text-orange-600" />
                <span>Stories</span>
              </h2>
              <div className="space-y-4">
                {results.stories.map((story) => (
                  <div
                    key={story.id}
                    onClick={() => handleResultClick(story)}
                    className="p-6 border border-gray-800 rounded-xl hover:border-orange-600/50 hover:bg-orange-600/5 cursor-pointer transition-all duration-200 group"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-medium group-hover:text-orange-600">
                        {story.title}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(story.createdAt)}
                      </div>
                    </div>
                    <p className="text-gray-400 line-clamp-2">{story.preview}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {results?.canvases?.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <PenTool className="w-5 h-5 text-orange-600" />
                <span>Canvases</span>
              </h2>
              <div className="space-y-4">
                {results.canvases.map((canvas) => (
                  <div
                    key={canvas.id}
                    onClick={() => handleResultClick(canvas)}
                    className="p-6 border border-gray-800 rounded-xl hover:border-orange-600/50 hover:bg-orange-600/5 cursor-pointer transition-all duration-200 group"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-medium group-hover:text-orange-600">
                        {canvas.title}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(canvas.createdAt)}
                      </div>
                    </div>
                    <p className="text-gray-400 line-clamp-2">{canvas.preview}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {(!results?.stories?.length && !results?.canvases?.length) && (
            <div className="col-span-full text-center py-16">
              <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">No results found</h3>
              <p className="text-gray-400">
                Try searching with different keywords or terms
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
