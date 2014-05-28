'use strict';

/*****
 * Vain
 *
 * A view-first templating engine for Node.js.
*****/
var jsdom = require('jsdom'),
    $ = require('jquery')(jsdom.jsdom().createWindow()),
    snippetRegistry = {},
    fs = require('fs');

/**
 * Register a snippet in the snippet registry.
**/
exports.registerSnippet = function(snippetName, snippetFn) {
  snippetRegistry[snippetName] = snippetFn;
};

/**
 * Unregister a globally registered snippet.
**/
exports.unregisterSnippet = function(snippetName) {
  delete snippetRegistry[snippetName];
}

/**
 * Process the vain directives in the given markup. This code will
 * search for all attributes containing a data-vain directive and
 * execute the associated snippets, providing the markup itself as
 * input.
**/
exports.render = function(input, options, fn) {
  if ('function' === typeof options) {
    fn = options;
    options = undefined;
  }

  options = options || {};

  if ('function' === typeof fn) {
    var result;

    try {
      result = exports.render(input, options);
    } catch (exception) {
      return fn(exception);
    }

    return fn(null, result);
  }

  var $template = $("<div />").append(input),
      snippetHandlers = options.snippets || {},
      doctypeRegex = /<!DOCTYPE [^>]+>/,
      doctypeArray = input.match(doctypeRegex),
      doctype = (doctypeArray != null ? doctypeArray[0] : "");

  $.extend(snippetHandlers, snippetRegistry);

  $template.find("[data-vain]").each(function() {
    var snippetName = $(this).data('vain');

    if ('function' === typeof snippetHandlers[snippetName]) {
      snippetHandlers[snippetName]($, this);
    }

    $(this).removeAttr("data-vain");
  });

  return doctype + $template.html();
};

/**
 * Reads in an HTML file and returns it verbatim. Useful for cases
 * where you're not pairing vain with a templating engine.
**/
exports.htmlRenderer = function(path, options, fn) {
  if ('function' === typeof options) {
    fn = options;
    options = undefined;
  }

  if ('function' === typeof fn) {
    var result;

    try {
      result = exports.htmlRenderer(path, options);
    } catch (exception) {
      return fn(exception);
    }

    return fn(null, result);
  }

  var fileContents = fs.readFileSync(path, 'utf8');
  return fileContents;
};

/**
 * Middleware for processing vain directives in markup. This should be
 * taking in whatever the current body content is, which could be the
 * result of the htmlRenderer or of another template engine (e.g. jade).
**/
exports.middleware = function(req, res, next) {
  res.body = exports.render(res.body);
  next();
};

/**
 * Returns an implementation of the default vain router for a particular
 * view folder. This router will match for any URL that has a corresponding
 * HTML file under the views folder.
**/
exports.router = function(viewsFolder) {
  var express = require('express'),
      router = new express.Router();

  router.get(/.*/, function(req, res, next) {
    if (! fs.existsSync(viewsFolder + req.path + '.html')) {
      res.send(404);
      return;
    }

    res.render(viewsFolder + req.path + '.html');
  });

  return router;
};

// Express support.
exports.__express = exports.htmlRenderer;
