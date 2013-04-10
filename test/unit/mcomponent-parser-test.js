TestCase("Parsing tag parameters", {

    "test getTagParameters() with if tag" : function() {
        var c = mcomponent();
        assertEquals("Should be 'hej'", "hej", c.assert.assertGetTagParameters("if hej"));
    }

});

TestCase("Parsing niter tag parameters", {

    setUp : function() {
        this.c = mcomponent();
    },

    "test getNiterParametersFromTagParameter with empty parameter" : function() {
        assertObject(this.p = this.c._.getNiterParametersFromTagParameter(""));
        assertEquals(this.p.iterName, undefined);
        assertEquals(this.p.variableName, undefined);
    },

    "test getNiterParametersFromTagParameter with property only" : function() {
        assertObject("Testing 'name'.", this.p = this.c._.getNiterParametersFromTagParameter("name"));
        assertEquals(this.p.iterName, "name");
        assertEquals(this.p.variableName, undefined);
    },

    "test getNiterParametersFromTagParameter with niter name and property" : function() {
        assertObject("Testing 'name userlist'.", this.p = this.c._.getNiterParametersFromTagParameter("name userlist"));
        assertEquals(this.p.iterName, "name");
        assertEquals(this.p.variableName, "userlist");
    },

    "test getNiterParametersFromTagParameter with niter name with spaces and property" : function() {
        assertObject(this.p = this.c._.getNiterParametersFromTagParameter("name userlist huh"));
        assertEquals(this.p.iterName, "name");
        assertEquals(this.p.variableName, "userlist huh");
    },

    "test getNiterParametersFromTagParameter with niter name with function and property" : function() {
        assertObject(this.p = this.c._.getNiterParametersFromTagParameter("name getList()"));
        assertEquals(this.p.iterName, "name");
        assertEquals(this.p.variableName, "getList()");
    },

    "test getNiterParametersFromTagParameter with niter name with function with argument and property" : function() {
        assertObject(this.p = this.c._.getNiterParametersFromTagParameter("name getList('all users')"));
        assertEquals(this.p.iterName, "name");
        assertEquals(this.p.variableName, "getList('all users')");
    }

});

