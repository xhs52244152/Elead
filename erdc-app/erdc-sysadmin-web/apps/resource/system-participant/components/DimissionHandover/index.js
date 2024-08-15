define([
    'erdcloud.kit',
    'text!' + ELMP.resource('system-participant/components/DimissionHandover/index.html'),
    'css!' + ELMP.resource('system-participant/components/DimissionHandover/style.css')
], function (ErdcKit, template) {
    const store = require('fam:store');
    const _ = require('underscore');

    return {
        template,
        props: {
            orgId: {
                type: String,
                default() {
                    return '';
                }
            },
            dimissionMemberList: {
                type: Array,
                default() {
                    return [];
                }
            }
        },
        data() {
            return {
                selectedMemberList: [],
                defaultMemebr: [],
                tableData: []
            };
        },
        components: {
            // 基础表格
            FamErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js'))
        },
        computed: {
            column() {
                return [
                    {
                        prop: 'tenant',
                        title: '租户',
                        minWidth: '150'
                    },
                    {
                        prop: 'dimission',
                        title: '离职人',
                        minWidth: '150'
                    },
                    {
                        prop: 'handover',
                        title: '交接人',
                        minWidth: '150'
                    }
                ];
            }
        },
        methods: {
            // 选中用户
            fnMemberSelect(members) {
                this.selectedMemberList = members || [];
            },
            // 提供方法给父级获取当前选中用户(待定，需求要改)
            fnGetSelectedMember() {
                return []; // this.selectedMemberList ||
            }
        }
    };
});
