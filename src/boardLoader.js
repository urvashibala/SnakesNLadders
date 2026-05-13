// Load all board JSONs from src/boards/data_*.json at build time via Vite glob.
// Adding a new data_boardname.json to src/boards/ automatically includes it.

const boardModules = import.meta.glob('./boards/data_*.json', { eager: true, import: 'default' })

function normalizeImageUrl(url) {
  if (!url) return url
  if (url.startsWith('http')) return url
  // Strip leading slash then prepend Vite base (handles both dev '/' and '/SnakesNLadders/')
  const path = url.startsWith('/') ? url.slice(1) : url
  return import.meta.env.BASE_URL + path
}

export const boards = Object.values(boardModules).map(board => ({
  ...board,
  imageUrl: normalizeImageUrl(board.imageUrl)
}))

// Load token images from tokens/ directory via Vite glob.
// Drop the module wrapper and collect just the processed asset URLs.
const tokenModules = import.meta.glob('../tokens/*.png', { eager: true })
export const tokenUrls = Object.values(tokenModules).map(m => m.default)
