FROM node:14-alpine

LABEL org.opencontainers.image.source https://github.com/netwerk-digitaal-erfgoed/solid-crs

ENV PORT=80
ENV CONFIG=config/config-crs.json

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
ARG NPM_TOKEN
COPY package.json /usr/src/app/
RUN npm install

# Bundle app source
COPY . /usr/src/app

# Expose ports.
EXPOSE 80
CMD ./node_modules/.bin/semcom-node -p ${PORT} -c ${CONFIG} -m ./
