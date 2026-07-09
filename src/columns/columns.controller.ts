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
import { ColumnsService } from './columns.service';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Columns')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller()
export class ColumnsController {
  constructor(private columnsService: ColumnsService) {}

  @Post('boards/:boardId/columns')
  create(
    @CurrentUser() user: { userId: string },
    @Param('boardId') boardId: string,
    @Body() dto: CreateColumnDto,
  ) {
    return this.columnsService.create(user.userId, boardId, dto);
  }

  @Patch('columns/:id')
  update(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body() dto: UpdateColumnDto,
  ) {
    return this.columnsService.update(user.userId, dto, id);
  }

  @Delete('columns/:id')
  remove(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ) {
    return this.columnsService.remove(user.userId, id);
  }
}