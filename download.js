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

    console.log('信息: ', hosts)
    hosts.forEach(async host => {
        console.log('获取auth - ', host.label || host.url)
        let auth = await getAuth(host.url, host.username || username, host.password || password)
        console.log('获取auth成功: -', auth, ' - ', host.label || host.url)

        axios({
            url: host.url + '/platform/mfe/apps/page?pageSize=999&pageIndex=1',
            headers: {
                Authorization: auth
            }
        })
            .then(({ data: { data: { records } } }) => {
                runPromiseArrSort(records.map((t, index) => {
                    if(t.parentCode !== '-1'){
                        return () => Promise.resolve()
                    }
                    return () => new Promise(( resolve , reject ) => {
                        axios({
                            url: `http://192.168.21.69/platform/mfe/apps/download/${t.pkgType || 'erdc-resource'}/${t.id}`,
                            headers: {
                                Authorization: auth
                            },
                            responseType: 'stream'
                        })
                            .then(
                                (r) => {
                                    try {
                                        let writer = fsExt.createWriteStream(path.join('./tgz', (t.pkgType || 'erdc-resource') + index + '.tgz'))
                                        r.data.pipe(writer)
                                        writer.on('finish' , resolve)
                                        writer.on('close' , resolve)
                                    } catch (e) {
                                        console.log(e, index, "===================")
                                        reject()
                                    }
    
                                }
                            )
                            .catch( reject )
                    })
                }))
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
    return (await axios({
        method: 'post',
        url: `${hostUrl}/common/sso/login`,
        headers: {
            ...f.getHeaders()
        },
        data: f
    })).data.data
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

function runPromiseArrSort(promiseArr = [], initValue) {
    return promiseArr.reduce(
        (prev, current) => prev.then(current),
        Promise.resolve(initValue)
    )
}