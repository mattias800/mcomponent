TestCase("Iter tag", {

    "test iter tag with simple list and no output" : function() {
        var c = mcomponent({model : {
            list : ["mattias", "marcus", "johan"]
        }, viewHtml : "{{ iter list }}{{ enditer }}"});
        assertEquals("", c.assert.assertRender());
    },

    "test iter tag with one element list and output" : function() {
        var c = mcomponent({
            model : {
                list : ["mattias"]
            }, viewHtml : "{{ iter list }}{{ show }}{{ enditer }}"});
        assertEquals("mattias", c.assert.assertRender());
    },

    "test iter tag with three element list and output" : function() {
        var c = mcomponent({
            model : {
                list : ["mattias", "marcus", "johan"]
            }, viewHtml : "{{ iter list }}{{ show }}{{ enditer }}"});
        assertEquals("mattiasmarcusjohan", c.assert.assertRender());
    },

    "test iter tag with empty list and output" : function() {
        var c = mcomponent({
            model : {
                list : []
            }, viewHtml : "{{ iter list }}{{ show }}{{ enditer }}"});
        assertEquals("", c.assert.assertRender());
    },

    "test iter tag with three element list and context index output" : function() {
        var c = mcomponent({
            model : {
                list : ["mattias", "marcus", "johan"]
            }, viewHtml : "{{ iter list }}{{ context index }}{{ enditer }}"});
        assertEquals("012", c.assert.assertRender());
    },

    "test iter tag with three element list and output context index using show tag" : function() {
        var c = mcomponent({
            model : {
                list : ["mattias", "marcus", "johan"]
            }, viewHtml : "{{ iter list }}{{ show context.index }}{{ enditer }}"});
        assertEquals("012", c.assert.assertRender());
    },

    "test iter tag with three element list and conditional output of contexts index" : function() {
        var c = mcomponent({
            model : {
                list : ["mattias", "marcus", "johan"]
            }, viewHtml : "{{ iter list }}{{ if (context.index == 1) }}{{ show context.index }}{{ endif }}{{ enditer }}"});
        assertEquals("1", c.assert.assertRender());
    },

    "test iter tag with three element list and context.index output" : function() {
        var c = mcomponent({
            model : {
                list : ["mattias", "marcus", "johan"]
            }, viewHtml : "{{ iter list }}{{ context.index }}{{ enditer }}"});
        assertEquals("012", c.assert.assertRender());
    },

    "test iter tag with context size output" : function() {
        var c = mcomponent({
            model : {
                list : ["mattias", "marcus", "johan"]
            }, viewHtml : "{{ iter list }}{{ context size }}{{ enditer }}"});
        assertEquals("333", c.assert.assertRender());
    },

    "test iter tag with context.size output using show tag" : function() {
        var c = mcomponent({
            model : {
                list : ["mattias", "marcus", "johan"]
            }, viewHtml : "{{ iter list }}{{ show context.size }}{{ enditer }}"});
        assertEquals("333", c.assert.assertRender());
    },

    "test iter tag with context.size output" : function() {
        var c = mcomponent({
            model : {
                list : ["mattias", "marcus", "johan"]
            }, viewHtml : "{{ iter list }}{{ context.size }}{{ enditer }}"});
        assertEquals("333", c.assert.assertRender());
    },

    "test iter tag with context parity output" : function() {
        var c = mcomponent({
            model : {
                list : ["mattias", "marcus", "johan"]
            }, viewHtml : "{{ iter list }}{{ context parity }}{{ enditer }}"});
        assertEquals("evenoddeven", c.assert.assertRender());
    },

    "test iter tag with context parity output using show tag" : function() {
        var c = mcomponent({
            model : {
                list : ["mattias", "marcus", "johan"]
            }, viewHtml : "{{ iter list }}{{ context.indexOne }}{{ enditer }}"});
        assertEquals("123", c.assert.assertRender());
    },

    "test iter tag with model that doesn't exist throws error when rendering" : function() {
        var c = mcomponent({
            model : {
                list : ["mattias", "marcus", "johan"]
            },
            viewHtml : "{{ iter listaxe }}{{ enditer }}",
            throwOnError : true
        });
        assertException(function() {
            c.assert.assertRender();
        });
    },

    "test iter tag with model that is a number throws error when rendering" : function() {
        var c = mcomponent({
            model : {
                test : 123
            }, viewHtml : "{{ iter test }}{{ enditer }}",
            throwOnError : true
        });
        assertException(function() {
            c.assert.assertRender();
        });
    },

    "test iter tag with model that is an object throws error when rendering" : function() {
        var c = mcomponent({
            model : {
                test : {age : 80}
            }, viewHtml : "{{ iter test }}{{ enditer }}",
            throwOnError : true
        });
        assertException(function() {
            c.assert.assertRender();
        });
    },

    "test iter tag with model that is a string throws error when rendering" : function() {
        var c = mcomponent({
            model : {
                test : "hejhej"
            }, viewHtml : "{{ iter test }}{{ enditer }}",
            throwOnError : true
        });
        assertException(function() {
            c.assert.assertRender();
        });

    }

});

TestCase("Niter tag - using show more", {

    "test niter tag, using show more" : function() {

        var c;
        var i;
        var a = 3;
        var b = 1;

        assertExceptionQunit(function() {
            c = mcomponent({
                model : {
                    list : ["mattias", "marcus", "johan"]
                },
                viewHtml : "{{ niter userListIter list }}{{ endniter }}",
                throwOnError : true
            });
        }, "Construction should fail since there is no iterator config!");

        assertExceptionQunit(function() {
            c.assert.assertRender();
        }, "Should throw error since we haven't declared an iterator configuration.");

        c = mcomponent({
            model : {
                list : ["mattias", "marcus", "johan"]
            },
            iter : {
                userListIter : { itemsPerPage : 1 }
            },
            viewHtml : "{{ niter userListIter list }}{{ endniter }}"});
        assertEqualsQunit(c.assert.assertRender(), "", "Should contain nothing.");

        c = mcomponent({
            model : {list : ["mattias", "marcus", "johan"]},
            iter : {
                userListIterYeah : {
                    itemsPerPage : 1,
                    whenAllItemsAreShowing : function() {
                        a = 5;
                    },
                    whenNotAllItemsAreShowing : function() {
                        b = 2;
                    }
                }
            },
            viewHtml : "{{ niter userListIterYeah list }}{{ show }}{{ endniter }}"});
        assertEqualsQunit(b, 1, "b should be 1 first.");
        assertEqualsQunit(c.assert.assertRender(), "mattias", "Should first element only.");
        assertEqualsQunit(b, 2, "b should be 2 after whenNotAllItemsAreShowing has been run.");
        assertObject("Should be able to get iterator context.", i = c.getIterator("userListIterYeah"));
        i.showMoreItems();
        assertEqualsQunit(c.assert.assertRender(), "mattiasmarcus", "Should contain one more element.");
        assertEqualsQunit(a, 3, "a should be 3 first.");
        i.showMoreItems();
        assertEqualsQunit(c.assert.assertRender(), "mattiasmarcusjohan", "Should contain all three elements.");
        assertEqualsQunit(a, 5, "a should now be 5 since callback changed the value.");
        i.showMoreItems();
        assertEqualsQunit(c.assert.assertRender(), "mattiasmarcusjohan", "Should contain all three elements again.");

        a = 3;

        c = mcomponent({
            model : {list : ["mattias", "marcus", "johan"]},
            iter : {
                userListIterYeah : {
                    itemsPerPage : 1,
                    whenAllItemsAreShowing : function() {
                        a = 5;
                    }
                }
            },
            viewHtml : "{{ niter userListIterYeah list }}{{ show }}{{ endniter }}"});
        assertEqualsQunit(c.assert.assertRender(), "mattias", "Should first element only.");
        assertObject("Should be able to get iterator context.", i = c.getIterator("userListIterYeah"));
        assertEqualsQunit(c.getIterator("userListIterYeahASFSA"), undefined, "Trying to get iterator context that doesn't exist should return undefined.");
        assertEqualsQunit(a, 3, "a should be 3 first.");
        i.showAllItems();
        assertEqualsQunit(c.assert.assertRender(), "mattiasmarcusjohan", "Should show all elements.");
        assertEqualsQunit(a, 5, "a should now be 5 since callback changed the value.");

        // TODO: Add variable that flips back and fourth between showing not all/all.
    }

});


