import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import tailwindcss from "@tailwindcss/vite";
import vuetify from "vite-plugin-vuetify";
import Components from "unplugin-vue-components/vite";
import AutoImport from "unplugin-auto-import/vite";

export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 5173,
    allowedHosts: [
      'railway.app',
    ],
  },
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(),
    vuetify({ autoImport: true }),
    Components({
      dirs: ["src"],
      dts: true,
      extensions: ["vue"],
      deep: true,
      resolvers: [
        (name) => {
          if (name === "QuillEditor") {
            return {
              importName: "QuillEditor",
              path: "@vueup/vue-quill",
            };
          }
        },
      ],
    }),
    AutoImport({
      imports: [
        "vue",
        "vue-router",
        "pinia",
        "@vueuse/core",
        {
          "@vuelidate/validators": ["required", "helpers", "url", "email"],
          "@vuelidate/core": ["useVuelidate"],
          "jwt-decode": ["jwtDecode"],
          axios: [],
          vuetify: ["createVuetify"],
          "vuetify/labs/VDateInput": ["VDateInput"],
          "vuetify/iconsets/mdi": ["aliases", "mdi"],
        },
      ],
      dirs: ["src/**"],
      dts: true,
      vueTemplate: true,
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
