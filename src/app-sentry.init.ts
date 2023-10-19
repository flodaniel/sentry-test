import { INestApplication } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';
import { ErrorEvent } from '@sentry/types';

/**
 * Removes the authorization header for security reasons
 *
 * @param event
 * @returns
 */
function removeAuthorizationHeader(event: ErrorEvent): ErrorEvent {
  const request = event.request;

  if (request?.headers?.['authorization']) {
    delete request.headers['authorization'];
  }

  return event;
}

/**
 * Inits sentry with tracing enabled
 *
 * @param app
 * @returns
 */
export function initAppSentry(app: INestApplication): INestApplication {
  const maxValueLength = 5000;
  const environment = `localhost`;
  const defaultTraceSampleRate = 1;
  const lowTraceSampleRate = 1;
  const profilesSampleRate = 1;
  const dsn = 'ADD YOUR DSN';

  const isDebug = true;

  Sentry.init({
    dsn: dsn,
    environment: environment,
    debug: isDebug,
    maxValueLength: maxValueLength,
    tracesSampler: (context) => {
      if (context.request?.url?.endsWith('/status')) {
        return lowTraceSampleRate;
      }

      return defaultTraceSampleRate;
    },
    profilesSampleRate: profilesSampleRate,
    integrations: [
      // enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Express({
        app: app.getHttpServer(),
      }),
      new ProfilingIntegration(),
      new Sentry.Integrations.Mongo({
        useMongoose: true,
      }),
    ],

    beforeSend(event: ErrorEvent) {
      event = removeAuthorizationHeader(event);

      return event;
    },
  });

  // RequestHandler creates a separate execution context, so that all
  // transactions/spans/breadcrumbs are isolated across requests
  app.use(Sentry.Handlers.requestHandler());
  // TracingHandler creates a trace for every incoming request
  app.use(Sentry.Handlers.tracingHandler());

  return app;
}
