(function($) {
    $.fn.mcomponent = function(args) {

        var that = this;

        var mainArgs = args = $.extend({
            placeHolder : undefined,
            placeHolderId : undefined,
            clearPlaceHolderBeforeRender : true
        }, args);

        if (that.length) {
            var node = that[0];
            if (node.tagName == "SCRIPT") {
                args.viewHtml = $(node)[0].text;
            } else {
                throw "Source element is not a script tag.";
            }
        }

        var component = mcomponent(args);
        var placeHolder = $(args.placeHolder) || $("#" + args.placeHolderId);

        var afterRender = function() {
            var result = component.getResult();
            result.node = document.createElement(args.containerType);
            result.node.innerHTML = result.html;
            if (args.clearPlaceHolderBeforeRender) $(placeHolder).html("");
            if (placeHolder) {
                placeHolder.appendChild(result.node);
            }

        };

    };
}(jQuery));
