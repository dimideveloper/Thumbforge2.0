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
    // Temporarily disabled to debug "Illegal constructor" error
    /*
    mode === "production" && javascriptObfuscator({
      options: {
        compact: true,
        controlFlowFlattening: false, 
        controlFlowFlatteningThreshold: 0,
        deadCodeInjection: false,
        debugProtection: false,     
        debugProtectionInterval: 0,
        disableConsoleOutput: false, 
        identifierNamesGenerator: "mangled", 
        log: false,
        renameGlobals: false,
        selfDefending: false,       
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
    */
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    sourcemap: false, // No source maps in production
    minify: "esbuild",
    rollupOptions: {
      output: {
        chunkFileNames: "assets/[hash].js",
        entryFileNames: "assets/[hash].js",
        assetFileNames: "assets/[hash].[ext]",
      },
    },
  },
}));
