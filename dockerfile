# 使用Node.js
FROM node:18

# 设置工作目录
WORKDIR /usr/src/app

# 设置npm源为淘宝的npm镜像
RUN npm config set registry https://registry.npmmirror.com/

COPY package.json ./

# 安装pm2
RUN npm install pm2 -g & npm install

# 复制项目文件到工作目录
COPY . .

# 暴露端口
EXPOSE 3000

# 定义环境变量
ENV NODE_ENV production
ENV DATABASE_URL postgresql://postgres:Lukario123@172.17.0.1:5432/lukas_bag?schema=public

# 编译ts
RUN npx prisma migrate dev

# 启动pm2
CMD ["pm2", "start", "--no-daemon"]
