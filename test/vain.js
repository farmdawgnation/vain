'use strict';

var chai = require('chai'),
    vain = require('./../lib/vain'),
    fs = require('fs');

chai.should();

describe('Vain', function() {
  it('should export the correct properties', function() {
    vain.registerSnippet.should.be.a('function');
    vain.unregisterSnippet.should.be.a('function');
    vain.render.should.be.a('function');
    vain.renderFile.should.be.a('function');
    vain.responseMiddleware.should.be.a('function');
    vain.__express.should.be.a('function');
  });

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

  describe(".renderFile", function() {
    it("should correctly render a full HTML file on the file system", function() {
      var inputFilePath = './test/examples/render-input.html',
          expectedOuput = fs.readFileSync('./test/examples/render-output.html', 'utf8');

      vain.registerSnippet('page-title', function($, element) {
        $(element).text("Welcome to vain");
      });

      vain.registerSnippet("page-header", function($, element) {
        $(element).text("Welcome to vain");
      });

      vain.registerSnippet("page-content", function($, element) {
        $(element)
          .attr("id", "content")
          .text("Welcome to vain, a view first templating engine / middleware for Node.");
      });

      var renderResult = vain.renderFile(inputFilePath);

      renderResult.should.equal(expectedOuput);
    });
  });

  describe(".router", function() {
    it("should dispatch for valid paths", function(done) {
      var testPath = '/render-input',
          router = vain.router("./test/examples"),
          res = {
            render: function(val) {
              val.should.equal('./test/examples/render-input.html');
              done();
            },

            send: function(code) {
              done("Template was not found.");
            }
          };

      router.handle({ url: testPath, method: 'GET', path: testPath}, res);
    });
  });
});
