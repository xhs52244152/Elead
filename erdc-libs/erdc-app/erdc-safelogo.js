define(['erdcloud.store', 'vue', '@erdcloud/erdcloud-ui', 'erdcloud.router'], function (
    store,
    Vue,
    ErdcloudUI,
    ErdcloudRouter
) {
    let vm = null;
    let loginFlag; //是否已经登录过的标识
    ErdcloudRouter.afterEach(() => {
        if (!vm) {
            loginFlag = !_.isEmpty(store.state.app.user);
            generateSafeCode();
        } else {
            if (loginFlag !== !_.isEmpty(store.state.app.user)) {
                loginFlag = !_.isEmpty(store.state.app.user);
                vm?.$destroy();
                vm?.$el?.remove();
                generateSafeCode();
            }
        }
    });
    function generateSafeCode() {
        vm = new Vue({
            template: `<div id="content" style="position:fixed;z-index:1;pointer-events: none;" :style="style" :class="{ 'none':!hasSafe }"></div>`,
            data() {
                return {
                    content: '',
                    style: {},
                    font: {},
                    hasSafe: false
                };
            },
            mounted() {
                this.getContent();
                this.setWaterMark();
                this.startObserver();
            },
            beforeDestroy() {
                if (this.observer) {
                    this.observer.disconnect();
                    this.observer = null;
                }
            },
            methods: {
                startObserver() {
                    const targetNode = document.querySelector('body');
                    const config = { attributes: true, childList: true, subtree: true };
                    this.observer = new MutationObserver((mutationsList) => {
                        let flag = false;
                        for (let i of mutationsList) {
                            if (this.reRendering(i, vm.$el)) {
                                flag = true;
                                break;
                            }
                        }
                        if (flag) {
                            vm.$el.remove();
                            delete vm.$el;
                            generateSafeCode();
                        }
                    });
                    this.observer.observe(targetNode, config);
                },
                reRendering(mutation, watermarkElement) {
                    let flag = false;
                    if (mutation.removedNodes.length && watermarkElement) {
                        flag = Array.from(mutation.removedNodes).includes(watermarkElement);
                    }
                    return flag;
                },
                getContent() {
                    const self = this;
                    const securitySigns = store.state.app?.threeMemberOtherConfig?.securitySigns || {};
                    self.hasSafe = securitySigns.enable;
                    const styleObj = this.isJSON(securitySigns.style) ? JSON.parse(securitySigns.style) : {};
                    const contentObj = this.isJSON(securitySigns.content) ? JSON.parse(securitySigns.content) : {};
                    if (loginFlag) {
                        self.content = contentObj?.other || '';
                        self.style = styleObj?.other?.contentStyle || {};
                        self.font = styleObj?.other?.font || {};
                    } else {
                        self.content = contentObj?.index || '';
                        self.style = styleObj?.index?.contentStyle || {};
                        self.font = styleObj?.index?.font || {};
                    }
                },
                measureTextWidth(text, font) {
                    const canvas = document.createElement('canvas');
                    let context = canvas.getContext('2d');
                    context.font = font;
                    const metrics = context.measureText(text);
                    return metrics.width;
                },
                setWaterMark() {
                    const self = this;
                    const fontSize = Number(self.font?.fontSize) || 16;
                    const fontFamily = self.font?.fontFamily || 'AlibabaPuHuiTi-3-55-Regular';
                    const width = this.measureTextWidth(self.content, `${fontSize}px ${fontFamily}`);
                    if (!self.style.width) {
                        self.style.width = `${Math.ceil(width) + 10}px`;
                    }
                    this.$nextTick(() => {
                        ErdcloudUI.Watermark.render(
                            Object.assign({
                                content: self.content,
                                gap: [100, 100],
                                rotate: '0',
                                font: self.font,
                                $container: document.getElementById('content')
                            })
                        );
                    });
                },
                isJSON(str) {
                    try {
                        JSON.parse(str);
                        return true;
                    } catch (e) {
                        return false;
                    }
                }
            }
        });
        vm.$mount();
        document.body.append(vm.$el);
    }
});
