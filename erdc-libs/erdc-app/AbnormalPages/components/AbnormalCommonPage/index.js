define([], function () {
    return {
        /*html*/
        template: `
            <div class="flex flex-column justify-center align-items-center w-100p h-100p pt-16 pb-32 bg-white">
                <img :src="imgSrc" :alt="i18n.comingSoon" :width="imgWidth"/>
                <div v-if="title" class="mt-24 text-xl font-bold color-normal">{{i18n[title]}}</div>
                <div v-if="tip" class="mtb-16 text-normal color-disabled">{{i18n[tip]}}</div>
                <erd-button v-if="showGoBack" type="primary" @click="goBack">{{i18n.goBack}}</erd-button>
            </div>
        `,
        props: {
            fileName: {
                type: String
            },
            title: {
                type: String
            },
            tip: {
                type: String
            },
            imgWidth: {
                type: String,
                default: '200'
            },
            showGoBack: {
                type: Boolean,
                default: true
            }
        },
        data() {
            return {
                i18nPath: ELMP.resource('erdc-app/AbnormalPages/locale/index.js')
            };
        },
        computed: {
            imgSrc() {
                return ELMP.resource(`erdc-assets/images/${this.fileName}`);
            }
        },
        methods: {
            goBack() {
                this.$router.back();
            }
        }
    };
});
