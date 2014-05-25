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
      snippetHandlers = options.snippets || {};
  $.extend(snippetHandlers, snippetRegistry);

  $template.find("[data-vain]").each(function() {
    var snippetName = $(this).data('vain');

    if ('function' === typeof snippetHandlers[snippetName]) {
      snippetHandlers[snippetName]($, this);
    }

    $(this).removeAttr("data-vain");
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
