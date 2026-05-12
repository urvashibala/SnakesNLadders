# Image Annotator

Simple web-based annotator to record click coordinates on an image and export JSON.

Usage:

1. Start a local HTTP server at the workspace root (so `/public/...` paths work):

```bash
python3 -m http.server 5500
```

2. Open the annotator in your browser:

http://127.0.0.1:5500/tools/annotator/index.html?img=/public/boards/Gyan_Chaupar_National_Museum_India.JPG

3. Click on the image to record coordinates. Use the radio to choose start at 0 or 1.
4. Click "Done" to show JSON and copy it.
