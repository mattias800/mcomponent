QUnit.module("DOM dependent tests");

test("Construction", function() {

    ok($(document.createElement("script")).mcomponent(), "Should work properly with simple construction.");
    raises(function() {
        $(document.createElement("div")).mcomponent()
    }, "Should not allow div as source for view.");

    var e;
    ok(e = $(document.createElement("script")), "Creating tag should work.");
    e.text = "{{ name }}";
    ok($(e).mcomponent(), "Should not cause problems with simple view in the script.");

    ok($().mcomponent(), "Should allow no source.");

    ok($().mcomponent({viewHtml : "{{ name }}"}), "Should allow no source, but view in args.");


});

test("Building list", function() {

    var t, e;

    var e = document.createElement("script");
    e.text = "{{ name }}";

    ok(t = $(e).mcomponent(), "Creating component.");
    ok(t.assert.assertListSize(1), "One tag should result in one list item.");
    ok(t.assert.assertListItemHasTagName(0, "name"), "Tag name should be 'name'.");

    e = document.createElement("script");
    e.text = "abc";
    ok(t = $(e).mcomponent());

    ok(t.assert.assertListSize(1), "One tag should result in one list item.");
    ok(t.assert.assertListItemHasHtml(0, "abc"), "HTML tag should be 'abc'.");

    e = document.createElement("script");
    e.text = "hej{{ name }}";
    ok(t = $(e).mcomponent());

    ok(t.assert.assertListSize(2), "One tag prefixed with HTML should result in two list items.");
    ok(t.assert.assertListItemHasHtml(0, "hej"), "Tag name should be 'hej'.");
    ok(t.assert.assertListItemHasTagName(1, "name"), "Tag name should be 'name'.");

    e = document.createElement("script");
    e.text = "heja{{ name }}hejaa";
    ok(t = $(e).mcomponent());

    ok(t.assert.assertListSize(3), "One tag prefixed and postfixed with HTML should result in three list items.");
    ok(t.assert.assertListItemHasHtml(0, "heja"), "Tag name should be 'heja'.");
    ok(t.assert.assertListItemHasTagName(1, "name"), "Tag name should be 'name'.");
    ok(t.assert.assertListItemHasHtml(2, "hejaa"), "Tag name should be 'hejaa'.");

    e = document.createElement("script");
    e.text = "{{ username }}hejsan";
    ok(t = $(e).mcomponent());

    ok(t.assert.assertListSize(2), "One tag postfixed with HTML should result in two list items.");
    ok(t.assert.assertListItemHasTagName(0, "username"), "Tag name should be 'username'.");
    ok(t.assert.assertListItemHasHtml(1, "hejsan"), "Tag name should be 'hejsan'.");

});

test("Render and result", function() {

    var c;
    var r;

    var placeHolder = document.createElement("div");

    ok(c = $().mcomponent({viewHtml : "heyhey"}), "Construction OK!");
    ok(r = c.render());
    equal(r.html, "heyhey", "Returned HTML should be correct.");
    equal(c.getResult().html, "heyhey", "getResult() HTML should be correct as well.");

    ok(c = $().mcomponent({placeHolder : placeHolder, viewHtml : "yoyoyo"}), "Construction OK!");
    ok(r = c.render());
    equal(r.html, "yoyoyo", "Returned HTML should be correct.");
    equal(c.getResult().html, "yoyoyo", "getResult() HTML should be correct as well.");
    equal(placeHolder.innerHTML.toLowerCase(), "<div>yoyoyo</div>", "Place holder inner HTML should be correct too.");

});

