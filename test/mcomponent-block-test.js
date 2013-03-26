TestCase("Find blocks", {

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

