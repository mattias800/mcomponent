var testrunner = require("qunit");

testrunner.run(
    {
        code : "./src/mcomponent.js",
        tests : "./test/mcomponent-test.js"
    }
);

