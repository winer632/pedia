FROM node:21-alpine3.19 as build-stage
WORKDIR /app/paiky
COPY . .
RUN npm config set registry https://registry.npmmirror.com
RUN npm config set sass_binary_site=https://npm.taobao.org/mirrors/node-sass
RUN npm install -g pnpm
RUN pnpm i
RUN pnpm run build:main

FROM nginx:latest
COPY --from=build-stage /app/paiky/main/dist /usr/share/nginx/html
COPY --from=build-stage /app/paiky/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80 443
CMD [ "nginx", "-g", "daemon off;" ]
