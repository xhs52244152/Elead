define([
    'vue',
    'erdcloud.i18n',
    ELMP.resource('erdc-pdm-mdb/3DWebView/locale/index.js'),
    'css!' + ELMP.resource('erdc-pdm-mdb/3DWebView/css/view.css')
], function (Vue, ErdcI18n, i18nConfig) {
    const i18n = ErdcI18n.wrap(i18nConfig);
    return {
        data() {
            return {
                prefixUrl: '',
                title: '',
                content: {}
            };
        },
        methods: {
            async MDBWebPreview({ derivedImageOid }) {
                if (_.isEmpty(derivedImageOid)) {
                    this.$message.warning(i18n?.oidEmpty);
                    return false;
                }
                this.handleOpenMDB3DWebView({
                    content: {
                        // 资源接口返回的基础url
                        prefixUrl: this.prefixUrl,
                        // 资源接口返回信息
                        // visible
                        target: {
                            derivedImageOid
                        }
                    }
                });
            },
            handleOpenMDB3DWebView(opts = {}) {
                const _this = this;
                // 1. 新迪轻量化文件预览; 2. 无
                let viewTips = i18n?.viewTips,
                    emptyTips = i18n?.emptyTips;
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
                    render(h) {
                        return h(
                            'el-dialog',
                            {
                                attrs: { id: 'viewer-dialog' },
                                props: { 'visible': this.visible, 'fullscreen': true, 'destroy-on-close': true },
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
                                                attrs: { id: 'pdm-cad-view-icon' }
                                            },
                                            [_this.title]
                                        );
                                    }
                                }
                            },
                            [
                                h('div', {
                                    attrs: { id: 'CADIframeDiv' }
                                })
                            ]
                        );
                    },
                    mounted() {
                        this.$nextTick(() => {
                            this.handleMDB3DWebIframe();
                        });
                    },
                    methods: {
                        handleMDB3DWebIframe() {
                            let appId = 'PDM';
                            let { derivedImageOid } = _this.content.target;
                            let url = ELMP.resource('erdc-pdm-mdb/3DWebView/appcadview/index.html');
                            let wholeUrl = `${url}?from=${appId}&oid=${derivedImageOid}`;
                            document.querySelector('#CADIframeDiv').innerHTML =
                                '<iframe id="viewer" src="' + wholeUrl + '" allowFullScreen></iframe>';
                        }
                    }
                }).$mount();
                document.body.appendChild(vm.$el);
            }
        }
    };
});
