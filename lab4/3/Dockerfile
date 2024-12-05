FROM httpd:2.4

COPY ./httpd.conf /usr/local/apache2/conf/httpd.conf
COPY ./script.cgi /usr/local/apache2/cgi-bin/

RUN chmod +x /usr/local/apache2/cgi-bin/script.cgi

EXPOSE 80
CMD ["httpd-foreground"]
