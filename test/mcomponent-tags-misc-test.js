TestCase("Show tag", {

    "test show tag" : function() {

        var c = mcomponent({model : {name : "mattias"}, viewHtml : "{{ show name }}"});
        assertEquals("Should contain 'mattias'.", "mattias", c.assert.assertRender());

        var c = mcomponent({model : {user : {name : "marcus"}}, viewHtml : "{{ show user.name }}"});
        assertEquals("Should contain 'marcus'.", "marcus", c.assert.assertRender());

        var c = mcomponent({model : "marcus", viewHtml : "{{ show }}"});
        assertEquals("Should contain 'marcus'.", "marcus", c.assert.assertRender());

        var c = mcomponent({model : { list : [
            {url : "www.google.com" },
            {url : "www.facebook.com"}
        ]}, viewHtml : "{{ model.list[0].url }}"});
        assertEquals("Should contain 'www.google.com' using lookup with runFunction().", "www.google.com", c.assert.assertRender());

        var c = mcomponent({model : { list : [
            {url : "www.google.com" },
            {url : "www.facebook.com"}
        ]}, viewHtml : "{{ model.list[1].url }}"});
        assertEquals("Should contain 'www.facebook.com' using lookup with runFunction().", "www.facebook.com", c.assert.assertRender());

        var c = mcomponent({model : { list : [
            {url : "www.google.com" },
            {url : "www.facebook.com"}
        ]}, viewHtml : "{{ showjs model.list[0].url }}"});
        assertEquals("Should contain 'www.google.com' using showjs.", "www.google.com", c.assert.assertRender());

    }

});

TestCase("Push tag", {

    "test push tag" : function() {

        var c;

        c = mcomponent({model : {user : {name : "marcus"}, test : "yeah"}, viewHtml : "{{ push user }}{{ endpush }}"});
        assertEquals("Should contain nothing.", "", c.assert.assertRender());

        c = mcomponent({model : {user : {name : "marcus"}, test : "yeah"}, viewHtml : "{{ push user }}{{ show name }}{{ endpush }}"});
        assertEquals("Should contain 'marcus'.", "marcus", c.assert.assertRender());

        c = mcomponent({model : {user : {name : "marcus"}, testball : "yeah"}, viewHtml : "{{ push user }}{{ show testball }}{{ endpush }}"});
        assertEquals("Should contain 'yeah' instead.", "yeah", c.assert.assertRender());

        c = mcomponent({model : {
            db : {
                user : {
                    name : "marcus"
                },
                testyeah : "yeah"
            }
        }, viewHtml : "{{ push db.user }}{{ show testyeah }}{{ endpush }}"});
        assertTrue("Pushing two level property. Should contain something since model stack lookup should fail and cause error.", c.assert.assertRender() !== "");

        c = mcomponent({
                model : {
                    db : {
                        user : {
                            name : "marcus"
                        },
                        testyeah : "yeah"
                    }
                },
                viewHtml : "{{ push db.user }}{{ show testyeah }}{{ endpush }}",
                throwOnError : true
            }
        );
        assertException("Pushing two level property. Should contain something since model stack lookup should fail and cause error.", function() {
            c.assert.assertRender();
        })

        c = mcomponent({model : {
            db : {
                user : {
                    name : "marcus"
                }
            },
            test : "yeah"
        }, viewHtml : "{{ push db.user }}{{ show test }}{{ endpush }}"});
        assertEquals("Pushing two level property. Should contain 'yeah'.", "yeah", c.assert.assertRender());

        c = mcomponent({model : {db : {user : {name : "marcus"}, test : "yeah"}}, viewHtml : "{{ push db.user }}{{ show name }}{{ endpush }}"});
        assertEquals("Pushing two level property. Should contain 'marcus'.", "marcus", c.assert.assertRender());


    }

});

