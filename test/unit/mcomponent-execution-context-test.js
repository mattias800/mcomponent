TestCase("Execution context", {

    "test execution stack is empty after construction" : function() {
        var c = mcomponent({viewHtml : "{{ name }}"});
        assertEquals("No model, execution stack should start empty.", 0, c._.getExecutionStackSize());
    },

    "test pushModel() increases size of execution stack" : function() {
        var c = mcomponent({viewHtml : "{{ name }}"});
        assertEquals("No model, execution stack should start empty.", 0, c._.getExecutionStackSize());
        assertTrue(c._.pushModel({test : "test"}));
        assertEquals("Pushed model, execution stack should now have one element.", 1, c._.getExecutionStackSize());
    },

    "test execution stack size is 1 when adding model in construction" : function() {
        var c = mcomponent({model : {name : "mattias"}, viewHtml : "{{ name }}"});
        assertEquals("Model should be pushed to execution stack.", 1, c._.getExecutionStackSize());
    }

});

