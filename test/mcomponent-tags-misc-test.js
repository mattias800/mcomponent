TestCase("Show tag", {

    "test show tag" : function() {

        var c = mcomponent({model : {name : "mattias"}, viewHtml : "{{ show name }}"});
        assertEqualsQunit(c.assert.assertRender(), "mattias", "Should contain 'mattias'.");

        var c = mcomponent({model : {user : {name : "marcus"}}, viewHtml : "{{ show user.name }}"});
        assertEqualsQunit(c.assert.assertRender(), "marcus", "Should contain 'marcus'.");

        var c = mcomponent({model : "marcus", viewHtml : "{{ show }}"});
        assertEqualsQunit(c.assert.assertRender(), "marcus", "Should contain 'marcus'.");

        var c = mcomponent({model : { list : [
            {url : "www.google.com" },
            {url : "www.facebook.com"}
        ]}, viewHtml : "{{ model.list[0].url }}"});
        assertEqualsQunit(c.assert.assertRender(), "www.google.com", "Should contain 'www.google.com' using lookup with runFunction().");

        var c = mcomponent({model : { list : [
            {url : "www.google.com" },
            {url : "www.facebook.com"}
        ]}, viewHtml : "{{ model.list[1].url }}"});
        assertEqualsQunit(c.assert.assertRender(), "www.facebook.com", "Should contain 'www.facebook.com' using lookup with runFunction().");

        var c = mcomponent({model : { list : [
            {url : "www.google.com" },
            {url : "www.facebook.com"}
        ]}, viewHtml : "{{ showjs model.list[0].url }}"});
        assertEqualsQunit(c.assert.assertRender(), "www.google.com", "Should contain 'www.google.com' using showjs.");

    }

});

TestCase("Push tag", {

    "test push tag" : function() {

        var c;

        c = mcomponent({model : {user : {name : "marcus"}, test : "yeah"}, viewHtml : "{{ push user }}{{ endpush }}"});
        assertEqualsQunit(c.assert.assertRender(), "", "Should contain nothing.");

        c = mcomponent({model : {user : {name : "marcus"}, test : "yeah"}, viewHtml : "{{ push user }}{{ show name }}{{ endpush }}"});
        assertEqualsQunit(c.assert.assertRender(), "marcus", "Should contain 'marcus'.");

        c = mcomponent({model : {user : {name : "marcus"}, testball : "yeah"}, viewHtml : "{{ push user }}{{ show testball }}{{ endpush }}"});
        assertEqualsQunit(c.assert.assertRender(), "yeah", "Should contain 'yeah' instead.");

        c = mcomponent({model : {
            db : {
                user : {
                    name : "marcus"
                },
                testyeah : "yeah"
            }
        }, viewHtml : "{{ push db.user }}{{ show testyeah }}{{ endpush }}"});
        assertTrueQunit(c.assert.assertRender() !== "", "Pushing two level property. Should contain something since model stack lookup should fail and cause error.");

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
        assertExceptionQunit(function() {
            c.assert.assertRender();
        }, "Pushing two level property. Should contain something since model stack lookup should fail and cause error.")

        c = mcomponent({model : {
            db : {
                user : {
                    name : "marcus"
                }
            },
            test : "yeah"
        }, viewHtml : "{{ push db.user }}{{ show test }}{{ endpush }}"});
        assertEqualsQunit(c.assert.assertRender(), "yeah", "Pushing two level property. Should contain 'yeah'.");

        c = mcomponent({model : {db : {user : {name : "marcus"}, test : "yeah"}}, viewHtml : "{{ push db.user }}{{ show name }}{{ endpush }}"});
        assertEqualsQunit(c.assert.assertRender(), "marcus", "Pushing two level property. Should contain 'marcus'.");


    }

});

