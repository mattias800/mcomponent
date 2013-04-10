TestCase("Property lookups", {

    setUp : function() {
        this.c = mcomponent();
    },

    "test lookup() with one level property" : function() {
        assertEquals("butters", this.c.assert.assertLookup("username", {username : "butters"}));
    },

    "test lookup() with two levels property" : function() {
        assertEquals("butters", this.c.assert.assertLookup("user.username", {user : {username : "butters"}}));
    },

    "test lookup() with three levels property where there are two properties available" : function() {
        assertEquals("mattias", this.c.assert.assertLookup("user.name.first", {user : {name : {first : "mattias", last : "andersson"}}}));
    },

    "test lookup() second property with three levels property where there are two properties available" : function() {
        assertEquals("andersson", this.c.assert.assertLookup("user.name.last", {user : {name : {first : "mattias", last : "andersson"}}}));
    },

    "test lookup() that returns model and verify first field" : function() {
        assertTrue(this.c.assert.assertLookup("user.name", {user : {name : {first : "mattias", last : "andersson"}}}).first == "mattias");
    },

    "test lookup() that returns model and verify second field" : function() {
        assertTrue("Should lookup 'user.name' object properly.", this.c.assert.assertLookup("user.name", {user : {name : {first : "mattias", last : "andersson"}}}).last == "andersson");
    },

    "test lookup() property that is undefined should return undefined" : function() {
        assertEquals(undefined, this.c.assert.assertLookup("user.name.first", {user : {name : {first : undefined, last : "andersson"}}}));
    },

    "test lookup() property that goes deeper into the object than is possible, should throw exception" : function() {
        assertException(function() {
            this.c.assert.assertLookup("user.name.problem.test.hej", {user : {name : undefined}})
        });
    },

    "test lookup() property in undefined model should throw exception" : function() {
        assertException(function() {
            this.c.assert.assertLookup("user.name.problem.test.hej", undefined)
        });
    }

});

TestCase("Parent model prefix", {
    data : {

        c1 : mcomponent({
            model : {
                user : {
                    name : "mattias",
                    awesome : true
                },
                location : {
                    country : "Sweden"
                }
            },
            viewHtml : "{{ push user }}{{ name }}{{ location.country }}{{ endpush }}"
        })

    },

    "test Should lookup 'name' and 'location.country' properly since it will iterate over the stack and find location and then country" : function() {
        assertEquals("mattiasSweden", this.data.c1.assert.assertRender());
    },

    "test assertFindParentPrefixCount() counting parentModel-prefixes corrently when no prefixes" : function() {
        assertEquals(0, this.data.c1.assert.assertFindParentPrefixCount("username"));
    },

    "test assertFindParentPrefixCount() counting parentModel-prefixes corrently when one prefix" : function() {
        assertEquals(1, this.data.c1.assert.assertFindParentPrefixCount("../username"));
    },

    "test assertFindParentPrefixCount() counting parentModel-prefixes corrently when two prefixes" : function() {
        assertEquals(2, this.data.c1.assert.assertFindParentPrefixCount("../../username"));
    },

    "test assertFindParentPrefixName() finds property name correctly when there are no prefixes" : function() {
        assertEquals("username", this.data.c1.assert.assertFindParentPrefixName("username"));
    },

    "test assertFindParentPrefixName() finds property name correctly when there is one prefix" : function() {
        assertEquals("username", this.data.c1.assert.assertFindParentPrefixName("../username"));
    },


    "test assertFindParentPrefixName() finds property name correctly when there are two prefixes" : function() {
        assertEquals("username", this.data.c1.assert.assertFindParentPrefixName("../username"));
    }

});

