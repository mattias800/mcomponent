TestCase("Find blocks with specified list", {

    c : mcomponent({debugEnabled : true}),

    "test it" : function() {

        var list = [
            // 0
            {"html" : "before"},
            // 1
            {"tag" : "if aaaname", "tagName" : "if", "parameters" : "aaaname"},
            // 2
            {"html" : "inside"},
            // 3
            {"tag" : "endif", "tagName" : "endif", "parameters" : ""},
            // 4
            {"html" : "after"}
        ];

        assertEquals(3, this.c._.findBlockEnd(list, 1, {}).index);

    }

});

TestCase("Find blocks", {

    "test findBlockEndIndex() throws exception when trying to find block end for a tag that doesn't open a block" : function() {
        var c = mcomponent({viewHtml : "{{ name }}{{ name }}"});
        assertTrue(c.assert.assertListSize(2));
        assertException("Not tag with block, throw exception", function() {
            c._.findBlockEndIndex(0)
        });
    },

    "test throws exception when missing endif" : function() {
        assertException("Throws error since template is malformed.", function() {
            mcomponent({
                viewHtml : "{{ if name }}",
                throwOnError : true
            });
        });
    },

    "test findBlockEndIndex() throws exception when list is to short to have a block" : function() {
        var c = mcomponent({viewHtml : "{{ name }}"});
        assertTrue(c.assert.assertListSize(1));
        assertException(function() {
            c._.findBlockEndIndex(0)
        });
    },

    "test findBlockEndIndex() finds endif after if with inner and outer HTML with no error" : function() {
        var c = mcomponent({debugEnabled : true, viewHtml : "before{{ if aaaname }}inside{{ endif }}after"});
        assertTrue(c.assert.assertListSize(5));
        assertNoException(function() {
            c._.findBlockEndIndex(1);
        });
    },

    "test findBlockEndIndex() finds endif after if with inner and outer HTML" : function() {
        var c = mcomponent({viewHtml : "before{{ if aaaname }}inside{{ endif }}after"});
        assertTrue(c.assert.assertListSize(5));
        assertEquals(3, c._.findBlockEndIndex(1));
    },

    "test findBlockEndIndex() finds endif after if with inner HTML" : function() {
        var c = mcomponent({viewHtml : "{{ if supername }}test{{ endif }}"});
        assertTrue(c.assert.assertListSize(3));
        assertEquals(2, c._.findBlockEndIndex(0));
    },

    "test findBlockEndIndex() finds outer ifs endif even though inner if tag is missing endif" : function() {
        var c = mcomponent();
        assertTrue(c.assert.assertSetViewAndBuildList("{{ if thename }}{{ if age }}test{{ endif }}"));
        assertTrue(c.assert.assertListSize(4));
        assertEquals("Should find ending tag on index 3.", 3, c._.findBlockEndIndex(1));
    },

    "test findBlockEndIndex() throws exception when not finding the second endif tag" : function() {
        var c = mcomponent();
        assertTrue(c.assert.assertSetViewAndBuildList("{{ if thename }}{{ if age }}test{{ endif }}"));
        assertTrue(c.assert.assertListSize(4));
        assertException("Should not find a closing endif.", function() {
            c._.findBlockEndIndex(0);
        });
    },

    "test findBlockEndIndex() find endif for both outer and inner if tag" : function() {
        var c = mcomponent({viewHtml : "{{ if name }}{{ if age }}test{{ endif }}{{ endif }}"});
        assertTrue("List size is 5.", c.assert.assertListSize(5));
        assertEquals("Should find ending tag on index 4.", 4, c._.findBlockEndIndex(0));
        assertEquals("Should find ending tag on index 3.", 3, c._.findBlockEndIndex(1));
    },

    "test findBlockEndIndex() finds end tag for both outer if and inner push" : function() {
        var c = mcomponent({viewHtml : "{{ if name }}{{ push age }}test{{ endpush }}{{ endif }}"});
        assertTrue("List size is 5.", c.assert.assertListSize(5));
        assertEquals("Should find ending tag on index 4.", 4, c._.findBlockEndIndex(0));
        assertEquals("Should find ending tag on index 3.", 3, c._.findBlockEndIndex(1));
    },

    "test findBlockEndIndex() for if-else cases with no HTML" : function() {
        var c = mcomponent({viewHtml : "{{ if (test) }}{{ else }}{{ endif }}"});
        assertTrue("List size is 3.", c.assert.assertListSize(3));
        assertEquals("Should find 'else' tag on index 1.", 1, c._.findBlockEndIndex(0, {endTags : ["else", "elseif"]}));
        assertEquals("Should find 'endif' tag on index 2.", 2, c._.findBlockEndIndex(0, {endTags : ["else", "elseif"], startIndex : 1}));
    },

    "test findBlockEndIndex() for if-else cases with HTML" : function() {
        var c = mcomponent({viewHtml : "{{ if (test) }}testtrue{{ else }}testfalse{{ endif }}"});
        assertTrue("List size is 5.", c.assert.assertListSize(5));
        assertEquals("Should find 'else' tag on index 1.", 2, c._.findBlockEndIndex(0, {endTags : ["else", "elseif"]}));
        assertEquals("Should find 'endif' tag on index 2.", 4, c._.findBlockEndIndex(0, {endTags : ["else", "elseif"], startIndex : 2}));
    },

    "test findBlockEndIndex() for if-elseif-else cases with no HTML" : function() {
        var c = mcomponent({viewHtml : "{{ if (test) }}{{ elseif (test2) }}{{ else }}{{ endif }}"});
        assertTrue(c.assert.assertListSize(4));
        assertEquals(1, c._.findBlockEndIndex(0, {endTags : ["else", "elseif"]}));
        assertEquals(2, c._.findBlockEndIndex(0, {endTags : ["else", "elseif"], startIndex : 1}));
        assertEquals(3, c._.findBlockEndIndex(0, {endTags : ["else", "elseif"], startIndex : 2}));
    },

    "test findBlockEndIndex() for if-elseif-else cases with HTML" : function() {
        var c = mcomponent({viewHtml : "{{ if (test) }}testIsTrue{{ elseif (test2) }}test2IsTrue{{ else }}neitherIsTrue{{ endif }}"});
        assertTrue(c.assert.assertListSize(7));
        assertEquals(2, c._.findBlockEndIndex(0, {endTags : ["else", "elseif"]}));
        assertEquals(4, c._.findBlockEndIndex(0, {endTags : ["else", "elseif"], startIndex : 2}));
        assertEquals(6, c._.findBlockEndIndex(0, {endTags : ["else", "elseif"], startIndex : 4}));
    }
});

