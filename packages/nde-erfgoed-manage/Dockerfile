FROM node:14-alpine

LABEL org.opencontainers.image.source https://github.com/digita-ai/nde-erfgoedinstellingen

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
ARG NPM_TOKEN
COPY package.json /usr/src/app/
COPY .npmrc /usr/src/app/
RUN npm install

# Bundle app source
COPY . /usr/src/app

RUN rm -f /usr/src/app/.npmrc
RUN npm run build

# Expose ports.
EXPOSE 3002
CMD npm start