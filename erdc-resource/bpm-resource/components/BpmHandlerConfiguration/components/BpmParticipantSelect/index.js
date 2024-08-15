/**
 * Created by shangchi li on 2012/11/16.
 * 流程更换节点处理人
 *
 */

define([
    'text!' +
        ELMP.resource('bpm-resource/components/BpmHandlerConfiguration/components/BpmParticipantSelect/index.html'),
    'css!' + ELMP.resource('bpm-resource/components/BpmHandlerConfiguration/components/BpmParticipantSelect/index.css')
], function (template) {
    const ErdcKit = require('erdcloud.kit'),
        _ = require('underscore');
    let scrollNumber = 0,
        observer = null;
    return {
        name: 'BpmParticipantSelect',
        template,
        components: {
            FamErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
            FamParticipantSelect: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamParticipantSelect/index.js'))
        },
        props: {
            tableData: {
                type: Array,
                default: function () {
                    return [];
                }
            },
            column: {
                type: Array,
                default: () => {
                    return [];
                }
            }
        },
        data() {
            return {};
        },
        mounted() {
            window.addEventListener('scroll', this.movePositionElSelectDropdown, true);
        },
        beforeDestroy() {
            window.removeEventListener('scroll', this.movePositionElSelectDropdown);
            // 停止观察
            observer && observer.disconnect();
        },
        methods: {
            movePositionElSelectDropdown($event) {
                if (
                    $event.target.className ===
                    'el-select-dropdown__wrap el-scrollbar__wrap el-scrollbar__wrap--hidden-default'
                ) {
                    return;
                }
                let s = $event.target.scrollTop || $event.target.scrollTop || 0;
                this.$nextTick(() => {
                    let dropdownDom = $('body').children('.el-select-dropdown.el-popper');
                    _.each(dropdownDom, (item) => {
                        item = $(item);
                        if (item.css('display') !== 'none' && item.css('top')) {
                            item.css(
                                'top',
                                +item.css('top').slice(0, item.css('top').length - 2) - (s - scrollNumber) + 'px'
                            );
                        }
                    });
                    scrollNumber = s;
                });
            },
            // 下拉框出现触发事件
            visibleChange(type, scope) {
                this.$emit('visible-change', type, scope);
            },
            // 下拉框选中值变化
            optionsChange(val, data, scope) {
                this.$emit('options-change', val, data, scope);
            },
            initTagNumber({ row, column, rowid }) {
                if (column.field !== 'participantRef') {
                    return;
                }
                if (!column.params.multiple({ row })) {
                    return;
                }
                let { $el } = this.$refs['participantSelect_' + rowid] || {};
                let tagLIstDom = $el.querySelector('.el-select__tags');
                let tagSpanDom = $el.querySelector('.el-select__tags > span');
                let hideDom = document.createElement('span');
                hideDom.classList = ['tag-count-node el-tag el-tag--info el-tag--small el-tag--light']; //设置样式
                tagSpanDom.appendChild(hideDom); //插入到span中
                const config = { childList: true };

                // 当观察到突变时执行的回调函数
                const callback = function (mutationsList) {
                    _.each(mutationsList, (item) => {
                        if (item.type === 'childList') {
                            let tagList = item.target.childNodes || [];
                            let tagWidth = 0; //标签总宽度
                            let tagNum = 0; //标签多余个数

                            for (let i = 0; i < tagList.length; i++) {
                                const e = tagList[i];
                                if (tagWidth > tagLIstDom.offsetWidth - 26) {
                                    e.style.display = 'none'; //隐藏多余标签
                                } else {
                                    e.style.display = 'flex'; //显示标签
                                }
                                tagWidth += e.offsetWidth + 8;
                                if (tagWidth > tagLIstDom.offsetWidth - 26) {
                                    e.style.display = 'none'; //隐藏多余标签
                                } else {
                                    e.style.display = 'flex'; //显示标签
                                }
                                if (e.style.display !== 'none') {
                                    tagNum++;
                                    hideDom.style.display = 'none'; //隐藏多余标签个数
                                } else {
                                    hideDom.style.display = 'inline-block'; //显示多余标签个数
                                    hideDom.innerHTML = `+${tagList.length - tagNum}`; //显示多余标签个数
                                }
                            }
                        }
                    });
                };

                // 创建一个链接到回调函数的观察者实例
                observer = new MutationObserver(callback);

                // 开始观察已配置突变的目标节点
                observer.observe(tagSpanDom, config);
            }
        }
    };
});
