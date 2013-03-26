function assertEqualsQunit(real, expected, message) {
    if (message) {
        assertEquals(message, expected, real);
    } else {
        assertEquals(expected, real);
    }
}

function assertTrueQunit(real, message) {
    if (message) {
        assertTrue(message, real);
    } else {
        assertTrue(real);
    }
}

function assertStringQunit(v, msg) {
    if (msg) assertString(msg, v);
    else assertString(v);
}

function assertExceptionQunit(f, msg) {
    if (msg) assertException(msg, f);
    else assertException(f);
}

TestCase("Startup", {

    "test mcomponent up and running" : function() {
        assertFunction("mcomponent is available in global scope.", mcomponent);
        assertEquals("mcomponent is a function.", "function", typeof mcomponent);
    }

});

TestCase("Compiled", {

    "test component with empty view renders empty result" : function() {
        var c = mcomponent({ model : {}, viewHtml : "" });
        assertEquals("", c.assert.assertRender());
    },

    "test component with HTML and model, no tags" : function() {
        var c = mcomponent({
            model : {name : "must"},
            viewHtml : "hohoho"
        });
        assertEquals("hohoho", c.assert.assertRender());
    },

    "test component with HTML and a property tag" : function() {
        var c = mcomponent({
            model : {name : "must"},
            viewHtml : "hoho{{ name }}haha"
        });
        assertEquals("hohomusthaha", c.assert.assertRender());
    },

    "test component with a property tag" : function() {
        var c = mcomponent({
            model : {name : "must"},
            viewHtml : "{{ name }}"
        });
        assertEquals("must", c.assert.assertRender());
    },

    "test component with a show tag" : function() {
        var c = mcomponent({
            model : {name : "must"},
            viewHtml : "{{ show name }}"
        });
        assertEquals("must", c.assert.assertRender());
    },

    "test push tag and property tag when pushed model is on top of stack" : function() {
        var c = mcomponent({
            model : {name : "must", hair : {color : "black", styling : "awesome"}},
            viewHtml : "{{ push hair }}{{ color }}{{ endpush }}"
        });
        assertEquals("black", c.assert.assertRender());
    },

    "test show name is must even with push and no specified name" : function() {
        var c = mcomponent({
            model : {name : "must"},
            viewHtml : "{{ push name }}{{ show }}{{ endpush }}"
        });
        assertEquals("must", c.assert.assertRender());
    },

    "test If tag that evaluates to true and uses model and outputs simple HTML" : function() {
        var c = mcomponent({
            model : {name : "must"},
            viewHtml : "oh{{ if model.name == 'must' }}yes{{ endif }}"
        });
        assertEquals("ohyes", c.assert.assertRender());
    },

    "test If tag that evaluates to false and uses model and outputs simple HTML" : function() {
        var c = mcomponent({
            model : {name : "mattias"},
            viewHtml : "oh{{ if model.name == 'must' }}yes{{ endif }}"
        });
        assertEquals("oh", c.assert.assertRender());
    },

    "test If tag with else case that evaluates to true" : function() {
        var c = mcomponent({
            model : {name : "must"},
            viewHtml : "oh{{ if model.name == 'must' }}yes{{ else }}no{{ endif }}"
        });
        assertEquals("ohyes", c.assert.assertRender());
    },

    "test If tag with else case that evaluates to false" : function() {
        var c = mcomponent({
            model : {name : "mattias"},
            viewHtml : "oh{{ if model.name == 'must' }}yes{{ else }}no{{ endif }}"
        });
        assertEquals("ohno", c.assert.assertRender());
    },

    "test log tag doesn't output any result" : function() {
        var c = mcomponent({
            model : {name : "must"},
            viewHtml : "{{ log 'hej' }}"
        });
        assertEqualsQunit("", c.assert.assertRender());
    },

    "test setglobal tag doesn't render any result" : function() {
        var c = mcomponent({ viewHtml : "{{ setglobal aGlobal 'hej' }}" });
        assertEquals("", c.assert.assertRender());
    },

    "test js doesn't render to result" : function() {
        var c = mcomponent({
            viewHtml : "{{ js 'hej' }}"
        });
        assertEquals("", c.assert.assertRender());
    },

    "test showjs does render to result" : function() {
        var c = mcomponent({
            viewHtml : "{{ showjs 'hej' }}"
        });
        assertEquals("hej", c.assert.assertRender());
    },

    "test when context is empty, should return empty result." : function() {
        var c = mcomponent({
            model : {name : "must"},
            viewHtml : "{{ context name }}",
            throwOnError : true
        });
        assertException(function() {
            c.assert.assertRender();
        });
    },

    "test iter tag" : function() {

        var c;
        var result;

        c = mcomponent({
            model : { list : ["mattias", "marcus", "johan"] },
            viewHtml : "{{ iter list }}{{ enditer }}"})
        ;

        assertEqualsQunit(c.assert.assertRender(), "", "Should contain nothing.");

        c = mcomponent({
            model : { list : ["mattias", "marcus", "johan"] },
            viewHtml : "{{ iter list }}{{ show }}{{ enditer }}"})
        ;

        assertEqualsQunit(c.assert.assertRender(), "mattiasmarcusjohan", "Should contain mattiasmarcusjohan.");


        c = mcomponent({
            model : { list : [
                {name : "mattias", nums : [1, 2, 3]},
                {name : "marcus", nums : [4, 5, 6]},
                {name : "johan", nums : [9, 8, 7]}
            ] },
            viewHtml : "{{ iter list }}{{ show name }}{{ iter nums }}{{ show }}{{ enditer }}{{ enditer }}"})
        ;

        assertEqualsQunit(c.assert.assertRender(), "mattias123marcus456johan987", "Should contain mattiasmarcusjohan.");

        /***
         * Larger view
         */

        c = mcomponent({viewHtml : "{{ if (this.model) }}yay1" +
            "{{ if (this.model.users) }}yay2" +
            "{{ endif }}" +
            "{{ endif }}",
            model : {
                users : [
                    {name : "Mattias", isMale : true, age : 31},
                    {name : "Must", isMale : true, age : 28},
                    {name : "Jenny", isMale : false, age : 27}
                ],
                location : {
                    city : {name : "G?teborg"},
                    country : {name : "Sweden"}
                }
            },
            iter : {users : {}}});

        assertStringQunit(result = c.assert.assertRender(), "Rendering of large view should be OK!");
        assertEqualsQunit(result, "yay1yay2", "And the result should be correct.");

        c = mcomponent({viewHtml : "{{ if (this.model) }}yay1" +
            "{{ if (this.model.users) }}yay2" +
            "{{ iter users }}" +
            "Name:{{ name }}" +
            "Male:{{ if (this.model.isMale) }}Yes{{ else }}No{{ endif }}" +
            "Age:{{ age }}" +
            "{{ enditer }}" +
            "{{ endif }}" +
            "{{ endif }}",

            model : {
                users : [
                    {name : "Mattias", isMale : true, age : 31},
                    {name : "Must", isMale : true, age : 28},
                    {name : "Jenny", isMale : false, age : 27}
                ],
                location : {
                    city : {name : "G?teborg"},
                    country : {name : "Sweden"}
                }
            },
            iter : {users : {}}});

        result = c.assert.assertRender();
        assertEquals("And the result should be correct.", "yay1yay2Name:MattiasMale:YesAge:31Name:MustMale:YesAge:28Name:JennyMale:NoAge:27", result);

    },

    "test niter tag" : function() {

        var c;

        assertException(function() {
            c = mcomponent({
                model : {
                    list : ["mattias", "marcus", "johan"]
                }, viewHtml : "{{ niter userListIter list }}{{ endniter }}",
                throwOnError : true
            })
        });

        assertException("Should throw error since we haven't declared an iterator configuration.", function() {
            c.assert.assertRender();
        });

        c = mcomponent({
            model : { list : ["mattias", "marcus", "johan"]},
            iter : {
                userListIter : { itemsPerPage : 1 }
            },
            viewHtml : "{{ niter userListIter list }}{{ endniter }}"});

        assertEquals("Should contain nothing.", "", c.assert.assertRender());

        var a, b, i;

        c = mcomponent({
            model : {list : ["mattias", "marcus", "johan"]},
            iter : {
                userListIterYeah : {
                    itemsPerPage : 1
                }
            },
            viewHtml : "{{ niter userListIterYeah list }}{{ show }}{{ endniter }}"});
        assertEquals("Should first element only since itemsPerPage is 1.", "mattias", c.assert.assertRender());

        c = mcomponent({
            model : {list : ["mattias", "marcus", "johan"]},
            iter : {
                userListIterYeah : {
                    itemsPerPage : 1,
                    whenAllItemsAreShowing : function() {
                        a = 5;
                    }
                }
            },
            viewHtml : "{{ niter userListIterYeah list }}{{ show }}{{ endniter }}"});
        assertEquals("Should first element only.", "mattias", c.assert.assertRender());

        a = 3;
        assertObject("Should be able to get iterator context.", i = c.getIterator("userListIterYeah"));
        assertEquals("Trying to get iterator context that doesn't exist should return undefined.", undefined, c.getIterator("userListIterYeahASFSA"));
        assertEquals("a should be 3 first.", 3, a);
        i.showAllItems();
        assertEquals("Should show all elements.", "mattiasmarcusjohan", c.assert.assertRender());
        assertEquals("a should now be 5 since callback changed the value.", 5, a);

        a = 3;
        b = 1;
        c = mcomponent({
            model : {list : ["mattias", "marcus", "johan"]},
            iter : {
                userListIterYeah : {
                    itemsPerPage : 1,
                    whenAllItemsAreShowing : function() {
                        a = 5;
                    },
                    whenNotAllItemsAreShowing : function() {
                        b = 2;
                    }
                }
            },
            viewHtml : "{{ niter userListIterYeah list }}{{ show }}{{ endniter }}"});
        assertEqualsQunit(b, 1, "b should be 1 first.");
        assertEqualsQunit(c.assert.assertRender(), "mattias", "Should first element only.");
        assertEqualsQunit(b, 2, "b should be 2 after whenNotAllItemsAreShowing has been run.");
        assertObject("Should be able to get iterator context.", i = c.getIterator("userListIterYeah"));
        i.showMoreItems();
        assertEqualsQunit(c.assert.assertRender(), "mattiasmarcus", "Should contain one more element.");
        assertEqualsQunit(a, 3, "a should be 3 first.");
        i.showMoreItems();
        assertEqualsQunit(c.assert.assertRender(), "mattiasmarcusjohan", "Should contain all three elements.");
        assertEqualsQunit(a, 5, "a should now be 5 since callback changed the value.");
        i.showMoreItems();
        assertEqualsQunit(c.assert.assertRender(), "mattiasmarcusjohan", "Should contain all three elements again.");

        a = 3;

        c = mcomponent({
            model : {list : ["mattias", "marcus", "johan"]},
            iter : {
                userListIterYeah : {
                    itemsPerPage : 1,
                    whenAllItemsAreShowing : function() {
                        a = 5;
                    }
                }
            },
            viewHtml : "{{ niter userListIterYeah list }}{{ show }}{{ endniter }}"});
        assertEqualsQunit(c.assert.assertRender(), "mattias", "Should first element only.");
        assertObject("Should be able to get iterator context.", i = c.getIterator("userListIterYeah"));
        assertEqualsQunit(c.getIterator("userListIterYeahASFSA"), undefined, "Trying to get iterator context that doesn't exist should return undefined.");
        assertEqualsQunit(a, 3, "a should be 3 first.");
        i.showAllItems();
        assertEqualsQunit(c.assert.assertRender(), "mattiasmarcusjohan", "Should show all elements.");
        assertEqualsQunit(a, 5, "a should now be 5 since callback changed the value.");

    }

});

