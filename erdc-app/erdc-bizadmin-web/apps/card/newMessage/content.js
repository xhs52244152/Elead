//最新消息
define([
    'text!' + ELMP.resource('newMessage/template.html'),
    'erdcloud.kit',
    'css!' + ELMP.resource('newMessage/content.css')
], function (tmpl, erdcloudKit) {
    return {
        template: tmpl,
        props: {
            title: String
        },
        data: function () {
            return {
                total: 0,
                datas: [],
                i18nPath: ELMP.resource('locale/index.js', 'newMessage')
            };
        },
        components: {
            MessageContent: erdcloudKit.asyncComponent(ELMP.resource('newMessage/MessageContent/manage_content.js')),
            FamEmpty: erdcloudKit.asyncComponent(ELMP.resource('erdc-components/FamEmpty/index.js'))
        },
        methods: {
            handleMsgDetail(message) {
                this.$refs.msgContent.show(message);
                this.handleMsgRead(message.id);
            },
            handleMsgRead(ids) {
                var self = this;
                this.$famHttp.put(`/message/msg/v1/msg/${ids}`).then(function (resp) {
                    if (resp.success) {
                        self.loadData();
                    }
                });
            },
            loadData: function () {
                var self = this;
                this.$famHttp({
                    url: '/message/msg/v1/list',
                    params: {
                        // count_only: true,
                        page_index: 1,
                        page_size: 5,
                        readed: '1',
                        className: 'erd.cloud.message.entity.EtMessageSender'
                    }
                }).then((resp) => {
                    if (resp.success) {
                        self.datas = resp.data.records || [];
                        self.total = resp.data.total;
                    }
                });
            }
        },
        created: function () {
            this.loadData();
        }
    };
});
