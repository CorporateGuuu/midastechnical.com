import { withSentry } from '@sentry/nextjs';

export default withSentry(async (req, res) => {
  // Add request context to Sentry
  Sentry.setContext('request', {
    url: req.url,
    method: req.method,
    headers: {
      'user-agent': req.headers['user-agent'],
      'x-forwarded-for': req.headers['x-forwarded-for'],
    },
  });

  // Continue with the request
  return res.status(200).json({ status: 'ok' });
});
