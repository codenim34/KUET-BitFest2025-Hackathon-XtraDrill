'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useRouter } from 'next/navigation';

const ADMIN_USER_IDS = ['user_2r6nKR4A6JG1vSRXXDXWzRaSV6S'];

export default function AdminContributionsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [contributions, setContributions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('pending');
  const [feedback, setFeedback] = useState('');
  const [selectedContribution, setSelectedContribution] = useState(null);

  useEffect(() => {
    // Check if user is loaded and is an admin
    if (isLoaded) {
      if (!user || !ADMIN_USER_IDS.includes(user.id)) {
        router.push('/admin');
        return;
      }
      fetchContributions();
    }
  }, [user, isLoaded, filter]);

  const fetchContributions = async () => {
    try {
      const response = await fetch(`/api/contributions?status=${filter}&isAdmin=true`);
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

  const handleStatusUpdate = async (contributionId, newStatus) => {
    try {
      const response = await fetch(`/api/contributions/${contributionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          adminFeedback: feedback,
        }),
      });

      if (response.ok) {
        setFeedback('');
        setSelectedContribution(null);
        fetchContributions();
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update contribution');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await fetch('/api/contributions/export');
      if (!response.ok) {
        throw new Error('Failed to export contributions');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'approved_contributions.json';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      setError(error.message);
    }
  };

  if (!user || !ADMIN_USER_IDS.includes(user.id)) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-4">
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

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Manage Contributions</h1>
          <div className="flex items-center space-x-4">
            {filter === 'approved' && (
              <button
                onClick={handleExportCSV}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
              >
                <span>Export JSON</span>
              </button>
            )}
            <div className="space-x-2">
              {['pending', 'approved', 'rejected'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg ${
                    filter === status
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-800 rounded-lg">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contributor
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Banglish
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bangla
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                {filter === 'pending' && (
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contributions.map((contribution) => (
                <tr key={contribution._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{contribution.userName}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{contribution.banglishText}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{contribution.banglaText}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(contribution.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      contribution.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : contribution.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {contribution.status.charAt(0).toUpperCase() + contribution.status.slice(1)}
                    </span>
                  </td>
                  {filter === 'pending' && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="space-y-3">
                        <textarea
                          placeholder="Add feedback (optional)"
                          value={selectedContribution === contribution._id ? feedback : ''}
                          onChange={(e) => {
                            setSelectedContribution(contribution._id);
                            setFeedback(e.target.value);
                          }}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                          rows={2}
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleStatusUpdate(contribution._id, 'rejected')}
                            className="px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(contribution._id, 'approved')}
                            className="px-3 py-1 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
                          >
                            Approve
                          </button>
                        </div>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          
          {contributions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No {filter} contributions found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
