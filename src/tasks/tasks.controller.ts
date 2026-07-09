import {
  Body,
  Controller,
  Get,
  Delete,
  Param,
  Patch,
  Post,
  UseGuards,
  Query
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { MoveTaskDto } from './dto/move-task.dto';
import { FilterTaskDto } from './dto/filter-task.dto';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Tasks')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller()
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Post('columns/:columnId/tasks')
  create(
    @CurrentUser() user: { userId: string },
    @Param('columnId') columnId: string,
    @Body() dto: CreateTaskDto,
  ) {
    return this.tasksService.create(user.userId, columnId, dto);
  }

  @Patch('tasks/:id')
  update(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasksService.update(user.userId, id, dto);
  }

  @Delete('tasks/:id')
  remove(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ) {
    return this.tasksService.remove(user.userId, id);
  }

  @Patch('tasks/:id/position')
  move(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body() dto: MoveTaskDto
  ) {
    return this.tasksService.move(user.userId, id, dto);
  }

  @Get('boards/:boardId/tasks')
  findAllForBoard(
    @CurrentUser() user: {userId: string},
    @Param('boardId') boardId: string,
    @Query() filters: FilterTaskDto,
  ) {
    return this.tasksService.findAllForBoard(user.userId, boardId, filters);
  }
}