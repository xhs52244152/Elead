define([], function () {
    return {
        /*html*/
        template: `
          <div class="erd-ex-dialog__title" style="font-size: var(--fontSizeLarge);">
              {{ businessObject.name }} {{ panelTitle }}
          </div>
        `,
        props: {
            activeElement: {
                type: Object,
                default() {
                    return {};
                }
            }
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('biz-bpm/editor/locale/index.js'),
                i18nMappingObj: this.getI18nKeys(['globalConfig', 'nodeConfig'])
            };
        },
        computed: {
            businessObject() {
                return this.activeElement.businessObject || {};
            },
            panelTitle() {
                return this.i18nMappingObj[
                    /\S+:Process/i.test(this.activeElement.type) ? 'globalConfig' : 'nodeConfig'
                ];
            }
        }
    };
});
