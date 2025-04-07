// app/api/tasks/[taskId]/updateorder/route.ts
import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/getCurrentUser';
export async function POST(
  request: Request,
  { params }: { params: { taskId: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const taskId = Number(params.taskId);
    const { orderNumber } = await request.json();

    // Validate inputs
    if (isNaN(taskId) || isNaN(orderNumber)) {
      return NextResponse.json(
        { message: 'Invalid task ID or order number' },
        { status: 400 }
      );
    }

    // Verify task exists and belongs to user
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true }
    });

    if (!task || task.project.userId !== Number(user.id)) {
      return NextResponse.json(
        { message: 'Task not found or access denied' },
        { status: 404 }
      );
    }

    // Update task order
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { orderNumber },
    });

    return NextResponse.json({
      message: 'Order updated successfully',
      task: updatedTask
    });

  } catch (error) {
    console.error('Error updating task order:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}