TestCase("Niter tag - using pages", {
    "test niter tag, using pages" : function() {

        var c;
        var i;

        c = mcomponent({
            model : {
                list : []
            },
            iter : {
                userListIter : {
                    itemsPerPage : 2,
                    usePages : true
                }
            },
            viewHtml : "{{ niter userListIter list }}{{ show }}{{ endniter }}"});
        assertEqualsQunit(c.assert.assertRender(), "", "Should be empty.");
        assertObject(i = c.getIterator("userListIter"));
        assertEqualsQunit(i.getPageCount(), 0);
        assertEqualsQunit(i.getCurrentPage(), 0);
        i.showNextPage();
        assertEqualsQunit(c.assert.assertRender(), "", "Should still be empty.");
        assertEqualsQunit(i.getCurrentPage(), 0);
        i.showNextPage();
        assertEqualsQunit(c.assert.assertRender(), "", "Should still be empty.");
        assertEqualsQunit(i.getCurrentPage(), 0);
        i.showPrevPage();
        assertEqualsQunit(c.assert.assertRender(), "", "Should still be empty.");
        assertEqualsQunit(i.getCurrentPage(), 0);
        i.showPrevPage();
        assertEqualsQunit(c.assert.assertRender(), "", "Should still be empty.");
        assertEqualsQunit(i.getCurrentPage(), 0);
        i.showPrevPage();
        assertEqualsQunit(c.assert.assertRender(), "", "Should still be empty.");
        assertEqualsQunit(i.getCurrentPage(), 0);

        c = mcomponent({
            model : {
                list : ["mattias", "marcus", "johan", "butters", "stan"]
            },
            iter : {
                userListIter : {
                    itemsPerPage : 2,
                    usePages : true
                }
            },
            viewHtml : "{{ niter userListIter list }}{{ show }}{{ endniter }}"});
        assertEqualsQunit(c.assert.assertRender(), "mattiasmarcus", "Should show first two element.");
        assertObject(i = c.getIterator("userListIter"));
        assertEqualsQunit(i.getPageCount(), 3);
        i.showPrevPage();
        assertEqualsQunit(c.assert.assertRender(), "mattiasmarcus", "Should show first two again since it is first page.");
        i.showNextPage();
        assertEqualsQunit(c.assert.assertRender(), "johanbutters", "Should show second two elements.");
        i.showNextPage();
        assertEqualsQunit(c.assert.assertRender(), "stan", "Should show second two elements.");
        i.showNextPage();
        assertEqualsQunit(c.assert.assertRender(), "stan", "Next page should be same, since it is last page.");
        i.showPrevPage();
        assertEqualsQunit(c.assert.assertRender(), "johanbutters", "And now we go back to previous page.");

        c = mcomponent({
            model : {
                list : ["mattias", "marcus", "johan", "butters", "stan"]
            },
            iter : {
                userListIter : {
                    itemsPerPage : 3,
                    usePages : true
                }
            },
            viewHtml : "{{ niter userListIter list }}{{ show }}{{ endniter }}"});
        assertEqualsQunit(c.assert.assertRender(), "mattiasmarcusjohan", "Should first element only.");
        assertObject(i = c.getIterator("userListIter"));
        assertEqualsQunit(i.getPageCount(), 2);
        i.showPrevPage();
        assertEqualsQunit(c.assert.assertRender(), "mattiasmarcusjohan", "Should show first two again since it is first page.");
        i.showNextPage();
        assertEqualsQunit(c.assert.assertRender(), "buttersstan", "Should show page 2.");
        i.showNextPage();
        assertEqualsQunit(c.assert.assertRender(), "buttersstan", "Same again.");
        i.showPrevPage();
        assertEqualsQunit(c.assert.assertRender(), "mattiasmarcusjohan", "And now we go back to previous page.");

        c = mcomponent({
            model : {
                list : ["mattias", "marcus", "johan", "butters", "stan"]
            },
            iter : {
                userListIter : {
                    itemsPerPage : 1,
                    usePages : true
                }
            },
            viewHtml : "{{ niter userListIter list }}{{ show }}{{ endniter }}"});
        assertEqualsQunit(c.assert.assertRender(), "mattias", "Should first element only.");
        assertObject(i = c.getIterator("userListIter"));
        assertEqualsQunit(i.getPageCount(), 5);
        i.showPrevPage();
        assertEqualsQunit(c.assert.assertRender(), "mattias");
        i.showNextPage();
        assertEqualsQunit(c.assert.assertRender(), "marcus");
        i.showNextPage();
        assertEqualsQunit(c.assert.assertRender(), "johan");
        i.showNextPage();
        assertEqualsQunit(c.assert.assertRender(), "butters");
        i.showNextPage();
        assertEqualsQunit(c.assert.assertRender(), "stan");
        i.showNextPage();
        assertEqualsQunit(c.assert.assertRender(), "stan", "Next page should be same, since it is last page.");
        i.showPrevPage();
        assertEqualsQunit(c.assert.assertRender(), "butters", "And now we go back to previous page.");

        c = mcomponent({
            model : {
                list : ["mattias", "marcus", "johan", "butters", "stan"]
            },
            iter : {
                userListIter : {
                    itemsPerPage : 10,
                    usePages : true
                }
            },
            viewHtml : "{{ niter userListIter list }}{{ show }}{{ endniter }}"});
        assertEqualsQunit(c.assert.assertRender(), "mattiasmarcusjohanbuttersstan", "Should first element only.");
        assertObject(i = c.getIterator("userListIter"));
        assertEqualsQunit(i.getPageCount(), 1);
        i.showPrevPage();
        assertEqualsQunit(c.assert.assertRender(), "mattiasmarcusjohanbuttersstan");
        i.showNextPage();
        assertEqualsQunit(c.assert.assertRender(), "mattiasmarcusjohanbuttersstan");
        i.showNextPage();
        assertEqualsQunit(c.assert.assertRender(), "mattiasmarcusjohanbuttersstan");
        i.showNextPage();
        assertEqualsQunit(c.assert.assertRender(), "mattiasmarcusjohanbuttersstan");
        i.showNextPage();
        assertEqualsQunit(c.assert.assertRender(), "mattiasmarcusjohanbuttersstan");
        i.showPrevPage();
        assertEqualsQunit(c.assert.assertRender(), "mattiasmarcusjohanbuttersstan", "And now we go back to previous page.");

        c = mcomponent({
            model : {
                list : []
            },
            iter : {
                userListIter : {
                    itemsPerPage : 1,
                    usePages : true
                }
            },
            viewHtml : "{{ niter userListIter list }}{{ show }}{{ endniter }}"});
        assertEqualsQunit(c.assert.assertRender(), "", "Should first element only.");
        assertObject(i = c.getIterator("userListIter"));
        assertEqualsQunit(i.getPageCount(), 0);
        i.showPrevPage();
        assertEqualsQunit(c.assert.assertRender(), "");
        i.showNextPage();
        assertEqualsQunit(c.assert.assertRender(), "");
        i.showNextPage();
        assertEqualsQunit(c.assert.assertRender(), "");
        i.showNextPage();
        assertEqualsQunit(c.assert.assertRender(), "");
        i.showNextPage();
        assertEqualsQunit(c.assert.assertRender(), "");
        i.showNextPage();
        assertEqualsQunit(c.assert.assertRender(), "");
        i.showPrevPage();
        assertEqualsQunit(c.assert.assertRender(), "");

        /*************
         * Test showPage()
         */

        c = mcomponent({
            model : {
                list : ["mattias", "marcus", "johan", "butters", "stan"]
            },
            iter : {
                userListIter : {
                    itemsPerPage : 2,
                    usePages : true
                }
            },
            viewHtml : "{{ niter userListIter list }}{{ show }}{{ endniter }}"});
        assertEqualsQunit(c.assert.assertRender(), "mattiasmarcus", "Should first element only.");
        assertObject(i = c.getIterator("userListIter"));
        assertEqualsQunit(i.getPageCount(), 3);
        i.showPage(1);
        assertEqualsQunit(c.assert.assertRender(), "johanbutters", "Should first element only.");

        /* Check that usePages = false causes showPage() to throw exception. */

        c = mcomponent({
            model : {
                list : ["mattias", "marcus", "johan", "butters", "stan"]
            },
            iter : {
                userListIter : {
                    itemsPerPage : 2,
                    usePages : false
                }
            },
            viewHtml : "{{ niter userListIter list }}{{ show }}{{ endniter }}"});
        assertEqualsQunit(c.assert.assertRender(), "mattiasmarcus", "Should first element only.");
        assertObject(i = c.getIterator("userListIter"));
        assertExceptionQunit(function() {
            i.showPage(1);
        }, "showPage should throw exception when usePages == false.");

        /*************
         * Test showPageWithItem() and showPageWithItemThat()
         */

        c = mcomponent({
            model : {
                list : ["mattias", "marcus", "johan", "butters", "stan"]
            },
            iter : {
                userListIter : {
                    itemsPerPage : 2,
                    usePages : true
                }
            },
            viewHtml : "{{ niter userListIter list }}{{ show }}{{ endniter }}"});
        assertEqualsQunit(c.assert.assertRender(), "mattiasmarcus", "Should first element only.");
        assertObject(i = c.getIterator("userListIter"));
        assertEqualsQunit(i.getPageCount(), 3);
        assertEqualsQunit(i.getIndexForItem("johan"), 2, "getIndexForItem() should work.");
        i.showPageWithItem("johan");
        assertEqualsQunit(c.assert.assertRender(), "johanbutters", "Should first element only.");
        i.showPageWithItem("butters");
        assertEqualsQunit(c.assert.assertRender(), "johanbutters", "Should first element only.");
        i.showPageWithItem("stan");
        assertEqualsQunit(c.assert.assertRender(), "stan", "Should first element only.");
        i.showPageWithItem("marcus");
        assertEqualsQunit(c.assert.assertRender(), "mattiasmarcus", "Should first element only.");

        /************************
         *  Test showPageWithItemWhere()
         *************************/

        c = mcomponent({
            model : {
                list : [
                    {age : 32, name : "mattias", selected : true},
                    {age : 32, name : "marcus"},
                    {age : 31, name : "johan"},
                    {age : 6, name : "butters"},
                    {age : 8, name : "stan"}
                ]
            },
            iter : {
                userListIter : {
                    itemsPerPage : 2,
                    usePages : true
                }
            },
            viewHtml : "{{ niter userListIter list }}{{ name }}{{ endniter }}"});
        assertEqualsQunit(c.assert.assertRender(), "mattiasmarcus");
        assertObject(i = c.getIterator("userListIter"));
        assertEqualsQunit(i.getPageCount(), 3);

        /* getIndexForItemWhere() */

        assertEqualsQunit(i.getIndexForItemWhere(function(item) {
            return item.age == 6;
        }), 3, "getIndexForItemWhere() should work.");

        assertEqualsQunit(i.getIndexForItemWhere(function(item) {
            return item.selected == true;
        }), 0, "getIndexForItemWhere() should work.");

        assertEqualsQunit(i.getIndexForItemWhere(function(item) {
            return item.age == 32;
        }), 0, "getIndexForItemWhere() should work.");

        /* showPageWithItemIndex() */

        i.showPageWithItemIndex(-1);
        assertEqualsQunit(c.assert.assertRender(), "mattiasmarcus");

        i.showPageWithItemIndex(0);
        assertEqualsQunit(c.assert.assertRender(), "mattiasmarcus");

        i.showPageWithItemIndex(1);
        assertEqualsQunit(c.assert.assertRender(), "mattiasmarcus");

        i.showPageWithItemIndex(2);
        assertEqualsQunit(c.assert.assertRender(), "johanbutters");

        i.showPageWithItemIndex(3);
        assertEqualsQunit(c.assert.assertRender(), "johanbutters");

        i.showPageWithItemIndex(4);
        assertEqualsQunit(c.assert.assertRender(), "stan");

        i.showPageWithItemIndex(5);
        assertEqualsQunit(c.assert.assertRender(), "stan");

        i.showPageWithItemIndex(6);
        assertEqualsQunit(c.assert.assertRender(), "stan");

        /* showPageWithItemWhere() */

        i.showPageWithItemWhere(function(item) {
            return item.age == 6;
        });
        assertEqualsQunit(c.assert.assertRender(), "johanbutters");

        i.showPageWithItemWhere(function(item) {
            return item.age == 8;
        });
        assertEqualsQunit(c.assert.assertRender(), "stan");

        i.showPageWithItemWhere(function(item) {
            return item.age == 32;
        });
        assertEqualsQunit(c.assert.assertRender(), "mattiasmarcus");

        i.showPageWithItemWhere(function(item) {
            return item.age == 31;
        });
        assertEqualsQunit(c.assert.assertRender(), "johanbutters");

        i.showPageWithItemWhere(function(item) {
            return item.selected == true;
        });
        assertEqualsQunit(c.assert.assertRender(), "mattiasmarcus");


    }
});

