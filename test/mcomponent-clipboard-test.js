TestCase("Clipboards", {

    "test clipboard that uses parents model" : function() {
        var c = mcomponent({
            clipboard : {clip1 : "{{ if (model.age) }}{{ show age }}{{ endif }}"},
            model : {age : 80},
            viewHtml : "{{ paste clip1 }}"
        });
        assertEquals("80", c.assert.assertRender());
    },

    "test nested clipboards" : function() {
        var c = mcomponent({
            clipboard : {
                clip1 : "{{ if (model.age) }}{{ paste clip2 }}{{ endif }}",
                clip2 : "{{ show age }}"
            },
            model : {age : 80},
            viewHtml : "{{ paste clip1 }}"
        });
        assertEquals("80", c.assert.assertRender());
    },

    "test clipboard copied from view, does not remove copied content" : function() {
        var c = mcomponent({
            model : {age : 85},
            viewHtml : "{{ copy clip1 }}{{ show age }}{{ endcopy }}"
        });
        assertEquals("85", c.assert.assertRender());
    },

    "test Copying from inside view, should paste and result in '8080'." : function() {
        var c = mcomponent({
            model : {age : 81},
            viewHtml : "{{ copy clip1 }}{{ show age }}{{ endcopy }}{{ paste clip1 }}"
        });
        assertEquals("8181", c.assert.assertRender());
    },

    "test predefined clipboard" : function() {
        var c = mcomponent({
            clipboard : { clip1 : "<div>hej</div>" },
            model : {age : 80},
            viewHtml : "<div>{{ paste clip1 }}</div>"
        });
        assertEquals("<div><div>hej</div></div>", c.assert.assertRender());
    },

    "test empty clipboard yields in empty result" : function() {
        var c = mcomponent({
            clipboard : {clip1 : ""},
            viewHtml : "{{ paste clip1 }}"
        });
        assertEquals("", c.assert.assertRender());
    },

    "test paste clipboards that is missing returns error" : function() {
        var c = mcomponent({
            viewHtml : "{{ paste clip1 }}"
        });
        assertTrue(c.assert.assertRender() !== "");
    },

    "test paste clipboards that is missing throws exception when rendering" : function() {
        var c = mcomponent({
            throwOnError : true,
            viewHtml : "{{ paste clip1 }}"
        });
        assertException(function() {
            c.assert.assertRender()
        });
    },

    "test paste invalid clipboard returns error" : function() {
        var c = mcomponent({
            clipboard : {clip1 : "{{ if model.age) }}{{ endif }}"},
            viewHtml : "{{ paste clip1 }}"
        });
        assertTrue(c.assert.assertRender() !== "");
    },

    "test paste invalid clipboard throws exception when compiling" : function() {
        assertException(function() {
            mcomponent({
                throwOnError : true,
                clipboard : {clip1 : "{{ if model.age) }}{{ endif }}"},
                viewHtml : "{{ paste clip1 }}"
            });
        });
    }

});
