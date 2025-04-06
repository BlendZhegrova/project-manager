// components/DeleteTaskButton.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function DeleteTaskButton({ 
  taskId,
  projectId 
}: { 
  taskId: number;
  projectId: number;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    setIsDeleting(true);
    setError('');

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to delete task');
      }

      router.push(`/project/${projectId}`);
      router.refresh();
    } catch (error) {
      console.error('Delete failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete task');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {isDeleting ? 'Deleting...' : 'Delete Task'}
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </>
  );
}