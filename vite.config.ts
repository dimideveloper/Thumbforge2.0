import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Disable source maps in production — prevents readable source in DevTools
    sourcemap: false,
    // Enable minification and obfuscation with terser
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,    // Remove all console.log statements from build
        drop_debugger: true,   // Remove debugger statements
        pure_funcs: ["console.log", "console.info", "console.warn", "console.debug"],
      },
      mangle: {
        // Mangle (obfuscate) variable and function names
        toplevel: true,
      },
      format: {
        // Remove all comments from output
        comments: false,
      },
    },
    rollupOptions: {
      output: {
        // Randomize chunk names to make them harder to trace
        chunkFileNames: "assets/[hash].js",
        entryFileNames: "assets/[hash].js",
        assetFileNames: "assets/[hash].[ext]",
      },
    },
  },
}));
