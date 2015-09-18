/**
 * A collection of useful functions for the browser
 */

/*jshint strict: true */
/*global define */

define(['jquery', 'lodash'], function ($, _) {
    "use strict";

    function resolve(url, base_url) {
        var doc      = document,
            old_base = doc.getElementsByTagName('base')[0],
            old_href = old_base && old_base.href,
            doc_head = doc.head || doc.getElementsByTagName('head')[0],
            our_base = old_base || doc_head.appendChild(doc.createElement('base')),
            resolver = doc.createElement('a'),
            resolved_url;
        our_base.href = base_url;
        resolver.href = url;
        resolved_url  = resolver.href; // browser magic at work here

        if (old_base) {
            old_base.href = old_href;
        }
        else {
            doc_head.removeChild(our_base);
        }
        return resolved_url;
    }

    function selectRandomOption($select, acceptableChoices) {
        if (acceptableChoices) {
            var options = $select.find('option');
            var optionValues = _.map(options, function(option) {
                return $(option).val();
            });
            acceptableChoices = _.map(acceptableChoices, function(choice) {
                return "" + choice;
            });
            acceptableChoices = _.intersection(optionValues, acceptableChoices);
            if (acceptableChoices.length !== 0) {
                var choice = _.sample(acceptableChoices);
                var $option = $select.find("option[value='" + choice + "']");
                $option.attr('selected', true);
            }
        }
    }

    function dummyElementFromClass(fromClasses, callback) {
        var $el = $(document.createElement('div'));
        $el.css('display', 'none');
        _.each(fromClasses, function(fromClass) {
            $el.addClass(fromClass);
        });
        $("body").append($el); // add to DOM
        try {
            callback($el);
        }
        finally {
            $el.remove(); // remove from DOM
        }
    }

    function getCSS(prop, fromClasses) {
        var x = null;
        dummyElementFromClass(fromClasses, function($el) {
            x = $el.css(prop);
        });
        return x;
    }

    function getElementSizeWithMargins($el) {
        var w = $el.width();
        var h = $el.height();
        w += parseInt($el.css('margin-left'), 10);
        w += parseInt($el.css('margin-right'), 10);
        w += parseInt($el.css('padding-left'), 10);
        w += parseInt($el.css('padding-right'), 10);
        h += parseInt($el.css('margin-top'), 10);
        h += parseInt($el.css('margin-bottom'), 10);
        h += parseInt($el.css('padding-top'), 10);
        h += parseInt($el.css('padding-bottom'), 10);
        return [w, h];
    }

    return {
        lockForm: function($form) {
            var $button = $form.find(":submit");
            $button.attr('disabled', 'disabled');
            $button.val("Please wait...");
        },

        toAbsoluteUrl: function(relativeUrl) {
            return resolve(relativeUrl, window.location.href);
        },

        createTable: function(options) {
            var $el = options.$el;
            var cols = options.cols;
            var rows = options.rows;
            var tdCallback = options.tdCallback || function(x) {};
            var i = 0;
            _.each(_.range(rows), function(row) {
                var $tr = $(document.createElement('tr'));
                _.each(_.range(cols), function(col) {
                    var $td = $(document.createElement('td'));
                    tdCallback({ row: row, col: col, cell: i, $td: $td });
                    $tr.append($td);
                    i += 1;
                });
                $el.append($tr);
            });
        },

        /**
         * @param $select - jQuery select element
         * @param items - strings to add as option elements
         * @param defaultItem - optional - the default selected item
         */
        fillSelectBox: function(options) {
            var $select = options.$select;
            var items = options.items;
            var itemNames = options.itemNames;
            if (items && !itemNames) {
                itemNames = items;
            }
            else if (itemNames && !items) {
                items = _.range(itemNames.length);
            }
            var defaultItem = options.defaultItem;
            var random = options.random;
            var randomChoices = options.randomChoices;
            $select.find('option').remove();  // Clear first
            _.each(items, function(item, i) {
                var $option = $(document.createElement('option'));
                $option.attr('value', item);
                $option.html(itemNames[i]);
                $select.append($option);
                if (defaultItem && item === defaultItem) {
                    $option.attr('selected', true);
                }
            });
            if (random) {
                selectRandomOption($select, randomChoices || items);
            }
        },

        addItemsToList: function(items, $list) {
            _.each(items, function(item) {
                var $li = $(document.createElement('li'));
                $li.html(item);
                $list.append($li);
            });
        },

        getCssSizeWithMargins: function(cssClasses) {
            var x = null;
            dummyElementFromClass(cssClasses, function($el) {
                x = getElementSizeWithMargins($el);
            });
            return x;
        },

        monitorPageVisibility: function(options) {
            var hidden = "hidden";
            var onVisible = options.onVisible;
            var onHidden = options.onHidden;

            // Standards:
            if (hidden in document) {
                document.addEventListener("visibilitychange", onchange);
            }
            else if ((hidden = "mozHidden") in document) {
                document.addEventListener("mozvisibilitychange", onchange);
            }
            else if ((hidden = "webkitHidden") in document) {
                document.addEventListener("webkitvisibilitychange", onchange);
            }
            else if ((hidden = "msHidden") in document) {
                document.addEventListener("msvisibilitychange", onchange);
            }
            // IE 9 and lower:
            else if ('onfocusin' in document) {
                document.onfocusin = document.onfocusout = onchange;
            }
            // All others:
            else {
                window.onpageshow = window.onpagehide =
                    window.onfocus = window.onblur = onchange;
            }
            function onchange (evt) {
                var v = 'visible', h = 'hidden';
                var evtMap = {
                    focus:v, focusin:v, pageshow:v,
                    blur:h, focusout:h, pagehide:h
                };

                evt = evt || window.event;
                if (evt.type in evtMap) {
                    if (evtMap[evt.type] === h) {
                        onHidden();
                    }
                    else if (evtMap[evt.type] === v) {
                        onVisible();
                    }
                }
                else {
                    if (this.hidden) {
                        onHidden();
                    }
                    else {
                        onVisible();
                    }
                }
            }
        },

        gotoPageIfNotAlready: function(url) {
            if (window.location.href !== url) {
                window.location.href = url;
            }
        },

        isWithoutServer: function() {
            return window.location.protocol === "file:";
        },

        getCSS: getCSS,
        getElementSizeWithMargins: getElementSizeWithMargins

        /*
        keepScreenFromSleeping: function() {
            setInterval(function() {  // Try to keep screen from sleeping
                var $target = $(window);
                $target.simulate("mousemove", {
                    clientX: 10, clientY:0, pageX:10, pageY:0, dx:50, dy:50
                });
            }, 5000);
        }
        */
    };
});