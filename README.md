# Vain

**Vain** is a view-first middleware and simplistic templating engine for Node.js / Express
applications. Inspired by the [Lift Framework](http://liftweb.net), vain gives you the building
blocks for a clean separation between view concerns and logic concerns. Using vain, you can register
some sets of functions to certain names, such as "page-title", then use `data-vain` attributes in
your markup to invoke the function on that HTML element and its children.

**Vain is currently in alpha. It may not function as you expect, or even function at all. Any
help in finding a filing bugs is appreciated!**

## Using Vain

Vain can be dropped into your Express (or other) stack in one of two ways:

* As a drop-in templating engine used by Express.
* As a response middleware, added to the stack by calling `app.use` after your router.

Given the lack of native support for things like embedding templates for the moment, you may
find it preferable to do the latter. After you've decided how you want to integrate it, you
can start registering snippets.

### Integration Option 1: View engine.

You can set vain as your default template engine by using `app.set` in your Express application.

```javascript
var express = require('express'),
    app = express(),
    vain = require('vain');

// with your settings
app.set('view engine', vain);
```

### Integration Option 2: Response middleware

You can alternately have vain integrate as middleware that runs after your router, and use a different
view engine altogether.

```javascript
var express = require('express'),
    app = express(),
    vain = require('vain');

// some settings...
app.use(app.router);
app.use(vain.middleware);
```

In this configuration, vain will operate on the response output produced by your routing code.

### Registering Snippets

After you have vain integrated into your stack, you'll want to register snippets. Snippets take
two arguments: a jQuery object `$`, and the DOM element the snippet was invoked on. So, let's
start by registering a snippet named "page-title" that changes the title of a page to something
meaningful.

```javascript
vain.registerSnippet('page-title', function($, element) {
  $(element).text("Welcome to vain.");
});
```

Congrats! That's all that is required to register a snippet with vain. Now, let's look at using it.

### Using Snippets

Assuming you have integrated vain with your application using one of the options above. Using it
is as simple as making a change to your markup. Let's take the following markup:

```html
<html>
  <head>
    <title>Bacon</title>
  </head>
  <body>
    <h1>Hello, world.</h1>
  </body>
</html>
```

Now, we want the title tag above to be run against our "page-title" snippet. To do that, all we
need to do is to add a `data-vain` attribute with the name of our snippet to the element.

```html
<html>
  <head>
    <title data-vain="page-title">Bacon</title>
  </head>
  <body>
    <h1>Hello, world.</h1>
  </body>
</html>
```

Then, in the response that actually appears to the user we'll get "Welcome to vain." in the
page title.

## Vain API Documentation

Vain exposes the following methods:

* **registerSnippet(snippetName, snippetFunction)** - Register a snippet in the global snippet
  registry.
* **unregisterSnippet(snippetName)** - Unregister a global snippet.
* **render(input, options, fn)** - Render the `input` (a string) by finding all data-vain invocations
  and executing the relevant snippets. If you provide a `fn` that `fn` will be called as a callback
  upon completion. The following elements are supported in `options`:
  * **snippets** - An object literal of snippet names to functions that only apply for this render
    invocation.
* **renderFile(path, options, fn)** - Exactly the same as render, except that it operates on a file path.
* **reponseMiddleware(req, res, next)** - Middleware function that can be `app.use`d directly.

## Who am I?

My name is **Matt Farmer**. I'm a Software Engineer in Atlanta, GA, hacking on things for
[Elemica](http://elemica.com) by day, and hacking on my own things for [Crazy Goat Creative](http://crazygoatcreative.com)
by night. You can read my thoughts on my blog, [Farmdawg Nation](http://farmdawgnation.com)
and follow my 140-character mindstream [@farmdawgnation](http://twitter.com/farmdawgnation).
