FROM node:19-alpine
ENV TZ=Asia/Shanghai
COPY ../ /app/
WORKDIR /app/
RUN set -x \
    && apk add --no-cache tzdata \
    && npm install \
    && npm run build \
    && npm install -g serve

EXPOSE 8080
CMD [ "serve", "-s", "build"]