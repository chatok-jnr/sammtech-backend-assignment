import { Injectable, ForbiddenException, NotFoundException} from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateBoardDto } from "./dto/create-board.dto";
import { ResourceNotFoundException } from "src/common/exceptions/resource-not-found.exception";
import { NotResourceOwnerException } from "src/common/exceptions/ownership.exception";
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
                ownerId: userId,
                deletedAt: null
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
                            where: {deletedAt: null},
                            orderBy: { position: 'asc' },
                            include: { labels: true },
                        },
                    },
                },
            },
        });

        if(!board || board.deletedAt) {
            throw new ResourceNotFoundException('Board', boardId);
        }

        if(board.ownerId !== userId) {
            throw new NotResourceOwnerException('board');
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
            throw new ResourceNotFoundException('Board', boardId);
        }

        if(board.ownerId !== userId) {
            throw new ResourceNotFoundException('Board');
        }

        await this.prisma.board.update({
            where: {
                id: boardId
            },
            data: {
                deletedAt: new Date()
            }
        });
        
        return {message: 'Board deleted successfully'};
    }

}