TestCase("Complex syntax tree for if cases", {

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
        assertTrue("Root contains 9 elements.", c.assert.assertListSize(9));
        assertEquals("Root contains 3 elements.", 3, c._.getTree().length);
        assertEquals("First root tag should be if tag.", "1", c._.getTree()[0].html);
        assertEquals("Second root tag should be if tag.", "if", c._.getTree()[1].tagName);
        assertEquals("Second level should be HTML '2'.", "2", c._.getTree()[1].content[0].html);
        assertEquals("Second level should also have an if tag 7.", "if", c._.getTree()[1].content[1].tagName);
    }
});

TestCase("Syntax tree for mixed tag types", {

    "test General" : function() {
        var c = mcomponent({viewHtml : "{{ if (name) }}{{ push age }}test{{ endpush }}{{ endif }}"});
        assertEquals("Root contains only one element.", 1, c._.getTree().length);
        assertEquals("First root tag should be if tag.", "if", c._.getTree()[0].tagName);
        assertEquals("Second level should be a push.", "push", c._.getTree()[0].content[0].tagName);
        assertEquals("Second level should be HTML 'test'.", "test", c._.getTree()[0].content[0].content[0].html);
    }

});

TestCase("Syntax tree for push tags", {

    "test General" : function() {
        var c = mcomponent({viewHtml : "{{ push age }}test{{ endpush }}"});
        assertEquals("Root contains only one element.", 1, c._.getTree().length);
        assertEquals("First root tag should be push tag.", "push", c._.getTree()[0].tagName);
        assertEquals("Second level should be HTML 'test'.", "test", c._.getTree()[0].content[0].html);
    }

});

TestCase("Syntax tree for if tags", {

    "test if, elseif, else tags" : function() {
        var c = mcomponent({viewHtml : "{{ if (true) }}1{{ else }}2{{ endif }}"});
        assertTrue("List size is 5.", c.assert.assertListSize(5));
        assertEquals("Only one condition in if case.", 1, c._.getTree()[0].conditions.length);
        assertEquals("Only one conditioned root.", 1, c._.getTree()[0].contentRoots.length);
        assertEquals("Only one element in the true-conditioned root.", 1, c._.getTree()[0].contentRoots[0].length);
        assertEquals("True case contains '1'.", 1, c._.getTree()[0].contentRoots[0][0].html);
        assertEquals("Else contains one element", 1, c._.getTree()[0].elseContent.length);
        assertEquals("Else contains '2'.", 2, c._.getTree()[0].elseContent[0].html);
    },

    "test nested if tags" : function() {
        var c = mcomponent({viewHtml : "{{ if (true) }}1{{ if (false) }}2{{ endif }}{{ endif }}"});
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


