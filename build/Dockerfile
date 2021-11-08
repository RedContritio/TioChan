FROM buildpack-deps:buster 
ENTRYPOINT []

WORKDIR /root/tiochan/

RUN sed -i s@/deb.debian.org/@/mirrors.cloud.tencent.com/@g /etc/apt/sources.list && \
    sed -i s@/security.debian.org/@/mirrors.cloud.tencent.com/@g /etc/apt/sources.list && \
    apt-get update && \
    apt-get install -qq -y nodejs && \
    apt-get install -qq -y npm

# 无敌，腾讯云 https://mirrors.cloud.tencent.com/
ENV N_NODE_MIRROR=https://mirrors.cloud.tencent.com/nodejs-release/

RUN npm config set registry http://mirrors.cloud.tencent.com/npm/ && \
    npm install -g n && \
    n lts && \
    export PATH="$PATH"

RUN npm install -g typescript && \
    npm install -g ts-node

COPY . .

RUN npm install

CMD ["npm", "start"]
# CMD ["bash"]