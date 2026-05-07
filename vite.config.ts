import { defineConfig,loadEnv} from 'vite'
import react from '@vitejs/plugin-react'
import path from "path";
// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    server: {
      host: "::",
      port: 3000,
    },
    plugins: [react()],
    base: "",
    build: { outDir: "dist"},
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        styles: path.resolve(__dirname, "./styles"),
      },
    },
    define: {
      "import.meta.env.VITE_CLOUDSDK_BASE_URL":JSON.stringify(env.CLOUDSDK_BASE_URL || "https://credenceid.com/cloudsdkdev"),
      "import.meta.env.VITE_CLOUDSDK_LICENSE_KEY":JSON.stringify(env.CLOUDSDK_LICENSE_KEY),
      "import.meta.env.VITE_CLOUDSDK_PROFILE_ID":JSON.stringify(env.CLOUDSDK_PROFILE_ID)
    },
  }

});