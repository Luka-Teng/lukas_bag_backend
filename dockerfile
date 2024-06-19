# 使用官方Node.js的Docker镜像作为基础镜像
FROM node:18

# 设置工作目录
WORKDIR /usr/src/app

# 安装pm2
RUN npm install pm2 -g

# 安装项目依赖
RUN npm install

# 复制项目文件到工作目录
COPY . .

# 暴露端口
EXPOSE 3000

# 定义环境变量
ENV NODE_ENV production

# 编译ts
RUN tsc

# 启动pm2
CMD ["pm2", "start"]
