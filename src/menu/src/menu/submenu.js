/**
 * @ignore
 * submenu controller for kissy, transfer item's keyCode to menu
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/submenu", function (S, Node, MenuItem, SubMenuRender, Extension) {

    function afterHighlightedChange(e) {
        var target = e.target,
            self = this;
        // hover 子菜单，保持该菜单项高亮
        if (target !== self && target.isMenuItem && e.newVal) {
            clearSubMenuTimers(self);
            if (!self.get('highlighted')) {
                self.set('highlighted', true);
                // refresh highlightedItem of parent menu
                target.set('highlighted', false);
                target.set('highlighted', true);
            }
        }
    }

    // Clears the show and hide timers for the sub menu.
    function clearSubMenuTimers(self) {
        var dismissTimer_,
            showTimer_;
        if (dismissTimer_ = self.dismissTimer_) {
            dismissTimer_.cancel();
            self.dismissTimer_ = null;
        }
        if (showTimer_ = self.showTimer_) {
            showTimer_.cancel();
            self.showTimer_ = null;
        }
    }

    /* or precisely subMenuItem */
    var KeyCode = Node.KeyCode,
        MENU_DELAY = 0.15;

    var DecorateChild = Extension.DecorateChild;

    /**
     * Class representing a submenu that can be added as an item to other menus.
     * xclass: 'submenu'.
     * @extends KISSY.Menu.Item
     * @class KISSY.Menu.SubMenu
     */
    var SubMenu = MenuItem.extend([Extension.DecorateChild], {

            isSubMenu: 1,

            clearSubMenuTimers: function () {
                clearSubMenuTimers(this);
            },

            bindUI: function () {
                this.on('afterHighlightedChange', afterHighlightedChange, this);
            },

            handleMouseLeave: function () {
                var self = this;
                self.set('highlighted', false, {
                    data: {
                        fromMouse: 1
                    }
                });
                clearSubMenuTimers(self);
                var menu = getMenu(self);
                if (menu && menu.get('visible')) {
                    // 延迟 highlighted
                    self.dismissTimer_ = S.later(hideMenu,
                        self.get("menuDelay") * 1000, false, self);
                }
            },

            handleMouseEnter: function () {
                var self = this;
                self.set('highlighted', true, {
                    data: {
                        fromMouse: 1
                    }
                });
                clearSubMenuTimers(self);
                var menu = getMenu(self);
                if (!menu || !menu.get('visible')) {
                    self.showTimer_ = S.later(showMenu, self.get("menuDelay") * 1000, false, self);
                }
            },

            /**
             * Dismisses the submenu on a delay, with the result that the user needs less
             * accuracy when moving to sub menus.
             * @protected
             */
            _onSetHighlighted: function (v, e) {
                var self = this;
                // sync
                if (!e) {
                    return;
                }
                SubMenu.superclass._onSetHighlighted.apply(this, arguments);
                if (e.fromMouse) {
                    return;
                }
                if (v && !e.fromKeyboard) {
                    showMenu.call(self);
                } else if (!v) {
                    hideMenu.call(self);
                }
            },

            // click ，立即显示
            performActionInternal: function () {
                var self = this;
                showMenu.call(self);
                //  trigger click event from menuitem
                SubMenu.superclass.performActionInternal.apply(self, arguments);
            },

            /**
             * Handles a key event that is passed to the menu item from its parent because
             * it is highlighted.  If the right key is pressed the sub menu takes control
             * and delegates further key events to its menu until it is dismissed OR the
             * left key is pressed.
             * Protected for subclass overridden.
             * @param {KISSY.Event.DOMEventObject} e key event.
             * @protected
             * @return {Boolean|undefined} Whether the event was handled.
             */
            handleKeydown: function (e) {
                var self = this,
                    menu = getMenu(self),
                    menuChildren,
                    menuChild,
                    hasKeyboardControl_ = menu && menu.get("visible"),
                    keyCode = e.keyCode;

                if (!hasKeyboardControl_) {
                    // right
                    if (keyCode == KeyCode.RIGHT) {
                        showMenu.call(self);
                        menu = getMenu(self);
                        if (menu) {
                            menuChildren = menu.get("children");
                            if (menuChild = menuChildren[0]) {
                                menuChild.set('highlighted', true, {
                                    data: {
                                        fromKeyboard: 1
                                    }
                                });
                            }
                        }
                    }
                    // enter as click
                    else if (e.keyCode == KeyCode.ENTER) {
                        return this.performActionInternal(e);
                    }
                    else {
                        return undefined;
                    }
                } else if (menu.handleKeydown(e)) {
                }
                // The menu has control and the key hasn't yet been handled, on left arrow
                // we turn off key control.
                // left
                else if (keyCode == KeyCode.LEFT) {
                    // refresh highlightedItem of parent menu
                    self.set('highlighted', false);
                    self.set('highlighted', true, {
                        data: {
                            fromKeyboard: 1
                        }
                    });
                } else {
                    return undefined;
                }
                return true;
            },

            containsElement: function (element) {
                var menu = getMenu(this);
                return menu && menu.containsElement(element);
            },

            // 默认 addChild，这里里面的元素需要放到 menu 属性中
            decorateChildrenInternal: function (UI, el) {
                // 不能用 display:none , menu 的隐藏是靠 visibility
                // eg: menu.show(); menu.hide();
                el.prependTo(el[0].ownerDocument.body);
                var self = this;
                self.setInternal("menu", DecorateChild.prototype
                    .decorateChildrenInternal.call(self, UI, el, self.get('menu')));
            },

            destructor: function () {
                var self = this,
                    menu = getMenu(self);

                clearSubMenuTimers(self);

                if (menu && menu.destroy) {
                    menu.destroy();
                }
            }
        },
        {
            ATTRS: {
                decorateChildCls: {
                    valueFn: function(){
                        return this.prefixCls+'popupmenu';
                    }
                },

                /**
                 * The delay before opening the sub menu in seconds.  (This number is
                 * arbitrary, it would be good to get some user studies or a designer to play
                 * with some numbers).
                 * Defaults to: 0.15
                 * @cfg {Number} menuDelay
                 */
                /**
                 * @ignore
                 */
                menuDelay: {
                    value: MENU_DELAY
                },
                /**
                 * Menu config or instance.
                 * @cfg {KISSY.Menu|Object} menu
                 */
                /**
                 * Menu config or instance.
                 * @property menu
                 * @type {KISSY.Menu|Object}
                 */
                /**
                 * @ignore
                 */
                menu: {
                    setter: function (m) {
                        if (m && m.isController) {
                            m.setInternal('parent', this);
                        }
                    }
                },

                defaultChildCfg: {
                    value: {
                        xclass: 'popupmenu'
                    }
                },

                xrender: {
                    value: SubMenuRender
                }
            }
        }, {
            xclass: 'submenu'
        });

    // # -------------------------------- private start

    function getMenu(self, init) {
        var m = self.get("menu");
        if (m && !m.isController) {
            if (init) {
                self.setInternal("menu", m = self.deriveComponent(m));
            } else {
                return null;
            }
        }
        return m;
    }

    function showMenu() {
        var self = this,
            el,
            align,
            menu = getMenu(self, 1);
        if (menu) {
            el = self.get('el');
            align = menu.get("align");
            delete align.node;
            align = S.clone(align);
            align.node = el;
            align.points = align.points || ['tr', 'tl'];
            menu.set("align", align);
            menu.show();
            /*
             If activation of your menuitem produces a popup menu,
             then the menuitem should have aria-haspopup set to the ID of the corresponding menu
             to allow the assist technology to follow the menu hierarchy
             and assist the user in determining context during menu navigation.
             */
            el.attr("aria-haspopup", menu.get("el").attr("id"));
        }
    }

    function hideMenu() {
        var menu = getMenu(this);
        if (menu) {
            menu.hide();
        }
    }

    // # ------------------------------------ private end

    return SubMenu;
}, {
    requires: ['node', './menuitem', './submenu-render', 'component/extension']
});