define(['text!' + ELMP.resource('erdc-components/FamLink/index.html')], function (template) {
    const ErdcKit = require('fam:kit');
    return {
        template,
        props: {
            linkName: {
                type: String,
                default: null
            },
            path: {
                type: String,
                default: null
            },
            formData: {
                type: Object,
                default() {
                    return {};
                }
            }
        },
        data() {
            return {};
        },
        computed: {
            linkPath() {
                return ErdcKit.template(this.path, this.formData);
            }
        },
        methods: {
            onClick() {
                if (this.linkPath) {
                    if (/^(http|https|ftp)/.test(this.linkPath)) {
                        window.open(this.linkPath, '_blank');
                    } else {
                        const origin = window.location.origin;
                        window.open(origin + '/' + this.linkPath, '_blank');
                    }
                }
                this.$emit('click');
            }
        }
    };
});
