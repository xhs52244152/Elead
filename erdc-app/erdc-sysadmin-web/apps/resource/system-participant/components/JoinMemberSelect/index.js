define([
    'erdcloud.kit',
    'text!' + ELMP.resource('system-participant/components/JoinMemberSelect/index.html'),
    'css!' + ELMP.resource('system-participant/components/JoinMemberSelect/style.css')
], function (ErdcKit, template) {

    return {
        template,
        props: {
            orgId: {
                type: String,
                default() {
                    return '';
                }
            },
            threeMemberEnv: Boolean
        },
        data() {
            return {
                i18nPath: ELMP.resource('system-participant/locale/index.js'),
                selectedMemberList: [],
                defaultMemebr: [],
                formData: {}
            };
        },
        computed: {
            data() {
                return [
                    {
                        field: 'members',
                        component: 'FamParticipantSelect',
                        label: this.i18n.selectMember,
                        props: {
                            threeMemberEnv: this.threeMemberEnv,
                            nodeKey: 'id',
                            props: {
                                value: 'id'
                            },
                            multiple: true,
                            defaultMode: 'FUZZYSEARCH',
                            showType: ['USER'],
                            queryMode: ['FUZZYSEARCH', 'RECENTUSE'],
                            queryScope: 'global'
                        },
                        col: 24
                    }
                ];
            }
        },
        methods: {
            // 选中用户
            fnMemberSelect(memberIds, members) {
                this.selectedMemberList = members?.value || [];
            },
            // 移除选中
            fnRemoveSelected(member) {
                let index = this.selectedMemberList.findIndex((ite) => ite.id == member.id);
                this.selectedMemberList.splice(index, 1);
                this.defaultMemebr = this.selectedMemberList.map((item) => item);
            },
            // 提供方法给父级获取当前选中用户
            fnGetSelectedMember() {
                return this.formData.members?.value || [];
            }
        }
    };
});
