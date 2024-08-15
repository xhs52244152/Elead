define([
    'text!' + ELMP.resource('platform-api/views/DubboDoc/index.html'),
    ELMP.resource('platform-api/mixins/doc.js'),
    ELMP.resource('platform-api/util/swagger.js'),
    ELMP.resource('platform-api/util/index.js'),
    'css!' + ELMP.resource('platform-api/styles/docCommon.css')
], function (template, docMixin, Swagger, util) {
    return {
        mixins: [docMixin],
        template,
        methods: {
            parseApiPaths(menu, currentInstance) {
                let paths = [];

                Object.keys(menu.paths).forEach((key) => {
                    const path = menu.paths[key];
                    if (path) {
                        const ins = this.createApiInfoInstance(currentInstance, key, path);
                        paths.push(ins);
                    }
                });

                // 根据请求的url和method去重
                paths = _.uniq(paths, (item) => item.moduleName);
                return paths;
            },

            createApiInfoInstance(currentInstance, path, apiInfo) {
                if (!apiInfo) return;

                const {
                    deprecated,
                    className = ['default'],
                    desc = '',
                    resultDesc = '',
                    methodName = '',
                    response = '',
                    resOriginalRef = '',
                    name = '',
                    params = [],
                    consumes = []
                } = apiInfo;

                const swpinfo = new Swagger.SwaggerBootstrapUiApiInfo();
                swpinfo.deprecated = deprecated ?? swpinfo.deprecated;
                swpinfo.className = className;
                swpinfo.description = desc;
                swpinfo.resultDesc = resultDesc;
                swpinfo.methodName = methodName;
                swpinfo.moduleName = path;
                swpinfo.response = response;
                swpinfo.responseParameters = response;
                swpinfo.resOriginalRef = resOriginalRef;
                swpinfo.name = name;
                swpinfo.tags = [apiInfo.moduleName];
                swpinfo.hashCollections = swpinfo.tags.map((tag) => `#/${currentInstance.name}/${tag}`);

                swpinfo.parameters = params.map(({ name, javaType, displayName, originalRef }) => {
                    const minfo = new Swagger.SwaggerBootstrapUiParameter();
                    minfo.name = name ?? minfo.name;
                    minfo.type = javaType ?? minfo.type;
                    minfo.description = displayName ?? minfo.description;
                    minfo.schemaValue = originalRef ?? minfo.schemaValue;

                    if (originalRef) {
                        const def = util.getDefinitionByName(currentInstance, originalRef);
                        if (def != null) {
                            minfo.def = def;
                            minfo.value = def.value;

                            if (swpinfo.response && swpinfo.response !== '') {
                                if (swpinfo.response.startsWith('List')) {
                                    minfo.txtValue = JSON.stringify([minfo.value], null, '\t');
                                } else {
                                    minfo.txtValue = JSON.stringify(minfo.value, null, '\t');
                                }
                            } else {
                                minfo.txtValue = JSON.stringify(minfo.value, null, '\t');
                            }
                        }
                    }

                    return minfo;
                });

                // swpinfo.tags.forEach((tag) => util.mergeApiInfoSelfTags(tag));

                if (resOriginalRef && resOriginalRef !== '') {
                    const original = resOriginalRef.match(/\\\\<([^}]*)\\\\>/);
                    let resOriginalRefFinal = resOriginalRef;

                    if (original) resOriginalRefFinal = original[1];

                    currentInstance.difArrs.forEach(({ name, value }) => {
                        if (name === resOriginalRefFinal) {
                            const na = original ? [value] : value;

                            swpinfo.responseValue = JSON.stringify(na, null, '\t');
                            swpinfo.responseJson = na;
                        }
                    });
                }

                if (!swpinfo.parameters || !swpinfo.parameters.length) return swpinfo;

                const count = swpinfo.parameters.filter((param) => param.in).length;
                const tmpJsonValue = swpinfo.parameters.find((param) => !!param.txtValue)?.txtValue ?? null;
                if (count === 1) {
                    swpinfo.requestValue = tmpJsonValue;
                }
                const ctp = consumes[0];
                if (ctp) {
                    if (ctp === 'multipart/form-data') {
                        swpinfo.contentType = ctp;
                        swpinfo.contentValue = 'form-data';
                    } else if (ctp === 'text/plain') {
                        swpinfo.contentType = ctp;
                        swpinfo.contentValue = 'raw';
                        swpinfo.contentShowValue = 'Text(text/plain)';
                    } else {
                        let defaultValue = 'x-www-form-urlencoded';
                        let defaultType = 'application/x-www-form-urlencoded;charset=UTF-8';

                        for (const { in: input, schemaValue } of swpinfo.parameters) {
                            if (input === 'body' && schemaValue === 'MultipartFile') {
                                defaultValue = 'form-data';
                                defaultType = 'multipart/form-data';
                                break;
                            } else if (input === 'body') {
                                defaultValue = 'raw';
                                defaultType = 'application/json';
                                break;
                            } else if (schemaValue === 'MultipartFile') {
                                defaultValue = 'form-data';
                                defaultType = 'multipart/form-data';
                                break;
                            }
                        }

                        swpinfo.contentType = defaultType;
                        swpinfo.contentValue = defaultValue;
                    }
                } else {
                    let defaultValue = 'x-www-form-urlencoded';
                    let defaultType = 'application/x-www-form-urlencoded;charset=UTF-8';

                    for (const { in: input, schemaValue } of swpinfo.parameters) {
                        if (input === 'body' && schemaValue === 'MultipartFile') {
                            defaultValue = 'form-data';
                            defaultType = 'multipart/form-data';
                            break;
                        } else if (input === 'body') {
                            defaultValue = 'raw';
                            defaultType = 'application/json';
                            break;
                        } else if (schemaValue === 'MultipartFile') {
                            defaultValue = 'form-data';
                            defaultType = 'multipart/form-data';
                            break;
                        }
                    }

                    swpinfo.contentType = defaultType;
                    swpinfo.contentValue = defaultValue;
                }

                return swpinfo;
            }
        }
    };
});
