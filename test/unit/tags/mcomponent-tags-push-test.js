TestCase("Push tag", {

    "test push tag and property tag when pushed model is on top of stack": function () {
        var c = mcomponent({
            model: {name: "must", hair: {color: "black", styling: "awesome"}},
            viewHtml: "{{ push hair }}{{ color }}{{ endpush }}"
        });
        assertEquals("black", c.assert.assertRender());
    },

    "test show name is must even with push and no specified name": function () {
        var c = mcomponent({
            model: {name: "must"},
            viewHtml: "{{ push name }}{{ show }}{{ endpush }}"
        });
        assertEquals("must", c.assert.assertRender());
    },

    "test push tag": function () {

        var c;

        c = mcomponent({model: {user: {name: "marcus"}, test: "yeah"}, viewHtml: "{{ push user }}{{ endpush }}"});
        assertEquals("Should contain nothing.", "", c.assert.assertRender());

        c = mcomponent({model: {user: {name: "marcus"}, test: "yeah"}, viewHtml: "{{ push user }}{{ show name }}{{ endpush }}"});
        assertEquals("Should contain 'marcus'.", "marcus", c.assert.assertRender());

        c = mcomponent({model: {user: {name: "marcus"}, testball: "yeah"}, viewHtml: "{{ push user }}{{ show testball }}{{ endpush }}"});
        assertEquals("Should contain 'yeah' instead.", "yeah", c.assert.assertRender());

        c = mcomponent({model: {
            db: {
                user: {
                    name: "marcus"
                },
                testyeah: "yeah"
            }
        }, viewHtml: "{{ push db.user }}{{ show testyeah }}{{ endpush }}"});
        assertTrue("Pushing two level property. Should contain something since model stack lookup should fail and cause error.", c.assert.assertRender() !== "");

        c = mcomponent({
                model: {
                    db: {
                        user: {
                            name: "marcus"
                        },
                        testyeah: "yeah"
                    }
                },
                viewHtml: "{{ push db.user }}{{ show testyeah }}{{ endpush }}",
                throwOnError: true
            }
        );
        assertException("Pushing two level property. Should contain something since model stack lookup should fail and cause error.", function () {
            c.assert.assertRender();
        })

        c = mcomponent({model: {
            db: {
                user: {
                    name: "marcus"
                }
            },
            test: "yeah"
        }, viewHtml: "{{ push db.user }}{{ show test }}{{ endpush }}"});
        assertEquals("Pushing two level property. Should contain 'yeah'.", "yeah", c.assert.assertRender());

        c = mcomponent({model: {db: {user: {name: "marcus"}, test: "yeah"}}, viewHtml: "{{ push db.user }}{{ show name }}{{ endpush }}"});
        assertEquals("Pushing two level property. Should contain 'marcus'.", "marcus", c.assert.assertRender());

    }


});

TestCase("Push tag with JS code as specified model", {

    "test it": function () {
        var c = mcomponent({ viewHtml: "{{ push getUserModel() }}{{ name }}{{ endpush }}" });
        assertEquals("mattias", c.assert.assertRender());
    }

});

