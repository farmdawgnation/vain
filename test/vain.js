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

    it('should pass in the entire matching node to a snippet', function(callback) {
      var startMarkup = '<a href="http://google.com" data-vain="test">Google <span>A search engine.</span></a>',
          snippetHandler = function($, element) {
            var passedInMarkup = $("<div />").append(element).html();

            passedInMarkup.should.equal(startMarkup);
            callback();
          },
          renderResult = vain.render(startMarkup, {snippets: {'test': snippetHandler}});
    });
  });
});
