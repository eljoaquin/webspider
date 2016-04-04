var urlParse = require('url').parse,
    urlResolve = require('url').resolve,
    slug = require('slug'),
    path = require('path'),
    cheerio = require('cheerio');

module.exports.urlToFileName = function urlToFileName(url) {
    var parsedUrl = urlParse(url);
    var urlPath = parsedUrl.path.split('/')
        .filter(function (component) {
            return component !== '';
        })
        .map(function (component) {
            return slug(component);
        })
        .join('/');

    var filename = path.join(parsedUrl.hostname, urlPath);
    if(!path.extname(filename).match(/htm/)) {
        filename += '.html';
    }

    return filename;
};

module.exports.getLinkUrl = function getLinkUrl(currentUrl, element) {
    var link = urlResolve(currentUrl, element.attribs.href || ""),
        parsedLink = urlParse(link),
        currentParsedUrl = urlParse(currentUrl);

    if(parsedLink.hostname !== currentParsedUrl.hostname || !parsedLink.pathname) {
        return null;
    }

    return link;
};

module.exports.getPageLinks = function getPageLinks(currentUrl, body) {
    return [].slice.call(cheerio.load(body)('a'))
        .map(function(element) {
            return module.exports.getLinkUrl(currentUrl, element);
        })
        .filter(function(element) {
            return !!element;
        });
};