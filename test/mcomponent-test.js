QUnit.module("Startup");

if (typeof mcomponent == "undefined" && typeof require == "function") {
    mcomponent = require("../lib/main.js");
}

test("mcomponent up and running", function() {
    ok(mcomponent, "mcomponent is available in global scope.");
    equal(typeof mcomponent, "function", "mcomponent is a function.");
});

if (typeof mcomponent === "function") {

    QUnit.module("General");

    test("Lookup", function() {

        var c;

        ok(c = mcomponent(), "Construction is OK.");

        equal(c.assert.assertLookup("username", {username : "butters"}), "butters", "Should lookup 'username' properly.");
        equal(c.assert.assertLookup("user.username", {user : {username : "butters"}}), "butters", "Should lookup 'user.username' properly.");
        equal(c.assert.assertLookup("user.name.first", {user : {name : {first : "mattias", last : "andersson"}}}), "mattias", "Should lookup 'user.name.first' properly.");
        equal(c.assert.assertLookup("user.name.last", {user : {name : {first : "mattias", last : "andersson"}}}), "andersson", "Should lookup 'user.name.last' properly.");
        ok(c.assert.assertLookup("user.name", {user : {name : {first : "mattias", last : "andersson"}}}).first == "mattias", "Should lookup 'user.name' object properly.");
        ok(c.assert.assertLookup("user.name", {user : {name : {first : "mattias", last : "andersson"}}}).last == "andersson", "Should lookup 'user.name' object properly.");

        equal(c.assert.assertLookup("user.name.first", {user : {name : {first : "mattias", last : "andersson"}}}), "mattias", "Should lookup 'user.name.first' object properly.");
        equal(c.assert.assertLookup("user.name.first", {user : {name : {first : undefined, last : "andersson"}}}), undefined, "Should lookup 'user.name.first' should be undefined.");

        raises(function() {
            c.assert.assertLookup("user.name.problem.test.hej", {user : {name : undefined}})
        }, "Looking up 'user.name.problem' should fail.");

        raises(function() {
            c.assert.assertLookup("user.name.problem.test.hej", undefined)
        }, "Looking up 'user.name.problem' should fail since model is undefined.");


    });

    test("Lookup with parent model", function() {

        var c;

        ok(c = mcomponent({
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
        }), "Construction is OK.");

        equal(c.assert.assertRender(), "mattiasSweden", "Should lookup 'name' and 'location.country' properly since it will iterate over the stack and find location and then country.");

        equal(c.assert.assertFindParentPrefixCount("username"), 0, "No parent model prefixes.");
        equal(c.assert.assertFindParentPrefixName("username"), "username", "No parent model prefixes, name is username.");

        equal(c.assert.assertFindParentPrefixCount("../username"), 1, "Parent prefixes = 1");
        equal(c.assert.assertFindParentPrefixName("../username"), "username", "No parent model prefixes, name is username.");

        equal(c.assert.assertFindParentPrefixCount("../../username"), 2, "Parent prefixes = 2");
        equal(c.assert.assertFindParentPrefixName("../username"), "username", "No parent model prefixes, name is username.");

        ok(c = mcomponent({
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
        }), "Construction is OK.");

        equal(c.assert.assertRender(), "mattiasAwesomeland", "Should lookup 'name' and 'location.country' properly since it will find location on user.");

        ok(c = mcomponent({
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
        }), "Construction is OK.");

        equal(c.assert.assertRender(), "mattiasSweden", "Should lookup 'name' and 'location.country' properly since it will find location on user.");

        ok(c = mcomponent({
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
        }), "Construction is OK.");

        equal(c.assert.assertRender(), "mattiasAwesomeland", "Should lookup 'name' and 'location.country' properly since it will find location on user.");

        ok(c = mcomponent({
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
        }), "Construction is OK.");

        equal(c.assert.assertRender(), "mattiasSweden", "Should lookup 'name' and 'location.country' properly since it will find location on user.");

        ok(c = mcomponent({
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
        }), "Construction is OK.");

        equal(c.assert.assertRender(), "mattiasSweden", "Should lookup 'name' and 'location.country' properly since it will find location on user.");

        ok(c = mcomponent({
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
        }), "Construction is OK.");

        raises(function() {
            c.assert.assertRender();
        }, "Should fail since it goes beyond stack, using compiled code.");

        ok(c = mcomponent({
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
        }), "Construction is OK.");

        raises(function() {
            c.assert.assertRender();
        }, "Should fail since it goes beyond stack, using compiled code.");

        ok(c = mcomponent({
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
        }), "Construction is OK.");

        equal(c.assert.assertRender(), "Sweden", "Using ../ with push.");


        ok(c = mcomponent({
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
        }), "Construction is OK.");

        equal(c.assert.assertRender(), "BCAGOT", "Using ../ with iter.");


        ok(c = mcomponent({
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
        }), "Construction is OK.");

        equal(c.assert.assertRender(), "PARARN", "Using ../ with iter.");


        ok(c = mcomponent({
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
        }), "Construction is OK.");

        equal(c.assert.assertRender(), "BCAGOT", "Using ../../ with iter.");


    });

    test("Util functions", function() {

        var c;

        ok(c = mcomponent(), "Construction is OK.");

        equal(c.assert.assertGetTagParameters("if hej"), "hej", "Should be 'hej'");
    });

    test("Util function - getNiterParameters", function() {

        var c;

        ok(c = mcomponent(), "Construction is OK.");

        var p;

        ok(p = c._.getNiterParametersFromTagParameter(""));
        equal(p.iterName, undefined);
        equal(p.variableName, undefined);

        ok(p = c._.getNiterParametersFromTagParameter("name"), "Testing 'name'.");
        equal(p.iterName, "name");
        equal(p.variableName, undefined);

        ok(p = c._.getNiterParametersFromTagParameter("name userlist"), "Testing 'name userlist'.");
        equal(p.iterName, "name");
        equal(p.variableName, "userlist");

        ok(p = c._.getNiterParametersFromTagParameter("name userlist huh", "Testing 'name userlist huh'."));
        equal(p.iterName, "name");
        equal(p.variableName, "userlist huh");

    });

    test("Set view", function() {

        var t;

        t = mcomponent();
        ok(t.assert.assertListSize(0), "List should be empty after empty construction.");

        t.setViewWithHtml();
        ok(t.assert.assertListSize(0), "List should be empty after setViewWithHtml(undefined).");

        t.setViewWithHtml("{{ name }}");
        ok(t.assert.assertListSize(1), "List should contain one element after setViewWithHtml('{{ name }}').");

        t = mcomponent({viewHtml : "{{ name }}"});
        ok(t.assert.assertListSize(1), "List should contain one element after args.viewHtml = '{{ name }}'.");

        t = mcomponent({viewHtml : "tsa{{ name }}ast"});
        ok(t.assert.assertListSize(3), "List should contain three element after args.viewHtml = 'tsa{{ name }}ast'.");

        t = mcomponent({viewHtml : "{{ if (this.model.name) }}{{ name }}{{ endif }}"});
        ok(t.assert.assertListSize(3), "List should contain three element after args.viewHtml = '{{ if (this.model.name) }}{{ name }}{{ endif }}'.");

        var t2;

        t2 = mcomponent({viewHtml : "{{ firstName }}"});

        t.setViewFromComponent(t2);

        ok(t.assert.assertListSize(1), "List should contain one item.");
        ok(t.assert.assertListItemHasTagName(0, "firstName"), "List should contain tag with name firstName ");

        t = mcomponent({viewFromComponent : t2});

        ok(t.assert.assertListSize(1), "List should contain one item.");
        ok(t.assert.assertListItemHasTagName(0, "firstName"), "List should contain tag with name firstName ");

    });

    test("Set view with special characters", function() {
        var c;
        var v;

        v = "<div class=\"animationContainer loadingMedium\"><img src=\"/v/207/49522/system/image/animation/loading_transparent_medium.gif\" alt=\"Laddar...\" title=\"Laddar...\" hspace=\"0\" vspace=\"0\" ></div>";
        ok(c = mcomponent({viewHtml : v}));
        equal(c.assert.assertRender(), v);

        v = "\t\t\t";
        ok(c = mcomponent({viewHtml : v}));
        equal(c.assert.assertRender(), v);

        v = "\n\n";
        ok(c = mcomponent({viewHtml : v}));
        equal(c.assert.assertRender(), v);

        v = "\r\r";
        ok(c = mcomponent({viewHtml : v}));
        equal(c.assert.assertRender(), v);

        v = "\r\n\t";
        ok(c = mcomponent({viewHtml : v}));
        equal(c.assert.assertRender(), v);

        v = "\n''\n";
        ok(c = mcomponent({viewHtml : v}));
        equal(c.assert.assertRender(), v);

        v = '\n"\t"\n';
        ok(c = mcomponent({viewHtml : v}));
        equal(c.assert.assertRender(), v);

        v = "\\ttt\\";
        ok(c = mcomponent({viewHtml : v}));
        equal(c.assert.assertRender(), v);

    });

    test("Execution context", function() {

        var c;

        ok(c = mcomponent({viewHtml : "{{ name }}"}));
        equal(c._.getExecutionStackSize(), 0, "No model, execution stack should start empty.");
        ok(c._.pushModel({test : "test"}));
        equal(c._.getExecutionStackSize(), 1, "Pushed model, execution stack should now have one element.");

        c = mcomponent({model : {name : "mattias"}, viewHtml : "{{ name }}"});

        equal(c._.getExecutionStackSize(), 1, "Model should be pushed to execution stack.");

    });

    test("Find block end", function() {

        var c;

        c = mcomponent({viewHtml : "{{ name }}"});

        ok(c.assert.assertListSize(1), "List size is 1.");
        raises(function() {
            c._.findBlockEnd(0)
        }, "Not tag with block, throw exception");


        raises(function() {
            c = mcomponent({
                viewHtml : "{{ if name }}",
                throwOnError : true
            });
        }, "Throws error since template is malformed.");

        ok(c.assert.assertListSize(1), "List size is 1.");
        raises(function() {
            c._.findBlockEnd(0)
        }, "Exception, list is too short.");

        ok(c = mcomponent({viewHtml : "before{{ if aaaname }}inside{{ endif }}after"}), "Construction should be OK!");
        ok(c.assert.assertListSize(5), "List size is 5.");
        equal(c._.findBlockEnd(1), 3, "Should find ending tag on index 3.");

        c = mcomponent({viewHtml : "{{ if supername }}test{{ endif }}"});
        ok(c.assert.assertListSize(3), "List size is 3.");
        equal(c._.findBlockEnd(0), 2, "Should find ending tag on index 2.");

        ok(c = mcomponent(), "Construction should be ok...");
        ok(c.assert.assertSetViewAndBuildList("{{ if thename }}{{ if age }}test{{ endif }}"));
        ok(c.assert.assertListSize(4), "List size is 4.");
        raises(function() {
            c._.findBlockEnd(0);
        }, "Should not find a closing endif.");
        equal(c._.findBlockEnd(1), 3, "Should find ending tag on index 3.");

        c = mcomponent({viewHtml : "{{ if name }}{{ if age }}test{{ endif }}{{ endif }}"});
        ok(c.assert.assertListSize(5), "List size is 5.");
        equal(c._.findBlockEnd(0), 4, "Should find ending tag on index 4.");
        equal(c._.findBlockEnd(1), 3, "Should find ending tag on index 3.");

        c = mcomponent({viewHtml : "{{ if name }}{{ push age }}test{{ endpush }}{{ endif }}"});
        ok(c.assert.assertListSize(5), "List size is 5.");
        equal(c._.findBlockEnd(0), 4, "Should find ending tag on index 4.");
        equal(c._.findBlockEnd(1), 3, "Should find ending tag on index 3.");

        c = mcomponent({viewHtml : "{{ if (this.model.name) }}{{ name }}{{ endif }}"});
        ok(c.assert.assertListSize(3), "List size is 3.");
        equal(c._.findBlockEnd(0), 2, "Should find ending tag on index 2.");


    });

    test("Find block end, for if cases", function() {

        var c;

        c = mcomponent({viewHtml : "{{ if (test) }}{{ else }}{{ endif }}"});
        ok(c.assert.assertListSize(3), "List size is 3.");
        equal(c._.findBlockEnd(0, {endTags : ["else", "elseif"]}), 1, "Should find 'else' tag on index 1.");
        equal(c._.findBlockEnd(0, {endTags : ["else", "elseif"], startIndex : 1}), 2, "Should find 'endif' tag on index 2.");

        c = mcomponent({viewHtml : "{{ if (test) }}testtrue{{ else }}testfalse{{ endif }}"});
        ok(c.assert.assertListSize(5), "List size is 5.");
        equal(c._.findBlockEnd(0, {endTags : ["else", "elseif"]}), 2, "Should find 'else' tag on index 1.");
        equal(c._.findBlockEnd(0, {endTags : ["else", "elseif"], startIndex : 2}), 4, "Should find 'endif' tag on index 2.");

        c = mcomponent({viewHtml : "{{ if (test) }}{{ elseif (test2) }}{{ else }}{{ endif }}"});
        ok(c.assert.assertListSize(4), "List size is 4.");
        equal(c._.findBlockEnd(0, {endTags : ["else", "elseif"]}), 1, "Should find 'elseif' tag on index 1.");
        equal(c._.findBlockEnd(0, {endTags : ["else", "elseif"], startIndex : 1}), 2, "Should find 'else' tag on index 2.");
        equal(c._.findBlockEnd(0, {endTags : ["else", "elseif"], startIndex : 2}), 3, "Should find 'endif' tag on index 3.");

        c = mcomponent({viewHtml : "{{ if (test) }}testIsTrue{{ elseif (test2) }}test2IsTrue{{ else }}neitherIsTrue{{ endif }}"});
        ok(c.assert.assertListSize(7), "List size is 7.");
        equal(c._.findBlockEnd(0, {endTags : ["else", "elseif"]}), 2, "Should find 'elseif' tag on index 2.");
        equal(c._.findBlockEnd(0, {endTags : ["else", "elseif"], startIndex : 2}), 4, "Should find 'else' tag on index 1.");
        equal(c._.findBlockEnd(0, {endTags : ["else", "elseif"], startIndex : 4}), 6, "Should find 'endif' tag on index 6.");

    });

    QUnit.module("Syntax tree");

    test("General", function() {

        var c;

        ok(c = mcomponent({viewHtml : "{{ push age }}test{{ endpush }}"}), "Construction OK!");
        equal(c._.getTree().length, 1, "Root contains only one element.");
        equal(c._.getTree()[0].tagName, "push", "First root tag should be push tag.");
        equal(c._.getTree()[0].content[0].html, "test", "Second level should be HTML 'test'.");

        ok(c = mcomponent({viewHtml : "{{ if (name) }}{{ push age }}test{{ endpush }}{{ endif }}"}), "Construction OK!");
        equal(c._.getTree().length, 1, "Root contains only one element.");
        equal(c._.getTree()[0].tagName, "if", "First root tag should be if tag.");
        equal(c._.getTree()[0].content[0].tagName, "push", "Second level should be a push.");
        equal(c._.getTree()[0].content[0].content[0].html, "test", "Second level should be HTML 'test'.");

    });

    test("if, elseif, else tags", function() {

        var c;

        ok(c = mcomponent({viewHtml : "{{ if (true) }}1{{ else }}2{{ endif }}"}), "Construction OK!");
        ok(c.assert.assertListSize(5), "List size is 5.");
        equal(c._.getTree()[0].conditions.length, 1, "Only one condition in if case.");
        equal(c._.getTree()[0].contentRoots.length, 1, "Only one conditioned root.");
        equal(c._.getTree()[0].contentRoots[0].length, 1, "Only one element in the true-conditioned root.");
        equal(c._.getTree()[0].contentRoots[0][0].html, "1", "True case contains '1'.");
        equal(c._.getTree()[0].elseContent.length, 1, "Else contains one element");
        equal(c._.getTree()[0].elseContent[0].html, "2", "Else contains '2'.");

        ok(c = mcomponent({viewHtml : "{{ if (true) }}1{{ if (false) }}2{{ endif }}{{ endif }}"}), "Construction OK!");
        ok(c.assert.assertListSize(6), "List size is 6.");
        equal(c._.findBlockEnd(0, {endTags : ["else", "elseif"]}), 5, "Should find outer 'endif' tag on index 5.");
        equal(c._.findBlockEnd(2, {endTags : ["else", "elseif"]}), 4, "Should find inner 'endif' tag on index 4.");
        equal(c._.getTree()[0].conditions.length, 1, "Only one condition on outer if case.");
        equal(c._.getTree()[0].contentRoots.length, 1, "Only one content list also, on outer if case.");
        equal(c._.getTree()[0].elseContent.length, 0, "No else content on outer if case.");
        equal(c._.getTree()[0].contentRoots[0].length, 2, "Content for outer if case should have two elements. '1' and inner if.");
        equal(c._.getTree()[0].contentRoots[0][0].html, "1", "First content element is HTML '1'.");
        equal(c._.getTree()[0].contentRoots[0][1].tag.tagName, "if", "Second content element is 'if' tag");

    });

    QUnit.module("Execution");

    test("lookup from models not on top of stack", function() {

        var c;

        ok(c = mcomponent({
            model : {
                photos : {
                    list : ["test1", "test2"],
                    length : 2
                }},
            viewHtml : "ok{{ push photos }}{{ length }}{{ iter photos.list }}{{ show }}{{ enditer }}{{ endpush }}"
        }), "Construction OK!");
        equal(c.assert.assertRender(), "ok2test1test2", "Should contain 'ok2test1test2', all lookups should be ok.");

        ok(c = mcomponent({
            model : {
                data : {
                    photos : {
                        list : ["test1", "test2"],
                        length : 2
                    }
                }
            },
            viewHtml : "ok{{ push data }}{{ push data.photos }}{{ length }}{{ iter photos.list }}{{ show }}{{ enditer }}{{ endpush }}{{ endpush }}"
        }), "Construction OK!");
        equal(c.assert.assertRender(), "ok2test1test2", "Pushing model that is not on top of stack should work. Should contain 'ok2test1test2', all lookups should be ok.");

        ok(c = mcomponent({
            model : {
                data : {
                    photos : {
                        list : ["test1", "test2"],
                        length : 2
                    }
                }
            },
            viewHtml : "ok{{ push data }}{{ push data.photos }}{{ length }}{{ iter data.photos.list }}{{ show }}{{ enditer }}{{ endpush }}{{ endpush }}"
        }), "Construction OK!");
        equal(c.assert.assertRender(), "ok2test1test2", "Pushing model that is not on top of stack should work. Should contain 'ok2test1test2', all lookups should be ok.");

    });

    test("if tag", function() {

        var c;

        ok(c = mcomponent({viewHtml : "heyhey"}), "Construction OK!");
        equal(c.assert.assertRender(), "heyhey", "Should contain 'heyhey', have no tags.");

        ok(c = mcomponent({viewHtml : "{{ if (true) }}baibai{{ endif }}"}), "Construction OK!");
        equal(c._.getTree().length, 1, "Root contains only one element.");
        equal(c._.getTree()[0].tagName, "if", "First root tag should be if tag.");
        equal(c._.getTree()[0].content[0].html, "baibai", "Second level should be HTML 'baibai'.");
        equal(c.assert.assertRender(), "baibai", "Should contain 'baibai', since if case is true.");

        ok(c = mcomponent({viewHtml : "{{ if (true) }}1{{ if (true) }}2{{ endif }}{{ endif }}"}), "Construction OK!");
        ok(c.assert.assertListSize(6), "Root contains 6 elements.");
        equal(c._.getTree().length, 1, "Root contains 1 elements.");
        equal(c._.getTree()[0].tagName, "if", "First root tag should be if tag.");
        equal(c._.getTree()[0].content[0].html, "1", "Second level should be HTML '1'.");
        equal(c._.getTree()[0].content[1].tagName, "if", "Second level should also have an if tag 1.");
        equal(c.assert.assertRender(), "12", "Should contain '12', since both if cases are true.");

        ok(c = mcomponent({viewHtml : "{{ if (true) }}1{{ if (false) }}2{{ endif }}{{ endif }}"}), "Construction OK!");
        ok(c.assert.assertListSize(6), "Root contains 6 elements.");
        equal(c._.getTree().length, 1, "Root contains 1 elements.");
        equal(c._.getTree()[0].tagName, "if", "First root tag should be if tag.");
        equal(c._.getTree()[0].content[0].html, "1", "Second level should be HTML '1'.");
        equal(c._.getTree()[0].content[1].tagName, "if", "Second level should also have an if tag 2.");
        equal(c.assert.assertRender(), "1", "Should contain '1', since only first if case is true.");

        ok(c = mcomponent({viewHtml : "{{ if (false) }}1{{ if (true) }}2{{ endif }}{{ endif }}"}), "Construction OK!");
        ok(c.assert.assertListSize(6), "Root contains 6 elements.");
        equal(c._.getTree().length, 1, "Root contains 1 elements.");
        equal(c._.getTree()[0].tagName, "if", "First root tag should be if tag.");
        equal(c._.getTree()[0].content[0].html, "1", "Second level should be HTML '1'.");
        equal(c._.getTree()[0].content[1].tagName, "if", "Second level should also have an if tag 3.");
        equal(c.assert.assertRender(), "", "Should contain '', since only second if case is true.");

        ok(c = mcomponent({viewHtml : "1{{ if (true) }}2{{ if (true) }}3{{ endif }}4{{ endif }}5"}), "Construction OK!");
        ok(c.assert.assertListSize(9), "Root contains 9 elements.");
        equal(c._.getTree().length, 3, "Root contains 3 elements.");
        equal(c._.getTree()[0].html, "1", "First root tag should be if tag.");
        equal(c._.getTree()[1].tagName, "if", "Second root tag should be if tag.");
        equal(c._.getTree()[1].content[0].html, "2", "Second level should be HTML '2'.");
        equal(c._.getTree()[1].content[1].tagName, "if", "Second level should also have an if tag 4.");
        equal(c.assert.assertRender(), "12345", "Should contain '12345'.");

        ok(c = mcomponent({viewHtml : "1{{ if (true) }}2{{ if (false) }}3{{ endif }}4{{ endif }}5"}), "Construction OK!");
        ok(c.assert.assertListSize(9), "Root contains 9 elements.");
        equal(c._.getTree().length, 3, "Root contains 3 elements.");
        equal(c._.getTree()[0].html, "1", "First root tag should be if tag.");
        equal(c._.getTree()[1].tagName, "if", "Second root tag should be if tag.");
        equal(c._.getTree()[1].content[0].html, "2", "Second level should be HTML '2'.");
        equal(c._.getTree()[1].content[1].tagName, "if", "Second level should also have an if tag.");
        equal(c.assert.assertRender(), "1245", "Should contain '1245'.");

        ok(c = mcomponent({viewHtml : "1{{ if (false) }}2{{ if (true) }}3{{ endif }}4{{ endif }}5"}), "Construction OK!");
        ok(c.assert.assertListSize(9), "Root contains 9 elements.");
        equal(c._.getTree().length, 3, "Root contains 3 elements.");
        equal(c._.getTree()[0].html, "1", "First root tag should be if tag.");
        equal(c._.getTree()[1].tagName, "if", "Second root tag should be if tag.");
        equal(c._.getTree()[1].content[0].html, "2", "Second level should be HTML '2'.");
        equal(c._.getTree()[1].content[1].tagName, "if", "Second level should also have an if tag 5.");
        equal(c.assert.assertRender(), "15", "Should contain '15'.");

        ok(c = mcomponent({model : {name : "mattias"}, viewHtml : "1{{ if (true) }}2{{ if (this.model.name == 'mattias') }}3{{ endif }}4{{ endif }}5"}), "Construction OK!");
        ok(c.assert.assertListSize(9), "Root contains 9 elements.");
        equal(c._.getTree().length, 3, "Root contains 3 elements.");
        equal(c._.getTree()[0].html, "1", "First root tag should be if tag.");
        equal(c._.getTree()[1].tagName, "if", "Second root tag should be if tag.");
        equal(c._.getTree()[1].content[0].html, "2", "Second level should be HTML '2'.");
        equal(c._.getTree()[1].content[1].tagName, "if", "Second level should also have an if tag 6.");
        equal(c.assert.assertRender(), "12345", "Should contain '12345', then if with this.model works.");

        ok(c = mcomponent({model : {name : "mattias"}, viewHtml : "1{{ if (true) }}2{{ if (this.model.name != 'mattias') }}3{{ endif }}4{{ endif }}5"}), "Construction OK!");
        ok(c.assert.assertListSize(9), "Root contains 9 elements.");
        equal(c._.getTree().length, 3, "Root contains 3 elements.");
        equal(c._.getTree()[0].html, "1", "First root tag should be if tag.");
        equal(c._.getTree()[1].tagName, "if", "Second root tag should be if tag.");
        equal(c._.getTree()[1].content[0].html, "2", "Second level should be HTML '2'.");
        equal(c._.getTree()[1].content[1].tagName, "if", "Second level should also have an if tag 7.");
        equal(c.assert.assertRender(), "1245", "Should contain '1245', then if with this.model works.");

        ok(c = mcomponent({model : {name : "mattias"}, viewHtml : "1{{ if (true) }}2{{ if (model.name == 'mattias') }}3{{ endif }}4{{ endif }}5"}), "Construction OK!");
        ok(c.assert.assertListSize(9), "Root contains 9 elements.");
        equal(c._.getTree().length, 3, "Root contains 3 elements.");
        equal(c._.getTree()[0].html, "1", "First root tag should be if tag.");
        equal(c._.getTree()[1].tagName, "if", "Second root tag should be if tag.");
        equal(c._.getTree()[1].content[0].html, "2", "Second level should be HTML '2'.");
        equal(c._.getTree()[1].content[1].tagName, "if", "Second level should also have an if tag 8.");
        equal(c.assert.assertRender(), "12345", "Should contain '12345', then if with model (without this.model) works.");

        ok(c = mcomponent({model : {name : "mattias"}, viewHtml : "1{{ if (true) }}2{{ if (model.name != 'mattias') }}3{{ endif }}4{{ endif }}5"}), "Construction OK!");
        ok(c.assert.assertListSize(9), "Root contains 9 elements.");
        equal(c._.getTree().length, 3, "Root contains 3 elements.");
        equal(c._.getTree()[0].html, "1", "First root tag should be if tag.");
        equal(c._.getTree()[1].tagName, "if", "Second root tag should be if tag.");
        equal(c._.getTree()[1].content[0].html, "2", "Second level should be HTML '2'.");
        equal(c._.getTree()[1].content[1].tagName, "if", "Second level should also have an if tag 9.");
        equal(c.assert.assertRender(), "1245", "Should contain '1245', then if with model (without this.model) works.");

        ok(c = mcomponent({model : {name : "mattias"}, viewHtml : "1{{ if (this.model.name == 'mattias') }}2{{ endif }}3"}), "Construction OK!");
        equal(c.assert.assertRender(), "123", "If with 'this.model.name'.");

        ok(c = mcomponent({model : {name : "mattias"}, viewHtml : "1{{ if (model.name == 'mattias') }}2{{ endif }}3"}), "Construction OK!");
        equal(c.assert.assertRender(), "123", "Same again, but with 'model.name' instead of 'this.model.name'.");

    });

    test("else, elseif tags", function() {
        var c;

        ok(c = mcomponent({viewHtml : "{{ if (true) }}ok{{ else }}fail{{ endif }}"}), "Construction OK!");
        equal(c._.getTree().length, 1, "Root contains only one element.");
        equal(c.assert.assertRender(), "ok", "Should contain 'ok', since if case is true.");

        ok(c = mcomponent({viewHtml : "{{ if (false) }}fail1{{ elseif (true) }}ok{{ else }}fail2{{ endif }}"}), "Construction OK!");
        equal(c._.getTree().length, 1, "Root contains only one element.");
        equal(c.assert.assertRender(), "ok", "Should contain 'ok', since if case is true.");

        ok(c = mcomponent({viewHtml : "{{ if (false) }}fail{{ else }}ok{{ endif }}"}), "Construction OK!");
        equal(c._.getTree().length, 1, "Root contains only one element.");
        equal(c.assert.assertRender(), "ok", "Should contain 'ok', since if case is true.");

        ok(c = mcomponent({viewHtml : "{{ if (false) }}fail1{{ elseif (true) }}{{ if (true) }}ok{{ else }}innerfail{{ endif }}{{ else }}fail2{{ endif }}"}), "Construction OK!");
        equal(c._.getTree().length, 1, "Root contains only one element.");
        equal(c.assert.assertRender(), "ok", "Should contain 'ok', since if case is true.");

        ok(c = mcomponent({viewHtml : "{{ if (false) }}fail1{{ elseif (true) }}{{ if (false) }}ok{{ else }}innerfail{{ endif }}{{ else }}fail2{{ endif }}"}), "Construction OK!");
        equal(c._.getTree().length, 1, "Root contains only one element.");
        equal(c.assert.assertRender(), "innerfail", "Should contain 'innerfail', since if case is true.");

        ok(c = mcomponent({viewHtml : "{{ if (false) }}fail1{{ elseif (false) }}fail2{{ elseif (false) }}fail3{{ elseif (false) }}fail4{{ elseif (false) }}fail5{{ else }}ok{{ endif }}"}), "Construction OK!");
        equal(c._.getTree().length, 1, "Root contains only one element.");
        equal(c.assert.assertRender(), "ok", "Should contain 'ok', since if case is true.");

        ok(c = mcomponent({viewHtml : "{{ if (false) }}fail1{{ elseif (false) }}fail2{{ elseif (true) }}ok{{ elseif (false) }}fail4{{ elseif (true) }}fail5{{ else }}ok{{ endif }}"}), "Construction OK!");
        equal(c._.getTree().length, 1, "Root contains only one element.");
        equal(c.assert.assertRender(), "ok", "Should contain 'ok', since if case is true.");

        ok(c = mcomponent({viewHtml : "{{ if (false) }}fail1{{ elseif (false) }}fail2{{ elseif (true) }}ok{{ elseif (true) }}fail4{{ elseif (true) }}fail5{{ else }}ok{{ endif }}"}), "Construction OK!");
        equal(c._.getTree().length, 1, "Root contains only one element.");
        equal(c.assert.assertRender(), "ok", "Should contain 'ok', since if case is true.");

        // Malformed
        //{{ if (this.model.users }}

        ok(c = mcomponent({viewHtml : "{{ if (false) }}fail1{{ elseif (false) }}fail2{{ elseif (true) }}ok{{ elseif (true) }}fail4{{ elseif (true) }}fail5{{ else }}ok{{ endif }}"}), "Construction OK!");
        equal(c._.getTree().length, 1, "Root contains only one element.");
        equal(c.assert.assertRender(), "ok", "Should contain 'ok', since if case is true.");


    });

    test("API", function() {
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

        ok(c = mcomponent({model : model, viewHtml : view}), "Construction OK!");
        equal(c.assert.assertRender(), "funkar", "api.lookup() should result in 'funkar'.");

        view = "{{ push user }}" +
            "{{ showjs api.lookup('displaySettings.list.showName') }}" +
            "{{ endpush }}";

        ok(c = mcomponent({model : model, viewHtml : view}), "Construction OK!");
        equal(c.assert.assertRender(), "yes", "api.lookup() should find 'yes'.");

        ok(c = mcomponent({
            model : { list : ["mattias", "marcus", "johan"]},
            iter : {
                userListIter : { itemsPerPage : 1 }
            },
            viewHtml : "{{ niter userListIter list }}{{ push api.getIterator('userListIter') }}{{ itemsPerPage }}{{ endpush }}{{ endniter }}"}), "Construction OK lets go!!");
        equal(c.assert.assertRender(), "1", "Should contain 1 one times.");


        ok(c = mcomponent({
            model : { list : ["mattias", "marcus", "johan"]},
            iter : {
                userListIter : { itemsPerPage : 2 }
            },
            viewHtml : "{{ niter userListIter list }}{{ push api.getIterator('userListIter') }}{{ itemsPerPage }}{{ endpush }}{{ endniter }}"}), "Construction OK lets go!!");
        equal(c.assert.assertRender(), "22", "Should contain 2 two times.");

        ok(c = mcomponent({
            model : { list : ["mattias", "marcus", "johan"]},
            iter : {
                userListIter : { itemsPerPage : 3 }
            },
            viewHtml : "{{ niter userListIter list }}{{ push api.getIterator('userListIter') }}{{ itemsPerPage }}{{ endpush }}{{ endniter }}"}), "Construction OK lets go!!");
        equal(c.assert.assertRender(), "333", "Should contain 3 three times.");

        ok(c = mcomponent({
            model : { list : ["mattias", "marcus", "johan"]},
            iter : {
                userListIter : { itemsPerPage : 3 }
            },
            viewHtml : "{{ niter userListIter list }}{{ push api.getIterator('userListIter') }}{{ itemsShowing }}{{ endpush }}{{ endniter }}"}), "Construction OK lets go!!");
        equal(c.assert.assertRender(), "333", "Should contain 333. Ok!");

        var i;

        ok(c = mcomponent({
            model : { list : ["mattias", "marcus", "johan"]},
            iter : {
                userListIter : { itemsPerPage : 1 }
            },
            viewHtml : "{{ niter userListIter list }}{{ push api.getIterator('userListIter') }}{{ itemsShowing }}{{ endpush }}{{ endniter }}"}), "Construction OK lets go!!");
        equal(c.assert.assertRender(), "1", "Should contain 1 at first.");
        ok(i = c.getIterator('userListIter'), "Getting iterator should work, after compiling and running the view at least once.");
        if (i) i.showAllItems();
        equal(c.assert.assertRender(), "333", "Should contain 333.");

        ok(c = mcomponent({
            model : { list : ["mattias", "marcus", "johan"]},
            iter : {
                userListIter : { itemsPerPage : 1 }
            },
            viewHtml : "{{ niter userListIter list }}{{ push api.getIterator('userListIter') }}1{{ showingAllItems }}{{ endpush }}{{ endniter }}"}), "Construction OK lets go!!");
        equal(c.assert.assertRender(), "1false", "Should contain false at first.");
        ok(i = c.getIterator('userListIter'), "Getting iterator should work, after compiling and running the view at least once.");
        if (i) i.showAllItems();
        equal(c.assert.assertRender(), "1true1true1true", "Should contain truetruetrue.");

        ok(c = mcomponent({
            model : { list : ["mattias", "marcus", "johan"]},
            iter : {
                userListIter : { itemsPerPage : 1 }
            },
            viewHtml : "{{ niter userListIter list }}{{ push api.getIterator('userListIter') }}1_{{ itemsTotal }}{{ endpush }}{{ endniter }}"}), "Construction OK lets go!!");
        equal(c.assert.assertRender(), "1_3", "itemsTotal = 3");

        ok(c = mcomponent({
            model : { list : ["mattias", "marcus", "johan", "prutt"]},
            iter : {
                userListIter : { itemsPerPage : 1 }
            },
            viewHtml : "{{ niter userListIter list }}{{ push api.getIterator('userListIter') }}1_{{ itemsTotal }}{{ endpush }}{{ endniter }}"}), "Construction OK lets go!!");
        equal(c.assert.assertRender(), "1_4", "itemsTotal = 4");

        ok(c = mcomponent({
            model : { list : ["mattias", "marcus", "johan", "prutt"]},
            iter : {
                userListIter : { itemsPerPage : 10 }
            },
            viewHtml : "{{ niter userListIter list }}{{ push api.getIterator('userListIter') }}{{ itemsTotal }}{{ endpush }}{{ endniter }}"}), "Construction OK lets go!!");
        equal(c.assert.assertRender(), "4444", "itemsTotal = 4 when itemsPerPage is higher than model.length");

        ok(c = mcomponent({
            model : { list : ["mattias", "marcus", "johan", "prutt"]},
            iter : {
                userListIter : { itemsPerPage : 10 }
            },
            viewHtml : "{{ niter userListIter list }}{{ push api.getIterator('userListIter') }}{{ itemsShowing }}{{ endpush }}{{ endniter }}"}), "Construction OK lets go!!");
        equal(c.assert.assertRender(), "4444", "itemsShowing = 4 when itemsPerPage is higher than model.length");

        ok(c = mcomponent({
            model : "mattias",
            viewHtml : "{{ showjs api.getRootModel() }}"
        }), "Construction OK lets go!!");
        equal(c.assert.assertRender(), "mattias", "api.getRootModel() should return root model.");

        ok(c = mcomponent({
            model : { name : "mattias"},
            viewHtml : "{{ showjs api.getRootModel().name }}"
        }), "Construction OK lets go!!");
        equal(c.assert.assertRender(), "mattias", "api.getRootModel() should return root model.");

    });

    test("large view test", function() {
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

        ok(c = mcomponent({viewHtml : view, model : m, iter : {users : {}}}), "Construction OK!");
        equal(c._.getTree().length, 1, "Root contains only one element.");
        ok(result = c.assert.assertRender(), "Rendering of large view should be OK!");
        equal(result, "yayName:MattiasMale:YesAge:31Name:MustMale:YesAge:28Name:JennyMale:NoAge:27", "And the result should be correct.");

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

        ok(c = mcomponent({viewHtml : view, model : m, iter : {users : {}}}), "Construction niter over user only!");
        ok(result = c.assert.assertRender(), "niter over user only");

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


        ok(c = mcomponent({viewHtml : view, model : m, iter : {users : {}}}), "Construction location and city only!");
        ok(result = c.assert.assertRender(), "location and city only");

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

        ok(c = mcomponent({viewHtml : view, model : m, iter : {users : {}}}), "Construction location and country only!");
        ok(result = c.assert.assertRender(), "location and country only!");

        view = "{{ if (this.model) }} yay we have a model!\n" +

            "    {{ if (this.model.location) }}\n" +

            "        {{ push location }}\n" +
            "        {{ endpush }}\n" +

            "    {{ else }}\n" +
            "    {{ endif }}\n" +

            "{{ endif }}\n";


        ok(c = mcomponent({viewHtml : view, model : m, iter : {users : {}}}), "Construction niter with location and both city and country without output and if cases and push!");
        ok(result = c.assert.assertRender(), "niter with location and both city and country without output and if cases and push!");

        view = "{{ if (this.model) }} yay we have a model!\n" +

            "    {{ if (this.model.location) }}\n" +

            "        {{ push location }}\n" +
            "            {{ push city }}\n" +
            "            {{ endpush }}\n" +
            "        {{ endpush }}\n" +

            "    {{ else }}\n" +
            "    {{ endif }}\n" +

            "{{ endif }}\n";


        ok(c = mcomponent({viewHtml : view, model : m, iter : {users : {}}}), "Construction niter with location and both city and country without output and if cases and push country!");
        ok(result = c.assert.assertRender(), "niter with location and both city and country without output and if cases and push country!");

        view = "{{ if (this.model) }} yay we have a model!\n" +

            "    {{ if (this.model.location) }}\n" +

            "        {{ push location }}\n" +
            "            {{ push country }}\n" +
            "            {{ endpush }}\n" +
            "        {{ endpush }}\n" +

            "    {{ else }}\n" +
            "    {{ endif }}\n" +

            "{{ endif }}\n";


        ok(c = mcomponent({viewHtml : view, model : m, iter : {users : {}}}), "Construction niter with location and both city and country without output and if cases and push city!");
        ok(result = c.assert.assertRender(), "niter with location and both city and country without output and if cases and push city!");

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


        ok(c = mcomponent({viewHtml : view, model : m, iter : {users : {}}}), "Construction niter with location and both city and country without output and if cases!");
        ok(result = c.assert.assertRender(), "niter with location and both city and country without output and if cases!");

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


        ok(c = mcomponent({viewHtml : view, model : m, iter : {users : {}}}), "Construction niter with location and both city and country without output!");
        ok(result = c.assert.assertRender(), "niter with location and both city and country without output!");

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


        ok(c = mcomponent({viewHtml : view, model : m, iter : {users : {}}}), "Construction niter with location and both city and country!");
        ok(result = c.assert.assertRender(), "niter with location and both city and country!");

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

        ok(c = mcomponent({viewHtml : view, model : m, iter : {users : {}}}), "Construction full view!");
        ok(result = c.assert.assertRender(), "full view!");

    });

    test("showing other things than model properties", function() {

        var c;

        ok(c = mcomponent({model : {name : "mattias"}, viewHtml : "{{ show api.lookup('name'); }}"}), "Construction OK!");
        equal(c.assert.assertRender(), "mattias", "Should contain 'mattias' after API lookup.");

        ok(c = mcomponent({model : {name : "mattias"}, viewHtml : "{{ show Math.floor(1.5); }}"}), "Construction OK!");
        equal(c.assert.assertRender(), "1", "Should contain '1' after Math.floor.");

        ok(c = mcomponent({model : {name : "mattias"}, viewHtml : "{{ Math.floor(1.5) }}"}), "Construction OK!");
        equal(c.assert.assertRender(), "1", "Should contain '1' after Math.floor.");

    });

    test("showing model properties that doesn't exist", function() {

        var c;
        var model = {name : "mattias"};

        ok(c = mcomponent({
                model : model,
                viewHtml : "{{ age }}"}
        ), "Construction OK!");

        ok(c.assert.assertRender() !== "", "Should contain an error message after API lookup.");
        model.age = 32;
        equal(c.assert.assertRender(), "32", "Should now contain lookup result.");


    });

    test("show tag", function() {

        var c;

        ok(c = mcomponent({model : {name : "mattias"}, viewHtml : "{{ show name }}"}), "Construction OK!");
        equal(c.assert.assertRender(), "mattias", "Should contain 'mattias'.");

        ok(c = mcomponent({model : {user : {name : "marcus"}}, viewHtml : "{{ show user.name }}"}), "Construction OK!");
        equal(c.assert.assertRender(), "marcus", "Should contain 'marcus'.");

        ok(c = mcomponent({model : "marcus", viewHtml : "{{ show }}"}), "Construction OK!");
        equal(c.assert.assertRender(), "marcus", "Should contain 'marcus'.");

        ok(c = mcomponent({model : { list : [
            {url : "www.google.com" },
            {url : "www.facebook.com"}
        ]}, viewHtml : "{{ model.list[0].url }}"}), "Construction OK!");
        equal(c.assert.assertRender(), "www.google.com", "Should contain 'www.google.com' using lookup with runFunction().");

        ok(c = mcomponent({model : { list : [
            {url : "www.google.com" },
            {url : "www.facebook.com"}
        ]}, viewHtml : "{{ model.list[1].url }}"}), "Construction OK!");
        equal(c.assert.assertRender(), "www.facebook.com", "Should contain 'www.facebook.com' using lookup with runFunction().");

        ok(c = mcomponent({model : { list : [
            {url : "www.google.com" },
            {url : "www.facebook.com"}
        ]}, viewHtml : "{{ showjs model.list[0].url }}"}), "Construction OK!");
        equal(c.assert.assertRender(), "www.google.com", "Should contain 'www.google.com' using showjs.");

    });

    test("push tag", function() {

        var c;

        ok(c = mcomponent({model : {user : {name : "marcus"}, test : "yeah"}, viewHtml : "{{ push user }}{{ endpush }}"}), "Construction OK!");
        equal(c.assert.assertRender(), "", "Should contain nothing.");

        ok(c = mcomponent({model : {user : {name : "marcus"}, test : "yeah"}, viewHtml : "{{ push user }}{{ show name }}{{ endpush }}"}), "Construction OK!");
        equal(c.assert.assertRender(), "marcus", "Should contain 'marcus'.");

        ok(c = mcomponent({model : {user : {name : "marcus"}, testball : "yeah"}, viewHtml : "{{ push user }}{{ show testball }}{{ endpush }}"}), "Construction OK!");
        equal(c.assert.assertRender(), "yeah", "Should contain 'yeah' instead.");

        ok(c = mcomponent({model : {
            db : {
                user : {
                    name : "marcus"
                },
                testyeah : "yeah"
            }
        }, viewHtml : "{{ push db.user }}{{ show testyeah }}{{ endpush }}"}), "Construction OK!");
        ok(c.assert.assertRender() !== "", "Pushing two level property. Should contain something since model stack lookup should fail and cause error.");

        ok(c = mcomponent({
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
        ), "Construction OK!");
        raises(function() {
            c.assert.assertRender();
        }, "Pushing two level property. Should contain something since model stack lookup should fail and cause error.")

        ok(c = mcomponent({model : {
            db : {
                user : {
                    name : "marcus"
                }
            },
            test : "yeah"
        }, viewHtml : "{{ push db.user }}{{ show test }}{{ endpush }}"}), "Construction OK!");
        equal(c.assert.assertRender(), "yeah", "Pushing two level property. Should contain 'yeah'.");

        ok(c = mcomponent({model : {db : {user : {name : "marcus"}, test : "yeah"}}, viewHtml : "{{ push db.user }}{{ show name }}{{ endpush }}"}), "Construction OK!");
        equal(c.assert.assertRender(), "marcus", "Pushing two level property. Should contain 'marcus'.");


    });

    test("iter tag", function() {

        var c;

        ok(c = mcomponent({model : {
            list : ["mattias", "marcus", "johan"]
        }, viewHtml : "{{ iter list }}{{ enditer }}"}), "Construction OK!");
        equal(c.assert.assertRender(), "", "Should contain nothing.");

        ok(c = mcomponent({
            model : {
                list : ["mattias", "marcus", "johan"]
            }, viewHtml : "{{ iter list }}{{ enditer }}"}), "Construction OK!");
        equal(c.assert.assertRender(), "", "Should contain nothing.");

        ok(c = mcomponent({
            model : {
                list : ["mattias"]
            }, viewHtml : "{{ iter list }}{{ show }}{{ enditer }}"}), "Construction OK!");
        equal(c.assert.assertRender(), "mattias", "Should contain 'mattias'.");

        ok(c = mcomponent({
            model : {
                list : ["mattias", "marcus", "johan"]
            }, viewHtml : "{{ iter list }}{{ show }}{{ enditer }}"}), "Construction OK!");
        equal(c.assert.assertRender(), "mattiasmarcusjohan", "Should contain 'mattiasmarcusjohan'.");

        ok(c = mcomponent({
            model : {
                list : []
            }, viewHtml : "{{ iter list }}{{ show }}{{ enditer }}"}), "Construction OK!");
        equal(c.assert.assertRender(), "", "Should contain nothing.");

        ok(c = mcomponent({
            model : {
                list : ["mattias", "marcus", "johan"]
            }, viewHtml : "{{ iter list }}{{ context index }}{{ enditer }}"}), "Construction OK!");
        equal(c.assert.assertRender(), "012", "Iterator context should give us '012' in the result.");

        ok(c = mcomponent({
            model : {
                list : ["mattias", "marcus", "johan"]
            }, viewHtml : "{{ iter list }}{{ show context.index }}{{ enditer }}"}), "Construction OK!");
        equal(c.assert.assertRender(), "012", "Iterator context should give us '012' in the result when using show and context.");

        ok(c = mcomponent({
            model : {
                list : ["mattias", "marcus", "johan"]
            }, viewHtml : "{{ iter list }}{{ if (context.index == 1) }}{{ show context.index }}{{ endif }}{{ enditer }}"}), "Construction OK!");
        equal(c.assert.assertRender(), "1", "If-case with context in condition. Iterator context should give us '1' in the result when using show and context.");

        ok(c = mcomponent({
            model : {
                list : ["mattias", "marcus", "johan"]
            }, viewHtml : "{{ iter list }}{{ context.index }}{{ enditer }}"}), "Construction OK!");
        equal(c.assert.assertRender(), "012", "Iterator context should give us '012' in the result when using no tag, and context.");

        ok(c = mcomponent({
            model : {
                list : ["mattias", "marcus", "johan"]
            }, viewHtml : "{{ iter list }}{{ context size }}{{ enditer }}"}), "Construction OK!");
        equal(c.assert.assertRender(), "333", "Iterator context should give us '333' in the result.");

        ok(c = mcomponent({
            model : {
                list : ["mattias", "marcus", "johan"]
            }, viewHtml : "{{ iter list }}{{ show context.size }}{{ enditer }}"}), "Construction OK!");
        equal(c.assert.assertRender(), "333", "Iterator context should give us '333' in the result.");

        ok(c = mcomponent({
            model : {
                list : ["mattias", "marcus", "johan"]
            }, viewHtml : "{{ iter list }}{{ context.size }}{{ enditer }}"}), "Construction OK!");
        equal(c.assert.assertRender(), "333", "Iterator context should give us '333' in the result.");

        ok(c = mcomponent({
            model : {
                list : ["mattias", "marcus", "johan"]
            }, viewHtml : "{{ iter list }}{{ context parity }}{{ enditer }}"}), "Construction OK!");
        equal(c.assert.assertRender(), "evenoddeven", "Iterator context parity should give us 'evenoddeven' in the result.");

        ok(c = mcomponent({
            model : {
                list : ["mattias", "marcus", "johan"]
            },
            viewHtml : "{{ iter listaxe }}{{ enditer }}",
            throwOnError : true
        }), "Construction OK!");
        raises(function() {
            c.assert.assertRender();
        }, "This should not work, 'lista' property does not exist.");

        ok(c = mcomponent({
            model : {
                test : 123
            }, viewHtml : "{{ iter test }}{{ enditer }}",
            throwOnError : true
        }), "Construction OK!");
        raises(function() {
            c.assert.assertRender();
        }, "This should not work, 'test' is not a list.");

        ok(c = mcomponent({
            model : {
                test : {age : 80}
            }, viewHtml : "{{ iter test }}{{ enditer }}",
            throwOnError : true
        }), "Construction OK!");
        raises(function() {
            c.assert.assertRender();
        }, "This should not work, 'test' is not a list.");

        ok(c = mcomponent({
            model : {
                test : "hejhej"
            }, viewHtml : "{{ iter test }}{{ enditer }}",
            throwOnError : true
        }), "Construction OK!");
        raises(function() {
            c.assert.assertRender();
        }, "This should not work, 'test' is not a list.");

    });

    test("niter tag, using show more", function() {

        var c;
        var i;
        var a = 3;
        var b = 1;

        raises(function() {
            c = mcomponent({
                model : {
                    list : ["mattias", "marcus", "johan"]
                },
                viewHtml : "{{ niter userListIter list }}{{ endniter }}",
                throwOnError : true
            });
        }, "Construction should fail since there is no iterator config!");

        raises(function() {
            c.assert.assertRender();
        }, "Should throw error since we haven't declared an iterator configuration.");

        ok(c = mcomponent({
            model : {
                list : ["mattias", "marcus", "johan"]
            },
            iter : {
                userListIter : { itemsPerPage : 1 }
            },
            viewHtml : "{{ niter userListIter list }}{{ endniter }}"}), "Construction OK!");
        equal(c.assert.assertRender(), "", "Should contain nothing.");

        ok(c = mcomponent({
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
            viewHtml : "{{ niter userListIterYeah list }}{{ show }}{{ endniter }}"}), "Construction OK!");
        equal(b, 1, "b should be 1 first.");
        equal(c.assert.assertRender(), "mattias", "Should first element only.");
        equal(b, 2, "b should be 2 after whenNotAllItemsAreShowing has been run.");
        ok(i = c.getIterator("userListIterYeah"), "Should be able to get iterator context.");
        i.showMoreItems();
        equal(c.assert.assertRender(), "mattiasmarcus", "Should contain one more element.");
        equal(a, 3, "a should be 3 first.");
        i.showMoreItems();
        equal(c.assert.assertRender(), "mattiasmarcusjohan", "Should contain all three elements.");
        equal(a, 5, "a should now be 5 since callback changed the value.");
        i.showMoreItems();
        equal(c.assert.assertRender(), "mattiasmarcusjohan", "Should contain all three elements again.");

        a = 3;

        ok(c = mcomponent({
            model : {list : ["mattias", "marcus", "johan"]},
            iter : {
                userListIterYeah : {
                    itemsPerPage : 1,
                    whenAllItemsAreShowing : function() {
                        a = 5;
                    }
                }
            },
            viewHtml : "{{ niter userListIterYeah list }}{{ show }}{{ endniter }}"}), "Construction OK!");
        equal(c.assert.assertRender(), "mattias", "Should first element only.");
        ok(i = c.getIterator("userListIterYeah"), "Should be able to get iterator context.");
        equal(c.getIterator("userListIterYeahASFSA"), undefined, "Trying to get iterator context that doesn't exist should return undefined.");
        equal(a, 3, "a should be 3 first.");
        i.showAllItems();
        equal(c.assert.assertRender(), "mattiasmarcusjohan", "Should show all elements.");
        equal(a, 5, "a should now be 5 since callback changed the value.");

        // TODO: Add variable that flips back and fourth between showing not all/all.
    });

    test("niter tag, using pages", function() {

        var c;
        var i;

        ok(c = mcomponent({
            model : {
                list : []
            },
            iter : {
                userListIter : {
                    itemsPerPage : 2,
                    usePages : true
                }
            },
            viewHtml : "{{ niter userListIter list }}{{ show }}{{ endniter }}"}), "Construction OK!");
        equal(c.assert.assertRender(), "", "Should be empty.");
        ok(i = c.getIterator("userListIter"));
        equal(i.getPageCount(), 0);
        equal(i.getCurrentPage(), 0);
        i.showNextPage();
        equal(c.assert.assertRender(), "", "Should still be empty.");
        equal(i.getCurrentPage(), 0);
        i.showNextPage();
        equal(c.assert.assertRender(), "", "Should still be empty.");
        equal(i.getCurrentPage(), 0);
        i.showPrevPage();
        equal(c.assert.assertRender(), "", "Should still be empty.");
        equal(i.getCurrentPage(), 0);
        i.showPrevPage();
        equal(c.assert.assertRender(), "", "Should still be empty.");
        equal(i.getCurrentPage(), 0);
        i.showPrevPage();
        equal(c.assert.assertRender(), "", "Should still be empty.");
        equal(i.getCurrentPage(), 0);

        ok(c = mcomponent({
            model : {
                list : ["mattias", "marcus", "johan", "butters", "stan"]
            },
            iter : {
                userListIter : {
                    itemsPerPage : 2,
                    usePages : true
                }
            },
            viewHtml : "{{ niter userListIter list }}{{ show }}{{ endniter }}"}), "Construction OK!");
        equal(c.assert.assertRender(), "mattiasmarcus", "Should show first two element.");
        ok(i = c.getIterator("userListIter"));
        equal(i.getPageCount(), 3);
        i.showPrevPage();
        equal(c.assert.assertRender(), "mattiasmarcus", "Should show first two again since it is first page.");
        i.showNextPage();
        equal(c.assert.assertRender(), "johanbutters", "Should show second two elements.");
        i.showNextPage();
        equal(c.assert.assertRender(), "stan", "Should show second two elements.");
        i.showNextPage();
        equal(c.assert.assertRender(), "stan", "Next page should be same, since it is last page.");
        i.showPrevPage();
        equal(c.assert.assertRender(), "johanbutters", "And now we go back to previous page.");

        ok(c = mcomponent({
            model : {
                list : ["mattias", "marcus", "johan", "butters", "stan"]
            },
            iter : {
                userListIter : {
                    itemsPerPage : 3,
                    usePages : true
                }
            },
            viewHtml : "{{ niter userListIter list }}{{ show }}{{ endniter }}"}), "Construction OK!");
        equal(c.assert.assertRender(), "mattiasmarcusjohan", "Should first element only.");
        ok(i = c.getIterator("userListIter"));
        equal(i.getPageCount(), 2);
        i.showPrevPage();
        equal(c.assert.assertRender(), "mattiasmarcusjohan", "Should show first two again since it is first page.");
        i.showNextPage();
        equal(c.assert.assertRender(), "buttersstan", "Should show page 2.");
        i.showNextPage();
        equal(c.assert.assertRender(), "buttersstan", "Same again.");
        i.showPrevPage();
        equal(c.assert.assertRender(), "mattiasmarcusjohan", "And now we go back to previous page.");

        ok(c = mcomponent({
            model : {
                list : ["mattias", "marcus", "johan", "butters", "stan"]
            },
            iter : {
                userListIter : {
                    itemsPerPage : 1,
                    usePages : true
                }
            },
            viewHtml : "{{ niter userListIter list }}{{ show }}{{ endniter }}"}), "Construction OK!");
        equal(c.assert.assertRender(), "mattias", "Should first element only.");
        ok(i = c.getIterator("userListIter"));
        equal(i.getPageCount(), 5);
        i.showPrevPage();
        equal(c.assert.assertRender(), "mattias");
        i.showNextPage();
        equal(c.assert.assertRender(), "marcus");
        i.showNextPage();
        equal(c.assert.assertRender(), "johan");
        i.showNextPage();
        equal(c.assert.assertRender(), "butters");
        i.showNextPage();
        equal(c.assert.assertRender(), "stan");
        i.showNextPage();
        equal(c.assert.assertRender(), "stan", "Next page should be same, since it is last page.");
        i.showPrevPage();
        equal(c.assert.assertRender(), "butters", "And now we go back to previous page.");

        ok(c = mcomponent({
            model : {
                list : ["mattias", "marcus", "johan", "butters", "stan"]
            },
            iter : {
                userListIter : {
                    itemsPerPage : 10,
                    usePages : true
                }
            },
            viewHtml : "{{ niter userListIter list }}{{ show }}{{ endniter }}"}), "Construction OK!");
        equal(c.assert.assertRender(), "mattiasmarcusjohanbuttersstan", "Should first element only.");
        ok(i = c.getIterator("userListIter"));
        equal(i.getPageCount(), 1);
        i.showPrevPage();
        equal(c.assert.assertRender(), "mattiasmarcusjohanbuttersstan");
        i.showNextPage();
        equal(c.assert.assertRender(), "mattiasmarcusjohanbuttersstan");
        i.showNextPage();
        equal(c.assert.assertRender(), "mattiasmarcusjohanbuttersstan");
        i.showNextPage();
        equal(c.assert.assertRender(), "mattiasmarcusjohanbuttersstan");
        i.showNextPage();
        equal(c.assert.assertRender(), "mattiasmarcusjohanbuttersstan");
        i.showPrevPage();
        equal(c.assert.assertRender(), "mattiasmarcusjohanbuttersstan", "And now we go back to previous page.");

        ok(c = mcomponent({
            model : {
                list : []
            },
            iter : {
                userListIter : {
                    itemsPerPage : 1,
                    usePages : true
                }
            },
            viewHtml : "{{ niter userListIter list }}{{ show }}{{ endniter }}"}), "Construction OK!");
        equal(c.assert.assertRender(), "", "Should first element only.");
        ok(i = c.getIterator("userListIter"));
        equal(i.getPageCount(), 0);
        i.showPrevPage();
        equal(c.assert.assertRender(), "");
        i.showNextPage();
        equal(c.assert.assertRender(), "");
        i.showNextPage();
        equal(c.assert.assertRender(), "");
        i.showNextPage();
        equal(c.assert.assertRender(), "");
        i.showNextPage();
        equal(c.assert.assertRender(), "");
        i.showNextPage();
        equal(c.assert.assertRender(), "");
        i.showPrevPage();
        equal(c.assert.assertRender(), "");

        /*************
         * Test showPage()
         */

        ok(c = mcomponent({
            model : {
                list : ["mattias", "marcus", "johan", "butters", "stan"]
            },
            iter : {
                userListIter : {
                    itemsPerPage : 2,
                    usePages : true
                }
            },
            viewHtml : "{{ niter userListIter list }}{{ show }}{{ endniter }}"}), "Construction OK!");
        equal(c.assert.assertRender(), "mattiasmarcus", "Should first element only.");
        ok(i = c.getIterator("userListIter"));
        equal(i.getPageCount(), 3);
        i.showPage(1);
        equal(c.assert.assertRender(), "johanbutters", "Should first element only.");

        /* Check that usePages = false causes showPage() to throw exception. */

        ok(c = mcomponent({
            model : {
                list : ["mattias", "marcus", "johan", "butters", "stan"]
            },
            iter : {
                userListIter : {
                    itemsPerPage : 2,
                    usePages : false
                }
            },
            viewHtml : "{{ niter userListIter list }}{{ show }}{{ endniter }}"}), "Construction OK!");
        equal(c.assert.assertRender(), "mattiasmarcus", "Should first element only.");
        ok(i = c.getIterator("userListIter"));
        raises(function() {
            i.showPage(1);
        }, "showPage should throw exception when usePages == false.");

        /*************
         * Test showPageWithItem() and showPageWithItemThat()
         */

        ok(c = mcomponent({
            model : {
                list : ["mattias", "marcus", "johan", "butters", "stan"]
            },
            iter : {
                userListIter : {
                    itemsPerPage : 2,
                    usePages : true
                }
            },
            viewHtml : "{{ niter userListIter list }}{{ show }}{{ endniter }}"}), "Construction OK!");
        equal(c.assert.assertRender(), "mattiasmarcus", "Should first element only.");
        ok(i = c.getIterator("userListIter"));
        equal(i.getPageCount(), 3);
        equal(i.getIndexForItem("johan"), 2, "getIndexForItem() should work.");
        i.showPageWithItem("johan");
        equal(c.assert.assertRender(), "johanbutters", "Should first element only.");
        i.showPageWithItem("butters");
        equal(c.assert.assertRender(), "johanbutters", "Should first element only.");
        i.showPageWithItem("stan");
        equal(c.assert.assertRender(), "stan", "Should first element only.");
        i.showPageWithItem("marcus");
        equal(c.assert.assertRender(), "mattiasmarcus", "Should first element only.");

        /************************
         *  Test showPageWithItemWhere()
         *************************/

        ok(c = mcomponent({
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
            viewHtml : "{{ niter userListIter list }}{{ name }}{{ endniter }}"}), "Construction OK!");
        equal(c.assert.assertRender(), "mattiasmarcus");
        ok(i = c.getIterator("userListIter"));
        equal(i.getPageCount(), 3);

        /* getIndexForItemWhere() */

        equal(i.getIndexForItemWhere(function(item) {
            return item.age == 6;
        }), 3, "getIndexForItemWhere() should work.");

        equal(i.getIndexForItemWhere(function(item) {
            return item.selected == true;
        }), 0, "getIndexForItemWhere() should work.");

        equal(i.getIndexForItemWhere(function(item) {
            return item.age == 32;
        }), 0, "getIndexForItemWhere() should work.");

        /* showPageWithItemIndex() */

        i.showPageWithItemIndex(-1);
        equal(c.assert.assertRender(), "mattiasmarcus");

        i.showPageWithItemIndex(0);
        equal(c.assert.assertRender(), "mattiasmarcus");

        i.showPageWithItemIndex(1);
        equal(c.assert.assertRender(), "mattiasmarcus");

        i.showPageWithItemIndex(2);
        equal(c.assert.assertRender(), "johanbutters");

        i.showPageWithItemIndex(3);
        equal(c.assert.assertRender(), "johanbutters");

        i.showPageWithItemIndex(4);
        equal(c.assert.assertRender(), "stan");

        i.showPageWithItemIndex(5);
        equal(c.assert.assertRender(), "stan");

        i.showPageWithItemIndex(6);
        equal(c.assert.assertRender(), "stan");

        /* showPageWithItemWhere() */

        i.showPageWithItemWhere(function(item) {
            return item.age == 6;
        });
        equal(c.assert.assertRender(), "johanbutters");

        i.showPageWithItemWhere(function(item) {
            return item.age == 8;
        });
        equal(c.assert.assertRender(), "stan");

        i.showPageWithItemWhere(function(item) {
            return item.age == 32;
        });
        equal(c.assert.assertRender(), "mattiasmarcus");

        i.showPageWithItemWhere(function(item) {
            return item.age == 31;
        });
        equal(c.assert.assertRender(), "johanbutters");

        i.showPageWithItemWhere(function(item) {
            return item.selected == true;
        });
        equal(c.assert.assertRender(), "mattiasmarcus");


    });

    test("niter tag, misc iterator functions", function() {

        /********************************************************
         * Check isOnFirstPage, etc, when more than one page.
         ********************************************************/

        var c;

        ok(c = mcomponent({
            model : {
                list : ["mattias", "marcus", "must", "johan", "kurt", "korv"]
            },
            iter : {
                userListIter : {
                    itemsPerPage : 2,
                    usePages : true
                }
            },
            viewHtml : "{{ niter userListIter list }}{{ show }}{{ endniter }}"}), "Construction OK!");
        ok(c.assert.assertRender());
        ok(i = c.getIterator("userListIter"));
        equal(i.getPageCount(), 3);
        equal(i.isOnFirstPage(), true, "Should be on first page.");
        equal(i.isOnLastPage(), false, "Should NOT be on last page.");
        equal(i.isOnFirstOrLastPage(), true, "Is on first OR last page, since we are on first.");
        equal(i.isOnFirstAndLastPage(), false, "Is NOT on first AND last page, since we are on first only.");

        /* Then second page */

        i.showNextPage();
        equal(i.getPageCount(), 3);
        equal(i.isOnFirstPage(), false, "Should NOT be on first page.");
        equal(i.isOnLastPage(), false, "Should NOT be on last page.");
        equal(i.isOnFirstOrLastPage(), false, "Is NOT on first OR last page, since we are on first.");
        equal(i.isOnFirstAndLastPage(), false, "Is NOT on first AND last page, since we are on first only.");

        /* Then third and last page */

        i.showNextPage();
        equal(i.getPageCount(), 3);
        equal(i.isOnFirstPage(), false, "Should NOT be on first page.");
        equal(i.isOnLastPage(), true, "Should be on last page.");
        equal(i.isOnFirstOrLastPage(), true, "Is on first OR last page, since we are on last.");
        equal(i.isOnFirstAndLastPage(), false, "Is NOT on first AND last page, since we are on first only.");

        /********************************************************
         * Check isOnFirstPage, etc, when only one page.
         ********************************************************/

        ok(c = mcomponent({
            model : {
                list : ["mattias", "marcus"]
            },
            iter : {
                userListIter : {
                    itemsPerPage : 2,
                    usePages : true
                }
            },
            viewHtml : "{{ niter userListIter list }}{{ show }}{{ endniter }}"}), "Construction OK!");
        ok(c.assert.assertRender());
        ok(i = c.getIterator("userListIter"));
        equal(i.getPageCount(), 1);
        equal(i.isOnFirstPage(), true, "Should be on first page.");
        equal(i.isOnLastPage(), true, "Should be on last page.");
        equal(i.isOnFirstOrLastPage(), true, "Is on first OR last page, since we are on first.");
        equal(i.isOnFirstAndLastPage(), true, "Is on first AND last page.");

        /********************************************************
         * Check getFirstIndexForCurrentPage, etc
         ********************************************************/

        ok(c = mcomponent({
            model : {
                list : ["mattias", "marcus", "must", "johan", "kurt", "korv"]
            },
            iter : {
                userListIter : {
                    itemsPerPage : 2,
                    usePages : true
                }
            },
            viewHtml : "{{ niter userListIter list }}{{ show }}{{ endniter }}"}), "Construction OK!");

        ok(c.assert.assertRender());
        ok(i = c.getIterator("userListIter"));

        equal(i.getPageCount(), 3);
        equal(i.getCurrentPage(), 0);

        equal(i.getFirstIndexForCurrentPage(), 0);
        equal(i.getLastIndexForCurrentPage(), 1);
        i.showNextPage();
        equal(i.getFirstIndexForCurrentPage(), 2);
        equal(i.getLastIndexForCurrentPage(), 3);
        i.showNextPage();
        equal(i.getFirstIndexForCurrentPage(), 4);
        equal(i.getLastIndexForCurrentPage(), 5);
        i.showNextPage();
        equal(i.getFirstIndexForCurrentPage(), 4);
        equal(i.getLastIndexForCurrentPage(), 5);

        /********************************************************
         * Check getFirstItemForCurrentPage, etc
         ********************************************************/

        ok(c = mcomponent({
            model : {
                list : ["mattias", "marcus", "must", "johan", "kurt", "korv"]
            },
            iter : {
                userListIter : {
                    itemsPerPage : 2,
                    usePages : true
                }
            },
            viewHtml : "{{ niter userListIter list }}{{ show }}{{ endniter }}"}), "Construction OK!");

        ok(c.assert.assertRender());
        ok(i = c.getIterator("userListIter"));

        equal(i.getPageCount(), 3);
        equal(i.getCurrentPage(), 0);

        equal(i.getFirstItemOnCurrentPage(), "mattias");
        equal(i.getLastItemOnCurrentPage(), "marcus");
        i.showNextPage();
        equal(i.getFirstItemOnCurrentPage(), "must");
        equal(i.getLastItemOnCurrentPage(), "johan");
        i.showNextPage();
        equal(i.getFirstItemOnCurrentPage(), "kurt");
        equal(i.getLastItemOnCurrentPage(), "korv");
        i.showNextPage();
        equal(i.getFirstItemOnCurrentPage(), "kurt");
        equal(i.getLastItemOnCurrentPage(), "korv");

    });

    test("niter tag, using iterator before rendering", function() {
        ok(c = mcomponent({
            model : {
                list : ["mattias", "marcus", "must", "johan"]
            },
            iter : {
                userListIter : {
                    itemsPerPage : 2,
                    usePages : true
                }
            },
            viewHtml : "{{ niter userListIter list }}{{ show }}{{ endniter }}"}), "Construction OK!");
        ok(i = c.getIterator("userListIter"));
        equal(i.getPageCount(), 0);
        equal(i.getCurrentPage(), 0);
        i.showNextPage();
        equal(i.getCurrentPage(), 1);
        equal(c.assert.assertRender(), "mustjohan", "Should contain page 2.");

    });

    test("niter tag, using showPageWithItemWhere using an external model", function() {
        var model = {
            list : ["mattias", "marcus", "must", "johan"]
        };

        ok(c = mcomponent({
            model : model,
            iter : {
                userListIter : {
                    itemsPerPage : 2,
                    usePages : true
                }
            },
            viewHtml : "{{ niter userListIter list }}{{ show }}{{ endniter }}"}), "Construction OK!");
        ok(i = c.getIterator("userListIter"), "Iterator should be available.");
        equal(i.getPageCount(), 0, "No page count yet, since there is no model.");
        equal(i.getCurrentPage(), 0, "Current page starts at 0.");
        raises(function() {
            i.showPageWithItemWhere(function(item) {
                return item == "must";
            });
        }, "Should throw exception, it cannot lookup the item on the list, since the list is still undefined.");

        i.setModel(model.list);
        i.showPageWithItemWhere(function(item) {
            return item == "must";
        });

        equal(i.getCurrentPage(), 1);
        equal(c.assert.assertRender(), "mustjohan", "Should contain second page.");

        i.showNextPage();
        equal(i.getCurrentPage(), 1);
        equal(c.assert.assertRender(), "mustjohan", "Should contain page 2.");
    });

    test("niter tag, pages callbacks", function() {
        var c;
        var a = 1;
        var i;

        ok(c = mcomponent({
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
            viewHtml : "{{ niter userListIter list }}{{ show }}{{ endniter }}"}), "Construction OK!");
        equal(a, 1, "Should be 1 first.");
        equal(c.assert.assertRender(), "mattias", "Should first element only.");
        ok(i = c.getIterator("userListIter"));
        equal(i.getPageCount(), 5);
        equal(a, 2, "Should be 2 after callback has run.");

        a = 1;
        ok(c = mcomponent({
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
            viewHtml : "{{ niter userListIter list }}{{ show }}{{ endniter }}"}), "Construction OK!");
        equal(a, 1, "Should be 1 first.");
        equal(c.assert.assertRender(), "mattias", "Should first element only.");
        ok(i = c.getIterator("userListIter"));
        equal(i.getPageCount(), 5);
        equal(a, 1, "Should be 1 after callback has run.");
        i.showNextPage();
        equal(c.assert.assertRender(), "marcus", "Should first element only.");
        equal(a, 2, "Should be 2 after callback has run.");


        a = 1;
        ok(c = mcomponent({
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
            viewHtml : "{{ niter userListIter list }}{{ show }}{{ endniter }}"}),
            "Gonna test whenNotLastPageIsShowing and whenLastPageIsShowing!");

        equal(a, 1, "Should be 1 first.");
        equal(c.assert.assertRender(), "mattiasmarcusjohan", "Should first element only.");
        ok(i = c.getIterator("userListIter"));
        equal(i.getPageCount(), 2);
        equal(a, 2, "Should be 2 after callback has run.");
        i.showNextPage();
        equal(c.assert.assertRender(), "buttersstan", "Should first element only.");
        equal(a, 3, "Should be 3 after callback has run.");

        a = 1;
        ok(c = mcomponent({
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
            viewHtml : "{{ niter iterBeforeRender list }}{{ show }}{{ endniter }}"}),
            "Gonna test whenNotLastPageIsShowing and whenLastPageIsShowing!");

        ok(i = c.getIterator("iterBeforeRender"), "Should be able to use iterator before rendering the component.");
        equal(a, 1, "Should be 1 first.");
        equal(c.assert.assertRender(), "mattiasmarcusjohan", "Should first element only.");
        equal(i.getPageCount(), 2);
        equal(a, 2, "Should be 2 after callback has run.");
        i.showNextPage();
        equal(c.assert.assertRender(), "buttersstan", "Should first element only.");
        equal(a, 3, "Should be 3 after callback has run.");


        a = 2;
        ok(c = mcomponent({
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
            viewHtml : "{{ niter userListIter list }}{{ show }}{{ endniter }}"}), "Construction OK!");
        equal(a, 2, "Should be 2 first.");
        equal(c.assert.assertRender(), "mattias", "Should first element only.");
        ok(i = c.getIterator("userListIter"));
        equal(i.getPageCount(), 5);
        equal(i.getCurrentPage(), 0, "Should be on page 0.");
        equal(i.isOnFirstPage(), true, "Should be on first page.");
        equal(i.isOnLastPage(), false, "Should NOT be on last page.");
        equal(a, 2, "Should still be 2 after callback has run.");

        i.showPrevPage();
        c.assert.assertRender();
        equal(i.getCurrentPage(), 0, "Should not go past page 0.");
        equal(i.getPageCount(), 5);

        i.showNextPage();
        c.assert.assertRender();
        equal(i.getCurrentPage(), 1, "Should be on page 1.");
        equal(a, 2, "Should still be 2.");
        equal(i.isOnFirstPage(), false, "Should NOT be on first page.");
        equal(i.isOnLastPage(), false, "Should NOT be on last page.");

        i.showNextPage();
        c.assert.assertRender();
        equal(i.getCurrentPage(), 2, "Should be on page 2.");
        equal(a, 2, "Should still be 2.");
        equal(i.isOnFirstPage(), false, "Should NOT be on first page.");
        equal(i.isOnLastPage(), false, "Should NOT be on last page.");

        i.showNextPage();
        c.assert.assertRender();
        equal(i.getCurrentPage(), 3, "Should be on page 3.");
        equal(a, 2, "Should still be 2.");
        equal(i.isOnFirstPage(), false, "Should NOT be on first page.");
        equal(i.isOnLastPage(), false, "Should NOT be on last page.");

        i.showNextPage();
        c.assert.assertRender();
        equal(i.getCurrentPage(), 4, "Should be on page 4.");
        equal(i.getPageCount(), 5);
        equal(a, 3, "Should now be 3.");
        equal(i.isOnFirstPage(), false, "Should NOT be on first page.");
        equal(i.isOnLastPage(), true, "Should be on last page.");

        i.showNextPage();
        c.assert.assertRender();
        equal(i.getCurrentPage(), 4, "Should not go past page 4.");
        equal(i.getPageCount(), 5);

        a = 22;
        ok(c = mcomponent({
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
            viewHtml : "{{ niter userListIter list }}{{ show }}{{ endniter }}"}), "Construction OK!");
        equal(a, 22, "Should be 22 first.");
        equal(c.assert.assertRender(), "mattiasmarcusjohanbuttersstan", "Should first element only.");
        ok(i = c.getIterator("userListIter"));
        equal(i.getPageCount(), 1);
        equal(i.getCurrentPage(), 0, "Should be on page 0.");
        equal(a, 3, "Should be 3.");

        a = 22;
        ok(c = mcomponent({
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
            viewHtml : "{{ niter userListIter list }}{{ show }}{{ endniter }}"}), "Construction OK!");
        equal(a, 22, "Should be 22 first.");
        equal(c.assert.assertRender(), "mattiasmarcusjohanbuttersstan", "Should first element only.");
        ok(i = c.getIterator("userListIter"));
        equal(i.getPageCount(), 1);
        equal(i.getCurrentPage(), 0, "Should be on page 0.");
        equal(a, 3, "Should be 3.");

        a = 22;
        ok(c = mcomponent({
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
            viewHtml : "{{ niter userListIter list }}{{ show }}{{ endniter }}"}), "Construction OK!");
        equal(a, 22, "Should be 22 first.");
        equal(c.assert.assertRender(), "mattiasmarcusjohanbuttersstan", "Should first element only.");
        ok(i = c.getIterator("userListIter"));
        equal(i.getPageCount(), 1);
        equal(i.getCurrentPage(), 0, "Should be on page 0.");
        equal(a, 3, "Should be 3.");

        a = 22;
        ok(c = mcomponent({
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
            viewHtml : "{{ niter userListIter list }}{{ show }}{{ endniter }}"}), "Construction OK!");
        equal(a, 22, "Should be 22 first.");
        equal(c.assert.assertRender(), "mattiasmarcusjohanbuttersstan", "Should first element only.");
        ok(i = c.getIterator("userListIter"));
        equal(i.getPageCount(), 1);
        equal(i.getCurrentPage(), 0, "Should be on page 0.");
        equal(a, 3, "Should be 3.");

        a = 22;
        ok(c = mcomponent({
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
            viewHtml : "{{ niter userListIter list }}{{ show }}{{ endniter }}"}), "Construction OK!");
        equal(a, 22, "Should be 22 first.");
        equal(c.assert.assertRender(), "mattiasmarcus", "Should first element only.");
        ok(i = c.getIterator("userListIter"));
        equal(i.getPageCount(), 3);
        equal(i.getCurrentPage(), 0, "Should be on page 0.");
        equal(a, 22, "Should be 22.");
        i.showNextPage();
        c.assert.assertRender();
        equal(i.getCurrentPage(), 1, "Should be on page 1.");
        equal(i.getPageCount(), 3);
        ok(!i.isOnFirstOrLastPage(), "Should not be isOnFirstOrLastPage");
        equal(a, 77, "Should now be 77.");

        a = 22;
        ok(c = mcomponent({
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
            viewHtml : "{{ niter userListIter list }}{{ show }}{{ endniter }}"}), "Construction OK!");
        equal(a, 22, "Should be 22 first.");
        equal(c.assert.assertRender(), "mattiasmarcus", "Should first element only.");
        ok(i = c.getIterator("userListIter"));
        equal(i.getPageCount(), 3);
        equal(i.getCurrentPage(), 0, "Should be on page 0.");
        equal(a, 77, "Should be 77.");
        c.setModel({list : []});
        equal(a, 77, "Should be 77.");
        equal(c.assert.assertRender(), "", "Empty since the list is empty.");
        equal(a, 88, "Should be 88.");
        equal(i.getPageCount(), 0);
        equal(i.getCurrentPage(), 0, "Should be on page 0.");
        equal(a, 88, "Should be 88.");


    });

    test("niter tag, filter function", function() {
        var c;

        ok(c = mcomponent({
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
            viewHtml : "{{ niter filteredUserListIter list }}{{ name }}{{ endniter }}"}), "Construction OK!");

        equal(c.assert.assertRender(), "mattiasmarcus", "Should first element only.");

        ok(c = mcomponent({
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
            viewHtml : "{{ niter filteredUserListIter list }}{{ name }}{{ endniter }}"}), "Construction OK!");

        equal(c.assert.assertRender(), "mattiasmarcusjohan", "Should first element only.");

        ok(c = mcomponent({
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
            viewHtml : "{{ niter filteredUserListIter list }}{{ name }}{{ endniter }}"}), "Construction OK!");

        equal(c.assert.assertRender(), "mattiasmarcusjohan", "Should first element only.");

        ok(c = mcomponent({
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
            viewHtml : "{{ niter filteredUserListIter list }}{{ name }}{{ endniter }}"}), "Construction OK!");

        equal(c.assert.assertRender(), "mattiasmarcusjohan", "Should first element only.");

        ok(c = mcomponent({
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
            viewHtml : "{{ niter filteredUserListIter list }}{{ name }}{{ endniter }}"}), "Construction OK!");

        equal(c.assert.assertRender(), "buttersstan", "Should first element only.");

        ok(c = mcomponent({
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
            viewHtml : "{{ niter filteredUserListIter list }}{{ name }}{{ endniter }}"}), "Construction OK!");

        equal(c.assert.assertRender(), "stan", "Should contain stan only.");

        ok(c = mcomponent({
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
            viewHtml : "{{ niter filteredUserListIter list }}{{ name }}{{ endniter }}"}), "Construction OK!");

        equal(c.assert.assertRender(), "", "Should be empty.");

    });

    test("niter tag, filter function and getPageCount() in iterator", function() {
        var c, i;

        ok(c = mcomponent({
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
            viewHtml : "{{ niter filteredUserListIter list }}{{ name }}{{ endniter }}"}), "Construction OK!");

        equal(c.assert.assertRender(), "mattias", "Should be empty.");
        ok(i = c.getIterator("filteredUserListIter"), "Iterator should exist");
        equal(i.getPageCount(), 3, "3 pages when there are 3 items after where has been applied.");

        ok(c = mcomponent({
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
            viewHtml : "{{ niter filteredUserListIter list }}{{ name }}{{ endniter }}"}), "Construction OK!");

        equal(c.assert.assertRender(), "", "Should be empty.");
        ok(i = c.getIterator("filteredUserListIter"), "Iterator should exist");
        equal(i.getPageCount(), 0, "0 page when there are 0 items.");


    });

    test("niter tag, prevent page overflow when using where function", function() {

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

        ok(c = mcomponent({
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
            viewHtml : "{{ niter filteredUserListIter list }}{{ name }}{{ endniter }}"}), "Construction OK!");

        equal(c.assert.assertRender(), "mattiasmarcus", "Start state.");
        ok(i = c.getIterator("filteredUserListIter"), "Iterator should exist.");

        // Go to page 2/2
        i.showNextPage();
        equal(c.assert.assertRender(), "johan", "Second page.");

        // Now change model, so that we only have 1 item in the list, and thus, only one page!
        model.list[2].age = 13;
        model.list[3].age = 14;

        equal(c.assert.assertRender(), "mattias", "Second page.");

    });

    test("niter tag, showPageWithItem methods, combined with where function", function() {
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

        ok(c = mcomponent({
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
            viewHtml : "{{ niter list list }}{{ name }}{{ endniter }}"}), "Construction OK!");

        equal(c.assert.assertRender(), "mattias", "Should be empty.");
        ok(i = c.getIterator("list"), "Iterator should exist");
        equal(i.getPageCount(), 3, "3 pages when there are 3 items after where has been applied.");

        raises(function() {
            i.getPageWithItem(model.list[-1]);
        }, "Item -1 never exists, so should throw exception.");
        equal(i.getPageWithItem(model.list[0]), 0, "Item 0 should be on page 0.");
        raises(function() {
            i.getPageWithItem(model.list[1]);
        }, "Item 2 should be on NO page.");
        equal(i.getPageWithItem(model.list[2]), 1, "Item 2 should be on page 1.");
        equal(i.getPageWithItem(model.list[3]), 2, "Item 3 should be on page 2.");
        raises(function() {
            i.getPageWithItem(model.list[4]);
        }, "Item 4 should be on NO page.");
        raises(function() {
            i.getPageWithItem(model.list[5]);
        }, "Item 5 does not exist.");

    });

    test("iter/niter tag, with alternative resolve styles", function() {

        var c;

        ok(c = mcomponent({
            viewHtml : "{{ iter bounds['out'] }}{{ enditer }}"
        }), "Compiling this view should work.");


        ok(c = mcomponent({
            viewHtml : '{{ iter bounds["out"] }}{{ enditer }}',
            throwOnError : true
        }), "Compiling this view should work.");

    });

    test("niter tag, causing compile errors", function() {

        var c;

        raises(function() {
            c = mcomponent({
                viewHtml : "{{ niter list list }}{{ enditer }}",
                throwOnError : true
            });
        }, "Construction fails and with throwOnError, there should be an exception.");

        ok(c = mcomponent({
            viewHtml : "{{ niter list list }}{{ enditer }}"
        }), "Compiling fails, but should not throw an exception.");

        ok(c.assert.assertRender() !== "", "niter and enditer mismatch. Should output error in DOM, so result can not be empty.");
        ok(c.hasCompileError(), "Should contain compile errors because of enditer mismatch.");
        ok(c.hasRenderErrors(), "Should contain render errors as well, since all compile errors cause a render error.");

    });

    test("js and showjs tags", function() {

        var c;

        ok(c = mcomponent({viewHtml : "{{ showjs 'mattias'; }}"}), "Construction OK!");
        equal(c.assert.assertRender(), "mattias", "'showjs' tag should work.");

        ok(c = mcomponent({viewHtml : "{{ showjs Math.sqrt(9); }}"}), "Construction OK!");
        equal(c.assert.assertRender(), "3", "Should not throw error.");

        ok(c = mcomponent({viewHtml : "{{ showjs Math.max(9, 21); }}"}), "Construction OK!");
        equal(c.assert.assertRender(), "21", "Should not throw error.");

        ok(c = mcomponent({viewHtml : "{{ showjs Math.min(9, 21); }}"}), "Construction OK!");
        equal(c.assert.assertRender(), "9", "Should not throw error.");

        ok(c = mcomponent({model : {name : "mattias yo"}, viewHtml : "{{ showjs model.name; }}"}), "Construction OK!");
        equal(c.assert.assertRender(), "mattias yo", "Should be able to use model.");

        ok(c = mcomponent({viewHtml : "{{ js Math.sqrt(5); }}"}), "Construction OK!");
        equal(c.assert.assertRender(), "", "Should not throw error.");

        ok(c = mcomponent({viewHtml : "{{ js Math.max(9, 21); }}"}), "Construction OK!");
        equal(c.assert.assertRender(), "", "Should not throw error.");

        ok(c = mcomponent({viewHtml : "{{ js Math.min(9, 21); }}"}), "Construction OK!");
        equal(c.assert.assertRender(), "", "Should not throw error.");

        ok(c = mcomponent({throwOnError : true, viewHtml : "{{ js undefined.prutt() }}"}), "Construction OK!");
        raises(function() {
            c.assert.assertRender();
        }, "Should throw null pointer exception.");

        ok(c = mcomponent({viewHtml : "{{ showjs undefined.prutt() }}"}), "Construction OK!");
        ok(c.assert.assertRender() !== "", "Should not be empty, must contain error.");


    });

    test("globals", function() {

        var c;

        ok(c = mcomponent({viewHtml : "{{ js globals.testing = 'mattias yeah' }}"}), "Construction OK!");
        equal(c.assert.assertRender(), "", "Setting globals should work.");
        equal(c.getGlobals().testing, "mattias yeah", "Setting globals should work.");

        ok(c = mcomponent({viewHtml : "{{ js globals.testing = 'mattias yeah' }}{{ globals.testing }}"}), "Construction OK!");
        equal(c.assert.assertRender(), "mattias yeah", "Setting and showing globals should work.");
        equal(c.getGlobals().testing, "mattias yeah", "Setting globals should work.");

        ok(c = mcomponent({viewHtml : "{{ js globals.testing = true }}{{ if (globals.testing) }}ohyeah{{ endif }}"}), "Construction OK!");
        equal(c.assert.assertRender(), "ohyeah", "Setting and using globals in if condition should work.");
        equal(c.getGlobals().testing, true, "Setting globals should work.");

        ok(c = mcomponent({viewHtml : "{{ js globals.testing = 666 }}{{ if (globals.testing) }}ohyeah{{ endif }}"}), "Construction OK!");
        equal(c.assert.assertRender(), "ohyeah", "Setting and using globals in if condition should work.");
        equal(c.getGlobals().testing, 666, "Setting globals should work.");

        ok(c = mcomponent({viewHtml : "{{ setglobal testing 'mattias yeah' }}{{ globals.testing }}"}), "Construction OK!");
        equal(c.assert.assertRender(), "mattias yeah", "setglobal tag and showing globals should work.");
        equal(c.getGlobals().testing, "mattias yeah", "Setting globals should work.");


    });

    QUnit.module("Set/get model");

    test("Setting model with constructor, then getting it", function() {
        var c;

        ok(c = mcomponent({
            model : {age : 80},
            viewHtml : ""
        }), "Construction OK!");

        ok(c.getModel(), "getModel() should return object.");

        equal(c.getModel().age, 80, "getModel() should contain age property.");

        ok(c = mcomponent({
            model : {name : "mattias"},
            viewHtml : ""
        }), "Construction OK!");

        ok(c.getModel(), "getModel() should return object.");

        equal(c.getModel().name, "mattias", "getModel() should contain name property.");
    });

    test("Setting model with setter, then getting it", function() {
        var c;

        ok(c = mcomponent({
            viewHtml : ""
        }), "Construction OK!");

        equal(c.getModel(), undefined, "getModel() should return undefined.");

        c.setModel({age : 80});

        ok(c.getModel(), "getModel() should return object.");

        equal(c.getModel().age, 80, "getModel() should contain age property.");

    });

    QUnit.module("Final");

    test("Clipboard", function() {
        var c;

        ok(c = mcomponent({
            clipboard : {clip1 : "{{ if (model.age) }}{{ show age }}{{ endif }}"},
            model : {age : 80},
            viewHtml : "{{ paste clip1 }}"
        }), "Construction OK!");

        equal(c.assert.assertRender(), "80", "Predefined clipboard, should paste and result in '80'.");

        ok(c = mcomponent({
            clipboard : {
                clip1 : "{{ if (model.age) }}{{ paste clip2 }}{{ endif }}",
                clip2 : "{{ show age }}"
            },
            model : {age : 80},
            viewHtml : "{{ paste clip1 }}"
        }), "Construction OK!");

        equal(c.assert.assertRender(), "80", "Predefined clipboard, clip in clip, should paste and result in '80'.");

        ok(c = mcomponent({
            model : {age : 85},
            viewHtml : "{{ copy clip1 }}{{ show age }}{{ endcopy }}"
        }), "Construction OK!");

        equal(c.assert.assertRender(), "85", "Copying from inside view, copying should not remove the original.");

        ok(c = mcomponent({
            model : {age : 81},
            viewHtml : "{{ copy clip1 }}{{ show age }}{{ endcopy }}{{ paste clip1 }}"
        }), "Construction OK!");

        equal(c.assert.assertRender(), "8181", "Copying from inside view, should paste and result in '8080'.");


        ok(c = mcomponent({
            clipboard : {clip1 : "<div>hej</div>"},
            model : {age : 80},
            viewHtml : "<div>{{ paste clip1 }}</div>"
        }), "Construction OK!");

        equal(c.assert.assertRender(), "<div><div>hej</div></div>", "Predefined clipboard");

        /***********************
         * Empty clipboard
         ***********************/

        ok(c = mcomponent({
            clipboard : {clip1 : ""},
            viewHtml : "{{ paste clip1 }}"
        }), "Construction OK!");

        equal(c.assert.assertRender(), "", "Predefined clipboard is empty, should yield in empty result.");

    });

    test("Clipboards with errors", function() {
        var c;

        ok(c = mcomponent({
            viewHtml : "{{ paste clip1 }}"
        }), "Construction OK!");

        ok(c.assert.assertRender() !== "", "Clipboard item does not exist, should contain error.");
        //equal(c.assert.assertRender(), "", "Clipboard item does not exist, should contain error.");

        ok(c = mcomponent({
            clipboard : {clip1 : "{{ if model.age) }}{{ endif }}"},
            viewHtml : "{{ paste clip1 }}"
        }), "Construction OK!");

        ok(c.assert.assertRender() !== "", "Predefined clipboard has an error, should output error.");
        //equal(c.assert.assertRender(), "", "Predefined clipboard has an error!");

    });

    QUnit.module("Compiled");

    test("Construction", function() {
        var c;

        ok(c = mcomponent({
            model : {},
            viewHtml : ""
        }), "Construction OK!");

        equal(c.assert.assertRender(), "", "Empty component code.");

    });

    test("HTML and show tag", function() {

        var c;

        ok(c = mcomponent({
            model : {name : "must"},
            viewHtml : "hohoho"
        }), "Construction OK!");

        equal(c.assert.assertRender(), "hohoho", "HTML only");

        ok(c = mcomponent({
            model : {name : "must"},
            viewHtml : "hoho{{ name }}haha"
        }), "Construction OK!");

        equal(c.assert.assertRender(), "hohomusthaha", "HTML mixed with tags.");

        ok(c = mcomponent({
            model : {name : "must"},
            viewHtml : "{{ name }}"
        }), "Construction OK!");

        equal(c.assert.assertRender(), "must", "Simple variable output.");

        ok(c = mcomponent({
            model : {name : "must"},
            viewHtml : "{{ show name }}"
        }), "Construction OK!");

        equal(c.assert.assertRender(), "must", "show name is must");

    });

    test("push tag", function() {

        var c;

        ok(c = mcomponent({
            model : {name : "must", hair : {color : "black", styling : "awesome"}},
            viewHtml : "{{ push hair }}{{ color }}{{ endpush }}"
        }), "Construction OK!");

        equal(c.assert.assertRender(), "black", "Push tag is black.");

        ok(c = mcomponent({
            model : {name : "must"},
            viewHtml : "{{ push name }}{{ show }}{{ endpush }}"
        }), "Construction OK!");

        equal(c.assert.assertRender(), "must", "show name is must even with push and no specified name.");

    });

    test("If tag", function() {

        var c;

        ok(c = mcomponent({
            model : {name : "must"},
            viewHtml : "oh{{ if model.name == 'must' }}yes{{ endif }}"
        }), "Construction OK!");

        equal(c.assert.assertRender(), "ohyes", "if tag, no else, condition true");

        ok(c = mcomponent({
            model : {name : "mattias"},
            viewHtml : "oh{{ if model.name == 'must' }}yes{{ endif }}"
        }), "Construction OK!");

        equal(c.assert.assertRender(), "oh", "if tag, no else, condition false");

        ok(c = mcomponent({
            model : {name : "must"},
            viewHtml : "oh{{ if model.name == 'must' }}yes{{ else }}no{{ endif }}"
        }), "Construction OK!");

        equal(c.assert.assertRender(), "ohyes", "if tag");

        ok(c = mcomponent({
            model : {name : "mattias"},
            viewHtml : "oh{{ if model.name == 'must' }}yes{{ else }}no{{ endif }}"
        }), "Construction OK!");

        equal(c.assert.assertRender(), "ohno", "if tag");

    });

    test("log and throw tag", function() {

        var c;

        ok(c = mcomponent({
            model : {name : "must"},
            viewHtml : "{{ log 'hej' }}"
        }), "Construction OK!");

        equal(c.assert.assertRender(), "", "Outputs only to console.");

    });

    test("setglobal tag", function() {

        var c;

        ok(c = mcomponent({
            viewHtml : "{{ setglobal aGlobal 'hej' }}"
        }), "Construction OK!");

        equal(c.assert.assertRender(), "", "Setting global only");

    });

    test("js and showjs tag", function() {

        var c;


        ok(c = mcomponent({
            viewHtml : "{{ js 'hej' }}"
        }), "Construction OK!");

        equal(c.assert.assertRender(), "", "Setting global only");


        ok(c = mcomponent({
            viewHtml : "{{ showjs 'hej' }}"
        }), "Construction OK!");

        equal(c.assert.assertRender(), "hej", "Setting global only");


        /******
         * context
         */

        ok(c = mcomponent({
            model : {name : "must"},
            viewHtml : "{{ context name }}",
            throwOnError : true
        }), "Construction OK! But next should fail.");

        raises(function() {
            c.assert.assertRender();
        }, "Context is empty, should return empty result.");

        ok(c = mcomponent({
            clipboard : {clip1 : "{{ if (model.age) }}{{ show age }}{{ endif }}"},
            model : {age : 80},
            viewHtml : "{{ paste clip1 }}"
        }), "Construction OK!");

        equal(c.assert.assertRender(), "80", "Predefined clipboard, should paste and result in '80'.");


    });

    test("Compiled clipboard", function() {

        var c;

        ok(c = mcomponent({
            clipboard : {clip1 : "{{ if (model.age) }}{{ show age }}{{ endif }}"},
            model : {age : 80},
            viewHtml : "{{ paste clip1 }}"
        }), "Construction OK!");

        equal(c.assert.assertRender(), "80", "Predefined clipboard, should paste and result in '80'.");

        ok(c = mcomponent({
            clipboard : {
                clip1 : "{{ if (model.age) }}{{ paste clip2 }}{{ endif }}",
                clip2 : "{{ show age }}"
            },
            model : {age : 80},
            viewHtml : "{{ paste clip1 }}"
        }), "Construction OK!");

        equal(c.assert.assertRender(), "80", "Predefined clipboard, clip in clip, should paste and result in '80'.");

        ok(c = mcomponent({
            model : {age : 85},
            viewHtml : "{{ copy clip1 }}{{ show age }}{{ endcopy }}"
        }), "Construction OK!");

        equal(c.assert.assertRender(), "85", "Copying from inside view, copying should not remove the original.");

        ok(c = mcomponent({
            model : {age : 81},
            viewHtml : "{{ copy clip1 }}{{ show age }}{{ endcopy }}{{ paste clip1 }}"
        }), "Construction OK!");

        equal(c.assert.assertRender(), "8181", "Copying from inside view, should paste and result in '8080'.");

    });

    test("iter tag", function() {

        var c;
        var result;

        ok(c = mcomponent({
            model : { list : ["mattias", "marcus", "johan"] },
            viewHtml : "{{ iter list }}{{ enditer }}"})
            , "Construction OK!");

        equal(c.assert.assertRender(), "", "Should contain nothing.");

        ok(c = mcomponent({
            model : { list : ["mattias", "marcus", "johan"] },
            viewHtml : "{{ iter list }}{{ show }}{{ enditer }}"})
            , "Construction OK!");

        equal(c.assert.assertRender(), "mattiasmarcusjohan", "Should contain mattiasmarcusjohan.");


        ok(c = mcomponent({
            model : { list : [
                {name : "mattias", nums : [1, 2, 3]},
                {name : "marcus", nums : [4, 5, 6]},
                {name : "johan", nums : [9, 8, 7]}
            ] },
            viewHtml : "{{ iter list }}{{ show name }}{{ iter nums }}{{ show }}{{ enditer }}{{ enditer }}"})
            , "Construction OK!");

        equal(c.assert.assertRender(), "mattias123marcus456johan987", "Should contain mattiasmarcusjohan.");

        /***
         * Larger view
         */

        ok(c = mcomponent({viewHtml : "{{ if (this.model) }}yay1" +
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
                    city : {name : "G�teborg"},
                    country : {name : "Sweden"}
                }
            },
            iter : {users : {}}}), "Construction OK!");

        ok(result = c.assert.assertRender(), "Rendering of large view should be OK!");
        equal(result, "yay1yay2", "And the result should be correct.");

        ok(c = mcomponent({viewHtml : "{{ if (this.model) }}yay1" +
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
                    city : {name : "G�teborg"},
                    country : {name : "Sweden"}
                }
            },
            iter : {users : {}}}), "Construction OK!");

        ok(result = c.assert.assertRender(), "Rendering of large view should be OK!");
        equal(result, "yay1yay2Name:MattiasMale:YesAge:31Name:MustMale:YesAge:28Name:JennyMale:NoAge:27", "And the result should be correct.");

    });

    test("niter tag", function() {

        var c;

        raises(function() {
            c = mcomponent({
                model : {
                    list : ["mattias", "marcus", "johan"]
                }, viewHtml : "{{ niter userListIter list }}{{ endniter }}",
                throwOnError : true
            })
        }, "Construction OK!");

        raises(function() {
            c.assert.assertRender();
        }, "Should throw error since we haven't declared an iterator configuration.");

        ok(c = mcomponent({
            model : { list : ["mattias", "marcus", "johan"]},
            iter : {
                userListIter : { itemsPerPage : 1 }
            },
            viewHtml : "{{ niter userListIter list }}{{ endniter }}"}), "Construction OK lets go!!");

        equal(c.assert.assertRender(), "", "Should contain nothing.");

        var a, b, i;

        ok(c = mcomponent({
            model : {list : ["mattias", "marcus", "johan"]},
            iter : {
                userListIterYeah : {
                    itemsPerPage : 1
                }
            },
            viewHtml : "{{ niter userListIterYeah list }}{{ show }}{{ endniter }}"}), "Construction OK!");
        equal(c.assert.assertRender(), "mattias", "Should first element only since itemsPerPage is 1.");

        ok(c = mcomponent({
            model : {list : ["mattias", "marcus", "johan"]},
            iter : {
                userListIterYeah : {
                    itemsPerPage : 1,
                    whenAllItemsAreShowing : function() {
                        a = 5;
                    }
                }
            },
            viewHtml : "{{ niter userListIterYeah list }}{{ show }}{{ endniter }}"}), "Construction OK!");
        equal(c.assert.assertRender(), "mattias", "Should first element only.");

        a = 3;
        ok(i = c.getIterator("userListIterYeah"), "Should be able to get iterator context.");
        equal(c.getIterator("userListIterYeahASFSA"), undefined, "Trying to get iterator context that doesn't exist should return undefined.");
        equal(a, 3, "a should be 3 first.");
        i.showAllItems();
        equal(c.assert.assertRender(), "mattiasmarcusjohan", "Should show all elements.");
        equal(a, 5, "a should now be 5 since callback changed the value.");

        a = 3;
        b = 1;
        ok(c = mcomponent({
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
            viewHtml : "{{ niter userListIterYeah list }}{{ show }}{{ endniter }}"}), "Construction OK!");
        equal(b, 1, "b should be 1 first.");
        equal(c.assert.assertRender(), "mattias", "Should first element only.");
        equal(b, 2, "b should be 2 after whenNotAllItemsAreShowing has been run.");
        ok(i = c.getIterator("userListIterYeah"), "Should be able to get iterator context.");
        i.showMoreItems();
        equal(c.assert.assertRender(), "mattiasmarcus", "Should contain one more element.");
        equal(a, 3, "a should be 3 first.");
        i.showMoreItems();
        equal(c.assert.assertRender(), "mattiasmarcusjohan", "Should contain all three elements.");
        equal(a, 5, "a should now be 5 since callback changed the value.");
        i.showMoreItems();
        equal(c.assert.assertRender(), "mattiasmarcusjohan", "Should contain all three elements again.");

        a = 3;

        ok(c = mcomponent({
            model : {list : ["mattias", "marcus", "johan"]},
            iter : {
                userListIterYeah : {
                    itemsPerPage : 1,
                    whenAllItemsAreShowing : function() {
                        a = 5;
                    }
                }
            },
            viewHtml : "{{ niter userListIterYeah list }}{{ show }}{{ endniter }}"}), "Construction OK!");
        equal(c.assert.assertRender(), "mattias", "Should first element only.");
        ok(i = c.getIterator("userListIterYeah"), "Should be able to get iterator context.");
        equal(c.getIterator("userListIterYeahASFSA"), undefined, "Trying to get iterator context that doesn't exist should return undefined.");
        equal(a, 3, "a should be 3 first.");
        i.showAllItems();
        equal(c.assert.assertRender(), "mattiasmarcusjohan", "Should show all elements.");
        equal(a, 5, "a should now be 5 since callback changed the value.");

    });

    test("Set view, render, change view, render again", function() {

        var c;

        ok(c = mcomponent({viewHtml : "heyhey"}), "Construction OK!");
        equal(c.assert.assertRender(), "heyhey", "Should contain 'heyhey', have no tags.");
        c.setViewWithHtml("ojoj");
        equal(c.assert.assertRender(), "ojoj", "Should contain 'ojoj' after changing view.");

    });

    test("Invalid tags", function() {

        var c;

        /***********************
         * Using exceptions
         ***********************/

        raises(function() {
            c = mcomponent({
                viewHtml : '{{ showjs "mattias }}',
                throwOnError : true
            })
        }, "Construction OK!");

        raises(function() {
            c = mcomponent({
                viewHtml : '{{ * showjs alert("hej") }}',
                throwOnError : true
            })
        }, "Construction OK!");

        raises(function() {
            c = mcomponent({
                viewHtml : '{{ Å showjs alert("hej") }}',
                throwOnError : true
            })
        }, "Construction OK!");

        /***********************
         * Using error messages
         ***********************/

        ok(c = mcomponent({
            viewHtml : '{{ showjs "mattias }}'
        }), "Construction OK!");

        ok(c.assert.assertRender() !== "", "Should not be empty, should contain an error message.");
        //equal(c.assert.assertRender(), "", "Should not be empty, should contain an error message.");

        ok(c = mcomponent({
            viewHtml : '{{ * showjs alert("hej") }}'
        }), "Construction OK!");

        ok(c.assert.assertRender() !== "", "Should not be empty, should contain an error message.");
        //equal(c.assert.assertRender(), "", "Should not be empty, should contain an error message.");

        /**************************************
         * Using error messages in nested tags
         **************************************/

        ok(c = mcomponent({
            viewHtml : '{{ if true }}{{ * showjs alert("hej") }}{{ endif }}'
        }), "Construction OK!");

        ok(c.assert.assertRender() !== "", "Should not be empty, should contain an error message.");
        //equal(c.assert.assertRender(), "", "Should not be empty, should contain an error message.");


    });

    test("Child components", function() {

        var c;
        var parent;

        ok(c = mcomponent({model : {username : "mattias"}, viewHtml : "{{ username }}"}), "Construction OK!");
        equal(c.assert.assertRender(), "mattias", "Should contain 'mattias'.");
        ok(parent = mcomponent({model : {username : "jenny"}, viewHtml : "{{ username }}"}), "Construction OK!");
        equal(parent.assert.assertRender(), "jenny", "Should contain 'jenny'.");

        ok(c = mcomponent({model : {username : "mattias"}, viewHtml : "{{ username }}"}), "Creating child.");
        equal(c.assert.assertRender(), "mattias", "Child render result should be 'mattias'.");
        ok(parent = mcomponent({model : {userNumber : "3"}, viewHtml : "{{ userNumber }} {{ component mata }}"}), "Creating parent.");
        parent.addChild("mata", c);
        equal(parent.assert.assertRender(), "3 mattias", "Parent, with child, should contain '3 mattias'.");

        ok(c = mcomponent({model : {color : "black"}, viewHtml : "{{ color }}"}), "Construction OK!");
        equal(c.assert.assertRender(), "black", "Should contain 'black'.");
        ok(parent = mcomponent({
            model : {label : "The color : "},
            viewHtml : "{{ label }}{{ component testChild }}",
            children : {
                "testChild" : c
            }
        }), "Construction OK!");
        equal(parent.assert.assertRender(), "The color : black", "Should contain '3 mattias'.");

        raises(function() {
            parent = mcomponent({
                model : {label : "The color : "},
                viewHtml : "{{ label }}{{ component testChild }}",
                children : {
                    "test Child" : c
                }
            });
        }, "Id with space should fail at construction.");

        ok(c = mcomponent({model : {username : "mattias"}, viewHtml : "{{ username }}"}), "Construction OK!");
        equal(c.assert.assertRender(), "mattias", "Should contain 'mattias'.");
        ok(parent = mcomponent({model : {userNumber : "3"}, viewHtml : "{{ userNumber }} {{ component mat }}"}), "Construction OK!");
        raises(function() {
            parent.addChild("mat tias", c);
        }, "Should raise exception since id contains space.");

        raises(function() {
            parent.addChild("mat!tias", c);
        }, "Should raise exception since id contains space.");

        raises(function() {
            parent.addChild("mat#tias", c);
        }, "Should raise exception since id contains space.");


    });

    test("Child components - adding and removing children and rerendering", function() {
        var parent, c;

        ok(c = mcomponent({model : {username : "mattias"}, viewHtml : "{{ username }}"}), "Creating child.");
        equal(c.assert.assertRender(), "mattias", "Child render result should be 'mattias'.");
        ok(parent = mcomponent({model : {userNumber : "3"}, viewHtml : "{{ userNumber }} {{ component mata }}"}), "Creating parent.");
        parent.addChild("mata", c);
        equal(parent.assert.assertRender(), "3 mattias", "Parent, with child, should contain '3 mattias'.");
        parent.removeChild("mata");
        parent.assert.assertRender();
        ok(parent.hasRenderErrors(), "Should have a render error since child no longer exists.");
        equal(parent.hasRenderErrors(), true, "Should have a render error.");

        parent.addChild("mata", c);
        equal(parent.assert.assertRender(), "3 mattias", "Parent, with child, should contain '3 mattias'.");
        equal(parent.hasRenderErrors(), false, "Should NOT have a render error since child exists again.");

    });

    test("Child components - notrequired", function() {

        var c;
        var parent;

        ok(c = mcomponent({model : {username : "mattias"}, viewHtml : "{{ username }}"}), "Creating child.");
        equal(c.assert.assertRender(), "mattias", "Child render result should be 'mattias'.");
        ok(parent = mcomponent({model : {userNumber : "3"}, viewHtml : "{{ userNumber }} {{ component mata }}"}), "Creating parent.");
        parent.addChild("mata", c);
        equal(parent.assert.assertRender(), "3 mattias", "Parent, with child, should contain '3 mattias'.");

        ok(c = mcomponent({model : {username : "mattias"}, viewHtml : "{{ username }}"}), "Creating child.");
        equal(c.assert.assertRender(), "mattias", "Child render result should be 'mattias'.");
        ok(parent = mcomponent({model : {userNumber : "3"}, viewHtml : "{{ userNumber }} {{ component mata notrequired }}"}), "Creating parent.");
        equal(parent.assert.assertRender(), "3 ", "Parent, with child, should contain '3 ', no error message since component is not required.");

        // Test notrequired misspelled
        ok(c = mcomponent({model : {username : "mattias"}, viewHtml : "{{ username }}"}), "Creating child.");
        equal(c.assert.assertRender(), "mattias", "Child render result should be 'mattias'.");
        ok(parent = mcomponent({model : {userNumber : "3"}, viewHtml : "{{ userNumber }} {{ component mata notrequiredd }}"}), "Creating parent.");
        parent.addChild("mata", c);
        parent.assert.assertRender();
        ok(parent.hasRenderErrors(), "Parent should now have render errors, given by the misspelled notrequired parameter.");

    });

    test("Tag assertion", function() {

        var a, b, c;

        ok(a = mcomponent({viewHtml : "{{ showjs api._assert.componentIdEqualsExecutionContextId() }}"}), "Creating child.");
        ok(a.assert.assertComponentIdEqualsExecutionContextId(), "Correct execution context from mcomponent scope.");
        equal(a.assert.assertRender(), "true", "Correct execution context in execution scope as well.");

    });

    test("API assertion", function() {

        ok(a = mcomponent({viewHtml : "a{{ js api._assert.childCount(0) }}"}), "Creating child.");
        equal(a.assert.assertRender(), "a", "No error!");

        ok(a = mcomponent({viewHtml : "a{{ js api._assert.childCount(1) }}"}), "Creating child.");
        ok(a.assert.assertRender() !== "a", "Should contain error.");

        ok(a = mcomponent({viewHtml : "a{{ js api._assert.childCount(1) }}", throwOnError : true}), "Creating child.");
        raises(function() {
            a.assert.assertRender()
        }, "Should throw exception.");

    });

    test("Check child count from execution context", function() {

        var a, b, c;

        ok(a = mcomponent({viewHtml : "a {{ showjs api._assert.getExecutionContext().getChildCount() }}"}), "Creating child.");
        equal(a.assert.assertRender(), "a 0", "0 children");

        ok(b = mcomponent({viewHtml : "b"}), "Creating child.");

        a.addChild("b", b);

        equal(a.assert.assertRender(), "a 1", "1 child");

    });

    test("Execution context scope", function() {

        /**
         * When having children and setting view with other component, ensure that components still have their own execution context.
         */

        var a, b, c, d;

        // Test setViewFromComponent first.

        ok(a = mcomponent({viewHtml : "a {{ showjs api._assert.componentIdEqualsExecutionContextId() }}"}), "Creating child.");
        ok(a.assert.assertComponentIdEqualsExecutionContextId(), "Correct execution context.");
        equal(a.assert.assertRender(), "a true", "");

        ok(b = mcomponent({viewHtml : "b {{ showjs api._assert.componentIdEqualsExecutionContextId() }}"}), "Creating child.");
        equal(b.assert.assertRender(), "b true", "");
        ok(b.assert.assertComponentIdEqualsExecutionContextId(), "Correct execution context.");

        b.setViewFromComponent(a);
        equal(b.assert.assertRender(), "a true", "");
        ok(b.assert.assertComponentIdEqualsExecutionContextId(), "Correct execution context.");

        ok(a._.getId() !== b._.getId(), "Components must not have same id.");
        ok(a._.getExecutionContext().id !== b._.getExecutionContext().id, "Execution contexts must not have same id.");

        // OK

        ok(a = mcomponent({viewHtml : "a {{ showjs api._assert.componentIdEqualsExecutionContextId() }} {{ component c }}"}), "Creating child.");
        ok(a.assert.assertComponentIdEqualsExecutionContextId(), "Correct execution context.");

        ok(c = mcomponent({viewHtml : "c {{ showjs api._assert.componentIdEqualsExecutionContextId() }}"}), "Creating child.");
        equal(c.assert.assertRender(), "c true", "");
        ok(c.assert.assertComponentIdEqualsExecutionContextId(), "Correct execution context.");

        ok(b = mcomponent({viewHtml : "b"}), "Creating child.");
        equal(b.assert.assertRender(), "b", "Should be b");
        ok(b.assert.assertComponentIdEqualsExecutionContextId(), "Correct execution context.");

        // Test children count with API assertion

        b.setViewWithHtml("ok{{ js api._assert.childCount(0) }}");
        ok(b.assert.assertComponentIdEqualsExecutionContextId(), "Correct execution context.");
        ok(b.assert.assertRender() == "ok", "Should have no children in execution context.");
        ok(b, "Adding child");
        b.addChild("c", c);
        ok(b.getChild("c"), "Child should now exist in b-parent.");
        ok(b.assert.assertComponentIdEqualsExecutionContextId(), "Correct execution context.");
        ok(b.assert.assertRender() !== "ok", "Should have 1 children in execution context.");

        // Test with API assertion, but with viewFromComponent

        ok(d = mcomponent({viewHtml : "ok{{ js api._assert.childCount(1) }}"}), "Creating child.");
        b.setViewFromComponent(d);
        ok(b.assert.assertRender() == "ok", "Should have 1 child in execution context.");
        // TODO: Test equal id for context and component.

        // Test with real view with {{ component .. }}

        b.setViewFromComponent(a);
        equal(b.assert.assertRender(), "a true c true", "Should be ac with new view and child.");
        ok(b.assert.assertComponentIdEqualsExecutionContextId(), "Correct execution context.");

    });

    test("Weird HTML", function() {

        var a;

        ok(a = mcomponent({viewHtml : "ÅÄÖ=#€%"}), "Creating child.");
        equal(a.assert.assertRender(), "ÅÄÖ=#€%");

        ok(a = mcomponent({viewHtml : '!2394839835€)(%!##€&!#/€!#")!""#!"#)£§|∞§©£@][≈£≈'}), "Creating child.");
        equal(a.assert.assertRender(), '!2394839835€)(%!##€&!#/€!#")!""#!"#)£§|∞§©£@][≈£≈');

        ok(a = mcomponent({viewHtml : '{ { !2394839835€)(%!##€&!#/€!#")!""#!"#)£§|∞§©£@][≈£≈ } }   '}), "Creating child.");
        equal(a.assert.assertRender(), '{ { !2394839835€)(%!##€&!#/€!#")!""#!"#)£§|∞§©£@][≈£≈ } }   ');

    });


}


