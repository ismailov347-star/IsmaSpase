import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/lessons/[id]/materials/[materialId] - получить материал по ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; materialId: string } }
) {
  try {
    const materialId = parseInt(params.materialId);
    
    if (isNaN(materialId)) {
      return NextResponse.json(
        { error: 'Invalid material ID' },
        { status: 400 }
      );
    }

    const material = await prisma.material.findUnique({
      where: { id: materialId },
      include: { lesson: true }
    });

    if (!material) {
      return NextResponse.json(
        { error: 'Material not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(material);
  } catch (error) {
    console.error('Error fetching material:', error);
    return NextResponse.json(
      { error: 'Failed to fetch material' },
      { status: 500 }
    );
  }
}

// PUT /api/lessons/[id]/materials/[materialId] - обновить материал
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; materialId: string } }
) {
  try {
    const materialId = parseInt(params.materialId);
    
    if (isNaN(materialId)) {
      return NextResponse.json(
        { error: 'Invalid material ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title, description, url, type, content, order } = body;

    if (!title || !type) {
      return NextResponse.json(
        { error: 'Title and type are required' },
        { status: 400 }
      );
    }

    // Валидация типа материала
    const validTypes = ['link', 'text', 'video', 'document'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid material type. Must be: link, text, video, or document' },
        { status: 400 }
      );
    }

    const material = await prisma.material.update({
      where: { id: materialId },
      data: {
        title,
        description: description || null,
        url: url || null,
        type,
        content: content || null,
        order: order || 0
      }
    });

    return NextResponse.json(material);
  } catch (error) {
    console.error('Error updating material:', error);
    return NextResponse.json(
      { error: 'Failed to update material' },
      { status: 500 }
    );
  }
}

// DELETE /api/lessons/[id]/materials/[materialId] - удалить материал
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; materialId: string } }
) {
  try {
    const materialId = parseInt(params.materialId);
    
    if (isNaN(materialId)) {
      return NextResponse.json(
        { error: 'Invalid material ID' },
        { status: 400 }
      );
    }

    await prisma.material.delete({
      where: { id: materialId }
    });

    return NextResponse.json(
      { message: 'Material deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting material:', error);
    return NextResponse.json(
      { error: 'Failed to delete material' },
      { status: 500 }
    );
  }
}