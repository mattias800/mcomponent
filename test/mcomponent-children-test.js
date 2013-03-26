TestCase("Child components", {

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

    }

});
