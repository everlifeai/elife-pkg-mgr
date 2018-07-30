'use strict'
const fs = require('fs')
const path = require('path')
const u = require('elife-utils')
const exec = require('./exec')


module.exports = {
    load: load,
}


/*      problem/
 * We need to install everlife packaged code into the given location
 * with the given name.
 *
 *      way/
 * We first ensure that the location exists, then install the package
 * into that location.
 */
function load(pkg, path_, cb) {
    u.showMsg(`Loading ${pkg}...`)
    u.ensureExists(path_, (err, loc) => {
        if(err) cb(err)
        else installPkg(pkg, loc, cb)
    })
}

/*      outcome/
 * If the package is not yet installed, clone it and call
 * `yarn install` to set up the dependencies.
 */
function installPkg(pkg, loc, cb) {
    let name = path.basename(pkg, '.git')
    let pkgloc = path.join(loc, name)

    if(fs.existsSync(pkgloc)) {
        u.showMsg(`Package exists in location ${loc}...`)
        cb(null)
    } else {
        clone_pkg_1((err) => {
            if(err) cb(err)
            else yarn_setup_1(cb)
        })
    }

    function clone_pkg_1(cb) {
        u.showMsg(`Cloning ${pkg}...`)
        exec('git', ['clone', pkg], loc, null, null, cb)
    }

    function yarn_setup_1(cb) {
        u.showMsg(`Yarn setup ${pkg}...`)
        exec('yarn', ['install'], pkgloc, null, null, cb)
    }
}



