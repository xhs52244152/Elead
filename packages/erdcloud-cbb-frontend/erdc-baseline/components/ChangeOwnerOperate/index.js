define([
    'text!' + ELMP.func('erdc-baseline/components/ChangeOwnerOperate/index.html'),
    ELMP.func('erdc-baseline/components/batchEditMixin.js'),
    ELMP.func('erdc-baseline/const.js'),
    ELMP.resource('erdc-cbb-components/utils/index.js'),
    'css!' + ELMP.func('erdc-baseline/index.css')
], function (template, batchEditMixin, CONST, cbbUtils) {
    const ErdcKit = require('erdc-kit');

    return {
        name: 'BaselineChangeOwnerOperate',
        template,
        components: {
            FamErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
            FamUser: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamUser/index.js')),
            FamParticipantSelect: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamParticipantSelect/index.js'))
        },
        mixins: [batchEditMixin],
        data() {
            return {
                i18nPath: ELMP.func('erdc-baseline/locale/index.js'),
                defaultMember: [],
                batchEditFormData: {
                    owner: '',
                    ownerDetail: null
                },
                // 参与者选择
                queryParams: {
                    data: {
                        appName: cbbUtils.getAppNameByResource(),
                        isGetVirtualRole: true
                    }
                },
                // 参与者范围
                queryScope: 'fullTenant'
            };
        },
        methods: {
            open(rows, isDetail) {
                if (!_.isArray(rows)) {
                    rows = [rows];
                }
                if (rows.length === 0) {
                    this.$message.info(this.i18n['请勾选对象']);
                    return;
                }
                this.visible = true;
                this.tableData = rows.map((i) => {
                    return {
                        name: isDetail ? i.name : i['erd.cloud.cbb.baseline.entity.Baseline#name'],
                        code: isDetail ? i.identifierNo : i['erd.cloud.cbb.baseline.entity.Baseline#identifierNo'],
                        owner: isDetail
                            ? i.ownedByRef_defaultValue?.[0]?.displayName
                            : i['erd.cloud.cbb.baseline.entity.Baseline#ownedByRef'],
                        newOwner: '',
                        ownerDetail: null,
                        oid: i.oid
                    };
                });
            },
            checkBeforeSubmit() {
                for (let i of this.tableData) {
                    if (!i.newOwner) {
                        this.$message.warning(this.i18n.ownerRequireTips);
                        return false;
                    }
                }
                return true;
            },
            saveBatchEditData() {
                const { owner, ownerDetail } = this.batchEditFormData;
                const applyBatchUpdateRows = this.tableData.filter(
                    (item) => this.selectedData.findIndex((sItem) => sItem.oid === item.oid) >= 0
                );
                if (owner) {
                    applyBatchUpdateRows.forEach((item) => {
                        item.newOwner = owner;
                        item.ownerDetail = ownerDetail;
                    });
                }
                this.visibleForBatchEdit = false;
            },
            handleChangeOwner() {
                if (this.checkBeforeSubmit()) {
                    let data = {};
                    this.tableData.forEach((item) => {
                        data[item.oid] = item?.newOwner?.value || '';
                    });
                    this.$famHttp({
                        url: '/baseline/common/batchUpdateOwnerBy',
                        method: 'post',
                        className: CONST?.className,
                        data: data
                    }).then((resp) => {
                        if (resp.success) {
                            this.$message.success(this.i18n.updateSuccess);
                            this.visible = false;
                            this.$emit('success');
                        }
                    });
                }
            }
        }
    };
});
