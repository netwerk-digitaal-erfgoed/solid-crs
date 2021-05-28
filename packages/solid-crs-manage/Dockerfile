FROM node:14-alpine AS build
ARG NPM_TOKEN
WORKDIR /usr/src/app
COPY package*.json ./
COPY .npmrc ./
RUN echo "//npm.pkg.github.com/:_authToken=$NPM_TOKEN" >> .npmrc && \
    npm install && \
    rm -f .npmrc
COPY . .
RUN npm run build

FROM nginx:stable-alpine
LABEL org.opencontainers.image.source=https://github.com/netwerk-digitaal-erfgoed/solid-crs
COPY --from=build /usr/src/app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
