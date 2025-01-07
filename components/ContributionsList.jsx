'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { Clock, MessageCircle, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

const ContributionCard = ({ contribution }) => {
  const getStatusIcon = () => {
    switch (contribution.status) {
      case 'approved':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusColor = () => {
    switch (contribution.status) {
      case 'approved':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className={`px-3 py-1 text-sm rounded-full border ${getStatusColor()}`}>
            {contribution.status.charAt(0).toUpperCase() + contribution.status.slice(1)}
          </span>
        </div>
        <span className="text-sm text-gray-500">
          {new Date(contribution.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Banglish</h3>
          <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{contribution.banglishText}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Bangla</h3>
          <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{contribution.banglaText}</p>
        </div>

        {contribution.adminFeedback && (
          <div className="border-t pt-4 mt-4">
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Admin Feedback</span>
            </div>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              {contribution.adminFeedback}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

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
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white border rounded-lg p-6 space-y-4 animate-pulse">
            <div className="flex justify-between items-center">
              <div className="h-6 w-24 bg-gray-200 rounded"></div>
              <div className="h-4 w-32 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-20 bg-gray-200 rounded"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-20 bg-gray-200 rounded"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-center gap-3">
        <AlertCircle className="h-5 w-5 text-red-600" />
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  if (contributions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-gray-50 inline-block p-4 rounded-full mb-4">
          <MessageCircle className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">No Contributions Yet</h3>
        <p className="text-gray-600">
          Start contributing translations to see your history here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Your Contributions</h2>
        <div className="text-sm text-gray-500">
          Total: {contributions.length}
        </div>
      </div>

      <div className="space-y-4">
        {contributions.map((contribution) => (
          <ContributionCard key={contribution._id} contribution={contribution} />
        ))}
      </div>
    </div>
  );
}
