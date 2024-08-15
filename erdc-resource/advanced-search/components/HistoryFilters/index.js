define([
    'text!' + ELMP.resource('advanced-search/components/HistoryFilters/index.html'),
    ELMP.resource('advanced-search/advancedSearchMixin.js'),
    'css!' + ELMP.func('advanced-search/styles/style.css')
], function (template, advancedSearchMixin) {
    const FamKit = require('fam:kit');

    return {
        mixins: [advancedSearchMixin],
        template,
        data() {
            return {
                i18nLocalePath: ELMP.resource('advanced-search/locale/index.js'),
                i18nMappingObj: {}
            };
        },
        watch: {
            mainModelType: {
                immediate: true,
                handler(val) {
                    if (val) {
                        this.getHistoryList();
                    }
                }
            }
        },
        methods: {
            getHistoryList() {
                this.$famHttp({
                    url: '/fam/search',
                    method: 'POST',
                    data: {
                        className: 'erd.cloud.foundation.principal.entity.SystemSetting',
                        pageIndex: 1,
                        pageSize: 50,
                        orderBy: 'createTime',
                        sortBy: 'desc',
                        conditionDtoList: [
                            {
                                attrName: 'configModule',
                                oper: 'EQ',
                                value1: 'GLOBAL_SEARCH_HIS'
                            },
                            {
                                attrName: 'keyValue',
                                oper: 'EQ',
                                value1: this.mainModelType
                            },
                            {
                                attrName: 'userRef',
                                oper: 'EQ',
                                value1: this.$store.state.app.user.oid
                            }
                        ]
                    }
                }).then((resp) => {
                    let historyList = resp.data?.records || [];
                    historyList = historyList.map((item) => {
                        return FamKit.deserializeArray(item.attrRawList);
                    });
                    this.storeCommit('historyList', historyList.slice(0, 16));
                });
            },
            setCurrentHistory(currentHistoryObj) {
                if (this.currentHistoryObj.oid === currentHistoryObj.oid) {
                    return;
                } else {
                    this.storeCommit('currentHistoryObj', currentHistoryObj);
                }
            },
            async onDelete(oid) {
                const isSureDelete = await this.deleteConfirm();
                if (isSureDelete) {
                    let url = '/fam/delete';
                    let params = {};
                    let data = {};
                    let afterDelData = [];
                    if (oid) {
                        params.oid = oid;
                        afterDelData = this.historyList.filter((item) => item.oid !== oid);
                    } else {
                        url = '/fam/deleteByIds';
                        data.oidList = this.historyList.map((item) => item.oid);
                    }
                    this.$famHttp({
                        url,
                        method: 'DELETE',
                        params,
                        data
                    }).then(() => {
                        this.$message.success(this.i18n.deleteSuccess);
                        this.storeCommit('historyList', afterDelData);
                    });
                }
            },
            deleteConfirm() {
                return new Promise((resolve) => {
                    const { deleteTip, confirmDeleteThis, confirm, cancel } = this.i18n;
                    this.$confirm(deleteTip, confirmDeleteThis, {
                        confirmButtonText: confirm,
                        cancelButtonText: cancel,
                        type: 'warning',
                        customClass: 'global-search-message-box'
                    })
                        .then(() => {
                            resolve(true);
                        })
                        .catch(() => {
                            resolve(false);
                        });
                });
            }
        }
    };
});
