define([ELMP.resource('ppm-store/index.js'), 'framework'], function (store, { useApp }) {
    const ErdcKit = require('erdcloud.kit');
    return {
        name: 'baselineSelect',
        template: `
            <erd-select
                v-if="isShowBaseline"
                class="w-100"
                v-model="baselineOptionsValue" 
                @change="changeBaseline"
            >
                <erd-option
                    v-for="option in baselineOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                    :disabled="option.disabled"
                ></erd-option>
            </erd-select>
        `,
        props: {
            className: String
        },
        components: {
            ComponentWidthLabel: ErdcKit.asyncComponent(
                ELMP.resource('erdc-components/FamAdvancedTable/FamFieldComponents/ComponentWidthLabel/index.js')
            )
        },
        data() {
            return {
                i18nPath: ELMP.resource('ppm-component/ppm-components/BaselineSelect/locale/index.js'),
                baselineOptions: [],
                baselineOptionsValue: ''
            };
        },
        computed: {
            isTemplate() {
                let projectInfo = store.state?.projectInfo || {};
                return !!(projectInfo['templateInfo.tmplTemplated'] && this.$route.query.pid);
            },
            // 如果是项目模板或者项目空间没有基线菜单就隐藏
            async isShowBaseline() {
                let resources = this.$store.state?.route?.resources?.children || [];
                let resource = resources.find((item) => item.identifierNo === 'projectProject')?.children;
                if (!resource) {
                    let currentRoute = this.$route;
                    let listPage = useApp()?.$options?.layout?.space.listPage;
                    if (listPage) {
                        currentRoute = {
                            path: listPage
                        };
                    }
                    let currentResourcePath = this.$store.getters['route/matchResourcePath'](currentRoute);
                    let { oid } = currentResourcePath[1] || {};
                    resource = await this.getResource(oid, this.$store?.state?.space?.object?.containerRef);
                }
                let baselineMenuInfo = resource?.find((item) => item.identifierNo === 'projectBaselineList');
                return !!baselineMenuInfo && !this.isTemplate;
            }
        },
        created() {
            if (this.$route.query.pid) this.getBaselineOptions(this.className || this.$route.meta.className);
        },
        methods: {
            getBaselineOptions(type) {
                this.$famHttp({
                    url: '/baseline/getMasterByMainRef',
                    method: 'GET',
                    className: store.state.classNameMapping.baseline,
                    params: {
                        oid: this.$route.query.pid,
                        type
                    }
                }).then((res) => {
                    let result = res.data;
                    this.baselineOptions = result?.masterList.map((item) => {
                        return {
                            value: item.oid,
                            label: item.name,
                            latestOid: item.latestOid
                        };
                    });
                    this.baselineOptions.unshift({
                        value: '',
                        pid: result?.persistableRef || '',
                        label: this.i18n.latestData
                    });
                    if (this.$route.query?.masterRef) {
                        this.baselineOptionsValue = this.$route.query?.masterRef;
                        this.changeBaseline(this.baselineOptionsValue, 'mounted:change');
                    }
                });
            },
            changeBaseline(val, name) {
                let currentBaselineData = this.baselineOptions.find((item) => item.value === val);
                this.$emit(name || 'change', currentBaselineData);
            },
            getResource(parentKey, containerRef) {
                return new Promise((resolve) => {
                    let params = {
                        className: 'erd.cloud.foundation.core.menu.entity.Resource',
                        appNames: 'PPM',
                        containerRef,
                        isGetLinkCount: false,
                        parentKey
                    };
                    this.$famHttp({
                        url: '/plat-system/listByParentKey',
                        params,
                        method: 'GET'
                    }).then((res) => {
                        resolve(res.data);
                    });
                });
            }
        }
    };
});
