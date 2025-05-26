# ----- Builder stage -----
FROM node:18 AS builder

WORKDIR /app

ENV TFJS_NODE_BINARY_HOST=https://cdn.npmmirror.com/binaries/tensorflow

RUN echo "deb https://mirrors.tuna.tsinghua.edu.cn/debian/ bullseye main" > /etc/apt/sources.list && \
    echo "deb https://mirrors.tuna.tsinghua.edu.cn/debian/ bullseye-updates main" >> /etc/apt/sources.list && \
    echo "deb https://mirrors.tuna.tsinghua.edu.cn/debian-security bullseye-security main" >> /etc/apt/sources.list && \
    npm config set registry https://registry.npmmirror.com

RUN apt-get update && \
    apt-get install -y python3 make g++ curl && \
    rm -rf /var/lib/apt/lists/*


COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# ----- Runner stage -----
FROM node:18 AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV NEXTAUTH_SECRET=a142fb2c9f2b6a8835998d7db5968c10


RUN apt-get update && apt-get install -y libglib2.0-0 libsm6 libxrender1 libxext6 && rm -rf /var/lib/apt/lists/*


COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/app ./app
COPY --from=builder /app/next.config.js ./next.config.js


EXPOSE 3000

CMD ["npm", "start"]
