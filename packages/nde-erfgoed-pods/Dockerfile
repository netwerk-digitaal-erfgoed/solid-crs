FROM node:14-alpine

LABEL org.opencontainers.image.source https://github.com/digita-ai/nde-erfgoedinstellingen

ENV BASE_URL=http://localhost
ENV PORT=80
ENV CONFIG=config/config-file.json

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
ARG NPM_TOKEN
COPY package.json /usr/src/app/
RUN npm install

# Bundle app source
COPY . /usr/src/app

# Copy initial data
COPY data/leapeeters/ /tmp/css/leapeeters/

# Expose ports.
EXPOSE 80
CMD ./node_modules/.bin/community-solid-server -b ${BASE_URL} -p ${PORT} -c ${CONFIG} --rootFilePath /tmp/css
