define([
    'text!' + ELMP.resource('platform-api/components/DocHeader/index.html'),
    'css!' + ELMP.resource('platform-api/components/DocHeader/index.css')
], function (template) {
    'use strict';
    return {
        template,
        props: {
            versionArr: {
                type: Array,
                default: function () {
                    return [];
                }
            },
            selectedVersion: {
                type: Object
            },
            doc: Object
        },
        data() {
            return {
                curVersion: {}
            };
        },
        watch: {
            selectedVersion(newVal) {
                if (newVal) {
                    this.curVersion = newVal;
                }
            }
        },
        methods: {
            goBack() {
                this.$router.push('/platform-api/interface');
            },
            handleVersionChange() {
                this.$emit('versionChange', this.curVersion);
            },
            download(fileType) {
                this.$emit('download', fileType);
            },
            handleCompare() {
                this.$emit('versionCompare');
            }
        }
    };
});
