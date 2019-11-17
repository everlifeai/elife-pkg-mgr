'use strict'
const fs = require('fs')
const path = require('path')
const u = require('@elife/utils')
const exec = require('./exec')
const git = require('nodegit')

module.exports = {
    load: load,
    update: updatePkg,

    installLatest: installLatest,
    normalize: normalize
}

/*      problem/
 * When the user specifies a package name he can do so in a variety of
 * forms:
 *      https://path.to/full/repo
 *      user/repo       #On github
 *      repo            #From everlife skills
 *      eskill-repo     #Full name of everlife skills
 * For each of these we would like to get the fetch url and the local
 * directory name (which is reponame.org or just reponame for everlife
 * packages).
 *
 *      way/
 * If the package is a complete url we just use it. Otherwise we check
 * if we are given a package in the format `org/repo` and assume it is a
 * github URL. Otherwise we default to a Everlife skill repo on github
 * (with prefix `eskill-`). Then we set the name of the local directory.
 */
function normalize(pkg) {
    let fetch = ''

    if(pkg.indexOf("://") > 0) {
        fetch = pkg
    } else if(pkg.indexOf("/") > 0) {
        fetch = `https://github.com/${pkg}.git`
    } else if(pkg.startsWith("eskill-") > 0) {
        fetch = `https://github.com/everlifeai/${pkg}.git`
    } else {
        fetch = `https://github.com/everlifeai/eskill-${pkg}.git`
    }
    return {
        fetch: fetch,
        name: get_pathname_1(fetch)
    }

    /*      outcome/
     * We get rid of the url prefix (http/https) and remove any trailing
     * '.git' repo. Then we split the url into it's parts and join it in
     * reverse to form the full name (we ignore standard location
     * (github.com) and standard organization (everlifeai)
     */
    function get_pathname_1(fetch) {
        let name = fetch.substring(fetch.indexOf('://')+3)
        name = name.replace(/\.git$/,'')
        let parts = name.split('/')
        if(parts[0] == 'github.com') parts.shift()
        if(parts[0] == 'everlifeai') parts.shift()
        return parts.reverse().join('.')
    }
}

/*      problem/
 * We need to install the latest version of the package in the given
 * location not in ASAR file path.
 *
 *      way/
 * If the given path is ASAR path, we are returning a given path,
 * because all the everlife packages are preloaded in the ASAR file.
 * Else We will ensure the given location exists, we normalize the package
 * name and delete if it already exists. Then we install the package
 * into the given location.
 */
function installLatest(pkg, path_, cb) {
    pkg = normalize(pkg)
    u.showMsg(`Installing ${pkg.name}...`)
    if(path_.includes('/app.asar/')) {
        cb(null, path.join(path_, pkg.name))
    } else{
        u.ensureExists(path_, (err, loc) => {
            if(err) cb(err)
            else {
                let pkgloc = path.join(loc, pkg.name)
                if(fs.existsSync(pkgloc)) {
                    u.showMsg(`Deleting package from '${pkgloc}/'...`)
                    del_pkg_1(pkgloc, (err) => {
                        if(err) cb(err)
                        else installPkg(pkg, loc, cb)
                    })
                } else {
                    installPkg(pkg, loc, cb)
                }
            }
        })
    }
    
    /*      outcome/
     * Because deleting a directory recursively is a dangerous
     * operation, we perform a sanity check that the directory does seem
     * to be an everlife directory (for now it's an 'eskill-'
     * directory). Otherwise we refuse to delete it
     */
    function del_pkg_1(pkgloc, cb) {
        let name = path.basename(pkgloc)
        if(!name.startsWith('eskill-')) cb(`Refusing to delete non-standard directory ${name}...`)
        else u.rmdir(pkgloc, cb)
    }
}


/*      problem/
 * We need to ensure an everlife packaged code is installed in a given
 * location not in ASAR file path.
 *
 *      way/
 * If the given path is ASAR path, we are returning a given path,
 * because all the everlife packages are preloaded in the ASAR file.
 * Else we will ensure the given location exists, we normalize the package
 * name and check if it already exists. If it does we do nothing
 * otherwise we install the package into the given location.
 */
function load(pkg, path_, cb) {
    pkg = normalize(pkg)
    u.showMsg(`Ensuring ${pkg.name} loaded...`)
    if(path_.includes('/app.asar/')) {
        cb(null, path.join(path_, pkg.name))
    } else{
        u.ensureExists(path_, (err, loc) => {
            if(err) cb(err)
            else {
                let pkgloc = path.join(loc, pkg.name)
                if(fs.existsSync(pkgloc)) {
                    u.showMsg(`Package exists in location '${pkgloc}/'...`)
                    cb(null, pkgloc)
                } else {
                    installPkg(pkg, loc, cb)
                }
            }
        })
    }
    
}

/*      outcome/
 * Clone the package and call `npm install` to set up the dependencies.
 */
function installPkg(pkg, loc, cb) {
    let pkgloc = path.join(loc, pkg.name)
    clone_pkg_1(pkg.fetch, (err) => {
        if(err) cb(err)
        else npmSetup(pkgloc, (err) => {
            if(err) cb(err)
            else cb(null, pkgloc)
        })
    })

    function clone_pkg_1(pkg, cb) {
        u.showMsg(`Cloning ${pkg}...`)
        
        u.ensureExists(pkgloc, (err) => {
            git.Clone(pkg, pkgloc, {
                fetchOpts: {
                    callbacks: {
                        certificateCheck: function() {
                            return 0;
                        }
                    }
                }
            }).then((repo) => {
                cb()
            }).catch((err) => {
                u.showErr(err)
                u.rmdir(pkgloc, (err) => {
                    cb('Installation failed')
                })
            })
        })
    }
}

function npmSetup(pkgloc, cb) {
    u.showMsg(`NPM setup ${pkgloc}...`)
    exec((/^win/.test(process.platform)?'npm.cmd':'npm'), ['install'], pkgloc, null, null, cb)
}

function updatePkg(pkgloc, cb) {
    update_pkg_1(pkgloc, (err) => {
        npmSetup(pkgloc, (err2) => {
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

