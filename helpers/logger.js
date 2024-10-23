import { createLogger, format, transports } from 'winston';
import path from 'path';

const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp(),
        format.printf(({ timestamp, level, message }) => {
            return `${timestamp} [${level}]: ${message}`;
        })
    ),
    transports: [
        new transports.File({ filename: path.join(process.cwd(), 'logs/app.log') })
    ],
});

export default logger;
