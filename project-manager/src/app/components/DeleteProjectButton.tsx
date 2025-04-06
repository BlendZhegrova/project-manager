'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function DeleteProjectButton({ projectId }: { projectId: number }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Delete this project and all its tasks?')) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Delete failed');
      
      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete project');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded disabled:opacity-50"
    >
      {isDeleting ? 'Deleting...' : 'Delete'}
    </button>
  );
}