TestCase("Niter tag - misc iterator functions", {

    "test niter tag, misc iterator functions" : function() {

        /********************************************************
         * Check isOnFirstPage, etc, when more than one page.
         ********************************************************/

        var c, i;

        c = mcomponent({
            model : {
                list : ["mattias", "marcus", "must", "johan", "kurt", "korv"]
            },
            iter : {
                userListIter : {
                    itemsPerPage : 2,
                    usePages : true
                }
            },
            viewHtml : "{{ niter userListIter list }}{{ show }}{{ endniter }}"});
        assertString(c.assert.assertRender());
        assertObject(i = c.getIterator("userListIter"));
        assertEqualsQunit(i.getPageCount(), 3);
        assertEqualsQunit(i.isOnFirstPage(), true, "Should be on first page.");
        assertEqualsQunit(i.isOnLastPage(), false, "Should NOT be on last page.");
        assertEqualsQunit(i.isOnFirstOrLastPage(), true, "Is on first OR last page, since we are on first.");
        assertEqualsQunit(i.isOnFirstAndLastPage(), false, "Is NOT on first AND last page, since we are on first only.");

        /* Then second page */

        i.showNextPage();
        assertEqualsQunit(i.getPageCount(), 3);
        assertEqualsQunit(i.isOnFirstPage(), false, "Should NOT be on first page.");
        assertEqualsQunit(i.isOnLastPage(), false, "Should NOT be on last page.");
        assertEqualsQunit(i.isOnFirstOrLastPage(), false, "Is NOT on first OR last page, since we are on first.");
        assertEqualsQunit(i.isOnFirstAndLastPage(), false, "Is NOT on first AND last page, since we are on first only.");

        /* Then third and last page */

        i.showNextPage();
        assertEqualsQunit(i.getPageCount(), 3);
        assertEqualsQunit(i.isOnFirstPage(), false, "Should NOT be on first page.");
        assertEqualsQunit(i.isOnLastPage(), true, "Should be on last page.");
        assertEqualsQunit(i.isOnFirstOrLastPage(), true, "Is on first OR last page, since we are on last.");
        assertEqualsQunit(i.isOnFirstAndLastPage(), false, "Is NOT on first AND last page, since we are on first only.");

        /********************************************************
         * Check isOnFirstPage, etc, when only one page.
         ********************************************************/

        c = mcomponent({
            model : {
                list : ["mattias", "marcus"]
            },
            iter : {
                userListIter : {
                    itemsPerPage : 2,
                    usePages : true
                }
            },
            viewHtml : "{{ niter userListIter list }}{{ show }}{{ endniter }}"});
        assertString(c.assert.assertRender());
        assertObject(i = c.getIterator("userListIter"));
        assertEqualsQunit(i.getPageCount(), 1);
        assertEqualsQunit(i.isOnFirstPage(), true, "Should be on first page.");
        assertEqualsQunit(i.isOnLastPage(), true, "Should be on last page.");
        assertEqualsQunit(i.isOnFirstOrLastPage(), true, "Is on first OR last page, since we are on first.");
        assertEqualsQunit(i.isOnFirstAndLastPage(), true, "Is on first AND last page.");

        /********************************************************
         * Check getFirstIndexForCurrentPage, etc
         ********************************************************/

        c = mcomponent({
            model : {
                list : ["mattias", "marcus", "must", "johan", "kurt", "korv"]
            },
            iter : {
                userListIter : {
                    itemsPerPage : 2,
                    usePages : true
                }
            },
            viewHtml : "{{ niter userListIter list }}{{ show }}{{ endniter }}"});

        assertString(c.assert.assertRender());
        assertObject(i = c.getIterator("userListIter"));

        assertEqualsQunit(i.getPageCount(), 3);
        assertEqualsQunit(i.getCurrentPage(), 0);

        assertEqualsQunit(i.getFirstIndexForCurrentPage(), 0);
        assertEqualsQunit(i.getLastIndexForCurrentPage(), 1);
        i.showNextPage();
        assertEqualsQunit(i.getFirstIndexForCurrentPage(), 2);
        assertEqualsQunit(i.getLastIndexForCurrentPage(), 3);
        i.showNextPage();
        assertEqualsQunit(i.getFirstIndexForCurrentPage(), 4);
        assertEqualsQunit(i.getLastIndexForCurrentPage(), 5);
        i.showNextPage();
        assertEqualsQunit(i.getFirstIndexForCurrentPage(), 4);
        assertEqualsQunit(i.getLastIndexForCurrentPage(), 5);

        /********************************************************
         * Check getFirstItemForCurrentPage, etc
         ********************************************************/

        c = mcomponent({
            model : {
                list : ["mattias", "marcus", "must", "johan", "kurt", "korv"]
            },
            iter : {
                userListIter : {
                    itemsPerPage : 2,
                    usePages : true
                }
            },
            viewHtml : "{{ niter userListIter list }}{{ show }}{{ endniter }}"});

        assertString(c.assert.assertRender());
        assertObject(i = c.getIterator("userListIter"));

        assertEqualsQunit(i.getPageCount(), 3);
        assertEqualsQunit(i.getCurrentPage(), 0);

        assertEqualsQunit(i.getFirstItemOnCurrentPage(), "mattias");
        assertEqualsQunit(i.getLastItemOnCurrentPage(), "marcus");
        i.showNextPage();
        assertEqualsQunit(i.getFirstItemOnCurrentPage(), "must");
        assertEqualsQunit(i.getLastItemOnCurrentPage(), "johan");
        i.showNextPage();
        assertEqualsQunit(i.getFirstItemOnCurrentPage(), "kurt");
        assertEqualsQunit(i.getLastItemOnCurrentPage(), "korv");
        i.showNextPage();
        assertEqualsQunit(i.getFirstItemOnCurrentPage(), "kurt");
        assertEqualsQunit(i.getLastItemOnCurrentPage(), "korv");

    }
});
TestCase("Niter tag - using getIterator() before rendering", {

    "test niter tag, using iterator before rendering" : function() {
        var c, i;
        c = mcomponent({
            model : {
                list : ["mattias", "marcus", "must", "johan"]
            },
            iter : {
                userListIter : {
                    itemsPerPage : 2,
                    usePages : true
                }
            },
            viewHtml : "{{ niter userListIter list }}{{ show }}{{ endniter }}"});
        assertObject(i = c.getIterator("userListIter"));
        assertEqualsQunit(i.getPageCount(), 0);
        assertEqualsQunit(i.getCurrentPage(), 0);
        i.showNextPage();
        assertEqualsQunit(i.getCurrentPage(), 1);
        assertEqualsQunit(c.assert.assertRender(), "mustjohan", "Should contain page 2.");

    }

});

