define(['erdcloud.http'], function ($famHttp) {
    return {
        computed: {
            commonColumnsMap() {
                return {
                    checkbox: {
                        prop: 'checkbox', // 列数据字段key
                        type: 'checkbox', // 特定类型
                        title: ' ',
                        width: 48,
                        align: 'center' //多选框默认居中显示
                    },
                    seq: {
                        prop: 'seq', // 列数据字段key
                        type: 'seq', // 特定类型
                        title: ' ',
                        width: 48,
                        align: 'center' //多选框默认居中显示
                    },
                    icon: {
                        prop: 'icon', // 属性名
                        title: this.i18n.icon, // 字段名
                        sortAble: false, // 是否支持排序
                        width: 48,
                        align: 'center' //多选框默认居中显示
                    },
                    identifierNo: {
                        prop: 'identifierNo',
                        title: this.i18n.coding,
                        sortAble: false
                    },
                    name: {
                        prop: 'name',
                        title: this.i18n.name,
                        sortAble: false
                    },
                    ['lifecycleStatus.status']: {
                        prop: 'lifecycleStatus.status',
                        title: this.i18n.lifecycleStatus,
                        sortAble: false,
                        width: 120
                    },
                    containerRef: {
                        prop: 'containerRef',
                        title: this.i18n.context,
                        sortAble: false
                    },
                    createBy: {
                        prop: 'createBy',
                        title: this.i18n.createBy,
                        sortAble: false,
                        width: 100
                    },
                    updateBy: {
                        prop: 'updateBy',
                        title: this.i18n.updateBy,
                        sortAble: false,
                        width: 120
                    },
                    createTime: {
                        prop: 'createTime',
                        title: this.i18n.createTime,
                        sortAble: false,
                        width: 160
                    },
                    updateTime: {
                        prop: 'updateTime',
                        title: this.i18n.updateTime,
                        sortAble: false,
                        width: 160
                    },
                    version: {
                        prop: 'version',
                        title: this.i18n.version,
                        sortAble: false
                    }
                };
            }
        },
        mounted() {},
        methods: {
            changeProcessTableGetList(
                body = {},
                resolve = (res) =>
                    (res?.data?.records || []).map((item) => {
                        (item?.attrRawList || []).forEach((attrObject) => {
                            try {
                                let key = attrObject?.attrName.split('#')[1];
                                item[key] = key.includes('icon') ? attrObject.value : attrObject?.displayName;
                            } catch (e) {}
                        });
                        // 不允许再进行转化icon
                        item.attrRawList = (item?.attrRawList || []).filter(
                            (attrObject) => !(attrObject?.attrName || '').includes('icon')
                        );
                        return item;
                    })
            ) {
                return $famHttp({
                    url: '/fam/view/table/page',
                    data: {
                        pageIndex: 1,
                        pageSize: 1000,

                        // 这些参数会被body覆盖 , 另外可能添加别的特殊参数
                        relationshipRef: '',
                        className: '',
                        tableKey: '',

                        ...body
                    },
                    method: 'POST'
                }).then(resolve);
            }
        }
    };
});
