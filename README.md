mcomponent
==========

Code running in production, documentation just started? Story of my life.

Introduction
============

mcomponent is a compiling template engine for Javascript. 

mcomponent allows you write views in a way similar to JSP, but instead of running on the server, mcomponent is running in the Javascript VM (for example, the web browser).

This allows you to change model, render again. Or sort a list of articles from lowest to highest price instead of by name and render again, without reloading the page.

It is inspired by Struts 2.0 JSP tag library, but has expanded into more than that.

* Supports all major browsers.
* Supports Node.
* It is very simple to use, simply setup, simple syntax and any errors are shown directly in the rendering result/DOM.
* It is quite powerful and exposes some really useful functionality.
* You are in control, nothing is done automagically.
* It is pretty fast. All views are compiled to Javascript code which is then compiled by the VM.

Installation and usage
======================

In the browser
--------------

Just download __mcomponent.js__ (from __./src/__) and include it in your web page.

```html
	<script src="mcomponent.js"></script>
```

__mcomponent.js__ exposes a method _mcomponent()_ to global namespace. 

```js
	var c = mcomponent();
```

To use mcomponent with jQuery, just include __mcomponent-jquery.js__ as well, and you will get a jQuery-function. 

```js
	var component = $().mcomponent();
```

In Node
-------

Just use _require_. mcomponent is available in the official NPM repo.

```bash
	$ npm install mcomponent
```

Then in the Javascript code:

```js
	var mcomponent = require("mcomponent");
```

Development vs production
=========================

mcomponent (and its predecessor) has been in active development since 2008. There are updates almost weekly, but still no official release.

__Should I run it in production?__

Probably not. We do, with 2 million unique visitors each month, so it is working nicely.
But when problems arise, we know our way around mcomponent and make additions and updates.

I am, however, expecting to be able to make an official release soon.

__What is left?__

Mostly error handling and error reporting. When something goes wrong, the user should know exactly what, why and where. We have come a long way, but I think there are still some improvements that can be made.

Tutorial
========

Here is a large step by step tutorial which displays the basic functionality of mcomponent.

All of the examples are for the browser, not for Node.

All HTML and Javascript code is displayed, and the boxed "Output" is the result rendered by mcomponent.

1. Your first component
-----------------------

Ok, lets go!

```js
	var component = $().mcomponent();
```

This creates an empty component. You can't do anything useful with it yet but the constructor returns the component object which you can use to control it.

Lets move to part 2.

2. Adding a view
----------------

The view defines how the result will look. It does not contain any data, only tags that defines how the data should be displayed.

First we create a view using a script tag.

```html
	<script id="myView" type="text/view">
		Yay, I am a view!
	</script>
```

Since we are using jQuery, we can use ordinary CSS selector to specify what view to use.

```js
	var component = $("#myView").mcomponent();
```

However, you don't have to use CSS selector for this. You can set the view in several ways. Here are a few examples.

```js
	var c1 = $("#myView").mcomponent();
	var c2 = $().mcomponent({ viewHtml : $("#myView").html() });
	var c3 = $().mcomponent({ viewHtml : "Username:{{ username }}" });
	var c4 = $().mcomponent();
	c4.setViewWithHtml($("#myView").html());
```

You can also copy the view from another component. See the reference manual.

We are still not seeing anything on the web page so..

3. Lets render it!
------------------

When we render the component, we want to place the result somewhere on our place. This place is called a placeholder.

This placeholder is a HTML node in the DOM to which we will render the component.

You can place this placeholder where ever you want in the DOM, as long as it exists when you assign it to the component.

You can assign it at construction, or later. Just do it before you render.

```html
	<div id="myPlaceHolder"></div>
```

Then add the view...

```html
	<script id="myView" type="text/html">
		Yay, I am a view!
	</script>
```

And create and render the component.

```js
	var component = $("#myView").mcomponent({placeHolderId:"myPlaceHolder"});
	component.render();
```

__Output:__

	Yay, I am a view!

We have now actually rendered something to the page!

Still, we could just do that with static HTML. Yes, so lets…

4. Add a model
--------------

MVC stands for model, view, controller, but we still don't have a model. So lets add a one!

Also, we will want to display properties of the model. This is done using the 'show' tag, which we will introduce to our view now.

First the placeholder.

