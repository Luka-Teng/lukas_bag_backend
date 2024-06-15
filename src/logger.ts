import winston from 'winston'
import "winston-daily-rotate-file";

// 创建logger实例
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }), // 格式化错误堆栈
    winston.format.colorize({ all: true }), // 启用所有日志级别的颜色
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    }),
    /* 错误的日志记录在文件中 */
    new winston.transports.DailyRotateFile({
      format: winston.format.prettyPrint(),
      level: "error",
      dirname: "logs",
      filename: "index-%DATE%.log",
      datePattern: "YYYY-MM-DD-HH"
    }),
  ]
})

export default logger