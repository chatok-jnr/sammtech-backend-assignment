import {ForbiddenException } from '@nestjs/common';

export class NotResourceOwnerException extends ForbiddenException {
    constructor(resource: string, id?: string) {
        super(`You do not have permission to access this ${resource}${id ? ` with id "${id}"` : ''}`);
    }
}