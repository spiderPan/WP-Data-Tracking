//node init.js -u admin -p starter-theme987 -s http://starter-theme.local

var WPAPI           = require('wpapi'),
    fs              = require('fs'),
    path            = require('path'),
    semver          = require('semver'),
    commandLineArgs = require('command-line-args'),
    events          = require('events');

var defaultArgs = [
        {
            name : 'username',
            alias: 'u',
            type : String
        },
        {
            name : 'password',
            alias: 'p',
            type : String
        },
        {
            name : 'siteurl',
            alias: 's',
            type : String
        }
    ],
    option      = commandLineArgs(defaultArgs);

if (defaultArgs.some(
        function (arg) {
            var optionName = arg['name'];
            return !option[optionName];
        })) {
    console.log('Please provide all arguments -u username -p password -s siteurl');
    process.exit(0);
}

var wp = new WPAPI({
    endpoint: option.siteurl + '/wp-json',
    // This assumes you are using basic auth, as described further below
    username: option.username,
    password: option.password,
    auth    : true
});
wp.settings().get(function (err, data) {
    if (err) {
        console.log('error:' + err);
        // handle err
    }

    //var currentVersion = data.northern_data_version,
    var currentVersion = '0.0.1';
    result             = upgradeVersion(currentVersion, updateRemoteVersion);

});

function upgradeVersion(currentVersion, callback) {
    var aret     = [],
        dataPath = __dirname + '/data/',
        ee       = new events(),
        Northern = require('./libs')(wp, ee);

    fs.readdirSync(dataPath).filter(function (a) {
        var v = a.replace('v', '').replace('.js', '');
        return semver.gt(v, currentVersion);
    }).sort(function (a, b) {
        var va = a.replace('v', '').replace('.js', ''),
            vb = b.replace('v', '').replace('.js', '');

        return semver.gt(va, vb) ? 1 : -1;
    }).forEach(function (library) {
        var libraryExtName = path.extname(library),
            libName        = path.basename(library, libraryExtName);

        if (libraryExtName === '.js') {
            try {
                aret.push({
                    'version': libName.replace('v', ''),
                    'result' : require(path.join(dataPath, library))(Northern)
                });
            } catch (e) {
                console.log(e);
            }
        }
    });

    if (callback) {
        process.nextTick(function () {
            callback(null, aret);
        });
    }
}

function updateRemoteVersion() {
    //TODO: deal with error if any upgrade failed
    //TODO: set current version to db after upgrade is done
    console.log(arguments[1]);
    latestVersion = arguments[1].pop();
    console.log('current version has been updated to ' + latestVersion.version);
}
