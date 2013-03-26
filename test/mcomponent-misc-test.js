TestCase("General", {

    "test push and then lookup from topmost stack model" : function() {
        var c = mcomponent({
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
            viewHtml : "{{ push user }}{{ name }}{{ endpush }}"
        });
        assertEquals("mattias", c.assert.assertRender());
    },

    "test push and then lookup one level down in stack model" : function() {
        var c = mcomponent({
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
            viewHtml : "{{ push user }}{{ location.country }}{{ endpush }}"
        });
        assertEquals("Awesomeland", c.assert.assertRender());
    },

    "test push and then lookup in both topmost and one level down in stack model" : function() {
        var c = mcomponent({
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
        assertEquals("mattiasAwesomeland", c.assert.assertRender());
    },

    "test Should lookup 'name' and 'location.country' properly since it will find location on user" : function() {
        var c = mcomponent({
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
        assertEquals("mattiasSweden", c.assert.assertRender());
    },

    "test nested push with topmost access and parent model prefixed access" : function() {
        var c = mcomponent({
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
        assertEquals("mattiasAwesomeland", c.assert.assertRender());
    },

    "test nested push with topmost access and double parent model prefixed access" : function() {
        var c = mcomponent({
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
    },

    "test nested push two-level property with topmost access and parent model prefixed access" : function() {
        var c = mcomponent({
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
        assertEquals("mattiasSweden", c.assert.assertRender());
    },

    "test push property and then double parent model prefixed access should throw exception" : function() {
        var c = mcomponent({
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
    },

    "test nested push with second push using parent model prefix" : function() {
        var c = mcomponent({
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
    },

    "test push property and then niter with parent model prefixed property" : function() {
        var c = mcomponent({
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
    },

    "test nested push property and then niter with parent model prefixed property" : function() {
        var c = mcomponent({
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
    },

    "test nested push property and then niter with double parent model prefixed property" : function() {
        var c = mcomponent({
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

    "test getModel() with string" : function() {
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

TestCase("Setting view repeatedly", {

    "test Set view, render, change view, render again" : function() {
        var c = mcomponent({viewHtml : "heyhey"});
        assertEquals("Should contain 'heyhey', have no tags.", "heyhey", c.assert.assertRender());
        c.setViewWithHtml("ojoj");
        assertEquals("Should contain 'ojoj' after changing view.", "ojoj", c.assert.assertRender());
    }

});

TestCase("Setting view with special characters", {

    "test set view with HTML characters" : function() {
        var v = "<div class=\"animationContainer loadingMedium\"><img src=\"/v/207/49522/system/image/animation/loading_transparent_medium.gif\" alt=\"Laddar...\" title=\"Laddar...\" hspace=\"0\" vspace=\"0\" ></div>";
        var c = mcomponent({viewHtml : v});
        assertEquals(c.assert.assertRender(), v);
    },

    "test set view with tabs" : function() {
        var v = "\t\t\t";
        var c = mcomponent({viewHtml : v});
        assertEquals(c.assert.assertRender(), v);
    },

    "test set view with line breaks" : function() {
        var v = "\n\n";
        var c = mcomponent({viewHtml : v});
        assertEquals(c.assert.assertRender(), v);
    },

    "test set view with row breaks" : function() {
        var v = "\r\r";
        var c = mcomponent({viewHtml : v});
        assertEquals(c.assert.assertRender(), v);
    },

    "test set view with line breaks, row breaks and tabs" : function() {
        var v = "\r\n\t";
        var c = mcomponent({viewHtml : v});
        assertEquals(c.assert.assertRender(), v);
    },

    "test set view with line breaks and quotes" : function() {
        var v = "\n''\n";
        var c = mcomponent({viewHtml : v});
        assertEquals(c.assert.assertRender(), v);
    },

    "test set view with mixed line breaks, tabs and double quotes" : function() {
        var v = '\n"\t"\n';
        var c = mcomponent({viewHtml : v});
        assertEquals(c.assert.assertRender(), v);
    },

    "test set view with back slashes" : function() {
        var v = "\\ttt\\";
        var c = mcomponent({viewHtml : v});
        assertEquals(c.assert.assertRender(), v);
    }

});

TestCase("Set view with weird HTML", {

    "test set view via construction with weird HTML" : function() {
        var a = mcomponent({viewHtml : "ÅÄÖ=#€%"});
        assertEquals("ÅÄÖ=#€%", a.assert.assertRender());
    },

    "test set view via construction with really weird HTML" : function() {
        var a = mcomponent({viewHtml : '!2394839835€)(%!##€&!#/€!#")!""#!"#)£§|∞§©£@][≈£≈'});
        assertEquals('!2394839835€)(%!##€&!#/€!#")!""#!"#)£§|∞§©£@][≈£≈', a.assert.assertRender());
    },

    "test set view via construction with weird really really HTML" : function() {
        var a = mcomponent({viewHtml : '{ { !2394839835€)(%!##€&!#/€!#")!""#!"#)£§|∞§©£@][≈£≈ } }   '});
        assertEquals('{ { !2394839835€)(%!##€&!#/€!#")!""#!"#)£§|∞§©£@][≈£≈ } }   ', a.assert.assertRender());
    }

});

TestCase("Invalid tags", {

    "test showjs with unterminated js string throws exception" : function() {
        assertException(function() {
            mcomponent({
                viewHtml : '{{ showjs "mattias }}',
                throwOnError : true
            });
        });
    },

    "test invalid tag name that is also incorrect JS syntax throws exception" : function() {
        assertException(function() {
            mcomponent({
                viewHtml : '{{ * showjs alert("hej") }}',
                throwOnError : true
            });
        });
    },

    "test invalid tag name that is also invalid JS code throws exception" : function() {
        assertException(function() {
            mcomponent({
                viewHtml : '{{ Å showjs alert("hej") }}',
                throwOnError : true
            });
        });
    },

    "test showjs with unterminated js string renders error message" : function() {
        var c = mcomponent({
            viewHtml : '{{ showjs "mattias }}'
        });
        assertTrue(c.assert.assertRender() !== "");
    },

    "test invalid tag name that is also incorrect JS syntax renders error message" : function() {
        var c = mcomponent({
            viewHtml : '{{ * showjs alert("hej") }}'
        });
        assertTrue(c.assert.assertRender() !== "");
    },

    "test inside true if case, invalid tag name that is also incorrect JS syntax renders error message" : function() {
        var c = mcomponent({
            viewHtml : '{{ if true }}{{ * showjs alert("hej") }}{{ endif }}'
        });
        assertTrueQunit(c.assert.assertRender() !== "", "Should not be empty, should contain an error message.");
    }

});


TestCase("Showing other things than model properties", {

    "test showing api.lookup()" : function() {
        var c = mcomponent({model : {name : "mattias"}, viewHtml : "{{ show api.lookup('name'); }}"});
        assertEquals("Should contain 'mattias' after API lookup.", "mattias", c.assert.assertRender());
    },

    "test showing Math.floor()" : function() {
        var c = mcomponent({model : {name : "mattias"}, viewHtml : "{{ show Math.floor(1.5); }}"});
        assertEquals("Should contain '1' after Math.floor.", "1", c.assert.assertRender());
    },

    "test showing Math.floor() without specifying 'show' tag" : function() {
        var c = mcomponent({model : {name : "mattias"}, viewHtml : "{{ Math.floor(1.5) }}"});
        assertEquals("Should contain '1' after Math.floor.", "1", c.assert.assertRender());
    },

    "test showing model properties that doesn't exist" : function() {
        var model = {name : "mattias"};
        var c = mcomponent({ model : model, viewHtml : "{{ age }}" });
        assertTrueQunit(c.assert.assertRender() !== "", "Should contain an error message after API lookup.");
        model.age = 32;
        assertEquals("Should now contain lookup result.", "32", c.assert.assertRender());
    }

});

