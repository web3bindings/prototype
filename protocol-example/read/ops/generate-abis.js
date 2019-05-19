const fs = require('fs')
const path = require('path')

/**
 * Fetch all abis from @web3bindings/protocol-example-contracts into the `abis` folder.
 */
async function generateAbis () {
  var base = require('path').dirname(require.resolve('@web3bindings/protocol-example-contracts/build/contracts/DAONetwork.json'))
  if (!fs.existsSync('./abis/')) {
    fs.mkdirSync('./abis/')
  }
  var files = fs.readdirSync(base)
  files.forEach(file => {
    const abi = JSON.parse(fs.readFileSync(path.join(base, file), 'utf-8')).abi
    fs.writeFileSync(path.join('./abis/', file), JSON.stringify(abi, undefined, 2), 'utf-8')
  })
}

if (require.main === module) {
  generateAbis().catch((err) => { console.log(err); process.exit(1) })
} else {
  module.exports = generateAbis
}
