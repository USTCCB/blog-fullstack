FROM docker.m.daocloud.io/node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM docker.m.daocloud.io/node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/next.config.js ./
# COPY --from=builder /app/public ./public  # public directory is optional

EXPOSE 3000

CMD ["npm", "start"]
