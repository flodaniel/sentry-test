/* eslint-disable @typescript-eslint/ban-types */
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  async getHello(): Promise<string> {
    const user = { username: 'a' };
    await this.loadCode(user.username);
    return 'Hello World!';
  }

  private async loadCode(username: string): Promise<string> {
    await this.delay(5000);

    return 'hello' + username;
  }

  private delay(wait: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, wait);
    });
  }
}
