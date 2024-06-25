import winston from 'winston'
import "winston-daily-rotate-file";

// 创建logger实例
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.simple()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ all: true })
      )
    }),
    new winston.transports.DailyRotateFile({
      level: 'info',
      dirname: 'logs',
      filename: 'info-%DATE%.log',
      datePattern: 'YYYY-MM-DD'
    }),
  ]
})

export default logger