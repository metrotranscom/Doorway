import { PaginationMeta } from '../shared/pagination.dto';
import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ApplicationFlaggedSetPaginationMeta extends PaginationMeta {
  @Expose()
  @ApiProperty()
  totalFlagged: number;
}
