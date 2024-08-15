define([
    'text!' + ELMP.func('erdc-part/components/PartCreateViewVersion/index.html'),
    ELMP.func('/erdc-part/config/viewConfig.js'),
    'css!' + ELMP.func('erdc-part/components/PartCreateViewVersion/index.css')
], function (template, viewConfig) {

    return {
        name: 'PartCreateViewVersion',
        template,
        props: {
            // 源数据
            rootData: [Object],
            // 需要过滤的对象视图
            filterViewList: [Array]
        },
        data() {
            return {
                i18nPath: ELMP.func('erdc-part/locale/index.js'),
                formData: {
                    caption: '',
                    lifecycle: {
                        value: '',
                        displayName: ''
                    },
                    context: {
                        value: '',
                        displayName: ''
                    },
                    view: ''
                },
                visible: true,
                className: viewConfig.partViewTableMap.className,
                viewOptions: []
            };
        },
        mounted() {
            this.getTableData();
            this.getAllView();
        },
        methods: {
            // 获取所有视图
            getAllView() {
                this.$famHttp({
                    url: '/fam/view/effective',
                    className: 'erd.cloud.pdm.part.view.entity.View' //后端要求写死这个className就好
                }).then((res) => {
                    this.viewOptions =
                        res?.data.map((v) => {
                            return {
                                ...v,
                                label: v?.displayName,
                                value: v?.oid
                            };
                        }) || [];
                    // 需要过滤的视图
                    let viewNameList = [];
                    if (this.filterViewList) {
                        this.filterViewList.forEach((item) => {
                            viewNameList.push(item.name);
                        });
                        this.viewOptions = this.viewOptions.filter((item) => {
                            return !viewNameList.includes(item.name);
                        });
                    }
                });
            },
            getTableData() {
                this.formData.caption = this.rootData?.['caption'];
                this.formData.lifecycle.displayName = this.rootData?.['status']?.['displayName'];
                this.formData.context.displayName = this.rootData?.['containerRef']?.['displayName'];
            },
            handleClose() {
                this.visible = false;
                this.$emit('close');
            },
            handleViewChange() { },
            handleCreate() {
                if (!this.formData?.view) {
                    return this.$message.error(this.i18n?.selectNewView);
                }
                this.$emit('success', this.formData);
                this.handleClose();
            }
        }
    };
});
