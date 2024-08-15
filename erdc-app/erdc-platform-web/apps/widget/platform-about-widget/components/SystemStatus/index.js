define(['css!' + ELMP.resource('platform-about-widget/index.css')], function () {
    return {
        template: `
          <div class="text-normal">
            <div ref="serviceRef">
                <div v-for="service in serviceList" :key="service.oid" class="plr-16 hoverable">
                    <div class="flex align-items-center justify-between w-100p" style="height: 30px;" :class="{ 'border-line': service.hasBorder }">
                        <div class="flex align-items-center">
                            <span class="mr-xl">{{translateService(service)}}</span>
                            <span class="w-4 h-4 rounded mr-normal none" :class="[!service.online ? 'bg-disabled' : service.healthy ? 'bg-success' : 'bg-warning', service.hideHealthy ? 'none' : '']"></span>
                            <erd-tag v-if="service.version" size="mini" type="info">v{{service.version}}{{service.buildVersion ? ':' + service.buildVersion : ''}}</erd-tag>
                        </div>
                        <p v-if="service.displayName" class="color-placeholder mb-0">{{service.displayName}}</p>
                    </div>
                </div>
            </div>
          </div>
        `,
        props: {
            serviceList: {
                type: Array,
                default() {
                    return [];
                }
            }
        },
        data() {
            return {
                i18nPath: ELMP.resource('platform-about-widget/locale')
            };
        },
        methods: {
            translateService(service) {
                const result = [service.identifierNo];
                return result.join('');
            }
        }
    };
});
