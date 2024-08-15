define([
    'jquery',
    'text!' + ELMP.resource('erdc-pdm-nds/htmls/comments-list.html'),
    ELMP.resource('erdc-pdm-nds/mixins/expended-handle.js'),
    'css!' + ELMP.resource('erdc-pdm-nds/css/comments-list.css')
], function ($, tpl, customExpend) {
    const _ = require('underscore');
    return {
        template: tpl,
        mixins: [customExpend],
        props: {
            list: {
                type: Array,
                default: []
            }
        },
        data() {
            return {
                // 当前点击回复的对象
                activeReplyComment: null,
                // 国际化locale文件地址
                i18nPath: ELMP.resource('erdc-pdm-nds/locale/index.js')
            };
        },
        computed: {
            // 处理一下原始的评论数据
            getRenderData() {
                if (_.isEmpty(this.list)) {
                    return [];
                }
                return this.list.map((d) => {
                    d.commentContent = JSON.parse(d.commentContent);
                    // reply输入框的开关按钮; 默认关闭
                    this.$set(d, '_isOpenReplyInput', false);
                    return d;
                });
            }
        },
        updated() {
            // console.log(this.getRenderData)
        },
        components: {
            commentsTextarea: (resolve) => require([ELMP.resource('erdc-pdm-nds/js/textarea.js')], resolve)
        },
        filters: {
            // 解码文本信息
            decodeText(raw) {
                return decodeURIComponent(raw);
            },
            // 补充reply的@人员相关字符
            formatReplyCall(raw) {
                return `@${raw} :`;
            },
            // 标注类型标签
            getTagType(raw) {
                // 根据批注类型找对应的国际化
                let type = raw.commentContent._pdmExpended.type;
                let handleTips = (postilType) => {
                    let placeholder = {
                        'text': this.i18n?.['文字'],
                        'plain-text': this.i18n?.['纯文字'],
                        'img-text': '图片'
                    }[postilType];
                    return this.i18n?.[placeholder];
                };
                // 文字/纯文字/图片批注
                return {
                    'text': handleTips('text'),
                    'plain-text': handleTips('plain-text'),
                    'img-text': handleTips('img-text')
                }[type];
            }
        },
        methods: {
            // 新迪模型的iframe的windows对象
            getIframeWin() {
                document.getElementById('#iframeDiv').querySelectorAll('iframe')[0].contentWindow;

                // return $('#iframeDiv').find('iframe')[0].contentWindow;
            },
            // 图片失效时的占位图片
            handleErrorImg(e) {
                let el = e.target,
                    src = el.src;
                let errorImgUrl = ELMP.resource('erdc-pdm-nds/image/error-img.svg');
                if (src === errorImgUrl) {
                    return void 0;
                }
                document.getElementById(el).setAttribute('src', errorImgUrl);
                return true;
            },
            // 回复评论框的内容对象
            async getReplyComments(data) {
                // console.log("回复对象内容 :", data)
                // console.log("reply : ", this.activeReplyComment)
                let { content: text } = data;
                if (_.isEmpty(text)) {
                    // 请输入内容
                    this.$message.info(this.i18n['请输入']);
                    return false;
                }
                // 获取当前登录人员信息; 混入文件里的方法
                let userInfo = await this.getCurrentUserInfo();
                await this.replayComments({
                    commentRef: this.activeReplyComment.oid,
                    commentUser: userInfo.id,
                    replayContent: text
                });
                // 刷新评论区但是不刷新新迪模型
                this.$emit('handle-remove', '新增reply成功', false);
            },
            // 激活指定uuid的标注
            activeTagByUUID(raw) {
                let uuid = raw.commentContent.state.uuid;
                window.nd_viewCtrl.selectTag(uuid);
            },
            /**
             * 删除批注
             * @param {*} raw 主评论批注 or reply子评论
             * @param {*} isReplyItem 是子评论对象么?
             */
            removeComment(raw, isReplyItem = false) {
                // 该操作不可挽回，是否继续？
                let tips = this.i18n['该操作不可挽回是否继续'];
                $.msg.confirm(
                    tips,
                    async () => {
                        let oid = raw.oid;
                        await this.removeCommentByOid(oid);
                        // 不是replyItem的话需要刷新新迪模型;
                        this.$emit('handle-remove', raw, !isReplyItem);
                    },
                    () => {}
                );
            },
            // 开启reply输入框
            openReplyBox(raw) {
                _.each(this.getRenderData, (d) => {
                    d._isOpenReplyInput = false;
                });
                raw._isOpenReplyInput = !raw._isOpenReplyInput;
                this.activeReplyComment = raw;
            }
        }
    };
});
