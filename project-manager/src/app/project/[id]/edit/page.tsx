import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';

interface ProjectFormData {
  title: string;
  description?: string;
}

export default async function ProjectEditPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params; 
  const projectId = Number(id);
  if (isNaN(projectId)) notFound();

  const user = await getCurrentUser();
  if (!user) redirect('/login');

  // Fetch project data
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      userId: user.id,
    },
    select: {
      id: true,
      title: true,
      description: true,
    },
  });

  if (!project) notFound();

  async function updateProject(formData: FormData) {
    'use server';
    
    try {
      const title = formData.get('title')?.toString().trim();
      const description = formData.get('description')?.toString().trim();

      // Basic validation
      if (!title || title.length < 3) {
        throw new Error('Title must be at least 3 characters');
      }

      await prisma.project.update({
        where: { id: projectId },
        data: {
          title,
          description: description || null,
        },
      });

      redirect(`/project/${projectId}`);
    } catch (error) {
      console.error('Failed to update project:', error);
      redirect(`/project/${projectId}`);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Edit Project</h1>
      
      {/* Project edit form */}
      <form action={updateProject} className="max-w-lg space-y-6">
        <div className="space-y-2">
          <label htmlFor="title" className="block font-medium">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            defaultValue={project.title}
            required
            minLength={3}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="block font-medium">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            defaultValue={project.description || ''}
            rows={5}
            maxLength={500}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
          >
            Save Changes
          </button>
          <Link
            href={`/project/${projectId}`}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg transition-colors duration-200"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
