import {
    init,
    logger,
    configureScope,
    getCurrentHub,
    captureMessage,
    captureException,
} from '@byted/sentry-mp';

export const initSentry = () => {
    logger.enable();

    init({
        dsn: 'https://key@sentry.io/id',
    });

    update();
};

export const update = () => {
    configureScope(scope => {
        scope.setUser({ id: '32767', email: 'test@sentry.mp' });
        scope.setTag('mp_path', 'index');
        scope.setExtra('key', 'value');
    });
};
