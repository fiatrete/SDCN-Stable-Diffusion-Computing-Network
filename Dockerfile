FROM openresty/openresty:1.21.4.1-6-jammy

RUN wget 'https://github.com/ledgetech/lua-resty-http/archive/refs/tags/v0.17.0-beta.1.tar.gz' -O /root/v0.17.0-beta.1.tar.gz \
    && tar xfp /root/v0.17.0-beta.1.tar.gz -C /root \
    && cp /root/lua-resty-http-0.17.0-beta.1/lib/resty/* /usr/local/openresty/lualib/resty/ \
    && mkdir -p /var/log/nginx \
    && apt install -y net-tools dnsutils 

ADD sdcn-server/conf/nginx.conf /usr/local/openresty/nginx/conf/nginx.conf
ADD sdcn-server/scripts /usr/local/openresty/nginx/scripts

EXPOSE 6006
CMD ["/usr/local/openresty/bin/openresty"]
