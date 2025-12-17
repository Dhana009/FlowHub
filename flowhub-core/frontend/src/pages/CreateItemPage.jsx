/**
 * Create Item Page
 * 
 * Page component for creating new items.
 * Protected route - requires authentication.
 */

import ItemCreationForm from '../components/items/ItemCreationForm';
import Card from '../components/ui/Card';

export default function CreateItemPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Create New Item
        </h1>
        <p className="text-gray-600">
          Fill in the form below to create a new item. All required fields are marked with an asterisk (*).
        </p>
      </div>
      
      <Card padding="lg">
        <ItemCreationForm />
      </Card>
    </div>
  );
}

