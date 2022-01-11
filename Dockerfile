FROM node:14.17

LABEL maintainer "Sudeep Sagar <sudeep@trodl.com>"

WORKDIR /app

COPY ./package*.json ./

RUN yarn install

COPY . .

CMD ["node","/app/src/cronjob.js"]