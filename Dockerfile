FROM node:18.15.0

WORKDIR /


ENV Port 8080
ENV HOST 0.0.0.0

COPY package*.json ./

RUN npm install 

COPY . .

RUN npm run build

CMD node index.js
