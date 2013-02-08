function mcomponent(args) {

    args = args || {};

    var startTagToken = "{{";
    var endTagToken = "}}";
    var that = this;
    var list;
    var result = {};

    var id = args.id || Math.floor(Math.random() * 1000); // Used for testing only
    var rootModel;

    var mainArgs = args;

    /************************************************************
     * Arguments and their default values
     ************************************************************/

    args.viewHtml = args.viewHtml || undefined;
    args.viewFromComponent = args.viewFromComponent || undefined;
    args.model = args.model || undefined;
    args.clipboard = args.clipboard || {};
    args.children = args.children || {};
    args.iter = args.iter || {};
    args.maxTagCount = args.maxTagCount || 1000;
    args.logTags = args.logTags !== undefined ? args.logTags : false;
    args.afterRender = args.afterRender || undefined;

    /************************************************************
     * Arguments used for testing purposes only
     ************************************************************/

    args.throwOnError = args.throwOnError !== undefined ? args.throwOnError : false;
    args.debugEnabled = args.debugEnabled ? true : false;

    var validateChild = function(id, child) {
        if (id.indexOf(" ") >= 0) {
            return { result : false, message : "Child id contains space. Must be alphanumeric. id = '" + id + "'"};
        } else if (/[^a-zA-Z0-9]/.test(id)) {
            return { result : false, message : "Child id is not alphanumeric. Must be alphanumeric. id = '" + id + "'"};
        } else if (typeof child._.isComponent !== "function") {
            return { result : false, message : "Child is not an mcomponent object."};
        } else if (!child._.isComponent()) {
            return { result : false, message : "Child is not an mcomponent object."};
        }
        return { result : true };
    };

    /************************
     * Error message helpers
     ************************/

    var renderErrorToString = function(error) {
        return "Error at tag " + startTagToken + " " + error.tag + " " + endTagToken + ": " + error.message;
    };

    var compileErrorToString = function(error) {
        return "Error compiling tag " + startTagToken + " " + error.tag + " " + endTagToken + (error.message ? ": " + error.message : "");
    };

    var createGenericCompileErrorMessage = function(e) {
        return "Error compiling view, view is not formatted correctly, please check your tags: " + e.toString();
    };

    var createCompileExceptionMessage = function(text, tag) {
        var tagText = tag.tag.tag ? tag.tag.tag : tag.tag;
        return "Error compiling tag " + startTagToken + " " + tagText + " " + endTagToken + ": " + text;
    };

    /**
     * Throws exception, only if throwOnError is true.
     * @param e
     */
    var throwError = function(e) {
        if (mainArgs.throwOnError) throw e;
    };

    /***************************
     * Init code
     ***************************/

    var init = function() {

        if (args.model) {
            rootModel = args.model;
            _setModel(rootModel);
        }

        for (var iteratorName in args.iter) {
            var extConfig = args.iter[iteratorName];
            // Make new config object, so that we don't share with external scope.
            var config = {};
            config.usePages = extConfig.usePages ? true : false;
            config.itemsPerPage = extConfig.itemsPerPage || 10;
            config.whenAllItemsAreShowing = extConfig.whenAllItemsAreShowing || function() {
            };
            config.whenNotAllItemsAreShowing = extConfig.whenNotAllItemsAreShowing || function() {
            };
            config.whenFirstOrLastPageIsShowing = extConfig.whenFirstOrLastPageIsShowing || function() {
            };
            config.whenNotFirstOrLastPageIsShowing = extConfig.whenNotFirstOrLastPageIsShowing || function() {
            };
            config.whenFirstAndLastPageIsShowing = extConfig.whenFirstAndLastPageIsShowing || function() {
            };
            config.whenFirstPageIsShowing = extConfig.whenFirstPageIsShowing || function() {
            };
            config.whenLastPageIsShowing = extConfig.whenLastPageIsShowing || function() {
            };
            config.whenNotFirstPageIsShowing = extConfig.whenNotFirstPageIsShowing || function() {
            };
            config.whenNotLastPageIsShowing = extConfig.whenNotLastPageIsShowing || function() {
            };
            config.whenThereAreItems = extConfig.whenThereAreItems || function() {
            };
            config.whenThereAreNoItems = extConfig.whenThereAreNoItems || function() {
            };
            config.where = extConfig.where || undefined;
            executionContext.createIterator(iteratorName, config);
        }

        for (var id in args.clipboard) {
            var html = args.clipboard[id];
            var list = undefined;
            var tree = undefined;

            try {
                executionContext.setClipboardWithName(id, buildTree(buildList(html)));
            } catch (e) {
                executionContext.setClipboardErrorWithName(id, e);
                throwError("Failed to add clipboard with id = '" + id + "': " + e.toString());
            }
        }

        for (var id in args.children) {
            var child = args.children[id];
            var v = validateChild(id, child);
            if (!v.result) {
                throw v.message;
            }
        }

        // Set view, do this last since it also compiles the view!
        if (args.viewHtml) {
            _setViewWithHtml(args.viewHtml);
        } else if (args.viewFromComponent) {
            _setViewFromComponent(args.viewFromComponent);
        } else {
            // No view specified in constructor args.
        }

    };

    /***************************
     * Compilation context
     ***************************/

    var CompilationContext_ = function() {

        var that = this;

        this.successfullyCompiledTags = [];
        this.compileError = undefined;

        this.addSuccessfullyCompiledTag = function(tag) {
            this.successfullyCompiledTags.push(tag);
        };

        this.getSuccessfullyCompiledTags = function() {
            return this.successfullyCompiledTags;
        };

        this.clearCompileError = function() {
            this.compileError = undefined;
        };

        this.setCompileError = function(msg) {
            this.compileError = msg;
        };

        this.getCompileError = function() {
            return this.compileError;
        };

        this.hasCompileError = function() {
            return this.compileError ? true : false;
        };
    };

    /*********************************************************************************
     * Global reference to compilation context.
     * We need this for the public interface for template,
     * which does not have access to locally scoped context objects.
     *********************************************************************************/

    var globalCompilationContext = undefined;

    /***************************
     * Execution context
     ***************************/

    var ExecutionContext_ = function() {

        this.id = id;
        this.executionStack = []; // DO NOT RENAME THIS VARIABLE. Compiled code is dependant on this name.
        this.children = mainArgs.children;
        this.globals = {};
        this.clipboard = {};
        this.clipboardError = {}; // If adding a clipboard failed, the error will be inserted here.
        this.iterators = {};
        this.renderResult = [];
        this.renderErrors = [];
        this.currentTag = {};
        this.iteratorsToUpdateAfterRender = [];

        var that = this;

        this.makeReadyForRender = function() {
            this.globals = {};
            this.renderResult = [];
            this.renderErrors = [];
            this.currentTag = {};
        };

        this.beforeRender = function() {
            for (var id in this.iterators) {
                var iterObj = this.iterators[id];
                iterObj.beforeRender();
            }
        };

        this.afterRender = function() {
            // Update iterators. This was previously done while rendering, but we want to render, place result in DOM and finally run this.
            for (var i = 0; i < this.iteratorsToUpdateAfterRender.length; i++) {
                var iterObj = this.iteratorsToUpdateAfterRender[i];
                iterObj.iterator.renderUpdate(iterObj.start, iterObj.end);
            }
        };

        this.pushCurrentRenderError = function(message) {
            this.addRenderError(message, this.currentTag.name);
        };

        this.addRenderError = function(message, tagName) {
            var error = {
                message : message,
                tag : tagName
            };
            this.renderErrors.push(error);
            this.renderResult.push(renderErrorToString(error));

            if (args.throwOnError) {
                throw renderErrorToString(error);
            }
        };

        this.hasRenderErrors = function() {
            return this.renderErrors.length ? true : false;
        };

        /**
         * Children
         */

        this.getChildCount = function() {
            var counter = 0;
            for (var id in this.children) counter++;
            return counter;
        };

        this.getChildWithId = function(id) {
            return this.children[id];
        };

        this.addChild = function(id, child) {
            var v = validateChild(id, child);
            if (v.result) {
                this.children[id] = child;
            } else {
                throw "Error trying to add child: " + v.message;
            }
        };

        this.hasChildWithId = function(id) {
            return this.children[id] ? true : false;
        };

        this.removeChildWithId = function(id) {
            this.children[id] = undefined;
        };

        this.removeAllChildren = function() {
            this.children = {};
        };

        this.getChildren = function() {
            return this.children;
        };

        /**
         * Clipboard
         */

        this.getClipboards = function() {
            return this.clipboard;
        };

        this.getClipboardWithName = function(name) {
            return this.clipboard[name];
        };

        this.getClipboardErrorWithName = function(name) {
            return this.clipboardError[name];
        };

        this.setClipboardWithName = function(name, val) {
            this.clipboard[name] = val;
        };

        this.setClipboardErrorWithName = function(name, val) {
            this.clipboardError[name] = val;
        };

        /**
         * Iterator configs
         */

        this.getIteratorConfigForId = function(id) {
            if (this.iterators[id] == undefined) throw "Trying to get config for iterator (id=" + id + "), but there is no iterator with that id.";
            return this.iterators[id].getConfig();
        };

        /**
         * Iterators
         */

        this.getIteratorWithName = function(iteratorName) {
            return this.iterators[iteratorName];
        };

        this.setIteratorWithName = function(iteratorName, val) {
            this.iterators[iteratorName] = val;
        };

        this.getIterators = function() {
            return this.iterators;
        };

        this.createIterator = function(iteratorName, iteratorConfig) {
            this.iterators[iteratorName] = new IteratorContext_(iteratorName, iteratorConfig);
        };

        this.ensureIteratorExistsAndSetModel = function(iteratorName, model) {
            var i = this.getIteratorWithName(iteratorName);
            if (i) {
                i.setModel(model);
                return i;
            } else {
                this.pushCurrentRenderError("Trying to use iterator, but no iterator configuration with name '" + iteratorName + "' exists.");
                return undefined;
            }
        };

        this.clearIterators = function() {
            for (var iteratorName in this.iterators) {
                this.iterators[iteratorName].clear();
            }
        };

        /**
         * Looks up a property name, such as "user.name.first" on stack.
         * If undefined is found, it will keep looking, but return undefined if no value is found further up the model stack.
         * @param name
         */
        this.lookup = function(name) {

            var value = undefined;
            var foundValue = false;
            var stack = this.executionStack;

            var parentPrefixResult = findParentPrefix(name);

            // Check if parent prefix goes outside of stack range.
            if (parentPrefixResult.count > 0) {
                if (parentPrefixResult.count >= stack.length) {
                    throw "Trying to lookup '" + name + "', but stack is smaller than that (" + stack.length + ").";
                }
            }

            if (this.getStackSize() > 0) {

                try {
                    value = this.lookupModelInStack(name, parentPrefixResult);
                    foundValue = true;
                } catch (e) {
                    // Handle any exception.
                }

                // If we found a value, return it.
                if (value !== undefined) return value;

            }


            // Only create expression function if there is no "../" prefix.
            if (parentPrefixResult.count == 0) {
                var f = createExpressionFunction(name);
                try {
                    value = this.runFunction(f);
                    foundValue = true;
                } catch (e) {
                }
            }

            if (!foundValue) throw "Unable to lookup property on model stack: " + name;
            return value;
        };

        /**
         * Looks up a property name (such as "user.name.first") on the model stack.
         * If undefined is found, it will keep looking for a value, but return undefined if no value is found.
         * If nothing is found at all, it throws an exception.
         * @param name
         * @param parentPrefixResult
         */
        this.lookupModelInStack = function(name, parentPrefixResult) {
            parentPrefixResult = parentPrefixResult || {};
            parentPrefixResult.count = parentPrefixResult.count || 0;
            var nameToLookup = parentPrefixResult.name || name;
            var stack = this.executionStack;
            var value = undefined;
            var foundValue = false;

            for (var i = stack.length - 1 - parentPrefixResult.count; i >= 0; i--) {
                var model = stack[i].model;
                try {
                    value = lookup(nameToLookup, model);
                    foundValue = true;
                } catch (e) {
                }
                if (value !== undefined) return value;
            }
            if (!foundValue) throw "Unable to lookup model property in model stack: " + nameToLookup;
            return value;
        };

        /*
         TODO:
         1. Make sure that all tests work. Some don't for some reason.
         2. Update lookupContextInStack to use same mechanics, and update all usages to handle the exception thrown when not finding anything.
         */

        this.lookupContextInStack = function(name) {
            var stack = this.executionStack;
            var value = undefined;
            var foundValue;
            for (var i = stack.length - 1; i >= 0; i--) {
                var model = stack[i].context;
                try {
                    value = lookup(name, model);
                    foundValue = true;
                } catch (e) {
                }
                if (value !== undefined) return value;
            }
            if (!foundValue) throw "Unable to lookup context property in model stack: " + name;
            return value;
        };

        this.getStackItem = function(i) {
            return this.executionStack[i];
        };

        this.getStackSize = function() {
            return this.executionStack.length;
        };

        /**
         * This is the "api" object that is available in tags.
         * @return {{lookup: Function, getRootModel: Function, getIterator: Function, _assert: {componentIdEqualsExecutionContextId: Function, getExecutionContext: Function, childCount: Function}}}
         */
        this.getTagApi = function() {
            var that = this;
            return {
                lookup : function(name) {
                    try {
                        return that.lookup(name);
                    } catch (e) {
                        return undefined;
                    }
                },
                getRootModel : function() {
                    return that.executionStack[0].model;
                },
                getIterator : function(iteratorName) {
                    var i = executionContext.getIteratorWithName(iteratorName);
                    return i ? i.getPublicInterface() : undefined;
                },
                _assert : {
                    componentIdEqualsExecutionContextId : function() {
                        return id == executionContext.id ?
                            true :
                            id + " != " + executionContext.id;
                    },
                    getExecutionContext : function() {
                        return executionContext;
                    },
                    childCount : function(expectedCount) {
                        var got = executionContext.getChildCount();
                        if (got !== expectedCount) throw "Wrong number of children. Expected " + expectedCount + ", got " + got + ".";
                    }
                }
            }
        };

        this.runFunction = function(f) {
            return f.apply(this, [this.getModel(), this.getContext(), this.getGlobals(), this.getTagApi()]);
        };

        this.clear = function() {
            this.executionStack = [];
            this.globals = [];
        };

        this.getModel = function() {
            if (this.executionStack.length == 0) return undefined;
            return this.executionStack[this.executionStack.length - 1].model;
        };

        this.getContext = function() {
            if (this.executionStack.length == 0) return undefined;
            return this.executionStack[this.executionStack.length - 1].context;
        };

        this.getGlobals = function() {
            return this.globals;
        };

        this.push = function(stackItem) {
            if (stackItem === undefined) throw "Trying to push undefined to execution stack.";
            this.executionStack.push(stackItem);
            this.updateLocalState();
        };

        this.pushModel = function(model) {
            this.executionStack.push({model : model});
            this.updateLocalState();
        };

        this.pop = function() {
            if (this.executionStack.length == 0) throw "Trying to pop execution stack, but it is already empty.";
            var v = this.executionStack.pop();
            this.updateLocalState();
            return v;
        };

        this.peek = function() {
            return this.executionStack[this.executionStack.length - 1];
        };

        this.updateLocalState = function() {
            this.model = this.getModel();
            this.context = this.getContext();
        };
    };

    var executionContext = new ExecutionContext_();

    /****************************
     * Iterator context
     ****************************/

    var IteratorContext_ = function(aIteratorName, iterConfig) {

        var iteratorName = aIteratorName;
        var model = undefined;
        var config = iterConfig;
        var itemsShowing = config.itemsPerPage;
        var currentPage = 0;
        var showingAllItems = false;
        var whereFunction = config.where;

        var setModel = function(m) {
            model = m;
        };

        this.setModel = function(m) {
            setModel(m);
        };

        var getModel = function() {
            return model;
        };

        var hasModel = function() {
            return model ? true : false;
        };

        var getModelLength = function() {
            return model ? model.length : 0;
        };

        /**
         * Clears the iterator. This is run when the model of the component is changed.
         */
        this.clear = function() {
            // TODO How much must be cleared??
            itemsShowing = config.itemsPerPage;
            currentPage = 0;
            showingAllItems = false;
        };

        this.getConfig = function() {
            return config;
        };

        this.getStart = function() {
            if (config.usePages) {
                return currentPage * config.itemsPerPage;
            } else {
                return 0;
            }
        };

        this.getEnd = function() {
            if (config.usePages) {
                return currentPage * config.itemsPerPage + config.itemsPerPage;
            }
            else {
                return itemsShowing;
            }
        };

        this.beforeRender = function() {
            if (whereFunction) {
                // If there is a where-function, the list might have changed before rendering. Ensure we don't overflow the page.
                currentPage = ensurePageIsWithinLimits(currentPage);
            }
        };

        this.renderUpdate = function(start, end) {
            if (!config.usePages) {
                if (this.getStart() == 0 && this.getEnd() >= getModelLength()) {
                    if (typeof config.whenAllItemsAreShowing === "function") {
                        showingAllItems = true;
                        config.whenAllItemsAreShowing(this.getPublicInterface());
                    } else {
                        throw "Iterator '" + config.name + "' whenAllItemsAreShowing is not a function.";
                    }
                } else {
                    if (typeof config.whenNotAllItemsAreShowing === "function") {
                        showingAllItems = false;
                        config.whenNotAllItemsAreShowing(this.getPublicInterface());
                    } else {
                        throw "Iterator '" + config.name + "' whenNotAllItemsAreShowing is not a function.";
                    }
                }
            } else {

                // Using pages, run pages callbacks.

                if (typeof config.whenFirstOrLastPageIsShowing === "function") {
                    if (isOnFirstOrLastPage()) config.whenFirstOrLastPageIsShowing(this.getPublicInterface());
                } else {
                    throw "Iterator '" + config.name + "' whenFirstOrLastPageIsShowing is not a function.";
                }

                if (typeof config.whenNotFirstOrLastPageIsShowing === "function") {
                    if (!isOnFirstOrLastPage()) config.whenNotFirstOrLastPageIsShowing(this.getPublicInterface());
                } else {
                    throw "Iterator '" + config.name + "' whenNotFirstOrLastPageIsShowing is not a function.";
                }

                if (typeof config.whenFirstAndLastPageIsShowing === "function") {
                    if (isOnFirstAndLastPage()) config.whenFirstAndLastPageIsShowing(this.getPublicInterface());
                } else {
                    throw "Iterator '" + config.name + "' whenFirstAndLastPageIsShowing is not a function.";
                }

                if (typeof config.whenFirstPageIsShowing === "function") {
                    if (isOnFirstPage()) config.whenFirstPageIsShowing(this.getPublicInterface());
                } else {
                    throw "Iterator '" + config.name + "' whenFirstPageIsShowing is not a function.";
                }

                if (typeof config.whenLastPageIsShowing === "function") {
                    if (isOnLastPage()) config.whenLastPageIsShowing(this.getPublicInterface());
                } else {
                    throw "Iterator '" + config.name + "' whenLastPageIsShowing is not a function.";
                }

                if (typeof config.whenNotFirstPageIsShowing === "function") {
                    if (!isOnFirstPage()) config.whenNotFirstPageIsShowing(this.getPublicInterface());
                } else {
                    throw "Iterator '" + config.name + "' whenNotFirstPageIsShowing is not a function.";
                }

                if (typeof config.whenNotLastPageIsShowing === "function") {
                    if (!isOnLastPage()) config.whenNotLastPageIsShowing(this.getPublicInterface());
                } else {
                    throw "Iterator '" + config.name + "' whenNotLastPageIsShowing is not a function.";
                }

                if (typeof config.whenThereAreItems === "function") {
                    if (hasModel() && getModelLength()) config.whenThereAreItems(this.getPublicInterface());
                } else {
                    throw "Iterator '" + config.name + "' whenThereAreItems is not a function.";
                }

                if (typeof config.whenThereAreNoItems === "function") {
                    if (!hasModel() || !getModelLength()) config.whenThereAreNoItems(this.getPublicInterface());
                } else {
                    throw "Iterator '" + config.name + "' whenThereAreItems is not a function.";
                }

            }
        };

        var isOnFirstPage = function() {
            return currentPage == 0;
        };

        var isOnLastPage = function() {
            return currentPage == getPageCount() - 1;
        };

        var isOnFirstOrLastPage = function() {
            return isOnFirstPage() || isOnLastPage();
        };

        var isOnFirstAndLastPage = function() {
            return isOnFirstPage() && isOnLastPage();
        };

        var getFirstIndexForCurrentPage = function() {
            return currentPage * config.itemsPerPage;
        };

        /**
         * Returns last index for current page, but it takes the model into concideration.
         * If page shows items 5-9, but the model only has 7 items, then it returns 7.
         * @return {Number}
         */
        var getLastIndexForCurrentPage = function() {
            var pageEndIndex = currentPage * config.itemsPerPage + config.itemsPerPage - 1;
            return hasModel() ? Math.min(pageEndIndex, getFilteredModel().length) : pageEndIndex;
        };

        var getFirstItemOnCurrentPage = function() {
            if (!hasModel()) throw "Iterators getFirstItemOnCurrentPage() function can not be used before the iterator has been assigned a model. Do this by rendering the view, or by running setModel() on iterator manually.";
            return getFilteredModel()[getFirstIndexForCurrentPage()];
        };

        var getLastItemOnCurrentPage = function() {
            if (!hasModel()) throw "Iterators getLastItemOnCurrentPage() function can not be used before the iterator has been assigned a model. Do this by rendering the view, or by running setModel() on iterator manually.";
            return getFilteredModel()[getLastIndexForCurrentPage()];
        };

        /**
         * Calculates number of pages for iterator. Empty model will have 0 pages.
         * @return {Number}
         */
        var getPageCount = function() {
            if (!hasModel()) return 0;
            var s;
            if (whereFunction) {
                // We have a where-function, we need to use it when counting pages.
                s = 0;
                for (var i = 0; i < model.length; i++) {
                    if (whereFunction(model[i])) {
                        s++;
                    }
                }
            } else {
                s = model.length;
            }
            return Math.ceil(s / config.itemsPerPage);
        };

        var getFilteredModel = function() {
            var filteredModel = [];
            if (!whereFunction) return model;
            for (var i = 0; i < model.length; i++) {
                if (whereFunction(model[i])) {
                    filteredModel.push(model[i]);
                }
            }
            return filteredModel;
        };

        var ensurePageIsWithinLimits = function(pageIndex) {
            if (!hasModel()) return pageIndex;
            var pageCount = getPageCount();
            if (pageIndex >= pageCount) pageIndex = pageCount - 1;
            if (pageIndex < 0) pageIndex = 0;
            return pageIndex;
        };

        this.getPublicInterface = function() {

            return {

                showingAllItems : showingAllItems,
                currentPage : currentPage,
                itemsShowing : Math.min(getModelLength(), itemsShowing),
                itemsPerPage : config.itemsPerPage,
                itemsTotal : getModelLength(),

                showMoreItems : function() {
                    if (config.usePages) throw "Iterator '" + config.name + "' cannot use showMoreItems() since it is using pages. Use showNextPage() and showPrevPage() instead.";
                    itemsShowing += config.itemsPerPage;
                    if (itemsShowing >= model.length) itemsShowing = model.length;
                    showingAllItems = itemsShowing == model.length;
                },
                showAllItems : function() {
                    if (config.usePages) throw "Iterator '" + config.name + "' cannot use showAllItems() since it is using pages. Use showNextPage() and showPrevPage() instead.";
                    itemsShowing = getModelLength();
                    showingAllItems = true;
                },
                getCurrentPage : function() {
                    return currentPage;
                },
                getPageCount : function() {
                    return getPageCount();
                },
                showNextPage : function() {
                    if (!config.usePages) throw "Iterator '" + config.name + "' cannot use showNextPage() since it isn't using pages. Use showMoreItems() and showAllItems() instead.";
                    currentPage++;
                    currentPage = ensurePageIsWithinLimits(currentPage);
                },
                showPrevPage : function() {
                    if (!config.usePages) throw "Iterator '" + config.name + "' cannot use showPrevPage() since it isn't using pages. Use showMoreItems() and showAllItems() instead.";
                    currentPage--;
                    currentPage = ensurePageIsWithinLimits(currentPage);
                },
                showPage : function(index) {
                    if (!config.usePages) throw "Iterator '" + config.name + "' cannot use showPage() since it isn't using pages. Use showMoreItems() and showAllItems() instead.";
                    currentPage = index;
                    if (currentPage < 0) currentPage = 0;
                    currentPage = ensurePageIsWithinLimits(currentPage);
                },
                getIndexForItem : function(item) {
                    if (!hasModel()) throw "Trying to find item in iterator list, but list is undefined. Maybe view has not been rendered yet?";
                    if (getModelLength() == 0) throw "Trying to find item in iterator list, but list is empty.";
                    var filteredModel = getFilteredModel();
                    for (var i = 0; i < filteredModel.length; i++) if (filteredModel[i] == item) return i;
                    throw "Unable to find specified item in iterators list.";
                },
                getIndexForItemWhere : function(where) {
                    if (!hasModel()) throw "Trying to find item in iterator list, but list is undefined. Maybe view has not been rendered yet?";
                    if (getModelLength() == 0) throw "Trying to find item in iterator list, but list is empty.";
                    var filteredModel = getFilteredModel();
                    if (where == undefined) throw "Trying to find item in iterator list, but specified where-function is undefined.";
                    if (typeof where !== "function") throw "Trying to find item in iterator list, but specified where-function is not a function. Type=" + typeof where;
                    for (var i = 0; i < filteredModel.length; i++) {
                        if (where(filteredModel[i])) {
                            return i;
                        }
                    }
                    throw "Unable to find item that matches where function in iterators list.";
                },
                getPageWithItem : function(item) {
                    return this.getPageIndexForItemIndex(this.getIndexForItem(item));
                },
                getPageWithItemWhere : function(where) {
                    return this.getPageIndexForItemIndex(this.getIndexForItemWhere(where));
                },
                getPageIndexForItemIndex : function(itemIndex) {
                    return Math.floor(itemIndex / this.itemsPerPage)
                },
                showPageWithItemIndex : function(index) {
                    this.showPage(this.getPageIndexForItemIndex(index));
                },
                showPageWithItem : function(item) {
                    try {
                        var pageWithItem = this.getPageWithItem(item);
                        this.showPage(pageWithItem);
                    } catch (e) {
                        throw "Trying to show page with specified item, but no such item was found.";
                    }
                },
                showPageWithItemWhere : function(where) {
                    try {
                        var pageWithItemWhere = this.getPageWithItemWhere(where);
                        this.showPage(pageWithItemWhere);
                    } catch (e) {
                        throw "Trying to show page with item that passes where-function, but no such item was found.";
                    }
                },
                isOnFirstPage : function() {
                    return isOnFirstPage();
                },
                isOnLastPage : function() {
                    return isOnLastPage();
                },
                isOnFirstOrLastPage : function() {
                    return isOnFirstOrLastPage();
                },
                isOnFirstAndLastPage : function() {
                    return isOnFirstAndLastPage();
                },
                getFirstIndexForCurrentPage : function() {
                    return getFirstIndexForCurrentPage();
                },
                getLastIndexForCurrentPage : function() {
                    return getLastIndexForCurrentPage();
                },
                getFirstItemOnCurrentPage : function() {
                    return getFirstItemOnCurrentPage();
                },
                getLastItemOnCurrentPage : function() {
                    return getLastItemOnCurrentPage();
                },
                setModel : function(m) {
                    setModel(m);
                }
            }

        };
    };

    /****************************
     * Tag types
     ****************************/

    var tagTypes = {
        tag_show : {
            token : "show",
            hasBlock : false,
            compileTagInstance : function(tagInstance, executionContext, args) {
                var result = new CompiledSource();
                var name = tagInstance.tag.parameters;
                if (name) {
                    var compiledLookup = compileLookup(name);
                    result.pushCompiledSource(compiledLookup.compiledSource);
                    result.pushBufferEmptyStringIfUndefined(compiledLookup.varName);
                } else {
                    result.pushBuffer("model !== undefined ? model : ''");
                }
                return result;
            },
            createTagInstance : function(args) {
                return {
                    tagName : this.token,
                    tag : args.tag,
                    content : args.content
                };
            }
        },

        tag_context : {
            token : "context",
            hasBlock : false,
            compileTagInstance : function(tagInstance, executionContext, args) {
                var result = new CompiledSource();
                var name = tagInstance.tag.parameters;
                result.pushBufferEmptyStringIfUndefined("executionContext.lookupContextInStack('" + name + "')");
                return result;
            },
            createTagInstance : function(args) {
                return {
                    tagName : this.token,
                    tag : args.tag,
                    content : args.content
                };
            }
        },

        tag_showjs : {
            token : "showjs",
            hasBlock : false,
            compileTagInstance : function(tagInstance, executionContext, args) {
                var result = new CompiledSource();
                result.pushBufferEmptyStringIfUndefined(tagInstance.tag.parameters);
                return result;
            },
            createTagInstance : function(args) {
                return {
                    tagName : this.token,
                    tag : args.tag,
                    content : args.content
                };
            }
        },

        tag_js : {
            token : "js",
            hasBlock : false,
            compileTagInstance : function(tagInstance, executionContext, args) {
                var result = new CompiledSource();
                result.push(tagInstance.tag.parameters);
                return result;
            },
            createTagInstance : function(args) {
                return {
                    tagName : this.token,
                    tag : args.tag,
                    content : args.content
                };
            }
        },

        tag_setglobal : {
            token : "setglobal",
            hasBlock : false,
            compileTagInstance : function(tagInstance, executionContext, args) {
                var result = new CompiledSource();
                var p = getNiterParametersFromTagParameter(tagInstance.tag.parameters);
                result.push("executionContext.getGlobals()['" + p.iterName + "'] = " + p.variableName);
                return result;
            },
            createTagInstance : function(args) {
                return {
                    tagName : this.token,
                    tag : args.tag,
                    content : args.content
                };
            }
        },

        tag_log : {
            token : "log",
            hasBlock : false,
            compileTagInstance : function(tagInstance, executionContext, args) {
                var result = new CompiledSource();
                result.push("if (typeof console == 'object' && typeof console.log == 'function') console.log(" + tagInstance.tag.parameters + ")");
                return result;
            },
            createTagInstance : function(args) {
                return {
                    tagName : this.token,
                    tag : args.tag,
                    content : args.content
                };
            }
        },

        tag_if : {
            token : "if",
            hasBlock : true,
            compileTagInstance : function(tagInstance, executionContext, args) {
                var result = new CompiledSource();
                var param = tagInstance.tag.parameters;
                var isFirst = true;

                for (var i = 0; i < tagInstance.conditions.length; i++) {
                    result.push((isFirst ? "" : "} else ") + "if (" + tagInstance.conditions[i] + ") {");
                    result.pushCompiledSource(compileTreeToSource(tagInstance.contentRoots[i]).indent());
                    isFirst = false;
                }

                if (tagInstance.elseContent && tagInstance.elseContent.length) {
                    result.push("} else {");
                    result.pushCompiledSource(compileTreeToSource(tagInstance.elseContent).indent());
                }
                result.push("}");
                return result;
            },

            createTagInstance : function(args) {
                if (!args.tag.parameters) throw createCompileExceptionMessage("If tag does not include a condition. Ex: " + startTagToken + " if model.isNice " + endTagToken, args.tag);
                var condition = args.tag.parameters;
                var conditionFunction = createExpressionFunction(args.tag.parameters);
                var c = createIfTag(args.subList, condition);

                return {
                    tagName : this.token,
                    tag : args.tag,
                    content : args.content,
                    condition : condition,
                    conditions : c.conditions,
                    contentRoots : c.contentRoots,
                    elseContent : c.elseContent
                };
            }
        },

        tag_push : {
            token : "push",
            hasBlock : true,
            compileTagInstance : function(tagInstance, executionContext, args) {
                var result = new CompiledSource();
                var param = tagInstance.tag.parameters;
                var compiledLookup = compileLookup(param);
                result.pushCompiledSource(compiledLookup.compiledSource);
                result.push("model = " + compiledLookup.varName);
                result.push("executionContext.pushModel(model)");
                result.pushCompiledSource(compileTreeToSource(tagInstance.content));
                result.push("executionContext.pop()");
                result.pushCompiledSource(createModelContextUpdateCompiledSource());
                return result;
            },
            createTagInstance : function(args) {
                return {
                    tagName : this.token,
                    tag : args.tag,
                    content : args.content
                };
            }
        },

        tag_copy : {
            token : "copy",
            hasBlock : true,
            compileTagInstance : function(tagInstance, executionContext, args) {
                // Do nothing in compiled tag, we add it at parse time.
                var result = new CompiledSource();
                result.pushCompiledSource(compileTreeToSource(tagInstance.content));
                return result;
            },
            createTagInstance : function(args) {
                var name = args.tag.parameters;
                if (!name) name = "default";
                executionContext.setClipboardWithName(name, args.content);
                return {
                    tagName : this.token,
                    tag : args.tag,
                    content : args.content
                };
            }
        },

        tag_paste : {
            token : "paste",
            hasBlock : false,
            compileTagInstance : function(tagInstance, executionContext, args) {
                var result = new CompiledSource();
                var name = tagInstance.tag.parameters;
                if (!name) name = "default";
                var clipboard = executionContext.getClipboardWithName(name);
                var clipboardError = executionContext.getClipboardErrorWithName(name);
                if (clipboard) {
                    result.pushCompiledSource(compileTreeToSource(clipboard));
                } else if (clipboardError) {
                    result.pushRenderError("Error in clipboard: " + clipboardError);
                } else {
                    result.pushRenderError("There is no clipboard with id='" + name + "'.");
                }
                return result;
            },
            createTagInstance : function(args) {
                return {
                    tagName : this.token,
                    tag : args.tag,
                    content : args.content
                };
            }
        },

        tag_component : {
            token : "component",
            hasBlock : false,
            compileTagInstance : function(tagInstance, executionContext, args) {
                var result = new CompiledSource();
                var ss = tagInstance.tag.parameters.split(" ");
                var name = ss[0];
                var required = true;
                var invalidParameter = false;
                var parameter;
                if (ss.length > 0) {
                    parameter = ss[1];
                    if (parameter) {
                        if (parameter == "notrequired") required = false;
                        else invalidParameter = true;
                    }
                }
                if (invalidParameter) {
                    result.pushRenderError("Invalid parameter = '" + parameter + "'");
                } else {
                    var childVar = getUncompiledVariableName("childComponent");
                    result.push("var " + childVar + " = executionContext.getChildWithId('" + name + "')");
                    result.push("if (" + childVar + ") {");
                    result.pushBuffer(childVar + ".render().html");
                    if (required) {
                        result.push("} else {");
                        result.pushRenderError("Has no child component with id = '" + name + "'");
                    }
                    result.push("}");
                }
                return result;
            },
            createTagInstance : function(args) {
                return {
                    tagName : this.token,
                    tag : args.tag,
                    content : args.content
                };
            }
        },

        tag_iter : {
            token : "iter",
            hasBlock : true,
            compileTagInstance : function(tagInstance, executionContext, args) {
                return tagTypes.tag_niter.compileTagInstance(tagInstance, executionContext, args);
            },
            createTagInstance : function(args) {
                return {
                    tagName : this.token,
                    tag : args.tag,
                    content : args.content
                };
            }
        },

        tag_niter : {
            token : "niter",
            hasBlock : true,
            createTagInstance : function(args) {
                // Cannot lookup iterConfig here, it might change after view has been rendered.
                return {
                    tagName : this.token,
                    tag : args.tag,
                    content : args.content
                };
            },
            compileTagInstance : function(tagInstance, executionContext, args) {
                var resultOuter = new CompiledSource();
                var result = new CompiledSource();

                var isNiter = tagInstance.tagName == "niter";
                var iterContext;
                var niterParameters;
                var iteratorName = undefined;
                var iterConfig = undefined;

                var name = tagInstance.tag.parameters;

                if (isNiter) {
                    niterParameters = getNiterParametersFromTagParameter(tagInstance.tag.parameters);
                    name = niterParameters.variableName;
                    iteratorName = niterParameters.iterName;
                    try {
                        iterConfig = executionContext.getIteratorConfigForId(iteratorName);
                    } catch (e) {
                        throw createCompileExceptionMessage("There is no iterator config with this id: " + iteratorName, tagInstance);
                    }
                }

                var listVar;
                var filteredListVar = getUncompiledVariableName("filteredList");
                var filterFunctionVar = getUncompiledVariableName("filter");
                var iVar = getUncompiledVariableName("i");
                var iterContextVar = getUncompiledVariableName("iterContext");
                var startVar = getUncompiledVariableName("start");
                var endVar = getUncompiledVariableName("end");
                var stackItemVar = getUncompiledVariableName("stackItem");

                var compiledLookup = compileLookup(name);
                listVar = compiledLookup.varName;
                resultOuter.pushCompiledSource(compiledLookup.compiledSource);
                resultOuter.push("if (" + listVar + " == undefined) {");
                resultOuter.pushRenderError("Iterator model is undefined.");
                resultOuter.push("} else if (!(" + listVar + " instanceof Array)) {");
                resultOuter.pushRenderError("Iterator model is not a list.");
                resultOuter.push("} else {");

                if (isNiter) {

                    resultOuter.push("var " + iterContextVar + " = executionContext.ensureIteratorExistsAndSetModel('" + iteratorName + "', " + listVar + ")");

                    if (iterConfig && iterConfig.where) {
                        // Apply filter function to list.
                        if (typeof iterConfig.where !== "function") throw "Iterator config '" + iteratorName + "' has a filter, but it is not a function.";
                        resultOuter.push("var " + filteredListVar + " = []");
                        resultOuter.push("var " + filterFunctionVar + " = " + iterContextVar + ".getConfig().where");
                        resultOuter.push("for (var " + iVar + " = 0; " + iVar + " < " + listVar + ".length; " + iVar + "++) {");
                        resultOuter.push("  if (" + filterFunctionVar + "(" + listVar + "[" + iVar + "])) " + filteredListVar + ".push(" + listVar + "[" + iVar + "])");
                        resultOuter.push("}");
                        resultOuter.push(listVar + " = " + filteredListVar);
                    }

                    resultOuter.push("var " + startVar + " = " + iterContextVar + ".getStart()");
                    resultOuter.push("var " + endVar + " = Math.min(" + iterContextVar + ".getEnd(), " + listVar + ".length)");

                } else {
                    // Is normal iter, do full list
                    resultOuter.push("var " + startVar + " = 0");
                    resultOuter.push("var " + endVar + " = " + listVar + ".length");
                }

                // DEBUG

                resultOuter.push("for (var " + iVar + " = " + startVar + "; " + iVar + " < " + endVar + "; " + iVar + "++) {");
                result.push("model = " + listVar + "[" + iVar + "]");
                result.push("context = {" +
                    "index : " + iVar + "," +
                    "size : " + listVar + ".length," +
                    "isFirst : (" + iVar + " == 0)," +
                    "isLast : (" + iVar + " == " + listVar + ".length - 1)," +
                    "isEven : (" + iVar + " % 2 == 0)," +
                    "isOdd : !(" + iVar + " % 2 == 0)," +
                    "parity : (" + iVar + " % 2 == 0) ? 'even' : 'odd'" +
                    "}");
                result.push("var " + stackItemVar + " = {model: model, context: context}");
                result.push("executionContext.push(" + stackItemVar + ")");

                result.pushCompiledSource(compileTreeToSource(tagInstance.content));

                result.push("executionContext.pop()");
                result.indent();
                resultOuter.pushCompiledSource(result);
                resultOuter.push("}");
                resultOuter.pushCompiledSource(createModelContextUpdateCompiledSource());

                if (isNiter) {
                    resultOuter.push("executionContext.iteratorsToUpdateAfterRender.push({ iterator : " + iterContextVar + ", start : " + startVar + ", end : " + endVar + " })");
                }

                resultOuter.push("}");

                resultOuter.push("/**************");
                resultOuter.push(" * End of iter");
                resultOuter.push(" **************/");

                return resultOuter;
            }
        }
    };

    var view = {
        html : undefined,
        tree : {},
        list : []
    };

    var createExpressionFunction = function(exp) {
        try {
            return new Function("model", "context", "globals", "api", "return " + exp);
        } catch (e) {
            throw "Invalid expression: " + exp;
        }
    };

    /**
     * Internal setModel method. Updates any state of the component that needs updating when setting the model.
     * @param model
     * @private
     */
    var _setModel = function(model) {
        executionContext.clearIterators(); // If we change model, all iterators are reset.
        executionContext.clear();
        executionContext.pushModel(model);
    };

    /**
     * Internal getModel
     * @return {*}
     * @private
     */
    var _getModel = function() {
        return executionContext.getModel();
    };

    /**
     * Takes view HTML in a string and compiles it. Returns a view and a compilation context.
     * @param html
     */
    var compileHtmlToView = function(html) {
        /**
         * Executed by setView(). Should throw exception if throwOnError == true.
         */

        var localCompilationContext = new CompilationContext_();
        var localView = {};

        localCompilationContext.clearCompileError();

        /**************************************
         * Compile to list
         **************************************/

        localView.list = undefined;
        localView.tree = undefined;
        localView.source = undefined;
        localView.template = undefined;

        try {
            localView.list = buildList(html);
        } catch (e) {
            localCompilationContext.setCompileError(e);
            throwError(e);
        }

        if (localView.list) {

            /**************************************
             * Compile to tree
             **************************************/

            try {
                localView.tree = buildTree(localView.list);
            } catch (e) {
                localCompilationContext.setCompileError(e);
                throwError(e);
            }
        }

        if (localView.tree) {

            /**************************************
             * Compile to source object
             **************************************/

            try {
                localView.source = buildSource(localView.tree);
            } catch (e) {

                /* Returns a stack of errors. First element is outmost error, which is the one the user will care about */

                localCompilationContext.setCompileError(e[0]);
                throwError(e);
            }
        }

        /****************************************************************************
         * Finally, compile to template object, regardless of previous result.
         ****************************************************************************/

        localView.template = buildTemplate(localView.source, localCompilationContext);

        return {
            view : localView,
            compilationContext : localCompilationContext
        };
    };

    var _setViewWithHtml = function(html) {
        if (html !== undefined) {
            var r = compileHtmlToView(html);
            view = r.view;
            view.html = html;
            globalCompilationContext = r.compilationContext;
        } else {
            view.html = undefined;
            view.list = [];
            view.tree = {};
            view.template = undefined;
        }
    };

    var _setViewFromComponent = function(component) {
        _setView(component._.getView());
        // Must recompile the source, since the compiled code now references the other components scope.
        view.template = buildTemplate(getView().source);
    };

    var getView = function() {
        return view;
    };

    var _setView = function(v) {
        view = v;
    };

    /**
     * Builds a list of elements from a view.
     * Even elements are HTML, odd elements are tags.
     */
    var buildList = function(viewHtml) {
        var list = [];
        for (var i = 0; i < args.maxTagCount; i++) {
            var startIndex = viewHtml.indexOf(startTagToken);

            if (startIndex < 0) {
                // No tags left, just add rest as HTML.
                if (viewHtml) list.push({html : viewHtml});
                break;
            } else if (startIndex > 0) {
                // There was HTML in front of tag, adding it.
                var html = viewHtml.substring(0, startIndex);
                if (html) list.push({html : html});
            }

            var endIndex = viewHtml.indexOf(endTagToken);

            if (endIndex < 0) {
                throw "Missing end tag.";
            } else if (endIndex < startIndex) {
                throw "Too many end tags.";
            }

            var trim = function(s) {
                if (typeof String.prototype.trim !== 'function') {
                    // IE has no support for String.trim(), this code ensures that IE works properly.
                    return s.replace(/^\s+|\s+$/g, '');
                } else {
                    return s.trim();
                }
            };

            var tagContent = trim(viewHtml.substring(startIndex + startTagToken.length, endIndex));

            list.push(createTagObject(tagContent));

            viewHtml = viewHtml.substring(endIndex + endTagToken.length);

        }
        return list;
    };

    /**
     * Builds a tree out of a list.
     * @param list
     * @param localCompilationContext
     * @return {Array}
     */
    var buildTree = function(list) {
        var root = [];
        for (var i = 0; i < list.length; i++) {
            var item = list[i];
            if (item.html) {
                root.push(item);
            } else {
                var tagType = getTagType(item.tagName);
                var endIndex, subList, endIndexTag;

                /***************************************************
                 * Special case for if, to support elseif and else
                 * Find block, build tree out of it
                 ***************************************************/

                if (tagType && tagType.token == tagTypes.tag_if.token) {

                    try {
                        endIndexTag = findBlockEnd(list, i, {});
                    } catch (e) {
                        throw e;
                    }
                    subList = list.slice(i + 1, endIndexTag.index);
                    root.push(tagType.createTagInstance({
                        tag : item,
                        subList : subList,
                        content : buildTree(subList)
                    }));
                    i = endIndexTag.index;

                } else if (tagType && tagType.hasBlock) {

                    // Find block, build tree out of it

                    try {
                        endIndex = findBlockEnd(list, i, {}).index;
                    } catch (e) {
                        throw e;
                    }
                    subList = list.slice(i + 1, endIndex);
                    root.push(tagType.createTagInstance({
                        tag : item,
                        content : buildTree(subList)
                    }));
                    i = endIndex;

                } else if (tagType) {

                    // not hasBlock.

                    root.push(tagType.createTagInstance({
                        tag : item
                    }));

                } else {
                    // Is not a system tag
                    root.push({tag : item});
                    //throw "No such tag type: " + item.tagName;
                }
            }

        }
        return root;
    };

    /**
     * Creates if tag using list that is the content between "if" and "endif".
     * Can contain "else" and "elseif". Can also contain inner if cases.
     * Needs firstCondition since we don't get first if case.
     * @param list
     */
    var createIfTag = function(list, firstCondition) {
        var conditions = [];
        var contentRoots = [];
        var elseContent = [];
        var ifCounter = 0;
        var lastFoundTagName = "if";
        var currentCondition = firstCondition;
        var hasElse = false;

        var startIndex = 0;

        for (var i = 0; i < list.length; i++) {
            var isOnLastItem = i == list.length - 1;
            var item = list[i];

            // HERE!
            /**
             * When we find an if, run createIfTag recursively and push the result! No need to use ifCounter. Doesn't work anyway, since it doesn't take care of inner if cases properly.
             * NO! Run buildTree()
             */
            if (item.tagName == "if") {
                ifCounter++;
            }
            else if (item.tagName == "endif") ifCounter--;

            if (ifCounter == 0 && (isOnLastItem || item.tagName == "else" || item.tagName == "elseif")) {

                if (lastFoundTagName == "else" && !isOnLastItem) throw createCompileExceptionMessage("Found 'else' or 'elseif' tag after 'else' tag.", item);

                var endIndex = i + (isOnLastItem ? 1 : 0);
                var subList = list.slice(startIndex, endIndex);
                var node = buildTree(subList);

                if (lastFoundTagName == "else") {
                    if (isOnLastItem) {
                        elseContent = node;
                    } else {
                        throw createCompileExceptionMessage("If case miss match.", item);
                    }
                } else {
                    conditions.push(currentCondition);
                    contentRoots.push(node);
                }

                currentCondition = item.parameters;

                lastFoundTagName = item.tagName;
                if (lastFoundTagName == "else") hasElse = true;

                startIndex = i + 1;
            } else if (ifCounter != 0 && isOnLastItem) { // Is on last element
                throw createCompileExceptionMessage("Not matching if, elseif, else.", item);
            }
        }

        var conditionFunctions = [];
        for (i = 0; i < conditions.length; i++) {
            var con = conditions[i];
            conditionFunctions.push(createExpressionFunction(con));
        }

        return {
            conditions : conditions,
            contentRoots : contentRoots,
            elseContent : elseContent
        };
    };

    var getTagType = function(token) {
        if (token == undefined) return undefined;
        return tagTypes["tag_" + token];
    };

    var findBlockEnd = function(list, i, args) {
        args = args || {};
        args.endTags = args.endTags || []; // If set, standard "end*" will be overridden.
        args.startIndex = args.startIndex || i; // The index to start searching. If undefined, starts at i.

        if (typeof args.endTags.length !== "number") {
            throw "Argument endTags to findBlockEnd() must be a list.";
        }

        var endTags = args.endTags; // If one of these is found at level 0, the end is found!
        var startItem = list[i];
        if (startItem.html) {
            throw createCompileExceptionMessage("The tag that is opening the block is a HTML element and not a tag.", startItem);
        }
        if (list.length < 2) {
            throw createCompileExceptionMessage("Missing end tag for the '" + startItem.tagName + "' tag.", startItem);
        }

        if (args.startIndex !== undefined) i = args.startIndex;
        var startTagType = getTagType(startItem.tagName);
        if (startTagType && !startTagType.hasBlock) throw createCompileExceptionMessage("Looking for end tag, but start tag does not open block.", startItem);
        if (startTagType) {
            var stack = [startItem];
            for (i++; i < list.length; i++) {
                var item = list[i];
                if (item.tagName) {
                    // Is a tag, otherwise it is just HTML which we ignore.
                    if (endTags && endTags.length && listContains(endTags, item.tagName)) {
                        // Is "else" or "elseif"
                        if (stack.length == 1) { // 1 since we have "if" on stack.
                            return {
                                index : i,
                                endTag : item.tagName
                            };
                        }
                    } else if (item.tagName.substring(0, 3) == "end") {
                        // Is end* tag
                        var tagName = item.tagName.substring(3, item.length);
                        if (stack[stack.length - 1].tagName == tagName) {
                            stack.pop();
                            if (stack.length == 0) {
                                return {
                                    index : i,
                                    endTag : item.tagName
                                };
                            }
                        } else {
                            throw createCompileExceptionMessage("Found closing tag without starting '" + tagName + "' tag.", item);
                        }
                    } else {
                        // Something other than end*
                        var tagType = getTagType(item.tagName);
                        if (tagType && tagType.hasBlock) {
                            // Is starting new block, push it!
                            stack.push(item);
                        }
                    }
                }
            }
        }
        throw createCompileExceptionMessage("Found no closing tag to '" + startItem.tag + "'.", startItem);
    };

    var getNiterParametersFromTagParameter = function(tagParameter) {
        var iterName = undefined;
        var variableName = undefined;
        if (tagParameter.indexOf(" ") >= 0) {
            iterName = tagParameter.substring(0, tagParameter.indexOf(" "));
            variableName = tagParameter.substring(tagParameter.indexOf(" ") + 1, tagParameter.length);
        } else {
            iterName = tagParameter;
        }
        return {
            iterName : iterName ? iterName : undefined,
            variableName : variableName ? variableName : undefined
        }
    };

    var createTagObject = function(tagContent) {
        return {
            tag : tagContent,
            tagName : getTagNameFromTag(tagContent),
            parameters : getTagParameters(tagContent)
        };
    };

    var getTagNameFromTag = function(tag) {
        var i = tag.indexOf(" ");
        if (i < 0) {
            return tag;
        }
        else {
            return tag.substring(0, i);
        }
    };

    var getTagParameters = function(tag) {
        var i = tag.indexOf(" ");
        if (i < 0) {
            return "";
        }
        else {
            return tag.substring(i + 1, tag.length);
        }
    };

    /**
     * Formats a string to be usable as variable name. For example, list[0].name becomes list0_name
     * @param name
     */
    var formatVariableName = function(name) {
        return name
            .replace(/\.\.\//g, "_parent_")
            .replace(/\//g, "_")
            .replace(/\(/g, "")
            .replace(/\)/g, "")
            .replace(/'/g, "")
            .replace(/"/g, "")
            .replace(/\[/g, "")
            .replace(/\]/g, "")
            .replace(/\;/g, "")
            .replace(/\,/g, "")
            .replace(/\./g, "_");
    };

    var _uncompiledVariableName = {};

    /**
     * Returns a variable name that is not already in use by the compiled code. Ensures no variable name collisions.
     * @param name
     */
    var getUncompiledVariableName = function(name) {
        name = formatVariableName(name);
        if (_uncompiledVariableName[name] == undefined) {
            _uncompiledVariableName[name] = 0;
        }
        return name + "__" + _uncompiledVariableName[name]++;
    };

    /**
     * Formats any string into a Javascript string token.
     *
     * For example:
     * Mattias
     * Andersson
     *
     * Becomes:
     * "Mattias\nAndersson"
     *
     * @param s
     * @return {string}
     */
    var encodeStringToJsString = function(s) {
        return "\"" + replaceStringTokens(s) + "\"";
    };

    var replaceStringTokens = function(s) {
        s = s
            .replace(/\\/g, "\\\\")
            .replace(/\n/g, "\\n")
            .replace(/\t/g, "\\t")
            .replace(/\r/g, "\\r")
            .replace(/"/g, '\\"')
            .replace(/'/g, "\\'");
        return s;
    };


    var compileTreeToSource = function(tree) {

        var result = new CompiledSource();

        tree = tree || [];

        for (var i = 0; i < tree.length; i++) {

            var item = tree[i];

            if (item.html) {
                result.pushBuffer(encodeStringToJsString(item.html));
            } else {

                var tagType = getTagType(item.tagName);
                result.pushTagComment(item);

                var tagCompiledSource = undefined;

                if (tagType) {

                    /****************************************************************
                     * It is a tag of system type. For example showjs, if, push, etc.
                     ****************************************************************/

                    var tagOk = false;

                    /***************************
                     * Compile the tag to source
                     ***************************/

                    try {
                        tagCompiledSource = tagType.compileTagInstance(item, executionContext);
                    } catch (e) {
                        if (e && e.length !== undefined) {
                            e.push(compileErrorToString({tag : item.tag.tag}));
                            throw e;
                        } else {
                            var msg = compileErrorToString({tag : item.tag.tag, message : e.toString()});
                            throw [msg];
                        }
                    }

                } else {

                    /****************************************************************
                     * It is NOT a system tag, it is a property name.
                     ****************************************************************/

                    try {
                        tagCompiledSource = compilePropertyTag(item);
                    } catch (e) {
                        if (e && e.length !== undefined) {
                            e.push(compileErrorToString({tag : item.tag.tag}));
                            throw e;
                        } else {
                            var msg = compileErrorToString({tag : item.tag.tag, message : e.toString()});
                            throw [msg];
                        }
                    }
                }

                /*****************************************************************************
                 * Compile the source to Function-object to verify that it is working.
                 *****************************************************************************/

                if (tagCompiledSource) {
                    try {
                        new Function("executionContext", "api", "rootModel", tagCompiledSource.toString());
                        tagOk = true;
                    } catch (e) {
                        if (e && e.length !== undefined) {
                            e.push(compileErrorToString({tag : item.tag.tag}));
                            throw e;
                        } else {
                            var msg = compileErrorToString({tag : item.tag.tag, message : e.toString()});
                            throw [msg];
                        }
                    }
                }

                /*************************************************************
                 * Add it to result if it is OK.
                 *************************************************************/

                if (tagOk) {
                    result.pushCompiledSource(tagCompiledSource);
                }


            }
        }

        return result;
    };

    /**
     * Compiles a tree to a source object. args.tree must be defined.
     * Result contains two properties.
     * result.full = the full source. This is the source of the template.
     * result.body = only the body of the template, without the prepended variables.
     *
     * @param args
     * @return {{full: CompiledSource, body: *}}
     */
    var compileTreeToSourceWithBaseCodeIncluded = function(tree) {

        var result = new CompiledSource();
        // executionContext is available at all times.
        result.push("var globals = executionContext.getGlobals()");
        result.push("var model = rootModel");
        result.push("var context = {}");
        var body = compileTreeToSource(tree);
        result.pushCompiledSource(body);
        return {
            full : result,
            body : body
        };

    };

    var buildSource = function(tree) {
        var sourceObj;

        try {
            sourceObj = compileTreeToSourceWithBaseCodeIncluded(tree);
        } catch (e) {
            throw e;
        }
        return sourceObj;

    };

    /**
     * Takes source and compilation context and builds a template object. Source can be undefined, if previous compilation passes has failed. But in that case, compilation context must contain an error.
     *
     * buildTemplate() may not throw an exception in normal usage, since it must always return a template.
     *
     * @param tree
     * @return {{getSource: Function, getBodySource: Function, render: Function, process: Function}}
     */
    var buildTemplate = function(sourceObj, localCompilationContext) {
        var debugEnabled = false;

        if (sourceObj == undefined && localCompilationContext == undefined) throw "Severe error: buildTemplate() must get sourceObj and/or compilation context. May not ommit both.";
        if (sourceObj == undefined && !localCompilationContext.hasCompileError()) throw "Severe error: buildTemplate() got no sourceObj but compilation context indicates no compilation errors.";

        var f;

        /*****************************************
         * If success, buildTemplate to Function object.
         ****************************************/
        if (sourceObj) {
            var source = sourceObj.full;
            var bodySource = sourceObj.body;

            try {
                f = new Function("executionContext", "api", "rootModel", source);
            } catch (e) {
                if (debugEnabled && typeof console == "object") {
                    console.log(source);
                    console.log(e);
                    console.log(e.toString());
                }
                throw createGenericCompileErrorMessage(e);
            }
        }

        /************************************************************
         * Return the template object that exposes some method needed.
         * This is the c.getView().template object.
         ************************************************************/
        return {
            getSource : function() {
                return source;
            },
            getBodySource : function() {
                return bodySource;
            },
            render : function() {
                var r = {};
                var msg;
                if (f) {
                    executionContext.makeReadyForRender();
                    try {
                        r = f.apply(executionContext, [executionContext, executionContext.getTagApi(), _getModel()]);
                    } catch (e) {
                        if (debugEnabled && typeof console == "object") {
                            console.log(source);
                            console.log(e);
                            console.log(e.toString());
                            console.log("model", _getModel());
                        }

                        throwError(renderErrorToString({tag : executionContext.currentTag.name, message : e.toString()}));
                        executionContext.addRenderError(e.toString(), executionContext.currentTag.name);
                    }
                } else {
                    /**
                     * compilationContext.compileError should be a formatted error message at this point. No further formatting should be required.
                     */

                    if (!localCompilationContext.hasCompileError()) {
                        localCompilationContext.setCompileError(createGenericCompileErrorMessage("Critical error, no compiled result, and no error."));
                    }

                    executionContext.renderResult = [localCompilationContext.getCompileError()];

                    throwError(localCompilationContext.getCompileError());
                }

                return executionContext.renderResult.join("");
            },
            process : function() {
                var html = "";
                var ok = true;
                var error = undefined;
                try {
                    html = this.render();
                } catch (e) {
                    error = e;
                }
                return {
                    ok : ok,
                    html : html,
                    error : error
                };
            }
        };
    };

    var compileLookup = function(name) {
        var r = new CompiledSource();

        var names = name.split(".");

        var varName = getUncompiledVariableName(names.join(''));

        if (name.substring(0, 6) == "model." ||
            name.substring(0, 8) == "context." ||
            name.substring(0, 8) == "globals." ||
            name.substring(0, 4) == "api." ||
            name.indexOf("(") >= 0 ||
            name.indexOf(")") >= 0) {
            r.push(varName + " = " + name);
        } else if (name.substring(0, 13) == "this.context." ||
            name.substring(0, 11) == "this.model." ||
            name.substring(0, 13) == "this.globals.") {
            r.push(varName + " = " + name.substring(5));
        } else {

            var prefixResult = findParentPrefix(name);
            var compiledLookup = _compileLookupFunctionForVariableWithName(name);
            var lookupVar = compiledLookup.lookupFunctionName;
            r.pushCompiledSource(compiledLookup.compiledSource);
            name = prefixResult.name;
            if (prefixResult.count == 0) {
                // There is no parent "../" prefix, so check model as usual.
                r.push(varName + " = " + "(" + createConditionForValueExists("model", name) + " !== undefined ? model." + name + " : " + lookupVar + "())");
            } else {
                // There is at least one "../" prefix, so no need to check model. Use lookup function immediately.
                r.push(varName + " = " + lookupVar + "()");
            }
        }

        return {
            compiledSource : r,
            varName : varName
        };

    };

    /**
     * Creates a condition expression for checking if a value exists. For example:
     * "model" + "user.name.first" becomes "model && model.user && model.user.name && model.user.name.first"
     */
    var createConditionForValueExists = function(tempVar, name) {

        var names = name.split(".");

        var ifConditions = [];

        ifConditions.push(tempVar);
        for (var i = 0; i < names.length; i++) {
            var c = [];
            c.push(tempVar);
            for (var j = 0; j <= i; j++) {
                c.push(names[j]);
            }
            ifConditions.push(c.join('.'));
        }
        return ifConditions.join(" && ");

    };

    /**
     * This does a lookupOnObject, implemented in compiler instead of in runtime.
     * @param name
     */
    var _compileLookupFunctionForVariableWithName = function(name) {

        var originalName = name;
        var names = name.split(".");

        var r = new CompiledSource();
        var innerFunction = new CompiledSource();
        var insideDo = new CompiledSource();
        var insideIf = new CompiledSource();

        var parentPrefix = findParentPrefix(name);
        name = parentPrefix.name;

        var lookupVar = getUncompiledVariableName("lookup__" + names.join(''));
        var tempVar = "aStackModel";
        var iVar = "i";
        //var tempVar = getUncompiledVariableName("aStackModel");
        //var iVar = getUncompiledVariableName("i");
        r.push("var " + lookupVar + " = function() {");
        innerFunction.push("// lookup name=" + name);
        if (parentPrefix.count > 0) {
            innerFunction.push("if (executionContext.executionStack.length <= " + parentPrefix.count + ") throw 'Trying to lookup \"" + originalName + "\", but stack is smaller than that (' + executionContext.executionStack.length + ').'");
        }
        innerFunction.push("var " + tempVar);
        innerFunction.push("var " + iVar + " = executionContext.executionStack.length - 1 - " + parentPrefix.count);
        innerFunction.push("do {");
        insideDo.push(tempVar + " = executionContext.executionStack[" + iVar + "].model");

        var ifCondition = createConditionForValueExists(tempVar, name);

        insideDo.push("if (" + ifCondition + ") { ");
        insideIf.push("return " + tempVar + "." + name);
        insideIf.push("break");
        insideIf.indent();
        insideDo.pushCompiledSource(insideIf);
        insideDo.push("}");
        insideDo.push(iVar + "--");
        insideDo.indent();
        innerFunction.pushCompiledSource(insideDo);
        innerFunction.push("} while (" + iVar + " >= 0)");
        innerFunction.push("throw \"Property '" + replaceStringTokens(name) + "' not found on model stack.\"");
        innerFunction.indent();
        r.pushCompiledSource(innerFunction);
        r.push("}");

        return {
            compiledSource : r,
            lookupFunctionName : lookupVar
        };

    };

    var compilePropertyTag = function(tagItem) {
        var result = new CompiledSource();
        var name = tagItem.tag.tag;

        // Handle lookup for "model" only.
        if (name == "model") {
            result.pushBuffer("model");
        } else {
            // Handle lookup that starts with "model."
            if (name.substring(0, 6) == "model.") name = name.substring(6);

            var compiledLookup = compileLookup(name);
            result.pushCompiledSource(compiledLookup.compiledSource);
            result.pushBuffer(compiledLookup.varName);
        }
        return result;
    };

    var hasParentPrefix = function(name) {
        return name.substring(0, 3) == "../";
    };

    var findParentPrefix = function(name) {
        var count = 0;
        while (name.substring(0, 3) == "../") {
            name = name.substring(3);
            count++;
        }
        return {
            count : count,
            name : name
        };
    };

    var createModelContextUpdateCompiledSource = function() {
        var r = new CompiledSource();
        r.push("var peek = executionContext.peek()");
        r.push("model = peek ? peek.model : undefined");
        r.push("context = peek ? peek.context : undefined");
        return r;
    };


    var CompiledSource = function() {
        var stack = [];

        this.getStack = function() {
            return stack;
        };

        this.push = function(item) {
            stack.push(item);
        };

        this.pushBuffer = function(item) {
            stack.push("executionContext.renderResult.push(" + item + ")");
        };

        this.pushComment = function(item) {
            stack.push("// " + item);
        };

        this.pushPrintStack = function() {
            stack.push("console.log('stack:', executionContext.executionStack)");
        };

        this.pushTagComment = function(tag) {
            var tagString = (tag.tag.tag ? tag.tag.tag : tag.tag);
            var tagStringAsJs = encodeStringToJsString(tagString);
            if (args.logTags) stack.push("console.log('" + startTagToken + " ' + " + tagStringAsJs + " + ' " + endTagToken + "', model, executionContext.executionStack)");
            stack.push("");
            stack.push(" /***********************************");
            stack.push(" * tag: " + startTagToken + " " + tagString + " " + endTagToken);
            stack.push(" ************************************/");
            stack.push("executionContext.currentTag.name = " + tagStringAsJs);
        };

        this.pushBufferEmptyStringIfUndefined = function(item) {
            var varName = getUncompiledVariableName("v");
            stack.push("var " + varName + " = " + item);
            stack.push("executionContext.renderResult.push(" + varName + " !== undefined ? " + varName + " : '')");
        };

        this.pushRenderErrorIf = function(condition, text) {
            stack.push("if (" + condition + ") executionContext.pushCurrentRenderError(" + encodeStringToJsString(text) + ")");
        };

        this.pushRenderError = function(text) {
            stack.push("executionContext.pushCurrentRenderError(" + encodeStringToJsString(text) + ")");
        };

        this.pushAll = function(items) {
            for (var i = 0; i < items.length; i++) {
                this.push(items[i]);
            }
        };

        this.pushCompiledSource = function(cs) {
            if (cs == undefined) throw "Trying to push CompiledSource content, but it is undefined.";
            this.pushAll(cs.getStack());
        };

        this.toString = function() {
            return stack.join("\n") + "\n";
        };

        this.indent = function() {
            for (var i = 0; i < stack.length; i++) {
                stack[i] = "    " + stack[i];
            }
            return this;
        };
    };

    /**
     * Resolves a property on a model. Name can be a path, such as "user.name.first".
     * The property can be null or undefined, but parent objects may not be.
     * @param name
     * @param model
     */
    var lookup = function(name, model) {
        return lookupInObject(name, model, name, "", model);
    };

    /**
     * Resolves a property on a model. Name can be a path, such as "user.name.first".
     * The property can be null or undefined, but parent objects may not be. This method resolves recursively.
     * @param name
     * @param model
     * @param startName
     * @param fullName
     * @param startModel
     */
    var lookupInObject = function(name, model, startName, fullName, startModel) {

        var msg;

        if (model === undefined || model === null) {
            var modelStr = fullName ? "'" + fullName + "'" : "the model";
            msg = "Trying to lookup property '" + startName + "', but " + modelStr + " is undefined.";
            throw msg;
        }

        var s = name.split(".");

        var value = undefined;

        if (s.length == 1) {
            value = model[name];
        } else {
            var first = s[0];
            s.splice(0, 1);
            var rest = s.join(".");
            value = lookupInObject(rest, model[first], startName, fullName ? fullName + "." + first : first, startModel);
        }
        return value;
    };

    var listContains = function(list, value) {
        for (var i = 0; i < list.length; i++) {
            var b = list[i] == value;
            if (b) {
                return true;
            }
        }
        return false;
    };

    var render = function() {

        _beforeRender();

        if (getView().template) {
            /**
             * template.render() can throw exception if throwOnError=true and compilation failed.
             * If throwOnError=false and compilation failed, renderResult will be populated with error message.
             */
            result.html = getView().template.render();
        } else {
            /**
             * There is no view. Result should be empty.
             */
            result.html = "";
        }

        return _afterRender();

    };

    var _beforeRender = function() {
        executionContext.beforeRender();
    };

    var _afterRender = function() {

        if (mainArgs.afterRender) {
            if (typeof mainArgs.afterRender == "function") {
                mainArgs.afterRender();
            } else {
                throw "afterRender argument must be a function or not defined.";
            }
        }

        /********************************************************
         * Update execution context after mainArgs.afterRender(),
         * since it might update the DOM which execution context callbacks might affect.
         *********************************************************/

        executionContext.afterRender();

        return result;
    };


    init();

    /**************
     * The object that is returned by mcomponent().
     */

    return {

        addChild : function(id, child) {
            executionContext.addChild(id, child);
        },

        removeAllChildren : function(id) {
            executionContext.removeAllChildren();
        },

        removeChild : function(id) {
            executionContext.removeChildWithId(id);
        },

        hasChild : function(id) {
            return executionContext.hasChildWithId(id);
        },

        getChildren : function() {
            return executionContext.getChildren();
        },

        getChild : function(id) {
            return executionContext.getChildWithId(id);
        },

        setModel : function(model) {
            _setModel(model);
        },

        getModel : function() {
            return _getModel();
        },

        setViewWithHtml : function(html) {
            _setViewWithHtml(html);
        },

        setViewFromComponent : function(component) {
            _setViewFromComponent(component);
        },

        getIterator : function(iteratorName) {
            var i = executionContext.getIteratorWithName(iteratorName);
            return i ? i.getPublicInterface() : undefined;
        },

        getGlobals : function() {
            return executionContext.getGlobals();
        },

        render : function() {
            return render();
        },

        hasRenderErrors : function() {
            return executionContext.hasRenderErrors() || globalCompilationContext.hasCompileError();
        },

        hasCompileError : function() {
            return globalCompilationContext.hasCompileError();
        },

        getResult : function() {
            return result;
        },

        assert : {

            assertLookup : function(name, model) {
                return lookup(name, model);
            },

            assertGetTagParameters : function(tagContent) {
                return getTagParameters(tagContent);
            },

            assertListSize : function(i) {
                if (getView().list.length == i) {
                    return true;
                }
                else {
                    throw "List size check failed. Expected:" + i + ", but got:" + getView().list.length;
                }
            },

            assertListItemHasHtml : function(i, html) {
                var item = getView().list[i];
                if (item && item.html && item.html === html) {
                    return true;
                }
                else if (item && item.html) {
                    throw "List item check failed. Expected HTML:" + html + ", but got:" + item.html;
                }
                else if (item) {
                    throw "List item check failed. Expected HTML:" + html + ", but element is not of HTML type.";
                }
                else {
                    throw "List item check failed. List has no element with index:" + i;
                }
            },

            assertListItemHasTagName : function(i, tagName) {
                var item = getView().list[i];
                if (item && item.tagName && item.tagName === tagName) {
                    return true;
                }
                else if (item && item.tagName) {
                    throw "List item check failed. Expected tag name:" + tagName + ", but got:" + item.tagName;
                }
                else if (item) {
                    throw "List item check failed. Expected tag name:" + tagName + ", but element is not a tag.";
                }
                else {
                    throw "List item check failed. List has no element with index:" + i;
                }
            },

            assertBlockEnd : function(i, expected) {
                var list = getView().list;
                var r = findBlockEnd(list, i, {}).index;
                if (r !== expected) throw "Assert findBlockEnd failed. Expected index:" + expected + ", but got:" + r;
                return true;
            },

            assertFindParentPrefixCount : function(name) {
                return findParentPrefix(name).count;
            },

            assertFindParentPrefixName : function(name) {
                return findParentPrefix(name).name;
            },

            assertRender : function() {
                return render().html;
            },

            assertCompileLogSource : function() {
                var t = buildTemplate(getView().tree);
                return t.render();
            },

            assertComponentIdEqualsExecutionContextId : function() {
                return id == executionContext.id;
            },

            assertSetViewAndBuildList : function(html) {
                var v = getView();
                v.html = html;
                if (html) {
                    try {
                        view.list = buildList(view.html);
                    } catch (e) {
                        throw e;
                    }
                    view.tree = {}
                } else {
                    v.list = [];
                    v.tree = {};
                }
                return true;
            }


        },

        _ : {

            getExecutionStackSize : function() {
                return executionContext.executionStack.length;
            },

            getTemplate : function() {
                return buildTemplate(getView().tree);
            },

            findBlockEnd : function(i, args) {
                var list = getView().list;
                return findBlockEnd(list, i, args).index;
            },

            findBlockEndTag : function(i, args) {
                var list = getView().list;
                return findBlockEnd(list, i, args);
            },

            getTree : function() {
                return getView().tree;
            },

            getList : function() {
                return getView().list;
            },

            getView : function() {
                return view;
            },

            getSource : function() {
                return buildTemplate(getView().tree).getSource().toString();
            },

            getBodySource : function() {
                return buildTemplate(getView().tree).getBodySource().toString();
            },

            isComponent : function() {
                return true;
            },

            getId : function() {
                return id;
            },

            getExecutionContext : function() {
                return executionContext;
            },

            getNiterParametersFromTagParameter : function(name) {
                return getNiterParametersFromTagParameter(name);
            },

            getClipboard : function(name) {
                return executionContext.getClipboardWithName(name);
            },

            pushModel : function(model) {
                executionContext.pushModel(model);
                return true;
            }

        }


    };
}
