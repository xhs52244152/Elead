define([
    'erdcloud.kit',
    ELMP.resource('ppm-store/index.js'),
    'text!' + ELMP.resource('project-plan/edit-plan/index.html'),
    'css!' + ELMP.resource('project-plan/edit-plan/index.css')
], function (ErdcKit, store, template) {
    return {
        template,
        data() {
            return {
                fromRouteName: ''
            };
        },
        components: {
            planDetail: ErdcKit.asyncComponent(ELMP.resource('project-plan/components/FormTabs/index.js'))
        },
        beforeRouteEnter(to, from, next) {
            // 这里还无法访问到组件实例，this === undefined
            next((vm) => {
                vm.fromRouteName = vm.fromRouteName || from.name;
            });
        },
        created() {},
        computed: {},
        methods: {}
    };
});
