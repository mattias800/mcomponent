TestCase("API", {

    "test api.lookup() with three-level property" : function() {
        var c = mcomponent({model : {
            displaySettings : {
                list : {
                    showName : "yes"
                }
            },
            user : {
                name : "mattias"
            }
        }, viewHtml : "{{ push user }}" +
            "{{ showjs api.lookup('displaySettings.list.showName') }}" +
            "{{ endpush }}"});
        assertEquals("yes", c.assert.assertRender());
    },

    "test api.getIterator(), pushing iterator to stack and then showing iterator.itemsPerPage = 1" : function() {
        var c = mcomponent({
            model : { list : ["mattias", "marcus", "johan"]},
            iter : {
                userListIter : { itemsPerPage : 1 }
            },
            viewHtml : "{{ niter userListIter list }}{{ push api.getIterator('userListIter') }}{{ itemsPerPage }}{{ endpush }}{{ endniter }}"});
        assertEquals("1", c.assert.assertRender());
    },

    "test api.getIterator(), pushing iterator to stack and then showing iterator.itemsPerPage = 2" : function() {
        var c = mcomponent({
            model : { list : ["mattias", "marcus", "johan"]},
            iter : {
                userListIter : { itemsPerPage : 2 }
            },
            viewHtml : "{{ niter userListIter list }}{{ push api.getIterator('userListIter') }}{{ itemsPerPage }}{{ endpush }}{{ endniter }}"});
        assertEquals("22", c.assert.assertRender());
    },

    "test api.getIterator(), pushing iterator to stack and then showing iterator.itemsPerPage = 3" : function() {
        var c = mcomponent({
            model : { list : ["mattias", "marcus", "johan"]},
            iter : {
                userListIter : { itemsPerPage : 3 }
            },
            viewHtml : "{{ niter userListIter list }}{{ push api.getIterator('userListIter') }}{{ itemsPerPage }}{{ endpush }}{{ endniter }}"});
        assertEquals("333", c.assert.assertRender());
    },

    "test api.getIterator(), pushing iterator to stack and then showing iterator.itemsShowing = 3" : function() {
        var c = mcomponent({
            model : { list : ["mattias", "marcus", "johan"]},
            iter : {
                userListIter : { itemsPerPage : 3 }
            },
            viewHtml : "{{ niter userListIter list }}{{ push api.getIterator('userListIter') }}{{ itemsShowing }}{{ endpush }}{{ endniter }}"});
        assertEquals("333", c.assert.assertRender());
    },

    "test api.getIterator(), pushing iterator to stack and then showing iterator.itemsShowing, with 1 item on page at first, then showing all" : function() {
        var c = mcomponent({
            model : { list : ["mattias", "marcus", "johan"]},
            iter : {
                userListIter : { itemsPerPage : 1 }
            },
            viewHtml : "{{ niter userListIter list }}{{ push api.getIterator('userListIter') }}{{ itemsShowing }}{{ endpush }}{{ endniter }}"});
        assertEquals("1", c.assert.assertRender());
        var i = c.getIterator('userListIter');
        if (i) i.showAllItems();
        assertEquals("333", c.assert.assertRender());
    },

    "test api.getIterator(), pushing iterator to stack and then showing iterator.showingAllItems" : function() {
        var c = mcomponent({
            model : { list : ["mattias", "marcus", "johan"]},
            iter : {
                userListIter : { itemsPerPage : 1 }
            },
            viewHtml : "{{ niter userListIter list }}{{ push api.getIterator('userListIter') }}1{{ showingAllItems }}{{ endpush }}{{ endniter }}"});
        assertEquals("1false", c.assert.assertRender());
        var i = c.getIterator('userListIter');
        if (i) i.showAllItems();
        assertEquals("1true1true1true", c.assert.assertRender());
    },

    "test api.getIterator(), pushing iterator to stack and then showing iterator.itemsTotal = 3" : function() {
        var c = mcomponent({
            model : { list : ["mattias", "marcus", "johan"]},
            iter : {
                userListIter : { itemsPerPage : 1 }
            },
            viewHtml : "{{ niter userListIter list }}{{ push api.getIterator('userListIter') }}1_{{ itemsTotal }}{{ endpush }}{{ endniter }}"});
        assertEquals("1_3", c.assert.assertRender());
    },

    "test api.getIterator(), pushing iterator to stack and then showing iterator.itemsTotal = 4" : function() {
        var c = mcomponent({
            model : { list : ["mattias", "marcus", "johan", "prutt"]},
            iter : {
                userListIter : { itemsPerPage : 1 }
            },
            viewHtml : "{{ niter userListIter list }}{{ push api.getIterator('userListIter') }}1_{{ itemsTotal }}{{ endpush }}{{ endniter }}"});
        assertEquals("itemsTotal = 4", "1_4", c.assert.assertRender());
    },

    "test api.getIterator(), pushing iterator to stack and then showing iterator.itemsTotal = 4 and all items per page" : function() {
        var c = mcomponent({
            model : { list : ["mattias", "marcus", "johan", "prutt"]},
            iter : {
                userListIter : { itemsPerPage : 10 }
            },
            viewHtml : "{{ niter userListIter list }}{{ push api.getIterator('userListIter') }}{{ itemsTotal }}{{ endpush }}{{ endniter }}"});
        assertEquals("4444", c.assert.assertRender());
    },

    "test api.getIterator(), pushing iterator to stack and then showing iterator.itemsShowing = 4 and all items per page" : function() {
        var c = mcomponent({
            model : { list : ["mattias", "marcus", "johan", "prutt"]},
            iter : {
                userListIter : { itemsPerPage : 10 }
            },
            viewHtml : "{{ niter userListIter list }}{{ push api.getIterator('userListIter') }}{{ itemsShowing }}{{ endpush }}{{ endniter }}"});
        assertEquals("4444", c.assert.assertRender());
    },

    "test api.getRootModel() with a string" : function() {
        var c = mcomponent({
            model : "mattias",
            viewHtml : "{{ showjs api.getRootModel() }}"
        });
        assertEquals("mattias", c.assert.assertRender());
    },

    "test api.getRootModel() with an object, and reading a property on it" : function() {
        var c = mcomponent({
            model : { name : "mattias"},
            viewHtml : "{{ showjs api.getRootModel().name }}"
        });
        assertEquals("mattias", c.assert.assertRender());

    }

});

TestCase("Assertion via API object", {

    "test childCount(0) when there are no children" : function() {
        var c = mcomponent({viewHtml : "a{{ js api._assert.childCount(0) }}"});
        assertEquals("a", c.assert.assertRender());
    },

    "test childCount(1) fails to render result when there are no children" : function() {
        var c = mcomponent({viewHtml : "a{{ js api._assert.childCount(1) }}"});
        assertTrue(c.assert.assertRender() !== "a");
    },

    "test childCount(1) fails with exception result when there are no children" : function() {
        var c = mcomponent({throwOnError : true, viewHtml : "a{{ js api._assert.childCount(1) }}"});
        assertException(function() {
            c.assert.assertRender();
        });
    }

});
