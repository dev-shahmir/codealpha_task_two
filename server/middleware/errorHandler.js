import { config } from '../config/index.js';

export function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const status = err.status || 500;
  const code = err.code || 'INTERNAL_ERROR';
  const message = status === 500 && config.env === 'production'
    ? 'Something went wrong on our end. Please try again.'
    : err.message || 'Something went wrong';

  if (status === 500) {
    console.error('[VYBEBOARD] Unhandled error:', err);
  }

  res.status(status).json({
    success: false,
    message,
    code,
    ...(config.env !== 'production' && status === 500 ? { stack: err.stack } : {}),
  });
}
