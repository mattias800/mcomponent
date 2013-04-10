TestCase("Error messages and formatting", {

    "test single endpush tag results in missing push tag error" : function() {
        var c = mcomponent({viewHtml : "{{ endpush }}"});
        var r = c.assert.assertRender();
        assertEquals(r, "Error compiling tag {{ endpush }}: Found closing tag without starting 'push' tag.");
    },

    "test missing endpush tag results in missing push tag error" : function() {
        var c = mcomponent({model : {user : {}}, viewHtml : "{{ push user }}{{ endpush }}{{ endpush }}"});
        var r = c.assert.assertRender();
        assertEquals(r, "Error compiling tag {{ endpush }}: Found closing tag without starting 'push' tag.");
    },

    "test single endif tag results in missing if tag error" : function() {
        var c = mcomponent({viewHtml : "{{ endif }}"});
        var r = c.assert.assertRender();
        assertEquals(r, "Error compiling tag {{ endif }}: Found closing tag without starting 'if' tag.");
    },

    "test missing endif tag results in missing if tag error" : function() {
        var c = mcomponent({viewHtml : "{{ if true }}{{ endif }}{{ endif }}"});
        var r = c.assert.assertRender();
        assertEquals(r, "Error compiling tag {{ endif }}: Found closing tag without starting 'if' tag.");
    }
});
