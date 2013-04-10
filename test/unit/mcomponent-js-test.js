TestCase("showjs and js", {

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
        assertException("Should throw null pointer exception.", function() {
            c.assert.assertRender();
        });
    },

    "test showjs with undefined exception" : function() {
        var c = mcomponent({viewHtml : "{{ showjs undefined.prutt() }}"});
        assertTrue("Should not be empty, must contain error.", c.assert.assertRender() !== "");
    }

});