TestCase("Niter tag - using showPageWithItemWhere using an external model", {

    "test niter tag, using showPageWithItemWhere using an external model" : function() {
        var c, i;
        var model = {
            list : ["mattias", "marcus", "must", "johan"]
        };

        c = mcomponent({
            model : model,
            iter : {
                userListIter : {
                    itemsPerPage : 2,
                    usePages : true
                }
            },
            viewHtml : "{{ niter userListIter list }}{{ show }}{{ endniter }}"});
        assertObject("Iterator should be available.", i = c.getIterator("userListIter"));
        assertEqualsQunit(i.getPageCount(), 0, "No page count yet, since there is no model.");
        assertEqualsQunit(i.getCurrentPage(), 0, "Current page starts at 0.");
        assertExceptionQunit(function() {
            i.showPageWithItemWhere(function(item) {
                return item == "must";
            });
        }, "Should throw exception, it cannot lookup the item on the list, since the list is still undefined.");

        i.setModel(model.list);
        i.showPageWithItemWhere(function(item) {
            return item == "must";
        });

        assertEqualsQunit(i.getCurrentPage(), 1);
        assertEqualsQunit(c.assert.assertRender(), "mustjohan", "Should contain second page.");

        i.showNextPage();
        assertEqualsQunit(i.getCurrentPage(), 1);
        assertEqualsQunit(c.assert.assertRender(), "mustjohan", "Should contain page 2.");
    }

});

