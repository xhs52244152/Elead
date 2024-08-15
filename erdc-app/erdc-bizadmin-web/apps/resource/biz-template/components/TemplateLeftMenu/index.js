define([
    'text!' + ELMP.resource('biz-template/components/TemplateLeftMenu/index.html'),
    'css!' + ELMP.resource('biz-template/components/TemplateLeftMenu/style.css')
], function (template) {

    return {
        template,
        props: {},
        components: {},
        data() {
            return {
                treeHeight: '100%',
                menuData: [],
                typeKey: '',
                selectMenu: ''
            };
        },
        computed: {},
        watch: {},
        mounted() {
            this.treeHeight = `calc(100vh - 90px)`;
            this.getMenuData();
        },
        methods: {
            getMenuData() {
                this.$famHttp({ url: '/fam/template/model/list', method: 'GET' }).then((resp) => {
                    if (resp.code === '200') {
                        this.menuData = (resp.data && resp.data[0]?.children) || [];
                        const prdTypeName = this.$store.getters.className('productDemo');
                        const node = this.menuData.find((item) => {
                            return item.typeName === this.$route?.query?.typeName || item.typeName === prdTypeName;
                        });
                        if (node) {
                            this.$nextTick(() => {
                                this.selectMenu = node.typeName;
                                this.$emit('onchangemenu', node.typeName);
                            });
                        }
                    }
                });
            },
            handleNodeClick(menuIndex) {
                if (menuIndex === this.selectMenu) {
                    return;
                }
                this.selectMenu = menuIndex;
                this.$emit('onchangemenu', menuIndex);
            }
        }
    };
});
