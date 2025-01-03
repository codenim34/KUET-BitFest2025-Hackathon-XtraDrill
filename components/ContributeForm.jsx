'use client';

import { useState } from 'react';
import { useUser } from '@clerk/clerk-react';

export default function ContributeForm() {
  const { user } = useUser();
  const [banglishText, setBanglishText] = useState('');
  const [banglaText, setBanglaText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!banglishText.trim() || !banglaText.trim()) return;

    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/contributions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          banglishText: banglishText.trim(),
          banglaText: banglaText.trim(),
          userId: user.id,
          userName: user.fullName || user.username,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: 'success',
          text: 'Thank you for your contribution! It will be reviewed by an admin.'
        });
        setBanglishText('');
        setBanglaText('');
      } else {
        throw new Error(data.error || 'Failed to submit contribution');
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-semibold mb-4">Contribute to Improve Translation</h2>
      <p className="text-gray-600 mb-6">
        Help us improve our translation accuracy by contributing Banglish-to-Bangla pairs.
        Your contributions will be reviewed by our admins before being added to the training data.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="banglishText" className="block text-sm font-medium text-gray-700 mb-1">
            Banglish Text
          </label>
          <textarea
            id="banglishText"
            value={banglishText}
            onChange={(e) => setBanglishText(e.target.value)}
            placeholder="Enter text in Banglish..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            rows={3}
            required
          />
        </div>

        <div>
          <label htmlFor="banglaText" className="block text-sm font-medium text-gray-700 mb-1">
            Bangla Text
          </label>
          <textarea
            id="banglaText"
            value={banglaText}
            onChange={(e) => setBanglaText(e.target.value)}
            placeholder="Enter the same text in Bangla..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            rows={3}
            required
          />
        </div>

        {message.text && (
          <div className={`p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Contribution'}
        </button>
      </form>
    </div>
  );
}
