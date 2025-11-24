import { Injectable } from '@nestjs/common';

import * as bcrypt from 'bcrypt';

@Injectable()
export class HashService {
  async compare(password: string, hash: string) {
    return bcrypt.compare(password, hash);
  }

  async hash(password: string) {
    return bcrypt.hash(password, 10);
  }
}
