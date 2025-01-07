'use client';

import { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Add New Translation</h2>
        <p className="text-gray-600">
          Your contributions help make our translations more accurate and natural.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="banglishText" className="block text-sm font-medium text-gray-700">
              Banglish Text
            </label>
            <textarea
              id="banglishText"
              value={banglishText}
              onChange={(e) => setBanglishText(e.target.value)}
              placeholder="Type your text in Banglish..."
              className="min-h-[120px] w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="banglaText" className="block text-sm font-medium text-gray-700">
              Bangla Text
            </label>
            <textarea
              id="banglaText"
              value={banglaText}
              onChange={(e) => setBanglaText(e.target.value)}
              placeholder="Enter the same text in Bangla..."
              className="min-h-[120px] w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
              required
            />
          </div>
        </div>

        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </motion.div>
        )}

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting || !banglishText.trim() || !banglaText.trim()}
            className={`bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                Submit Translation
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
