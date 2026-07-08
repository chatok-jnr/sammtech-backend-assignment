import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

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
}