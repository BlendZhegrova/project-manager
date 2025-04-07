// src/app/api/tasks/route.ts
import { prisma } from '@/lib/db'
import { ApiResponse } from '@/lib/api-responses'
import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/getCurrentUser'
const validStatuses = ['todo', 'in-progress', 'done']

export async function GET(req: NextRequest, { params }: { params: { taskId: string } }) {
  const user = await getCurrentUser();
  if (!user) return ApiResponse.unauthorized();

  try {
    const taskId = parseInt(params.taskId);
    if (isNaN(taskId)) return ApiResponse.badRequest('Invalid task ID');

    const task = await prisma.task.findFirst({
      where: { 
        id: taskId,
        project: { userId: parseInt(user.id, 10) }
      },
      include: {
        project: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    if (!task) return ApiResponse.notFound('Task');

    return ApiResponse.success(task);
  } catch (error) {
    return ApiResponse.serverError(error);
  }
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return ApiResponse.unauthorized();

  try {
    const { title, projectId, status, description, dueDate , orderNumber} = await req.json();

    const projectIdNum = parseInt(projectId, 10);
    if (isNaN(projectIdNum)) {
      return ApiResponse.badRequest('Invalid project ID');
    }
    if (!title || !projectIdNum) {
      return ApiResponse.badRequest('Title and projectId are required');
    }

    if (status && !validStatuses.includes(status)) {
      return ApiResponse.invalidStatus(validStatuses);
    }

    const project = await prisma.project.findFirst({
      where: { id: projectIdNum, userId: parseInt(user.id, 10) }
    });
    if (!project) return ApiResponse.notFound('Project');

    // Get the current max orderNumber
    const maxOrder = await prisma.task.aggregate({
      where: { projectId: projectIdNum },
      _max: { orderNumber: true }
    });

    const nextOrder = (maxOrder._max.orderNumber ?? 0) + 1;

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status || 'todo',
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId: projectIdNum,
        orderNumber: nextOrder
      }
    });

    return ApiResponse.created(task);
  } catch (error) {
    return ApiResponse.serverError(error);
  }
}

export async function DELETE(req: Request) {
  const user = await getCurrentUser()
  if (!user) return ApiResponse.unauthorized()

  try {
    const { id } = await req.json()
    if (!id) return ApiResponse.badRequest('Task ID is required')

    const task = await prisma.task.findFirst({
      where: { id, project: { userId: parseInt(user.id, 10) } }
    })
    if (!task) return ApiResponse.notFound('Task')

    await prisma.task.delete({ where: { id } })

    return ApiResponse.success({ message: 'Task deleted successfully' })
  } catch (error) {
    return ApiResponse.serverError(error)
  }
}