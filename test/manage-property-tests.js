'use strict'
var assert = require('chai').assert;
var rewire = require('rewire');
var fs = require('fs');

var app = rewire('../src/services/manage-property.js');

var getPropertyUrls = app.__get__('getPropertyUrls');
var getPages = app.__get__('getPages');

describe('Get Properties', () => {
    it('Should return array of Property URLs', () => {
        let urlArray = [
            "/14c-parkdale-house-dunmurry-seymour-hill-lisburn/438544",
            "/4-berkeley-hall-square-lisburn/233291",
            "/114a-gregg-street-lisburn/529533",
            "/67-the-wallace-gardens-lisburn/596548",
            "/9-magheralave-meadows-lisburn/597484",
            "/19-laurel-wood-lisburn/472391",
            "/224-killowen-grange-lisburn/420828",
            "/40-fulmar-avenue-lisburn/598669",
            "/17-portmore-lea-ballinderry-lower/561268",
            "/15-lady-wallace-crescent-lisburn/598411"
        ];
        let file = fs.readFileSync('./test/test-files/search-full.html')
        assert.deepEqual(getPropertyUrls(file), urlArray);
    })

    it('Should return a number of pages', () => {
        let file = fs.readFileSync('./test/test-files/search-full.html');
        assert.equal(getPages(file), 6);
    });

    it('Should return undefined number of pages', async () => {
        let file = fs.readFileSync('./test/test-files/search-no-page.html');
        assert.isNull(getPages(file));
    });
});
