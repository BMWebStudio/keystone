import type { NextConfig } from "next";

type CssLoader = {
  loader?: string;
  options?: {
    modules?: Record<string, unknown>;
  };
};

const nextConfig: NextConfig = {
  experimental: { optimizePackageImports: [] },
  async redirects() {
    return [
      {
        source: "/validator/a11y-validator.js",
        destination: "/keystone/validator.js",
        permanent: true,
      },
    ];
  },
  webpack: (config) => {
    const rules = (config.module?.rules ?? []) as Array<Record<string, unknown>>;
    const oneOfRule = rules.find(
      (rule) => Array.isArray(rule.oneOf),
    ) as { oneOf?: Array<{ use?: unknown }> } | undefined;

    oneOfRule?.oneOf
      ?.filter((rule) => Array.isArray(rule.use))
      .forEach((rule) => {
        for (const entry of rule.use as unknown[]) {
          const loader = entry as CssLoader;
          if (
            !loader?.loader?.includes("css-loader") ||
            loader.loader.includes("postcss-loader") ||
            !loader.options?.modules
          ) {
            continue;
          }
          loader.options.modules = {
            ...loader.options.modules,
            getLocalIdent: (
              _context: unknown,
              _localIdentName: string,
              localName: string,
            ) => localName,
          };
        }
      });

    return config;
  },
};

export default nextConfig;
