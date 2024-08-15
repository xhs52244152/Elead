define(['erdcloud.kit'], function (ErdcKit) {
    return {
        components: {
            IconMenu: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamIconSelect/components/iconMenu.js'))
        },
        render(h) {
            return h(
                'div',
                {
                    class: 'p-xl m-normal bg-white'
                },
                [
                    h(
                        'icon-menu',
                        {
                            on: {
                                'icon-change': (iconClass) => {
                                    if (window.navigator && window.isSecureContext) {
                                        navigator.clipboard.writeText(iconClass).then(() => {
                                            this.$message.success(`${iconClass} 复制已复制到剪贴板`);
                                        });
                                    }
                                }
                            }
                        },
                        []
                    )
                ]
            );
        }
    };
});
