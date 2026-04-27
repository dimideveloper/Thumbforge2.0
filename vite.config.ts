import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import javascriptObfuscator from "vite-plugin-javascript-obfuscator";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    // Only obfuscate in production builds
    mode === "production" && javascriptObfuscator({
      options: {
        compact: true,
        controlFlowFlattening: false, // Disable to prevent constructor errors
        controlFlowFlatteningThreshold: 0,
        deadCodeInjection: false,
        debugProtection: false,     // This often causes Illegal constructor errors
        debugProtectionInterval: 0,
        disableConsoleOutput: false, // Don't kill console as some libs need it
        identifierNamesGenerator: "mangled", 
        log: false,
        renameGlobals: false,
        selfDefending: false,       // This can break in some environments
        stringArray: true,         
        stringArrayCallsTransform: true,
        stringArrayEncoding: ["base64"],
        stringArrayIndexShift: true,
        stringArrayRotate: true,
        stringArrayShuffle: true,
        stringArrayWrappersCount: 1,
        stringArrayWrappersType: "function",
        stringArrayThreshold: 0.5,
        unicodeEscapeSequence: false,
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    sourcemap: false, // No source maps in production
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: false, // Don't drop all consoles
        drop_debugger: true,
        pure_funcs: ["console.log", "console.debug"],
      },
      mangle: {
        toplevel: false, // Safer for obfuscated code
      },
      format: {
        comments: false,
      },
    },
    rollupOptions: {
      output: {
        chunkFileNames: "assets/[hash].js",
        entryFileNames: "assets/[hash].js",
        assetFileNames: "assets/[hash].[ext]",
      },
    },
  },
}));
