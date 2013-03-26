TestCase("List parsing returns correct list size using shared component", {

    setUp : function() {
        this.t = mcomponent();
    },

    "test listSize is 0 for no view specified" : function() {
        assertTrue(this.t.assert.assertListSize(0));
    },

    "test listSize is 0 after setting undefined view" : function() {
        this.t.setViewWithHtml();
        assertTrue(this.t.assert.assertListSize(0));
    },

    "test listSize is 0 after setting null view" : function() {
        this.t.setViewWithHtml(null);
        assertTrue(this.t.assert.assertListSize(0));
    },

    "test listSize is 0 after setting empty string view" : function() {
        this.t.setViewWithHtml("");
        assertTrue(this.t.assert.assertListSize(0));
    },

    "test listSize is 1 after setting view with 1 tag only" : function() {
        this.t.setViewWithHtml("{{ name }}");
        assertTrue(this.t.assert.assertListSize(1));
    }

});

TestCase("Setting view creates list with correct number of elements", {

    "test listSize is 1 after setting view in constructor with 1 tag only" : function() {
        var t = mcomponent({viewHtml : "{{ name }}"});
        assertTrue(t.assert.assertListSize(1));
    },

    "test listSize is 3 after setting view in constructor with 1 tag and HTML before and after" : function() {
        var t = mcomponent({viewHtml : "tsa{{ name }}ast"});
        assertTrue(t.assert.assertListSize(3));
    },

    "test listSize is 3 after setting view in constructor with an if case" : function() {
        var t = mcomponent({viewHtml : "{{ if (this.model.name) }}{{ name }}{{ endif }}"});
        assertTrue("List should contain three element after args.viewHtml = '{{ if (this.model.name) }}{{ name }}{{ endif }}'.", t.assert.assertListSize(3));
    },

    "test listSize is 1 after replacing view with view from another component" : function() {
        var t = mcomponent({viewHtml : "{{ if (this.model.name) }}{{ name }}{{ endif }}"});
        var t2 = mcomponent({viewHtml : "{{ firstName }}"});
        t.setViewFromComponent(t2);
        assertTrue(t.assert.assertListSize(1));
        assertTrue(t.assert.assertListItemHasTagName(0, "firstName"));
    },

    "test listSize is 1 after setting view at construction, with view from another component" : function() {
        var t2 = mcomponent({viewHtml : "{{ firstName }}"});
        var t = mcomponent({viewFromComponent : t2});
        assertTrue("List should contain one item.", t.assert.assertListSize(1));
        assertTrue("List should contain tag with name firstName ", t.assert.assertListItemHasTagName(0, "firstName"));
    }

});

