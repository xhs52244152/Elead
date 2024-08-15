define([], function () {
    return {
        i18n: {
            aboutParticipantManagementGuidelines: {
                CN: '关于参与者管理指引',
                EN: 'About Participant Management Guidelines'
            },
            userLicenseAuthorizationGuideline: {
                CN: '用户 License 授权',
                EN: 'User License Authorizing'
            },
            whatIsAuthorizeLicense: {
                CN: '什么是 License？',
                EN: 'What is a License?'
            },
            whatIsAuthorizeLicenseContent: {
                CN: 'Licence 是指软件许可证，是一种格式合同，由软件作者与用户签订，用以规定和限制软件用户使用软件的权利。<br />其主要功能就是校验软件的使用有效期、限制 License 授权数。',
                EN: "Licence refers to a software license, which is a format contract signed by the software author and the user to stipulate and limit the software user 's right to use the software. <br />Its main function is to verify the validity of the software and limit the number of licenses."
            },
            how2AuthorizeLicense: {
                CN: '如何给用户授权 License？',
                EN: 'How to authorize License to users?'
            },
            how2AuthorizeLicenseContent: {
                CN: '创建用户时，可直接配置license是否授权；创建用户后，可以在license配置里给该用户授权或进行批量用户授权，获得license授权的用户才可登录系统，达到license授权数量上限后，不可继续给新用户授权。',
                EN: 'When creating a user, you can directly configure whether the license is authorized. After a user is created, you can authorize the user or batch authorize the user in the license configuration. Only licensed users can log in to the system. After the number of authorized users reaches the upper limit, no new users can be authorized.'
            }
        }
    };
});
