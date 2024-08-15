/**
 * readonly component for Boolean Type
 */
define([], function () {
    return {
        /*html*/
        template: `
            <span
                class="fam-dynamic-form__readonly-field"
            >
                {{staticText}}
            </span>
        `,
        props: {
            value: [String, Number, Boolean]
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource(
                    'erdc-components/FamDynamicForm/readonly-components/FamBooleanStaticText/locale.js'
                ),
                i18nMappingObj: {
                    yes: this.getI18nByKey('是'),
                    no: this.getI18nByKey('否')
                }
            };
        },
        computed: {
            staticText() {
                const falsy = [0, false, 'false', '0'];
                const truthy = ['1', true, 'true', '1'];
                if (truthy.includes(this.value)) {
                    return this.i18nMappingObj.yes;
                } else if (falsy.includes(this.value)) {
                    return this.i18nMappingObj.no;
                }
                return '--';
            }
        }
    };
});
