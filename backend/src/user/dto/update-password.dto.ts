import { IsString, MinLength, MaxLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePasswordDto {
  @ApiProperty({
    example: 'CurrentP@ssw0rd',
    description: "User's current password",
    required: true,
    minLength: 6,
    maxLength: 128,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(128)
  currentPassword: string;

  @ApiProperty({
    example: 'NewStr0ngP@ssw0rd',
    description: 'New password (min 6, max 128 characters)',
    required: true,
    minLength: 6,
    maxLength: 128,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(128)
  newPassword: string;
}
