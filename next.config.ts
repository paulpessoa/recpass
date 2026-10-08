import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Proteção contra versões misturadas: se a aba ficou aberta durante um deploy, a navegação
  // vira recarga completa em vez de carregar código novo num app antigo ("i is not a function").
  deploymentId: process.env.VERCEL_DEPLOYMENT_ID ?? process.env.VERCEL_GIT_COMMIT_SHA,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
