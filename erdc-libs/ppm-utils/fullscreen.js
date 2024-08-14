/**
 * 最大化、最小化
 */
define([], function () {
    class Fullscreen {
        /**
         * 构造函数
         * @param {Bom} targetDom 最大化、最小化的目标dom
         * @param {Object} options 配置
         */
        constructor(targetDom, options = {}) {
            this.targetDom = $(targetDom)[0];
            this.options = $.extend(
                true,
                {
                    zIndex: 1000, // 遮罩层的z-index
                    paddingValue: '20px' // 最大化后，padding值
                },
                options || {}
            );
            this.id = null; // 卡片最大化前，用该id的dom占用原来的位置（便于最小化时找到此dom再挪回来）
            this.maskKeyword = null; //卡片最大化，遮罩层等相关关键字（便于最小化时根据关键字删除该dom）
        }
        // 最大化（外部调用）
        setFullscreen(callback) {
            this.id = `custom-fullscreen-position-${+new Date()}`;
            $(this.targetDom).after(`<div id="${this.id}"></div>`); // 添加dom占用原有位置
            this.createMask(); // 创建遮罩
            // 最大化之后的事件
            if (typeof callback === 'function') {
                callback();
            }
        }
        // 最小化（外部调用）
        exitFullscreen(callback) {
            $(`#${this.id}`).before(this.targetDom); // 将卡片dom挪到原有位置
            $(`#${this.id}`).remove(); // 删除占用位置的dom
            $(`[${this.maskKeyword}]`).remove(); // 删除遮罩层与外层盒子
            // 最小化之后的事件
            if (typeof callback === 'function') {
                callback();
            }
        }
        // 创建遮罩
        createMask() {
            let dialogWrapperClass = 'el-dialog__wrapper'; // el-dialog__wrapper为平台现有class样式
            this.maskKeyword = `custom-fullscreen-mask="${+new Date()}"`;
            // 添加 遮罩层  v-modal为平台现有class样式
            $('body').append(`<div class="v-modal" ${this.maskKeyword} style="z-index:${this.options.zIndex}"></div>`);
            // 添加外层盒子
            $('body').append(
                `<div class="${dialogWrapperClass}" ${this.maskKeyword} style="z-index:${this.options.zIndex + 1};padding: ${this.options.paddingValue};"></div>`
            );
            // 将现有内容插入到外层盒子
            $(`[${this.maskKeyword}].${dialogWrapperClass}`).append(this.targetDom);
        }
    }
    return Fullscreen;
});
