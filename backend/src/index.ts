import app from './app';
import { config } from './config/env';
import { connectDB } from './database/connection';

const startServer = async () => {
  try {
    await connectDB();
    const port = Number(config.port) || 5005;
    app.listen(port, '0.0.0.0', () => {
      console.log(`🚀 Server running in ${config.nodeEnv} mode on port ${port} (0.0.0.0)`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
