/*
 * viewfinder
 * https://github.com/wheresrhys/jquery.defer
 *
 * Copyright (c) 2013 Rhys Evans
 * Licensed under the MIT license.
 */

(function($) {


    /*
        Plugin
        Constructor for a temporary object used as a container for properties used in setting up/tearing down the deferred functions
        @constructor
     */
    var Plugin = function ($el, options) {

        this.options = options;
        this.init();
    };

    /*
        Plugin.init
        Applies the plugin according to the options passed to it
     */
    Plugin.prototype.init = function () {
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
                
                previousInstance && previousInsatance.destroy();
                
                $el.data('viewfinder', new Plugin($el, instanceOptions));
            }
        });

    };

    $.fn.viewfinder.defaults = {

    };


}(jQuery));
