FROM node:20 AS builder

RUN mkdir -p /var/app

WORKDIR /var/app

COPY package*.json ./

RUN npm i

COPY . .

RUN npm run build  

EXPOSE 3000

FROM node:20-alpine

WORKDIR /var/app

COPY --from=builder /var/app/node_modules ./node_modules
COPY --from=builder /var/app/dist ./dist

ENV NODE_ENV production

CMD [ "node", "dist/main.js" ]