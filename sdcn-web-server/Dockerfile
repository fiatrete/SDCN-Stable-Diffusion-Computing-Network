FROM node:19-alpine
COPY . /app/
WORKDIR /app/
RUN npm install \
    && npm run build

EXPOSE 8080
CMD [ "npm", "start" ]