var testrunner = require("qunit");

testrunner.setup({
    log : {
        assertions : false,
        testing : false,
        summary : true
    }
});

testrunner.run(
    {
        code : "./src/mcomponent.js",
        tests : "./test/mcomponent-test.js"
    }
);

