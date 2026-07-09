import { NotFoundException } from '@nestjs/common';

export class ResourceNotFoundException extends NotFoundException {
    constructor(resource: string, id?: string) {
        super(id ? `${resource} with id "${id}" not found` : `${resource} not found`);
    }
}