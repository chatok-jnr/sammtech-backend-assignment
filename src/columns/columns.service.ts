import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateColumnDto } from './dto/update-column.dto';
import { CreateColumnDto } from './dto/create-column.dto';

@Injectable()
export class ColumnsService{
    constructor(
        private PrismaService: PrismaService
    ){}

    async create(userId: string, boardId: string, dto: CreateColumnDto){
        await this.verifyBoardOwnerShip(userId, boardId);

        let order = dto.order;
        if(order === undefined) {
            const lastColumn = await this.PrismaService.column.findFirst({
                where: {boardId},
                orderBy: {order: 'desc'}
            });
            
            order = lastColumn ? lastColumn.order + 1 : 0;
        }

        return this.PrismaService.column.create({
            data: {
                title: dto.title,
                order,
                boardId
            }
        });
    }

    async update(userId: string, dto: UpdateColumnDto, columnId: string){
        const column = await this.findColumnWithBoard(columnId);
        this.assertOwnerShip(userId, column.board.ownerId);

        return this.PrismaService.column.update({
            where: {
                id: columnId
            },
            data: {
                ...(dto.title !== undefined && {title: dto.title}),
                ...(dto.order !== undefined && {order: dto.order})
            }
        });
    }

    async remove(userId: string, columnId: string){
        const column = await this.findColumnWithBoard(columnId);
        this.assertOwnerShip(column.board.ownerId, userId);


        await this.PrismaService.column.delete({
            where: {
                id: columnId
            }
        });

        return {message: 'Column deleted successfully'};
    }
    

    /*=================================
            HELPER FUNCTIONS
    =================================*/

    private async findColumnWithBoard(columnId: string) {
        const column = await this.PrismaService.column.findUnique({
            where: {id: columnId},
            include: {board: true}
        }); 

        if(!column) {
            throw new NotFoundException('Column not found');
        }
        
        return column;
    }

    private async verifyBoardOwnerShip(userId: string, boardId: string) {
        const board = await this.PrismaService.board.findUnique({
            where: {id: boardId},
        });

        if(!board) {
            throw new NotFoundException('Board not found');
        }

        this.assertOwnerShip(userId, board.ownerId);

        return board;
    }

    private assertOwnerShip(userId: string, ownerId: string) {
        if(ownerId !== userId) {
            throw new ForbiddenException('You do not have permission to perform this action');
        }
    }

}