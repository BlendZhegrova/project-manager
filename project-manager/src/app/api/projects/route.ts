// src/app/api/projects/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Project } from '@prisma/client';
import { getCurrentUser } from '@/lib/getCurrentUser';

// Validation schema
const projectSchema = {
  title: {
    minLength: 3,
    maxLength: 100,
    validate: (value: string) => value.length >= 3 && value.length <= 100,
    message: 'Title must be between 3 and 100 characters'
  },
  description: {
    maxLength: 500,
    validate: (value: string) => !value || value.length <= 500,
    message: 'Description must be 500 characters or less'
  }
};

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    const projects = await prisma.project.findMany({
      where: { userId: Number(user.id) },
      include: { 
        _count: { select: { tasks: true } },
        tasks: {
          take: 3,
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error('[PROJECTS_GET]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    const body = await req.json();
    const { title, description } = body;

    // Validate input
    if (!projectSchema.title.validate(title)) {
      return NextResponse.json(
        { error: projectSchema.title.message },
        { status: 400 }
      );
    }

    if (description && !projectSchema.description.validate(description)) {
      return NextResponse.json(
        { error: projectSchema.description.message },
        { status: 400 }
      );
    }

    const project = await prisma.project.create({
      data: {
        title,
        description: description || null,
        userId: Number(user.id)
      }
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('[PROJECTS_POST]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    const body = await req.json();
    const { id, title, description } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Verify project exists and belongs to user
    const existingProject = await prisma.project.findFirst({
      where: { id: Number(id), userId: Number(user.id) }
    });

    if (!existingProject) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Validate updates
    if (title && !projectSchema.title.validate(title)) {
      return NextResponse.json(
        { error: projectSchema.title.message },
        { status: 400 }
      );
    }

    if (description && !projectSchema.description.validate(description)) {
      return NextResponse.json(
        { error: projectSchema.description.message },
        { status: 400 }
      );
    }

    const updatedProject = await prisma.project.update({
      where: { id: Number(id) },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description })
      }
    });

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error('[PROJECTS_PUT]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise <{ id: string }> } 
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const projectIdawaited = await params;
    const projectId = parseInt(projectIdawaited.id); 
    if (isNaN(projectId)) {
      return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 });
    }

    // Verify project exists and belongs to user
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: Number(user.id) }
    });
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Delete in transaction
    await prisma.$transaction([
      prisma.task.deleteMany({ where: { projectId } }),
      prisma.project.delete({ where: { id: projectId } })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE PROJECT]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}