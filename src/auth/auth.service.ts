import {ConflictException, Injectable} from "@nestjs/common";
import * as bcrypt from "bcrypt";
import {PrismaService} from "../prisma/prisma.service";
import {RegisterDto} from "./dto/register.dto";


@Injectable()
export class AuthService{
    constructor(private prisma: PrismaService){}

    async register(dto: RegisterDto){
        const existingUser = await this.prisma.user.findUnique({
            where: {email: dto.email},
        });

        if(existingUser) {
            throw new ConflictException('Email already exists');
        }

        const hashedPassword = await bcrypt.hash(dto.password, 10);

        const user = await this.prisma.user.create({
            data:{
                name: dto.name,
                email: dto.email,
                password: hashedPassword,
            }
        });

        const {password, ...result} = user;
        return result;
    }


}