
var request = require('request'),
    fs = require('fs'),
    mkdirp = require('mkdirp'),
    path = require('path'),
    utilities = require('./utilities'),
    TaskQueue = require('./taskQueue');

var downloadQueue = new TaskQueue(2);


function saveFile(filename, contents, callback) {
    mkdirp(path.dirname(filename), function(err) {
        if (err) {
            return callback(err);
        }

        fs.writeFile(filename, contents, callback);
    });
}

function download(url, filename, callback) {
    console.log('Downloading ' + url);
    request(url, function(err, response, body) {
        if (err) {
            return callback(err);
        }

        saveFile(filename, body, function(err) {
            console.log('Downloaded and saved: ' + url);
            if(err) {
                return callback(err);
            }

            callback(null, body);
        });
    });
}

function spiderLinks(currentUrl, body, nesting, callback) {
    if(nesting === 0) {
        return process.nextTick(callback);
    }

    var links = utilities.getPageLinks(currentUrl, body);
    if (links.length === 0) {
        return process.nextTick(callback);
    }

    var completed = 0, errored = false;

    links.forEach(function(link) {
        downloadQueue.pushTask(function(done) {
            spider(link, nesting - 1, function(err) {
                if(err) {
                    errored = true;
                    return callback(err);
                }

                if(++completed === links.length && !errored) {
                    callback();
                }

                done();
            })
        })
    });
}

var spidering = {};
function spider(url, nesting, callback) {
    if (spidering[url]) {
        return process.nextTick(callback);
    }

    spidering[url] = true;


    var filename = utilities.urlToFileName(url);
    console.log(url);
    console.log(filename);

    fs.readFile(filename, 'utf8', function(err, body) {
        if (err) {
            if(err.code !== 'ENOENT') {
                return callback(err);
            }

            return download(url, filename, function (err, body) {
                if(err) {
                    return callback(err);
                }

                spiderLinks(url, body, nesting, callback);
            });
        }


        spiderLinks(url, body, nesting, callback);
    });
}

spider('http://google.pl', 1, function(err, filename, downloaded) {
    if (err) {
        console.log(err);
    } else if (downloaded) {
        console.log('Completed the download of "' + filename + '"');
    } else {
        console.log('"' + filename + '" was already downloaded');
    }
});