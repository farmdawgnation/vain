'use strict';

var chai = require('chai'),
    vain = require('./../lib/vain');

chai.should();

describe('Vain', function() {
  describe('.render', function() {
    it('should return the same markup if no snippets were invoked', function() {
      var startMarkup = '<a href="http://google.com">Google <span>A search engine.</span></a>',
          renderResult = vain.render(startMarkup);

      renderResult.should.equal(startMarkup);
    });
  });
});
