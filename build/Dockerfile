FROM buildpack-deps:buster 
ENTRYPOINT []

WORKDIR /root/tiochan/

RUN sed -i s@/deb.debian.org/@/mirrors.tuna.tsinghua.edu.cn/@g /etc/apt/sources.list && \
    sed -i s@/security.debian.org/@/mirrors.tuna.tsinghua.edu.cn/@g /etc/apt/sources.list && \
    apt-get update && \
    apt-get install -qq -y nodejs && \
    apt-get install -qq -y npm

RUN npm config set registry https://registry.npm.taobao.org && \
    npm install -g n && \
    n lts

COPY . .

RUN npm install

CMD ["npm", "start"]