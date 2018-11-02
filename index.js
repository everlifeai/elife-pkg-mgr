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
 * `yarn install` to set up the dependencies. If it is already present,
 * update it to the latest version then `yarn install` any new
 * dependencies.
 */
function installPkg(pkg, loc, cb) {
    let name = path.basename(pkg, '.git')
    let pkgloc = path.join(loc, name)

    if(fs.existsSync(pkgloc)) {
        update_pkg_1(pkgloc, (err) => {
            if(err) cb(err)
            else yarn_setup_1((err) => {
                if(err) cb(err)
                else cb(null, pkgloc)
            })
        })
    } else {
        clone_pkg_1((err) => {
            if(err) cb(err)
            else yarn_setup_1((err) => {
                if(err) cb(err)
                else cb(null, pkgloc)
            })
        })
    }

    function update_pkg_1(pkgloc, cb) {
        u.showMsg(`Updating ${pkg}...`)
        pkg = get_pkg_url_1(pkg)
        exec('git', ['pull', '--rebase', pkg], pkgloc, null, null, cb)
    }

    function clone_pkg_1(cb) {
        u.showMsg(`Cloning ${pkg}...`)
        pkg = get_pkg_url_1(pkg)
        exec('git', ['clone', pkg], loc, null, null, cb)
    }

    /*      outcome/
     * Default to github if package location is not a full URL
     * Use the current .ssh credentials to connect automatically even
     * with private repositories.
     */
    function get_pkg_url_1(pkg) {
        if(pkg.indexOf("://") < 0) {
            return `git@github.com:${pkg}.git`
        } else {
            return pkg
        }
    }

    function yarn_setup_1(cb) {
        u.showMsg(`Yarn setup ${pkg}...`)
        exec('yarn', ['install'], pkgloc, null, null, cb)
    }
}



