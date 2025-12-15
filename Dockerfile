FROM oven/bun:1 as builder
WORKDIR /app
COPY . .
RUN bun install --frozen-lockfile
RUN bun build --compile --minify ./src/index.ts --outfile server

FROM gcr.io/distroless/base
COPY --from=builder /app/server /server
CMD ["/server"]