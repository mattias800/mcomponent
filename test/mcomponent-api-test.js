TestCase("API", {

    "test API" : function() {
        var model = {
            displaySettings : {
                list : {
                    showName : "yes"
                }
            },
            user : {
                name : "mattias"
            }
        };
        var view = "{{ push user }}" +
            "{{ if api.lookup('displaySettings.list.showName') == 'yes' }}" +
            "funkar" +
            "{{ else }}" +
            "funkar inte" +
            "{{ endif }}" +
            "{{ endpush }}";

        var c;

        c = mcomponent({model : model, viewHtml : view});
        assertEqualsQunit(c.assert.assertRender(), "funkar", "api.lookup() should result in 'funkar'.");

        view = "{{ push user }}" +
            "{{ showjs api.lookup('displaySettings.list.showName') }}" +
            "{{ endpush }}";

        c = mcomponent({model : model, viewHtml : view});
        assertEqualsQunit(c.assert.assertRender(), "yes", "api.lookup() should find 'yes'.");

        c = mcomponent({
            model : { list : ["mattias", "marcus", "johan"]},
            iter : {
                userListIter : { itemsPerPage : 1 }
            },
            viewHtml : "{{ niter userListIter list }}{{ push api.getIterator('userListIter') }}{{ itemsPerPage }}{{ endpush }}{{ endniter }}"});
        assertEqualsQunit(c.assert.assertRender(), "1", "Should contain 1 one times.");


        c = mcomponent({
            model : { list : ["mattias", "marcus", "johan"]},
            iter : {
                userListIter : { itemsPerPage : 2 }
            },
            viewHtml : "{{ niter userListIter list }}{{ push api.getIterator('userListIter') }}{{ itemsPerPage }}{{ endpush }}{{ endniter }}"});
        assertEqualsQunit(c.assert.assertRender(), "22", "Should contain 2 two times.");

        c = mcomponent({
            model : { list : ["mattias", "marcus", "johan"]},
            iter : {
                userListIter : { itemsPerPage : 3 }
            },
            viewHtml : "{{ niter userListIter list }}{{ push api.getIterator('userListIter') }}{{ itemsPerPage }}{{ endpush }}{{ endniter }}"});
        assertEqualsQunit(c.assert.assertRender(), "333", "Should contain 3 three times.");

        c = mcomponent({
            model : { list : ["mattias", "marcus", "johan"]},
            iter : {
                userListIter : { itemsPerPage : 3 }
            },
            viewHtml : "{{ niter userListIter list }}{{ push api.getIterator('userListIter') }}{{ itemsShowing }}{{ endpush }}{{ endniter }}"});
        assertEqualsQunit(c.assert.assertRender(), "333", "Should contain 333. Ok!");

        var i;

        c = mcomponent({
            model : { list : ["mattias", "marcus", "johan"]},
            iter : {
                userListIter : { itemsPerPage : 1 }
            },
            viewHtml : "{{ niter userListIter list }}{{ push api.getIterator('userListIter') }}{{ itemsShowing }}{{ endpush }}{{ endniter }}"});
        assertEqualsQunit(c.assert.assertRender(), "1", "Should contain 1 at first.");
        assertObject("Getting iterator should work, after compiling and running the view at least once.", i = c.getIterator('userListIter'));
        if (i) i.showAllItems();
        assertEqualsQunit(c.assert.assertRender(), "333", "Should contain 333.");

        c = mcomponent({
            model : { list : ["mattias", "marcus", "johan"]},
            iter : {
                userListIter : { itemsPerPage : 1 }
            },
            viewHtml : "{{ niter userListIter list }}{{ push api.getIterator('userListIter') }}1{{ showingAllItems }}{{ endpush }}{{ endniter }}"});
        assertEqualsQunit(c.assert.assertRender(), "1false", "Should contain false at first.");
        assertObject("Getting iterator should work, after compiling and running the view at least once.", i = c.getIterator('userListIter'));
        if (i) i.showAllItems();
        assertEqualsQunit(c.assert.assertRender(), "1true1true1true", "Should contain truetruetrue.");

        c = mcomponent({
            model : { list : ["mattias", "marcus", "johan"]},
            iter : {
                userListIter : { itemsPerPage : 1 }
            },
            viewHtml : "{{ niter userListIter list }}{{ push api.getIterator('userListIter') }}1_{{ itemsTotal }}{{ endpush }}{{ endniter }}"});
        assertEqualsQunit(c.assert.assertRender(), "1_3", "itemsTotal = 3");

        c = mcomponent({
            model : { list : ["mattias", "marcus", "johan", "prutt"]},
            iter : {
                userListIter : { itemsPerPage : 1 }
            },
            viewHtml : "{{ niter userListIter list }}{{ push api.getIterator('userListIter') }}1_{{ itemsTotal }}{{ endpush }}{{ endniter }}"});
        assertEqualsQunit(c.assert.assertRender(), "1_4", "itemsTotal = 4");

        c = mcomponent({
            model : { list : ["mattias", "marcus", "johan", "prutt"]},
            iter : {
                userListIter : { itemsPerPage : 10 }
            },
            viewHtml : "{{ niter userListIter list }}{{ push api.getIterator('userListIter') }}{{ itemsTotal }}{{ endpush }}{{ endniter }}"});
        assertEqualsQunit(c.assert.assertRender(), "4444", "itemsTotal = 4 when itemsPerPage is higher than model.length");

        c = mcomponent({
            model : { list : ["mattias", "marcus", "johan", "prutt"]},
            iter : {
                userListIter : { itemsPerPage : 10 }
            },
            viewHtml : "{{ niter userListIter list }}{{ push api.getIterator('userListIter') }}{{ itemsShowing }}{{ endpush }}{{ endniter }}"});
        assertEqualsQunit(c.assert.assertRender(), "4444", "itemsShowing = 4 when itemsPerPage is higher than model.length");

        c = mcomponent({
            model : "mattias",
            viewHtml : "{{ showjs api.getRootModel() }}"
        });
        assertEqualsQunit(c.assert.assertRender(), "mattias", "api.getRootModel() should return root model.");

        c = mcomponent({
            model : { name : "mattias"},
            viewHtml : "{{ showjs api.getRootModel().name }}"
        });
        assertEqualsQunit(c.assert.assertRender(), "mattias", "api.getRootModel() should return root model.");

    }

});
