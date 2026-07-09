import { Body,
        Controller,
        Delete,
        Get,
        Param,
        Post,
        UseGuards, 
    } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CreateBoardDto } from "./dto/create-board.dto";
import { BoardService } from "./board.service";
import {CurrentUser} from "../common/decorators/current-user.decorator";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
@ApiTags('Boards')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard) // Authentication guard to protect all routes in this controller
@Controller('boards')
export class BoardController{
    constructor(
        private boardService: BoardService
    ) {}

    // Create Board
    @Post()
    create(
        @CurrentUser() user: {userId: string}, 
        @Body() dto: CreateBoardDto
    ) {
        return this.boardService.create(user.userId, dto);
    }

    // Get all board for a user
    @Get()
    finAll(
        @CurrentUser() user: {userId: string}
    ) {
        return this.boardService.findAllForUser(user.userId);
    }

    // Get a single board for a user
    @Get(':id')
    findOne(
        @CurrentUser() user: {userId: string},
        @Param('id') boardId: string
    ) {
        return this.boardService.findOneForUser(user.userId, boardId);
    }
    
    // Delete a board for a user
    @Delete(':id')
    async deleteBoard(
        @CurrentUser() user: {userId: string},
        @Param('id') boardId: string
    ) {
        return this.boardService.remove(user.userId, boardId);
    }
}