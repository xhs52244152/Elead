define([
    'text!' + ELMP.resource('biz-template/team-template/index.html'),
    'erdcloud.kit',
    'css!' + ELMP.resource('biz-template/team-template/style.css')
], function (template) {
    const ErdcKit = require('erdcloud.kit');

    return {
        template,
        components: {
            ResizableContainer: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamResizableContainer/index.js')),
            ManageTeamTree: ErdcKit.asyncComponent(
                ELMP.resource('biz-template/team-template/components/ManageTeamTree/index.js')
            ),
            ManageTeamForm: ErdcKit.asyncComponent(ELMP.resource('biz-template/team-template/components/ManageTeamForm/index.js'))
        },
        data() {
            return {
                data: {}
            };
        },
        mounted() {},
        methods: {
            onSubmit(data) {
                this.data = data;
                this.$nextTick(() => {
                    this.$refs.ManageTeamForm.refresh();
                });
            },
            onRefresh(key) {
                this.$refs.ManageTeamTree.refresh(key);
            }
        }
    };
});
