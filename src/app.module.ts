import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';

import { AuthModule} from "./auth/auth.module";
import { UserModule } from './users/user.module';
import { BoardModule } from './boards/board.module';
import { ColumnsModule } from './columns/column.module';
import { TasksModule } from './tasks/tasks.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UserModule,
    BoardModule,
    ColumnsModule,
    TasksModule,
  ],
})
export class AppModule {}