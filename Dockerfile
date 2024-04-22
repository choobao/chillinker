FROM node:20 AS builder

RUN mkdir -p /var/app

WORKDIR /var/app

COPY package*.json ./

RUN npm i

COPY . .

RUN npm run build  

FROM node:20-alpine

WORKDIR /var/app

COPY --from=builder /var/app/node_modules ./node_modules
COPY --from=builder /var/app/dist ./dist
COPY --from=builder /var/app/views ./views
COPY --from=builder /var/app/public ./public

CMD [ "node", "dist/main.js" ]