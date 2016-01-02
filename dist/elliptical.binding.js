///binds an element mutation to a function via an attribute setting
/// i.e, an declarative alternative to imperative jquery plugin approach
(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        //commonjs
        module.exports = factory(require('elliptical-utils'), require('elliptical-template'),require('elliptical-mutation-summary'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['elliptical-utils', 'elliptical-template','elliptical-mutation-summary'], factory);
    } else {
        // Browser globals (root is window)
        root.elliptical = root.elliptical || {};
        root.elliptical.binding = factory(root.elliptical.utils,root.elliptical.$Template,root.elliptical.mutation.summary);
        root.returnExports = root.elliptical.binding;
    }
}(this, function (utils, $Template,Observer) {

    ///***variables,constants***
    var random = utils.random;
    var SELECTOR = '[ea-bind]';
    var ATTRIBUTE = 'ea-bind';
    var LISTENER_ON = false;
    var BINDING_DELAY = 500;
    var LOAD_TIMEOUT=250;
    var SCROLL_EVENT='scroll.infinite';
    ///maps
    var BINDING_DECLARATIONS = new Map();
    var ACTIVE_ELEMENT_BINDINGS = new Map();
    ///mutation observer
    Observer.connect();

    // POJO constructs for our map values
    var bindingDeclaration = {
        get obj() {
            return {
                fn: null,
                context: null
            };
        }
    };

    var activeElementBinding = {
        get obj() {
            return {
                node: null,
                context: null,
                fn: null,
                attrValue: null
            };
        }
    };


    ///***listeners  (listen for mutation events and document ready)***
    function bindingMutationListener() {
        ///mutations
        $(document).on('OnDocumentMutation', function (event, summary) {
            if (summary.added) queryBindings(summary.added);
            if (summary.removed) destroyBindings(summary.removed); //important that we clean up to avoid memory leaks
        });

    }

    //document ready, use a setTimeout to ensure bindingDeclarations Map has been set
    $(function () {
        var added = document.querySelectorAll(SELECTOR);
        if (added.length) {
            setTimeout(function(){
                queryBindings(added);
            },LOAD_TIMEOUT);
        }
    });



    ///***Binding Constructor***
    function Binding(key, fn) {
        if (!LISTENER_ON) bindingMutationListener();
        LISTENER_ON = true;
        var obj = bindingDeclaration.obj;
        obj.fn = fn;
        obj.context = this;
        BINDING_DECLARATIONS.set(key, obj);
        this.click = 'touchclick';
        this._events = [];

    }

    //Binding prototype methods
    Binding.prototype.jsonParseMessage = function (obj) {
        try {
            var msgObj = JSON.parse(obj);
            if (msgObj.message) return msgObj.message;
            else return obj;
        } catch (ex) {
            return obj;
        }
    };



    Binding.prototype.dispose = function () {};

    ///***private***
    //query & init
    function queryBindings(added) {
        BINDING_DECLARATIONS.forEach(function (obj, key) {
            var $nodes = $(added).selfFind('[' + ATTRIBUTE + '="' + key + '"]');
            if ($nodes[0]) {
                $.each($nodes, function (index, node) {
                    var id = random.id(8);
                    node._EA_BINDING_ID = id;
                    var binding = activeElementBinding.obj;
                    binding.node = node;
                    binding.context = obj.context;
                    binding.attrValue = key;
                    binding.fn = obj.fn;
                    ACTIVE_ELEMENT_BINDINGS.set(id, binding);
                    initBinding(obj.context, node, obj.fn);
                });
            }
        });
    }


    function initBinding(context, node, fn) {
        setTimeout(function () {
            fn.call(context, node);
        }, BINDING_DELAY);
    }


    ///*** dispose ****
    function destroyBindings(removed) {
        var $nodes = $(removed).selfFind(SELECTOR);
        if ($nodes.length && $nodes.length > 0) {
            $.each($nodes, function (index, node) {
                if (node._EA_BINDING_ID) disposeElementBinding(node);
            });
        }
    }

    function disposeElementBinding(node) {
        var key = node._EA_BINDING_ID;
        var obj = ACTIVE_ELEMENT_BINDINGS.get(key);
        if (obj === undefined) iterateBindingsForNode(node);
        else dispose(obj, node,key);

    }

    ///run unbind events on the function context,kill the closure, delete from the Active Map
    function dispose(obj, node,key) {
        obj.context.unbindEvents();
        obj.context.dispose();
        obj.context = null;
        if (node && node.parentNode) node.parentNode.removeChild(node);
        obj.fn = null;//null the closure, otherwise any event handlers set on the element==memory leak
        obj.node = null;
        ACTIVE_ELEMENT_BINDINGS.delete(key);
    }

    //backup disposal method
    function iterateBindingsForNode(node) {
        ACTIVE_ELEMENT_BINDINGS.forEach(function (key, obj) {
            if (node === obj.node) dispose(obj, node,key);
        });
    }

    ///***return a new Binding for each declaration...***
    // DOM: <div ea-bind="my-binding"></div>
    // JS: elliptical.binding('my-binding',function(node){ ...code stuff...})
    return function (val, fn) {
        return new Binding(val, fn);
    };


}));