TestCase("Niter tag - pages callbacks", {

    "test niter tag, pages callbacks" : function() {
        var c;
        var a = 1;
        var i;

        c = mcomponent({
            model : {
                list : ["mattias", "marcus", "johan", "butters", "stan"]
            },
            iter : {
                userListIter : {
                    itemsPerPage : 1,
                    usePages : true,
                    whenFirstPageIsShowing : function(api) {
                        a = 2;
                    }
                }
            },
            viewHtml : "{{ niter userListIter list }}{{ show }}{{ endniter }}"});
        assertEqualsQunit(a, 1, "Should be 1 first.");
        assertEqualsQunit(c.assert.assertRender(), "mattias", "Should first element only.");
        assertObject(i = c.getIterator("userListIter"));
        assertEqualsQunit(i.getPageCount(), 5);
        assertEqualsQunit(a, 2, "Should be 2 after callback has run.");

        a = 1;
        c = mcomponent({
            model : {
                list : ["mattias", "marcus", "johan", "butters", "stan"]
            },
            iter : {
                userListIter : {
                    itemsPerPage : 1,
                    usePages : true,
                    whenNotFirstPageIsShowing : function(api) {
                        a = 2;
                    }
                }
            },
            viewHtml : "{{ niter userListIter list }}{{ show }}{{ endniter }}"});
        assertEqualsQunit(a, 1, "Should be 1 first.");
        assertEqualsQunit(c.assert.assertRender(), "mattias", "Should first element only.");
        assertObject(i = c.getIterator("userListIter"));
        assertEqualsQunit(i.getPageCount(), 5);
        assertEqualsQunit(a, 1, "Should be 1 after callback has run.");
        i.showNextPage();
        assertEqualsQunit(c.assert.assertRender(), "marcus", "Should first element only.");
        assertEqualsQunit(a, 2, "Should be 2 after callback has run.");


        a = 1;
        assertObject("Gonna test whenNotLastPageIsShowing and whenLastPageIsShowing!",
            c = mcomponent({
                model : {
                    list : ["mattias", "marcus", "johan", "butters", "stan"]
                },
                iter : {
                    userListIter : {
                        itemsPerPage : 3,
                        usePages : true,
                        whenNotLastPageIsShowing : function(api) {
                            a = 2;
                        },
                        whenLastPageIsShowing : function(api) {
                            a = 3;
                        }
                    }
                },
                viewHtml : "{{ niter userListIter list }}{{ show }}{{ endniter }}"}));

        assertEqualsQunit(a, 1, "Should be 1 first.");
        assertEqualsQunit(c.assert.assertRender(), "mattiasmarcusjohan", "Should first element only.");
        assertObject(i = c.getIterator("userListIter"));
        assertEqualsQunit(i.getPageCount(), 2);
        assertEqualsQunit(a, 2, "Should be 2 after callback has run.");
        i.showNextPage();
        assertEqualsQunit(c.assert.assertRender(), "buttersstan", "Should first element only.");
        assertEqualsQunit(a, 3, "Should be 3 after callback has run.");

        a = 1;
        assertObject("Gonna test whenNotLastPageIsShowing and whenLastPageIsShowing!",
            c = mcomponent({
                model : {
                    list : ["mattias", "marcus", "johan", "butters", "stan"]
                },
                iter : {
                    iterBeforeRender : {
                        itemsPerPage : 3,
                        usePages : true,
                        whenNotLastPageIsShowing : function(api) {
                            a = 2;
                        },
                        whenLastPageIsShowing : function(api) {
                            a = 3;
                        }
                    }
                },
                viewHtml : "{{ niter iterBeforeRender list }}{{ show }}{{ endniter }}"}));

        assertObject("Should be able to use iterator before rendering the component.", i = c.getIterator("iterBeforeRender"));
        assertEqualsQunit(a, 1, "Should be 1 first.");
        assertEqualsQunit(c.assert.assertRender(), "mattiasmarcusjohan", "Should first element only.");
        assertEqualsQunit(i.getPageCount(), 2);
        assertEqualsQunit(a, 2, "Should be 2 after callback has run.");
        i.showNextPage();
        assertEqualsQunit(c.assert.assertRender(), "buttersstan", "Should first element only.");
        assertEqualsQunit(a, 3, "Should be 3 after callback has run.");


        a = 2;
        c = mcomponent({
            model : {
                list : ["mattias", "marcus", "johan", "butters", "stan"]
            },
            iter : {
                userListIter : {
                    itemsPerPage : 1,
                    usePages : true,
                    whenLastPageIsShowing : function(api) {
                        a = 3;
                    }
                }
            },
            viewHtml : "{{ niter userListIter list }}{{ show }}{{ endniter }}"});
        assertEqualsQunit(a, 2, "Should be 2 first.");
        assertEqualsQunit(c.assert.assertRender(), "mattias", "Should first element only.");
        assertObject(i = c.getIterator("userListIter"));
        assertEqualsQunit(i.getPageCount(), 5);
        assertEqualsQunit(i.getCurrentPage(), 0, "Should be on page 0.");
        assertEqualsQunit(i.isOnFirstPage(), true, "Should be on first page.");
        assertEqualsQunit(i.isOnLastPage(), false, "Should NOT be on last page.");
        assertEqualsQunit(a, 2, "Should still be 2 after callback has run.");

        i.showPrevPage();
        c.assert.assertRender();
        assertEqualsQunit(i.getCurrentPage(), 0, "Should not go past page 0.");
        assertEqualsQunit(i.getPageCount(), 5);

        i.showNextPage();
        c.assert.assertRender();
        assertEqualsQunit(i.getCurrentPage(), 1, "Should be on page 1.");
        assertEqualsQunit(a, 2, "Should still be 2.");
        assertEqualsQunit(i.isOnFirstPage(), false, "Should NOT be on first page.");
        assertEqualsQunit(i.isOnLastPage(), false, "Should NOT be on last page.");

        i.showNextPage();
        c.assert.assertRender();
        assertEqualsQunit(i.getCurrentPage(), 2, "Should be on page 2.");
        assertEqualsQunit(a, 2, "Should still be 2.");
        assertEqualsQunit(i.isOnFirstPage(), false, "Should NOT be on first page.");
        assertEqualsQunit(i.isOnLastPage(), false, "Should NOT be on last page.");

        i.showNextPage();
        c.assert.assertRender();
        assertEqualsQunit(i.getCurrentPage(), 3, "Should be on page 3.");
        assertEqualsQunit(a, 2, "Should still be 2.");
        assertEqualsQunit(i.isOnFirstPage(), false, "Should NOT be on first page.");
        assertEqualsQunit(i.isOnLastPage(), false, "Should NOT be on last page.");

        i.showNextPage();
        c.assert.assertRender();
        assertEqualsQunit(i.getCurrentPage(), 4, "Should be on page 4.");
        assertEqualsQunit(i.getPageCount(), 5);
        assertEqualsQunit(a, 3, "Should now be 3.");
        assertEqualsQunit(i.isOnFirstPage(), false, "Should NOT be on first page.");
        assertEqualsQunit(i.isOnLastPage(), true, "Should be on last page.");

        i.showNextPage();
        c.assert.assertRender();
        assertEqualsQunit(i.getCurrentPage(), 4, "Should not go past page 4.");
        assertEqualsQunit(i.getPageCount(), 5);

        a = 22;
        c = mcomponent({
            model : {
                list : ["mattias", "marcus", "johan", "butters", "stan"]
            },
            iter : {
                userListIter : {
                    itemsPerPage : 5,
                    usePages : true,
                    whenLastPageIsShowing : function(api) {
                        a = 3;
                    }
                }
            },
            viewHtml : "{{ niter userListIter list }}{{ show }}{{ endniter }}"});
        assertEqualsQunit(a, 22, "Should be 22 first.");
        assertEqualsQunit(c.assert.assertRender(), "mattiasmarcusjohanbuttersstan", "Should first element only.");
        assertObject(i = c.getIterator("userListIter"));
        assertEqualsQunit(i.getPageCount(), 1);
        assertEqualsQunit(i.getCurrentPage(), 0, "Should be on page 0.");
        assertEqualsQunit(a, 3, "Should be 3.");

        a = 22;
        c = mcomponent({
            model : {
                list : ["mattias", "marcus", "johan", "butters", "stan"]
            },
            iter : {
                userListIter : {
                    itemsPerPage : 5,
                    usePages : true,
                    whenFirstPageIsShowing : function(api) {
                        a = 3;
                    }
                }
            },
            viewHtml : "{{ niter userListIter list }}{{ show }}{{ endniter }}"});
        assertEqualsQunit(a, 22, "Should be 22 first.");
        assertEqualsQunit(c.assert.assertRender(), "mattiasmarcusjohanbuttersstan", "Should first element only.");
        assertObject(i = c.getIterator("userListIter"));
        assertEqualsQunit(i.getPageCount(), 1);
        assertEqualsQunit(i.getCurrentPage(), 0, "Should be on page 0.");
        assertEqualsQunit(a, 3, "Should be 3.");

        a = 22;
        c = mcomponent({
            model : {
                list : ["mattias", "marcus", "johan", "butters", "stan"]
            },
            iter : {
                userListIter : {
                    itemsPerPage : 5,
                    usePages : true,
                    whenFirstOrLastPageIsShowing : function(api) {
                        a = 3;
                    }
                }
            },
            viewHtml : "{{ niter userListIter list }}{{ show }}{{ endniter }}"});
        assertEqualsQunit(a, 22, "Should be 22 first.");
        assertEqualsQunit(c.assert.assertRender(), "mattiasmarcusjohanbuttersstan", "Should first element only.");
        assertObject(i = c.getIterator("userListIter"));
        assertEqualsQunit(i.getPageCount(), 1);
        assertEqualsQunit(i.getCurrentPage(), 0, "Should be on page 0.");
        assertEqualsQunit(a, 3, "Should be 3.");

        a = 22;
        c = mcomponent({
            model : {
                list : ["mattias", "marcus", "johan", "butters", "stan"]
            },
            iter : {
                userListIter : {
                    itemsPerPage : 5,
                    usePages : true,
                    whenFirstAndLastPageIsShowing : function(api) {
                        a = 3;
                    }
                }
            },
            viewHtml : "{{ niter userListIter list }}{{ show }}{{ endniter }}"});
        assertEqualsQunit(a, 22, "Should be 22 first.");
        assertEqualsQunit(c.assert.assertRender(), "mattiasmarcusjohanbuttersstan", "Should first element only.");
        assertObject(i = c.getIterator("userListIter"));
        assertEqualsQunit(i.getPageCount(), 1);
        assertEqualsQunit(i.getCurrentPage(), 0, "Should be on page 0.");
        assertEqualsQunit(a, 3, "Should be 3.");

        a = 22;
        c = mcomponent({
            model : {
                list : ["mattias", "marcus", "johan", "butters", "stan"]
            },
            iter : {
                userListIter : {
                    itemsPerPage : 2,
                    usePages : true,
                    whenNotFirstOrLastPageIsShowing : function(api) {
                        a = 77;
                    }
                }
            },
            viewHtml : "{{ niter userListIter list }}{{ show }}{{ endniter }}"});
        assertEqualsQunit(a, 22, "Should be 22 first.");
        assertEqualsQunit(c.assert.assertRender(), "mattiasmarcus", "Should first element only.");
        assertObject(i = c.getIterator("userListIter"));
        assertEqualsQunit(i.getPageCount(), 3);
        assertEqualsQunit(i.getCurrentPage(), 0, "Should be on page 0.");
        assertEqualsQunit(a, 22, "Should be 22.");
        i.showNextPage();
        c.assert.assertRender();
        assertEqualsQunit(i.getCurrentPage(), 1, "Should be on page 1.");
        assertEqualsQunit(i.getPageCount(), 3);
        assertTrueQunit(!i.isOnFirstOrLastPage(), "Should not be isOnFirstOrLastPage");
        assertEqualsQunit(a, 77, "Should now be 77.");

        a = 22;
        c = mcomponent({
            model : {
                list : ["mattias", "marcus", "johan", "butters", "stan"]
            },
            iter : {
                userListIter : {
                    itemsPerPage : 2,
                    usePages : true,
                    whenThereAreItems : function(api) {
                        a = 77;
                    },
                    whenThereAreNoItems : function(api) {
                        a = 88;
                    }
                }
            },
            viewHtml : "{{ niter userListIter list }}{{ show }}{{ endniter }}"});
        assertEqualsQunit(a, 22, "Should be 22 first.");
        assertEqualsQunit(c.assert.assertRender(), "mattiasmarcus", "Should first element only.");
        assertObject(i = c.getIterator("userListIter"));
        assertEqualsQunit(i.getPageCount(), 3);
        assertEqualsQunit(i.getCurrentPage(), 0, "Should be on page 0.");
        assertEqualsQunit(a, 77, "Should be 77.");
        c.setModel({list : []});
        assertEqualsQunit(a, 77, "Should be 77.");
        assertEqualsQunit(c.assert.assertRender(), "", "Empty since the list is empty.");
        assertEqualsQunit(a, 88, "Should be 88.");
        assertEqualsQunit(i.getPageCount(), 0);
        assertEqualsQunit(i.getCurrentPage(), 0, "Should be on page 0.");
        assertEqualsQunit(a, 88, "Should be 88.");

    }

});

