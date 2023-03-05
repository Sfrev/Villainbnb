FROM node:16.15.0

RUN mkdir -p /app
WORKDIR /app

COPY package.json /app
RUN npm install

RUN npm install nodemon

COPY . /app

EXPOSE 3000

ENTRYPOINT ["node"]

CMD ["index.js", "start"]