import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, columnId: string, dto: CreateTaskDto) {
    const column = await this.verifyColumnOwnership(userId, columnId);

    const lastTask = await this.prisma.task.findFirst({
      where: { columnId, deletedAt: null },
      orderBy: { position: 'desc' },
    });
    const position = lastTask ? lastTask.position + 1 : 0;

    return this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        priority: dto.priority,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        assigneeId: dto.assigneeId,
        columnId: column.id,
        position,
        labels: dto.labels
          ? { create: dto.labels.map((l) => ({ name: l.name, color: l.color })) }
          : undefined,
      },
      include: { labels: true },
    });
  }

  async update(userId: string, taskId: string, dto: UpdateTaskDto) {
    const task = await this.findTaskWithBoard(taskId);
    this.assertOwnership(task.column.board.ownerId, userId);

    // if labels are provided, replace the full set (simplest correct behavior)
    if (dto.labels) {
      await this.prisma.taskLabel.deleteMany({ where: { taskId } });
    }

    return this.prisma.task.update({
      where: { id: taskId },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.priority !== undefined && { priority: dto.priority }),
        ...(dto.dueDate !== undefined && { dueDate: new Date(dto.dueDate) }),
        ...(dto.assigneeId !== undefined && { assigneeId: dto.assigneeId }),
        ...(dto.labels && {
          labels: { create: dto.labels.map((l) => ({ name: l.name, color: l.color })) },
        }),
      },
      include: { labels: true },
    });
  }

  async remove(userId: string, taskId: string) {
    const task = await this.findTaskWithBoard(taskId);
    this.assertOwnership(task.column.board.ownerId, userId);

    // soft delete — see README for reasoning (full impl lands in its own commit)
    await this.prisma.task.update({
      where: { id: taskId },
      data: { deletedAt: new Date() },
    });

    return { message: 'Task deleted successfully' };
  }


  
    /*==============================
            HELPER FUNCTIONS
    ==============================*/

  private async findTaskWithBoard(taskId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { column: { include: { board: true } } },
    });

    if (!task || task.deletedAt) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  private async verifyColumnOwnership(userId: string, columnId: string) {
    const column = await this.prisma.column.findUnique({
      where: { id: columnId },
      include: { board: true },
    });

    if (!column) {
      throw new NotFoundException('Column not found');
    }

    this.assertOwnership(column.board.ownerId, userId);
    return column;
  }

  private assertOwnership(ownerId: string, userId: string) {
    if (ownerId !== userId) {
      throw new ForbiddenException('You do not have access to this resource');
    }
  }
}