TestCase("Niter tag - filter function", {

    "test niter tag, filter function" : function() {
        var c;

        c = mcomponent({
            model : {
                list : [
                    {age : 32, name : "mattias"},
                    {age : 8, name : "butters"},
                    {age : 32, name : "marcus"},
                    {age : 31, name : "johan"},
                    {age : 9, name : "stan"}
                ]
            },
            iter : {
                filteredUserListIter : {
                    usePages : true,
                    itemsPerPage : 2,
                    where : function(user) {
                        return user.age > 18;
                    }
                }
            },
            viewHtml : "{{ niter filteredUserListIter list }}{{ name }}{{ endniter }}"});

        assertEqualsQunit(c.assert.assertRender(), "mattiasmarcus", "Should first element only.");

        c = mcomponent({
            model : {
                list : [
                    {age : 32, name : "mattias"},
                    {age : 8, name : "butters"},
                    {age : 32, name : "marcus"},
                    {age : 31, name : "johan"},
                    {age : 9, name : "stan"}
                ]
            },
            iter : {
                filteredUserListIter : {
                    usePages : true,
                    itemsPerPage : 3,
                    where : function(user) {
                        return user.age > 18;
                    }
                }
            },
            viewHtml : "{{ niter filteredUserListIter list }}{{ name }}{{ endniter }}"});

        assertEqualsQunit(c.assert.assertRender(), "mattiasmarcusjohan", "Should first element only.");

        c = mcomponent({
            model : {
                list : [
                    {age : 32, name : "mattias"},
                    {age : 8, name : "butters"},
                    {age : 32, name : "marcus"},
                    {age : 31, name : "johan"},
                    {age : 9, name : "stan"}
                ]
            },
            iter : {
                filteredUserListIter : {
                    usePages : true,
                    itemsPerPage : 4,
                    where : function(user) {
                        return user.age > 18;
                    }
                }
            },
            viewHtml : "{{ niter filteredUserListIter list }}{{ name }}{{ endniter }}"});

        assertEqualsQunit(c.assert.assertRender(), "mattiasmarcusjohan", "Should first element only.");

        c = mcomponent({
            model : {
                list : [
                    {age : 32, name : "mattias"},
                    {age : 8, name : "butters"},
                    {age : 32, name : "marcus"},
                    {age : 31, name : "johan"},
                    {age : 9, name : "stan"}
                ]
            },
            iter : {
                filteredUserListIter : {
                    usePages : true,
                    itemsPerPage : 40,
                    where : function(user) {
                        return user.age > 18;
                    }
                }
            },
            viewHtml : "{{ niter filteredUserListIter list }}{{ name }}{{ endniter }}"});

        assertEqualsQunit(c.assert.assertRender(), "mattiasmarcusjohan", "Should first element only.");

        c = mcomponent({
            model : {
                list : [
                    {age : 32, name : "mattias"},
                    {age : 8, name : "butters"},
                    {age : 32, name : "marcus"},
                    {age : 31, name : "johan"},
                    {age : 9, name : "stan"}
                ]
            },
            iter : {
                filteredUserListIter : {
                    usePages : true,
                    itemsPerPage : 40,
                    where : function(user) {
                        return user.age < 18;
                    }
                }
            },
            viewHtml : "{{ niter filteredUserListIter list }}{{ name }}{{ endniter }}"});

        assertEqualsQunit(c.assert.assertRender(), "buttersstan", "Should first element only.");

        c = mcomponent({
            model : {
                list : [
                    {age : 32, name : "mattias"},
                    {age : 8, name : "butters"},
                    {age : 32, name : "marcus"},
                    {age : 31, name : "johan"},
                    {age : 9, name : "stan"}
                ]
            },
            iter : {
                filteredUserListIter : {
                    usePages : true,
                    itemsPerPage : 40,
                    where : function(user) {
                        return user.age == 9;
                    }
                }
            },
            viewHtml : "{{ niter filteredUserListIter list }}{{ name }}{{ endniter }}"});

        assertEqualsQunit(c.assert.assertRender(), "stan", "Should contain stan only.");

        c = mcomponent({
            model : {
                list : [
                    {age : 32, name : "mattias"},
                    {age : 8, name : "butters"},
                    {age : 32, name : "marcus"},
                    {age : 31, name : "johan"},
                    {age : 9, name : "stan"}
                ]
            },
            iter : {
                filteredUserListIter : {
                    usePages : true,
                    itemsPerPage : 40,
                    where : function(user) {
                        return user.age == 1;
                    }
                }
            },
            viewHtml : "{{ niter filteredUserListIter list }}{{ name }}{{ endniter }}"});

        assertEqualsQunit(c.assert.assertRender(), "", "Should be empty.");

    }

});

