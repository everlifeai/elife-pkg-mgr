# Everlife Package Manager

The everlife package manager downloads and deploys everlife packages
locally so they can be used. Packages include:

* Core Avatar Capabilities
* Communication Skills
* Infrastructure Skills
* Worker Skills
* ...


## Quick start

```js
const pkgmgr = require('elife-pkg-mgr')

let pkg = 'https://github.com/everlifeai/elife-utils.git'
let to_location = '1/2/3/4/'

pkgmgr.load(pkg, to_location, (err) => {
    if(err) console.error(err)
    else console.log('Success! Check the downloaded package...')
})
```

TBD: Map package paths to various everlife hosted repository locations
