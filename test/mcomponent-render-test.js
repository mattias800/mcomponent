TestCase("Render execution", {

    "test push and iter" : function() {
        var c = mcomponent({
            model : {
                photos : {
                    list : ["test1", "test2"],
                    length : 2
                }},
            viewHtml : "ok{{ push photos }}{{ length }}{{ iter photos.list }}{{ show }}{{ enditer }}{{ endpush }}"
        });
        assertEquals("ok2test1test2", c.assert.assertRender());
    },

    "test push, push, iter, show" : function() {
        var c = mcomponent({
            model : {
                data : {
                    photos : {
                        list : ["test1", "test2"],
                        length : 2
                    }
                }
            },
            viewHtml : "ok{{ push data }}{{ push data.photos }}{{ length }}{{ iter photos.list }}{{ show }}{{ enditer }}{{ endpush }}{{ endpush }}"
        });
        assertEquals("ok2test1test2", c.assert.assertRender());
    },

    "test push, push two-level property, iter three-level property, show" : function() {
        var c = mcomponent({
            model : {
                data : {
                    photos : {
                        list : ["test1", "test2"],
                        length : 2
                    }
                }
            },
            viewHtml : "ok{{ push data }}{{ push data.photos }}{{ length }}{{ iter data.photos.list }}{{ show }}{{ enditer }}{{ endpush }}{{ endpush }}"
        });
        assertEquals("ok2test1test2", c.assert.assertRender());
    }

});

TestCase("Render execution for if tags", {

    "test if tag with true condition" : function() {
        var c = mcomponent({viewHtml : "{{ if (true) }}baibai{{ endif }}"});
        assertEquals("baibai", c.assert.assertRender());
    },

    "test nested if tag with true conditions" : function() {
        var c = mcomponent({viewHtml : "{{ if (true) }}1{{ if (true) }}2{{ endif }}{{ endif }}"});
        assertEquals("12", c.assert.assertRender());
    },

    "test nested if tags with outer true, inner false condition" : function() {
        var c = mcomponent({viewHtml : "{{ if (true) }}1{{ if (false) }}2{{ endif }}{{ endif }}"});
        assertEquals("1", c.assert.assertRender());
    },

    "test nested if tags with outer false, inner true condition" : function() {
        var c = mcomponent({viewHtml : "{{ if (false) }}1{{ if (true) }}2{{ endif }}{{ endif }}"});
        assertEquals("", c.assert.assertRender());
    },

    "test nested if tags with outer true, inner true condition" : function() {
        var c = mcomponent({viewHtml : "1{{ if (true) }}2{{ if (true) }}3{{ endif }}4{{ endif }}5"});
        assertEquals("12345", c.assert.assertRender());
    },

    "test nested if tags with outer true, inner false condition, mixed with HTML" : function() {
        var c = mcomponent({viewHtml : "1{{ if (true) }}2{{ if (false) }}3{{ endif }}4{{ endif }}5"});
        assertEquals("1245", c.assert.assertRender());
    },

    "test nested if tags with outer false, inner true condition, mixed with HTML" : function() {
        var c = mcomponent({viewHtml : "1{{ if (false) }}2{{ if (true) }}3{{ endif }}4{{ endif }}5"});
        assertEquals("15", c.assert.assertRender());
    },

    "test nested if tags with outer true, inner this.model lookup true condition, mixed with HTML" : function() {
        var c = mcomponent({model : {name : "mattias"}, viewHtml : "1{{ if (true) }}2{{ if (this.model.name == 'mattias') }}3{{ endif }}4{{ endif }}5"});
        assertEquals("12345", c.assert.assertRender());
    },

    "test nested if tags with outer true, inner this.model lookup false condition, mixed with HTML" : function() {
        var c = mcomponent({model : {name : "mattias"}, viewHtml : "1{{ if (true) }}2{{ if (this.model.name != 'mattias') }}3{{ endif }}4{{ endif }}5"});
        assertEquals("1245", c.assert.assertRender());
    },

    "test nested if tags with outer true, inner model lookup true condition, mixed with HTML" : function() {
        var c = mcomponent({model : {name : "mattias"}, viewHtml : "1{{ if (true) }}2{{ if (model.name == 'mattias') }}3{{ endif }}4{{ endif }}5"});
        assertEquals("12345", c.assert.assertRender());
    },

    "test nested if tags with outer true, inner model lookup false condition, mixed with HTML" : function() {
        var c = mcomponent({model : {name : "mattias"}, viewHtml : "1{{ if (true) }}2{{ if (model.name != 'mattias') }}3{{ endif }}4{{ endif }}5"});
        assertEquals("1245", c.assert.assertRender());
    },

    "test if tag with this.model lookup" : function() {
        var c = mcomponent({model : {name : "mattias"}, viewHtml : "1{{ if (this.model.name == 'mattias') }}2{{ endif }}3"});
        assertEquals("123", c.assert.assertRender());
    },

    "test if tag with model (no this.model) lookup" : function() {
        var c = mcomponent({model : {name : "mattias"}, viewHtml : "1{{ if (model.name == 'mattias') }}2{{ endif }}3"});
        assertEqualsQunit("123", c.assert.assertRender());
    }

});

