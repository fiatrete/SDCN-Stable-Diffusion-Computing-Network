FROM node:19-alpine
ENV TZ=Asia/Shanghai
COPY . /app
WORKDIR /app
RUN npm install && npm run build && npm install -g serve
EXPOSE 3000
CMD [ "serve", "-s", "build"]