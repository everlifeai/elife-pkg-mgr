'use strict'
const fs = require('fs')
const path = require('path')
const u = require('elife-utils')
const exec = require('./exec')


module.exports = {
    load: load,
    update: updatePkg,
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
 * `yarn install` to set up the dependencies. If it is already present,
 * don't do anything.
 */
function installPkg(pkg, loc, cb) {
    pkg = get_pkg_url_1(pkg)
    let name = path.basename(pkg, '.git')
    let pkgloc = path.join(loc, name)

    if(fs.existsSync(pkgloc)) {
        u.showMsg(`Package exists in location '${pkgloc}/'...`)
        cb(null, pkgloc)
    } else {
        clone_pkg_1(pkg, (err) => {
            if(err) cb(err)
            else yarnSetup(pkgloc, (err) => {
                if(err) cb(err)
                else cb(null, pkgloc)
            })
        })
    }

    function clone_pkg_1(pkg, cb) {
        u.showMsg(`Cloning ${pkg}...`)
        exec('git', ['clone', pkg], loc, null, null, cb)
    }

    /*      outcome/
     * If the package is a complete url we just use it. Otherwise we
     * check if we are given a package in the format `org/repo` and
     * assume it is a github URL. Otherwise we default to a Everlife
     * skill repo on github (with prefix `eskill-`)
     */
    function get_pkg_url_1(pkg) {
        if(pkg.indexOf("://") > 0) {
            return pkg
        }
        if(pkg.indexOf("/") > 0) {
            return `https://github.com/${pkg}.git`
        }
        return `https://github.com/everlifeai/eskill-${pkg}.git`
    }
}

function yarnSetup(pkgloc, cb) {
    u.showMsg(`Yarn setup ${pkgloc}...`)
    exec('yarn', ['install'], pkgloc, null, null, cb)
}

function updatePkg(pkgloc, cb) {
    update_pkg_1(pkgloc, (err) => {
        yarnSetup(pkgloc, (err2) => {
            if(err2) cb(err2)
            else if(err) cb(err)
            else cb()
        })
    })

    function update_pkg_1(pkgloc, cb) {
        u.showMsg(`Updating ${pkgloc}...`)
        exec('git', ['pull', '--rebase'], pkgloc, null, null, cb)
    }

}

