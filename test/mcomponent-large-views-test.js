TestCase("Large views", {

    "test large view and model" : function() {
        var view = "{{ if (this.model) }}yay" +
            "{{ if (this.model.users) }}" +
            "{{ niter users users }}" +
            "Name:{{ name }}" +
            "Male:{{ if (this.model.isMale) }}Yes{{ else }}No{{ endif }}" +
            "Age:{{ age }}" +
            "{{ endniter }}" +
            "{{ endif }}" +
            "{{ endif }}";

        var m = {
            users : [
                {name : "Mattias", isMale : true, age : 31},
                {name : "Must", isMale : true, age : 28},
                {name : "Jenny", isMale : false, age : 27}
            ],
            location : {
                city : {name : "G�teborg"},
                country : {name : "Sweden"}
            }
        };

        c = mcomponent({viewHtml : view, model : m, iter : {users : {}}});
        assertEquals(1, c._.getTree().length);
        assertEquals("yayName:MattiasMale:YesAge:31Name:MustMale:YesAge:28Name:JennyMale:NoAge:27", c.assert.assertRender());
    },

    "test another large view and model" : function() {
        var m = {
            users : [
                {name : "Mattias", isMale : true, age : 31},
                {name : "Must", isMale : true, age : 28},
                {name : "Must", isMale : true, age : 28},
                {name : "Must", isMale : true, age : 28},
                {name : "Must", isMale : true, age : 28},
                {name : "Must", isMale : true, age : 28},
                {name : "Must", isMale : true, age : 28},
                {name : "Must", isMale : true, age : 28},
                {name : "Must", isMale : true, age : 28},
                {name : "Must", isMale : true, age : 28},
                {name : "Must", isMale : true, age : 28},
                {name : "Must", isMale : true, age : 28},
                {name : "Must", isMale : true, age : 28},
                {name : "Must", isMale : true, age : 28},
                {name : "Must", isMale : true, age : 28},
                {name : "Jenny", isMale : false, age : 27}
            ],
            location : {
                city : {name : "G�teborg"},
                country : {name : "Sweden"}
            }
        };

        var view = "  {{ if (this.model) }} yay we have a model!\n" +
            "{{ if (this.model.users) }}\n" +
            "{{ niter users users }}\n" +
            "Name:{{ name }}<br/>\n" +
            "Male:{{ if (this.model.isMale) }}Yes{{ else }}No{{ endif }}<br/>\n" +
            "Age:{{ age }}\n" +
            "{{ endniter }}\n" +
            "{{ endif }}\n" +
            "{{ endif }}\n";

        var c = mcomponent({viewHtml : view, model : m, iter : {users : {}}});
        assertEquals("   yay we have a model!" + "\n" +
            "" + "\n" +
            "" + "\n" +
            "Name:Mattias<br/>" + "\n" +
            "Male:Yes<br/>" + "\n" +
            "Age:31" + "\n" +
            "" + "\n" +
            "Name:Must<br/>" + "\n" +
            "Male:Yes<br/>" + "\n" +
            "Age:28" + "\n" +
            "" + "\n" +
            "Name:Must<br/>" + "\n" +
            "Male:Yes<br/>" + "\n" +
            "Age:28" + "\n" +
            "" + "\n" +
            "Name:Must<br/>" + "\n" +
            "Male:Yes<br/>" + "\n" +
            "Age:28" + "\n" +
            "" + "\n" +
            "Name:Must<br/>" + "\n" +
            "Male:Yes<br/>" + "\n" +
            "Age:28" + "\n" +
            "" + "\n" +
            "Name:Must<br/>" + "\n" +
            "Male:Yes<br/>" + "\n" +
            "Age:28" + "\n" +
            "" + "\n" +
            "Name:Must<br/>" + "\n" +
            "Male:Yes<br/>" + "\n" +
            "Age:28" + "\n" +
            "" + "\n" +
            "Name:Must<br/>" + "\n" +
            "Male:Yes<br/>" + "\n" +
            "Age:28" + "\n" +
            "" + "\n" +
            "Name:Must<br/>" + "\n" +
            "Male:Yes<br/>" + "\n" +
            "Age:28" + "\n" +
            "" + "\n" +
            "Name:Must<br/>" + "\n" +
            "Male:Yes<br/>" + "\n" +
            "Age:28" + "\n" +
            "" + "\n" +
            "" + "\n" +
            "" + "\n" +
            "",
            c.assert.assertRender());
    },
    "test another large view come on!" : function() {
        var view = "  {{ if (this.model) }} yay we have a model!\n" +
            "\n" +
            "{{ if (this.model.location) }}\n" +
            "{{ push location }}\n" +
            "\n" +
            "{{ push city }}\n" +
            "{{ if (this.model.name) }}\n" +
            "{{ name }}\n" +
            "{{ else }}\n" +
            "City has no name\n" +
            "{{ endif }}\n" +
            "{{ endpush }}\n" +
            "\n" +
            "{{ endpush }}\n" +
            "\n" +
            "{{ else }}\n" +
            "No location\n" +
            "{{ endif }}\n" +
            "\n" +
            "{{ endif }}\n";

        var m = {
            users : [
                {name : "Mattias", isMale : true, age : 31},
                {name : "Must", isMale : true, age : 28},
                {name : "Must", isMale : true, age : 28},
                {name : "Must", isMale : true, age : 28},
                {name : "Must", isMale : true, age : 28},
                {name : "Must", isMale : true, age : 28},
                {name : "Must", isMale : true, age : 28},
                {name : "Must", isMale : true, age : 28},
                {name : "Must", isMale : true, age : 28},
                {name : "Must", isMale : true, age : 28},
                {name : "Must", isMale : true, age : 28},
                {name : "Must", isMale : true, age : 28},
                {name : "Must", isMale : true, age : 28},
                {name : "Must", isMale : true, age : 28},
                {name : "Must", isMale : true, age : 28},
                {name : "Jenny", isMale : false, age : 27}
            ],
            location : {
                city : {name : "G�teborg"},
                country : {name : "Sweden"}
            }
        };

        var c = mcomponent({viewHtml : view, model : m, iter : {users : {}}});
        assertStringQunit(result = c.assert.assertRender(), "location and city only");

        view = "  {{ if (this.model) }} yay we have a model!\n" +
            "\n" +
            "{{ if (this.model.location) }}\n" +
            "{{ push location }}\n" +
            "\n" +
            "{{ push country }}\n" +
            "{{ if (this.model.name) }}\n" +
            "{{ name }}\n" +
            "{{ else }}\n" +
            "Country has no name\n" +
            "{{ endif }}\n" +
            "{{ endpush }}\n" +
            "\n" +
            "{{ endpush }}\n" +
            "\n" +
            "{{ else }}\n" +
            "No location\n" +
            "{{ endif }}\n" +
            "\n" +
            "{{ endif }}\n";
// Construction location and country only!
        c = mcomponent({viewHtml : view, model : m, iter : {users : {}}});
        assertStringQunit(result = c.assert.assertRender(), "location and country only!");

        view = "{{ if (this.model) }} yay we have a model!\n" +

            "    {{ if (this.model.location) }}\n" +

            "        {{ push location }}\n" +
            "        {{ endpush }}\n" +

            "    {{ else }}\n" +
            "    {{ endif }}\n" +

            "{{ endif }}\n";

// Construction niter with location and both city and country without output and if cases and push!
        c = mcomponent({viewHtml : view, model : m, iter : {users : {}}});
        assertString("niter with location and both city and country without output and if cases and push!", result = c.assert.assertRender());

        view = "{{ if (this.model) }} yay we have a model!\n" +

            "    {{ if (this.model.location) }}\n" +

            "        {{ push location }}\n" +
            "            {{ push city }}\n" +
            "            {{ endpush }}\n" +
            "        {{ endpush }}\n" +

            "    {{ else }}\n" +
            "    {{ endif }}\n" +

            "{{ endif }}\n";

        // "Construction niter with location and both city and country without output and if cases and push country!"
        c = mcomponent({viewHtml : view, model : m, iter : {users : {}}});
        assertString("niter with location and both city and country without output and if cases and push country!", result = c.assert.assertRender());

        view = "{{ if (this.model) }} yay we have a model!\n" +

            "    {{ if (this.model.location) }}\n" +

            "        {{ push location }}\n" +
            "            {{ push country }}\n" +
            "            {{ endpush }}\n" +
            "        {{ endpush }}\n" +

            "    {{ else }}\n" +
            "    {{ endif }}\n" +

            "{{ endif }}\n";

        // "Construction niter with location and both city and country without output and if cases and push city!"
        c = mcomponent({viewHtml : view, model : m, iter : {users : {}}});
        assertStringQunit(result = c.assert.assertRender(), "niter with location and both city and country without output and if cases and push city!");

        view = "{{ if (this.model) }} yay we have a model!\n" +

            "    {{ if (this.model.location) }}\n" +

            "        {{ push location }}\n" +
            "            {{ push city }}\n" +
            "            {{ endpush }}\n" +

            "            {{ push country }}\n" +
            "            {{ endpush }}\n" +
            "        {{ endpush }}\n" +

            "    {{ else }}\n" +
            "    {{ endif }}\n" +

            "{{ endif }}\n";


        // "Construction niter with location and both city and country without output and if cases!"
        c = mcomponent({viewHtml : view, model : m, iter : {users : {}}});
        assertStringQunit(result = c.assert.assertRender(), "niter with location and both city and country without output and if cases!");

        view = "{{ if (this.model) }} yay we have a model!\n" +

            "    {{ if (this.model.location) }}\n" +

            "        {{ push location }}\n" +

            "            {{ push city }}\n" +
            "                {{ if (this.model.name) }}\n" +
            "                {{ else }}\n" +
            "                {{ endif }}\n" +
            "            {{ endpush }}\n" +

            "            {{ push country }}\n" +
            "                {{ if (this.model.name) }}\n" +
            "                {{ else }}\n" +
            "                {{ endif }}\n" +
            "            {{ endpush }}\n" +

            "        {{ endpush }}\n" +

            "    {{ else }}\n" +
            "    {{ endif }}\n" +

            "{{ endif }}\n";


        // "Construction niter with location and both city and country without output!"
        c = mcomponent({viewHtml : view, model : m, iter : {users : {}}});
        assertStringQunit(result = c.assert.assertRender(), "niter with location and both city and country without output!");

        view = "{{ if (this.model) }} yay we have a model!\n" +
            "    \n" +
            "    {{ if (this.model.location) }}\n" +

            "        {{ push location }}\n" +

            "            {{ push city }}\n" +
            "                {{ if (this.model.name) }}\n" +
            "                    {{ name }}\n" +
            "                {{ else }}\n" +
            "                    City has no name\n" +
            "                {{ endif }}\n" +
            "            {{ endpush }}\n" +

            "            {{ push country }}\n" +
            "                {{ if (this.model.name) }}\n" +
            "                    {{ name }}\n" +
            "                {{ else }}\n" +
            "                    Country has no name\n" +
            "                {{ endif }}\n" +
            "            {{ endpush }}\n" +

            "        {{ endpush }}\n" +

            "    {{ else }}\n" +
            "        No location\n" +
            "    {{ endif }}\n" +

            "{{ endif }}\n";


        // "Construction niter with location and both city and country!"
        c = mcomponent({viewHtml : view, model : m, iter : {users : {}}});
        assertStringQunit(result = c.assert.assertRender(), "niter with location and both city and country!");

        view = "  {{ if (this.model) }} yay we have a model!\n" +
            "{{ if (this.model.users) }}\n" +
            "{{ niter users users }}\n" +
            "Name:{{ name }}<br/>\n" +
            "Male:{{ if (this.model.isMale) }}Yes{{ else }}No{{ endif }}<br/>\n" +
            "Age:{{ age }}\n" +
            "{{ endniter }}\n" +
            "\n" +
            "{{ if (this.model.location) }}\n" +
            "{{ push location }}\n" +
            "\n" +
            "{{ push city }}\n" +
            "{{ if (this.model.name) }}\n" +
            "{{ name }}\n" +
            "{{ else }}\n" +
            "City has no name\n" +
            "{{ endif }}\n" +
            "{{ endpush }}\n" +
            "\n" +
            "{{ push country }}\n" +
            "{{ if (this.model.name) }}\n" +
            "{{ name }}\n" +
            "{{ else }}\n" +
            "Country has no name\n" +
            "{{ endif }}\n" +
            "{{ endpush }}\n" +
            "\n" +
            "{{ endpush }}\n" +
            "\n" +
            "{{ else }}\n" +
            "No location\n" +
            "{{ endif }}\n" +
            "\n" +
            "{{ endif }}\n" +
            "{{ endif }}\n";

        // "Construction full view!"
        c = mcomponent({viewHtml : view, model : m, iter : {users : {}}});
        assertStringQunit(result = c.assert.assertRender(), "full view!");

    }

});
