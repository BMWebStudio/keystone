import type { NextConfig } from "next";

type CssLoader = {
  loader?: string;
  options?: {
    modules?: Record<string, unknown>;
  };
};

type OneOfRule = {
  use?: CssLoader | CssLoader[];
};

const nextConfig: NextConfig = {
  experimental: { optimizePackageImports: [] },
  webpack: (config) => {
    const oneOf = config.module.rules.find(
      (rule): rule is { oneOf: OneOfRule[] } =>
        typeof rule === "object" &&
        rule !== null &&
        "oneOf" in rule &&
        Array.isArray(rule.oneOf),
    )?.oneOf;

    oneOf
      ?.filter((rule) => Array.isArray(rule.use))
      .forEach((rule) => {
        (rule.use as CssLoader[]).forEach((loader) => {
          if (
            loader.loader?.includes("css-loader") &&
            !loader.loader.includes("postcss-loader") &&
            loader.options?.modules
          ) {
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
      });

    return config;
  },
};

export default nextConfig;
