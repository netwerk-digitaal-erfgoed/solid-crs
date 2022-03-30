cd packages/solid-crs-semcom-components && \
npm i @netwerk-digitaal-erfgoed/solid-crs-client@loans @netwerk-digitaal-erfgoed/solid-crs-components@loans @netwerk-digitaal-erfgoed/solid-crs-core@loans @netwerk-digitaal-erfgoed/solid-crs-theme@loans && \
cd ../solid-crs-presentation && \
npm i @netwerk-digitaal-erfgoed/solid-crs-client@loans @netwerk-digitaal-erfgoed/solid-crs-components@loans @netwerk-digitaal-erfgoed/solid-crs-core@loans @netwerk-digitaal-erfgoed/solid-crs-theme@loans @netwerk-digitaal-erfgoed/solid-crs-semcom-components@loans && \
cd ../solid-crs-manage && \
npm i @netwerk-digitaal-erfgoed/solid-crs-client@loans @netwerk-digitaal-erfgoed/solid-crs-components@loans @netwerk-digitaal-erfgoed/solid-crs-core@loans @netwerk-digitaal-erfgoed/solid-crs-theme@loans @netwerk-digitaal-erfgoed/solid-crs-semcom-components@loans && \
cd ../solid-crs-core && \
npm i @netwerk-digitaal-erfgoed/solid-crs-theme@loans  && \
cd ../solid-crs-components && \
npm i @netwerk-digitaal-erfgoed/solid-crs-core@loans @netwerk-digitaal-erfgoed/solid-crs-theme@loans  && \
cd ../..  && \
npm run bootstrap
