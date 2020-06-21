import './LoadEnv'; // Must be the first import
import app from '@server';
import logger from '@shared/Logger';
import EventLogger from '@shared/EventLogger';

// Start the server
const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  logger.info('Express server started on port: ' + port);

  const eventLogger = new EventLogger();
  eventLogger.run();
});
