FROM node:18-alpine as builder
USER root
WORKDIR /app
COPY . /app
RUN npm install -g pnpm@7 --registry https://registry.npmmirror.com \
&& pnpm install \
&& npm run build

FROM nginx:1.20-ubi7

USER root

COPY --from=builder /app/dist /opt/app-root/dist
COPY --from=builder /app/start.sh /opt/app-root/start.sh

RUN chmod +x /opt/app-root/start.sh

VOLUME ["/opt/app-root/web"]

WORKDIR /opt/app-root/web

CMD ["/bin/bash", "-c", "/opt/app-root/start.sh"]