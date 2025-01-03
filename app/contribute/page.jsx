'use client';

import ContributeForm from '@/components/ContributeForm';
import ContributionsList from '@/components/ContributionsList';

export default function ContributePage() {
  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      <ContributeForm />
      <ContributionsList />
    </div>
  );
}
