import winston from 'winston'

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
    })
  ]
})

export default logger