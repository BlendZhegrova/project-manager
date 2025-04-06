// app/dashboard/page.tsx
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Project } from '@prisma/client';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  const projects = await prisma.project.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' as const }, // Fix for sorting
    include: {
      _count: {
        select: { tasks: true },
      },
    },
  });

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
            <p className="mt-2 text-gray-600">
              {projects.length} project{projects.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Link
            href="/project/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            New Project
          </Link>
        </div>

        {projects.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard 
                key={project.id} 
                project={project} 
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-12 border-2 border-gray-300 border-dashed rounded-lg">
      <svg
        className="mx-auto h-12 w-12 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
        />
      </svg>
      <h3 className="mt-2 text-lg font-medium text-gray-900">No projects</h3>
      <p className="mt-1 text-sm text-gray-500">
        Get started by creating a new project.
      </p>
      <div className="mt-6">
        <Link
          href="/project/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          New Project
        </Link>
      </div>
    </div>
  );
}

type ProjectWithTaskCount = Project & {
  _count: {
    tasks: number;
  };
};

function ProjectCard({ project }: { project: ProjectWithTaskCount }) {
  return (
    <Link
      href={`/project/${project.id}`}
      className="group bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all duration-200"
    >
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 line-clamp-2">
          {project.title}
        </h3>
      </div>
      <p className="mt-2 text-sm text-gray-500 line-clamp-3">
        {project.description || 'No description'}
      </p>
      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-gray-500">
          {project._count.tasks} task{project._count.tasks !== 1 ? 's' : ''}
        </span>
        <span className="text-gray-400">
          Updated {new Date(project.createdAt).toLocaleDateString()}
        </span>
      </div>
    </Link>
  );
}