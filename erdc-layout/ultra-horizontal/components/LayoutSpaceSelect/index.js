define(['text!/erdc-layout/ultra-horizontal/components/LayoutSpaceSelect/index.html'], function (template) {
    const ErdcKit = require('erdc-kit');

    return {
        template: template,
        props: {
            readonly: [Boolean, String],
            spaceDetail: Object,
            typeName: String,
            extendParams: Object
        },
        components: {
            SpaceSelect: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamSpaceSelect/index.js'))
        },
        data() {
            return {
                i18nLocalePath: '/erdc-layout/ultra-horizontal/locale/index.js'
            };
        },
        methods: {
            changeSpace(spaceOid, spaceObject) {
                this.$emit('changeSpace', { spaceOid, spaceObject });
            },
            clickItem(replace) {
                this.$emit('clickItem', replace);
            }
        }
    };
});
