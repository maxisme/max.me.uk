FROM woahbase/alpine-hugo AS builder
COPY . /
ARG HUGOFLAGS
RUN hugo --minify $HUGOFLAGS

FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /public /usr/share/nginx/html/

EXPOSE 8080
HEALTHCHECK CMD curl --fail http://localhost:8080/ || exit 1