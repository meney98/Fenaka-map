FONADHOO MAP — CLICKABLE EMPTY BLOCKS + EDITABLE INFORMATION

Upload every file in this ZIP to the root of the GitHub Map repository.

Named houses:
Edit houses.json.

Empty / unnamed blocks:
1. Tap an empty house/building block on the live map.
2. The popup shows its Block ID, for example BLOCK-0123.
3. On GitHub open blocks.json and search that exact Block ID.
4. Tap Edit (pencil).
5. Enter houseName, houseNumber, area, feederNumber, distributionBox, breakerNumber and meterNumber.
6. Commit changes and refresh the map.

The map keeps:
- house-name search and zoom
- clickable named houses
- clickable vector house-sized blocks from the original PDF
- one-finger pan
- two-finger pinch zoom
- no large red/black search rectangle


SHOW / CHANGE A NAME DIRECTLY ON AN EMPTY BLOCK
1. Open blocks.json on GitHub.
2. Find the Block ID you want, for example BLOCK-0001.
3. Change only the houseName value. Example:
   "houseName": "Gahaa"
4. Commit the change and refresh the live map.
5. The text Gahaa will appear centered inside that block.

To hide the name again, set houseName back to an empty string: "".
