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

if (typeof mcomponent === "function") {

    TestCase("General", {

        "test Lookup" : function() {

            var c;

            c = mcomponent();

            assertEquals("Should lookup 'username' properly.", "butters", c.assert.assertLookup("username", {username : "butters"}));
            assertEquals("Should lookup 'user.username' properly.", "butters", c.assert.assertLookup("user.username", {user : {username : "butters"}}));
            assertEquals("Should lookup 'user.name.first' properly.", "mattias", c.assert.assertLookup("user.name.first", {user : {name : {first : "mattias", last : "andersson"}}}));
            assertEquals("Should lookup 'user.name.last' properly.", "andersson", c.assert.assertLookup("user.name.last", {user : {name : {first : "mattias", last : "andersson"}}}));
            assertTrue("Should lookup 'user.name' object properly.", c.assert.assertLookup("user.name", {user : {name : {first : "mattias", last : "andersson"}}}).first == "mattias");
            assertTrue("Should lookup 'user.name' object properly.", c.assert.assertLookup("user.name", {user : {name : {first : "mattias", last : "andersson"}}}).last == "andersson");

            assertEquals("Should lookup 'user.name.first' object properly.", "mattias", c.assert.assertLookup("user.name.first", {user : {name : {first : "mattias", last : "andersson"}}}));
            assertEquals("Should lookup 'user.name.first' should be undefined.", undefined, c.assert.assertLookup("user.name.first", {user : {name : {first : undefined, last : "andersson"}}}));

            assertException("Looking up 'user.name.problem' should fail.", function() {
                c.assert.assertLookup("user.name.problem.test.hej", {user : {name : undefined}})
            });

            assertException("Looking up 'user.name.problem' should fail since model is undefined.", function() {
                c.assert.assertLookup("user.name.problem.test.hej", undefined)
            });


        },

        "test Lookup with parent model" : function() {

            var c;

            c = mcomponent({
                model : {
                    user : {
                        name : "mattias",
                        awesome : true
                    },
                    location : {
                        country : "Sweden"
                    }
                },
                viewHtml : "{{ push user }}{{ name }}{{ location.country }}{{ endpush }}"
            });

            assertEquals("Should lookup 'name' and 'location.country' properly since it will iterate over the stack and find location and then country.", "mattiasSweden", c.assert.assertRender());

            assertEquals("No parent model prefixes.", 0, c.assert.assertFindParentPrefixCount("username"));
            assertEquals("No parent model prefixes, name is username.", "username", c.assert.assertFindParentPrefixName("username"));

            assertEquals("Parent prefixes = 1", 1, c.assert.assertFindParentPrefixCount("../username"));
            assertEquals("No parent model prefixes, name is username.", "username", c.assert.assertFindParentPrefixName("../username"));

            assertEquals("Parent prefixes = 2", 2, c.assert.assertFindParentPrefixCount("../../username"));
            assertEquals("No parent model prefixes, name is username.", "username", c.assert.assertFindParentPrefixName("../username"));

            c = mcomponent({
                model : {
                    user : {
                        name : "mattias",
                        awesome : true,
                        location : {
                            country : "Awesomeland"
                        }
                    },
                    location : {
                        country : "Sweden"
                    }
                },
                viewHtml : "{{ push user }}{{ name }}{{ location.country }}{{ endpush }}"
            });

            assertEquals("Should lookup 'name' and 'location.country' properly since it will find location on user.", "mattiasAwesomeland", c.assert.assertRender());

            c = mcomponent({
                model : {
                    user : {
                        name : "mattias",
                        awesome : true,
                        location : {
                            country : "Awesomeland"
                        }
                    },
                    location : {
                        country : "Sweden"
                    }
                },
                viewHtml : "{{ push user }}{{ name }}{{ ../location.country }}{{ endpush }}"
            });

            assertEquals("Should lookup 'name' and 'location.country' properly since it will find location on user.", "mattiasSweden", c.assert.assertRender());

            c = mcomponent({
                model : {
                    user : {
                        name : {
                            first : "mattias"
                        },
                        awesome : true,
                        location : {
                            country : "Awesomeland"
                        }
                    },
                    location : {
                        country : "Sweden"
                    }
                },
                viewHtml : "{{ push user }}{{ push name }}{{ first }}{{ ../location.country }}{{ endpush }}{{ endpush }}"
            });

            assertEquals("Should lookup 'name' and 'location.country' properly since it will find location on user.", "mattiasAwesomeland", c.assert.assertRender());

            c = mcomponent({
                model : {
                    user : {
                        name : {
                            first : "mattias"
                        },
                        awesome : true,
                        location : {
                            country : "Awesomeland"
                        }
                    },
                    location : {
                        country : "Sweden"
                    }
                },
                viewHtml : "{{ push user }}{{ push name }}{{ first }}{{ ../../location.country }}{{ endpush }}{{ endpush }}"
            });

            assertEquals("Should lookup 'name' and 'location.country' properly since it will find location on user.", "mattiasSweden", c.assert.assertRender());

            c = mcomponent({
                model : {
                    user : {
                        name : {
                            first : "mattias"
                        },
                        awesome : true,
                        location : {
                            country : "Awesomeland"
                        }
                    },
                    location : {
                        country : "Sweden"
                    }
                },
                viewHtml : "{{ push user.name }}{{ first }}{{ ../location.country }}{{ endpush }}"
            });

            assertEquals("Should lookup 'name' and 'location.country' properly since it will find location on user.", "mattiasSweden", c.assert.assertRender());

            c = mcomponent({
                model : {
                    user : {
                        name : "mattias",
                        awesome : true,
                        location : {
                            country : "Awesomeland"
                        }
                    },
                    location : {
                        country : "Sweden"
                    }
                },
                throwOnError : true,
                viewHtml : "{{ push user }}{{ name }}{{ ../../location.country }}{{ endpush }}"
            });

            assertException("Should fail since it goes beyond stack, using compiled code.", function() {
                c.assert.assertRender();
            });

            c = mcomponent({
                model : {
                    user : {
                        name : "mattias",
                        awesome : true,
                        location : {
                            country : "Awesomeland"
                        }
                    },
                    location : {
                        country : "Sweden"
                    }
                },
                throwOnError : true,
                viewHtml : "{{ push user }}{{ name }}{{ ../../location.country }}{{ endpush }}"
            });

            assertException("Should fail since it goes beyond stack, using compiled code.", function() {
                c.assert.assertRender();
            });

            c = mcomponent({
                model : {
                    user : {
                        name : {
                            first : "mattias"
                        },
                        awesome : true,
                        location : {
                            country : "Awesomeland"
                        }
                    },
                    location : {
                        country : "Sweden"
                    }
                },
                viewHtml : "{{ push user }}{{ push ../location }}{{ country }}{{ endpush }}{{ endpush }}"
            });

            assertEquals("Using ../ with push.", "Sweden", c.assert.assertRender());


            c = mcomponent({
                model : {
                    user : {
                        name : {
                            first : "mattias"
                        },
                        locations : ["PAR", "ARN"]
                    },
                    locations : ["BCA", "GOT"]
                },
                viewHtml : "{{ push user }}{{ iter ../locations }}{{ model }}{{ enditer }}{{ endpush }}"
            });

            assertEquals("Using ../ with iter.", "BCAGOT", c.assert.assertRender());


            c = mcomponent({
                model : {
                    user : {
                        name : {
                            first : "mattias"
                        },
                        locations : ["PAR", "ARN"]
                    },
                    locations : ["BCA", "GOT"]
                },
                viewHtml : "{{ push user }}{{ push name }}{{ iter ../locations }}{{ model }}{{ enditer }}{{ endpush }}{{ endpush }}"
            });

            assertEquals("Using ../ with iter.", "PARARN", c.assert.assertRender());


            c = mcomponent({
                model : {
                    user : {
                        name : {
                            first : "mattias"
                        },
                        locations : ["PAR", "ARN"]
                    },
                    locations : ["BCA", "GOT"]
                },
                viewHtml : "{{ push user }}{{ push name }}{{ iter ../../locations }}{{ model }}{{ enditer }}{{ endpush }}{{ endpush }}"
            });

            assertEquals("Using ../../ with iter.", "BCAGOT", c.assert.assertRender());

        },

        "test Util functions" : function() {

            var c;

            c = mcomponent();

            assertEquals("Should be 'hej'", "hej", c.assert.assertGetTagParameters("if hej"));
        },

        "test Util function - getNiterParameters" : function() {

            var c;

            c = mcomponent();

            var p;

            assertObject(p = c._.getNiterParametersFromTagParameter(""));
            assertEquals(p.iterName, undefined);
            assertEquals(p.variableName, undefined);

            assertObject("Testing 'name'.", p = c._.getNiterParametersFromTagParameter("name"));
            assertEquals(p.iterName, "name");
            assertEquals(p.variableName, undefined);

            assertObject("Testing 'name userlist'.", p = c._.getNiterParametersFromTagParameter("name userlist"));
            assertEquals(p.iterName, "name");
            assertEquals(p.variableName, "userlist");

            assertObject(p = c._.getNiterParametersFromTagParameter("name userlist huh", "Testing 'name userlist huh'."));
            assertEquals(p.iterName, "name");
            assertEquals(p.variableName, "userlist huh");

        },

        "test Set view" : function() {

            var t;

            t = mcomponent();
            assertTrue("List should be empty after empty construction.", t.assert.assertListSize(0));

            t.setViewWithHtml();
            assertTrue("List should be empty after setViewWithHtml(undefined).", t.assert.assertListSize(0));

            t.setViewWithHtml("{{ name }}");
            assertTrue("List should contain one element after setViewWithHtml('{{ name }}').", t.assert.assertListSize(1));

            t = mcomponent({viewHtml : "{{ name }}"});
            assertTrue("List should contain one element after args.viewHtml = '{{ name }}'.", t.assert.assertListSize(1));

            t = mcomponent({viewHtml : "tsa{{ name }}ast"});
            assertTrue("List should contain three element after args.viewHtml = 'tsa{{ name }}ast'.", t.assert.assertListSize(3));

            t = mcomponent({viewHtml : "{{ if (this.model.name) }}{{ name }}{{ endif }}"});
            assertTrue("List should contain three element after args.viewHtml = '{{ if (this.model.name) }}{{ name }}{{ endif }}'.", t.assert.assertListSize(3));

            var t2;

            t2 = mcomponent({viewHtml : "{{ firstName }}"});
            t.setViewFromComponent(t2);

            assertTrue("List should contain one item.", t.assert.assertListSize(1));
            assertTrue("List should contain tag with name firstName ", t.assert.assertListItemHasTagName(0, "firstName"));

            t = mcomponent({viewFromComponent : t2});
            assertTrue("List should contain one item.", t.assert.assertListSize(1));
            assertTrue("List should contain tag with name firstName ", t.assert.assertListItemHasTagName(0, "firstName"));

        },

        "test Set view with special characters" : function() {
            var c;
            var v;

            v = "<div class=\"animationContainer loadingMedium\"><img src=\"/v/207/49522/system/image/animation/loading_transparent_medium.gif\" alt=\"Laddar...\" title=\"Laddar...\" hspace=\"0\" vspace=\"0\" ></div>";
            c = mcomponent({viewHtml : v});
            assertEquals(c.assert.assertRender(), v);

            v = "\t\t\t";
            c = mcomponent({viewHtml : v});
            assertEquals(c.assert.assertRender(), v);

            v = "\n\n";
            c = mcomponent({viewHtml : v});
            assertEquals(c.assert.assertRender(), v);

            v = "\r\r";
            c = mcomponent({viewHtml : v});
            assertEquals(c.assert.assertRender(), v);

            v = "\r\n\t";
            c = mcomponent({viewHtml : v});
            assertEquals(c.assert.assertRender(), v);

            v = "\n''\n";
            c = mcomponent({viewHtml : v});
            assertEquals(c.assert.assertRender(), v);

            v = '\n"\t"\n';
            c = mcomponent({viewHtml : v});
            assertEquals(c.assert.assertRender(), v);

            v = "\\ttt\\";
            c = mcomponent({viewHtml : v});
            assertEquals(c.assert.assertRender(), v);

        },

        "test Execution context" : function() {

            var c;

            c = mcomponent({viewHtml : "{{ name }}"});
            assertEquals("No model, execution stack should start empty.", 0, c._.getExecutionStackSize());
            assertTrue(c._.pushModel({test : "test"}));
            assertEquals("Pushed model, execution stack should now have one element.", 1, c._.getExecutionStackSize());

            c = mcomponent({model : {name : "mattias"}, viewHtml : "{{ name }}"});
            assertEquals("Model should be pushed to execution stack.", 1, c._.getExecutionStackSize());

        },

        "test Find block end" : function() {

            var c;

            c = mcomponent({viewHtml : "{{ name }}"});

            assertTrue("List size is 1.", c.assert.assertListSize(1));
            assertException("Not tag with block, throw exception", function() {
                c._.findBlockEnd(0)
            });


            assertException("Throws error since template is malformed.", function() {
                c = mcomponent({
                    viewHtml : "{{ if name }}",
                    throwOnError : true
                });
            });

            assertTrue("List size is 1.", c.assert.assertListSize(1));
            assertException("Exception, list is too short.", function() {
                c._.findBlockEnd(0)
            });

            c = mcomponent({viewHtml : "before{{ if aaaname }}inside{{ endif }}after"});
            assertTrue(c.assert.assertListSize(5));
            assertEquals(c._.findBlockEnd(1), 3);

            c = mcomponent({viewHtml : "{{ if supername }}test{{ endif }}"});
            assertTrue("List size is 3.", c.assert.assertListSize(3));
            assertEquals("Should find ending tag on index 2.", 2, c._.findBlockEnd(0));

            c = mcomponent();
            assertTrue(c.assert.assertSetViewAndBuildList("{{ if thename }}{{ if age }}test{{ endif }}"));
            assertTrue("List size is 4.", c.assert.assertListSize(4));
            assertException("Should not find a closing endif.", function() {
                c._.findBlockEnd(0);
            });
            assertEquals("Should find ending tag on index 3.", 3, c._.findBlockEnd(1));

            c = mcomponent({viewHtml : "{{ if name }}{{ if age }}test{{ endif }}{{ endif }}"});
            assertTrue("List size is 5.", c.assert.assertListSize(5));
            assertEquals("Should find ending tag on index 4.", 4, c._.findBlockEnd(0));
            assertEquals("Should find ending tag on index 3.", 3, c._.findBlockEnd(1));

            c = mcomponent({viewHtml : "{{ if name }}{{ push age }}test{{ endpush }}{{ endif }}"});
            assertTrue("List size is 5.", c.assert.assertListSize(5));
            assertEquals("Should find ending tag on index 4.", 4, c._.findBlockEnd(0));
            assertEquals("Should find ending tag on index 3.", 3, c._.findBlockEnd(1));

            c = mcomponent({viewHtml : "{{ if (this.model.name) }}{{ name }}{{ endif }}"});
            assertTrue("List size is 3.", c.assert.assertListSize(3));
            assertEquals("Should find ending tag on index 2.", 2, c._.findBlockEnd(0));


        },

        "test Find block end, for if cases" : function() {

            var c;

            c = mcomponent({viewHtml : "{{ if (test) }}{{ else }}{{ endif }}"});
            assertTrue("List size is 3.", c.assert.assertListSize(3));
            assertEquals("Should find 'else' tag on index 1.", 1, c._.findBlockEnd(0, {endTags : ["else", "elseif"]}));
            assertEquals("Should find 'endif' tag on index 2.", 2, c._.findBlockEnd(0, {endTags : ["else", "elseif"], startIndex : 1}));

            c = mcomponent({viewHtml : "{{ if (test) }}testtrue{{ else }}testfalse{{ endif }}"});
            assertTrue("List size is 5.", c.assert.assertListSize(5));
            assertEquals("Should find 'else' tag on index 1.", 2, c._.findBlockEnd(0, {endTags : ["else", "elseif"]}));
            assertEquals("Should find 'endif' tag on index 2.", 4, c._.findBlockEnd(0, {endTags : ["else", "elseif"], startIndex : 2}));

            c = mcomponent({viewHtml : "{{ if (test) }}{{ elseif (test2) }}{{ else }}{{ endif }}"});
            assertTrue(c.assert.assertListSize(4));
            assertEquals(1, c._.findBlockEnd(0, {endTags : ["else", "elseif"]}));
            assertEquals(2, c._.findBlockEnd(0, {endTags : ["else", "elseif"], startIndex : 1}));
            assertEquals(3, c._.findBlockEnd(0, {endTags : ["else", "elseif"], startIndex : 2}));

            c = mcomponent({viewHtml : "{{ if (test) }}testIsTrue{{ elseif (test2) }}test2IsTrue{{ else }}neitherIsTrue{{ endif }}"});
            assertTrue(c.assert.assertListSize(7));
            assertEquals(2, c._.findBlockEnd(0, {endTags : ["else", "elseif"]}));
            assertEquals(4, c._.findBlockEnd(0, {endTags : ["else", "elseif"], startIndex : 2}));
            assertEquals(6, c._.findBlockEnd(0, {endTags : ["else", "elseif"], startIndex : 4}));

        }
    });

    TestCase("Syntax tree", {

        "test General" : function() {

            var c;

            c = mcomponent({viewHtml : "{{ push age }}test{{ endpush }}"});
            assertEquals("Root contains only one element.", 1, c._.getTree().length);
            assertEquals("First root tag should be push tag.", "push", c._.getTree()[0].tagName);
            assertEquals("Second level should be HTML 'test'.", "test", c._.getTree()[0].content[0].html);

            c = mcomponent({viewHtml : "{{ if (name) }}{{ push age }}test{{ endpush }}{{ endif }}"});
            assertEquals("Root contains only one element.", 1, c._.getTree().length);
            assertEquals("First root tag should be if tag.", "if", c._.getTree()[0].tagName);
            assertEquals("Second level should be a push.", "push", c._.getTree()[0].content[0].tagName);
            assertEquals("Second level should be HTML 'test'.", "test", c._.getTree()[0].content[0].content[0].html);

        },

        "test if, elseif, else tags" : function() {

            var c;

            c = mcomponent({viewHtml : "{{ if (true) }}1{{ else }}2{{ endif }}"});
            assertTrue("List size is 5.", c.assert.assertListSize(5));
            assertEquals("Only one condition in if case.", 1, c._.getTree()[0].conditions.length);
            assertEquals("Only one conditioned root.", 1, c._.getTree()[0].contentRoots.length);
            assertEquals("Only one element in the true-conditioned root.", 1, c._.getTree()[0].contentRoots[0].length);
            assertEquals("True case contains '1'.", 1, c._.getTree()[0].contentRoots[0][0].html);
            assertEquals("Else contains one element", 1, c._.getTree()[0].elseContent.length);
            assertEquals("Else contains '2'.", 2, c._.getTree()[0].elseContent[0].html);

            c = mcomponent({viewHtml : "{{ if (true) }}1{{ if (false) }}2{{ endif }}{{ endif }}"});
            assertTrue("List size is 6.", c.assert.assertListSize(6));
            assertEquals("Should find outer 'endif' tag on index 5.", 5, c._.findBlockEnd(0, {endTags : ["else", "elseif"]}));
            assertEquals("Should find inner 'endif' tag on index 4.", 4, c._.findBlockEnd(2, {endTags : ["else", "elseif"]}));
            assertEquals("Only one condition on outer if case.", 1, c._.getTree()[0].conditions.length);
            assertEquals("Only one content list also, on outer if case.", 1, c._.getTree()[0].contentRoots.length);
            assertEquals("No else content on outer if case.", 0, c._.getTree()[0].elseContent.length);
            assertEquals("Content for outer if case should have two elements. '1' and inner if.", 2, c._.getTree()[0].contentRoots[0].length);
            assertEquals("First content element is HTML '1'.", "1", c._.getTree()[0].contentRoots[0][0].html);
            assertEquals("Second content element is 'if' tag", "if", c._.getTree()[0].contentRoots[0][1].tag.tagName);

        }
    });

    TestCase("Execution", {

        "test lookup from models not on top of stack" : function() {

            var c;

            c = mcomponent({
                model : {
                    photos : {
                        list : ["test1", "test2"],
                        length : 2
                    }},
                viewHtml : "ok{{ push photos }}{{ length }}{{ iter photos.list }}{{ show }}{{ enditer }}{{ endpush }}"
            });
            assertEquals("Should contain 'ok2test1test2', all lookups should be ok.", "ok2test1test2", c.assert.assertRender());

            c = mcomponent({
                model : {
                    data : {
                        photos : {
                            list : ["test1", "test2"],
                            length : 2
                        }
                    }
                },
                viewHtml : "ok{{ push data }}{{ push data.photos }}{{ length }}{{ iter photos.list }}{{ show }}{{ enditer }}{{ endpush }}{{ endpush }}"
            });
            assertEquals("Pushing model that is not on top of stack should work. Should contain 'ok2test1test2', all lookups should be ok.", "ok2test1test2", c.assert.assertRender());

            c = mcomponent({
                model : {
                    data : {
                        photos : {
                            list : ["test1", "test2"],
                            length : 2
                        }
                    }
                },
                viewHtml : "ok{{ push data }}{{ push data.photos }}{{ length }}{{ iter data.photos.list }}{{ show }}{{ enditer }}{{ endpush }}{{ endpush }}"
            });
            assertEquals("Pushing model that is not on top of stack should work. Should contain 'ok2test1test2', all lookups should be ok.", "ok2test1test2", c.assert.assertRender());

        },

        "test if tag" : function() {

            var c;

            c = mcomponent({viewHtml : "heyhey"});
            assertEquals("Should contain 'heyhey', have no tags.", "heyhey", c.assert.assertRender());

            c = mcomponent({viewHtml : "{{ if (true) }}baibai{{ endif }}"});
            assertEquals("Root contains only one element.", 1, c._.getTree().length);
            assertEquals("First root tag should be if tag.", "if", c._.getTree()[0].tagName);
            assertEquals("Second level should be HTML 'baibai'.", "baibai", c._.getTree()[0].content[0].html);
            assertEquals("Should contain 'baibai', since if case is true.", "baibai", c.assert.assertRender());

            c = mcomponent({viewHtml : "{{ if (true) }}1{{ if (true) }}2{{ endif }}{{ endif }}"});
            assertTrue("Root contains 6 elements.", c.assert.assertListSize(6));
            assertEquals("Root contains 1 elements.", 1, c._.getTree().length);
            assertEquals("First root tag should be if tag.", "if", c._.getTree()[0].tagName);
            assertEquals("Second level should be HTML '1'.", "1", c._.getTree()[0].content[0].html);
            assertEquals("Second level should also have an if tag 1.", "if", c._.getTree()[0].content[1].tagName);
            assertEquals("Should contain '12', since both if cases are true.", "12", c.assert.assertRender());

            c = mcomponent({viewHtml : "{{ if (true) }}1{{ if (false) }}2{{ endif }}{{ endif }}"});
            assertTrue("Root contains 6 elements.", c.assert.assertListSize(6));
            assertEquals("Root contains 1 elements.", 1, c._.getTree().length);
            assertEquals("First root tag should be if tag.", "if", c._.getTree()[0].tagName);
            assertEquals("Second level should be HTML '1'.", "1", c._.getTree()[0].content[0].html);
            assertEquals("Second level should also have an if tag 2.", "if", c._.getTree()[0].content[1].tagName);
            assertEquals("Should contain '1', since only first if case is true.", "1", c.assert.assertRender());

            c = mcomponent({viewHtml : "{{ if (false) }}1{{ if (true) }}2{{ endif }}{{ endif }}"});
            assertTrue("Root contains 6 elements.", c.assert.assertListSize(6));
            assertEquals("Root contains 1 elements.", 1, c._.getTree().length);
            assertEquals("First root tag should be if tag.", "if", c._.getTree()[0].tagName);
            assertEquals("Second level should be HTML '1'.", "1", c._.getTree()[0].content[0].html);
            assertEquals("Second level should also have an if tag 3.", "if", c._.getTree()[0].content[1].tagName);
            assertEquals("Should contain '', since only second if case is true.", "", c.assert.assertRender());

            c = mcomponent({viewHtml : "1{{ if (true) }}2{{ if (true) }}3{{ endif }}4{{ endif }}5"});
            assertTrue("Root contains 9 elements.", c.assert.assertListSize(9));
            assertEquals("Root contains 3 elements.", 3, c._.getTree().length);
            assertEquals("First root tag should be if tag.", "1", c._.getTree()[0].html);
            assertEquals("Second root tag should be if tag.", "if", c._.getTree()[1].tagName);
            assertEquals("Second level should be HTML '2'.", "2", c._.getTree()[1].content[0].html);
            assertEquals("Second level should also have an if tag 4.", "if", c._.getTree()[1].content[1].tagName);
            assertEquals("Should contain '12345'.", "12345", c.assert.assertRender());

            c = mcomponent({viewHtml : "1{{ if (true) }}2{{ if (false) }}3{{ endif }}4{{ endif }}5"});
            assertTrue("Root contains 9 elements.", c.assert.assertListSize(9));
            assertEquals("Root contains 3 elements.", 3, c._.getTree().length);
            assertEquals("First root tag should be if tag.", "1", c._.getTree()[0].html);
            assertEquals("Second root tag should be if tag.", "if", c._.getTree()[1].tagName);
            assertEquals("Second level should be HTML '2'.", "2", c._.getTree()[1].content[0].html);
            assertEquals("Second level should also have an if tag.", "if", c._.getTree()[1].content[1].tagName);
            assertEquals("Should contain '1245'.", "1245", c.assert.assertRender());

            c = mcomponent({viewHtml : "1{{ if (false) }}2{{ if (true) }}3{{ endif }}4{{ endif }}5"});
            assertTrue("Root contains 9 elements.", c.assert.assertListSize(9));
            assertEquals("Root contains 3 elements.", 3, c._.getTree().length);
            assertEquals("First root tag should be if tag.", "1", c._.getTree()[0].html);
            assertEquals("Second root tag should be if tag.", "if", c._.getTree()[1].tagName);
            assertEquals("Second level should be HTML '2'.", "2", c._.getTree()[1].content[0].html);
            assertEquals("Second level should also have an if tag 5.", "if", c._.getTree()[1].content[1].tagName);
            assertEquals("Should contain '15'.", "15", c.assert.assertRender());

            c = mcomponent({model : {name : "mattias"}, viewHtml : "1{{ if (true) }}2{{ if (this.model.name == 'mattias') }}3{{ endif }}4{{ endif }}5"});
            assertTrue("Root contains 9 elements.", c.assert.assertListSize(9));
            assertEquals("Root contains 3 elements.", 3, c._.getTree().length);
            assertEquals("First root tag should be if tag.", "1", c._.getTree()[0].html);
            assertEquals("Second root tag should be if tag.", "if", c._.getTree()[1].tagName);
            assertEquals("Second level should be HTML '2'.", "2", c._.getTree()[1].content[0].html);
            assertEquals("Second level should also have an if tag 6.", "if", c._.getTree()[1].content[1].tagName);
            assertEquals("Should contain '12345', then if with this.model works.", "12345", c.assert.assertRender());

            c = mcomponent({model : {name : "mattias"}, viewHtml : "1{{ if (true) }}2{{ if (this.model.name != 'mattias') }}3{{ endif }}4{{ endif }}5"});
            assertTrueQunit(c.assert.assertListSize(9), "Root contains 9 elements.");
            assertEqualsQunit(c._.getTree().length, 3, "Root contains 3 elements.");
            assertEqualsQunit(c._.getTree()[0].html, "1", "First root tag should be if tag.");
            assertEqualsQunit(c._.getTree()[1].tagName, "if", "Second root tag should be if tag.");
            assertEqualsQunit(c._.getTree()[1].content[0].html, "2", "Second level should be HTML '2'.");
            assertEqualsQunit(c._.getTree()[1].content[1].tagName, "if", "Second level should also have an if tag 7.");
            assertEqualsQunit(c.assert.assertRender(), "1245", "Should contain '1245', then if with this.model works.");

            c = mcomponent({model : {name : "mattias"}, viewHtml : "1{{ if (true) }}2{{ if (model.name == 'mattias') }}3{{ endif }}4{{ endif }}5"});
            assertTrueQunit(c.assert.assertListSize(9), "Root contains 9 elements.");
            assertEqualsQunit(c._.getTree().length, 3, "Root contains 3 elements.");
            assertEqualsQunit(c._.getTree()[0].html, "1", "First root tag should be if tag.");
            assertEqualsQunit(c._.getTree()[1].tagName, "if", "Second root tag should be if tag.");
            assertEqualsQunit(c._.getTree()[1].content[0].html, "2", "Second level should be HTML '2'.");
            assertEqualsQunit(c._.getTree()[1].content[1].tagName, "if", "Second level should also have an if tag 8.");
            assertEqualsQunit(c.assert.assertRender(), "12345", "Should contain '12345', then if with model (without this.model) works.");

            c = mcomponent({model : {name : "mattias"}, viewHtml : "1{{ if (true) }}2{{ if (model.name != 'mattias') }}3{{ endif }}4{{ endif }}5"});
            assertTrueQunit(c.assert.assertListSize(9), "Root contains 9 elements.");
            assertEqualsQunit(c._.getTree().length, 3, "Root contains 3 elements.");
            assertEqualsQunit(c._.getTree()[0].html, "1", "First root tag should be if tag.");
            assertEqualsQunit(c._.getTree()[1].tagName, "if", "Second root tag should be if tag.");
            assertEqualsQunit(c._.getTree()[1].content[0].html, "2", "Second level should be HTML '2'.");
            assertEqualsQunit(c._.getTree()[1].content[1].tagName, "if", "Second level should also have an if tag 9.");
            assertEqualsQunit(c.assert.assertRender(), "1245", "Should contain '1245', then if with model (without this.model) works.");

            c = mcomponent({model : {name : "mattias"}, viewHtml : "1{{ if (this.model.name == 'mattias') }}2{{ endif }}3"});
            assertEqualsQunit(c.assert.assertRender(), "123", "If with 'this.model.name'.");

            c = mcomponent({model : {name : "mattias"}, viewHtml : "1{{ if (model.name == 'mattias') }}2{{ endif }}3"});
            assertEqualsQunit(c.assert.assertRender(), "123", "Same again, but with 'model.name' instead of 'this.model.name'.");

        },

        "test else, elseif tags" : function() {
            var c;

            c = mcomponent({viewHtml : "{{ if (true) }}ok{{ else }}fail{{ endif }}"});
            assertEqualsQunit(c._.getTree().length, 1, "Root contains only one element.");
            assertEqualsQunit(c.assert.assertRender(), "ok", "Should contain 'ok', since if case is true.");

            c = mcomponent({viewHtml : "{{ if (false) }}fail1{{ elseif (true) }}ok{{ else }}fail2{{ endif }}"});
            assertEqualsQunit(c._.getTree().length, 1, "Root contains only one element.");
            assertEqualsQunit(c.assert.assertRender(), "ok", "Should contain 'ok', since if case is true.");

            c = mcomponent({viewHtml : "{{ if (false) }}fail{{ else }}ok{{ endif }}"});
            assertEqualsQunit(c._.getTree().length, 1, "Root contains only one element.");
            assertEqualsQunit(c.assert.assertRender(), "ok", "Should contain 'ok', since if case is true.");

            c = mcomponent({viewHtml : "{{ if (false) }}fail1{{ elseif (true) }}{{ if (true) }}ok{{ else }}innerfail{{ endif }}{{ else }}fail2{{ endif }}"});
            assertEqualsQunit(c._.getTree().length, 1, "Root contains only one element.");
            assertEqualsQunit(c.assert.assertRender(), "ok", "Should contain 'ok', since if case is true.");

            c = mcomponent({viewHtml : "{{ if (false) }}fail1{{ elseif (true) }}{{ if (false) }}ok{{ else }}innerfail{{ endif }}{{ else }}fail2{{ endif }}"});
            assertEqualsQunit(c._.getTree().length, 1, "Root contains only one element.");
            assertEqualsQunit(c.assert.assertRender(), "innerfail", "Should contain 'innerfail', since if case is true.");

            c = mcomponent({viewHtml : "{{ if (false) }}fail1{{ elseif (false) }}fail2{{ elseif (false) }}fail3{{ elseif (false) }}fail4{{ elseif (false) }}fail5{{ else }}ok{{ endif }}"});
            assertEqualsQunit(c._.getTree().length, 1, "Root contains only one element.");
            assertEqualsQunit(c.assert.assertRender(), "ok", "Should contain 'ok', since if case is true.");

            c = mcomponent({viewHtml : "{{ if (false) }}fail1{{ elseif (false) }}fail2{{ elseif (true) }}ok{{ elseif (false) }}fail4{{ elseif (true) }}fail5{{ else }}ok{{ endif }}"});
            assertEqualsQunit(c._.getTree().length, 1, "Root contains only one element.");
            assertEqualsQunit(c.assert.assertRender(), "ok", "Should contain 'ok', since if case is true.");

            c = mcomponent({viewHtml : "{{ if (false) }}fail1{{ elseif (false) }}fail2{{ elseif (true) }}ok{{ elseif (true) }}fail4{{ elseif (true) }}fail5{{ else }}ok{{ endif }}"});
            assertEqualsQunit(c._.getTree().length, 1, "Root contains only one element.");
            assertEqualsQunit(c.assert.assertRender(), "ok", "Should contain 'ok', since if case is true.");

            // Malformed
            //{{ if (this.model.users }}

            c = mcomponent({viewHtml : "{{ if (false) }}fail1{{ elseif (false) }}fail2{{ elseif (true) }}ok{{ elseif (true) }}fail4{{ elseif (true) }}fail5{{ else }}ok{{ endif }}"});
            assertEqualsQunit(c._.getTree().length, 1, "Root contains only one element.");
            assertEqualsQunit(c.assert.assertRender(), "ok", "Should contain 'ok', since if case is true.");


        },

        "test API" : function() {
            var model = {
                displaySettings : {
                    list : {
                        showName : "yes"
                    }
                },
                user : {
                    name : "mattias"
                }
            };
            var view = "{{ push user }}" +
                "{{ if api.lookup('displaySettings.list.showName') == 'yes' }}" +
                "funkar" +
                "{{ else }}" +
                "funkar inte" +
                "{{ endif }}" +
                "{{ endpush }}";

            var c;

            c = mcomponent({model : model, viewHtml : view});
            assertEqualsQunit(c.assert.assertRender(), "funkar", "api.lookup() should result in 'funkar'.");

            view = "{{ push user }}" +
                "{{ showjs api.lookup('displaySettings.list.showName') }}" +
                "{{ endpush }}";

            c = mcomponent({model : model, viewHtml : view});
            assertEqualsQunit(c.assert.assertRender(), "yes", "api.lookup() should find 'yes'.");

            c = mcomponent({
                model : { list : ["mattias", "marcus", "johan"]},
                iter : {
                    userListIter : { itemsPerPage : 1 }
                },
                viewHtml : "{{ niter userListIter list }}{{ push api.getIterator('userListIter') }}{{ itemsPerPage }}{{ endpush }}{{ endniter }}"});
            assertEqualsQunit(c.assert.assertRender(), "1", "Should contain 1 one times.");


            c = mcomponent({
                model : { list : ["mattias", "marcus", "johan"]},
                iter : {
                    userListIter : { itemsPerPage : 2 }
                },
                viewHtml : "{{ niter userListIter list }}{{ push api.getIterator('userListIter') }}{{ itemsPerPage }}{{ endpush }}{{ endniter }}"});
            assertEqualsQunit(c.assert.assertRender(), "22", "Should contain 2 two times.");

            c = mcomponent({
                model : { list : ["mattias", "marcus", "johan"]},
                iter : {
                    userListIter : { itemsPerPage : 3 }
                },
                viewHtml : "{{ niter userListIter list }}{{ push api.getIterator('userListIter') }}{{ itemsPerPage }}{{ endpush }}{{ endniter }}"});
            assertEqualsQunit(c.assert.assertRender(), "333", "Should contain 3 three times.");

            c = mcomponent({
                model : { list : ["mattias", "marcus", "johan"]},
                iter : {
                    userListIter : { itemsPerPage : 3 }
                },
                viewHtml : "{{ niter userListIter list }}{{ push api.getIterator('userListIter') }}{{ itemsShowing }}{{ endpush }}{{ endniter }}"});
            assertEqualsQunit(c.assert.assertRender(), "333", "Should contain 333. Ok!");

            var i;

            c = mcomponent({
                model : { list : ["mattias", "marcus", "johan"]},
                iter : {
                    userListIter : { itemsPerPage : 1 }
                },
                viewHtml : "{{ niter userListIter list }}{{ push api.getIterator('userListIter') }}{{ itemsShowing }}{{ endpush }}{{ endniter }}"});
            assertEqualsQunit(c.assert.assertRender(), "1", "Should contain 1 at first.");
            assertObject("Getting iterator should work, after compiling and running the view at least once.", i = c.getIterator('userListIter'));
            if (i) i.showAllItems();
            assertEqualsQunit(c.assert.assertRender(), "333", "Should contain 333.");

            c = mcomponent({
                model : { list : ["mattias", "marcus", "johan"]},
                iter : {
                    userListIter : { itemsPerPage : 1 }
                },
                viewHtml : "{{ niter userListIter list }}{{ push api.getIterator('userListIter') }}1{{ showingAllItems }}{{ endpush }}{{ endniter }}"});
            assertEqualsQunit(c.assert.assertRender(), "1false", "Should contain false at first.");
            assertObject("Getting iterator should work, after compiling and running the view at least once.", i = c.getIterator('userListIter'));
            if (i) i.showAllItems();
            assertEqualsQunit(c.assert.assertRender(), "1true1true1true", "Should contain truetruetrue.");

            c = mcomponent({
                model : { list : ["mattias", "marcus", "johan"]},
                iter : {
                    userListIter : { itemsPerPage : 1 }
                },
                viewHtml : "{{ niter userListIter list }}{{ push api.getIterator('userListIter') }}1_{{ itemsTotal }}{{ endpush }}{{ endniter }}"});
            assertEqualsQunit(c.assert.assertRender(), "1_3", "itemsTotal = 3");

            c = mcomponent({
                model : { list : ["mattias", "marcus", "johan", "prutt"]},
                iter : {
                    userListIter : { itemsPerPage : 1 }
                },
                viewHtml : "{{ niter userListIter list }}{{ push api.getIterator('userListIter') }}1_{{ itemsTotal }}{{ endpush }}{{ endniter }}"});
            assertEqualsQunit(c.assert.assertRender(), "1_4", "itemsTotal = 4");

            c = mcomponent({
                model : { list : ["mattias", "marcus", "johan", "prutt"]},
                iter : {
                    userListIter : { itemsPerPage : 10 }
                },
                viewHtml : "{{ niter userListIter list }}{{ push api.getIterator('userListIter') }}{{ itemsTotal }}{{ endpush }}{{ endniter }}"});
            assertEqualsQunit(c.assert.assertRender(), "4444", "itemsTotal = 4 when itemsPerPage is higher than model.length");

            c = mcomponent({
                model : { list : ["mattias", "marcus", "johan", "prutt"]},
                iter : {
                    userListIter : { itemsPerPage : 10 }
                },
                viewHtml : "{{ niter userListIter list }}{{ push api.getIterator('userListIter') }}{{ itemsShowing }}{{ endpush }}{{ endniter }}"});
            assertEqualsQunit(c.assert.assertRender(), "4444", "itemsShowing = 4 when itemsPerPage is higher than model.length");

            c = mcomponent({
                model : "mattias",
                viewHtml : "{{ showjs api.getRootModel() }}"
            });
            assertEqualsQunit(c.assert.assertRender(), "mattias", "api.getRootModel() should return root model.");

            c = mcomponent({
                model : { name : "mattias"},
                viewHtml : "{{ showjs api.getRootModel().name }}"
            });
            assertEqualsQunit(c.assert.assertRender(), "mattias", "api.getRootModel() should return root model.");

        },

        "test large view test" : function() {
            var view, m, c, result;

            view = "{{ if (this.model) }}yay" +
                "{{ if (this.model.users) }}" +
                "{{ niter users users }}" +
                "Name:{{ name }}" +
                "Male:{{ if (this.model.isMale) }}Yes{{ else }}No{{ endif }}" +
                "Age:{{ age }}" +
                "{{ endniter }}" +
                "{{ endif }}" +
                "{{ endif }}";

            m = {
                users : [
                    {name : "Mattias", isMale : true, age : 31},
                    {name : "Must", isMale : true, age : 28},
                    {name : "Jenny", isMale : false, age : 27}
                ],
                location : {
                    city : {name : "G�teborg"},
                    country : {name : "Sweden"}
                }
            };

            c = mcomponent({viewHtml : view, model : m, iter : {users : {}}});
            assertEqualsQunit(c._.getTree().length, 1, "Root contains only one element.");
            assertString("Rendering of large view should be OK!", result = c.assert.assertRender());
            assertEqualsQunit(result, "yayName:MattiasMale:YesAge:31Name:MustMale:YesAge:28Name:JennyMale:NoAge:27", "And the result should be correct.");

            m = {
                users : [
                    {name : "Mattias", isMale : true, age : 31},
                    {name : "Must", isMale : true, age : 28},
                    {name : "Must", isMale : true, age : 28},
                    {name : "Must", isMale : true, age : 28},
                    {name : "Must", isMale : true, age : 28},
                    {name : "Must", isMale : true, age : 28},
                    {name : "Must", isMale : true, age : 28},
                    {name : "Must", isMale : true, age : 28},
                    {name : "Must", isMale : true, age : 28},
                    {name : "Must", isMale : true, age : 28},
                    {name : "Must", isMale : true, age : 28},
                    {name : "Must", isMale : true, age : 28},
                    {name : "Must", isMale : true, age : 28},
                    {name : "Must", isMale : true, age : 28},
                    {name : "Must", isMale : true, age : 28},
                    {name : "Jenny", isMale : false, age : 27}
                ],
                location : {
                    city : {name : "G�teborg"},
                    country : {name : "Sweden"}
                }
            };

            view = "  {{ if (this.model) }} yay we have a model!\n" +
                "{{ if (this.model.users) }}\n" +
                "{{ niter users users }}\n" +
                "Name:{{ name }}<br/>\n" +
                "Male:{{ if (this.model.isMale) }}Yes{{ else }}No{{ endif }}<br/>\n" +
                "Age:{{ age }}\n" +
                "{{ endniter }}\n" +
                "{{ endif }}\n" +
                "{{ endif }}\n";

            c = mcomponent({viewHtml : view, model : m, iter : {users : {}}});
            assertStringQunit(result = c.assert.assertRender(), "niter over user only");

            view = "  {{ if (this.model) }} yay we have a model!\n" +
                "\n" +
                "{{ if (this.model.location) }}\n" +
                "{{ push location }}\n" +
                "\n" +
                "{{ push city }}\n" +
                "{{ if (this.model.name) }}\n" +
                "{{ name }}\n" +
                "{{ else }}\n" +
                "City has no name\n" +
                "{{ endif }}\n" +
                "{{ endpush }}\n" +
                "\n" +
                "{{ endpush }}\n" +
                "\n" +
                "{{ else }}\n" +
                "No location\n" +
                "{{ endif }}\n" +
                "\n" +
                "{{ endif }}\n";


            c = mcomponent({viewHtml : view, model : m, iter : {users : {}}});
            assertStringQunit(result = c.assert.assertRender(), "location and city only");

            view = "  {{ if (this.model) }} yay we have a model!\n" +
                "\n" +
                "{{ if (this.model.location) }}\n" +
                "{{ push location }}\n" +
                "\n" +
                "{{ push country }}\n" +
                "{{ if (this.model.name) }}\n" +
                "{{ name }}\n" +
                "{{ else }}\n" +
                "Country has no name\n" +
                "{{ endif }}\n" +
                "{{ endpush }}\n" +
                "\n" +
                "{{ endpush }}\n" +
                "\n" +
                "{{ else }}\n" +
                "No location\n" +
                "{{ endif }}\n" +
                "\n" +
                "{{ endif }}\n";
// Construction location and country only!
            c = mcomponent({viewHtml : view, model : m, iter : {users : {}}});
            assertStringQunit(result = c.assert.assertRender(), "location and country only!");

            view = "{{ if (this.model) }} yay we have a model!\n" +

                "    {{ if (this.model.location) }}\n" +

                "        {{ push location }}\n" +
                "        {{ endpush }}\n" +

                "    {{ else }}\n" +
                "    {{ endif }}\n" +

                "{{ endif }}\n";

// Construction niter with location and both city and country without output and if cases and push!
            c = mcomponent({viewHtml : view, model : m, iter : {users : {}}});
            assertString("niter with location and both city and country without output and if cases and push!", result = c.assert.assertRender());

            view = "{{ if (this.model) }} yay we have a model!\n" +

                "    {{ if (this.model.location) }}\n" +

                "        {{ push location }}\n" +
                "            {{ push city }}\n" +
                "            {{ endpush }}\n" +
                "        {{ endpush }}\n" +

                "    {{ else }}\n" +
                "    {{ endif }}\n" +

                "{{ endif }}\n";

            // "Construction niter with location and both city and country without output and if cases and push country!"
            c = mcomponent({viewHtml : view, model : m, iter : {users : {}}});
            assertString("niter with location and both city and country without output and if cases and push country!", result = c.assert.assertRender());

            view = "{{ if (this.model) }} yay we have a model!\n" +

                "    {{ if (this.model.location) }}\n" +

                "        {{ push location }}\n" +
                "            {{ push country }}\n" +
                "            {{ endpush }}\n" +
                "        {{ endpush }}\n" +

                "    {{ else }}\n" +
                "    {{ endif }}\n" +

                "{{ endif }}\n";

            // "Construction niter with location and both city and country without output and if cases and push city!"
            c = mcomponent({viewHtml : view, model : m, iter : {users : {}}});
            assertStringQunit(result = c.assert.assertRender(), "niter with location and both city and country without output and if cases and push city!");

            view = "{{ if (this.model) }} yay we have a model!\n" +

                "    {{ if (this.model.location) }}\n" +

                "        {{ push location }}\n" +
                "            {{ push city }}\n" +
                "            {{ endpush }}\n" +

                "            {{ push country }}\n" +
                "            {{ endpush }}\n" +
                "        {{ endpush }}\n" +

                "    {{ else }}\n" +
                "    {{ endif }}\n" +

                "{{ endif }}\n";


            // "Construction niter with location and both city and country without output and if cases!"
            c = mcomponent({viewHtml : view, model : m, iter : {users : {}}});
            assertStringQunit(result = c.assert.assertRender(), "niter with location and both city and country without output and if cases!");

            view = "{{ if (this.model) }} yay we have a model!\n" +

                "    {{ if (this.model.location) }}\n" +

                "        {{ push location }}\n" +

                "            {{ push city }}\n" +
                "                {{ if (this.model.name) }}\n" +
                "                {{ else }}\n" +
                "                {{ endif }}\n" +
                "            {{ endpush }}\n" +

                "            {{ push country }}\n" +
                "                {{ if (this.model.name) }}\n" +
                "                {{ else }}\n" +
                "                {{ endif }}\n" +
                "            {{ endpush }}\n" +

                "        {{ endpush }}\n" +

                "    {{ else }}\n" +
                "    {{ endif }}\n" +

                "{{ endif }}\n";


            // "Construction niter with location and both city and country without output!"
            c = mcomponent({viewHtml : view, model : m, iter : {users : {}}});
            assertStringQunit(result = c.assert.assertRender(), "niter with location and both city and country without output!");

            view = "{{ if (this.model) }} yay we have a model!\n" +
                "    \n" +
                "    {{ if (this.model.location) }}\n" +

                "        {{ push location }}\n" +

                "            {{ push city }}\n" +
                "                {{ if (this.model.name) }}\n" +
                "                    {{ name }}\n" +
                "                {{ else }}\n" +
                "                    City has no name\n" +
                "                {{ endif }}\n" +
                "            {{ endpush }}\n" +

                "            {{ push country }}\n" +
                "                {{ if (this.model.name) }}\n" +
                "                    {{ name }}\n" +
                "                {{ else }}\n" +
                "                    Country has no name\n" +
                "                {{ endif }}\n" +
                "            {{ endpush }}\n" +

                "        {{ endpush }}\n" +

                "    {{ else }}\n" +
                "        No location\n" +
                "    {{ endif }}\n" +

                "{{ endif }}\n";


            // "Construction niter with location and both city and country!"
            c = mcomponent({viewHtml : view, model : m, iter : {users : {}}});
            assertStringQunit(result = c.assert.assertRender(), "niter with location and both city and country!");

            view = "  {{ if (this.model) }} yay we have a model!\n" +
                "{{ if (this.model.users) }}\n" +
                "{{ niter users users }}\n" +
                "Name:{{ name }}<br/>\n" +
                "Male:{{ if (this.model.isMale) }}Yes{{ else }}No{{ endif }}<br/>\n" +
                "Age:{{ age }}\n" +
                "{{ endniter }}\n" +
                "\n" +
                "{{ if (this.model.location) }}\n" +
                "{{ push location }}\n" +
                "\n" +
                "{{ push city }}\n" +
                "{{ if (this.model.name) }}\n" +
                "{{ name }}\n" +
                "{{ else }}\n" +
                "City has no name\n" +
                "{{ endif }}\n" +
                "{{ endpush }}\n" +
                "\n" +
                "{{ push country }}\n" +
                "{{ if (this.model.name) }}\n" +
                "{{ name }}\n" +
                "{{ else }}\n" +
                "Country has no name\n" +
                "{{ endif }}\n" +
                "{{ endpush }}\n" +
                "\n" +
                "{{ endpush }}\n" +
                "\n" +
                "{{ else }}\n" +
                "No location\n" +
                "{{ endif }}\n" +
                "\n" +
                "{{ endif }}\n" +
                "{{ endif }}\n";

            // "Construction full view!"
            c = mcomponent({viewHtml : view, model : m, iter : {users : {}}});
            assertStringQunit(result = c.assert.assertRender(), "full view!");

        },

        "test showing other things than model properties" : function() {

            var c;

            c = mcomponent({model : {name : "mattias"}, viewHtml : "{{ show api.lookup('name'); }}"});
            assertEqualsQunit(c.assert.assertRender(), "mattias", "Should contain 'mattias' after API lookup.");

            c = mcomponent({model : {name : "mattias"}, viewHtml : "{{ show Math.floor(1.5); }}"});
            assertEqualsQunit(c.assert.assertRender(), "1", "Should contain '1' after Math.floor.");

            c = mcomponent({model : {name : "mattias"}, viewHtml : "{{ Math.floor(1.5) }}"});
            assertEqualsQunit(c.assert.assertRender(), "1", "Should contain '1' after Math.floor.");

        },

        "test showing model properties that doesn't exist" : function() {

            var c;
            var model = {name : "mattias"};

            c = mcomponent({
                    model : model,
                    viewHtml : "{{ age }}"}
            );

            assertTrueQunit(c.assert.assertRender() !== "", "Should contain an error message after API lookup.");
            model.age = 32;
            assertEqualsQunit(c.assert.assertRender(), "32", "Should now contain lookup result.");


        },

        "test show tag" : function() {

            var c;

            c = mcomponent({model : {name : "mattias"}, viewHtml : "{{ show name }}"});
            assertEqualsQunit(c.assert.assertRender(), "mattias", "Should contain 'mattias'.");

            c = mcomponent({model : {user : {name : "marcus"}}, viewHtml : "{{ show user.name }}"});
            assertEqualsQunit(c.assert.assertRender(), "marcus", "Should contain 'marcus'.");

            c = mcomponent({model : "marcus", viewHtml : "{{ show }}"});
            assertEqualsQunit(c.assert.assertRender(), "marcus", "Should contain 'marcus'.");

            c = mcomponent({model : { list : [
                {url : "www.google.com" },
                {url : "www.facebook.com"}
            ]}, viewHtml : "{{ model.list[0].url }}"});
            assertEqualsQunit(c.assert.assertRender(), "www.google.com", "Should contain 'www.google.com' using lookup with runFunction().");

            c = mcomponent({model : { list : [
                {url : "www.google.com" },
                {url : "www.facebook.com"}
            ]}, viewHtml : "{{ model.list[1].url }}"});
            assertEqualsQunit(c.assert.assertRender(), "www.facebook.com", "Should contain 'www.facebook.com' using lookup with runFunction().");

            c = mcomponent({model : { list : [
                {url : "www.google.com" },
                {url : "www.facebook.com"}
            ]}, viewHtml : "{{ showjs model.list[0].url }}"});
            assertEqualsQunit(c.assert.assertRender(), "www.google.com", "Should contain 'www.google.com' using showjs.");

        },

        "test push tag" : function() {

            var c;

            c = mcomponent({model : {user : {name : "marcus"}, test : "yeah"}, viewHtml : "{{ push user }}{{ endpush }}"});
            assertEqualsQunit(c.assert.assertRender(), "", "Should contain nothing.");

            c = mcomponent({model : {user : {name : "marcus"}, test : "yeah"}, viewHtml : "{{ push user }}{{ show name }}{{ endpush }}"});
            assertEqualsQunit(c.assert.assertRender(), "marcus", "Should contain 'marcus'.");

            c = mcomponent({model : {user : {name : "marcus"}, testball : "yeah"}, viewHtml : "{{ push user }}{{ show testball }}{{ endpush }}"});
            assertEqualsQunit(c.assert.assertRender(), "yeah", "Should contain 'yeah' instead.");

            c = mcomponent({model : {
                db : {
                    user : {
                        name : "marcus"
                    },
                    testyeah : "yeah"
                }
            }, viewHtml : "{{ push db.user }}{{ show testyeah }}{{ endpush }}"});
            assertTrueQunit(c.assert.assertRender() !== "", "Pushing two level property. Should contain something since model stack lookup should fail and cause error.");

            c = mcomponent({
                    model : {
                        db : {
                            user : {
                                name : "marcus"
                            },
                            testyeah : "yeah"
                        }
                    },
                    viewHtml : "{{ push db.user }}{{ show testyeah }}{{ endpush }}",
                    throwOnError : true
                }
            );
            assertExceptionQunit(function() {
                c.assert.assertRender();
            }, "Pushing two level property. Should contain something since model stack lookup should fail and cause error.")

            c = mcomponent({model : {
                db : {
                    user : {
                        name : "marcus"
                    }
                },
                test : "yeah"
            }, viewHtml : "{{ push db.user }}{{ show test }}{{ endpush }}"});
            assertEqualsQunit(c.assert.assertRender(), "yeah", "Pushing two level property. Should contain 'yeah'.");

            c = mcomponent({model : {db : {user : {name : "marcus"}, test : "yeah"}}, viewHtml : "{{ push db.user }}{{ show name }}{{ endpush }}"});
            assertEqualsQunit(c.assert.assertRender(), "marcus", "Pushing two level property. Should contain 'marcus'.");


        },

        "test iter tag" : function() {

            var c;

            c = mcomponent({model : {
                list : ["mattias", "marcus", "johan"]
            }, viewHtml : "{{ iter list }}{{ enditer }}"});
            assertEqualsQunit(c.assert.assertRender(), "", "Should contain nothing.");

            c = mcomponent({
                model : {
                    list : ["mattias", "marcus", "johan"]
                }, viewHtml : "{{ iter list }}{{ enditer }}"});
            assertEqualsQunit(c.assert.assertRender(), "", "Should contain nothing.");

            c = mcomponent({
                model : {
                    list : ["mattias"]
                }, viewHtml : "{{ iter list }}{{ show }}{{ enditer }}"});
            assertEqualsQunit(c.assert.assertRender(), "mattias", "Should contain 'mattias'.");

            c = mcomponent({
                model : {
                    list : ["mattias", "marcus", "johan"]
                }, viewHtml : "{{ iter list }}{{ show }}{{ enditer }}"});
            assertEqualsQunit(c.assert.assertRender(), "mattiasmarcusjohan", "Should contain 'mattiasmarcusjohan'.");

            c = mcomponent({
                model : {
                    list : []
                }, viewHtml : "{{ iter list }}{{ show }}{{ enditer }}"});
            assertEqualsQunit(c.assert.assertRender(), "", "Should contain nothing.");

            c = mcomponent({
                model : {
                    list : ["mattias", "marcus", "johan"]
                }, viewHtml : "{{ iter list }}{{ context index }}{{ enditer }}"});
            assertEqualsQunit(c.assert.assertRender(), "012", "Iterator context should give us '012' in the result.");

            c = mcomponent({
                model : {
                    list : ["mattias", "marcus", "johan"]
                }, viewHtml : "{{ iter list }}{{ show context.index }}{{ enditer }}"});
            assertEqualsQunit(c.assert.assertRender(), "012", "Iterator context should give us '012' in the result when using show and context.");

            c = mcomponent({
                model : {
                    list : ["mattias", "marcus", "johan"]
                }, viewHtml : "{{ iter list }}{{ if (context.index == 1) }}{{ show context.index }}{{ endif }}{{ enditer }}"});
            assertEqualsQunit(c.assert.assertRender(), "1", "If-case with context in condition. Iterator context should give us '1' in the result when using show and context.");

            c = mcomponent({
                model : {
                    list : ["mattias", "marcus", "johan"]
                }, viewHtml : "{{ iter list }}{{ context.index }}{{ enditer }}"});
            assertEqualsQunit(c.assert.assertRender(), "012", "Iterator context should give us '012' in the result when using no tag, and context.");

            c = mcomponent({
                model : {
                    list : ["mattias", "marcus", "johan"]
                }, viewHtml : "{{ iter list }}{{ context size }}{{ enditer }}"});
            assertEqualsQunit(c.assert.assertRender(), "333", "Iterator context should give us '333' in the result.");

            c = mcomponent({
                model : {
                    list : ["mattias", "marcus", "johan"]
                }, viewHtml : "{{ iter list }}{{ show context.size }}{{ enditer }}"});
            assertEqualsQunit(c.assert.assertRender(), "333", "Iterator context should give us '333' in the result.");

            c = mcomponent({
                model : {
                    list : ["mattias", "marcus", "johan"]
                }, viewHtml : "{{ iter list }}{{ context.size }}{{ enditer }}"});
            assertEqualsQunit(c.assert.assertRender(), "333", "Iterator context should give us '333' in the result.");

            c = mcomponent({
                model : {
                    list : ["mattias", "marcus", "johan"]
                }, viewHtml : "{{ iter list }}{{ context parity }}{{ enditer }}"});
            assertEqualsQunit(c.assert.assertRender(), "evenoddeven", "Iterator context parity should give us 'evenoddeven' in the result.");

            c = mcomponent({
                model : {
                    list : ["mattias", "marcus", "johan"]
                }, viewHtml : "{{ iter list }}{{ context.indexOne }}{{ enditer }}"});
            assertEqualsQunit(c.assert.assertRender(), "123", "Iterator context should give us '123' in the result when using no tag, and context.");

            c = mcomponent({
                model : {
                    list : ["mattias", "marcus", "johan"]
                },
                viewHtml : "{{ iter listaxe }}{{ enditer }}",
                throwOnError : true
            });
            assertExceptionQunit(function() {
                c.assert.assertRender();
            }, "This should not work, 'lista' property does not exist.");

            c = mcomponent({
                model : {
                    test : 123
                }, viewHtml : "{{ iter test }}{{ enditer }}",
                throwOnError : true
            });
            assertExceptionQunit(function() {
                c.assert.assertRender();
            }, "This should not work, 'test' is not a list.");

            c = mcomponent({
                model : {
                    test : {age : 80}
                }, viewHtml : "{{ iter test }}{{ enditer }}",
                throwOnError : true
            });
            assertExceptionQunit(function() {
                c.assert.assertRender();
            }, "This should not work, 'test' is not a list.");

            c = mcomponent({
                model : {
                    test : "hejhej"
                }, viewHtml : "{{ iter test }}{{ enditer }}",
                throwOnError : true
            });
            assertExceptionQunit(function() {
                c.assert.assertRender();
            }, "This should not work, 'test' is not a list.");

        },

        "test niter tag, using show more" : function() {

            var c;
            var i;
            var a = 3;
            var b = 1;

            assertExceptionQunit(function() {
                c = mcomponent({
                    model : {
                        list : ["mattias", "marcus", "johan"]
                    },
                    viewHtml : "{{ niter userListIter list }}{{ endniter }}",
                    throwOnError : true
                });
            }, "Construction should fail since there is no iterator config!");

            assertExceptionQunit(function() {
                c.assert.assertRender();
            }, "Should throw error since we haven't declared an iterator configuration.");

            c = mcomponent({
                model : {
                    list : ["mattias", "marcus", "johan"]
                },
                iter : {
                    userListIter : { itemsPerPage : 1 }
                },
                viewHtml : "{{ niter userListIter list }}{{ endniter }}"});
            assertEqualsQunit(c.assert.assertRender(), "", "Should contain nothing.");

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

            // TODO: Add variable that flips back and fourth between showing not all/all.
        },

        "test niter tag, using pages" : function() {

            var c;
            var i;

            c = mcomponent({
                model : {
                    list : []
                },
                iter : {
                    userListIter : {
                        itemsPerPage : 2,
                        usePages : true
                    }
                },
                viewHtml : "{{ niter userListIter list }}{{ show }}{{ endniter }}"});
            assertEqualsQunit(c.assert.assertRender(), "", "Should be empty.");
            assertObject(i = c.getIterator("userListIter"));
            assertEqualsQunit(i.getPageCount(), 0);
            assertEqualsQunit(i.getCurrentPage(), 0);
            i.showNextPage();
            assertEqualsQunit(c.assert.assertRender(), "", "Should still be empty.");
            assertEqualsQunit(i.getCurrentPage(), 0);
            i.showNextPage();
            assertEqualsQunit(c.assert.assertRender(), "", "Should still be empty.");
            assertEqualsQunit(i.getCurrentPage(), 0);
            i.showPrevPage();
            assertEqualsQunit(c.assert.assertRender(), "", "Should still be empty.");
            assertEqualsQunit(i.getCurrentPage(), 0);
            i.showPrevPage();
            assertEqualsQunit(c.assert.assertRender(), "", "Should still be empty.");
            assertEqualsQunit(i.getCurrentPage(), 0);
            i.showPrevPage();
            assertEqualsQunit(c.assert.assertRender(), "", "Should still be empty.");
            assertEqualsQunit(i.getCurrentPage(), 0);

            c = mcomponent({
                model : {
                    list : ["mattias", "marcus", "johan", "butters", "stan"]
                },
                iter : {
                    userListIter : {
                        itemsPerPage : 2,
                        usePages : true
                    }
                },
                viewHtml : "{{ niter userListIter list }}{{ show }}{{ endniter }}"});
            assertEqualsQunit(c.assert.assertRender(), "mattiasmarcus", "Should show first two element.");
            assertObject(i = c.getIterator("userListIter"));
            assertEqualsQunit(i.getPageCount(), 3);
            i.showPrevPage();
            assertEqualsQunit(c.assert.assertRender(), "mattiasmarcus", "Should show first two again since it is first page.");
            i.showNextPage();
            assertEqualsQunit(c.assert.assertRender(), "johanbutters", "Should show second two elements.");
            i.showNextPage();
            assertEqualsQunit(c.assert.assertRender(), "stan", "Should show second two elements.");
            i.showNextPage();
            assertEqualsQunit(c.assert.assertRender(), "stan", "Next page should be same, since it is last page.");
            i.showPrevPage();
            assertEqualsQunit(c.assert.assertRender(), "johanbutters", "And now we go back to previous page.");

            c = mcomponent({
                model : {
                    list : ["mattias", "marcus", "johan", "butters", "stan"]
                },
                iter : {
                    userListIter : {
                        itemsPerPage : 3,
                        usePages : true
                    }
                },
                viewHtml : "{{ niter userListIter list }}{{ show }}{{ endniter }}"});
            assertEqualsQunit(c.assert.assertRender(), "mattiasmarcusjohan", "Should first element only.");
            assertObject(i = c.getIterator("userListIter"));
            assertEqualsQunit(i.getPageCount(), 2);
            i.showPrevPage();
            assertEqualsQunit(c.assert.assertRender(), "mattiasmarcusjohan", "Should show first two again since it is first page.");
            i.showNextPage();
            assertEqualsQunit(c.assert.assertRender(), "buttersstan", "Should show page 2.");
            i.showNextPage();
            assertEqualsQunit(c.assert.assertRender(), "buttersstan", "Same again.");
            i.showPrevPage();
            assertEqualsQunit(c.assert.assertRender(), "mattiasmarcusjohan", "And now we go back to previous page.");

            c = mcomponent({
                model : {
                    list : ["mattias", "marcus", "johan", "butters", "stan"]
                },
                iter : {
                    userListIter : {
                        itemsPerPage : 1,
                        usePages : true
                    }
                },
                viewHtml : "{{ niter userListIter list }}{{ show }}{{ endniter }}"});
            assertEqualsQunit(c.assert.assertRender(), "mattias", "Should first element only.");
            assertObject(i = c.getIterator("userListIter"));
            assertEqualsQunit(i.getPageCount(), 5);
            i.showPrevPage();
            assertEqualsQunit(c.assert.assertRender(), "mattias");
            i.showNextPage();
            assertEqualsQunit(c.assert.assertRender(), "marcus");
            i.showNextPage();
            assertEqualsQunit(c.assert.assertRender(), "johan");
            i.showNextPage();
            assertEqualsQunit(c.assert.assertRender(), "butters");
            i.showNextPage();
            assertEqualsQunit(c.assert.assertRender(), "stan");
            i.showNextPage();
            assertEqualsQunit(c.assert.assertRender(), "stan", "Next page should be same, since it is last page.");
            i.showPrevPage();
            assertEqualsQunit(c.assert.assertRender(), "butters", "And now we go back to previous page.");

            c = mcomponent({
                model : {
                    list : ["mattias", "marcus", "johan", "butters", "stan"]
                },
                iter : {
                    userListIter : {
                        itemsPerPage : 10,
                        usePages : true
                    }
                },
                viewHtml : "{{ niter userListIter list }}{{ show }}{{ endniter }}"});
            assertEqualsQunit(c.assert.assertRender(), "mattiasmarcusjohanbuttersstan", "Should first element only.");
            assertObject(i = c.getIterator("userListIter"));
            assertEqualsQunit(i.getPageCount(), 1);
            i.showPrevPage();
            assertEqualsQunit(c.assert.assertRender(), "mattiasmarcusjohanbuttersstan");
            i.showNextPage();
            assertEqualsQunit(c.assert.assertRender(), "mattiasmarcusjohanbuttersstan");
            i.showNextPage();
            assertEqualsQunit(c.assert.assertRender(), "mattiasmarcusjohanbuttersstan");
            i.showNextPage();
            assertEqualsQunit(c.assert.assertRender(), "mattiasmarcusjohanbuttersstan");
            i.showNextPage();
            assertEqualsQunit(c.assert.assertRender(), "mattiasmarcusjohanbuttersstan");
            i.showPrevPage();
            assertEqualsQunit(c.assert.assertRender(), "mattiasmarcusjohanbuttersstan", "And now we go back to previous page.");

            c = mcomponent({
                model : {
                    list : []
                },
                iter : {
                    userListIter : {
                        itemsPerPage : 1,
                        usePages : true
                    }
                },
                viewHtml : "{{ niter userListIter list }}{{ show }}{{ endniter }}"});
            assertEqualsQunit(c.assert.assertRender(), "", "Should first element only.");
            assertObject(i = c.getIterator("userListIter"));
            assertEqualsQunit(i.getPageCount(), 0);
            i.showPrevPage();
            assertEqualsQunit(c.assert.assertRender(), "");
            i.showNextPage();
            assertEqualsQunit(c.assert.assertRender(), "");
            i.showNextPage();
            assertEqualsQunit(c.assert.assertRender(), "");
            i.showNextPage();
            assertEqualsQunit(c.assert.assertRender(), "");
            i.showNextPage();
            assertEqualsQunit(c.assert.assertRender(), "");
            i.showNextPage();
            assertEqualsQunit(c.assert.assertRender(), "");
            i.showPrevPage();
            assertEqualsQunit(c.assert.assertRender(), "");

            /*************
             * Test showPage()
             */

            c = mcomponent({
                model : {
                    list : ["mattias", "marcus", "johan", "butters", "stan"]
                },
                iter : {
                    userListIter : {
                        itemsPerPage : 2,
                        usePages : true
                    }
                },
                viewHtml : "{{ niter userListIter list }}{{ show }}{{ endniter }}"});
            assertEqualsQunit(c.assert.assertRender(), "mattiasmarcus", "Should first element only.");
            assertObject(i = c.getIterator("userListIter"));
            assertEqualsQunit(i.getPageCount(), 3);
            i.showPage(1);
            assertEqualsQunit(c.assert.assertRender(), "johanbutters", "Should first element only.");

            /* Check that usePages = false causes showPage() to throw exception. */

            c = mcomponent({
                model : {
                    list : ["mattias", "marcus", "johan", "butters", "stan"]
                },
                iter : {
                    userListIter : {
                        itemsPerPage : 2,
                        usePages : false
                    }
                },
                viewHtml : "{{ niter userListIter list }}{{ show }}{{ endniter }}"});
            assertEqualsQunit(c.assert.assertRender(), "mattiasmarcus", "Should first element only.");
            assertObject(i = c.getIterator("userListIter"));
            assertExceptionQunit(function() {
                i.showPage(1);
            }, "showPage should throw exception when usePages == false.");

            /*************
             * Test showPageWithItem() and showPageWithItemThat()
             */

            c = mcomponent({
                model : {
                    list : ["mattias", "marcus", "johan", "butters", "stan"]
                },
                iter : {
                    userListIter : {
                        itemsPerPage : 2,
                        usePages : true
                    }
                },
                viewHtml : "{{ niter userListIter list }}{{ show }}{{ endniter }}"});
            assertEqualsQunit(c.assert.assertRender(), "mattiasmarcus", "Should first element only.");
            assertObject(i = c.getIterator("userListIter"));
            assertEqualsQunit(i.getPageCount(), 3);
            assertEqualsQunit(i.getIndexForItem("johan"), 2, "getIndexForItem() should work.");
            i.showPageWithItem("johan");
            assertEqualsQunit(c.assert.assertRender(), "johanbutters", "Should first element only.");
            i.showPageWithItem("butters");
            assertEqualsQunit(c.assert.assertRender(), "johanbutters", "Should first element only.");
            i.showPageWithItem("stan");
            assertEqualsQunit(c.assert.assertRender(), "stan", "Should first element only.");
            i.showPageWithItem("marcus");
            assertEqualsQunit(c.assert.assertRender(), "mattiasmarcus", "Should first element only.");

            /************************
             *  Test showPageWithItemWhere()
             *************************/

            c = mcomponent({
                model : {
                    list : [
                        {age : 32, name : "mattias", selected : true},
                        {age : 32, name : "marcus"},
                        {age : 31, name : "johan"},
                        {age : 6, name : "butters"},
                        {age : 8, name : "stan"}
                    ]
                },
                iter : {
                    userListIter : {
                        itemsPerPage : 2,
                        usePages : true
                    }
                },
                viewHtml : "{{ niter userListIter list }}{{ name }}{{ endniter }}"});
            assertEqualsQunit(c.assert.assertRender(), "mattiasmarcus");
            assertObject(i = c.getIterator("userListIter"));
            assertEqualsQunit(i.getPageCount(), 3);

            /* getIndexForItemWhere() */

            assertEqualsQunit(i.getIndexForItemWhere(function(item) {
                return item.age == 6;
            }), 3, "getIndexForItemWhere() should work.");

            assertEqualsQunit(i.getIndexForItemWhere(function(item) {
                return item.selected == true;
            }), 0, "getIndexForItemWhere() should work.");

            assertEqualsQunit(i.getIndexForItemWhere(function(item) {
                return item.age == 32;
            }), 0, "getIndexForItemWhere() should work.");

            /* showPageWithItemIndex() */

            i.showPageWithItemIndex(-1);
            assertEqualsQunit(c.assert.assertRender(), "mattiasmarcus");

            i.showPageWithItemIndex(0);
            assertEqualsQunit(c.assert.assertRender(), "mattiasmarcus");

            i.showPageWithItemIndex(1);
            assertEqualsQunit(c.assert.assertRender(), "mattiasmarcus");

            i.showPageWithItemIndex(2);
            assertEqualsQunit(c.assert.assertRender(), "johanbutters");

            i.showPageWithItemIndex(3);
            assertEqualsQunit(c.assert.assertRender(), "johanbutters");

            i.showPageWithItemIndex(4);
            assertEqualsQunit(c.assert.assertRender(), "stan");

            i.showPageWithItemIndex(5);
            assertEqualsQunit(c.assert.assertRender(), "stan");

            i.showPageWithItemIndex(6);
            assertEqualsQunit(c.assert.assertRender(), "stan");

            /* showPageWithItemWhere() */

            i.showPageWithItemWhere(function(item) {
                return item.age == 6;
            });
            assertEqualsQunit(c.assert.assertRender(), "johanbutters");

            i.showPageWithItemWhere(function(item) {
                return item.age == 8;
            });
            assertEqualsQunit(c.assert.assertRender(), "stan");

            i.showPageWithItemWhere(function(item) {
                return item.age == 32;
            });
            assertEqualsQunit(c.assert.assertRender(), "mattiasmarcus");

            i.showPageWithItemWhere(function(item) {
                return item.age == 31;
            });
            assertEqualsQunit(c.assert.assertRender(), "johanbutters");

            i.showPageWithItemWhere(function(item) {
                return item.selected == true;
            });
            assertEqualsQunit(c.assert.assertRender(), "mattiasmarcus");


        },

        "test niter tag, misc iterator functions" : function() {

            /********************************************************
             * Check isOnFirstPage, etc, when more than one page.
             ********************************************************/

            var c, i;

            c = mcomponent({
                model : {
                    list : ["mattias", "marcus", "must", "johan", "kurt", "korv"]
                },
                iter : {
                    userListIter : {
                        itemsPerPage : 2,
                        usePages : true
                    }
                },
                viewHtml : "{{ niter userListIter list }}{{ show }}{{ endniter }}"});
            assertString(c.assert.assertRender());
            assertObject(i = c.getIterator("userListIter"));
            assertEqualsQunit(i.getPageCount(), 3);
            assertEqualsQunit(i.isOnFirstPage(), true, "Should be on first page.");
            assertEqualsQunit(i.isOnLastPage(), false, "Should NOT be on last page.");
            assertEqualsQunit(i.isOnFirstOrLastPage(), true, "Is on first OR last page, since we are on first.");
            assertEqualsQunit(i.isOnFirstAndLastPage(), false, "Is NOT on first AND last page, since we are on first only.");

            /* Then second page */

            i.showNextPage();
            assertEqualsQunit(i.getPageCount(), 3);
            assertEqualsQunit(i.isOnFirstPage(), false, "Should NOT be on first page.");
            assertEqualsQunit(i.isOnLastPage(), false, "Should NOT be on last page.");
            assertEqualsQunit(i.isOnFirstOrLastPage(), false, "Is NOT on first OR last page, since we are on first.");
            assertEqualsQunit(i.isOnFirstAndLastPage(), false, "Is NOT on first AND last page, since we are on first only.");

            /* Then third and last page */

            i.showNextPage();
            assertEqualsQunit(i.getPageCount(), 3);
            assertEqualsQunit(i.isOnFirstPage(), false, "Should NOT be on first page.");
            assertEqualsQunit(i.isOnLastPage(), true, "Should be on last page.");
            assertEqualsQunit(i.isOnFirstOrLastPage(), true, "Is on first OR last page, since we are on last.");
            assertEqualsQunit(i.isOnFirstAndLastPage(), false, "Is NOT on first AND last page, since we are on first only.");

            /********************************************************
             * Check isOnFirstPage, etc, when only one page.
             ********************************************************/

            c = mcomponent({
                model : {
                    list : ["mattias", "marcus"]
                },
                iter : {
                    userListIter : {
                        itemsPerPage : 2,
                        usePages : true
                    }
                },
                viewHtml : "{{ niter userListIter list }}{{ show }}{{ endniter }}"});
            assertString(c.assert.assertRender());
            assertObject(i = c.getIterator("userListIter"));
            assertEqualsQunit(i.getPageCount(), 1);
            assertEqualsQunit(i.isOnFirstPage(), true, "Should be on first page.");
            assertEqualsQunit(i.isOnLastPage(), true, "Should be on last page.");
            assertEqualsQunit(i.isOnFirstOrLastPage(), true, "Is on first OR last page, since we are on first.");
            assertEqualsQunit(i.isOnFirstAndLastPage(), true, "Is on first AND last page.");

            /********************************************************
             * Check getFirstIndexForCurrentPage, etc
             ********************************************************/

            c = mcomponent({
                model : {
                    list : ["mattias", "marcus", "must", "johan", "kurt", "korv"]
                },
                iter : {
                    userListIter : {
                        itemsPerPage : 2,
                        usePages : true
                    }
                },
                viewHtml : "{{ niter userListIter list }}{{ show }}{{ endniter }}"});

            assertString(c.assert.assertRender());
            assertObject(i = c.getIterator("userListIter"));

            assertEqualsQunit(i.getPageCount(), 3);
            assertEqualsQunit(i.getCurrentPage(), 0);

            assertEqualsQunit(i.getFirstIndexForCurrentPage(), 0);
            assertEqualsQunit(i.getLastIndexForCurrentPage(), 1);
            i.showNextPage();
            assertEqualsQunit(i.getFirstIndexForCurrentPage(), 2);
            assertEqualsQunit(i.getLastIndexForCurrentPage(), 3);
            i.showNextPage();
            assertEqualsQunit(i.getFirstIndexForCurrentPage(), 4);
            assertEqualsQunit(i.getLastIndexForCurrentPage(), 5);
            i.showNextPage();
            assertEqualsQunit(i.getFirstIndexForCurrentPage(), 4);
            assertEqualsQunit(i.getLastIndexForCurrentPage(), 5);

            /********************************************************
             * Check getFirstItemForCurrentPage, etc
             ********************************************************/

            c = mcomponent({
                model : {
                    list : ["mattias", "marcus", "must", "johan", "kurt", "korv"]
                },
                iter : {
                    userListIter : {
                        itemsPerPage : 2,
                        usePages : true
                    }
                },
                viewHtml : "{{ niter userListIter list }}{{ show }}{{ endniter }}"});

            assertString(c.assert.assertRender());
            assertObject(i = c.getIterator("userListIter"));

            assertEqualsQunit(i.getPageCount(), 3);
            assertEqualsQunit(i.getCurrentPage(), 0);

            assertEqualsQunit(i.getFirstItemOnCurrentPage(), "mattias");
            assertEqualsQunit(i.getLastItemOnCurrentPage(), "marcus");
            i.showNextPage();
            assertEqualsQunit(i.getFirstItemOnCurrentPage(), "must");
            assertEqualsQunit(i.getLastItemOnCurrentPage(), "johan");
            i.showNextPage();
            assertEqualsQunit(i.getFirstItemOnCurrentPage(), "kurt");
            assertEqualsQunit(i.getLastItemOnCurrentPage(), "korv");
            i.showNextPage();
            assertEqualsQunit(i.getFirstItemOnCurrentPage(), "kurt");
            assertEqualsQunit(i.getLastItemOnCurrentPage(), "korv");

        },

        "test niter tag, using iterator before rendering" : function() {
            var c, i;
            c = mcomponent({
                model : {
                    list : ["mattias", "marcus", "must", "johan"]
                },
                iter : {
                    userListIter : {
                        itemsPerPage : 2,
                        usePages : true
                    }
                },
                viewHtml : "{{ niter userListIter list }}{{ show }}{{ endniter }}"});
            assertObject(i = c.getIterator("userListIter"));
            assertEqualsQunit(i.getPageCount(), 0);
            assertEqualsQunit(i.getCurrentPage(), 0);
            i.showNextPage();
            assertEqualsQunit(i.getCurrentPage(), 1);
            assertEqualsQunit(c.assert.assertRender(), "mustjohan", "Should contain page 2.");

        },

        "test niter tag, using showPageWithItemWhere using an external model" : function() {
            var c, i;
            var model = {
                list : ["mattias", "marcus", "must", "johan"]
            };

            c = mcomponent({
                model : model,
                iter : {
                    userListIter : {
                        itemsPerPage : 2,
                        usePages : true
                    }
                },
                viewHtml : "{{ niter userListIter list }}{{ show }}{{ endniter }}"});
            assertObject("Iterator should be available.", i = c.getIterator("userListIter"));
            assertEqualsQunit(i.getPageCount(), 0, "No page count yet, since there is no model.");
            assertEqualsQunit(i.getCurrentPage(), 0, "Current page starts at 0.");
            assertExceptionQunit(function() {
                i.showPageWithItemWhere(function(item) {
                    return item == "must";
                });
            }, "Should throw exception, it cannot lookup the item on the list, since the list is still undefined.");

            i.setModel(model.list);
            i.showPageWithItemWhere(function(item) {
                return item == "must";
            });

            assertEqualsQunit(i.getCurrentPage(), 1);
            assertEqualsQunit(c.assert.assertRender(), "mustjohan", "Should contain second page.");

            i.showNextPage();
            assertEqualsQunit(i.getCurrentPage(), 1);
            assertEqualsQunit(c.assert.assertRender(), "mustjohan", "Should contain page 2.");
        },

        "test niter tag, pages callbacks" : function() {
            var c;
            var a = 1;
            var i;

            c = mcomponent({
                model : {
                    list : ["mattias", "marcus", "johan", "butters", "stan"]
                },
                iter : {
                    userListIter : {
                        itemsPerPage : 1,
                        usePages : true,
                        whenFirstPageIsShowing : function(api) {
                            a = 2;
                        }
                    }
                },
                viewHtml : "{{ niter userListIter list }}{{ show }}{{ endniter }}"});
            assertEqualsQunit(a, 1, "Should be 1 first.");
            assertEqualsQunit(c.assert.assertRender(), "mattias", "Should first element only.");
            assertObject(i = c.getIterator("userListIter"));
            assertEqualsQunit(i.getPageCount(), 5);
            assertEqualsQunit(a, 2, "Should be 2 after callback has run.");

            a = 1;
            c = mcomponent({
                model : {
                    list : ["mattias", "marcus", "johan", "butters", "stan"]
                },
                iter : {
                    userListIter : {
                        itemsPerPage : 1,
                        usePages : true,
                        whenNotFirstPageIsShowing : function(api) {
                            a = 2;
                        }
                    }
                },
                viewHtml : "{{ niter userListIter list }}{{ show }}{{ endniter }}"});
            assertEqualsQunit(a, 1, "Should be 1 first.");
            assertEqualsQunit(c.assert.assertRender(), "mattias", "Should first element only.");
            assertObject(i = c.getIterator("userListIter"));
            assertEqualsQunit(i.getPageCount(), 5);
            assertEqualsQunit(a, 1, "Should be 1 after callback has run.");
            i.showNextPage();
            assertEqualsQunit(c.assert.assertRender(), "marcus", "Should first element only.");
            assertEqualsQunit(a, 2, "Should be 2 after callback has run.");


            a = 1;
            assertObject("Gonna test whenNotLastPageIsShowing and whenLastPageIsShowing!",
                c = mcomponent({
                    model : {
                        list : ["mattias", "marcus", "johan", "butters", "stan"]
                    },
                    iter : {
                        userListIter : {
                            itemsPerPage : 3,
                            usePages : true,
                            whenNotLastPageIsShowing : function(api) {
                                a = 2;
                            },
                            whenLastPageIsShowing : function(api) {
                                a = 3;
                            }
                        }
                    },
                    viewHtml : "{{ niter userListIter list }}{{ show }}{{ endniter }}"}));

            assertEqualsQunit(a, 1, "Should be 1 first.");
            assertEqualsQunit(c.assert.assertRender(), "mattiasmarcusjohan", "Should first element only.");
            assertObject(i = c.getIterator("userListIter"));
            assertEqualsQunit(i.getPageCount(), 2);
            assertEqualsQunit(a, 2, "Should be 2 after callback has run.");
            i.showNextPage();
            assertEqualsQunit(c.assert.assertRender(), "buttersstan", "Should first element only.");
            assertEqualsQunit(a, 3, "Should be 3 after callback has run.");

            a = 1;
            assertObject("Gonna test whenNotLastPageIsShowing and whenLastPageIsShowing!",
                c = mcomponent({
                    model : {
                        list : ["mattias", "marcus", "johan", "butters", "stan"]
                    },
                    iter : {
                        iterBeforeRender : {
                            itemsPerPage : 3,
                            usePages : true,
                            whenNotLastPageIsShowing : function(api) {
                                a = 2;
                            },
                            whenLastPageIsShowing : function(api) {
                                a = 3;
                            }
                        }
                    },
                    viewHtml : "{{ niter iterBeforeRender list }}{{ show }}{{ endniter }}"}));

            assertObject("Should be able to use iterator before rendering the component.", i = c.getIterator("iterBeforeRender"));
            assertEqualsQunit(a, 1, "Should be 1 first.");
            assertEqualsQunit(c.assert.assertRender(), "mattiasmarcusjohan", "Should first element only.");
            assertEqualsQunit(i.getPageCount(), 2);
            assertEqualsQunit(a, 2, "Should be 2 after callback has run.");
            i.showNextPage();
            assertEqualsQunit(c.assert.assertRender(), "buttersstan", "Should first element only.");
            assertEqualsQunit(a, 3, "Should be 3 after callback has run.");


            a = 2;
            c = mcomponent({
                model : {
                    list : ["mattias", "marcus", "johan", "butters", "stan"]
                },
                iter : {
                    userListIter : {
                        itemsPerPage : 1,
                        usePages : true,
                        whenLastPageIsShowing : function(api) {
                            a = 3;
                        }
                    }
                },
                viewHtml : "{{ niter userListIter list }}{{ show }}{{ endniter }}"});
            assertEqualsQunit(a, 2, "Should be 2 first.");
            assertEqualsQunit(c.assert.assertRender(), "mattias", "Should first element only.");
            assertObject(i = c.getIterator("userListIter"));
            assertEqualsQunit(i.getPageCount(), 5);
            assertEqualsQunit(i.getCurrentPage(), 0, "Should be on page 0.");
            assertEqualsQunit(i.isOnFirstPage(), true, "Should be on first page.");
            assertEqualsQunit(i.isOnLastPage(), false, "Should NOT be on last page.");
            assertEqualsQunit(a, 2, "Should still be 2 after callback has run.");

            i.showPrevPage();
            c.assert.assertRender();
            assertEqualsQunit(i.getCurrentPage(), 0, "Should not go past page 0.");
            assertEqualsQunit(i.getPageCount(), 5);

            i.showNextPage();
            c.assert.assertRender();
            assertEqualsQunit(i.getCurrentPage(), 1, "Should be on page 1.");
            assertEqualsQunit(a, 2, "Should still be 2.");
            assertEqualsQunit(i.isOnFirstPage(), false, "Should NOT be on first page.");
            assertEqualsQunit(i.isOnLastPage(), false, "Should NOT be on last page.");

            i.showNextPage();
            c.assert.assertRender();
            assertEqualsQunit(i.getCurrentPage(), 2, "Should be on page 2.");
            assertEqualsQunit(a, 2, "Should still be 2.");
            assertEqualsQunit(i.isOnFirstPage(), false, "Should NOT be on first page.");
            assertEqualsQunit(i.isOnLastPage(), false, "Should NOT be on last page.");

            i.showNextPage();
            c.assert.assertRender();
            assertEqualsQunit(i.getCurrentPage(), 3, "Should be on page 3.");
            assertEqualsQunit(a, 2, "Should still be 2.");
            assertEqualsQunit(i.isOnFirstPage(), false, "Should NOT be on first page.");
            assertEqualsQunit(i.isOnLastPage(), false, "Should NOT be on last page.");

            i.showNextPage();
            c.assert.assertRender();
            assertEqualsQunit(i.getCurrentPage(), 4, "Should be on page 4.");
            assertEqualsQunit(i.getPageCount(), 5);
            assertEqualsQunit(a, 3, "Should now be 3.");
            assertEqualsQunit(i.isOnFirstPage(), false, "Should NOT be on first page.");
            assertEqualsQunit(i.isOnLastPage(), true, "Should be on last page.");

            i.showNextPage();
            c.assert.assertRender();
            assertEqualsQunit(i.getCurrentPage(), 4, "Should not go past page 4.");
            assertEqualsQunit(i.getPageCount(), 5);

            a = 22;
            c = mcomponent({
                model : {
                    list : ["mattias", "marcus", "johan", "butters", "stan"]
                },
                iter : {
                    userListIter : {
                        itemsPerPage : 5,
                        usePages : true,
                        whenLastPageIsShowing : function(api) {
                            a = 3;
                        }
                    }
                },
                viewHtml : "{{ niter userListIter list }}{{ show }}{{ endniter }}"});
            assertEqualsQunit(a, 22, "Should be 22 first.");
            assertEqualsQunit(c.assert.assertRender(), "mattiasmarcusjohanbuttersstan", "Should first element only.");
            assertObject(i = c.getIterator("userListIter"));
            assertEqualsQunit(i.getPageCount(), 1);
            assertEqualsQunit(i.getCurrentPage(), 0, "Should be on page 0.");
            assertEqualsQunit(a, 3, "Should be 3.");

            a = 22;
            c = mcomponent({
                model : {
                    list : ["mattias", "marcus", "johan", "butters", "stan"]
                },
                iter : {
                    userListIter : {
                        itemsPerPage : 5,
                        usePages : true,
                        whenFirstPageIsShowing : function(api) {
                            a = 3;
                        }
                    }
                },
                viewHtml : "{{ niter userListIter list }}{{ show }}{{ endniter }}"});
            assertEqualsQunit(a, 22, "Should be 22 first.");
            assertEqualsQunit(c.assert.assertRender(), "mattiasmarcusjohanbuttersstan", "Should first element only.");
            assertObject(i = c.getIterator("userListIter"));
            assertEqualsQunit(i.getPageCount(), 1);
            assertEqualsQunit(i.getCurrentPage(), 0, "Should be on page 0.");
            assertEqualsQunit(a, 3, "Should be 3.");

            a = 22;
            c = mcomponent({
                model : {
                    list : ["mattias", "marcus", "johan", "butters", "stan"]
                },
                iter : {
                    userListIter : {
                        itemsPerPage : 5,
                        usePages : true,
                        whenFirstOrLastPageIsShowing : function(api) {
                            a = 3;
                        }
                    }
                },
                viewHtml : "{{ niter userListIter list }}{{ show }}{{ endniter }}"});
            assertEqualsQunit(a, 22, "Should be 22 first.");
            assertEqualsQunit(c.assert.assertRender(), "mattiasmarcusjohanbuttersstan", "Should first element only.");
            assertObject(i = c.getIterator("userListIter"));
            assertEqualsQunit(i.getPageCount(), 1);
            assertEqualsQunit(i.getCurrentPage(), 0, "Should be on page 0.");
            assertEqualsQunit(a, 3, "Should be 3.");

            a = 22;
            c = mcomponent({
                model : {
                    list : ["mattias", "marcus", "johan", "butters", "stan"]
                },
                iter : {
                    userListIter : {
                        itemsPerPage : 5,
                        usePages : true,
                        whenFirstAndLastPageIsShowing : function(api) {
                            a = 3;
                        }
                    }
                },
                viewHtml : "{{ niter userListIter list }}{{ show }}{{ endniter }}"});
            assertEqualsQunit(a, 22, "Should be 22 first.");
            assertEqualsQunit(c.assert.assertRender(), "mattiasmarcusjohanbuttersstan", "Should first element only.");
            assertObject(i = c.getIterator("userListIter"));
            assertEqualsQunit(i.getPageCount(), 1);
            assertEqualsQunit(i.getCurrentPage(), 0, "Should be on page 0.");
            assertEqualsQunit(a, 3, "Should be 3.");

            a = 22;
            c = mcomponent({
                model : {
                    list : ["mattias", "marcus", "johan", "butters", "stan"]
                },
                iter : {
                    userListIter : {
                        itemsPerPage : 2,
                        usePages : true,
                        whenNotFirstOrLastPageIsShowing : function(api) {
                            a = 77;
                        }
                    }
                },
                viewHtml : "{{ niter userListIter list }}{{ show }}{{ endniter }}"});
            assertEqualsQunit(a, 22, "Should be 22 first.");
            assertEqualsQunit(c.assert.assertRender(), "mattiasmarcus", "Should first element only.");
            assertObject(i = c.getIterator("userListIter"));
            assertEqualsQunit(i.getPageCount(), 3);
            assertEqualsQunit(i.getCurrentPage(), 0, "Should be on page 0.");
            assertEqualsQunit(a, 22, "Should be 22.");
            i.showNextPage();
            c.assert.assertRender();
            assertEqualsQunit(i.getCurrentPage(), 1, "Should be on page 1.");
            assertEqualsQunit(i.getPageCount(), 3);
            assertTrueQunit(!i.isOnFirstOrLastPage(), "Should not be isOnFirstOrLastPage");
            assertEqualsQunit(a, 77, "Should now be 77.");

            a = 22;
            c = mcomponent({
                model : {
                    list : ["mattias", "marcus", "johan", "butters", "stan"]
                },
                iter : {
                    userListIter : {
                        itemsPerPage : 2,
                        usePages : true,
                        whenThereAreItems : function(api) {
                            a = 77;
                        },
                        whenThereAreNoItems : function(api) {
                            a = 88;
                        }
                    }
                },
                viewHtml : "{{ niter userListIter list }}{{ show }}{{ endniter }}"});
            assertEqualsQunit(a, 22, "Should be 22 first.");
            assertEqualsQunit(c.assert.assertRender(), "mattiasmarcus", "Should first element only.");
            assertObject(i = c.getIterator("userListIter"));
            assertEqualsQunit(i.getPageCount(), 3);
            assertEqualsQunit(i.getCurrentPage(), 0, "Should be on page 0.");
            assertEqualsQunit(a, 77, "Should be 77.");
            c.setModel({list : []});
            assertEqualsQunit(a, 77, "Should be 77.");
            assertEqualsQunit(c.assert.assertRender(), "", "Empty since the list is empty.");
            assertEqualsQunit(a, 88, "Should be 88.");
            assertEqualsQunit(i.getPageCount(), 0);
            assertEqualsQunit(i.getCurrentPage(), 0, "Should be on page 0.");
            assertEqualsQunit(a, 88, "Should be 88.");


        },

        "test niter tag, filter function" : function() {
            var c;

            c = mcomponent({
                model : {
                    list : [
                        {age : 32, name : "mattias"},
                        {age : 8, name : "butters"},
                        {age : 32, name : "marcus"},
                        {age : 31, name : "johan"},
                        {age : 9, name : "stan"}
                    ]
                },
                iter : {
                    filteredUserListIter : {
                        usePages : true,
                        itemsPerPage : 2,
                        where : function(user) {
                            return user.age > 18;
                        }
                    }
                },
                viewHtml : "{{ niter filteredUserListIter list }}{{ name }}{{ endniter }}"});

            assertEqualsQunit(c.assert.assertRender(), "mattiasmarcus", "Should first element only.");

            c = mcomponent({
                model : {
                    list : [
                        {age : 32, name : "mattias"},
                        {age : 8, name : "butters"},
                        {age : 32, name : "marcus"},
                        {age : 31, name : "johan"},
                        {age : 9, name : "stan"}
                    ]
                },
                iter : {
                    filteredUserListIter : {
                        usePages : true,
                        itemsPerPage : 3,
                        where : function(user) {
                            return user.age > 18;
                        }
                    }
                },
                viewHtml : "{{ niter filteredUserListIter list }}{{ name }}{{ endniter }}"});

            assertEqualsQunit(c.assert.assertRender(), "mattiasmarcusjohan", "Should first element only.");

            c = mcomponent({
                model : {
                    list : [
                        {age : 32, name : "mattias"},
                        {age : 8, name : "butters"},
                        {age : 32, name : "marcus"},
                        {age : 31, name : "johan"},
                        {age : 9, name : "stan"}
                    ]
                },
                iter : {
                    filteredUserListIter : {
                        usePages : true,
                        itemsPerPage : 4,
                        where : function(user) {
                            return user.age > 18;
                        }
                    }
                },
                viewHtml : "{{ niter filteredUserListIter list }}{{ name }}{{ endniter }}"});

            assertEqualsQunit(c.assert.assertRender(), "mattiasmarcusjohan", "Should first element only.");

            c = mcomponent({
                model : {
                    list : [
                        {age : 32, name : "mattias"},
                        {age : 8, name : "butters"},
                        {age : 32, name : "marcus"},
                        {age : 31, name : "johan"},
                        {age : 9, name : "stan"}
                    ]
                },
                iter : {
                    filteredUserListIter : {
                        usePages : true,
                        itemsPerPage : 40,
                        where : function(user) {
                            return user.age > 18;
                        }
                    }
                },
                viewHtml : "{{ niter filteredUserListIter list }}{{ name }}{{ endniter }}"});

            assertEqualsQunit(c.assert.assertRender(), "mattiasmarcusjohan", "Should first element only.");

            c = mcomponent({
                model : {
                    list : [
                        {age : 32, name : "mattias"},
                        {age : 8, name : "butters"},
                        {age : 32, name : "marcus"},
                        {age : 31, name : "johan"},
                        {age : 9, name : "stan"}
                    ]
                },
                iter : {
                    filteredUserListIter : {
                        usePages : true,
                        itemsPerPage : 40,
                        where : function(user) {
                            return user.age < 18;
                        }
                    }
                },
                viewHtml : "{{ niter filteredUserListIter list }}{{ name }}{{ endniter }}"});

            assertEqualsQunit(c.assert.assertRender(), "buttersstan", "Should first element only.");

            c = mcomponent({
                model : {
                    list : [
                        {age : 32, name : "mattias"},
                        {age : 8, name : "butters"},
                        {age : 32, name : "marcus"},
                        {age : 31, name : "johan"},
                        {age : 9, name : "stan"}
                    ]
                },
                iter : {
                    filteredUserListIter : {
                        usePages : true,
                        itemsPerPage : 40,
                        where : function(user) {
                            return user.age == 9;
                        }
                    }
                },
                viewHtml : "{{ niter filteredUserListIter list }}{{ name }}{{ endniter }}"});

            assertEqualsQunit(c.assert.assertRender(), "stan", "Should contain stan only.");

            c = mcomponent({
                model : {
                    list : [
                        {age : 32, name : "mattias"},
                        {age : 8, name : "butters"},
                        {age : 32, name : "marcus"},
                        {age : 31, name : "johan"},
                        {age : 9, name : "stan"}
                    ]
                },
                iter : {
                    filteredUserListIter : {
                        usePages : true,
                        itemsPerPage : 40,
                        where : function(user) {
                            return user.age == 1;
                        }
                    }
                },
                viewHtml : "{{ niter filteredUserListIter list }}{{ name }}{{ endniter }}"});

            assertEqualsQunit(c.assert.assertRender(), "", "Should be empty.");

        },

        "test niter tag, filter function and getPageCount() in iterator" : function() {
            var c, i;

            c = mcomponent({
                model : {
                    list : [
                        {age : 32, name : "mattias"},
                        {age : 8, name : "butters"},
                        {age : 32, name : "marcus"},
                        {age : 31, name : "johan"},
                        {age : 9, name : "stan"}
                    ]
                },
                iter : {
                    filteredUserListIter : {
                        usePages : true,
                        itemsPerPage : 1,
                        where : function(user) {
                            return user.age > 30;
                        }
                    }
                },
                viewHtml : "{{ niter filteredUserListIter list }}{{ name }}{{ endniter }}"});

            assertEqualsQunit(c.assert.assertRender(), "mattias", "Should be empty.");
            assertObject("Iterator should exist", i = c.getIterator("filteredUserListIter"));
            assertEqualsQunit(i.getPageCount(), 3, "3 pages when there are 3 items after where has been applied.");

            c = mcomponent({
                model : {
                    list : [
                        {age : 32, name : "mattias"},
                        {age : 8, name : "butters"},
                        {age : 32, name : "marcus"},
                        {age : 31, name : "johan"},
                        {age : 9, name : "stan"}
                    ]
                },
                iter : {
                    filteredUserListIter : {
                        usePages : true,
                        itemsPerPage : 1,
                        where : function(user) {
                            return user.age == 1;
                        }
                    }
                },
                viewHtml : "{{ niter filteredUserListIter list }}{{ name }}{{ endniter }}"});

            assertEqualsQunit(c.assert.assertRender(), "", "Should be empty.");
            assertObject("Iterator should exist", i = c.getIterator("filteredUserListIter"));
            assertEqualsQunit(i.getPageCount(), 0, "0 page when there are 0 items.");


        },

        "test niter tag, prevent page overflow when using where function" : function() {

            var c, i;

            var model = {
                list : [
                    {age : 32, name : "mattias"},
                    {age : 8, name : "butters"},
                    {age : 32, name : "marcus"},
                    {age : 31, name : "johan"},
                    {age : 9, name : "stan"}
                ]
            };

            c = mcomponent({
                model : model,
                iter : {
                    filteredUserListIter : {
                        usePages : true,
                        itemsPerPage : 2,
                        where : function(user) {
                            return user.age > 30;
                        }
                    }
                },
                viewHtml : "{{ niter filteredUserListIter list }}{{ name }}{{ endniter }}"});

            assertEqualsQunit(c.assert.assertRender(), "mattiasmarcus", "Start state.");
            assertObject("Iterator should exist.", i = c.getIterator("filteredUserListIter"));

            // Go to page 2/2
            i.showNextPage();
            assertEqualsQunit(c.assert.assertRender(), "johan", "Second page.");

            // Now change model, so that we only have 1 item in the list, and thus, only one page!
            model.list[2].age = 13;
            model.list[3].age = 14;

            assertEqualsQunit(c.assert.assertRender(), "mattias", "Second page.");

        },

        "test niter tag, showPageWithItem methods, combined with where function" : function() {
            var c, i;

            var model = {
                list : [
                    {age : 32, name : "mattias"},
                    {age : 8, name : "butters"},
                    {age : 32, name : "marcus"},
                    {age : 31, name : "johan"},
                    {age : 9, name : "stan"}
                ]
            };

            c = mcomponent({
                model : model,
                iter : {
                    list : {
                        usePages : true,
                        itemsPerPage : 1,
                        where : function(user) {
                            return user.age > 30;
                        }
                    }
                },
                viewHtml : "{{ niter list list }}{{ name }}{{ endniter }}"});

            assertEqualsQunit(c.assert.assertRender(), "mattias", "Should be empty.");
            assertObject("Iterator should exist", i = c.getIterator("list"));
            assertEqualsQunit(i.getPageCount(), 3, "3 pages when there are 3 items after where has been applied.");

            assertExceptionQunit(function() {
                i.getPageWithItem(model.list[-1]);
            }, "Item -1 never exists, so should throw exception.");
            assertEqualsQunit(i.getPageWithItem(model.list[0]), 0, "Item 0 should be on page 0.");
            assertExceptionQunit(function() {
                i.getPageWithItem(model.list[1]);
            }, "Item 2 should be on NO page.");
            assertEqualsQunit(i.getPageWithItem(model.list[2]), 1, "Item 2 should be on page 1.");
            assertEqualsQunit(i.getPageWithItem(model.list[3]), 2, "Item 3 should be on page 2.");
            assertExceptionQunit(function() {
                i.getPageWithItem(model.list[4]);
            }, "Item 4 should be on NO page.");
            assertExceptionQunit(function() {
                i.getPageWithItem(model.list[5]);
            }, "Item 5 does not exist.");

        },

        "test iter/niter tag, with alternative resolve styles" : function() {

            var c;

            c = mcomponent({
                viewHtml : "{{ iter bounds['out'] }}{{ enditer }}"
            });


            c = mcomponent({
                viewHtml : '{{ iter bounds["out"] }}{{ enditer }}',
                throwOnError : true
            });

        },

        "test niter tag, causing compile errors" : function() {

            var c;

            assertExceptionQunit(function() {
                c = mcomponent({
                    viewHtml : "{{ niter list list }}{{ enditer }}",
                    throwOnError : true
                });
            }, "Construction fails and with throwOnError, there should be an exception.");

            assertObject("Compiling fails, but should not throw an exception.",
                c = mcomponent({
                    viewHtml : "{{ niter list list }}{{ enditer }}"
                }));

            assertTrueQunit(c.assert.assertRender() !== "", "niter and enditer mismatch. Should output error in DOM, so result can not be empty.");
            assertTrueQunit(c.hasCompileError(), "Should contain compile errors because of enditer mismatch.");
            assertTrueQunit(c.hasRenderErrors(), "Should contain render errors as well, since all compile errors cause a render error.");

        },

        "test showjs with string parameter" : function() {
            var c = mcomponent({viewHtml : "{{ showjs 'mattias'; }}"});
            assertEquals("mattias", c.assert.assertRender());
        },

        "test showjs with Math.sqrt parameter" : function() {
            var c = mcomponent({viewHtml : "{{ showjs Math.sqrt(9); }}"});
            assertEquals("3", c.assert.assertRender());
        },

        "test showjs with Math.max parameter" : function() {
            var c = mcomponent({viewHtml : "{{ showjs Math.max(9, 21); }}"});
            assertEquals("21", c.assert.assertRender());
        },

        "test showjs with Math.min parameter" : function() {
            var c = mcomponent({viewHtml : "{{ showjs Math.min(9, 21); }}"});
            assertEquals("9", c.assert.assertRender());
        },

        "test showjs with model parameter" : function() {
            var c = mcomponent({model : {name : "mattias yo"}, viewHtml : "{{ showjs model.name; }}"});
            assertEquals("mattias yo", c.assert.assertRender());
        },

        "test js with Math.sqrt parameter" : function() {
            var c = mcomponent({viewHtml : "{{ js Math.sqrt(5); }}"});
            assertEquals("", c.assert.assertRender());
        },

        "test js with Math.max parameter" : function() {
            var c = mcomponent({viewHtml : "{{ js Math.max(9, 21); }}"});
            assertEquals("", c.assert.assertRender());
        },

        "test js with Math.min parameter" : function() {
            var c = mcomponent({viewHtml : "{{ js Math.min(9, 21); }}"});
            assertEquals("", c.assert.assertRender());
        },

        "test js with undefined exception" : function() {
            var c = mcomponent({throwOnError : true, viewHtml : "{{ js undefined.prutt() }}"});
            assertExceptionQunit(function() {
                c.assert.assertRender();
            }, "Should throw null pointer exception.");
        },

        "test showjs with undefined exception" : function() {
            var c = mcomponent({viewHtml : "{{ showjs undefined.prutt() }}"});
            assertTrueQunit(c.assert.assertRender() !== "", "Should not be empty, must contain error.");
        },

        "test setting globals.value string-value and getting it with getGlobals().value" : function() {
            var c = mcomponent({viewHtml : "{{ js globals.testing = 'mattias yeah' }}"});
            assertEquals("", c.assert.assertRender());
            assertEquals("mattias yeah", c.getGlobals().testing);
        },

        "test setting globals.value string-value and rendering it to result" : function() {
            var c = mcomponent({viewHtml : "{{ js globals.testing = 'mattias yeah' }}{{ globals.testing }}"});
            assertEquals("mattias yeah", c.assert.assertRender());
        },

        "test setting globals.value boolean-value and reading it in an if-case" : function() {
            var c = mcomponent({viewHtml : "{{ js globals.testing = true }}{{ if (globals.testing) }}ohyeah{{ endif }}"});
            assertEquals("ohyeah", c.assert.assertRender());
        },

        "test setting globals.value number-value and reading it in an if-case" : function() {
            var c = mcomponent({viewHtml : "{{ js globals.testing = 666 }}{{ if (globals.testing) }}ohyeah{{ endif }}"});
            assertEquals("ohyeah", c.assert.assertRender());
        },

        "test setting globals number-value with setglobal-tag and reading it" : function() {
            var c = mcomponent({viewHtml : "{{ setglobal testing 'mattias yeah' }}"});
            c.assert.assertRender();
            assertEquals("mattias yeah", c.getGlobals().testing);
        },

        "test setting globals number-value with setglobal-tag and showing it in result" : function() {
            var c = mcomponent({viewHtml : "{{ setglobal testing 'mattias yeah' }}{{ globals.testing }}"});
            assertEquals("mattias yeah", c.assert.assertRender());
        }
    });

    TestCase("Set/get model", {

        "test getModel() with number" : function() {
            var c = mcomponent({
                model : {age : 80},
                viewHtml : ""
            });
            assertObject("getModel() should return object.", c.getModel());
            assertEquals(80, c.getModel().age);
        },

        "test getModel() with number" : function() {
            var c = mcomponent({
                model : {name : "mattias"},
                viewHtml : ""
            });
            assertObject("getModel() should return object.", c.getModel());
            assertEquals("mattias", c.getModel().name);
        },

        "test no model in args, then getModel() should return undefined" : function() {
            var c = mcomponent({
                viewHtml : ""
            });
            assertEquals(undefined, c.getModel());
        },

        "test setModel() and then getModel()" : function() {
            var c = mcomponent({
                viewHtml : ""
            });
            c.setModel({age : 80});
            assertObject("getModel() should return object.", c.getModel());
            assertEquals(80, c.getModel().age);
        }
    });

    TestCase("Final", {

        "test clipboard that uses parents model" : function() {
            var c = mcomponent({
                clipboard : {clip1 : "{{ if (model.age) }}{{ show age }}{{ endif }}"},
                model : {age : 80},
                viewHtml : "{{ paste clip1 }}"
            });
            assertEquals("80", c.assert.assertRender());
        },

        "test nested clipboards" : function() {
            var c = mcomponent({
                clipboard : {
                    clip1 : "{{ if (model.age) }}{{ paste clip2 }}{{ endif }}",
                    clip2 : "{{ show age }}"
                },
                model : {age : 80},
                viewHtml : "{{ paste clip1 }}"
            });
            assertEquals("80", c.assert.assertRender());
        },

        "test clipboard copied from view, does not remove copied content" : function() {
            var c = mcomponent({
                model : {age : 85},
                viewHtml : "{{ copy clip1 }}{{ show age }}{{ endcopy }}"
            });
            assertEquals("85", c.assert.assertRender());
        },

        "test Copying from inside view, should paste and result in '8080'." : function() {
            var c = mcomponent({
                model : {age : 81},
                viewHtml : "{{ copy clip1 }}{{ show age }}{{ endcopy }}{{ paste clip1 }}"
            });
            assertEquals("8181", c.assert.assertRender());
        },

        "test predefined clipboard" : function() {
            var c = mcomponent({
                clipboard : { clip1 : "<div>hej</div>" },
                model : {age : 80},
                viewHtml : "<div>{{ paste clip1 }}</div>"
            });
            assertEquals("<div><div>hej</div></div>", c.assert.assertRender());
        },

        "test empty clipboard yields in empty result" : function() {
            var c = mcomponent({
                clipboard : {clip1 : ""},
                viewHtml : "{{ paste clip1 }}"
            });
            assertEquals("", c.assert.assertRender());
        },

        "test paste clipboards that is missing returns error" : function() {
            var c = mcomponent({
                viewHtml : "{{ paste clip1 }}"
            });
            assertTrue(c.assert.assertRender() !== "");
        },

        "test paste clipboards that is missing throws exception when rendering" : function() {
            var c = mcomponent({
                throwOnError : true,
                viewHtml : "{{ paste clip1 }}"
            });
            assertException(function() {
                c.assert.assertRender()
            });
        },

        "test paste invalid clipboard returns error" : function() {
            var c = mcomponent({
                clipboard : {clip1 : "{{ if model.age) }}{{ endif }}"},
                viewHtml : "{{ paste clip1 }}"
            });
            assertTrue(c.assert.assertRender() !== "");
        },

        "test paste invalid clipboard throws exception when compiling" : function() {
            assertException(function() {
                mcomponent({
                    throwOnError : true,
                    clipboard : {clip1 : "{{ if model.age) }}{{ endif }}"},
                    viewHtml : "{{ paste clip1 }}"
                });
            });
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

        "test log and throw tag" : function() {

            var c;

            c = mcomponent({
                model : {name : "must"},
                viewHtml : "{{ log 'hej' }}"
            });

            assertEqualsQunit(c.assert.assertRender(), "", "Outputs only to console.");

        },

        "test setglobal tag" : function() {

            var c;

            c = mcomponent({
                viewHtml : "{{ setglobal aGlobal 'hej' }}"
            });

            assertEqualsQunit(c.assert.assertRender(), "", "Setting global only");

        },

        "test js and showjs tag" : function() {

            var c;


            c = mcomponent({
                viewHtml : "{{ js 'hej' }}"
            });

            assertEqualsQunit(c.assert.assertRender(), "", "Setting global only");


            c = mcomponent({
                viewHtml : "{{ showjs 'hej' }}"
            });

            assertEqualsQunit(c.assert.assertRender(), "hej", "Setting global only");


            /******
             * context
             */

            c = mcomponent({
                model : {name : "must"},
                viewHtml : "{{ context name }}",
                throwOnError : true
            });

            assertException("Context is empty, should return empty result.", function() {
                c.assert.assertRender();
            });

            c = mcomponent({
                clipboard : {clip1 : "{{ if (model.age) }}{{ show age }}{{ endif }}"},
                model : {age : 80},
                viewHtml : "{{ paste clip1 }}"
            });

            assertEquals("Predefined clipboard, should paste and result in '80'.", "80", c.assert.assertRender());


        },

        "test Compiled clipboard" : function() {

            var c;

            c = mcomponent({
                clipboard : {clip1 : "{{ if (model.age) }}{{ show age }}{{ endif }}"},
                model : {age : 80},
                viewHtml : "{{ paste clip1 }}"
            });

            assertEquals("Predefined clipboard, should paste and result in '80'.", "80", c.assert.assertRender());

            c = mcomponent({
                clipboard : {
                    clip1 : "{{ if (model.age) }}{{ paste clip2 }}{{ endif }}",
                    clip2 : "{{ show age }}"
                },
                model : {age : 80},
                viewHtml : "{{ paste clip1 }}"
            });

            assertEquals("Predefined clipboard, clip in clip, should paste and result in '80'.", "80", c.assert.assertRender());

            c = mcomponent({
                model : {age : 85},
                viewHtml : "{{ copy clip1 }}{{ show age }}{{ endcopy }}"
            });

            assertEquals("Copying from inside view, copying should not remove the original.", "85", c.assert.assertRender());

            c = mcomponent({
                model : {age : 81},
                viewHtml : "{{ copy clip1 }}{{ show age }}{{ endcopy }}{{ paste clip1 }}"
            });

            assertEquals("Copying from inside view, should paste and result in '8080'.", "8181", c.assert.assertRender());

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

            assertStringQunit(result = c.assert.assertRender(), "Rendering of large view should be OK!");
            assertEqualsQunit(result, "yay1yay2Name:MattiasMale:YesAge:31Name:MustMale:YesAge:28Name:JennyMale:NoAge:27", "And the result should be correct.");

        },

        "test niter tag" : function() {

            var c;

            assertExceptionQunit(function() {
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

        },

        "test Set view, render, change view, render again" : function() {

            var c;

            c = mcomponent({viewHtml : "heyhey"});
            assertEqualsQunit(c.assert.assertRender(), "heyhey", "Should contain 'heyhey', have no tags.");
            c.setViewWithHtml("ojoj");
            assertEqualsQunit(c.assert.assertRender(), "ojoj", "Should contain 'ojoj' after changing view.");

        },

        "test Invalid tags" : function() {

            var c;

            /***********************
             * Using exceptions
             ***********************/

            assertExceptionQunit(function() {
                c = mcomponent({
                    viewHtml : '{{ showjs "mattias }}',
                    throwOnError : true
                })
            });

            assertExceptionQunit(function() {
                c = mcomponent({
                    viewHtml : '{{ * showjs alert("hej") }}',
                    throwOnError : true
                })
            });

            assertExceptionQunit(function() {
                c = mcomponent({
                    viewHtml : '{{ Å showjs alert("hej") }}',
                    throwOnError : true
                })
            });

            /***********************
             * Using error messages
             ***********************/

            c = mcomponent({
                viewHtml : '{{ showjs "mattias }}'
            });

            assertTrueQunit(c.assert.assertRender() !== "", "Should not be empty, should contain an error message.");
            //assertEqualsQunit(c.assert.assertRender(), "", "Should not be empty, should contain an error message.");

            c = mcomponent({
                viewHtml : '{{ * showjs alert("hej") }}'
            });

            assertTrueQunit(c.assert.assertRender() !== "", "Should not be empty, should contain an error message.");
            //assertEqualsQunit(c.assert.assertRender(), "", "Should not be empty, should contain an error message.");

            /**************************************
             * Using error messages in nested tags
             **************************************/

            c = mcomponent({
                viewHtml : '{{ if true }}{{ * showjs alert("hej") }}{{ endif }}'
            });

            assertTrueQunit(c.assert.assertRender() !== "", "Should not be empty, should contain an error message.");
            //assertEqualsQunit(c.assert.assertRender(), "", "Should not be empty, should contain an error message.");


        },

        "test Child components" : function() {

            var c;
            var parent;

            c = mcomponent({model : {username : "mattias"}, viewHtml : "{{ username }}"});
            assertEqualsQunit(c.assert.assertRender(), "mattias", "Should contain 'mattias'.");
            assertObject(parent = mcomponent({model : {username : "jenny"}, viewHtml : "{{ username }}"}));
            assertEqualsQunit(parent.assert.assertRender(), "jenny", "Should contain 'jenny'.");

            assertObject("Creating child.", c = mcomponent({model : {username : "mattias"}, viewHtml : "{{ username }}"}));
            assertEqualsQunit(c.assert.assertRender(), "mattias", "Child render result should be 'mattias'.");
            assertObject("Creating parent.", parent = mcomponent({model : {userNumber : "3"}, viewHtml : "{{ userNumber }} {{ component mata }}"}));
            parent.addChild("mata", c);
            assertEqualsQunit(parent.assert.assertRender(), "3 mattias", "Parent, with child, should contain '3 mattias'.");

            c = mcomponent({model : {color : "black"}, viewHtml : "{{ color }}"});
            assertEqualsQunit(c.assert.assertRender(), "black", "Should contain 'black'.");
            assertObject(parent = mcomponent({
                model : {label : "The color : "},
                viewHtml : "{{ label }}{{ component testChild }}",
                children : {
                    "testChild" : c
                }
            }));
            assertEqualsQunit(parent.assert.assertRender(), "The color : black", "Should contain '3 mattias'.");

            assertExceptionQunit(function() {
                parent = mcomponent({
                    model : {label : "The color : "},
                    viewHtml : "{{ label }}{{ component testChild }}",
                    children : {
                        "test Child" : c
                    }
                });
            }, "Id with space should fail at construction.");

            c = mcomponent({model : {username : "mattias"}, viewHtml : "{{ username }}"});
            assertEqualsQunit(c.assert.assertRender(), "mattias", "Should contain 'mattias'.");
            assertObject(parent = mcomponent({model : {userNumber : "3"}, viewHtml : "{{ userNumber }} {{ component mat }}"}));
            assertException("Should raise exception since id contains space.", function() {
                parent.addChild("mat tias", c);
            });

            assertException("Should raise exception since id contains space.", function() {
                parent.addChild("mat!tias", c);
            });

            assertException("Should raise exception since id contains space.", function() {
                parent.addChild("mat#tias", c);
            });


        },

        "test Child components - adding and removing children and rerendering" : function() {
            var parent, c;

            assertObject("Creating child.", c = mcomponent({model : {username : "mattias"}, viewHtml : "{{ username }}"}));
            assertEqualsQunit(c.assert.assertRender(), "mattias", "Child render result should be 'mattias'.");
            assertObject("Creating parent.", parent = mcomponent({model : {userNumber : "3"}, viewHtml : "{{ userNumber }} {{ component mata }}"}));
            parent.addChild("mata", c);
            assertEqualsQunit(parent.assert.assertRender(), "3 mattias", "Parent, with child, should contain '3 mattias'.");
            parent.removeChild("mata");
            parent.assert.assertRender();
            assertTrueQunit(parent.hasRenderErrors(), "Should have a render error since child no longer exists.");
            assertEqualsQunit(parent.hasRenderErrors(), true, "Should have a render error.");

            parent.addChild("mata", c);
            assertEqualsQunit(parent.assert.assertRender(), "3 mattias", "Parent, with child, should contain '3 mattias'.");
            assertEqualsQunit(parent.hasRenderErrors(), false, "Should NOT have a render error since child exists again.");

        },

        "test Child components - notrequired" : function() {

            var c;
            var parent;

            assertObject("Creating child.", c = mcomponent({model : {username : "mattias"}, viewHtml : "{{ username }}"}));
            assertEqualsQunit(c.assert.assertRender(), "mattias", "Child render result should be 'mattias'.");
            assertObject("Creating parent.", parent = mcomponent({model : {userNumber : "3"}, viewHtml : "{{ userNumber }} {{ component mata }}"}));
            parent.addChild("mata", c);
            assertEqualsQunit(parent.assert.assertRender(), "3 mattias", "Parent, with child, should contain '3 mattias'.");

            assertObject("Creating child.", c = mcomponent({model : {username : "mattias"}, viewHtml : "{{ username }}"}));
            assertEqualsQunit(c.assert.assertRender(), "mattias", "Child render result should be 'mattias'.");
            assertObject("Creating parent.", parent = mcomponent({model : {userNumber : "3"}, viewHtml : "{{ userNumber }} {{ component mata notrequired }}"}));
            assertEqualsQunit(parent.assert.assertRender(), "3 ", "Parent, with child, should contain '3 ', no error message since component is not required.");

            // Test notrequired misspelled
            assertObject("Creating child.", c = mcomponent({model : {username : "mattias"}, viewHtml : "{{ username }}"}));
            assertEqualsQunit(c.assert.assertRender(), "mattias", "Child render result should be 'mattias'.");
            assertObject("Creating parent.", parent = mcomponent({model : {userNumber : "3"}, viewHtml : "{{ userNumber }} {{ component mata notrequiredd }}"}));
            parent.addChild("mata", c);
            parent.assert.assertRender();
            assertTrueQunit(parent.hasRenderErrors(), "Parent should now have render errors, given by the misspelled notrequired parameter.");

        },

        "test Tag assertion" : function() {

            var a, b, c;

            assertObject("Creating child.", a = mcomponent({viewHtml : "{{ showjs api._assert.componentIdEqualsExecutionContextId() }}"}));
            assertTrueQunit(a.assert.assertComponentIdEqualsExecutionContextId(), "Correct execution context from mcomponent scope.");
            assertEqualsQunit(a.assert.assertRender(), "true", "Correct execution context in execution scope as well.");

        },

        "test API assertion" : function() {
            var a;

            assertObject("Creating child.", a = mcomponent({viewHtml : "a{{ js api._assert.childCount(0) }}"}));
            assertEqualsQunit(a.assert.assertRender(), "a", "No error!");

            assertObject("Creating child.", a = mcomponent({viewHtml : "a{{ js api._assert.childCount(1) }}"}));
            assertTrueQunit(a.assert.assertRender() !== "a", "Should contain error.");

            assertObject("Creating child.", a = mcomponent({viewHtml : "a{{ js api._assert.childCount(1) }}", throwOnError : true}));
            assertExceptionQunit(function() {
                a.assert.assertRender()
            }, "Should throw exception.");

        },

        "test Check child count from execution context" : function() {

            var a, b;

            assertObject("Creating child.", a = mcomponent({viewHtml : "a {{ showjs api._assert.getExecutionContext().getChildCount() }}"}));
            assertEqualsQunit(a.assert.assertRender(), "a 0", "0 children");

            assertObject("Creating child.", b = mcomponent({viewHtml : "b"}));

            a.addChild("b", b);

            assertEqualsQunit(a.assert.assertRender(), "a 1", "1 child");

        },

        "test Execution context scope" : function() {

            /**
             * When having children and setting view with other component, ensure that components still have their own execution context.
             */

            var a, b, c, d;

            // Test setViewFromComponent first.

            assertObject("Creating child.", a = mcomponent({viewHtml : "a {{ showjs api._assert.componentIdEqualsExecutionContextId() }}"}));
            assertTrueQunit(a.assert.assertComponentIdEqualsExecutionContextId(), "Correct execution context.");
            assertEqualsQunit(a.assert.assertRender(), "a true", "");

            assertObject("Creating child.", b = mcomponent({viewHtml : "b {{ showjs api._assert.componentIdEqualsExecutionContextId() }}"}));
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

        },

        "test Weird HTML" : function() {

            var a;

            assertObject("Creating child.", a = mcomponent({viewHtml : "ÅÄÖ=#€%"}));
            assertEqualsQunit(a.assert.assertRender(), "ÅÄÖ=#€%");

            assertObject("Creating child.", a = mcomponent({viewHtml : '!2394839835€)(%!##€&!#/€!#")!""#!"#)£§|∞§©£@][≈£≈'}));
            assertEqualsQunit(a.assert.assertRender(), '!2394839835€)(%!##€&!#/€!#")!""#!"#)£§|∞§©£@][≈£≈');

            assertObject("Creating child.", a = mcomponent({viewHtml : '{ { !2394839835€)(%!##€&!#/€!#")!""#!"#)£§|∞§©£@][≈£≈ } }   '}));
            assertEqualsQunit(a.assert.assertRender(), '{ { !2394839835€)(%!##€&!#/€!#")!""#!"#)£§|∞§©£@][≈£≈ } }   ');

        }

    });
}


