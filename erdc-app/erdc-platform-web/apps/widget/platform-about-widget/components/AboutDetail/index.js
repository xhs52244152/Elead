define([], function () {
    const { ref, computed } = require('vue');

    return {
        setup() {
            const i18nPath = ref(ELMP.resource('platform-about-widget/locale'));
            const logoUrl = ELMP.resource('erdc-assets/images/.svg');
            const systemTitle = computed(() => {
                return (
                    window.ELCONF.systemTitle || {
                        displayCn: 'eRDCloud 企业研发数字化平台',
                        displayEn: 'eRDCloud Enterprise R&D Digital Platform'
                    }
                );
            });

            return {
                i18nPath,
                systemTitle,
                logoUrl
            };
        },
        template: `
            <div class="flex align-items-center" style="height: 92px;border-bottom: 1px solid var(--colorSplit);">
              <div class="flex w-100p">
                <div class="mr-2xl"><img :src="logoUrl" alt="" style="max-width: 127px; max-height: 60px;"/></div>
                <div class="flex flex-column justify-center align-items-center  w-0 grow-1">
                    <div class="p-0 m-0 font-black color-normal" style="font-size: 20px;">{{systemTitle.displayCn}}</div>
                    <div class="p-0 m-0 text-normal text-lg letter-spacing-wide">{{systemTitle.displayEn}}</div>
                </div>
              </div>
            </div>
        `
    };
});
