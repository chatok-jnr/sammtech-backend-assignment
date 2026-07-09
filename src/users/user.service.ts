import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

// Exceptions
import { ResourceNotFoundException } from 'src/common/exceptions/resource-not-found.exception';

@Injectable()
export class UserService{
    constructor(
        private prisma: PrismaService
    ){}

    async getProfile(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: {id: userId},
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true
            }
        });

        if(!user) throw new ResourceNotFoundException('User', userId);

        return user;
    }
}