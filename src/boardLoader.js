// Load all board JSONs from src/boards/data_*.json at build time via Vite glob.
// Adding a new data_boardname.json to src/boards/ automatically includes it.

const boardModules = import.meta.glob('./boards/data_*.json', { eager: true, import: 'default' })

function normalizeImageUrl(url) {
  if (!url) return url
  // Ensure leading slash for public-folder paths
  if (!url.startsWith('/') && !url.startsWith('http')) {
    return '/' + url
  }
  return url
}

export const boards = Object.values(boardModules).map(board => ({
  ...board,
  imageUrl: normalizeImageUrl(board.imageUrl)
}))

// Load token images from tokens/ directory via Vite glob.
// Drop the module wrapper and collect just the processed asset URLs.
const tokenModules = import.meta.glob('../tokens/*.png', { eager: true })
export const tokenUrls = Object.values(tokenModules).map(m => m.default)
