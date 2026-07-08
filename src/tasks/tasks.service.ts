import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService }  from '../prisma/prisma.service';
import { CreateTaskDto }  from './dto/create-task.dto';
import { UpdateTaskDto }  from './dto/update-task.dto';
import { MoveTaskDto }    from './dto/move-task.dto';

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

  async move(userId: string, taskId: string, dto: MoveTaskDto) {
    const task = await this.findTaskWithBoard(taskId);
    this.assertOwnership(task.column.board.ownerId, userId);

    const sourceColumnId = task.columnId;
    const sourcePosition = task.position;
    const destColumnId = dto.columnId ?? sourceColumnId;

    // if moving to a different column, verify it belongs to the same board
    if(destColumnId !== sourceColumnId) {
      const destColumn = await this.prisma.column.findUnique({
        where: {id: destColumnId},
      });

      if(!destColumn) {
        throw new NotFoundException('Destination column not found');
      }

      if(destColumn.boardId !== task.column.boardId) {
        throw new ForbiddenException('Cannot move task to a column in a different board');
      }
    }

    // clamp target position to a valid range
    const destCount = await this.prisma.task.count({
      where: {columnId: destColumnId, deletedAt: null, NOT: {id: taskId}},
    });
    const destPosition = Math.max(0, Math.min(dto.position, destCount));

    if(sourceColumnId === destColumnId && destPosition === sourcePosition) {
      return task;
    }

    await this.prisma.$transaction(async (tx) => {
      if(sourceColumnId === destColumnId) {
        if(destPosition < sourcePosition) {
          await tx.task.updateMany({
            where: {
              columnId: sourceColumnId,
              deletedAt: null,
              position: {gte: destPosition, lt: sourcePosition},
            },
            data: {position: {increment: 1}},
          });
        } else {
          await tx.task.updateMany({
            where: {
              columnId: sourceColumnId,
              deletedAt: null,
              position: {gt: sourcePosition, lte: destPosition},
            },
            data: {position: {decrement: 1}},
          });
        }

        await tx.task.update({
          where: {id: taskId},
          data: {position: destPosition},
        });
      } else {
        await tx.task.updateMany({
          where: {
            columnId: sourceColumnId,
            deletedAt: null,
            position: {gt: sourcePosition},
          },
          data: {
            position: {decrement: 1},
          }
        });

        await tx.task.updateMany({
          where: {id: taskId},
          data: {
            columnId: destColumnId,
            position: destPosition,
          }
        })
      }
    })

    return this.prisma.task.findUnique({
      where: {id: taskId},
      include: {labels: true},
    });
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