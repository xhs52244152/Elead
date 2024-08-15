define([
    'text!' + ELMP.resource('erdc-pdm-nds/htmls/textarea.html'),
    'css!' + ELMP.resource('erdc-pdm-nds/css/textarea.css')
], function (tpl) {
    return {
        name: 'commentsTextarea',
        template: tpl,
        emits: ['handle-submit'],
        data() {
            return {
                // 评论
                comments: {
                    content: ''
                },
                // 国际化locale文件地址
                i18nPath: ELMP.resource('erdc-pdm-nds/locale/index.js')
            };
        },
        methods: {
            clear() {
                this.comments = {
                    content: ''
                };
            },
            // 确认
            yes() {
                this.comments.content = this.comments.content.trim();
                this.$emit('handle-submit', this.comments);
                this.clear();
            },
            // 取消
            cancel() {
                this.clear();
            },
            // ctrl + enter
            keyDown(e) {
                if (e.ctrlKey && e.keyCode == 13) {
                    this.yes();
                }
            }
        }
    };
});
