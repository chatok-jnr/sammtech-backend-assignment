import { Injectable, ForbiddenException, NotFoundException} from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateBoardDto } from "./dto/create-board.dto";

@Injectable()
export class BoardService{
    constructor(
        private prisma: PrismaService
    ) {}

    async create(userId: string, dto: CreateBoardDto) {
        const board = await this.prisma.board.create({
            data:{
                title: dto.title,
                ownerId: userId
            }
        });

        return board;
    }

    async findAllForUser(userId: string) {
        const boards = await this.prisma.board.findMany({
            where: {
                ownerId: userId
            },
            orderBy:{
                createdAt: 'desc'
            }
        });

        return boards;
    }

    async findOneForUser(userId: string, boardId: string) {
        const board = await this.prisma.board.findUnique({
            where: { id: boardId },
            include: {
                columns: {
                    orderBy: { order: 'asc' },
                    include: {
                        tasks: {
                            orderBy: { position: 'asc' },
                            include: { labels: true },
                        },
                    },
                },
            },
        });

        if(!board) {
            throw new NotFoundException('Board not found');
        }

        if(board.ownerId !== userId) {
            throw new ForbiddenException('You do not have access to this board');
        }

        return board;
    }


    
    async remove(userId: string, boardId: string) {
        const board = await this.prisma.board.findUnique({
          where:{
            id: boardId
          }  
        });

        if(!board) {
            throw new NotFoundException('Board not found');
        }

        if(board.ownerId !== userId) {
            throw new ForbiddenException('You do not have access to this board');
        }

        await this.prisma.board.delete({
            where: {
                id: boardId
            }
        });
        
        return {message: 'Board deleted successfully'};
    }

}