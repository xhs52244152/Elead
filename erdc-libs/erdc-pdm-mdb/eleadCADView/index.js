define([
    'vue',
    'erdcloud.i18n',
    ELMP.resource('erdc-pdm-mdb/eleadCADView/locale/index.js'),
    'css!' + ELMP.resource('erdc-pdm-mdb/eleadCADView/css/view.css')
], function (Vue, ErdcI18n, i18nConfig) {
    const i18n = ErdcI18n.wrap(i18nConfig);
    return {
        data() {
            return {};
        },
        methods: {
            // elead预览方式
            EleadWebView({ derivedImageOid }) {
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
                                attrs: { id: 'Elead-viewer-dialog' },
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
                                                attrs: { id: 'pdm-elead-cad-view-icon' }
                                            },
                                            [i18n?.viewTips]
                                        );
                                    }
                                }
                            },
                            [
                                h('div', {
                                    attrs: { id: 'EleadCADIframeDiv' }
                                })
                            ]
                        );
                    },
                    mounted() {
                        this.$nextTick(() => {
                            this.handleEleadCadView();
                        });
                    },
                    methods: {
                        handleEleadCadView() {
                            let appId = 'PDM';
                            let url = ELMP.resource('erdc-pdm-mdb/eleadCADView/index.html');
                            let wholeUrl = `${url}?from=${appId}&oid=${derivedImageOid}`;
                            document.querySelector('#EleadCADIframeDiv').innerHTML =
                                '<iframe id="viewer" src="' + wholeUrl + '" allowFullScreen></iframe>';
                        }
                    }
                }).$mount();
                document.body.appendChild(vm.$el);
            }
        }
    };
});
