import type { NextConfig } from "next";

const [repositoryOwner = "", repository = ""] =
  process.env.GITHUB_REPOSITORY?.split("/") ?? [];
const isUserSite = repository.endsWith(".github.io");
const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
const assetPrefix = configuredSiteUrl
  ? configuredSiteUrl
  : repositoryOwner && repository && !isUserSite
    ? `https://${repositoryOwner}.github.io/${repository}`
    : undefined;

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  assetPrefix,
};

export default nextConfig;
