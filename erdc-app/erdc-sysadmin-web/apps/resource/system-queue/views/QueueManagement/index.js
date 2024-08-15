define([
    'erdc-kit',
    'text!' + ELMP.resource('system-queue/views/QueueManagement/index.html'),
    'vue',
    'erdcloud.kit'
], function (utils, template) {
    const ErdcKit = require('erdcloud.kit');

    return {
        template,
        components: {
            ResizableContainer: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamResizableContainer/index.js')),
            QueueTree: ErdcKit.asyncComponent(ELMP.resource('system-queue/components/QueueTree/index.js')),
            QueueList: ErdcKit.asyncComponent(ELMP.resource('system-queue/components/QueueList/index.js'))
        },
        data() {
            return {
                title: '',
                oid: '',
                data: {}
            };
        },
        methods: {
            onSubmit(data) {
                this.title = data.displayName || '';
                this.oid = data.oid || '';
                this.data = data || {};
            }
        }
    };
});
