const { fileToBuffer, urlDecode, write } = require("kolmafia");

/**
 * @param {string} pageText
 */
function main(pageText) {
  const snippet = `<script id="snippet">${fileToBuffer(
    "data/high-speed-rail-load.js",
  )}</script>`;
  write(
    urlDecode(pageText)
      .replace("</body>", snippet + "</body>")
      .replace('<div id="fml"', '<div id="fml" style="display: none;"'),
  );
}

module.exports.main = main;
