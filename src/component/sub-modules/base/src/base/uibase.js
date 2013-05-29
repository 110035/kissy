/**
 * @ignore
 * UIBase
 * @author yiminghe@gmail.com, lifesinger@gmail.com
 */
KISSY.add('component/base/uibase', function (S, RichBase, Node, Manager, undefined) {

    var SRC_NODE = 'srcNode',
        ATTRS = 'ATTRS',
        HTML_PARSER = 'HTML_PARSER',
        noop = S.noop;

    /**
     * init srcNode
     * @ignore
     */
    function initSrcNode(self, srcNode) {
        var c = self.constructor,
            len,
            p,
            constructorChains;

        constructorChains = self.collectConstructorChains();

        // 从父类到子类开始从 html 读取属性
        for (len = constructorChains.length - 1; len >= 0; len--) {
            c = constructorChains[len];
            if (p = c[HTML_PARSER]) {
                applyParser.call(self, srcNode, p);
            }
        }
    }

    function applyParser(srcNode, parser) {
        var self = this,
            p, v,
            ret;

        // 从 parser 中，默默设置属性，不触发事件
        // html parser 优先，超过 js 配置值
        for (p in parser) {
            v = parser[p];
            // 函数
            if (S.isFunction(v)) {
                // html parser 放弃
                ret = v.call(self, srcNode);
                if (ret !== undefined) {
                    self.setInternal(p, ret);
                }
            }
            // 单选选择器
            else if (typeof v == 'string') {
                self.setInternal(p, srcNode.one(v));
            }
            // 多选选择器
            else if (S.isArray(v) && v[0]) {
                self.setInternal(p, srcNode.all(v[0]))
            }
        }
    }

    /**
     * @class KISSY.Component.UIBase
     * @extends KISSY.RichBase
     * UIBase for class-based component.
     */
    var UIBase = RichBase.extend({

        constructor: function UIBaseConstructor() {
            var self = this, srcNode;
            UIBase.superclass.constructor.apply(self, arguments);
            // decorate may perform complex create
            if (self.decorateInternal &&
                (srcNode = self.get('srcNode'))) {
                self.decorateInternal(srcNode);
            }
            if (self.get('autoRender')) {
                self.render();
            }
        },

        // change routine from rich-base for uibase
        bindInternal: noop,

        // change routine from rich-base for uibase
        syncInternal: noop,

        initializer: function () {
            var self = this,
                id,
                srcNode = S.one(self.get(SRC_NODE));

            // register instance if config id
            if (id = self.get("id")) {
                Manager.addComponent(id, self);
            }

            if (srcNode) {
                // 根据 srcNode 设置属性值
                // so initializer can not read attribute in case srcNode is set
                initSrcNode(self, srcNode);
                self.setInternal(SRC_NODE, srcNode);
            }
        },

        /**
         * Create dom structure of this component.
         * @chainable
         */
        create: function () {
            var self = this;
            // 是否生成过节点
            if (!self.get("created")) {
                /**
                 * @event beforeCreateDom
                 * fired before root node is created
                 * @param {KISSY.Event.CustomEventObject} e
                 */
                self.fire('beforeCreateDom');
                self.callMethodByHierarchy("createDom", "__createDom");
                self.setInternal("created", true);

                /**
                 * @event afterCreateDom
                 * fired when root node is created
                 * @param {KISSY.Event.CustomEventObject} e
                 */
                self.fire('afterCreateDom');
                self.callPluginsMethod("createDom");
            }
            return self;
        },

        /**
         * Put dom structure of this component to document, bind event and sync attribute.
         * @chainable
         */
        render: function () {
            var self = this;
            // 是否已经渲染过
            if (!self.get("rendered")) {

                self.create(undefined);

                /**
                 * @event beforeRenderUI
                 * fired when root node is ready
                 * @param {KISSY.Event.CustomEventObject} e
                 */

                self.fire('beforeRenderUI');
                self.callMethodByHierarchy("renderUI", "__renderUI");

                /**
                 * @event afterRenderUI
                 * fired after root node is rendered into dom
                 * @param {KISSY.Event.CustomEventObject} e
                 */

                self.fire('afterRenderUI');
                self.callPluginsMethod("renderUI");

                /**
                 * @event beforeBindUI
                 * fired before component 's internal event is bind.
                 * @param {KISSY.Event.CustomEventObject} e
                 */

                self.fire('beforeBindUI');
                UIBase.superclass.bindInternal.call(self);
                self.callMethodByHierarchy("bindUI", "__bindUI");

                /**
                 * @event afterBindUI
                 * fired when component 's internal event is bind.
                 * @param {KISSY.Event.CustomEventObject} e
                 */

                self.fire('afterBindUI');
                self.callPluginsMethod("bindUI");

                UIBase.superclass.syncInternal.call(self);
                self.sync();

                self.setInternal("rendered", true);
            }
            return self;
        },

        /**
         * sync attribute value
         */
        sync: function () {
            var self = this;
            /**
             * @event beforeSyncUI
             * fired before component 's internal state is synchronized.
             * @param {KISSY.Event.CustomEventObject} e
             */

            self.fire('beforeSyncUI');
            self.callMethodByHierarchy("syncUI", "__syncUI");

            /**
             * @event afterSyncUI
             * fired after component 's internal state is synchronized.
             * @param {KISSY.Event.CustomEventObject} e
             */

            self.fire('afterSyncUI');
            self.callPluginsMethod("syncUI");
        },

        /**
         * For overridden. DOM creation logic of subclass component.
         * @protected
         * @method
         */
        createDom: noop,

        /**
         * For overridden. Render logic of subclass component.
         * @protected
         * @method
         */
        renderUI: noop,

        /**
         * For overridden. Bind logic for subclass component.
         * @protected
         * @method
         */
        bindUI: noop,

        /**
         * For overridden. Sync attribute with ui.
         * @protected
         * @method
         */
        syncUI: noop,

        plug: function () {
            var self = this,
                p,
                plugins = self.get('plugins');
            UIBase.superclass.plug.apply(self, arguments);
            p = plugins[plugins.length - 1];
            if (self.get('rendered')) {
                p.pluginCreateDom && p.pluginCreateDom(self);
                p.pluginRenderUI && p.pluginRenderUI(self);
                p.pluginBindUI && p.pluginBindUI(self);
                p.pluginSyncUI && p.pluginSyncUI(self);
            } else if (self.get('created')) {
                p.pluginCreateDom && p.pluginCreateDom(self);
            }
            return self;
        },


        /**
         * Destroy this component.
         * @protected
         */
        destructor: function () {
            var id;
            // remove instance if set id
            if (id = this.get("id")) {
                Manager.removeComponent(id);
            }
        }
    }, {

        name: 'UIBase',

        ATTRS: {
            /**
             * Whether this component is rendered.
             * @type {Boolean}
             * @property rendered
             * @readonly
             */
            /**
             * @ignore
             */
            rendered: {
                value: false
            },
            /**
             * Whether this component 's dom structure is created.
             * @type {Boolean}
             * @property created
             * @readonly
             */
            /**
             * @ignore
             */
            created: {
                value: false
            },

            /**
             * get xclass of current component instance.
             * @property xclass
             * @type {String}
             * @readonly
             */
            /**
             * @ignore
             */
            xclass: {
                valueFn: function () {
                    return Manager.getXClassByConstructor(this.constructor);
                }
            }
        }
    });

    // RichBase.extend
    var originalExtend = UIBase.extend;

    S.mix(UIBase, {
        /**
         * Parse attribute from existing dom node.
         * @static
         * @protected
         * @property HTML_PARSER
         * @member KISSY.Component.UIBase
         *
         * for example:
         *     @example
         *     Overlay.HTML_PARSER={
         *          // el: root element of current component.
         *          "isRed":function(el){
         *              return el.hasClass("ks-red");
         *          }
         *      };
         */
        HTML_PARSER: {},

        /**
         * Create a new class which extends UIBase .
         * @param {Function[]} extensions Class constructors for extending.
         * @param {Object} px Object to be mixed into new class 's prototype.
         * @param {Object} sx Object to be mixed into new class.
         * @static
         * @return {KISSY.Component.UIBase} A new class which extends UIBase .
         */
        extend: function extend(extensions, px, sx) {
            var args = S.makeArray(arguments),
                baseClass = this,
                parsers = {},
                xclass,
                newClass,
                argsLen = args.length,
                last = args[argsLen - 1];

            if (xclass = last.xclass) {
                args[argsLen - 2].name = xclass;
            }

            newClass = originalExtend.apply(baseClass, args);

            if (S.isArray(extensions)) {
                // [ex1,ex2]，扩展类后面的优先，ex2 定义的覆盖 ex1 定义的
                // 主类最优先
                S.each(extensions['concat'](newClass), function (ext) {
                    if (ext) {
                        // 合并 HTML_PARSER 到主类
                        S.each(ext[HTML_PARSER], function (v, name) {
                            parsers[name] = v;
                        });
                    }
                });
                newClass[HTML_PARSER] = parsers;
            }

            if (xclass) {
                Manager.setConstructorByXClass(xclass, newClass);
            }

            newClass.extend = extend;
            return newClass;
        }
    });

    return UIBase;
}, {
    requires: ["rich-base", "node", "./manager"]
});
/**
 * @ignore
 *
 * Refer:
 *  - http://martinfowler.com/eaaDev/uiArchs.html
 *
 * render 和 create 区别
 *  - render 包括 create ，以及把生成的节点放在 document 中
 *  - create 仅仅包括创建节点
 **/