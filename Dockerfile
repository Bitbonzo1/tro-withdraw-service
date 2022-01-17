FROM node:14.17

LABEL maintainer "Sudeep Sagar <sudeep@trodl.com>"

WORKDIR /app

COPY ./package*.json ./

ENV ENV NODE_ENV ${NODE}
ENV PRIVATE_KEY ${PRIVATE_KEY}

RUN yarn install

COPY . .

CMD ["node","/app/src/cronjob.js"]
