storage_init=${WEB_INIT_PATH-"/opt/app-root/web/init"}
mkdir -p $storage_init;

cp -rpf -P /opt/app-root/dist/*.tgz $storage_init;

login_url=${LOGIN_API-"http://erdcloud-gateway:8000/platform/sso/login"};
init_url=${INIT_API-"http://erdcloud-gateway:8000/platform/mfe/apps/force/init"};
admin_user_name=${ADMIN_USER_NAME-"erdcadmin"};
admin_password=${ADMIN_PASSWORD-"T9jI1drJe9zVlx7jBZ3H0vdCIINwutKk1NtcNOhMOHvbup/u444mcKmUYY+lSZxDnoXNshm8tv3eKowFrzTrjXM1nD1ySm6esc6o6Fm/a4Yl7eCLxb7ugZhSYuZmw8yMAf/zAwXyq8wg9Gkh63LHFWBXLbia/qgnmmRkqV7DMl4="};

echo "$login_url";
echo "$init_url";

response=$(curl -X POST -H "Content-Type: application/json" -H "Authorization: Basic ZXJkcDoyMDU5ZTI4ZC1hMDgzLTRhNTgtOTI3Yy00ODczNThkYTNiNTI=" -d '{"username": "'"$admin_user_name"'", "password": "'"$admin_password"'"}' "$login_url");
echo "$response";
token=$(echo "$response" | awk -F '[:,}]' '{print $6}' | awk '{gsub(/"/, "") } 1');
echo "$token";
response=$(curl -H "Authorization: $token" "$init_url");
echo "$response";

if [ -d "/opt/app-root/nginx" ]; then
  echo "copy file {/opt/app-root/nginx} to {/etc/nginx}";
  cp -r /opt/app-root/nginx/. /etc/nginx;
  ls /etc/nginx/
fi

nginx -g "daemon off;";
