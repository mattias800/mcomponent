TestCase("Tag - showif", {

    "test showif doesn't output error message when missing property" : function() {
        var c = mcomponent({model : {}, viewHtml : "{{ showif username }}"});
        assertEquals("", c.assert.assertRender());
    },

    "test showif doesn't throw error when missing property" : function() {
        assertNoException(function() {
            mcomponent({model : {}, throwOnError : true, viewHtml : "{{ showif username }}"});
        });
    },

    "test showif doesn't output error message when missing model" : function() {
        var c = mcomponent({model : undefined, viewHtml : "{{ showif username }}"});
        assertEquals("", c.assert.assertRender());
    },

    "test showif doesn't throw error when missing model" : function() {
        assertNoException(function() {
            mcomponent({model : undefined, throwOnError : true, viewHtml : "{{ showif username }}"});
        });
    }

});
