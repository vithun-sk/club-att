import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class UpdateMemberStatusDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['active', 'at-risk', 'inactive'])
  status: 'active' | 'at-risk' | 'inactive';
}
