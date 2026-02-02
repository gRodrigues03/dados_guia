import process from "node:process";
import { defineConfig, UserConfig } from "vite";

/**
 * Vite configuration for Streamlit Custom Component v2 development.
 *
 * @see https://vitejs.dev/config/ for complete Vite configuration options.
 */
export default defineConfig(() => {
    const isProd = true;
    const isDev = !isProd;

    return {
        base: "./",
        define: {
            // We are building in library mode, we need to define the NODE_ENV
            // variable to prevent issues when executing the JS.
            "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
        },
        build: {
            minify: 'terser',
            cssMinify: true,
            outDir: "dist",
            sourcemap: isDev,
            lib: {
                entry: "./src/index.ts",
                name: "MyComponent",
                formats: ["es"],
                fileName: "index",
            },
            ...(!isDev && {
                esbuild: {
                    drop: ["console", "debugger"],
                    minifyIdentifiers: true,
                    minifySyntax: true,
                    minifyWhitespace: true,
                },
            }),
        },
    } satisfies UserConfig;
});