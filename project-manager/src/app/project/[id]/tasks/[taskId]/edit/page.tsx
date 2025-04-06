'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import DeleteTaskButton from '@/app/components/DeleteTaskButton';

export default function EditTaskPage() {
  const router = useRouter();
  const params = useParams();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    dueDate: ''
  });
  const [projectId, setProjectId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchTask() {
      try {
        setLoading(true);
        const response = await fetch(`/api/tasks/${params.taskId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch task');
        }

        const task = await response.json();

        if (task) {
          setFormData({
            title: task.title || '',
            description: task.description || '',
            status: task.status || 'todo',
            dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
          });
        } else {
          setError('Task data is missing');
        }
      } catch (error) {
        console.error('Failed to fetch task:', error);
        setError('Failed to load task data');
      } finally {
        setLoading(false);
      }
    }

    if (params.taskId) {
      fetchTask();
    }
  }, [params.taskId]);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    alert(params.id);
    try {
      const response = await fetch(`/api/tasks/${params.taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          id: Number(params.taskId), // Ensure the taskId is sent as 'id'
          projectId: Number(params.id), // Ensure projectId is a number
        }),
      });

      const data = await response.json(); // Parse the response directly to JSON

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update task');
      }

      router.push(`/project/${params.id}`);
      router.refresh(); // Refresh to show updated data
    } catch (error) {
      console.error('Task update failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to update task');
    }
  };


  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Edit Task</h1>
        <p>Loading task data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Edit Task</h1>
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Edit Task</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
        <div>
          <label htmlFor="title" className="block mb-2 font-medium">
            Title *
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            required
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <div>
          <label htmlFor="description" className="block mb-2 font-medium">
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows={4}
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <div>
          <label htmlFor="status" className="block mb-2 font-medium">
            Status *
          </label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value })
            }
            className="w-full px-3 py-2 border rounded"
            required
          >
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>

        <div>
          <label htmlFor="dueDate" className="block mb-2 font-medium">
            Due Date
          </label>
          <input
            type="date"
            id="dueDate"
            value={formData.dueDate}
            onChange={(e) =>
              setFormData({ ...formData, dueDate: e.target.value })
            }
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Save Changes
          </button>
          <DeleteTaskButton
            taskId={Number(params.taskId)}
            projectId={Number(params.id)}
          />
          <button
            type="button"
            onClick={() => router.push(`/project/${params.id}`)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
