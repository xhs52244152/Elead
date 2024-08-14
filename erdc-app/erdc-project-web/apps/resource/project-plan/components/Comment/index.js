define([
    'vue',
    'erdcloud.kit',
    'text!' + ELMP.resource('project-plan/components/Comment/index.html'),
    'css!' + ELMP.resource('project-plan/components/Comment/index.css')
], function (Vue, ErdcKit, template) {
    let comment = {
        name: 'msgComment',
        template: template,
        data() {
            return {
                total: null,
                msgCommentList: [
                    {
                        id: '1',
                        umsUserInfo: '',
                        isShowMsgNewImg: true
                    }
                ]
            };
        },
        methods: {
            getMsgCommentList() {},
            //获取评论回复的消息
            getMsgReplyList() {},
            //删除消息
            deleteMsgCommentHandler() {},
            //更新未读消息提示
            updateNoSeeMsgCommentHandler() {},
            currentChangeHanlder() {}
        },
        filters: {
            titleFormat(val) {
                var len = 0;
                for (var i = 0; i < val.length; i++) {
                    var c = val.charCodeAt(i);
                    //单字节加1
                    if ((c >= 0x0001 && c <= 0x007e) || (0xff60 <= c && c <= 0xff9f)) {
                        len++;
                    } else {
                        len += 2;
                    }
                }
                if (len > 12) return val.substring(0, 6) + '...';
                else return val;
            },
            timeFormat(val) {
                return new Date(+new Date(val) + 8 * 3600 * 1000)
                    .toISOString()
                    .replace(/T/g, ' ')
                    .replace(/\.[\d]{3}Z/, '');
            }
        },
        created() {
            //初始化回复消息
            // this.getMsgCommentList();
            // this.getMsgReplyList();
        },
        mounted() {}
    };
    return comment;
});
