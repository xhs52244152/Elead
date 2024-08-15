define([
    'text!' + ELMP.func('erdc-baseline/views/create/index.html'),
    ELMP.func('erdc-baseline/mixins.js'),
    ELMP.func('erdc-baseline/const.js'),
    ELMP.func('erdc-baseline/operateAction.js'),
    ELMP.resource('erdc-cbb-components/utils/index.js')
], function (template, mixin, CONSTS, operateAction, cbbUtils) {
    const ErdcKit = require('erdc-kit');

    return {
        name: 'BaselineCreate',
        template,
        components: {
            CommonPageTitle: ErdcKit.asyncComponent(ELMP.resource('common-page/components/DetailInfoTop/index.js')),
            BaselineForm: ErdcKit.asyncComponent(ELMP.func('erdc-baseline/components/BaselineForm/index.js'))
        },
        props: {
            extendParams: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            customCancel: Function,
            setUrlConfig: Function
        },
        mixins: [mixin],
        data: function () {
            return {
                i18nPath: ELMP.func('erdc-baseline/locale/index.js'),
                formData: {},
                className: CONSTS.className,
                saveLoading: false,
                draftLoading: false,
                route: {}
            };
        },
        computed: {
            // 表单头组件配置
            formPageAttr() {
                return {
                    title: this.title,
                    showBackButton: false,
                    staticTitle: true
                };
            },
            title() {
                return this.oid ? this.i18n['编辑基线'] : this.i18n.createBaseline;
            },
            viewType() {
                return this.oid ? 'UPDATE' : 'CREATE';
            },
            oid() {
                return this.route.query.oid;
            },
            pid() {
                return this.route.query.pid;
            },
            isDraftEdit() {
                /**
                 * 草稿状态的数据会多一个属性，这个属性key就是这个草稿的oid etc. key -> OR:erd.cloud.cbb.baseline.entity.Baseline:1703949596527570945
                 * 如果有这个属性就是草稿状态
                 */
                const data = this.formData || {};
                return data['lifecycleStatus.status'] === 'DRAFT';
            }
        },
        created() {
            this.routeRefresh();
        },
        activated() {
            // 路由强制刷新
            this.$route?.query?.routeRefresh && this.routeRefresh();
        },
        methods: {
            // 路由强制刷新
            routeRefresh() {
                this.route = ErdcKit.deepClone(_.omit(this.$route, 'matched'));
            },
            handleFormChange(formData) {
                this.formData = formData;
            },
            saveDraft() {
                this.save(true);
            },
            save(isSaveAsDraft) {
                var self = this;
                this.$refs.baselineForm.submit(isSaveAsDraft).then((result) => {
                    if (result.validate) {
                        let apiPath = '/baseline/create';
                        // 编辑||草稿状态
                        if (self.oid) {
                            apiPath = '/baseline/update';
                        }
                        if (self.oid && self.isDraftEdit) {
                            // 草稿状态保存时不传编码
                            result.data.attrRawList = result.data.attrRawList.filter(
                                (item) => item.attrName != 'identifierNo'
                            );
                        }
                        const next = (note, isCheckIn) => {
                            this[`${isSaveAsDraft ? 'draft' : 'save'}Loading`] = true;
                            let { setUrlConfig } = this;
                            let urlConfig = {
                                url: apiPath,
                                data: {
                                    isDraft: isSaveAsDraft,
                                    oid: self.oid,
                                    appName: cbbUtils.getAppNameByResource(), // 应后端要求，创建对象增加appName参数
                                    ...result.data
                                },
                                className: CONSTS.className,
                                method: 'post',
                                ...this.extendParams
                            };
                            if (_.isFunction(setUrlConfig)) urlConfig = setUrlConfig(urlConfig);
                            this.$famHttp(urlConfig)
                                .then((res) => {
                                    //有oid并且不是草稿状态就是编辑， 编辑才需要检入
                                    if (self.oid && !this.isDraftEdit) {
                                        isCheckIn &&
                                            self
                                                .$famHttp({
                                                    url: '/baseline/common/checkin',
                                                    method: 'put',
                                                    className: CONSTS.className,
                                                    params: {
                                                        note: note || '更新检入',
                                                        oid: self.oid
                                                    }
                                                })
                                                .then((resp) => {
                                                    self.$message({
                                                        message: self.i18n.updateSuccess,
                                                        type: 'success',
                                                        showClose: true
                                                    });
                                                    if (this.$listeners['after-submit']) {
                                                        this.$emit(
                                                            'after-submit',
                                                            isSaveAsDraft ? undefined : resp.data
                                                        );
                                                    } else {
                                                        self.cancel(isSaveAsDraft ? undefined : resp.data);
                                                    }
                                                });

                                        if (!isCheckIn) {
                                            self.$message({
                                                message: self.i18n.updateSuccess,
                                                type: 'success',
                                                showClose: true
                                            });
                                            if (this.$listeners['after-submit']) {
                                                this.$emit('after-submit', isSaveAsDraft ? undefined : res.data);
                                            } else {
                                                self.cancel(isSaveAsDraft ? undefined : res.data);
                                            }
                                        }
                                    } else {
                                        self.$message({
                                            message: self.i18n.createSuccess,
                                            type: 'success',
                                            showClose: true
                                        });
                                        if (this.$listeners['after-submit']) {
                                            this.$emit('after-submit', res);
                                        } else {
                                            self.cancel();
                                        }
                                    }
                                })
                                .finally(() => {
                                    this[`${isSaveAsDraft ? 'draft' : 'save'}Loading`] = false;
                                });
                        };
                        let determine = (note, isCheckIn) => {
                            if (this.$listeners['before-submit']) {
                                this.$emit(
                                    'before-submit',
                                    result.data,
                                    function () {
                                        next(note, isCheckIn);
                                    },
                                    isCheckIn
                                );
                            } else {
                                next(note, isCheckIn);
                            }
                        };
                        if (!isSaveAsDraft && !self.isDraftEdit && self.oid) {
                            const props = {
                                visible: true,
                                type: 'save',
                                className: CONSTS.className,
                                title: self.i18n.save,
                                customSubmit: (vm) => {
                                    let isCheckIn = vm.radio === '3'; // 保存并检入
                                    vm.toggleShow();
                                    determine(vm.note, isCheckIn);
                                }
                            };
                            operateAction.mountDialogSave(props);
                        } else {
                            determine();
                        }
                    }
                });
            },
            cancel(oid) {
                if (_.isFunction(this.customCancel)) {
                    this.customCancel();
                } else {
                    this.$store.dispatch('route/delVisitedRoute', this.$route).then(() => {
                        const path = `${this.$route.meta.prefixRoute}/baseline/${oid ? 'detail' : 'list'}`;
                        const route = {
                            path,
                            query: {
                                ..._.pick(this.$route.query, (value, key) => {
                                    return ['pid', 'typeOid'].includes(key) && value;
                                }),
                                oid
                            }
                        };
                        this.$router.replace(route);
                    });
                }
            }
        }
    };
});
