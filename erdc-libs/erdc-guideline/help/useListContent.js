define([], function () {
    return function () {
        return {
            setup(props) {
                const { ref } = require('vue');
                const activeTipKey = ref(null);
                const setActive = function (key) {
                    activeTipKey.value = key;
                };
                const handleTitleClick = function (tip) {
                    if (!props.handleClick && !tip.handleClick && !tip.href) return;
                    setActive(tip.key);
                    setTimeout(() => {
                        if (typeof tip.handleClick === 'function') {
                            return tip.handleClick();
                        } else if (props.handleClick === 'function') {
                            props.handleClick(tip);
                        } else if (tip.href) {
                            window.open(tip.href, '_blank');
                        }

                    }, 100);
                };

                return {
                    setActive,
                    activeTipKey,
                    handleTitleClick
                };
            },
            props: {
                tips: {
                    type: Array,
                    default() {
                        return [];
                    }
                },
                handleClick: Function
            },
            template: `
                <div class="erdc-help-list-content">
                    <ul>
                        <li
                            v-for="(tip, index) in tips"
                            :key="tip.key"
                            :class="['flex erdc-help-list-content__list p-lg mb-lg', {
                                'active': tip.key === activeTipKey,
                                'clickable': !!handleClick || tip.handleClick || tip.href,
                            }]"
                        >
                            <div class="erdc-help-list-content__left">
                                <span
                                    class="inline-block rounded-50p text-center erdc-help-list-content__number"
                                >{{ index + 1 }}</span>
                            </div>
                            <div class="erdc-help-list-content__right">
                                <div class="erdc-help-list-content__title"
                                     @click.stop="() => handleTitleClick(tip)"
                                >
                                    {{ tip.title }}
                                </div>
                                <div class="erdc-help-list-content__content" v-html="tip.content"></div>
                            </div>
                        </li>
                    </ul>
                </div>
            `
        };
    };
});
