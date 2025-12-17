/**
 * Edit Item Page
 * 
 * Page component for editing existing items.
 * Protected route - requires authentication.
 * Flow 5 - Item Edit
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getItem } from '../services/itemService';
import Button from '../components/common/Button';
import ErrorMessage from '../components/common/ErrorMessage';
import ItemEditForm from '../components/items/ItemEditForm';

export default function EditItemPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadItem = async () => {
      try {
        setLoading(true);
        setError(null);
        const itemData = await getItem(id);
        setItem(itemData);
      } catch (err) {
        setError(err.message || 'Failed to load item');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadItem();
    }
  }, [id]);

  const handleCancel = () => {
    navigate('/items');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading item...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8">
            <ErrorMessage message={error} />
            <div className="mt-4">
              <Button onClick={handleCancel}>Back to Items</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8">
            <p className="text-gray-600">Item not found</p>
            <div className="mt-4">
              <Button onClick={handleCancel}>Back to Items</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Edit Item: {item.name}
          </h1>
          <p className="text-gray-600 mb-8">
            Update item details below. All required fields are marked with an asterisk (*).
          </p>
          
          <ItemEditForm item={item} />
        </div>
      </div>
    </div>
  );
}

