FROM node:14

USER node

RUN mkdir /home/node/app

WORKDIR /home/node/app

CMD "npm" "i" && "npm" "run" "dev"