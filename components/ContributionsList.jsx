'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';

export default function ContributionsList() {
  const { user } = useUser();
  const [contributions, setContributions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchContributions();
    }
  }, [user]);

  const fetchContributions = async () => {
    try {
      const response = await fetch(`/api/contributions?userId=${user.id}`);
      const data = await response.json();
      
      if (response.ok) {
        setContributions(data);
      } else {
        throw new Error(data.error || 'Failed to fetch contributions');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-semibold mb-4">Your Contributions</h2>
      
      {contributions.length === 0 ? (
        <p className="text-gray-500">You haven't made any contributions yet.</p>
      ) : (
        <div className="space-y-4">
          {contributions.map((contribution) => (
            <div
              key={contribution._id}
              className="border rounded-lg p-4 space-y-2"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Banglish</p>
                  <p className="font-medium">{contribution.banglishText}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  contribution.status === 'approved'
                    ? 'bg-green-100 text-green-800'
                    : contribution.status === 'rejected'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {contribution.status.charAt(0).toUpperCase() + contribution.status.slice(1)}
                </span>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Bangla</p>
                <p className="font-medium">{contribution.banglaText}</p>
              </div>

              {contribution.adminFeedback && (
                <div className="mt-2 p-2 bg-gray-50 rounded">
                  <p className="text-sm text-gray-500">Admin Feedback:</p>
                  <p className="text-sm">{contribution.adminFeedback}</p>
                </div>
              )}

              <div className="text-xs text-gray-400 mt-2">
                Submitted on {new Date(contribution.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
