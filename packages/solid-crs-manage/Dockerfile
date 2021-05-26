FROM node:14-alpine AS build
ARG NPM_TOKEN
WORKDIR /usr/src/app
COPY package*.json ./
COPY .npmrc ./
RUN echo "//npm.pkg.github.com/:_authToken=$NPM_TOKEN" >> .npmrc && \
    cat .npmrc && \
    npm install && \
    rm -f .npmrc
COPY . .
RUN npm run build

FROM node:14-alpine
LABEL org.opencontainers.image.source=https://github.com/digita-ai/nde-erfgoedinstellingen
WORKDIR /usr/src/app
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY . .
EXPOSE 3002
CMD npm start
