define([
    ELMP.resource('erdc-participant-helps/locale/index.js'),
    ELMP.resource('erdc-guideline/help/useListContent.js'),
    'erdcloud.i18n'
], function (i18nConfig, useListContent, ErdcI18n) {
    const i18n = ErdcI18n.wrap(i18nConfig);
    return {
        components: {
            ListContent: useListContent()
        },
        setup() {
            const { ref } = require('vue');
            const list = ref(null);
            const helpTips = ref([
                {
                    title: i18n.whatIsAuthorizeLicense,
                    key: 'whatIsAuthorizeLicense',
                    content: i18n.whatIsAuthorizeLicenseContent
                },
                {
                    title: i18n.how2AuthorizeLicense,
                    key: 'how2AuthorizeLicense',
                    content: i18n.how2AuthorizeLicenseContent,
                    href: '/erdc-help/erdcloud-operation-manual/index.html#/docs/易立德微服务数字化平台软件-管理员操作手册/index?id=license配置'
                }
            ]);

            const setActive = (key) => {
                if (list.value) {
                    list.value.setActive(key);
                }
            };

            return {
                helpTips,
                list,
                setActive
            };
        },
        template: `
            <ListContent ref="list" :tips="helpTips"></ListContent>
        `
    };
});
