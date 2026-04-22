# Multi-stage GPU build
FROM nvidia/cuda:12.1-devel-ubuntu22.04 AS builder

# Install dependencies
RUN apt-get update && apt-get install -y \
    python3.10 \
    python3-pip \
    hashcat \
    hcxtools \
    cap2hccapx \
    aircrack-ng \
    wget \
    git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .
RUN pip3 install -r requirements.txt --no-cache-dir

# Production stage
FROM builder
COPY . .
COPY --from=builder /usr/bin/hashcat /usr/bin/hashcat
COPY --from=builder /usr/bin/cap2hccapx /usr/bin/cap2hccapx

EXPOSE 5000
CMD ["python3", "app.py"]