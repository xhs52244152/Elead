window = {}
const JSEncrypt = require('jsencrypt');
const fsExt = require('fs-extra');
const axios = require('axios');
const path = require('path');
const FormData = require('form-data');

let config = null
try {
    config = JSON.parse(fsExt.readFileSync('./config.json', { encoding: 'utf-8' }))
    const {
        username,
        password,
        hosts
    } = config

    console.log('发布信息: ' , hosts )
    let fileCountMap = {}
    hosts.forEach(async (host , index) => {
        console.log('获取auth - ' , host.label || host.url)
        let auth = await getAuth(host.url, host.username || username, host.password || password)
        console.log('获取auth成功: -' , auth , ' - ' , host.label || host.url )
        fsExt.readdirSync('./tgz').forEach(async (filename , idx) => {
            if (filename.includes('.tgz')) {
                console.log(`上传 ${filename} - ${host.label || host.url}`)
                let pkgId = await getPackageId(host.url, path.resolve('./tgz', filename), auth)
                console.log(`上传 ${filename} 成功 - ${pkgId} - ${host.label || host.url}`)
                await updatePackage(pkgId, host.url, auth)
                console.log(`更新 ${filename} 成功 - ${pkgId} - ${host.label || host.url}`)
                fileCountMap[filename] = (fileCountMap[filename] || 0) + 1
                if(fileCountMap[filename] === hosts.length){
                    fsExt.rmSync(path.resolve('./tgz', filename))
                }
            }
        })
    })

} catch (error) {
    console.log(error)
    fsExt.writeFileSync('./config.json', JSON.stringify({
        username: 'erdcadmin',
        password: 'Elead@fam',
        hosts: [
            {
                url: 'http://192.168.0.50',
                username: 'erdcadmin',
                password: 'Elead@fam',
                label: 'uat'
            }
        ]
    }, null, 4))
}


async function encryptPassword(hostUrl, password) {
    let { data } = (await axios({ url: `${hostUrl}/fam/public/publickey` }))
    let jsEncrypt = new JSEncrypt();
    jsEncrypt.setPublicKey(data.data.data);
    return jsEncrypt.encrypt(password);
}

async function getAuth(hostUrl, username, password) {
    let encryptedPassword = await encryptPassword(hostUrl, password)
    let f = new FormData();
    f.append('password', encryptedPassword);
    f.append('username', username);
    let r = (await axios({
        method: 'post',
        url: `${hostUrl}/common/sso/login`,
        headers: {
            ...f.getHeaders()
        },
        data: f
    }))
    console.log('-----------' , r)
    return r.data.data
}

async function getPackageId(hostUrl, filepath = '', auth) {
    let f = new FormData();
    f.append('file', typeof (filepath) === 'string' ? fsExt.createReadStream(filepath) : filepath);
    return (await axios({
        method: 'post',
        url: hostUrl + '/platform/mfe/apps/upload/app',
        headers: {
            Authorization: auth,
            ...f.getHeaders()
        },
        data: f
    })).data.data;
}

async function updatePackage(packageId, hostUrl, auth) {
    let options = {
        method: 'PUT',
        url: hostUrl + '/platform/mfe/apps/update',
        headers: {
            Authorization: auth,
            'Content-Type': 'text/plain',
            Cookie: 'locale=zh-CN'
        },
        data: {
            id: packageId,
            versionDesc: '自动部署',
            sourceCodeFileId: ''
        }
    };
    return (await axios(options))
}