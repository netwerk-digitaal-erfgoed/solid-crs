FROM node:14-alpine AS build
LABEL org.opencontainers.image.source=https://github.com/cultuurnet/solid-poc
ARG NPM_TOKEN
ENV UPSTREAM_URL=https://nde.eu.auth0.com/
ENV PROXY_URL=https://auth.netwerkdigitaalerfgoed.nl/
WORKDIR /usr/src/id-proxy
COPY package*.json ./
COPY .npmrc ./
RUN echo "//npm.pkg.github.com/:_authToken=$NPM_TOKEN" >> .npmrc && \
    npm install && \
    rm -f .npmrc
COPY . .
EXPOSE 80
ENTRYPOINT node ./scripts/generate-openid-configuration.js $UPSTREAM_URL $PROXY_URL /usr/src/id-proxy/openid-configuration.json && \ 
node ./scripts/generate-keys.js /usr/src/id-proxy/jwks.json && \
npm run start -- -u http://0.0.0.0 -U $UPSTREAM_URL -m . -c config/proxy-config.json -o ./openid-configuration.json -j ./jwks.json
