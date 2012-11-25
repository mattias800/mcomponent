(function($) {
    $.fn.mcomponent = function(args) {

        var that = this;

        var mainArgs = args = $.extend({
            placeHolder : undefined,
            placeHolderId : undefined,
            clearPlaceHolderBeforeRender : true,
            containerType : "div",
            afterRender : undefined
        }, args);

        var externalAfterRender = args.afterRender;
        var placeHolder = $(args.placeHolder)[0] || $("#" + args.placeHolderId)[0];
        var component;

        var afterRender = function() {
            var result = component.getResult();
            result.node = document.createElement(args.containerType);
            result.node.innerHTML = result.html;
            if (args.clearPlaceHolderBeforeRender) $(placeHolder).html("");
            if (placeHolder) {
                placeHolder.appendChild(result.node);
            }

        };

        args.afterRender = function() {
            afterRender();
            if (externalAfterRender) {
                if (typeof externalAfterRender == "function") {
                    externalAfterRender();
                } else {
                    throw "afterRender argument must be a function or not defined.";
                }
            }
        };

        if (that.length) {
            var node = that[0];
            if (node.tagName == "SCRIPT") {
                args.viewHtml = $(node)[0].text;
            } else {
                throw "Source element is not a script tag.";
            }
        }
        component = mcomponent(args);

        return component;

    };
}(jQuery));
