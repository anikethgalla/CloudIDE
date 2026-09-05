FROM openjdk:21-jdk-slim

RUN groupadd -r sandbox && useradd -r -g sandbox -m -d /home/sandbox sandbox

RUN apt-get update && apt-get install -y --no-install-recommends \
    bash \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace

RUN chown -R sandbox:sandbox /workspace

USER sandbox

CMD ["/bin/bash"]