TestCase("Execution scope", {

    "test component and execution context have same id using component.assert" : function() {
        assertTrue(mcomponent({viewHtml : ""}).assert.assertComponentIdEqualsExecutionContextId());
    },

    "test component and execution context have same id using api._assert" : function() {
        var a = mcomponent({viewHtml : "{{ showjs api._assert.componentIdEqualsExecutionContextId() }}"});
        assertEqualsQunit("true", a.assert.assertRender());
    },

    "test child count from execution context is increased correctly by rendering the value" : function() {
        var a = mcomponent({viewHtml : "a {{ showjs api._assert.getExecutionContext().getChildCount() }}"});
        assertEquals("a 0", a.assert.assertRender());
        a.addChild("b", mcomponent({viewHtml : "b"}));
        assertEquals("a 1", a.assert.assertRender());
    },

    "test Execution context scope" : function() {

        /**
         * When having children and setting view with other component, ensure that components still have their own execution context.
         */

        var a, b, c, d;

        // Test setViewFromComponent first.

        a = mcomponent({id : 1, viewHtml : "a {{ showjs api._assert.componentIdEqualsExecutionContextId() }}"});
        b = mcomponent({id : 2, viewHtml : "b {{ showjs api._assert.componentIdEqualsExecutionContextId() }}"});

        assertTrueQunit(a.assert.assertComponentIdEqualsExecutionContextId(), "Correct execution context.");
        assertEqualsQunit(a.assert.assertRender(), "a true", "");

        assertEqualsQunit(b.assert.assertRender(), "b true", "");
        assertTrueQunit(b.assert.assertComponentIdEqualsExecutionContextId(), "Correct execution context.");

        b.setViewFromComponent(a);
        assertEqualsQunit(b.assert.assertRender(), "a true", "");
        assertTrueQunit(b.assert.assertComponentIdEqualsExecutionContextId(), "Correct execution context.");

        assertTrueQunit(a._.getId() !== b._.getId(), "Components must not have same id.");
        assertTrueQunit(a._.getExecutionContext().id !== b._.getExecutionContext().id, "Execution contexts must not have same id.");

        // OK

        assertObject("Creating child.", a = mcomponent({viewHtml : "a {{ showjs api._assert.componentIdEqualsExecutionContextId() }} {{ component c }}"}));
        assertTrueQunit(a.assert.assertComponentIdEqualsExecutionContextId(), "Correct execution context.");

        assertObject("Creating child.", c = mcomponent({viewHtml : "c {{ showjs api._assert.componentIdEqualsExecutionContextId() }}"}));
        assertEqualsQunit(c.assert.assertRender(), "c true", "");
        assertTrueQunit(c.assert.assertComponentIdEqualsExecutionContextId(), "Correct execution context.");

        assertObject("Creating child.", b = mcomponent({viewHtml : "b"}));
        assertEqualsQunit(b.assert.assertRender(), "b", "Should be b");
        assertTrueQunit(b.assert.assertComponentIdEqualsExecutionContextId(), "Correct execution context.");

        // Test children count with API assertion

        b.setViewWithHtml("ok{{ js api._assert.childCount(0) }}");
        assertTrueQunit(b.assert.assertComponentIdEqualsExecutionContextId(), "Correct execution context.");
        assertTrueQunit(b.assert.assertRender() == "ok", "Should have no children in execution context.");
        assertObject("Adding child", b);
        b.addChild("c", c);
        assertObject("Child should now exist in b-parent.", b.getChild("c"));
        assertTrue("Correct execution context.", b.assert.assertComponentIdEqualsExecutionContextId());
        assertTrue("Should have 1 children in execution context.", b.assert.assertRender() !== "ok");

        // Test with API assertion, but with viewFromComponent

        assertObject("Creating child.", d = mcomponent({viewHtml : "ok{{ js api._assert.childCount(1) }}"}));
        b.setViewFromComponent(d);
        assertTrueQunit(b.assert.assertRender() == "ok", "Should have 1 child in execution context.");
        // TODO: Test equal id for context and component.

        // Test with real view with {{ component .. }}

        b.setViewFromComponent(a);
        assertEqualsQunit(b.assert.assertRender(), "a true c true", "Should be ac with new view and child.");
        assertTrueQunit(b.assert.assertComponentIdEqualsExecutionContextId(), "Correct execution context.");

    }
});
