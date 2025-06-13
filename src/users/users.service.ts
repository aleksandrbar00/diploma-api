import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDTO } from './dto/create-user.dto';
import { PasswordService } from './password.service';
import { UserInfoDto } from './dto/user-info.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    private readonly passwordService: PasswordService,
  ) {}

  getByEmail(email: string) {
    return this.usersRepository.findOne({
      where: {
        email,
      },
    });
  }

  async create(createUserDto: CreateUserDTO) {
    const dbUser = new User();

    if (createUserDto.age) {
      dbUser.age = createUserDto.age;
    }
    dbUser.email = createUserDto.email;
    dbUser.name = createUserDto.name;
    dbUser.passwordHash = await this.passwordService.hashPass(
      createUserDto.password,
    );

    return this.usersRepository.save(dbUser);
  }

  getIdUser(id: number) {
    return this.usersRepository.findOne({
      where: {
        id,
      },
    });
  }

  async getUserInfo(id: number): Promise<UserInfoDto | null> {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: ['id', 'name', 'email', 'age'],
    });

    if (!user) {
      return null;
    }

    return user;
  }

  async updateRefreshToken(userId: number, refreshToken: string) {
    await this.usersRepository.update(userId, {
      refreshToken,
    });
  }

  async clearRefreshToken(userId: number) {
    await this.usersRepository.update(userId, {
      refreshToken: '',
    });
  }

  findByRefreshToken(refreshToken: string) {
    return this.usersRepository.findOne({
      where: {
        refreshToken,
      },
    });
  }
}
