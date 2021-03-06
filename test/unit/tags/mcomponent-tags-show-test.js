TestCase("Show tag", {
    "test show tag": function () {

        var c = mcomponent({model: {name: "mattias"}, viewHtml: "{{ show name }}"});
        assertEquals("Should contain 'mattias'.", "mattias", c.assert.assertRender());

        var c = mcomponent({model: {user: {name: "marcus"}}, viewHtml: "{{ show user.name }}"});
        assertEquals("Should contain 'marcus'.", "marcus", c.assert.assertRender());

        var c = mcomponent({model: "marcus", viewHtml: "{{ show }}"});
        assertEquals("Should contain 'marcus'.", "marcus", c.assert.assertRender());

        var c = mcomponent({model: { list: [
            {url: "www.google.com" },
            {url: "www.facebook.com"}
        ]}, viewHtml: "{{ model.list[0].url }}"});
        assertEquals("Should contain 'www.google.com' using lookup with runFunction().", "www.google.com", c.assert.assertRender());

        var c = mcomponent({model: { list: [
            {url: "www.google.com" },
            {url: "www.facebook.com"}
        ]}, viewHtml: "{{ model.list[1].url }}"});
        assertEquals("Should contain 'www.facebook.com' using lookup with runFunction().", "www.facebook.com", c.assert.assertRender());

        var c = mcomponent({model: { list: [
            {url: "www.google.com" },
            {url: "www.facebook.com"}
        ]}, viewHtml: "{{ showjs model.list[0].url }}"});
        assertEquals("Should contain 'www.google.com' using showjs.", "www.google.com", c.assert.assertRender());

    }
});

TestCase("Tag - showif", {

    "test showif doesn't output error message when missing property": function () {
        var c = mcomponent({model: {}, viewHtml: "{{ showif username }}"});
        assertEquals("", c.assert.assertRender());
    },

    "test showif doesn't throw error when missing property": function () {
        assertNoException(function () {
            mcomponent({model: {}, throwOnError: true, viewHtml: "{{ showif username }}"});
        });
    },

    "test showif doesn't output error message when missing model": function () {
        var c = mcomponent({model: undefined, viewHtml: "{{ showif username }}"});
        assertEquals("", c.assert.assertRender());
    },

    "test showif doesn't throw error when missing model": function () {
        assertNoException(function () {
            mcomponent({model: undefined, throwOnError: true, viewHtml: "{{ showif username }}"});
        });
    }

});

TestCase("Property lookup with falsy properties", {

    "test property lookup with 0 result": function () {
        var c = mcomponent({model: { age: 0}, viewHtml: "{{ age }}"});
        assertEquals("0", c.assert.assertRender());
    },

    "test property lookup with 0 result and more than one level": function () {
        var c = mcomponent({model: { age: 0, name: {}}, viewHtml: "{{ push name }}{{ age }}{{ endpush }}"});
        assertEquals("0", c.assert.assertRender());
    },

    "test property lookup with false result": function () {
        var c = mcomponent({model: { age: false}, viewHtml: "{{ age }}"});
        assertEquals("false", c.assert.assertRender());
    },

    "test property lookup with false result and more than one level": function () {
        var c = mcomponent({model: { age: false, name: {}}, viewHtml: "{{ push name }}{{ age }}{{ endpush }}"});
        assertEquals("false", c.assert.assertRender());
    }

});
