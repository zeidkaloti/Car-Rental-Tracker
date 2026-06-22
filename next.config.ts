import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lean runtime image for the Docker `app` service — only the standalone
  // server bundle + production deps are needed, not the full build output.
  output: "standalone",
};

export default nextConfig;
