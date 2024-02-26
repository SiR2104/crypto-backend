FROM node
WORKDIR /app
COPY package.json /app
RUN npm install
COPY . .
EXPOSE 9000

ENV TZ="Asia/Novosibirsk"
RUN date

RUN npm run build