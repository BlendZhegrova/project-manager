// src/app/api/tasks/[taskId]/route.ts

import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { ApiResponse } from '@/lib/api-responses';
import { NextRequest } from 'next/server';

const validStatuses = ['todo', 'in-progress', 'done'];

export async function GET(req: NextRequest, { params }: { params: Promise<{ taskId: string }> }) {
  const user = await getCurrentUser();
  if (!user) return ApiResponse.unauthorized();

  try {
    const { taskId } = await params; // Await the params object
    const taskIdParsed = parseInt(taskId);
    
    if (isNaN(taskIdParsed)) return ApiResponse.badRequest('Invalid task ID');

    const task = await prisma.task.findFirst({
      where: {
        id: taskIdParsed,
        project: { userId: user.id }
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


export async function PUT(req: NextRequest, { params }: { params: { taskId: string } }) {
  const user = await getCurrentUser();
  if (!user) return ApiResponse.unauthorized();

  try {
    const taskId = parseInt(params?.taskId); 
    if (!taskId) return ApiResponse.badRequest('Task ID is required');

    const { id, ...updateData } = await req.json();

    // Ensure the task ID from the URL and the body match
    if (taskId !== id) return ApiResponse.badRequest('Task ID mismatch');

    if (updateData.status && !validStatuses.includes(updateData.status)) {
      return ApiResponse.invalidStatus(validStatuses);
    }

    const existingTask = await prisma.task.findFirst({
      where: { id: taskId, project: { userId: user.id } },
    });

    if (!existingTask) return ApiResponse.notFound('Task');

    // Ensure the date is properly formatted
    if (updateData.dueDate) {
      updateData.dueDate = new Date(updateData.dueDate);
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
    });

    return ApiResponse.success(updatedTask);
  } catch (error) {
    return ApiResponse.serverError(error);
  }
}

export async function DELETE(req: Request, { params }: { params: { taskId: string } }) {
  const user = await getCurrentUser();
  if (!user) return ApiResponse.unauthorized();

  try {
    const taskId = parseInt(params.taskId);
    if (isNaN(taskId)) {
      return ApiResponse.badRequest('Invalid task ID');
    }

    // Verify task exists and belongs to user
    const task = await prisma.task.findFirst({
      where: { 
        id: taskId,
        project: {
          userId: user.id
        }
      }
    });

    if (!task) {
      return ApiResponse.notFound('Task not found or unauthorized');
    }

    await prisma.task.delete({
      where: { id: taskId }
    });

    return ApiResponse.success({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('[TASK_DELETE_ERROR]', error);
    return ApiResponse.serverError(error);
  }
}