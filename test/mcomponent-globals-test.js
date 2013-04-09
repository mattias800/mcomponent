TestCase("Globals", {

    "test globals in args is part of getGlobals()" : function() {
        var c = mcomponent({globals : {name : "must" }});
        assertEquals("must", c.getGlobals().name);
    },

    "test globals in args is not empty when rendering" : function() {
        var c = mcomponent({globals : {name : "must" }, viewHtml : "{{ showjs JSON.stringify(globals) }}"});
        assertNotEquals("{}", c.assert.assertRender());
    },

    "test globals in args is rendered correctly" : function() {
        var c = mcomponent({globals : {name : "must" }, viewHtml : "{{ showjs globals.name }}"});
        assertEquals("must", c.assert.assertRender());
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
