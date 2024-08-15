define([
    'vue',
    'bpm:directive:contentHeight',
    'bpm:directive:tableLoading',
    'fam:directive:selectLoadMore'
], function () {
    const Vue = require('vue');
    const contentHeight = require('bpm:directive:contentHeight');
    const tableLoading = require('bpm:directive:tableLoading');
    const selectLoadMore = require('fam:directive:selectLoadMore');
    Vue.use(contentHeight);
    Vue.use(tableLoading);
    Vue.use(selectLoadMore);
});

define('fam:directive:selectLoadMore', ['underscore'], function (_) {
    return {
        install(Vue) {
            Vue.directive('plat-select-load-more', {
                bind(el, binding) {
                    let $selectDom = el.querySelector('.el-select-dropdown .el-select-dropdown__wrap');
                    $selectDom.addEventListener(
                        'scroll',
                        _.debounce(function () {
                            let scrollHeight = $selectDom.scrollHeight;
                            let clientHeight = $selectDom.clientHeight;
                            let scrollTop = $selectDom.scrollTop;
                            let scrollBottom = scrollTop + clientHeight;
                            if (scrollBottom >= scrollHeight - 50) {
                                binding.value && binding.value();
                            }
                        }, 100)
                    );
                },
                unbind(el) {
                    let $selectDom = el.querySelector('.el-select-dropdown.el-select-dropdown__wrap');
                    $selectDom.removeEventListener('scroll');
                }
            });
        }
    };
});

define('bpm:directive:contentHeight', ['vue', 'jquery'], function () {
    return {
        install(Vue) {
            Vue.directive('bpm-height', {
                inserted(el, { arg }) {
                    const $el = $(el);
                    const offsetTop = ($el.offset() || { top: 0 }).top;
                    let spacing =
                        parseInt($el.css('margin-bottom')) +
                        parseInt($el.css('border-top')) +
                        parseInt($el.css('border-bottom')) +
                        parseInt($el.css('padding-top')) +
                        parseInt($el.css('padding-bottom'));
                    spacing = arg ? +arg : spacing;
                    $(el).height($(window).height() - offsetTop - spacing);
                },
                update(el, { arg }) {
                    const $el = $(el);
                    const offsetTop = ($el.offset() || { top: 0 }).top;
                    let spacing =
                        parseInt($el.css('margin-bottom')) +
                        parseInt($el.css('border-top')) +
                        parseInt($el.css('border-bottom')) +
                        parseInt($el.css('padding-top')) +
                        parseInt($el.css('padding-bottom'));
                    spacing = arg ? +arg : spacing;
                    $(el).height($(window).height() - offsetTop - spacing);
                }
            });
        }
    };
});

define('bpm:directive:tableLoading', ['vue'], function (Vue) {
    const toggleLoading = (el, binding) => {
        if (binding.value) {
            Vue.nextTick(() => {
                el.instance.visible = true;
                insertDom(el, el, binding);
            });
        } else {
            Vue.nextTick(() => {
                el.instance.visible = false;
            });
        }
    };

    const insertDom = (parent, el) => {
        parent.appendChild(el.mask);
    };

    return {
        install(Vue) {
            Vue.directive('bpm-loading', {
                bind(el, binding) {
                    const mask = Vue.prototype.$loading({
                        target: el,
                        spinner: 'erd-iconfont erd-icon-loading wf-loading',
                        ...binding
                    });
                    //用一个变量接住mask实例
                    el.instance = mask;
                    el.mask = mask.$el;
                    el.maskStyle = {};
                    toggleLoading(el, binding);
                },
                update(el, binding) {
                    if (binding.oldValue !== binding.value) {
                        toggleLoading(el, binding);
                    }
                },
                unbind(el) {
                    el.instance && el.instance.$destroy();
                }
            });
        }
    };
});
