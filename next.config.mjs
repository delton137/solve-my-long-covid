import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Dropbox build-thrash: `.next`/`out`/`node_modules` are marked Dropbox-ignored (com.dropbox.ignored
  // xattr) by scripts/ensure-build-dir.mjs, run automatically before dev/build. This stops Dropbox
  // from syncing/racing the build dirs (which caused "Cannot find module './102.js'" errors) while
  // keeping them in the repo so module resolution works. (Symlinking `.next` out breaks resolution.)
  reactStrictMode: true,
  // Pin the workspace root so Next doesn't walk up into the home dir looking for a lockfile.
  outputFileTracingRoot: path.join(process.cwd()),
};

export default nextConfig;
