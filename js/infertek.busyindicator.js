var Infertek;
(function (Infertek) {
    var BUSY_INDICATOR_OVERLAY_DATA_KEY = "infertek.busyindicator.overlay";
    var BUSY_INDICATOR_OVERLAY_EVENT_DATA_KEY = "infertek.busyindicator.overlayevent";
    var BUSY_INDICATOR_OVERLAY_VISIBLE_CLASS = "visible";
    /**
     * Template for the busy indicator's overlay.
     * @type {String}
     * @private
     */
    var _overlayHTML = "<div class=\"busy_indicator\"><div class=\"busy_indicator_image\"></div></div>";

    /**
     * Gets maximum ZIndex for specified element.
     * @param $element Element for which zindex should be loaded.
     * @returns {Number} ZIndex for this element.
     * @private
     */
    var _getMaximumZIndexForElement = function ($element) {
        var currentElement = $element;
        var maximumZIndex = 0;
        do
        {
            var zIndex = currentElement.css("z-index");
            if (zIndex == "auto")
                continue;
            if (zIndex > maximumZIndex)
                maximumZIndex = zIndex;
        } while(!(currentElement = currentElement.parent()).is(document.body))
        return maximumZIndex;
    };

    /**
     * Performs initialization of the overlay's DOM.
     * @return {jQuery} Initialized instance of the overlay.
     * @private
     */
    var _initializeOverlay = function() {
        return jQuery(_overlayHTML).appendTo(document.body);
    };

    /**
     * Extracts size from the size string like "20px".
     * @param sizeString Size string.
     * @return {Number} Size. Default 0.
     * @private
     */
    var _extractSize = function (sizeString) {
        if (sizeString && sizeString != "" && sizeString.endsWith("px")) {
            var size = sizeString.substr(0, sizeString.length - 2);
            return isNaN(size) ? 0 : parseInt(size);
        }
        return 0
    };

    /**
     * Positions specified overlay directly above specified DOM element.
     * @param overlay Overlay to be positioned.
     * @param $element Element above which this overlay should be positioned.
     * @private
     */
    var _positionOverlayDirectlyAboveElement = function(overlay, $element) {
        var elementIsVisible = $element.css("visibility") == "visible" && $element.css("display") != "none";
        var elementPosition = $element.offset();
        var elementHeight = $element.height();
        var elementWidth = $element.width();
        var elementZIndex = _getMaximumZIndexForElement($element);
        var windowScrollX = window.scrollX;
        var windowScrollY = window.scrollY;
        var windowHeight = window.innerHeight;
        var windowWidth = window.innerWidth;

        var topOffset = _extractSize($element.css("padding-top")) + _extractSize($element.css("margin-top"));
        var bottomOffset = _extractSize($element.css("padding-bottom")) + _extractSize($element.css("margin-bottom"));
        var leftOffset = _extractSize($element.css("padding-left")) + _extractSize($element.css("margin-left"));
        var rightOffset = _extractSize($element.css("padding-right")) + _extractSize($element.css("margin-right"));

        elementHeight += topOffset + bottomOffset;
        elementWidth += leftOffset + rightOffset;

        var isOutsideViewX = elementPosition.left >= windowWidth + windowScrollX ||
            elementPosition.left + elementWidth <= windowScrollX;
        var isOutsideViewY = elementPosition.top >= windowHeight + windowScrollY ||
            elementPosition.top + elementHeight <= windowScrollY;

        if (isOutsideViewX || isOutsideViewY || !elementIsVisible)
            overlay.removeClass(BUSY_INDICATOR_OVERLAY_VISIBLE_CLASS);
        else {
            var overlayX = elementPosition.left < windowScrollX ? windowScrollX : elementPosition.left;
            var overlayY = elementPosition.top < windowScrollY ? windowScrollY : elementPosition.top;
            var overlayWidth = 0;
            var overlayHeight = 0;

            // If end of the element is outside of the visible part of the screen...
            if (elementPosition.left + elementWidth > windowScrollX + windowWidth) {
                overlayWidth = elementWidth - (overlayX - elementPosition.left) - (elementPosition.left + elementWidth - (windowScrollX + windowWidth));
            } else {
                overlayWidth = elementWidth - (overlayX - elementPosition.left);
            }

            // If end of the element is outside of the visible part of the screen...
            if (elementPosition.top + elementHeight > windowScrollY + windowHeight) {
                overlayHeight = elementHeight - (overlayY - elementPosition.top) - (elementPosition.top + elementHeight - (windowScrollY + windowHeight));
            } else {
                overlayHeight = elementHeight - (overlayY - elementPosition.top);
            }

            overlay.css("top", overlayY)
                   .css("left", overlayX)
                   .css("width", overlayWidth + "px")
                   .css("height", overlayHeight + "px");

            overlay.addClass(BUSY_INDICATOR_OVERLAY_VISIBLE_CLASS);
        }

        overlay.css("z-index", elementZIndex + 1);
    };

    var BusyIndicator = function () {};

    /**
     * Hides overlay for specified element.
     * @param $element Element for which overlay should be removed.
     */
    BusyIndicator.hide = function ($element) {
        var indicatorOverlay = $element.data(BUSY_INDICATOR_OVERLAY_DATA_KEY);

        if (!indicatorOverlay)
            return;

        indicatorOverlay.remove();

        var performPositioningOfOverlayEvent = $element.data(BUSY_INDICATOR_OVERLAY_EVENT_DATA_KEY);

        $(window).off("scroll", performPositioningOfOverlayEvent)
                 .off("resize", performPositioningOfOverlayEvent);

        $element.data(BUSY_INDICATOR_OVERLAY_DATA_KEY, null);
        $element.data(BUSY_INDICATOR_OVERLAY_EVENT_DATA_KEY, null);
    };

    /**
     * Shows busy indicator for specified DOM element.
     * @param $element Element for which this busy indicator should be shown.
     */
    BusyIndicator.show = function ($element) {
        var indicatorOverlay = $element.data(BUSY_INDICATOR_OVERLAY_DATA_KEY);
        if (!indicatorOverlay)
            $element.data(BUSY_INDICATOR_OVERLAY_DATA_KEY, indicatorOverlay = _initializeOverlay());

        var performPositioningOfOverlay = function () {
            _positionOverlayDirectlyAboveElement(indicatorOverlay, $element);
        };

        $element.data(BUSY_INDICATOR_OVERLAY_EVENT_DATA_KEY, performPositioningOfOverlay);
        $(window).on("scroll", performPositioningOfOverlay)
                 .on("resize", performPositioningOfOverlay);
        performPositioningOfOverlay();
    };

    Infertek.BusyIndicator = BusyIndicator;
})(Infertek || (Infertek = {}));

ko.bindingHandlers.infertekBusyIndicator = {
    init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        if (valueAccessor()())
            Infertek.BusyIndicator.show($(element));
    },
    update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        if (valueAccessor()())
            Infertek.BusyIndicator.show($(element));
        else
            Infertek.BusyIndicator.hide($(element));
    }
};