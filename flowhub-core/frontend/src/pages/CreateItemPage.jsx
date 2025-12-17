/**
 * Create Item Page
 * 
 * Page component for creating new items.
 * Protected route - requires authentication.
 */

import { useState } from 'react';
import ItemCreationForm from '../components/items/ItemCreationForm';
import Card from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';

export default function CreateItemPage() {
  const [loading] = useState(false); // Can be set to true when form is submitting

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="mb-6">
          <Skeleton height="h-4" width="w-96" />
        </div>
        <Card variant="elevated">
          <div className="space-y-4">
            <Skeleton height="h-10" />
            <Skeleton height="h-10" />
            <Skeleton height="h-32" />
            <Skeleton height="h-10" />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-6">
        <p className="text-base text-slate-600 leading-relaxed">
          Fill in the form below to create a new item. All required fields are marked with an asterisk (*).
        </p>
      </div>
      
      <Card variant="elevated">
        <ItemCreationForm />
      </Card>
    </div>
  );
}

