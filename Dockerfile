FROM node:14.16.0-alpine

WORKDIR /app

RUN npm install && \
    npm install serverless -g && \
    npm install nodemon -g
    
EXPOSE 3000