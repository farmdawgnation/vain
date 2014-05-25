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

    it('should return transformed node markup', function() {
      var startMarkup = '<a href="http://google.com" data-vain="test">Google</a>',
          expectedMarkup = '<a href="http://google.com" class="fancy">Google</a>',
          snippetHandler = function($, element) {
            $(element).addClass("fancy");
          },
          renderResult = vain.render(startMarkup, {snippets: {'test': snippetHandler}});

      renderResult.should.equal(expectedMarkup);
    });

    it('should correctly transform nested markup', function() {
      var startMarkup = '<section data-vain="parent"><h1>I like robots.</h1> <p data-vain="child">I really enjoy robots.</p></section>',
          expectedMarkup = '<section class="cheese"><h1 class="pig">I like robots.</h1> <p class="sauce enjoy">I really enjoy robots.</p></section>';

      var parentHandler = function($, element) {
        $(element)
          .addClass("cheese")
          .find("h1")
            .addClass("pig")
            .end()
          .find("p")
            .addClass("sauce");
      }

      var childHandler = function($, element) {
        $(element).addClass("enjoy");
      }

      var renderResult = vain.render(startMarkup, {snippets: {
        'parent': parentHandler,
        'child': childHandler
      }});

      renderResult.should.equal(expectedMarkup);
    });

    it('should run snippets from the global snippet registry', function() {
      var startMarkup = '<a href="http://google.com" data-vain="globally-registered">Google</a>',
          expectedMarkup = '<a href="http://google.com" class="fancy">Google</a>',
          snippetHandler = function($, element) {
            $(element).addClass("fancy");
          };

      vain.registerSnippet("globally-registered", snippetHandler);

      var renderResult = vain.render(startMarkup);

      renderResult.should.equal(expectedMarkup);
    });
  });
});
