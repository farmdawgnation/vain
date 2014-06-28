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
 * Utility method to process a params string in a snippet invocation
 * and corretly parse out the various parameters in it.
 *
 * For example, given the string
 *
 * bacon=one&winning=two
 *
 * it would produce the object
 *
 * {bacon: "one", winning: "two"}
**/
function processParams(paramsString) {
  var individualParams = paramsString.split("&"),
      resultObject = {};

  individualParams.forEach(function(item) {
    var itemParts = item.split("="),
        paramName = itemParts[0],
        paramValue = decodeURIComponent(itemParts[1] || "");

    var paramObject = {};
    paramObject[paramName] = paramValue;

    $.extend(resultObject, paramObject);
  });

  return resultObject;
}

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
      snippetHandlers = options.snippets || {},
      doctypeRegex = /<!DOCTYPE [^>]+>/,
      doctypeArray = input.match(doctypeRegex),
      doctype = (doctypeArray != null ? doctypeArray[0] : "");

  $.extend(snippetHandlers, snippetRegistry);

  $template.find("[data-vain]").each(function() {
    var snippetInvocation = $(this).data('vain'),
        invocationParts = snippetInvocation.split("?"),
        snippetName = invocationParts[0],
        snippetParams = processParams(invocationParts[1] || "");

    if ('function' === typeof snippetHandlers[snippetName]) {
      snippetHandlers[snippetName]($, this, options.request, options.response, snippetParams);
    }

    $(this).removeAttr("data-vain");
  });

  return doctype + $template.html();
};

/**
 * Process a given file.
**/
exports.renderFile = function(path, options, fn) {
  if ('function' === typeof options) {
    fn = options;
    options = undefined;
  }

  if ('function' === typeof fn) {
    var result;

    try {
      result = exports.renderFile(path, options);
    } catch (exception) {
      return fn(exception);
    }

    return fn(null, result);
  }

  var fileContents = fs.readFileSync(path, 'utf8');
  return exports.render(fileContents, options);
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
    var targetPath = req.path;

    if (targetPath === "/")
      targetPath = "/index";

    if (! fs.existsSync(viewsFolder + targetPath + '.html')) {
      res.send(404);
      return;
    }

    res.render(viewsFolder + req.path + '.html', {request: req, response: res});
  });

  return router;
};

// Express support.
exports.__express = exports.renderFile;
