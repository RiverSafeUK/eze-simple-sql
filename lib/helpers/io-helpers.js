const fs = require('fs')
const util = require('util')

/**
 * @param {String} filepath
 * @param {String} content
 * @returns {Promise<boolean>}
 */
async function writeFile (filepath, content) {
  const writeFile = util.promisify(fs.writeFile).bind(fs)
  await writeFile(filepath, content)
  return true
}

/**
 * @param {String} filepath
 * @returns {Promise<boolean>}
 */
function loadJSON (filepath) {
  return JSON.parse(fs.readFileSync(filepath))
}

module.exports = {
  writeFile,
  loadJSON
}
