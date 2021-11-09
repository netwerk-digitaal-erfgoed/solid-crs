FROM node:14-alpine

LABEL org.opencontainers.image.source https://github.com/netwerk-digitaal-erfgoed/solid-crs

# Install git as it is needed to pull from solid/community-server
RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh

ENV BASE_URL=http://localhost
ENV PORT=80
ENV CONFIG=config/config-file.json

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
ARG NPM_TOKEN
COPY package.json /usr/src/app/
RUN npm install  --unsafe-perm

# Bundle app source
COPY . /usr/src/app
COPY node_modules/ /usr/src/app

# Copy initial data
COPY data/leapeeters/ /tmp/css/leapeeters/
COPY data/hetlageland/ /tmp/css/hetlageland/

# Expose ports.
EXPOSE 80
CMD node ./node_modules/community-server/bin/server.js -b ${BASE_URL} -p ${PORT} -c ${CONFIG} --rootFilePath /tmp/css
