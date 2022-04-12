FROM node:16

USER node

RUN mkdir /home/node/app

WORKDIR /home/node/app

CMD "chmod" "744" "/home/node/app/uploads" && "npm" "i" && "npm" "run" "dev"
