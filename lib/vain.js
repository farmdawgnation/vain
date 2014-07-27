'use strict';

/*****
 * Vain
 *
 * A view-first templating engine for Node.js.
*****/
var jsdom = require('jsdom'),
    $ = require('jquery')(jsdom.jsdom().createWindow()),
    snippetRegistry = {},
    fs = require('fs'),
    EventEmitter = require('events').EventEmitter,
    express = require('express');

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

  if (! fn)
    throw "A callback function is require to invoke vain.render"

  var $template = $("<div />").append(input),
      snippetHandlers = options.snippets || {},
      doctypeRegex = /<!DOCTYPE [^>]+>/,
      doctypeArray = input.match(doctypeRegex),
      doctype = (doctypeArray != null ? doctypeArray[0] : ""),
      snippetsDiscovered = [];

  $.extend(snippetHandlers, snippetRegistry);

  $template.find("[data-vain]").each(function() {
    var snippetInvocation = $(this).data('vain'),
        invocationParts = snippetInvocation.split("?"),
        snippetName = invocationParts[0],
        snippetParams = processParams(invocationParts[1] || "");

    if ('function' === typeof snippetHandlers[snippetName]) {
      snippetsDiscovered.push({name: snippetName, params: snippetParams, domNode: this});
    }

    $(this).removeAttr("data-vain");
  });

  var currentSnippetIndex = 0,
      snippetProcessingEmitter = new EventEmitter,
      snippetFinishedCallback = function(error) {
        if (error) {
          fn(error);
        } else {
          currentSnippetIndex++;
          snippetProcessingEmitter.emit('nextSnippet');
        }
      };

  snippetProcessingEmitter.on('nextSnippet', function() {
    if (currentSnippetIndex == snippetsDiscovered.length) {
      fn(null, doctype + $template.html());
      return;
    }

    var snippetInformation = snippetsDiscovered[currentSnippetIndex];

    snippetHandlers[snippetInformation.name](
      $,
      snippetInformation.domNode,
      options.request,
      options.response,
      snippetInformation.params,
      snippetFinishedCallback
    );
  });

  snippetProcessingEmitter.emit('nextSnippet');
};

/**
 * Process a given file.
**/
exports.renderFile = function(path, options, fn) {
  if ('function' === typeof options) {
    fn = options;
    options = undefined;
  }

  if (! fn)
    throw "A callback is required to invoke vain.renderFile"

  fs.readFile(path, 'utf8', function(error, fileContents) {
    if (error) {
      fn(error);
      return;
    }

    exports.render(fileContents, options, fn);
  });
};

/**
 * Returns an implementation of the default vain router for a particular
 * view folder. This router will match for any URL that has a corresponding
 * HTML file under the views folder.
**/
exports.router = function(viewsFolder) {
  var router = new express.Router();

  router.get(/.*/, function(req, res, next) {
    var targetPath = req.path;

    if (targetPath === "/")
      targetPath = "/index";

    if (! fs.existsSync(viewsFolder + targetPath + '.html')) {
      res.send(404);
      return;
    }

    res.render(viewsFolder + targetPath + '.html', {request: req, response: res});
  });

  return router;
};

// Express support.
exports.__express = exports.renderFile;
