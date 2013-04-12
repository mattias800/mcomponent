TestCase("Format variable name with invalid characters", {

    "test that conditional input is formatted correctly" : function() {
        var c = mcomponent();
        var name = c.assert.assertFormatVariableName("true ? model.firstName : model.lastName");
        assertEquals("truemodel_firstNamemodel_lastName", name);
    },

    "test that simple variable is formatted correctly" : function() {
        var c = mcomponent();
        var name = c.assert.assertFormatVariableName("user");
        assertEquals("user", name);
    },

    "test that two level property name is formatted correctly" : function() {
        var c = mcomponent();
        var name = c.assert.assertFormatVariableName("user.name");
        assertEquals("user_name", name);
    }

});
