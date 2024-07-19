# 使用Node.js 16
FROM node:16

# 设置工作目录
WORKDIR /usr/src/app

# 切换国内apt源
RUN cat > /etc/apt/sources.list <<EOF
deb http://mirrors.aliyun.com/debian/ buster main non-free contrib
deb-src http://mirrors.aliyun.com/debian/ buster main non-free contrib
deb http://mirrors.aliyun.com/debian-security buster/updates main
deb-src http://mirrors.aliyun.com/debian-security buster/updates main
deb http://mirrors.aliyun.com/debian/ buster-updates main non-free contrib
deb-src http://mirrors.aliyun.com/debian/ buster-updates main non-free contrib
deb http://mirrors.aliyun.com/debian/ buster-backports main non-free contrib
deb-src http://mirrors.aliyun.com/debian/ buster-backports main non-free contrib
EOF

# 安装ffmpeg
RUN apt update && apt install -y ffmpeg

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

# 编译ts
RUN npm run build

# 启动pm2
CMD ["pm2", "start", "--no-daemon"]