TestCase("Niter tag - filter function and getPageCount() in iterator", {

    "test niter tag, filter function and getPageCount() in iterator" : function() {
        var c, i;

        c = mcomponent({
            model : {
                list : [
                    {age : 32, name : "mattias"},
                    {age : 8, name : "butters"},
                    {age : 32, name : "marcus"},
                    {age : 31, name : "johan"},
                    {age : 9, name : "stan"}
                ]
            },
            iter : {
                filteredUserListIter : {
                    usePages : true,
                    itemsPerPage : 1,
                    where : function(user) {
                        return user.age > 30;
                    }
                }
            },
            viewHtml : "{{ niter filteredUserListIter list }}{{ name }}{{ endniter }}"});

        assertEqualsQunit(c.assert.assertRender(), "mattias", "Should be empty.");
        i = c.getIterator("filteredUserListIter");
        assertEqualsQunit(i.getPageCount(), 3, "3 pages when there are 3 items after where has been applied.");

        c = mcomponent({
            model : {
                list : [
                    {age : 32, name : "mattias"},
                    {age : 8, name : "butters"},
                    {age : 32, name : "marcus"},
                    {age : 31, name : "johan"},
                    {age : 9, name : "stan"}
                ]
            },
            iter : {
                filteredUserListIter : {
                    usePages : true,
                    itemsPerPage : 1,
                    where : function(user) {
                        return user.age == 1;
                    }
                }
            },
            viewHtml : "{{ niter filteredUserListIter list }}{{ name }}{{ endniter }}"});

        assertEqualsQunit(c.assert.assertRender(), "", "Should be empty.");
        i = c.getIterator("filteredUserListIter");
        assertEqualsQunit(i.getPageCount(), 0, "0 page when there are 0 items.");


    }

});

