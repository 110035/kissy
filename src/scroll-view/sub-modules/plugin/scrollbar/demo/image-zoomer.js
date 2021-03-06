KISSY.add('touch/image-zoomer', function (S, Node, ScrollView, ScrollbarPlugin) {
    var $ = Node.all;

    var docElement = $(document.documentElement);
    var win = $(window);

    var transformProperty = S.Features.getTransformProperty();
    var transformOriginProperty = transformProperty + 'Origin';

    var scrollView;
    var scroll;
    var contentEl;
    var contentRegion;
    var currentScroll;
    var imgEl;

    var closeEl;
    var domImgEl;
    var imgStyle;
    var maskEl;
    var centerOffset;
    var markerEl;
    var initialScale;
    var currentScale;
    var markerStyle;

    var ZOOMER_CLASS = 'ks-image-zoomer';
    var HIDE_SCROLLBAR_CLASS = ZOOMER_CLASS + '-hide-scrollbar';
    var CLOSE_CLASS = ZOOMER_CLASS + '-close';
    var MARKER_CLASS = ZOOMER_CLASS + '-marker';
    var CLOSE_HTML = '<div class="' + CLOSE_CLASS + '"></div>';
    var IMAGE_ZOOMER_CONTENT = '<img /><div class="' + MARKER_CLASS + '"></div>';
    var MASK_CLASS = ZOOMER_CLASS + '-mask';
    var MASK_HTML = '<div class="' + MASK_CLASS + '"></div>';

    function initScrollView() {
        if (scrollView) {
            return;
        }
        scrollView = new ScrollView({
            content: IMAGE_ZOOMER_CONTENT,
            elCls: ZOOMER_CLASS,
            plugins: [ScrollbarPlugin]
        }).render();
        contentEl = scrollView.get('contentEl');
        imgEl = contentEl.one('img');
        markerEl = contentEl.one('.' + MARKER_CLASS);
        markerStyle = markerEl[0].style;
        domImgEl = imgEl[0];
        closeEl = $(CLOSE_HTML).insertBefore(contentEl);
        imgStyle = domImgEl.style;
        imgStyle[transformOriginProperty] = '0 0';
        contentEl.on('pinchStart', pinchStart);
        contentEl.on('pinch mousewheel', pinch);
        maskEl = $(MASK_HTML).prependTo(document.body);
        scrollView.on('afterVisibleChange', function (e) {
            maskEl[e.newVal ? 'show' : 'hide']();
            docElement[e.newVal ? 'addClass' :
                'removeClass'](HIDE_SCROLLBAR_CLASS);
        });
        closeEl.on(Node.Gesture.tap, function () {
            scrollView.hide();
        });
        $(window).on('resize orientationchange', function () {
            if (scrollView.get('visible')) {
                scrollView.sync();
            }
        });
        contentRegion = {
            width: contentEl.width(),
            height: contentEl.height()
        };
    }

    function resetStatus(cfg) {
        markerStyle.width = '0px';
        markerStyle.height = '0px';
        domImgEl.src = cfg.src;
        var originWidth;
        var originHeight;
        var width = win.width();
        var height = win.height();
        var imageWidth = originWidth = cfg.width;
        var imageHeight = originHeight = cfg.height;
        if (imageHeight > height || imageWidth > width) {
            var ratio = Math.min(width / imageWidth, height / imageHeight);
            originWidth = imageWidth * ratio;
            originHeight = imageHeight * ratio;
        }
        domImgEl.width = originWidth;
        domImgEl.height = originHeight;
        scroll = currentScroll = {
            left: 0,
            top: 0
        };
        currentScale = initialScale = 1;
        imgStyle[transformProperty] = 'translate3d(0,0,0) scaleX(1)' + ' ' + 'scaleY(' + currentScale + ')';
    }

    // finger centerOffset relative to left top of image
    function getCenterOffset(e) {
        var touches = e.touches,
            offsetX = -currentScroll.left,
            offsetY = -currentScroll.top,
            centerOffset;
        if (touches) {
            centerOffset = {
                left: (touches[0].pageX + touches[1].pageX) / 2 - offsetX,
                top: (touches[0].pageY + touches[1].pageY) / 2 - offsetY
            };
        } else {
            centerOffset = {
                left: e.pageX - offsetX,
                top: e.pageY - offsetY
            };
        }
        return centerOffset;
    }

    function pinchStart(e) {
        scroll = currentScroll = {
            left: scrollView.get('scrollLeft'),
            top: scrollView.get('scrollTop')
        };
        scrollView.stopAnimation();
        centerOffset = getCenterOffset(e);
        initialScale = currentScale;
    }

    function pinch(e) {
        // mousewheel
        if (e.deltaY) {
            e.stopPropagation();
            pinchStart(e);
            e.scale = e.deltaY > 0 ? 2 : 0.5;
        }

        if (!e.scale) {
            return;
        }

        var toScale = initialScale * e.scale;

        // centerOffset is stable
        if (toScale < 1) {
            return;
        }

        if (toScale > 10) {
            return;
        }

        currentScale = toScale;

        var currentScroll = {
            left: Math.max(centerOffset.left * (e.scale - 1) + scroll.left, 0),
            top: Math.max(centerOffset.top * (e.scale - 1) + scroll.top, 0)
        };

        // translate3d 3d acceleration
        imgStyle[transformProperty] = 'translate3d(0,0,0) scaleX(' + currentScale + ')' + ' ' + 'scaleY(' + currentScale + ')';
        markerStyle.width = contentRegion.width * currentScale + 'px';
        markerStyle.height = contentRegion.height * currentScale + 'px';

        scrollView.scrollTo(currentScroll);
        scrollView.sync();
    }

    return {
        /**
         *
         * @param cfg
         * @param cfg.width
         * @param cfg.height
         * @param cfg.src
         */
        showImage: function (cfg) {
            initScrollView();
            resetStatus(cfg);
            scrollView.show();
            scrollView.sync();
        }
    }
}, {
    requires: [
        'node',
        'scroll-view', 'scroll-view/plugin/scrollbar']
});