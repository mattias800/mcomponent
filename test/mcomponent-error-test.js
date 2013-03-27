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

TestCase("Errors should not interrupt rendering", {

    "test with no HTML and if-case" : function() {
        var c = mcomponent({viewHtml : "{{ if true }}{{ showjs undefined.x() }}{{ endif }}"});
        var r = c.assert.assertRender();
        assertTrue(r.indexOf("Error at tag {{ showjs undefined.x() }}:") >= 0);
    },

    "test one error tag and surrounding HTML outputs all HTML" : function() {
        var c = mcomponent({viewHtml : "a{{ showjs undefined.x() }}b"});
        var r = c.assert.assertRender();
        assertEquals("a", r.substring(0, 1));
        assertEquals("b", r.substring(r.length - 1));
        assertTrue(r.indexOf("Error at tag {{ showjs undefined.x() }}:") >= 0);
    },

    "test execution is interrupted with exception if throwOnError is true" : function() {
        var c = mcomponent({throwOnError : true, viewHtml : "a{{ showjs undefined.x() }}b"});
        assertException(function() {
            c.assert.assertRender();
        });
    },

    "test it with more errors" : function() {
        var c = mcomponent({viewHtml : "!a!{{ showjs undefined.x() }}!b!{{ showjs 'c' }}!d!{{ js x.y.z() }}!e!"});
        var r = c.assert.assertRender();
        assertTrue(r.indexOf("!a!") >= 0);
        assertTrue(r.indexOf("!b!") >= 0);
        assertTrue(r.indexOf("!c!") >= 0);
        assertTrue(r.indexOf("!d!") >= 0);
        assertTrue(r.indexOf("!e!") >= 0);
        assertTrue(r.indexOf("Error at tag {{ showjs undefined.x() }}:") >= 0);
        assertTrue(r.indexOf("Error at tag {{ js x.y.z() }}:") >= 0);
    }

});

