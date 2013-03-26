TestCase("Child components", {

    "test child component renders correctly after being added with addChild()" : function() {
        var c = mcomponent({model : {username : "mattias"}, viewHtml : "{{ username }}"});
        var parent = mcomponent({model : {userNumber : "3"}, viewHtml : "{{ userNumber }} {{ component mata }}"});
        parent.addChild("mata", c);
        assertEquals("3 mattias", parent.assert.assertRender());
    },

    "test addChild() works and component renders correctly by itself and as child" : function() {
        var c = mcomponent({model : {username : "mattias"}, viewHtml : "{{ username }}"});
        var parent = mcomponent({model : {userNumber : "3"}, viewHtml : "{{ userNumber }} {{ component mata }}"});
        assertEquals("mattias", c.assert.assertRender());
        parent.addChild("mata", c);
        assertEquals("3 mattias", parent.assert.assertRender());
    },

    "test child component and parent component renders correctly, child added at parent construction" : function() {
        var c = mcomponent({model : {color : "black"}, viewHtml : "{{ color }}"});
        var parent = mcomponent({
            model : {label : "The color : "},
            viewHtml : "{{ label }}{{ component testChild }}",
            children : {
                "testChild" : c
            }
        });
        assertEquals("black", c.assert.assertRender());
        assertEquals("The color : black", parent.assert.assertRender());
    },

    "test including child that doesn't exist throws exception" : function() {
        var c = mcomponent({model : {color : "black"}, viewHtml : "{{ color }}"});
        assertException(function() {
            mcomponent({
                model : {label : "The color : "},
                viewHtml : "{{ label }}{{ component testChild }}",
                children : {
                    "test Child" : c
                }
            });
        });
    },

    "test addChild() fails when adding component with id with space" : function() {
        var c = mcomponent({model : {username : "mattias"}, viewHtml : "{{ username }}"});
        var parent = mcomponent({model : {userNumber : "3"}, viewHtml : "{{ userNumber }} {{ component mat }}"});
        assertEqualsQunit(c.assert.assertRender(), "mattias", "Should contain 'mattias'.");
        assertException("Should raise exception since id contains space.", function() {
            parent.addChild("mat tias", c);
        });
    },

    "test addChild() fails when adding component with id with !" : function() {
        var c = mcomponent({model : {username : "mattias"}, viewHtml : "{{ username }}"});
        var parent = mcomponent({model : {userNumber : "3"}, viewHtml : "{{ userNumber }} {{ component mat }}"});
        assertException("Should raise exception since id contains space.", function() {
            parent.addChild("mat!tias", c);
        });
    },

    "test addChild() fails when adding component with id with exclamation #" : function() {
        var c = mcomponent({model : {username : "mattias"}, viewHtml : "{{ username }}"});
        var parent = mcomponent({model : {userNumber : "3"}, viewHtml : "{{ userNumber }} {{ component mat }}"});
        assertException("Should raise exception since id contains space.", function() {
            parent.addChild("mat#tias", c);
        });
    },

    "test adding and removing children and rerendering" : function() {
        var parent, c;

        c = mcomponent({model : {username : "mattias"}, viewHtml : "{{ username }}"});
        parent = mcomponent({model : {userNumber : "3"}, viewHtml : "{{ userNumber }} {{ component mata }}"});
        parent.addChild("mata", c);
        assertEquals("Parent, with child, should contain '3 mattias'.", "3 mattias", parent.assert.assertRender());
        parent.removeChild("mata");
        parent.assert.assertRender();
        assertTrue("Should have a render error since child no longer exists.", parent.hasRenderErrors());
        assertTrue(parent.hasRenderErrors());

        parent.addChild("mata", c);
        assertEquals("Parent, with child, should contain '3 mattias'.", "3 mattias", parent.assert.assertRender());
        assertFalse("Should NOT have a render error since child exists again.", parent.hasRenderErrors());

    },

    "test child components with notrequired-attribute" : function() {
        var c = mcomponent({model : {username : "mattias"}, viewHtml : "{{ username }}"});
        var parent = mcomponent({model : {userNumber : "3"}, viewHtml : "{{ userNumber }} {{ component mata notrequired }}"});
        assertEquals("3 ", parent.assert.assertRender());
    },

    "test child components with notrequired-attribute misspelled should generate an error" : function() {
        var c = mcomponent({model : {username : "mattias"}, viewHtml : "{{ username }}"});
        var parent = mcomponent({model : {userNumber : "3"}, viewHtml : "{{ userNumber }} {{ component mata notrequiredd }}"});
        parent.addChild("mata", c);
        parent.assert.assertRender();
        assertTrue(parent.hasRenderErrors());
    }

});
