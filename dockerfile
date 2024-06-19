# 使用官方Node.js的Docker镜像作为基础镜像
FROM node:16

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
EXPOSE 3001

# 定义环境变量
ENV NODE_ENV production

# 编译ts
RUN npm run build

# 启动pm2
CMD ["pm2", "start", "--no-daemon"]
