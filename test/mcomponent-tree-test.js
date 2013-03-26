TestCase("Tree for if cases", {

    "test if tag" : function() {
        var c = mcomponent({viewHtml : "{{ if (true) }}baibai{{ endif }}"});
        assertEquals("Root contains only one element.", 1, c._.getTree().length);
        assertEquals("First root tag should be if tag.", "if", c._.getTree()[0].tagName);
        assertEquals("Second level should be HTML 'baibai'.", "baibai", c._.getTree()[0].content[0].html);
    },

    "test nested if tags with all true conditions" : function() {
        var c = mcomponent({viewHtml : "{{ if (true) }}1{{ if (true) }}2{{ endif }}{{ endif }}"});
        assertTrue("Root contains 6 elements.", c.assert.assertListSize(6));
        assertEquals("Root contains 1 elements.", 1, c._.getTree().length);
        assertEquals("First root tag should be if tag.", "if", c._.getTree()[0].tagName);
        assertEquals("Second level should be HTML '1'.", "1", c._.getTree()[0].content[0].html);
        assertEquals("Second level should also have an if tag 1.", "if", c._.getTree()[0].content[1].tagName);
    },

    "test nested if tag with outer true, inner false condition" : function() {
        var c = mcomponent({viewHtml : "{{ if (true) }}1{{ if (false) }}2{{ endif }}{{ endif }}"});
        assertTrue("Root contains 6 elements.", c.assert.assertListSize(6));
        assertEquals("Root contains 1 elements.", 1, c._.getTree().length);
        assertEquals("First root tag should be if tag.", "if", c._.getTree()[0].tagName);
        assertEquals("Second level should be HTML '1'.", "1", c._.getTree()[0].content[0].html);
        assertEquals("Second level should also have an if tag 2.", "if", c._.getTree()[0].content[1].tagName);
    },

    "test nested if tag with outer false, inner true condition" : function() {
        var c = mcomponent({viewHtml : "{{ if (false) }}1{{ if (true) }}2{{ endif }}{{ endif }}"});
        assertTrue("Root contains 6 elements.", c.assert.assertListSize(6));
        assertEquals("Root contains 1 elements.", 1, c._.getTree().length);
        assertEquals("First root tag should be if tag.", "if", c._.getTree()[0].tagName);
        assertEquals("Second level should be HTML '1'.", "1", c._.getTree()[0].content[0].html);
        assertEquals("Second level should also have an if tag 3.", "if", c._.getTree()[0].content[1].tagName);
    },

    "test nested if tags with all true conditions and HTML around" : function() {
        var c = mcomponent({viewHtml : "1{{ if (true) }}2{{ if (true) }}3{{ endif }}4{{ endif }}5"});
        assertTrue("Root contains 9 elements.", c.assert.assertListSize(9));
        assertEquals("Root contains 3 elements.", 3, c._.getTree().length);
        assertEquals("First root tag should be if tag.", "1", c._.getTree()[0].html);
        assertEquals("Second root tag should be if tag.", "if", c._.getTree()[1].tagName);
        assertEquals("Second level should be HTML '2'.", "2", c._.getTree()[1].content[0].html);
        assertEquals("Second level should also have an if tag 4.", "if", c._.getTree()[1].content[1].tagName);
    },

    "test nested if tags with outer true, inner false conditions and HTML around" : function() {
        var c = mcomponent({viewHtml : "1{{ if (true) }}2{{ if (false) }}3{{ endif }}4{{ endif }}5"});
        assertTrue("Root contains 9 elements.", c.assert.assertListSize(9));
        assertEquals("Root contains 3 elements.", 3, c._.getTree().length);
        assertEquals("First root tag should be if tag.", "1", c._.getTree()[0].html);
        assertEquals("Second root tag should be if tag.", "if", c._.getTree()[1].tagName);
        assertEquals("Second level should be HTML '2'.", "2", c._.getTree()[1].content[0].html);
        assertEquals("Second level should also have an if tag.", "if", c._.getTree()[1].content[1].tagName);
    },

    "test nested if tags with outer false, inner true conditions and HTML around" : function() {
        var c = mcomponent({viewHtml : "1{{ if (false) }}2{{ if (true) }}3{{ endif }}4{{ endif }}5"});
        assertTrue("Root contains 9 elements.", c.assert.assertListSize(9));
        assertEquals("Root contains 3 elements.", 3, c._.getTree().length);
        assertEquals("First root tag should be if tag.", "1", c._.getTree()[0].html);
        assertEquals("Second root tag should be if tag.", "if", c._.getTree()[1].tagName);
        assertEquals("Second level should be HTML '2'.", "2", c._.getTree()[1].content[0].html);
        assertEquals("Second level should also have an if tag 5.", "if", c._.getTree()[1].content[1].tagName);
    },

    "test nested if tags with outer true, inner model lookup true conditions and HTML around" : function() {
        var c = mcomponent({model : {name : "mattias"}, viewHtml : "1{{ if (true) }}2{{ if (this.model.name == 'mattias') }}3{{ endif }}4{{ endif }}5"});
        assertTrue("Root contains 9 elements.", c.assert.assertListSize(9));
        assertEquals("Root contains 3 elements.", 3, c._.getTree().length);
        assertEquals("First root tag should be if tag.", "1", c._.getTree()[0].html);
        assertEquals("Second root tag should be if tag.", "if", c._.getTree()[1].tagName);
        assertEquals("Second level should be HTML '2'.", "2", c._.getTree()[1].content[0].html);
        assertEquals("Second level should also have an if tag 6.", "if", c._.getTree()[1].content[1].tagName);
    },

    "test nested if tags with outer true, inner model lookup false conditions and HTML around" : function() {
        var c = mcomponent({model : {name : "mattias"}, viewHtml : "1{{ if (true) }}2{{ if (this.model.name != 'mattias') }}3{{ endif }}4{{ endif }}5"});
        assertTrueQunit(c.assert.assertListSize(9), "Root contains 9 elements.");
        assertEqualsQunit(c._.getTree().length, 3, "Root contains 3 elements.");
        assertEqualsQunit(c._.getTree()[0].html, "1", "First root tag should be if tag.");
        assertEqualsQunit(c._.getTree()[1].tagName, "if", "Second root tag should be if tag.");
        assertEqualsQunit(c._.getTree()[1].content[0].html, "2", "Second level should be HTML '2'.");
        assertEqualsQunit(c._.getTree()[1].content[1].tagName, "if", "Second level should also have an if tag 7.");
    }
});
