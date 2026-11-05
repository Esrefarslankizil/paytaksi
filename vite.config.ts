import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig({
    plugins: [react()],
    server: {
        host: true,
    },
    resolve: {
        alias: {
            framer: path.resolve(__dirname, "./src/framer-shim.ts"),
            "https://esm.sh/three@0.169.0": "three",
        },
    },
})
