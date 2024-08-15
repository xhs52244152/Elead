define([], function () {
    'use strict';

    function getRestMarkdown(options) {
        const { serviceName, version, description, createTime, tags, difArrs } = options;

        let template = `**${serviceName}:${version}**`;
        template += `\n\n**${description}**`;
        template += `\n\n**发布时间：${createTime}**`
        template += `\n\n------`;

        tags.forEach((tag) => {
            tag.children.forEach((path) => {
                if (path.deprecated) {
                    template += `\n\n## **<s>${path.summary}</s> **`;
                } else {
                    template += `\n\n## **${path.summary}**`;
                }
                template += '\n\n请求说明:';
                template += `\n\n<table class="table border-table description">
                        ${
                            path.description
                                ? `<tr><th align="left">接口描述</th><td align="left">${path.description}</td></tr>`
                                : ''
                        }
                        <tr><th align="left">接口地址</th><td align="left">${path.showUrl}</td></tr>
                        <tr><th align="left">请求方式</th><td align="left">${path.methodType}</td></tr>
                        <tr><th align="left">consumes</th><td align="left">${
                            path.consumes || 'application/json'
                        }</td></tr>
                        <tr><th align="left">produces</th><td align="left">${
                            path.produces || 'application/json'
                        }</td></tr>
                    </table>`;

                template += '\n\n请求示例：';
                template += `\n\n${path.requestValue}`;

                template += '\n\n请求参数：';
                template += '\n\n| 参数名称      | 参数说明     |     请求类型 |  是否必须     |  数据类型  |  schema  |';
                template += `\n| ------------ | -------------------------------- |-----------|--------|----|--- |`;    
                    
                path.parameters.forEach((param) => {
                    template += `\n| ${param.name} | ${param.description}  | ${param.in} | ${param.require} | ${param.type} | ${param.schemaValue} |`;
                });

                if (path.multipartResponseSchema) {
                    path.responseCodes.forEach((rcode) => {
                        template += `\n\n${rcode.code}响应示例:`;
                        template += '\n\n```json'
                        template += `\n${rcode.responseValue}`;
                        template += '\n```';       
                        
                        template += `\n\n${rcode.code}响应参数:`;
                        template += '\n\n| 参数名称         | 参数说明   |    类型   |  schema |';
                        template += '\n| ------------ | -------------------|-------|----------- |';
                        rcode.responseParameters((param) => {
                            template += `\n| ${param.name} | ${param.description}  |${param.type}  | ${param.schemaValue}   |`;
                        });
                    });
                }

                if (path.responseValue) {
                    template += '\n\n响应示例:';
                    template += '\n\n```json';
                    template += `\n${path.responseValue}`;
                    template += '\n```';
                }

                if (path.responseParameters) {
                    template += `\n\n响应参数:`;
                    template += '\n\n| 参数名称         | 参数说明                             |    类型 |  schema |';
                    template += `\n| ------------ | -------------------|-------|----------- |`;
                    path.responseParameters.forEach((param) => {
                        template += `\n| ${param.name}| ${param.description}  | ${param.type}  | ${param.schemaValue}   |`;
                    });
                }
            });
        });

        template += '\n\n#模型列表';
        template += '\n\n| 参数名称         | 参数说明    |  数据类型  |  schema  |';
        template += '| ------------ | -------------------------------- |----|--- |';
        difArrs.forEach((ref) => {
            ref.properties.forEach((rp) => {
                template += `\n|${rp.name} | ${rp.description}  |${rp.type}  | ${rp.schemaValue}   |`;
            });
        });

        return template;
    }

    function getDubboMarkdown(options) {
        const { serviceName, version, description, createTime, tags, difArrs } = options;

        let template = `**${serviceName}:${version}**`;
        template += `\n\n**${description}**`
        template += `\n\n**发布时间：${createTime}**`;
        template += '\n\n------';

        tags.forEach((tag) => {
            if (tag.deprecated) {
                template += `\n\n#<s>${tag.name}</s>`;
            } else {
                template += `\n\n#${tag.name}`;
            }

            if (tag.className) {
                template += `\n\n<div class="name"> 全类名: ${tag.className} </div>`;
            }

            if (tag.description) {
                template += `\n\n<div class="name"> 类功能描述: ${tag.description} </div>`;
            }

            tag.children.forEach((path) => {
                if (path.deprecated) {
                    template += `\n\n## **<s>${path.name}</s>**`;
                } else {
                    template += `\n\n## **${path.name}**`;
                }

                template += '\n\n方法说明:';
                template += '\n\n| 方法名称 | 方法功能描述 |';
                template += '\n| ------------ | -------------------------------- |';
                template += `\n| ${path.methodName} | ${path.description} |`

                template += '\n\n参数列表:';
                template += '\n\n| 参数名称      | 参数说明     |   数据类型  |  schema |';
                template += '\n| ------------ | -------------------------------- |-----------|--------|';

                path.parameters.forEach((param) => {
                    template += `\n| ${param.name} | ${param.description}  | ${param.type
                        .replaceAll('<', '&#60;')
                        .replaceAll('>', '&#62;')} | ${param.schemaValue} |`;
                });


                if (path.responseParameters) {
                    template += `\n\n响应: ${path.responseParameters}`;
                }
                if (path.resultDesc) {
                    template += `\n\n响应描述: ${path.resultDesc}`;
                }
            });
        });

        template += '\n\n# 模型列表';
        template += '\n\n| 参数名称         | 参数说明    |     校验 |  是否必须      |  数据类型  |  schema  |';
        template += '\n| ------------ | -------------------------------- |-----------|--------|----|--- |';

        difArrs.forEach((ref) => {
            ref.properties.forEach((rp) => {
                template += `\n|${rp.name} | ${rp.description}  | ${rp.validations} | ${rp.required} |${rp.type
                    .replaceAll('<', '&#60;')
                    .replaceAll('>', '&#62;')}  | ${rp.schemaValue}   |`;
            });
        });

        return template;
    }

    return {
        getDubboMarkdown,
        getRestMarkdown
    };
});
