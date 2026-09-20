FROM node:20-alpine

WORKDIR /app

copy package*.json ./
run npm install

COPY . .

EXPOSE 3002

CMD ["node", "index.js"]