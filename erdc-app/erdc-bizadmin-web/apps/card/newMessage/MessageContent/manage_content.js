define([
    'text!' + ELMP.resource('newMessage/MessageContent/manage_content.html'),
    'css!' + ELMP.resource('newMessage/MessageContent/manage_content.css')
], function (template) {
    return {
        template: template,
        data() {
            return {
                visible: false,
                id: '',
                content: '',
                msgTitle: '',
                userName: '',
                sub_name: '',
                notify_name: '',
                updateTime: ''
            };
        },

        methods: {
            show(msg) {
                this.id = msg.id || '';
                this.content = msg.content || '';
                this.msgTitle = msg.subjectTitle || '';
                this.sub_name = msg.subject_name || '';
                this.userName = msg.userName || '';
                this.notify_name = msg.notify_name || '';
                this.updateTime = msg.updateTime || '';

                this.visible = true;

                if (msg.id && msg.readed !== '2') {
                    this.$emit('readed', msg.id);
                }
            },
            close() {
                this.visible = false;
            }
        }
    };
});
