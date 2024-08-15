/**
 * 添加水印
 */
(function(factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else if (typeof exports === 'object') {
        // Node/CommonJS style for Browserify
        module.exports = factory;
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function() {
    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
    var globalOptions = {
        fontSize: 14,
        text: '水印',
        el: document.body,
        rotate: -45,
        opacity: 0.08,
        color: '#000',
        gap: 100
    };

    function encode(val) {
        return val.trim().replace(/\n/g, '').replace(/"/g, '\'').replace(/%/g, '%25').replace(/#/g, '%23').replace(/{/g, '%7B').replace(/}/g, '%7D').replace(/</g, '%3C').replace(/>/g, '%3E');
    }

    function watermark(options) {
        var self = this;
        this.key = new Date().getTime();
        this.varKey = `--${this.key}-watermark`;
        this.options = Object.assign({}, globalOptions, options);
        var rootDom = this.options.el;
        var fontSize = this.options.fontSize;
        var svgText = this.options.text;
        var svgWidth = fontSize * svgText.length + this.options.gap;
        var opacity = this.options.opacity;
        var color = encode(this.options.color);
        var svgHeight = svgWidth;
        var rotate = this.options.rotate;
        this.watermarksvg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${svgWidth}px' height='${svgHeight}px'%3E  %3Ctext  x='${fontSize}' y='0'  fill-opacity='${opacity}' fill='${color}' transform='translate(0,${svgHeight})rotate(${rotate})'    font-size='${fontSize}'%3E${svgText}%3C/text%3E%3C/svg%3E")`;
        this.reload();
        var mutationObserver = new MutationObserver(function callback(mutationsList) {
            function checkId() {
                for (var i of mutationsList) {
                    if (i.target.id && i.target.id == self.key) {
                        return true;
                    }
                }
                return false;
            }

            //mutationsList.length === 1  表明是修改
            // mutationsList.length === 1 && mutationsList[0].removedNodes.length >= 1 表明是从父级里面删掉了水印
            if (mutationsList.length === 1 || mutationsList.length === 1 && mutationsList[0].removedNodes.length >= 1 || checkId()) {
                self.reload();
            }
        });
        mutationObserver.observe(this.options.el, {
            subtree: true,
            childList: true,
            attributes: true
        });
    }

    watermark.prototype.reload = function() {
        if (this.options.watermarkDiv && document.getElementById(this.key)) {
            this.options.el.removeChild(this.options.watermarkDiv);
        }
        var watermarkDiv = document.createElement('div');
        this.options.watermarkDiv = watermarkDiv;
        watermarkDiv.id = this.key;
        watermarkDiv.setAttribute('style', `z-index: 99999;position:absolute;left:0;top:0;bottom:0;right:0;pointer-events: none !important; background: ${this.watermarksvg};margin: 10px;`);
        /*将dom随机插入body内的任意位置*/
        var nodeList = this.options.el.children;
        var index = Math.floor(Math.random() * (nodeList.length - 1));
        if (nodeList[index]) {
            this.options.el.insertBefore(watermarkDiv, nodeList[index]);
        } else {
            this.options.el.appendChild(watermarkDiv);
        }
    };

    function watermarkFactory(options) {
        return new watermark(options);
    }

    return watermarkFactory;
}));
