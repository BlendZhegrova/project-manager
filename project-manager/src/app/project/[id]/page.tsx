// app/project/[id]/page.tsx
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { DeleteProjectButton } from '@/app/components/DeleteProjectButton';
import { TaskListClient } from '@/app/components/TaskListClient';

export default async function ProjectViewPage({
  params,
}: {
  params: { id: string };
}) {
  // First authenticate the user
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  // Then validate the params
  const { id } = await params;
  if (!id) notFound();
  
  const projectId = parseInt(id);
  if (isNaN(projectId)) notFound();

  // Fetch project and tasks in parallel
  const [project, tasks] = await Promise.all([
    prisma.project.findUnique({
      where: { 
        id: projectId,
        userId: user.id
      },
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
        _count: {
          select: { tasks: true }
        }
      }
    }),
    prisma.task.findMany({
      where: { projectId },
      orderBy: { orderNumber: 'asc' },
    })
  ]);

  if (!project) notFound();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
          <p className="text-gray-600 mb-2">{project.description}</p>
          <div className="text-sm text-gray-500">
            <span>Created: {new Date(project.createdAt).toLocaleDateString()}</span>
            {project._count.tasks > 0 && (
              <span className="ml-4">{project._count.tasks} task{project._count.tasks !== 1 ? 's' : ''}</span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/project/${project.id}/edit`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
            prefetch={false}
          >
            Edit
          </Link>
          <DeleteProjectButton projectId={project.id} />
          <Link
            href="/dashboard"
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded transition-colors"
            prefetch={false}
          >
            Back
          </Link>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Tasks</h2>
          <Link
            href={`/project/${project.id}/tasks/new`}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 text-sm rounded"
            prefetch={false}
          >
            + New Task
          </Link>
        </div>

        {tasks.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
            <p className="text-gray-500 mb-4">No tasks yet</p>
            <Link
              href={`/project/${project.id}/tasks/new`}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              prefetch={false}
            >
              Create your first task
            </Link>
          </div>
        ) : (
          <TaskListClient tasks={tasks} projectId={project.id} />
        )}
      </div>
    </div>
  );
}