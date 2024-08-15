FROM node:18-alpine as builder

WORKDIR /app
COPY . /app
RUN npm install -g pnpm@8 --registry https://registry.npmmirror.com \
    && pnpm install \
    && npm run build

FROM nginx:latest

COPY --from=builder /app/dist /deployments/web/dist/
COPY start.sh /deployments/web/start.sh
COPY ./configs/nginx.conf /etc/nginx/

USER root

RUN chmod -R 777 /var/cache/nginx \
    && chmod +x /deployments/web/start.sh  \
    && chmod -R 777 /deployments

VOLUME ["/deployments/mount"]

WORKDIR /deployments/web

EXPOSE 8080

CMD ["sh", "-c", "/deployments/web/start.sh run"]