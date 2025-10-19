FROM golang:1.24-alpine AS builder

WORKDIR /app

RUN apk add --no-cache git build-base


COPY backend/go.mod .
COPY backend/go.sum .

RUN go mod download

COPY backend/ .

RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo \
    -idflags="-w -s -X main.version=$(git describe --tags --always)" \
    -o /task-scheduler ./cmd/server/main.go


FROM alpine:latest

RUN apk --no-cache add ca-certificates tzdata postgresql-client

# Create non-root user
RUN addgroup -g 1001 -S appgroup && \
    adduser -S -D -H -u 1001 -h /app -s /sbin/nologin -G appgroup -g appuser appuser

# Set working directory
WORKDIR /app

# Copy built binary from builder stage
COPY --from=builder --chown=appuser:appgroup /task-scheduler /app/task-scheduler

# Expose port
EXPOSE 8080

# Run as non-root user
USER appuser

# Run the binary
CMD ["./task-scheduler"]