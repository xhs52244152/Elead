define([], function () {
    const languageObj = {
        person: { EN: 'Personal Center', CN: '个人中心' },
        language: { EN: 'Switch Language', CN: '语言切换' },
        tenant: { EN: 'Switch Tenant', CN: '切换租户' },
        signOut: { EN: 'Sign Out', CN: '退出登录' },
        confirm: { EN: 'Confirm', CN: '确 认' },
        cancel: { EN: 'Cancel', CN: '取 消' },
        sureConfirm: {
            EN: 'Confirm logout of current user?',
            CN: '确认退出当前用户吗？'
        },
        replaceSignature: { CN: '更换签章', EN: 'Replace Signature' },
        inputSignature: { CN: '录入签章', EN: 'Input signature' },
        handSignature: { CN: '手写签章', EN: 'Hand signature' },
        imgSignature: { CN: '图片签章', EN: 'Picture signature' },
        handSigTips: { CN: '鼠标书写之后,进行裁剪', EN: 'After entering the picture, crop it' },
        imgSigTips: { CN: '上传图片之后,进行裁剪', EN: 'After uploading the picture, cut it' },
        manualEntry: { CN: '手动录入', EN: 'Manual entry' },
        signaturePlease: {
            CN: '请在下方区域写您的个人签章，姓名请横向书写',
            EN: 'Please write your personal signature in the area below. Please write your name horizontally'
        },
        wrongRest: {
            CN: '可以点击下方按键清空',
            EN: 'If writing is wrong, you can click the reset button to write again'
        },
        reset: { CN: '重置', EN: 'Reset' },
        noCurrentTenant: { CN: '非当前租户数据禁止操作', EN: 'Non-current tenant data cannot be performed' },
        fam_signature_type: { CN: '签章方式', EN: 'Signature Type' },
        fam_signature_preview: { CN: '签章预览', EN: 'Signature Preview' },
        fam_signature_type_write: { CN: '手写签章', EN: 'Write Signature' },
        fam_signature_type_image: { CN: '图片签章', EN: 'Image Signature' },
        fam_signature_type_write_tips: {
            CN: '请在下方区域输入您的个人签章，请横向书写',
            EN: 'Please enter your personal signature in the field below, writing horizontally'
        },
        fam_signature_type_image_tips: {
            CN: '请点击下方+添加签章图片',
            EN: 'Please click below + to add a signature picture'
        },
        ok: { CN: '确定', EN: 'OK' },
        newPassword: { CN: '新密码', EN: 'News Password' },
        // //部门成员列
        code: { CN: '工号', EN: 'Code' },
        loginAccount: { CN: '登录账号', EN: 'Login Account' },
        mobile: { CN: '手机', EN: 'Mobile' },
        orgName: { CN: '部门', EN: 'Organization' },
        // // 部门成员表单
        chineseName: { CN: '用户中文名', EN: 'Chinese Name' },
        englishName: { CN: '用户英文名', EN: 'English Name' },
        password: { CN: '登录密码', EN: 'Password' },
        emailAddress: { CN: '邮箱地址', EN: 'Email' },
        confidentiality: { CN: '密级', EN: 'Confidentiality level' },
        autograph: { CN: '签名', EN: 'Autograph' },
        请输入邮箱地址: { CN: '请输入邮箱地址', EN: 'Please enter the email address' },
        请输入正确的邮箱地址: { CN: '请输入正确的邮箱地址', EN: 'Please enter the correct email address' },
        请输入工号: { CN: '请输入工号', EN: 'Please enter the job number' },
        请输入正确的工号: { CN: '请输入正确的工号,仅支持英文、数字', EN: 'Please enter the correct job number' },
        请输入账号: { CN: '请输入账号', EN: 'Please enter an account' },
        请输入正确的账号: {
            CN: '请输入正确的账号,仅支持中文、英文、数字和下划线，且不能为纯数字',
            EN: 'Please enter the correct account number, which only supports Chinese, English, numbers and underscores, and cannot be pure numbers'
        },
        请输入用户中文名: { CN: '请输入用户中文名', EN: 'Please enter the users Chinese name' },
        请输入正确的用户中文名: { CN: '请输入正确的用户中文名', EN: 'Please enter the correct user Chinese name' },
        请输入用户英文名: { CN: '请输入用户英文名', EN: 'Please enter the users English name' },
        请输入正确的用户英文名: {
            CN: '请输入正确的用户英文名,仅支持英文、下划线、空格和数字',
            EN: 'Please enter the correct user English name and number'
        },
        请输入11位正确的手机号: { CN: '请输入11位正确的手机号', EN: 'Please enter 11 correct phone numbers.' },
        changedPasswordSuccessfully: {
            CN: '密码修改成功，请重新登录',
            EN: 'The password is changed successfully. Please log in again.'
        },
        oldPassword: { CN: '原密码', EN: 'Old password' },
        confirmPassword: { CN: '确认密码', EN: 'Confirm password' },
        passwordDifferent: {
            CN: '新密码与确认密码不一致',
            EN: 'The new password is different from the confirmed password.'
        },
        changePassword: { CN: '修改密码', EN: 'Change password' },
        imageTips: { CN: '只能选择jpg或者png文件', EN: 'Only the jpg or png files are selected' },
        passwordSame: { CN: '新密码与旧密码不能相同', EN: 'The new password cannot be the same as the old password' }
    };

    return {
        i18n: languageObj
    };
});
