/*
 * @Author: wyl
 * @Date: 2021-11-03 18:26:36
 * @Description:
 * @LastEditTime: 2022-04-19 16:26:35
 */
define(['vue', 'erdcloud.i18n', ELMP.resource('erdc-pdm-nds/locale/index.js')], function (Vue, ErdcI18n, i18nConfig) {
    const i18n = ErdcI18n.wrap(i18nConfig);
    return {
        data() {
            return {
                prefixUrl: '',
                title: '',
                content: ''
            };
        },
        methods: {
            async setup({ epmOid, derivedImageOid }) {
                if (_.isEmpty(epmOid) || _.isEmpty(derivedImageOid)) {
                    this.$message.error(i18n?.['图档oid或表示法oid不能为空']);
                    return false;
                }
                var result = await this.getCadModuleInfo({
                    epmOid: epmOid,
                    derivedImageOid: derivedImageOid
                });
                this.prefixUrl = result.url;
                this.openNDS({
                    content: {
                        // 资源接口返回的基础url
                        prefixUrl: this.prefixUrl,
                        // 资源接口返回信息
                        raw: result,
                        // 当前表示法对象的基本信息
                        target: {
                            epmOid,
                            derivedImageOid
                        }
                    }
                });
            },
            // 获取新迪的模型信息
            getCadModuleInfo: function ({ epmOid, derivedImageOid }) {
                return new Promise((resolve, reject) => {
                    let url = `/pdm/cad/modelInfo?epmOid=${epmOid}&derivedImageOid=${derivedImageOid}`;
                    this.$famHttp({
                        className: derivedImageOid.split(':')?.[1],
                        url: url,
                        method: 'POST'
                    })
                        .then((resp) => {
                            if (resp.code == 200) {
                                resolve(resp.data);
                            } else {
                                reject(resp.message || 'error');
                            }
                        })
                        .catch((error) => {
                            reject(error);
                        });
                });
            },
            openNDS(opts = {}) {
                const _this = this;
                // 1. 新迪轻量化文件预览; 2. 无
                let viewTips = i18n?.['文件预览'],
                    emptyTips = i18n?.['无'];
                let { title = viewTips, content = emptyTips } = opts;
                _this.title = title;
                _this.content = content;
                // 渲染函数
                const vm = new Vue({
                    data() {
                        return {
                            visible: true
                        };
                    },
                    components: {
                        ndsView: (resolve) => require([ELMP.resource('erdc-pdm-nds/js/view.js')], resolve)
                    },
                    render(h) {
                        return h(
                            'el-dialog',
                            {
                                props: {
                                    'visible': this.visible,
                                    'fullscreen': true,
                                    'destroy-on-close': true,
                                    'custom-class': 'nds-view-dialog'
                                },
                                on: {
                                    close: () => {
                                        this.visible = false;
                                        // 关闭时销毁dom元素
                                        document.body.removeChild(vm.$el);
                                    }
                                },
                                scopedSlots: {
                                    title: () => {
                                        return h(
                                            'span',
                                            {
                                                attrs: { id: 'pdm-nds-icon' }
                                            },
                                            [_this.title]
                                        );
                                    }
                                }
                            },
                            [
                                h('nds-view', {
                                    props: {
                                        viewData: _this.content
                                    }
                                })
                            ]
                        );
                    },
                    mounted() {},
                    methods: {}
                }).$mount();
                document.body.appendChild(vm.$el);
            },
            /**
             * 传入默认表示法对象,检测是不是新迪,是就启动setup函数
             * @param {object} raw /pdm/epm/derivedImage/getDerivedImage 接口对象
             * @returns {boolean}
             */
            checkDefaultRepresentation(raw) {
                let isNDS = function (type) {
                    return type === 'NDS';
                };
                // 空对象，非新迪标记对象，直接终止
                if (_.isEmpty(raw) || !isNDS(raw.taskType)) {
                    return false;
                }
                // 默认表示法是新迪，唤起新迪轻量化
                this.setup({
                    epmOid: raw.derivedFromRef,
                    derivedImageOid: raw.oid
                });
                return true;
            }
        }
    };
});
