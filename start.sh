storage_upgrade=${WEB_UPGRADE_PATH-"/deployments/mount/web/upgrade"}
nginx_conf=${NGINX_CONF-"/etc/nginx/nginx.conf"}

mkdir -p "$storage_upgrade";

echo "$storage_upgrade"

cp -rpf -P /deployments/web/dist/*.tgz "$storage_upgrade";

echo "$nginx_conf"

nginx -c "$nginx_conf" -g 'daemon off;'