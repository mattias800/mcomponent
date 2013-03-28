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

    "test faulty tag with no HTML and if-case outputs error message" : function() {
        var c = mcomponent({viewHtml : "{{ if true }}{{ showjs undefined.x() }}{{ endif }}"});
        var r = c.assert.assertRender();
        assertTrue(r.indexOf("Error at tag {{ showjs undefined.x() }}:") >= 0);
    },

    "test faulty tag with no HTML and if-case sets hasRenderErrors correctly" : function() {
        var c = mcomponent({viewHtml : "{{ if true }}{{ showjs undefined.x() }}{{ endif }}"});
        var r = c.assert.assertRender();
        assertTrue(c.hasRenderErrors());
    },

    "test faulty tag with no HTML and if-case sets hasCompileErrors to false" : function() {
        var c = mcomponent({viewHtml : "{{ if true }}{{ showjs undefined.x() }}{{ endif }}"});
        var r = c.assert.assertRender();
        assertFalse(c.hasCompileError());
    },

    "test one error tag and surrounding HTML outputs all HTML" : function() {
        var c = mcomponent({viewHtml : "a{{ showjs undefined.x() }}b"});
        var r = c.assert.assertRender();
        assertEquals("a", r.substring(0, 1));
        assertEquals("b", r.substring(r.length - 1));
        assertTrue(r.indexOf("Error at tag {{ showjs undefined.x() }}:") >= 0);
    },

    "test one error tag and surrounding HTML sets hasRenderErrors correctly" : function() {
        var c = mcomponent({viewHtml : "a{{ showjs undefined.x() }}b"});
        var r = c.assert.assertRender();
        assertTrue(c.hasRenderErrors());
    },

    "test one error tag and surrounding HTML sets hasCompileErrors correctly" : function() {
        var c = mcomponent({viewHtml : "a{{ showjs undefined.x() }}b"});
        var r = c.assert.assertRender();
        assertFalse(c.hasCompileError());
    },

    "test one failed property lookup and surrounding HTML outputs all HTML" : function() {
        var c = mcomponent({model : {}, viewHtml : "a{{ name }}b"});
        var r = c.assert.assertRender();
        assertEquals("a", r.substring(0, 1));
        assertEquals("b", r.substring(r.length - 1));
        assertTrue(r.indexOf("Error at tag {{ name }}:") >= 0);
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

TestCase("Errors that should cancel compilation", {

    "test js tag with faulty code syntax renders error message" : function() {
        var c = mcomponent({model : {}, viewHtml : "{{ js ibelogs(model.hotelDetails.description }}"});
        var r = c.assert.assertRender();
        assertTrue(r.indexOf("Error compiling tag {{ js ibelogs(model.hotelDetails.description }}:") >= 0);
    },

    "test js tag with faulty code syntax throws exception" : function() {
        assertException(function() {
            mcomponent({throwOnError : true, model : {}, viewHtml : "{{ js ibelogs(model.hotelDetails.description }}"});
        });
    },

    "test js tag with faulty code syntax set hasCompileError correctly" : function() {
        var c = mcomponent({debugEnabled : true, model : {}, viewHtml : "{{ js ibelogs(model.hotelDetails.description }}"});
        var r = c.assert.assertRender();
        assertTrue(c.hasCompileError());
    },

    "test js tag with faulty code syntax set hasRenderError correctly" : function() {
        var c = mcomponent({model : {}, viewHtml : "{{ js ibelogs(model.hotelDetails.description }}"});
        var r = c.assert.assertRender();
        assertTrue(c.hasRenderErrors());
    },

    "test missing if set hasRenderError correctly" : function() {
        var c = mcomponent({model : {}, viewHtml : "{{ endif }}"});
        var r = c.assert.assertRender();
        assertTrue(c.hasRenderErrors());
    }

});

TestCase("No rendering of error messages to result", {

    "test that the faulty tag doesn't render any error message to result" : function() {
        var c = mcomponent({renderError : false, model : {}, viewHtml : "{{ js ibelogs(model.hotelDetails.description }}"});
        assertEquals("", c.assert.assertRender());
    },

    "test faulty tag JS syntax cancels compilation, so HTML is not outputted" : function() {
        var c = mcomponent({renderError : false, model : {}, viewHtml : "ab{{ js ibelogs(model.hotelDetails.description }}cd"});
        assertEquals("", c.assert.assertRender());
    },

    "test faulty tag JS logic renders but causes error, HTML should still be intact" : function() {
        var c = mcomponent({renderError : false, model : {}, viewHtml : "ab{{ name }}cd"});
        assertEquals("abcd", c.assert.assertRender());
    }

});
