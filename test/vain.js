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
    vain.__express.should.be.a('function');
  });

  describe('.render', function() {
    it('should return the same markup if no snippets were invoked', function(callback) {
      var startMarkup = '<a href="http://google.com">Google <span>A search engine.</span></a>'

      vain.render(startMarkup, function(error, output) {
        output.should.equal(startMarkup);
        callback();
      });
    });

    it('should pass in the entire matching node to a snippet', function(callback) {
      var startMarkup = '<a href="http://google.com" data-vain="test">Google <span>A search engine.</span></a>',
          expectedMarkup = '<a href="http://google.com">Google <span>A search engine.</span></a>',
          snippetHandler = function($, params, finished) {
            var passedInMarkup = $("<div />").append(this).html();

            passedInMarkup.should.equal(expectedMarkup);
            callback();
            finished();
          }

      vain.render(startMarkup, {snippets: {'test': snippetHandler}}, function(error, output) {
      });
    });

    it('should return transformed node markup', function(callback) {
      var startMarkup = '<a href="http://google.com" data-vain="test">Google</a>',
          expectedMarkup = '<a href="http://google.com" class="fancy">Google</a>',
          snippetHandler = function($, params, finished) {
            $(this).addClass("fancy");
            finished();
          }

      vain.render(startMarkup, {snippets: {'test': snippetHandler}}, function(error, output) {
        output.should.equal(expectedMarkup);
        callback();
      });
    });

    it('should correctly transform nested markup', function(callback) {
      var startMarkup = '<section data-vain="parent"><h1>I like robots.</h1> <p data-vain="child">I really enjoy robots.</p></section>',
          expectedMarkup = '<section class="cheese"><h1 class="pig">I like robots.</h1> <p class="sauce enjoy">I really enjoy robots.</p></section>';

      var parentHandler = function($, params, finished) {
        $(this)
          .addClass("cheese")
          .find("h1")
            .addClass("pig")
            .end()
          .find("p")
            .addClass("sauce");

        finished();
      }

      var childHandler = function($, params, finished) {
        $(this).addClass("enjoy");
        finished();
      }

      vain.render(startMarkup, {snippets: {
        'parent': parentHandler,
        'child': childHandler
      }}, function(error, output) {
        output.should.equal(expectedMarkup);
        callback();
      });
    });

    it('should run snippets from the global snippet registry', function(callback) {
      var startMarkup = '<a href="http://google.com" data-vain="globally-registered">Google</a>',
          expectedMarkup = '<a href="http://google.com" class="fancy">Google</a>',
          snippetHandler = function($, params, finished) {
            $(this).addClass("fancy");
            finished();
          };

      vain.registerSnippet("globally-registered", snippetHandler);

      vain.render(startMarkup, function(error, output) {
        output.should.equal(expectedMarkup);
        callback();
      });
    });

    it('should pass params into snippets', function(callback) {
      var startMarkup = '<a href="http://google.com" data-vain="test?one=1&two=2">Google <span>A search engine.</span></a>',
          snippetHandler = function($, params, finished) {
            params.one.should.equal("1");
            params.two.should.equal("2");
            callback();
            finished();
          };

      vain.render(startMarkup, {snippets: {'test': snippetHandler}}, function() {});
    });
  });

  describe(".renderFile", function() {
    it("should correctly render a full HTML file on the file system", function(callback) {
      var inputFilePath = './test/examples/render-input.html',
          expectedOuput = fs.readFileSync('./test/examples/render-output.html', 'utf8');

      vain.registerSnippet('page-title', function($, params, finished) {
        $(this).text("Welcome to vain");
        finished();
      });

      vain.registerSnippet("page-header", function($, params, finished) {
        $(this).text("Welcome to vain");
        finished();
      });

      vain.registerSnippet("page-content", function($, params, finished) {
        $(this)
          .attr("id", "content")
          .text("Welcome to vain, a view first templating engine / middleware for Node.");

        finished();
      });

      vain.renderFile(inputFilePath, function(error, output) {
        output.should.equal(expectedOuput);
        callback();
      });
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

    it("should return a 404 for invalid paths", function(done) {
      var testPath = '/nonexistent-path',
          router = vain.router("./test/examples"),
          res = {
            render: function(val) {
              done("Render was invoked.");
            },

            send: function(code) {
              code.should.equal(404);
              done();
            }
          };

      router.handle({ url: testPath, method: 'GET', path: testPath}, res);
    });
  });
});
