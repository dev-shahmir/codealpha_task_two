import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';

import { config } from './config/index.js';
import { connectDB } from './config/db.js';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { initSocket } from './sockets/index.js';

await connectDB();

const app = express();

app.use(helmet());
app.use(cors({ origin: config.clientUrl, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());
app.use(mongoSanitize());
if (config.env !== 'test') app.use(morgan(config.env === 'production' ? 'combined' : 'dev'));
app.use('/api', apiLimiter);

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'VYBEBOARD API is running', env: config.env });
});

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

const httpServer = http.createServer(app);
initSocket(httpServer);

httpServer.listen(config.port, () => {
  console.log(`[VYBEBOARD] API + Socket.IO listening on port ${config.port} (${config.env})`);
});
