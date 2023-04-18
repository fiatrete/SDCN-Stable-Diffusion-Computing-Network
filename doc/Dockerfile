FROM node:19-alpine as builder
COPY . /app
WORKDIR /app
RUN yarn install && yarn run build
FROM nginx
COPY --from=builder /app/build /usr/share/nginx/html

