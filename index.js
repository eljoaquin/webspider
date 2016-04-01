
var request = require('request'),
    fs = require('fs'),
    mkdirp = require('mkdirp'),
    path = require('path'),
    utilities = require('./utilities');


function spider(url, callback) {
    var filename = utilities.urlToFileName(url);

    fs.exists(filename, function(exists) {
        if(!exists) {
            console.log("Downloading " + url);
            request(url, function(err, response, body) {
                if(err) {
                    callback(err);
                } else {
                    mkdirp(path.dirname(filename), function(err) {
                        if(err) {
                            callback(err);
                        } else {
                            fs.writeFile(filename, body, function(err) {
                                if(err) {
                                    callback(err);
                                } else {
                                    callback(null, filename, true);
                                }
                            });
                        }
                    });
                }
            });
        } else {
            callback(null, filename, false);
        }
    });
}

spider('http://google.pl', function(err, filename, downloaded) {
    if (err) {
        console.log(err);
    } else if (downloaded) {
        console.log('Completed the download of "' + filename + '"');
    } else {
        console.log('"' + filename + '" was already downloaded');
    }
});