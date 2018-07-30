/*      outcome/
 * Simple test of the load
 */
const pkgmgr = require('./')

let pkg = 'https://github.com/everlifeai/elife-utils.git'
let to_location = '1/2/3/4/'

pkgmgr.load(pkg, to_location, (err) => {
    if(err) console.error(err)
    else console.log('Success! Check the downloaded package...')
})
