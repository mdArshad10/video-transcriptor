import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class CloudfrontService {
    private readonly logger = new Logger(CloudfrontService.name)
    constructor(){}
    
}
