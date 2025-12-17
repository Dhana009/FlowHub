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
import Card from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';

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
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Skeleton height="h-8" width="w-64" className="mb-2" />
          <Skeleton height="h-4" width="w-96" />
        </div>
        <Card padding="lg">
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

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card padding="lg">
          <ErrorMessage message={error} />
          <div className="mt-4">
            <Button onClick={handleCancel}>Back to Items</Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card padding="lg">
          <p className="text-gray-600">Item not found</p>
          <div className="mt-4">
            <Button onClick={handleCancel}>Back to Items</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Edit Item: {item.name}
        </h1>
        <p className="text-gray-600">
          Update item details below. All required fields are marked with an asterisk (*).
        </p>
      </div>
      
      <Card padding="lg">
        <ItemEditForm item={item} />
      </Card>
    </div>
  );
}

