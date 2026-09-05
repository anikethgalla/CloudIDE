FROM alpine:3.19

RUN addgroup -S sandbox && adduser -S sandbox -G sandbox

RUN apk add --no-cache bash g++ gcc make gdb git

WORKDIR /workspace

RUN chown -R sandbox:sandbox /workspace

USER sandbox

CMD ["/bin/bash"]
