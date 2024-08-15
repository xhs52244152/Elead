/**
 * readonly component for Boolean Type
 */
define([], function () {
    const FamKit = require('fam:kit');
    return {
        /*html*/
        template: `
            <span
                class="fam-dynamic-form__readonly-field"
            >
                {{staticText || '--'}}
            </span>
        `,
        props: {
            value: '',
            options: [Array, Object]
        },
        data() {
            return {};
        },
        computed: {
            staticText() {
                let label = [];
                this.options.forEach((item) => {
                    if (Array.isArray(this.value)) {
                        this.value.forEach((val) => {
                            if (item.value === val) {
                                label.push(FamKit.translateI18n(item?.name?.value || item?.label));
                            }
                        });
                    } else {
                        if (item.value === this.value) {
                            label.push(FamKit.translateI18n(item?.name?.value || item?.label));
                        }
                    }
                });
                return label.join(', ');
            }
        }
    };
});
