'use strict';

/*****
 * Vain
 *
 * A view-first templating engine for Node.js.
*****/
var jsdom = require('jsdom'),
    $ = require('jquery')(jsdom.jsdom().createWindow()),
    snippetRegistry = {};

/**
 * Register a snippet in the snippet registry.
**/
exports.registerSnippet = function(snippetName, snippetFn) {
  snippetRegistry[snippetName] = snippetFn;
};

/**
 * Process the given markup.
**/
exports.render = function(input, options, fn) {
  if ('function' === typeof options) {
    fn = options;
    options = undefined;
  }

  options = options || {};

  var $template = $(input);
  $template.find("data-vain").each(function() {
    var snippetName = $(this).data('vain');

    if ('function' === typeof snippetRegistry[snippetName]) {
      $(this).replaceWith(snippetRegistry[snippetName](this));
    }
  });

  return $template.html();
};

/**
 * Process a given file.
**/
exports.renderFile = function(path, options, fn) {
  //
};

// Express support.
exports.__express = exports.renderFile;
