import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';

@Injectable()
export class PasswordService {
  hashPass(password: string) {
    return argon2.hash(password);
  }

  verify(pass: string, hash: string) {
    return argon2.verify(hash, pass);
  }
}
