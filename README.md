# Vain

![build status](https://api.travis-ci.org/farmdawgnation/vain.png)
[![Dependency Status](https://gemnasium.com/farmdawgnation/vain.svg)](https://gemnasium.com/farmdawgnation/vain)

**Vain** is a view-first middleware and simplistic templating engine for Node.js / Express
applications. Inspired by the [Lift Framework](http://liftweb.net), vain gives you the building
blocks for a clean separation between view concerns and logic concerns. Using vain, you can register
some sets of functions to certain names, such as "page-title", then use `data-vain` attributes in
your markup to invoke the function on that HTML element and its children.

If you want to see it in action, you can look at the code in my [vain-test](https://github.com/farmdawgnation/vain-test)
repository. Check out app.js for the good stuff.

**Vain is currently in alpha. It may not function as you expect, or even function at all. Any
help in finding a filing bugs is appreciated!**

## Using Vain

Vain is ideally integrated by using the vain router. The vain router will search for HTML files in your views
folder that matches the path the user is trying to access. If one is found, it will run the HTML template through
vain and send the output to the browser. So, for example, if the user is trying to access the URL "/admin/users"
and you configured the vain router to use "views" as its `viewsFolder`, then it will look for the HTML file
"views/admin/users.html" and render it, processing any `data-vain` attributes it finds, then return that result
to the client.

Such a configuration would be accomplished by adding the following line to your app.js in your express app:

```javascript
app.use('/', vain.router(app.get('views')));
```

### Registering Snippets

After you have vain integrated into your stack, you'll want to register snippets. Snippets take
five arguments:

1. A jQuery object `$`
2. The DOM element the snippet was invoked on.
3. The current request object from express.
4. The current response object from express.
5. A hash of snippetParameters.

So, let's start by registering a snippet named "page-title" that changes the title of a page to something
meaningful.

```javascript
vain.registerSnippet('page-title', function($, element, request, response, snippetParameters) {
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
page title. You can also pass in parameters to snippets. For example, if you had a snippet that
did localization, you may want to pass in the localization key associated with a particular tag.

```html
<h1 data-vain="loc?key=page-header">My Awesome Header</h1>
```

The snippet is able to check its `snippetParameters` for the `key` value and make decisions about
what to do based on that value. You can also use multiple parameters by using an ampersand.

```html
<h1 data-vain="my-awesome-snippet?a=2&b=3&c=1">Hi mom!</h1>
```

In the above example the `snippetParameters` will contain "2" at "a", "3" at key "b", and 1 at
key "c".

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
* **router(viewsFolder)** - The vain router, which will work for any HTML file under your viewsFolder specified
  when you create the router. Should be the last router in the chain.

## Who am I?

My name is **Matt Farmer**. I'm a Software Engineer in Atlanta, GA, hacking on things for
[Elemica](http://elemica.com) by day, and hacking on my own things for [Crazy Goat Creative](http://crazygoatcreative.com)
by night. You can read my thoughts on my blog, [Farmdawg Nation](http://farmdawgnation.com),
and follow my 140-character mindstream, [@farmdawgnation](http://twitter.com/farmdawgnation).
