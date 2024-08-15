define([
    'EventBus',
    'text!' + ELMP.resource('erdc-pdm-nds/htmls/comments-section.html'),
    ELMP.resource('erdc-pdm-nds/mixins/expended-handle.js'),
    'css!' + ELMP.resource('erdc-pdm-nds/css/comments-section.css')
], function (EventBus, tpl, customExpend) {
    const _ = require('underscore');
    return {
        template: tpl,
        mixins: [customExpend],
        props: {
            // 存储了所有批注对象的数组
            commentsArr: {
                type: Array,
                default: []
            },
            params: {
                type: Object,
                default() {
                    return {};
                }
            }
            // 是否显示加载动画
            // loading: {
            //     type: Boolean,
            //     default: false
            // }
        },
        data() {
            return {
                open: true,
                // 激活的tabs
                activeTabs: 'comments',
                // 评论列表
                list: [],
                // 是否显示重载按钮
                showRefreshBtn: false,
                loading: true,
                // 国际化locale文件地址
                i18nPath: ELMP.resource('erdc-pdm-nds/locale/index.js')
            };
        },
        components: {
            commentsTextarea: (resolve) => require([ELMP.resource('erdc-pdm-nds/js/textarea.js')], resolve),
            commentsList: (resolve) => require([ELMP.resource('erdc-pdm-nds/js/comments-list.js')], resolve)
        },
        computed: {
            // 伸缩门的箭头类名
            getArrows() {
                return {
                    true: ['el-icon-d-arrow-right'],
                    false: ['el-icon-d-arrow-left']
                }[this.open];
            },
            // 用来控制收起还是展开评论区
            isClosedClass() {
                return {
                    true: [],
                    false: ['closed']
                }[this.open];
            },
            // 评论区渲染内容数据
            getCommentsListRenderData() {
                return this.commentsArr;
            }
        },
        mounted() {
            // 5s后尝试显示重载按钮
            setTimeout(() => {
                this.showRefreshBtn = true;
            }, 5000);

            this.$nextTick(() => {
                this.loading = false;
            });
        },
        methods: {
            // 切换tab
            handleClick() {},
            // 收起还是展开的标记,许多class类名都基于它来控制
            toggleSlide() {
                this.open = !this.open;
            },
            // 获取顶部评论框内容对象
            async getTopComments(data) {
                // console.log("获取顶部评论区内容 :", data)
                let { content: text } = data;
                if (_.isEmpty(text)) {
                    // 请输入内容
                    this.$message.info(this.i18n['请输入内容']);
                    return false;
                }
                // 组装一个没有批注的主回复.
                let tag = {
                    text: text,
                    _pdmExpended: {
                        type: 'plain-text'
                    }
                };
                // this.getParams 是混入文件里的计算属性; 这里因为是纯文本回复，没有标注，所以绕过校验
                let params = _.extend({}, this.params, { checkTag: false });
                await this.saveTagAjax(tag, '', params);
                this.$emit('handler-update', params);
            },
            // 移除一条主评论
            removeCommentItem(data, refreshModels = true) {
                // console.log("移除一条主评论 :", data)
                // 刷新评论区
                this.$emit('handler-update', this.i18n['删除主评论后刷新评论区']);
                // 刷新新迪模型
                refreshModels && EventBus.emit('refresh:nds:model', data);
            },
            // 新增一条reply评论
            addCommentItem() {
                // console.log("新增一条reply评论 ：",data);
                // 刷新评论区
                this.$emit('handler-update', this.i18n['新增reply评论后刷新评论区']);
            },
            // 重新加载全部
            reloadAll() {
                this.$emit('handler-error-refresh', 'reload-all');
            }
        }
    };
});
