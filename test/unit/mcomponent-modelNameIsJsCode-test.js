TestCase("modelNameIsJsCode", {

    "test with conditional expression" : function () {
        var c = mcomponent();
        assertTrue(c.assert.assertModelNameIsJsCode("true ? true : false"));
    },

    "test with function call" : function () {
        var c = mcomponent();
        assertTrue(c.assert.assertModelNameIsJsCode("test()"));
    }

});