TestCase("Rendering result from if cases with else and else-if", {

    "test if-else with true condition" : function() {
        var c = mcomponent({viewHtml : "{{ if (true) }}ok{{ else }}fail{{ endif }}"});
        assertEquals(1, c._.getTree().length);
        assertEquals("ok", c.assert.assertRender());
    },

    "test if-elseif-else with false-true condition" : function() {
        var c = mcomponent({viewHtml : "{{ if (false) }}fail1{{ elseif (true) }}ok{{ else }}fail2{{ endif }}"});
        assertEquals(1, c._.getTree().length);
        assertEquals("ok", c.assert.assertRender());
    },

    "test if-else with false condition" : function() {
        var c = mcomponent({viewHtml : "{{ if (false) }}fail{{ else }}ok{{ endif }}"});
        assertEquals(1, c._.getTree().length);
        assertEquals("ok", c.assert.assertRender());
    },

    "test nested if-statements with elseif and else" : function() {
        var c = mcomponent({viewHtml : "{{ if (false) }}fail1{{ elseif (true) }}{{ if (true) }}ok{{ else }}innerfail{{ endif }}{{ else }}fail2{{ endif }}"});
        assertEquals(1, c._.getTree().length);
        assertEquals("ok", c.assert.assertRender());
    },

    "test nested if-statements with elseif and else, another structure" : function() {
        var c = mcomponent({viewHtml : "{{ if (false) }}fail1{{ elseif (true) }}{{ if (false) }}ok{{ else }}innerfail{{ endif }}{{ else }}fail2{{ endif }}"});
        assertEquals(1, c._.getTree().length);
        assertEquals("innerfail", c.assert.assertRender());
    },

    "test if-elseif-else with many elseifs with no true-condition" : function() {
        var c = mcomponent({viewHtml : "{{ if (false) }}fail1{{ elseif (false) }}fail2{{ elseif (false) }}fail3{{ elseif (false) }}fail4{{ elseif (false) }}fail5{{ else }}ok{{ endif }}"});
        assertEquals(1, c._.getTree().length);
        assertEquals("ok", c.assert.assertRender());
    },

    "test if-elseif-else with many elseifs with a true-condition in one elseif" : function() {
        var c = mcomponent({viewHtml : "{{ if (false) }}fail1{{ elseif (false) }}fail2{{ elseif (true) }}ok{{ elseif (false) }}fail4{{ elseif (true) }}fail5{{ else }}ok{{ endif }}"});
        assertEquals(1, c._.getTree().length);
        assertEquals("ok", c.assert.assertRender());
    },

    "test if-elseif-else with many elseifs with many true-conditions" : function() {
        var c = mcomponent({viewHtml : "{{ if (false) }}fail1{{ elseif (false) }}fail2{{ elseif (true) }}ok{{ elseif (true) }}fail4{{ elseif (true) }}fail5{{ else }}ok{{ endif }}"});
        assertEquals(1, c._.getTree().length);
        assertEquals("ok", c.assert.assertRender());
    }

});

