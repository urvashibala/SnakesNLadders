import { defineConfig } from 'vite'

export default defineConfig({
  base: '/SnakesNLadders/',
  server: {
    watch: {
      // Use polling instead of fsevents (fsevents incompatible with Node 22)
      usePolling: true,
      interval: 300
    }
  }
})
