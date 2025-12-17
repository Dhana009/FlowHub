/**
 * Create Item Page
 * 
 * Page component for creating new items.
 * Protected route - requires authentication.
 */

import ItemCreationForm from '../components/items/ItemCreationForm';

export default function CreateItemPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create New Item
          </h1>
          <p className="text-gray-600 mb-8">
            Fill in the form below to create a new item. All required fields are marked with an asterisk (*).
          </p>
          
          <ItemCreationForm />
        </div>
      </div>
    </div>
  );
}

