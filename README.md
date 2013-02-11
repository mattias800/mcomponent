mcomponent
==========

Code running in production, documentation just started? Story of my life.

A compiling template engine for Javascript inspired by Struts 2.


mcomponent.js vs mcomponent-jquery.js
-------------------------------------

mcomponent.js exposes a method __mcomponent()__ to global namespace.


Include mcomponent-jquery.js as well, and you will get a jQuery-function __$.mcomponent__. 

This is what we will demonstrate in the tutorial.

Tutorial
========

Here is a large step by step tutorial which displays the basic functionality of mcomponent.


All HTML and Javascript code is displayed, and the boxed "Output" is the result rendered by mcomponent.

1. Your first component
-----------------------

Ok, lets go!

```
	var component = $().mcomponent();
```

This creates an empty component. You can't do anything useful with it yet but the constructor returns the component object which you can use to control it.

Lets move to part 2.

2. Adding a view
----------------

The view defines how the result will look. It does not contain any data, only tags that defines how the data should be displayed.

First we create a view using a script tag.

```
	<script id="myView" type="text/view">
		Yay, I am a view!
	</script>
```

Since we are using jQuery, we can use ordinary CSS selector to specify what view to use.

```
	var component = $("#myView").mcomponent();
```

However, you don't have to use CSS selector for this. You can set the view in several ways. Here are three examples.

```js
	var c1 = $("#myView").mcomponent();
	var c2 = $().mcomponent(viewHtml:$("#myView").html());
	var c3 = $().mcomponent();
	c3.setViewWithHtml($("#myView").html());
```

You can also copy the view from another component. See the reference manual.

We are still not seeing anything on the web page so..

3. Lets render it!
------------------

When we render the component, we want to place the result somewhere on our place. This place is called a placeholder.

This placeholder is a HTML node in the DOM to which we will render the component.

You can place this placeholder where ever you want in the DOM, as long as it exists when you assign it to the component.

You can assign it at construction, or later. Just do it before you render.

```
	<div id="myPlaceHolder"></div>
```

Then add the view...

```
	<script id="myView" type="text/html">
		Yay, I am a view!
	</script>
```

And create and render the component.

```
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

```
	<div id="myPlaceHolder"></div>
```

Now we create our new view. Notice that we use the {% .. %} syntax to create tags, and that we use the 'show' tag.

```
	<script id="myView" type="text/view">
		id:{% show id %}, username:{% show username %}, email:{% show email %}
	</script>
```

Finally, create a user object, add it to the component and render!

```
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

```
	<div id="myPlaceHolder"></div>
```

Then we add the view. Note that we use the 'iter' tag here. It will repeat everything between 'iter' and 'enditer' once for every element in the list.

```
	<script id="myView" type="text/view">
		{% iter userList %}
			id:{% show id %}, username:{% show username %}, email:{% show email %}
		{% enditer %}
	</script>
```
	
And lets add a model which contains of a list of users and render it.



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

	<div id="myPlaceHolder"></div>

And next we add the view. Note that we use the 'if' tag inside of 'iter' now.

The condition can use model to access the properties of the current user.

	<script id="myView" type="text/view">
		{% iter userList %}
		{% if (model.female) %}
			id:{% show id %}, username:{% show username %}, email:{% show email %}
			{% endif %}
		{% enditer %}
		</script>

And then we add a list of users as the model again.

We add a boolean property called 'female'. And then render the component.

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
	
__Output:__

	id:0, username:superkiller2k, email:superkiller2k@superkiller.com
	id:2, username:maximus, email:maximus@maximus124.com


