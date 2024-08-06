cd ~
echo "cp /data/webserver", $VER
cp /data/code/webserver_frontend/main/dist main -rf
echo "build"
docker build . -t registry.sensetime.com/sensepedia/paiky_web:${VER}
echo "push"
docker push registry.sensetime.com/sensepedia/paiky_web:${VER}
echo "tag"
docker tag registry.sensetime.com/sensepedia/paiky_web:${VER} registry.sensetime.com/sensepedia/webserver_web:v${VER}

COMMAND=NOTSTART
if [ "$COMMAND" = "START" ]; then
  echo "start"
  # Docker启动
  docker run --name webserver-web --network=host --user root -d -p80:80 -p443:443 \
  --privileged=true \
  -v /data/webserver/nginx/nginx.conf:/etc/nginx/nginx.conf \
  -v /data/webserver/nginx/key:/etc/nginx/ssl/key \
  -v /data/webserver/nginx/cer:/etc/nginx/ssl/cer \
  -v /data/webserver/log:/var/log/nginx \
  registry.sensetime.com/sensepedia/webserver_web:v版本
fi
