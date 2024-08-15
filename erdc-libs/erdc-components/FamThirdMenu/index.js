/**
 * @component FamThirdMenu
 * @description 标准三级菜单
 */
define(['text!' + ELMP.resource('erdc-components/FamThirdMenu/template.html')], function (template) {
    const ScrollPanel = {
        name: 'ScrollPanel',

        /*html*/
        template: `
            <erd-scrollbar 
                ref="scrollbar"
                class="scroll-container"
                :vertical="false"
            >
                <div class="scroll-panel w-100p">
                    <slot></slot>
                </div>
            </erd-scrollbar>
        `,
        methods: {
            /**
             * 定位到某个元素
             * @param { Element } el
             * @param { number } [duration=300]
             */
            scrollToView(el, duration = 300) {
                const container = this.$refs.scrollbar.$el;
                const containerRect = container.getBoundingClientRect();
                const elRect = el.getBoundingClientRect();
                const scrollTop = container.scrollTop;
                const diff = elRect.top - containerRect.top - containerRect.height / 2 + elRect.height / 2;
                const target = scrollTop + diff;
                let current = scrollTop;
                const step = (target - current) / (duration / 20);
                const interval = setInterval(() => {
                    if (Math.abs(current - target) <= Math.abs(step)) {
                        clearInterval(interval);
                        container.scrollTop = target;
                    } else {
                        container.scrollTop = current + step;
                        current += step;
                    }
                }, 20);
            }
        }
    };

    return {
        name: 'FamThirdMenu',
        template,
        components: {
            ScrollPanel
        },
        props: {
            outerResources: Array
        },
        data() {
            return {};
        },
        computed: {
            currentResourcePath() {
                return this.$store.getters['route/matchResourcePath'](this.$route);
            },
            currentResource() {
                return this.currentResourcePath.at(-1) || {};
            },
            secondaryResource() {
                return this.currentResourcePath[1] || {};
            },
            thirdResources() {
                return this.outerResources || this.secondaryResource?.children || [];
            }
        },
        watch: {
            currentRoute: {
                immediate: true,
                handler() {
                    this.$nextTick(() => {
                        this.scrollToView();
                    });
                }
            }
        },
        methods: {
            routeTo(href, resource) {
                if (resource.target === 'link') {
                    if (/^(http|https|ftp)/.test(resource.href)) {
                        window.open(resource.href, '_blank');
                    } else {
                        const matchedRoute = this.$router.resolve(resource.href);
                        window.open(matchedRoute.href, resource.identifierNo);
                    }
                } else {
                    if (resource.href) {
                        this.$router.push(resource.href);
                    } else {
                        this.$router.push(resource?.children[0].href);
                    }
                }
                // this.$forceUpdate();
            },
            scrollToView() {
                if (this.$refs.scrollPanel && this.$refs.menuItem) {
                    const $menuItem = this.$refs.menuItem.find(
                        (i) => i.getAttribute('data-code') === this.currentResource.identifierNo
                    );
                    if ($menuItem) {
                        this.$refs.scrollPanel.scrollToView($menuItem);
                    }
                }
            }
        }
    };
});