TestCase("Niter tag - prevent page overflow when using where function", {

    "test niter tag, prevent page overflow when using where function" : function() {

        var c, i;

        var model = {
            list : [
                {age : 32, name : "mattias"},
                {age : 8, name : "butters"},
                {age : 32, name : "marcus"},
                {age : 31, name : "johan"},
                {age : 9, name : "stan"}
            ]
        };

        c = mcomponent({
            model : model,
            iter : {
                filteredUserListIter : {
                    usePages : true,
                    itemsPerPage : 2,
                    where : function(user) {
                        return user.age > 30;
                    }
                }
            },
            viewHtml : "{{ niter filteredUserListIter list }}{{ name }}{{ endniter }}"});

        assertEqualsQunit(c.assert.assertRender(), "mattiasmarcus", "Start state.");
        assertObject("Iterator should exist.", i = c.getIterator("filteredUserListIter"));

        // Go to page 2/2
        i.showNextPage();
        assertEqualsQunit(c.assert.assertRender(), "johan", "Second page.");

        // Now change model, so that we only have 1 item in the list, and thus, only one page!
        model.list[2].age = 13;
        model.list[3].age = 14;

        assertEqualsQunit(c.assert.assertRender(), "mattias", "Second page.");

    }

});

TestCase("Niter tag - showPageWithItem methods, combined with where function", {

    "test niter tag, showPageWithItem methods, combined with where function" : function() {
        var c, i;

        var model = {
            list : [
                {age : 32, name : "mattias"},
                {age : 8, name : "butters"},
                {age : 32, name : "marcus"},
                {age : 31, name : "johan"},
                {age : 9, name : "stan"}
            ]
        };

        c = mcomponent({
            model : model,
            iter : {
                list : {
                    usePages : true,
                    itemsPerPage : 1,
                    where : function(user) {
                        return user.age > 30;
                    }
                }
            },
            viewHtml : "{{ niter list list }}{{ name }}{{ endniter }}"});

        assertEqualsQunit(c.assert.assertRender(), "mattias", "Should be empty.");
        assertObject("Iterator should exist", i = c.getIterator("list"));
        assertEqualsQunit(i.getPageCount(), 3, "3 pages when there are 3 items after where has been applied.");

        assertExceptionQunit(function() {
            i.getPageWithItem(model.list[-1]);
        }, "Item -1 never exists, so should throw exception.");
        assertEqualsQunit(i.getPageWithItem(model.list[0]), 0, "Item 0 should be on page 0.");
        assertExceptionQunit(function() {
            i.getPageWithItem(model.list[1]);
        }, "Item 2 should be on NO page.");
        assertEqualsQunit(i.getPageWithItem(model.list[2]), 1, "Item 2 should be on page 1.");
        assertEqualsQunit(i.getPageWithItem(model.list[3]), 2, "Item 3 should be on page 2.");
        assertExceptionQunit(function() {
            i.getPageWithItem(model.list[4]);
        }, "Item 4 should be on NO page.");
        assertExceptionQunit(function() {
            i.getPageWithItem(model.list[5]);
        }, "Item 5 does not exist.");

    }

});

TestCase("Niter tag - causing compile errors", {

    "test niter tag, causing compile errors" : function() {

        var c;

        assertExceptionQunit(function() {
            c = mcomponent({
                viewHtml : "{{ niter list list }}{{ enditer }}",
                throwOnError : true
            });
        }, "Construction fails and with throwOnError, there should be an exception.");

        assertObject("Compiling fails, but should not throw an exception.",
            c = mcomponent({
                viewHtml : "{{ niter list list }}{{ enditer }}"
            }));

        assertTrueQunit(c.assert.assertRender() !== "", "niter and enditer mismatch. Should output error in DOM, so result can not be empty.");
        assertTrueQunit(c.hasCompileError(), "Should contain compile errors because of enditer mismatch.");
        assertTrueQunit(c.hasRenderErrors(), "Should contain render errors as well, since all compile errors cause a render error.");

    }

});

TestCase("Niter/iter tag - looking up properties in objects in different ways", {

    "test iter tag with property lookup using [''] compiling correctly" : function() {
        assertNoException(function() {
            mcomponent({
                viewHtml : "{{ iter bounds['out'] }}{{ enditer }}"
            });
        });
    },

    'test iter tag with property lookup using [""] compiling correctly' : function() {
        assertNoException(function() {
            mcomponent({
                viewHtml : '{{ iter bounds["out"] }}{{ enditer }}',
                throwOnError : true
            });
        });
    }

});