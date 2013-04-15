/*
 * viewfinder
 * https://github.com/wheresrhys/jquery.defer
 *
 * Copyright (c) 2013 Rhys Evans
 * Licensed under the MIT license.
 */

(function($, win, doc) {

    var _ = win._ || {
        each: function (arr, func) {
            for (var i = 0, il = arr.length; i<il; i++) {
                func(i, arr[i]);
            }
        }
    };

    
    var Layer = function ($el, options) {
        this.$el = $el;
        this.options = this.options = $.extend(true, {}, options, $el.data('viewfinder-layer')),
        this.init();
    };

    Layer.prototype = {
        init: function () {
            this.setDimensions();
            this.setCentre();
            this.setAngle();
        },

        setDimensions: function () {
            var $el = this.$el,
                height = $el.height(),
                width = $el.width();

            this.original = {
                left: $el[0].offsetLeft,
                bottom: this.options.viewport.height - ($el[0].offsetTop + height),
                top: 'auto',
                right: 'auto'
            };

            this.height = this.original.height = height / this.options.zoom;
            this.width = this.original.width = width / this.options.zoom;


            $el.css(this.original);

            this.currentState = $.extend({}, this.options);

            if (this.options.distance > -1) {
                this.scaler = this.options.zoom / this.options.distance;
                this.physical = {
                    height: height / this.scaler,
                    width: width / this.scaler, 
                    leftEdge: this.original.left / this.scaler,
                    topEdge: this.original.top / this.scaler,
                    distance: this.options.distance
                };    
            } else {
                this.infiniteDistance = true;
                this.scaler = this.options.zoom;
            }
        },

        setScaler: function () {
            if (this.infiniteDistance) {
                this.scaler = this.currentState.zoom;
            } else {
                this.scaler = this.currentState.zoom / this.currentState.distance;
            }
        },

        setCentre: function () {
            var vertical;
            if (this.options.verticalBase === 'centre') {
                vertical = this.original.bottom  * this.scaler * (this.original.bottom > this.options.viewport.height / 2 ? 1 : -1);
            } else if (this.options.verticalBase === 'bottom') {
                vertical = this.options.viewpoint.y * this.scaler;
            } 

            this.transform((this.options.viewport.width - this.width) / 2, vertical);
        },

        setAngle: function () {

        },

        transform: function (left, bottom) {
            this.$el.css({
                left: left,
                bottom: bottom
            });
            // this.$el.css({
            //     "-webkit-transform": "translate3D(" + left + ", " + top + ")",
            //     "-moz-transform": "translate3D(" + left + ", " + top + ")",
            //     "-ms-transform": "translate3D(" + left + ", " + top + ")",
            //     "-o-transform": "translate3D(" + left + ", " + top + ")",
            //     "transform": "translate3D(" + left + ", " + top + ")"
            // });
        },

        zoomTo: function (zoom) {
            this.currentState.zoom = zoom;
            this.setScaler();
            if (this.infiniteDistance) {
                this.height = this.original.height * this.scaler;
                this.width = this.original.width * this.scaler;
            } else {
                this.height = this.physical.height * this.scaler;
                this.width = this.physical.width * this.scaler;
            }
            this.$el.css({
                height: this.height,
                width: this.width
            });
            this.setCentre();
        },

        viewFromDistance: function (distanceForward) {
            if (!this.infiniteDistance) {
                this.currentState.distance = this.physical.distance - distanceForward;
                this.setScaler();
                if (distanceForward >= this.physical.distance) {
                    this.height = this.physical.height;
                    this.width = this.physical.width;
                    this.$el.css({
                        opacity: 0
                    });
                } else {
                    this.height = this.physical.height * this.scaler;
                    this.width = this.physical.width * this.scaler;
                }
                this.$el.css({
                    height: this.height,
                    width: this.width
                });
            }
            this.setCentre();
        }
    };

    /*
        Plugin
        Constructor for a temporary object used as a container for properties used in setting up/tearing down the deferred functions
        @constructor
     */
    var Plugin = function ($el, options) {

        this.options = options;
        this.$el = $el;
        this.init();
    };

    /*
        Plugin.init
        Applies the plugin according to the options passed to it
     */
    Plugin.prototype = {
        
        init: function () {
            this.$layers = this.$el.find('.viewfinder-layer');
            this.prepareLayers();
            this.currentViewpoint = this.options.viewpoint;
            this.render();
        },


        prepareLayers: function () {
            var self = this;

            this.layers = [];

            this.options.viewport = {
                height: this.$el.height(),
                width: this.$el.width()
            },

            this.$layers.each(function () {
                    
                self.layers.push(new Layer($(this), self.options));
                
            });
        },

        zoom: function () {
            var newZoom = this.options.zoom;
            if (newZoom !== this.currentZoom) {
                _.each(this.layers, function (i, layer) {
                    layer.zoomTo(newZoom);
                });
            }

            this.currentZoom = newZoom;
        },

        panAndTilt: function () {

        },

        move: function () {
            var newViewpoint = this.options.viewpoint;
            if (newViewpoint.z !== this.currentViewpoint.z) {
                _.each(this.layers, function (i, layer) {
                    layer.viewFromDistance(newViewpoint.z);
                });
            }

            this.currentViewpoint = newViewpoint;
        },

        reRender: function (newOptions) {
            this.options = newOptions;
            this.render();

        },

        render: function () {
            this.zoom();
            this.move();
            this.panAndTilt();
        },

        destroy: function () {

        }
    };


    /*
        jquery.viewfinder
        @see Plugin
     */
    $.fn.viewfinder = function(options) {

        options = $.extend(true, {}, $.fn.viewfinder.defaults, options);

        return $(this).each(function () {

            var $el = $(this),
                instanceOptions = $el.data('viewfinder-options'),
                previousInstance = $el.data('viewfinder');

            instanceOptions = instanceOptions ? $.extend(true, options, instanceOptions) : options;

            if (!previousInstance || instanceOptions.overwrite) {
                
                previousInstance && previousInstance.destroy();
                
                $el.data('viewfinder', new Plugin($el, instanceOptions));
            } else {
                previousInstance.reRender(instanceOptions);
            }
        });

    };

    $.fn.viewfinder.defaults = {
        zoom: 1,
        pan: 0,
        tilt: 0,
        viewpoint: {
            x: 0,
            y:1.5,
            z:0
        },
        verticalBase: 'bottom' // or centre
    };


}(jQuery, window, document));