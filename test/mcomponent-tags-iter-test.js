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
        assertEquals("Should contain nothing.", "", c.assert.assertRender());

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
        assertEquals("b should be 1 first.", 1, b);
        assertEquals("Should first element only.", "mattias", c.assert.assertRender());
        assertEquals("b should be 2 after whenNotAllItemsAreShowing has been run.", 2, b);
        assertObject("Should be able to get iterator context.", i = c.getIterator("userListIterYeah"));
        i.showMoreItems();
        assertEquals("Should contain one more element.", "mattiasmarcus", c.assert.assertRender());
        assertEquals("a should be 3 first.", 3, a);
        i.showMoreItems();
        assertEquals("Should contain all three elements.", "mattiasmarcusjohan", c.assert.assertRender());
        assertEquals("a should now be 5 since callback changed the value.", 5, a);
        i.showMoreItems();
        assertEquals("Should contain all three elements again.", "mattiasmarcusjohan", c.assert.assertRender());

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
        assertEquals("Should first element only.", "mattias", c.assert.assertRender());
        assertObject("Should be able to get iterator context.", i = c.getIterator("userListIterYeah"));
        assertEquals("Trying to get iterator context that doesn't exist should return undefined.", undefined, c.getIterator("userListIterYeahASFSA"));
        assertEquals("a should be 3 first.", 3, a);
        i.showAllItems();
        assertEquals("Should show all elements.", "mattiasmarcusjohan", c.assert.assertRender());
        assertEquals("a should now be 5 since callback changed the value.", 5, a);

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
        assertEquals("Should be empty.", "", c.assert.assertRender());
        assertObject(i = c.getIterator("userListIter"));
        assertEquals(0, i.getPageCount());
        assertEquals(0, i.getCurrentPage());
        i.showNextPage();
        assertEquals("Should still be empty.", "", c.assert.assertRender());
        assertEquals(0, i.getCurrentPage());
        i.showNextPage();
        assertEquals("Should still be empty.", "", c.assert.assertRender());
        assertEquals(0, i.getCurrentPage());
        i.showPrevPage();
        assertEquals("Should still be empty.", "", c.assert.assertRender());
        assertEquals(0, i.getCurrentPage());
        i.showPrevPage();
        assertEquals("Should still be empty.", "", c.assert.assertRender());
        assertEquals(0, i.getCurrentPage());
        i.showPrevPage();
        assertEquals("Should still be empty.", "", c.assert.assertRender());
        assertEquals(0, i.getCurrentPage());

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
        assertEquals("Should show first two element.", "mattiasmarcus", c.assert.assertRender());
        assertObject(i = c.getIterator("userListIter"));
        assertEquals(3, i.getPageCount());
        i.showPrevPage();
        assertEquals("Should show first two again since it is first page.", "mattiasmarcus", c.assert.assertRender());
        i.showNextPage();
        assertEquals("Should show second two elements.", "johanbutters", c.assert.assertRender());
        i.showNextPage();
        assertEquals("Should show second two elements.", "stan", c.assert.assertRender());
        i.showNextPage();
        assertEquals("Next page should be same, since it is last page.", "stan", c.assert.assertRender());
        i.showPrevPage();
        assertEquals("And now we go back to previous page.", "johanbutters", c.assert.assertRender());

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
        assertEquals("Should first element only.", "mattiasmarcusjohan", c.assert.assertRender());
        assertObject(i = c.getIterator("userListIter"));
        assertEquals(2, i.getPageCount());
        i.showPrevPage();
        assertEquals("Should show first two again since it is first page.", "mattiasmarcusjohan", c.assert.assertRender());
        i.showNextPage();
        assertEquals("Should show page 2.", "buttersstan", c.assert.assertRender());
        i.showNextPage();
        assertEquals("Same again.", "buttersstan", c.assert.assertRender());
        i.showPrevPage();
        assertEquals("And now we go back to previous page.", "mattiasmarcusjohan", c.assert.assertRender());

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
        assertEquals("Should first element only.", "mattias", c.assert.assertRender());
        assertObject(i = c.getIterator("userListIter"));
        assertEquals(5, i.getPageCount());
        i.showPrevPage();
        assertEquals("mattias", c.assert.assertRender());
        i.showNextPage();
        assertEquals("marcus", c.assert.assertRender());
        i.showNextPage();
        assertEquals("johan", c.assert.assertRender());
        i.showNextPage();
        assertEquals("butters", c.assert.assertRender());
        i.showNextPage();
        assertEquals("stan", c.assert.assertRender());
        i.showNextPage();
        assertEquals("Next page should be same, since it is last page.", "stan", c.assert.assertRender());
        i.showPrevPage();
        assertEquals("And now we go back to previous page.", "butters", c.assert.assertRender());

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
        assertEquals("Should first element only.", "mattiasmarcusjohanbuttersstan", c.assert.assertRender());
        assertObject(i = c.getIterator("userListIter"));
        assertEquals(1, i.getPageCount());
        i.showPrevPage();
        assertEquals("mattiasmarcusjohanbuttersstan", c.assert.assertRender());
        i.showNextPage();
        assertEquals("mattiasmarcusjohanbuttersstan", c.assert.assertRender());
        i.showNextPage();
        assertEquals("mattiasmarcusjohanbuttersstan", c.assert.assertRender());
        i.showNextPage();
        assertEquals("mattiasmarcusjohanbuttersstan", c.assert.assertRender());
        i.showNextPage();
        assertEquals("mattiasmarcusjohanbuttersstan", c.assert.assertRender());
        i.showPrevPage();
        assertEquals("And now we go back to previous page.", "mattiasmarcusjohanbuttersstan", c.assert.assertRender());

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
        assertEquals("Should first element only.", "", c.assert.assertRender());
        assertObject(i = c.getIterator("userListIter"));
        assertEquals(0, i.getPageCount());
        i.showPrevPage();
        assertEquals("", c.assert.assertRender());
        i.showNextPage();
        assertEquals("", c.assert.assertRender());
        i.showNextPage();
        assertEquals("", c.assert.assertRender());
        i.showNextPage();
        assertEquals("", c.assert.assertRender());
        i.showNextPage();
        assertEquals("", c.assert.assertRender());
        i.showNextPage();
        assertEquals("", c.assert.assertRender());
        i.showPrevPage();
        assertEquals("", c.assert.assertRender());

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
        assertEquals("Should first element only.", "mattiasmarcus", c.assert.assertRender());
        i = c.getIterator("userListIter");
        assertEquals(3, i.getPageCount());
        i.showPage(1);
        assertEquals("Should first element only.", "johanbutters", c.assert.assertRender());

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
        assertEquals("Should first element only.", "mattiasmarcus", c.assert.assertRender());
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
        assertEquals("Should first element only.", "mattiasmarcus", c.assert.assertRender());
        assertObject(i = c.getIterator("userListIter"));
        assertEquals(3, i.getPageCount());
        assertEquals("getIndexForItem() should work.", 2, i.getIndexForItem("johan"));
        i.showPageWithItem("johan");
        assertEquals("Should first element only.", "johanbutters", c.assert.assertRender());
        i.showPageWithItem("butters");
        assertEquals("Should first element only.", "johanbutters", c.assert.assertRender());
        i.showPageWithItem("stan");
        assertEquals("Should first element only.", "stan", c.assert.assertRender());
        i.showPageWithItem("marcus");
        assertEquals("Should first element only.", "mattiasmarcus", c.assert.assertRender());

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
        assertEquals("mattiasmarcus", c.assert.assertRender());
        assertObject(i = c.getIterator("userListIter"));
        assertEquals(3, i.getPageCount());

        /* getIndexForItemWhere() */

        assertEquals("getIndexForItemWhere() should work.", 3, i.getIndexForItemWhere(function(item) {
            return item.age == 6;
        }));

        assertEquals("getIndexForItemWhere() should work.", 0, i.getIndexForItemWhere(function(item) {
            return item.selected == true;
        }));

        assertEquals("getIndexForItemWhere() should work.", 0, i.getIndexForItemWhere(function(item) {
            return item.age == 32;
        }));

        /* showPageWithItemIndex() */

        i.showPageWithItemIndex(-1);
        assertEquals("mattiasmarcus", c.assert.assertRender());

        i.showPageWithItemIndex(0);
        assertEquals("mattiasmarcus", c.assert.assertRender());

        i.showPageWithItemIndex(1);
        assertEquals("mattiasmarcus", c.assert.assertRender());

        i.showPageWithItemIndex(2);
        assertEquals("johanbutters", c.assert.assertRender());

        i.showPageWithItemIndex(3);
        assertEquals("johanbutters", c.assert.assertRender());

        i.showPageWithItemIndex(4);
        assertEquals("stan", c.assert.assertRender());

        i.showPageWithItemIndex(5);
        assertEquals("stan", c.assert.assertRender());

        i.showPageWithItemIndex(6);
        assertEquals("stan", c.assert.assertRender());

        /* showPageWithItemWhere() */

        i.showPageWithItemWhere(function(item) {
            return item.age == 6;
        });
        assertEquals("johanbutters", c.assert.assertRender());

        i.showPageWithItemWhere(function(item) {
            return item.age == 8;
        });
        assertEquals("stan", c.assert.assertRender());

        i.showPageWithItemWhere(function(item) {
            return item.age == 32;
        });
        assertEquals("mattiasmarcus", c.assert.assertRender());

        i.showPageWithItemWhere(function(item) {
            return item.age == 31;
        });
        assertEquals("johanbutters", c.assert.assertRender());

        i.showPageWithItemWhere(function(item) {
            return item.selected == true;
        });
        assertEquals("mattiasmarcus", c.assert.assertRender());


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
        assertEquals(3, i.getPageCount());
        assertEquals("Should be on first page.", true, i.isOnFirstPage());
        assertEquals("Should NOT be on last page.", false, i.isOnLastPage());
        assertEquals("Is on first OR last page, since we are on first.", true, i.isOnFirstOrLastPage());
        assertEquals("Is NOT on first AND last page, since we are on first only.", false, i.isOnFirstAndLastPage());

        /* Then second page */

        i.showNextPage();
        assertEquals(3, i.getPageCount());
        assertEquals("Should NOT be on first page.", false, i.isOnFirstPage());
        assertEquals("Should NOT be on last page.", false, i.isOnLastPage());
        assertEquals("Is NOT on first OR last page, since we are on first.", false, i.isOnFirstOrLastPage());
        assertEquals("Is NOT on first AND last page, since we are on first only.", false, i.isOnFirstAndLastPage());

        /* Then third and last page */

        i.showNextPage();
        assertEquals(3, i.getPageCount());
        assertEquals("Should NOT be on first page.", false, i.isOnFirstPage());
        assertEquals("Should be on last page.", true, i.isOnLastPage());
        assertEquals("Is on first OR last page, since we are on last.", true, i.isOnFirstOrLastPage());
        assertEquals("Is NOT on first AND last page, since we are on first only.", false, i.isOnFirstAndLastPage());

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
        assertEquals(1, i.getPageCount());
        assertEquals("Should be on first page.", true, i.isOnFirstPage());
        assertEquals("Should be on last page.", true, i.isOnLastPage());
        assertEquals("Is on first OR last page, since we are on first.", true, i.isOnFirstOrLastPage());
        assertEquals("Is on first AND last page.", true, i.isOnFirstAndLastPage());

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

        assertEquals(3, i.getPageCount());
        assertEquals(0, i.getCurrentPage());

        assertEquals(0, i.getFirstIndexForCurrentPage());
        assertEquals(1, i.getLastIndexForCurrentPage());
        i.showNextPage();
        assertEquals(2, i.getFirstIndexForCurrentPage());
        assertEquals(3, i.getLastIndexForCurrentPage());
        i.showNextPage();
        assertEquals(4, i.getFirstIndexForCurrentPage());
        assertEquals(5, i.getLastIndexForCurrentPage());
        i.showNextPage();
        assertEquals(4, i.getFirstIndexForCurrentPage());
        assertEquals(5, i.getLastIndexForCurrentPage());

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

        assertEquals(3, i.getPageCount());
        assertEquals(0, i.getCurrentPage());

        assertEquals("mattias", i.getFirstItemOnCurrentPage());
        assertEquals("marcus", i.getLastItemOnCurrentPage());
        i.showNextPage();
        assertEquals("must", i.getFirstItemOnCurrentPage());
        assertEquals("johan", i.getLastItemOnCurrentPage());
        i.showNextPage();
        assertEquals("kurt", i.getFirstItemOnCurrentPage());
        assertEquals("korv", i.getLastItemOnCurrentPage());
        i.showNextPage();
        assertEquals("kurt", i.getFirstItemOnCurrentPage());
        assertEquals("korv", i.getLastItemOnCurrentPage());

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
        assertEquals(0, i.getPageCount());
        assertEquals(0, i.getCurrentPage());
        i.showNextPage();
        assertEquals(1, i.getCurrentPage());
        assertEquals("Should contain page 2.", "mustjohan", c.assert.assertRender());

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
        assertEquals("No page count yet, since there is no model.", 0, i.getPageCount());
        assertEquals("Current page starts at 0.", 0, i.getCurrentPage());
        assertExceptionQunit(function() {
            i.showPageWithItemWhere(function(item) {
                return item == "must";
            });
        }, "Should throw exception, it cannot lookup the item on the list, since the list is still undefined.");

        i.setModel(model.list);
        i.showPageWithItemWhere(function(item) {
            return item == "must";
        });

        assertEquals(1, i.getCurrentPage());
        assertEquals("Should contain second page.", "mustjohan", c.assert.assertRender());

        i.showNextPage();
        assertEquals(1, i.getCurrentPage());
        assertEquals("Should contain page 2.", "mustjohan", c.assert.assertRender());
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
        assertEquals("Should be 1 first.", 1, a);
        assertEquals("Should first element only.", "mattias", c.assert.assertRender());
        assertObject(i = c.getIterator("userListIter"));
        assertEquals(5, i.getPageCount());
        assertEquals("Should be 2 after callback has run.", 2, a);

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
        assertEquals("Should be 1 first.", 1, a);
        assertEquals("Should first element only.", "mattias", c.assert.assertRender());
        assertObject(i = c.getIterator("userListIter"));
        assertEquals(5, i.getPageCount());
        assertEquals("Should be 1 after callback has run.", 1, a);
        i.showNextPage();
        assertEquals("Should first element only.", "marcus", c.assert.assertRender());
        assertEquals("Should be 2 after callback has run.", 2, a);


        a = 1;
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
            viewHtml : "{{ niter userListIter list }}{{ show }}{{ endniter }}"});

        assertEquals("Should be 1 first.", 1, a);
        assertEquals("Should first element only.", "mattiasmarcusjohan", c.assert.assertRender());
        assertObject(i = c.getIterator("userListIter"));
        assertEquals(2, i.getPageCount());
        assertEquals("Should be 2 after callback has run.", 2, a);
        i.showNextPage();
        assertEquals("Should first element only.", "buttersstan", c.assert.assertRender());
        assertEquals("Should be 3 after callback has run.", 3, a);

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
        assertEquals("Should be 1 first.", 1, a);
        assertEquals("Should first element only.", "mattiasmarcusjohan", c.assert.assertRender());
        assertEquals(2, i.getPageCount());
        assertEquals("Should be 2 after callback has run.", 2, a);
        i.showNextPage();
        assertEquals("Should first element only.", "buttersstan", c.assert.assertRender());
        assertEquals("Should be 3 after callback has run.", 3, a);


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
        assertEquals("Should be 2 first.", 2, a);
        assertEquals("Should first element only.", "mattias", c.assert.assertRender());
        assertObject(i = c.getIterator("userListIter"));
        assertEquals(5, i.getPageCount());
        assertEquals("Should be on page 0.", 0, i.getCurrentPage());
        assertEquals("Should be on first page.", true, i.isOnFirstPage());
        assertEquals("Should NOT be on last page.", false, i.isOnLastPage());
        assertEquals("Should still be 2 after callback has run.", 2, a);

        i.showPrevPage();
        c.assert.assertRender();
        assertEquals("Should not go past page 0.", 0, i.getCurrentPage());
        assertEquals(5, i.getPageCount());

        i.showNextPage();
        c.assert.assertRender();
        assertEquals("Should be on page 1.", 1, i.getCurrentPage());
        assertEquals("Should still be 2.", 2, a);
        assertEquals("Should NOT be on first page.", false, i.isOnFirstPage());
        assertEquals("Should NOT be on last page.", false, i.isOnLastPage());

        i.showNextPage();
        c.assert.assertRender();
        assertEquals("Should be on page 2.", 2, i.getCurrentPage());
        assertEquals("Should still be 2.", 2, a);
        assertEquals("Should NOT be on first page.", false, i.isOnFirstPage());
        assertEquals("Should NOT be on last page.", false, i.isOnLastPage());

        i.showNextPage();
        c.assert.assertRender();
        assertEquals("Should be on page 3.", 3, i.getCurrentPage());
        assertEquals("Should still be 2.", 2, a);
        assertEquals("Should NOT be on first page.", false, i.isOnFirstPage());
        assertEquals("Should NOT be on last page.", false, i.isOnLastPage());

        i.showNextPage();
        c.assert.assertRender();
        assertEquals("Should be on page 4.", 4, i.getCurrentPage());
        assertEquals(5, i.getPageCount());
        assertEquals("Should now be 3.", 3, a);
        assertEquals("Should NOT be on first page.", false, i.isOnFirstPage());
        assertEquals("Should be on last page.", true, i.isOnLastPage());

        i.showNextPage();
        c.assert.assertRender();
        assertEquals("Should not go past page 4.", 4, i.getCurrentPage());
        assertEquals(5, i.getPageCount());

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
        assertEquals("Should be 22 first.", 22, a);
        assertEquals("Should first element only.", "mattiasmarcusjohanbuttersstan", c.assert.assertRender());
        assertObject(i = c.getIterator("userListIter"));
        assertEquals(1, i.getPageCount());
        assertEquals("Should be on page 0.", 0, i.getCurrentPage());
        assertEquals("Should be 3.", 3, a);

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
        assertEquals("Should be 22 first.", 22, a);
        assertEquals("Should first element only.", "mattiasmarcusjohanbuttersstan", c.assert.assertRender());
        assertObject(i = c.getIterator("userListIter"));
        assertEquals(1, i.getPageCount());
        assertEquals("Should be on page 0.", 0, i.getCurrentPage());
        assertEquals("Should be 3.", 3, a);

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
        assertEquals("Should be 22 first.", 22, a);
        assertEquals("Should first element only.", "mattiasmarcusjohanbuttersstan", c.assert.assertRender());
        assertObject(i = c.getIterator("userListIter"));
        assertEquals(1, i.getPageCount());
        assertEquals("Should be on page 0.", 0, i.getCurrentPage());
        assertEquals("Should be 3.", 3, a);

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
        assertEquals("Should be 22 first.", 22, a);
        assertEquals("Should first element only.", "mattiasmarcusjohanbuttersstan", c.assert.assertRender());
        assertObject(i = c.getIterator("userListIter"));
        assertEquals(1, i.getPageCount());
        assertEquals("Should be on page 0.", 0, i.getCurrentPage());
        assertEquals("Should be 3.", 3, a);

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
        assertEquals("Should be 22 first.", 22, a);
        assertEquals("Should first element only.", "mattiasmarcus", c.assert.assertRender());
        assertObject(i = c.getIterator("userListIter"));
        assertEquals(3, i.getPageCount());
        assertEquals("Should be on page 0.", 0, i.getCurrentPage());
        assertEquals("Should be 22.", 22, a);
        i.showNextPage();
        c.assert.assertRender();
        assertEquals("Should be on page 1.", 1, i.getCurrentPage());
        assertEquals(3, i.getPageCount());
        assertTrueQunit(!i.isOnFirstOrLastPage(), "Should not be isOnFirstOrLastPage");
        assertEquals("Should now be 77.", 77, a);

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
        assertEquals("Should be 22 first.", 22, a);
        assertEquals("Should first element only.", "mattiasmarcus", c.assert.assertRender());
        assertObject(i = c.getIterator("userListIter"));
        assertEquals(3, i.getPageCount());
        assertEquals("Should be on page 0.", 0, i.getCurrentPage());
        assertEquals("Should be 77.", 77, a);
        c.setModel({list : []});
        assertEquals("Should be 77.", 77, a);
        assertEquals("Empty since the list is empty.", "", c.assert.assertRender());
        assertEquals("Should be 88.", 88, a);
        assertEquals(0, i.getPageCount());
        assertEquals("Should be on page 0.", 0, i.getCurrentPage());
        assertEquals("Should be 88.", 88, a);

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

        assertEquals("Should first element only.", "mattiasmarcus", c.assert.assertRender());

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

        assertEquals("Should first element only.", "mattiasmarcusjohan", c.assert.assertRender());

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

        assertEquals("Should first element only.", "mattiasmarcusjohan", c.assert.assertRender());

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

        assertEquals("Should first element only.", "mattiasmarcusjohan", c.assert.assertRender());

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

        assertEquals("Should first element only.", "buttersstan", c.assert.assertRender());

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

        assertEquals("Should contain stan only.", "stan", c.assert.assertRender());

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

        assertEquals("Should be empty.", "", c.assert.assertRender());

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

        assertEquals("Should be empty.", "mattias", c.assert.assertRender());
        i = c.getIterator("filteredUserListIter");
        assertEquals("3 pages when there are 3 items after where has been applied.", 3, i.getPageCount());

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

        assertEquals("Should be empty.", "", c.assert.assertRender());
        i = c.getIterator("filteredUserListIter");
        assertEquals("0 page when there are 0 items.", 0, i.getPageCount());


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

        assertEquals("Start state.", "mattiasmarcus", c.assert.assertRender());
        assertObject("Iterator should exist.", i = c.getIterator("filteredUserListIter"));

        // Go to page 2/2
        i.showNextPage();
        assertEquals("Second page.", "johan", c.assert.assertRender());

        // Now change model, so that we only have 1 item in the list, and thus, only one page!
        model.list[2].age = 13;
        model.list[3].age = 14;

        assertEquals("Second page.", "mattias", c.assert.assertRender());

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

        assertEquals("Should be empty.", "mattias", c.assert.assertRender());
        assertObject("Iterator should exist", i = c.getIterator("list"));
        assertEquals("3 pages when there are 3 items after where has been applied.", 3, i.getPageCount());

        assertExceptionQunit(function() {
            i.getPageWithItem(model.list[-1]);
        }, "Item -1 never exists, so should throw exception.");
        assertEquals("Item 0 should be on page 0.", 0, i.getPageWithItem(model.list[0]));
        assertExceptionQunit(function() {
            i.getPageWithItem(model.list[1]);
        }, "Item 2 should be on NO page.");
        assertEquals("Item 2 should be on page 1.", 1, i.getPageWithItem(model.list[2]));
        assertEquals("Item 3 should be on page 2.", 2, i.getPageWithItem(model.list[3]));
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