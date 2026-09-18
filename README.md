# Fenaka Fonadhoo Interactive Map

GitHub Pages-ready static website based on the supplied Fenaka Map PDF.

## Publish under your own GitHub account
1. Create a new public repository, for example `fenaka-fonadhoo-map`.
2. Upload every file in this folder to the repository root.
3. Open repository **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select branch **main** and folder **/(root)**, then Save.
6. GitHub will show your public Pages address after deployment.

## Editing red markers
Open `script.js`. The `places` array at the top controls names and positions. `x` and `y` are percentages across the source map.

Note: Fenaka's marker is positioned from the label in the supplied PDF. SS 01–SS 04 were requested separately but are not present as text labels in the PDF, so their initial marker positions are placed around the Fenaka location and can be adjusted once exact plot positions are confirmed.
