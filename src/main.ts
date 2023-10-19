import { NestFactory } from '@nestjs/core';
import { initAppSentry } from './app-sentry.init';
import { AppModule } from './app.module';

async function bootstrap() {
  let app = await NestFactory.create(AppModule);
  app = initAppSentry(app);
  await app.listen(3000);
}
bootstrap();
