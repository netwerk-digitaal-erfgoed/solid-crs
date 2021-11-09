FROM node:14-alpine

LABEL org.opencontainers.image.source https://github.com/netwerk-digitaal-erfgoed/solid-crs

# Install git as it is needed to pull from solid/community-server
RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh

ENV BASE_URL=http://localhost
ENV PORT=80
ENV CONFIG=config/file.json

# Create app directory
RUN mkdir -p /community-server
WORKDIR /community-server

# Install app dependencies
ARG NPM_TOKEN
COPY package.json /community-server/
RUN npm install  --unsafe-perm

# Bundle app source
COPY . /community-server

# Copy initial data
COPY data/leapeeters/ /tmp/css/leapeeters/
COPY data/hetlageland/ /tmp/css/hetlageland/

# Expose ports.
EXPOSE 80
CMD node ./node_modules/.bin/community-solid-server -b ${BASE_URL} -p ${PORT} -c ${CONFIG} --rootFilePath /tmp/css
