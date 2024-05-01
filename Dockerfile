FROM node:21 AS builder

RUN mkdir -p /var/app

WORKDIR /var/app

COPY package*.json ./

RUN npm i

COPY . .

# RUN npm run build  
# FROM node:21-alpine
CMD [ "npm", "start" ]
EXPOSE 3000


# WORKDIR /var/app

# COPY --from=builder /var/app/node_modules ./node_modules
# COPY --from=builder /var/app/dist ./dist
# COPY --from=builder /var/app/views ./views
# COPY --from=builder /var/app/public ./public

# CMD [ "node", "dist/main.js" ]