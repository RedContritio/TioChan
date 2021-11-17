FROM node:alpine
ENTRYPOINT []

WORKDIR /root/tiochan/

# 无敌，腾讯云 https://mirrors.cloud.tencent.com/
ENV N_NODE_MIRROR=https://mirrors.cloud.tencent.com/nodejs-release/

# 换源
RUN sed -i s@/dl-cdn.alpinelinux.org/@/mirrors.cloud.tencent.com/@g /etc/apk/repositories && \
    npm config set registry http://mirrors.cloud.tencent.com/npm/

# 设置时区
RUN apk add tzdata && \
    cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
    echo "Asia/Shanghai" > /etc/timezone
    
RUN npm install -g typescript && \
    npm install -g ts-node

COPY . .

RUN npm install

CMD ["npm", "start"]
# CMD ["bash"]