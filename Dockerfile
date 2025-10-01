FROM jtl-tkgiharbor.hq.bni.co.id/library-ocp-dev/node:20 AS build
WORKDIR /app

ARG HTTP_PROXY
ARG HTTPS_PROXY
ARG NO_PROXY
# Jangan set NODE_ENV=production di tahap install/build
ENV http_proxy=${HTTP_PROXY} \
    https_proxy=${HTTPS_PROXY} \
    no_proxy=${NO_PROXY} \
    NEXT_TELEMETRY_DISABLED=1 \
    NPM_CONFIG_PRODUCTION=false

# Manifest
COPY --chown=node:node package.json package-lock.json* ./

# Install semua deps (termasuk dev)
RUN --mount=type=cache,target=/root/.npm \
    if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Source
COPY . .

# Build (dev deps masih tersedia)
RUN npm run build

# Prune dev deps untuk runtime ringan
RUN if [ -f package-lock.json ]; then npm prune --omit=dev; fi

# ================= RUNTIME =================
FROM jtl-tkgiharbor.hq.bni.co.id/library-ocp-dev/node:20 AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000

COPY --chown=node:node package.json package-lock.json* ./
COPY --chown=node:node --from=build /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/public ./public
COPY --chown=node:node --from=build /app/.next ./.next
# COPY --chown=node:node --from=build /app/next.config.js ./   # jika ada

# Fallback permission
RUN chown -R node:node /app && find /app -maxdepth 1 -name "package*.json" -exec chmod 644 {} \;

USER node
EXPOSE 3000
CMD ["npm","run","start"]

ENV http_proxy= \
    https_proxy= \