```html
	<div id="myPlaceHolder"></div>
```

Now we create our new view. Notice that we use the {{ .. }} syntax to create tags, and that we use the 'show' tag.

```html
	<script id="myView" type="text/view">
		id:{{ show id }}, username:{{ show username }}, email:{{ show email }}
	</script>
```

You can omit the "show" tag if you want.

```html
	<script id="myView" type="text/view">
		id:{{ id }}, username:{{ username }}, email:{{ email }}
	</script>
```

If the first word in the tag doesn't match a known tag type, it will try to look that word up on the model instead. 

	{{ username }}

This is how we display values on the model usually. "show" is used when you want to display a property whos name is a keyword. For example if, show, iter.

Lets say you have model.show = true.

```html
	<script id="myView" type="text/view">
		id:{{ show }} // Will not work, since "show" is a tag and we're missing the parameter!
		id:{{ show show }} // Yay, works!
	</script>
```

Anyway, lets continue.

Finally, create a user object, add it to the component and render!

```js
	var user = { 
		id:5, 
		username:"superkiller2k", 
		email:"superkiller2k@superkiller.com"
	};
	
	var component = $("#myView").mcomponent({
		model:user, 
		placeHolderId:"myPlaceHolder"
	});
	
	component.render();
```

__Output:__

	id:5, username:superkiller2k, email:superkiller2k@superkiller.com
	
But what if we have more than one user?

5. Our first iterator
---------------------

The iterator tag is used to iterate over lists of things. For this example, we want to make a list of users.

As usual, we start with the placeholder.

```html
	<div id="myPlaceHolder"></div>
```

Then we add the view. Note that we use the 'iter' tag here. It will repeat everything between 'iter' and 'enditer' once for every element in the list.

```html
	<script id="myView" type="text/view">
		{{ iter userList }}
			id:{{ show id }}, username:{{ show username }}, email:{{ show email }}
		{{ enditer }}
	</script>
```
	
And lets add a model which contains of a list of users and render it.


```js
	var model = {
		userList: [
			{ 
				id:0, 
				username:"superkiller2k", 
				email:"superkiller2k@superkiller.com"
			},
			{ 
				id:1, 
				username:"megadude", 
				email:"megadude@mega.com"
			},
			{ 
				id:2, 
				username:"maximus", 
				email:"maximus@maximus124.com"
			},
		];
	};
 
	var component = $("#myView").mcomponent({
		model:model, 
		placeHolderId:"myPlaceHolder"
	});

	component.render();
```

__Output:__

	id:0, username:superkiller2k, email:superkiller2k@superkiller.com
	id:1, username:megadude, email:megadude@mega.com
	id:2, username:maximus, email:maximus@maximus124.com

6. Our first if case
--------------------

What if we don't want to list all users? Maybe only all the girls. Which is a common task for so many dating sites out there.

Lets use the if tag! If tags ends with endif tags. Objects available in the condition are this, model and context.

```html
	<div id="myPlaceHolder"></div>
```

And next we add the view. Note that we use the 'if' tag inside of 'iter' now.

The condition can use model to access the properties of the current user.

```html
	<script id="myView" type="text/view">
		{{ iter userList }}
		{{ if (model.female) }}
			id:{{ show id }}, username:{{ show username }}, email:{{ show email }}
			{{ endif }}
		{{ enditer }}
		</script>
```

And then we add a list of users as the model again.

We add a boolean property called 'female'. And then render the component.

```js
	var model = {
		userList: [
			{ 
				id:0, 
				female:true, 
				username:"superkiller2k", 
				email:"superkiller2k@superkiller.com"
			},
			{ 
				id:1, 
				female:false, 
				username:"megadude", 
				email:"megadude@mega.com"
			},
			{ 
				id:2, 
				female:true, 
				username:"maximus", 
				email:"maximus@maximus124.com"
			},
		];
	};
 
	var component = $("#myView").mcomponent({
		model:model, 
		placeHolderId:"myPlaceHolder"
	});
	
	component.render();
```
	
__Output:__

	id:0, username:superkiller2k, email:superkiller2k@superkiller.com
	id:2, username:maximus, email:maximus@maximus124.com


More coming!
===========

We need to go over more things.

__Tags__

* show
* js
* showjs
* niter

__Other stuff__

* model.property vs property only.
* globals
* context
* The model stack
