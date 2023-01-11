FROM node:16.19-bullseye-slim

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install -g rimraf

RUN npm install readdirp
RUN npm install 

COPY . .
RUN npm run build
RUN rm -rf /usr/src/app/dist/migration/*.ts /usr/src/app/dist/dist/migration/*.map
ENV TZ=Africa/Cairo
ENV NODE_ENV=development
EXPOSE 1000
CMD ["npm", "run", "start:dev"]