function Timer(name) {

    this.name = name;

    this.state = "init";
    this.running = false;
    this.time = 0;
    this.startTime = undefined;
    this.endTime = undefined;
}

Timer.prototype.start = function() {
    this.startTime = new Date();
    this.state = "running";
    this.running = true;
};

Timer.prototype.stop = function() {
    this.endTime = new Date();
    this.state = "stopped";
    this.running = false;
    this.time += this._calculateTime(this.startTime, this.endTime);
};

Timer.prototype.reset = function() {
    this.time = 0;
};

Timer.prototype.result = function() {
    return this.time;
};

Timer.prototype._calculateTime = function(startDate, endDate) {
    return endDate.getTime() - startDate.getTime();
};

Timer.prototype.toString = function() {
    if (this.time === undefined) {
        return "No timing data.";
    } else {
        if (this.running) {
            return "Timer is running '" + this.name + "', current time : " + this._calculateTime(this.startTime, this.endTime) + " ms.";
        } else {
            return "Timer '" + this.name + "' : " + this.time + " ms.";
        }
    }
};

var doMcomponentProfiling = function() {

    var c;
    var view = "  {{ if (this.model) }} yay we have a model!\n" +
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

    var m = {
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

    c = mcomponent({viewHtml : view, model : m, iter : {users : {}}});
    var t = c._.getTemplate();

    var tcompile = new Timer("compile");
    var times = 1000;
    var i;

    console.log("Measuring performance, " + times + " runs...");
    tcompile.start();
    for (i = 0; i < times; i++) t.render();
    tcompile.stop();


    console.log(m);
    console.log(c._.getView().html);
    console.log(t.getSource());


    console.log(tcompile.toString());

    setTimeout(function() {
        doMcomponentProfiling();
    }, 1000);
};

/*

 {{ context.index }}
 {{ show context.index }}
 {{ if (context.index) }}

 */
