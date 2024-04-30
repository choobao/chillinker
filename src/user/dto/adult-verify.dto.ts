import { PartialType, PickType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class AdultVerifyDto extends PartialType(
  PickType(CreateUserDto, ['birthDate']),
) {}
