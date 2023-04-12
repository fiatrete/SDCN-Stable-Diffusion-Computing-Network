FROM openresty/openresty:1.21.4.1-6-jammy

RUN mkdir -p /var/log/nginx \
    && apt install -y net-tools dnsutils 

ADD conf/nginx.conf /usr/local/openresty/nginx/conf/nginx.conf
WORKDIR  /usr/local/openresty/nginx/

EXPOSE 6006
CMD ["/usr/local/openresty/bin/openresty"]