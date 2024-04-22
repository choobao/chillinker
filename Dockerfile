FROM node:20 AS builder

WORKDIR /var/app

COPY package*.json ./

RUN npm install --only=production

COPY . .

RUN npm run build  

FROM node:20-alpine

WORKDIR /var/app

COPY --from=builder /var/app/node_modules ./node_modules
COPY --from=builder /var/app/dist ./dist

ENV NODE_ENV production

CMD [ "node", "dist/main" ]