# Everlife Package Manager

The everlife package manager downloads and deploys everlife packages
locally so they can be used. Packages include:

1. The Scuttlebot Immortal Feed and Replication
2. A Database for storing working data
3. A Work Queue for managing and distributing work (with a worker
pool)
4. A Skill Manager for installing, running, and managing skills
      - Infrastructure Skills (as hub/as host/...)
      - Worker skills (twitter svc, vanity address, ...)
5. A Communication Manager for installing, running, and managing
communication channels
      - Telegram channel
      - Messenger channel
      - Alexa channel
      - Web channel
      - ...
6. An AI for understanding and managing user interaction and
strategies for earning
7. The stellar blockchain interface for payments, receipts, and smart
contracts.
8. ...


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

