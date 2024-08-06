### 打包

- docker build -f Dockerfile -t paiky-web 版本

### 运行 paiky-web

- docker run -d --name paiky-web --network=host --user root --privileged=true \
  -p 80:80 -p 443:443 \
  -v /data/nginx/nginx/conf:/etc/nginx/nginx.conf \
  -v /data/nginx/nginx/ssl.key:/etc/nginx/ssl.key \
  -v /data/nginx/nginx/ss.crt:/etc/nginx/ssl.crt \
  -v /data/nginx/nginx/logs:/var/log/nginx \
  paiky-web 版本
