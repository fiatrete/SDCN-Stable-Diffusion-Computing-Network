FROM node:19-alpine
COPY . /app
WORKDIR /app
RUN npm install && npm run build && npm install -g serve
EXPOSE 3000
CMD [ "sh", "-c", "npx react-inject-env set && serve -s build "]