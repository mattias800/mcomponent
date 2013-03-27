TestCase("Property lookup with no model", {

    "test failed property lookup throws exception when throwOnError is true" : function() {
        var c = mcomponent({throwOnError : true, viewHtml : "{{ hotelId }}"});
        assertException(function() {
            c.assert.assertRender();
        });
    },

    "test failed property lookup render error message when throwOnError is true" : function() {
        var c = mcomponent({throwOnError : true, viewHtml : "{{ hotelId }}"});
        try {
            c.assert.assertRender();
        } catch (e) {
        }
        assertTrue(c.hasRenderErrors());
    },

    "test failed property lookup render error message when throwOnError is false" : function() {
        var c = mcomponent({throwOnError : false, viewHtml : "{{ hotelId }}"});
        var r = c.assert.assertRender();
        assertTrue(r.indexOf("Error at tag {{ hotelId }}:") >= 0);
        assertTrue(c.hasRenderErrors());
    }

});

TestCase("Property lookup errors with model", {

    "test failed property lookup throws exception when throwOnError is true" : function() {
        var c = mcomponent({throwOnError : true, model : {}, viewHtml : "{{ hotelId }}"});
        assertException(function() {
            c.assert.assertRender();
        });
    },

    "test failed property lookup render error message when throwOnError is false" : function() {
        var c = mcomponent({throwOnError : false, model : {}, viewHtml : "{{ hotelId }}"});
        var r = c.assert.assertRender();
        assertTrue(r.indexOf("Error at tag {{ hotelId }}:") >= 0);
        assertTrue(c.hasRenderErrors());
    }

});

