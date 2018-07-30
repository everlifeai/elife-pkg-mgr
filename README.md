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

let pkg = 'everlifeai/elife-utils'
let to_location = '1/2/3/4/'

pkgmgr.load(pkg, to_location, (err, loc) => {
    if(err) console.error(err)
    else console.log(`Success! Check the downloaded package in '${loc}'...`)
})
```

