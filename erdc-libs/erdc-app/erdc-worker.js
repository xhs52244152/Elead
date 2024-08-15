importScripts(
    '/erdc-thirdparty/platform/sockjs-client/dist/sockjs.min.js',
    '/erdc-thirdparty/platform/@stomp/stompjs/bundles/stomp.umd.min.js',
    '/erdc-thirdparty/platform/vue/dist/vue.js'
);

const uuids = [];
const ports = [];
let sock = null;
let stompClient = null;
function initSocket(headers) {
    if (stompClient) {
        return;
    }
    sock = new SockJS('/socket');
    stompClient = StompJs.Stomp.over(sock);

    stompClient.connect(
        headers,
        function () {
            console.log('成功了');
            broadcast({
                type: 'websocketConnected'
            });
            sock.onclose = function () {
                broadcast({
                    type: 'websocketClosed'
                });
            };
        },
        function () {
            console.log('失败了');
            broadcast({
                type: 'websocketConnectFailure'
            });
        }
    );
}
function disconnect() {
    if (stompClient) {
        stompClient.disconnect();
    }
}
function subscribe(topic, headers) {
    if (stompClient) {
        stompClient && unsubscribe(topic);
        stompClient.subscribe(
            topic,
            function (resp) {
                broadcast({
                    type: 'socketMessage',
                    topic: topic,
                    data: resp.body ? JSON.parse(resp.body) : ''
                });
            },
            Object.assign(
                {},
                {
                    id: 'sub-' + topic,
                    'Content-Type': 'application/json;charset=UTF-8'
                },
                headers || {}
            )
        );
    }
}
function unsubscribe(topic) {
    return stompClient.unsubscribe('sub-' + topic);
}

function sendMessage(topic, header, body) {
    if (stompClient) {
        stompClient.send(topic, header, body);
    }
}

self.onconnect = (e) => {
    const port = e.ports[0];
    ports.push(port);

    // 获取页面标识
    const uuid = Math.random().toString(36).substr(2);
    uuids.push(uuid);
    port.postMessage({
        type: 'connect',
        uuid: uuid
    });
    initSocket();

    // 监听消息
    port.onmessage = (e) => {
        // const index = ports.indexOf(port);
        // const uuid = uuids[index];
        // console.log(e.data);
        switch (e.data.type) {
            case 'subscribe':
                subscribe(e.data.topic, e.data.headers);
                break;
            case 'disconnect':
                disconnect();
                break;
            case 'unsubscribe':
                unsubscribe(e.data.topic);
                break;
            case 'sendMessage':
                sendMessage(e.data.topic, e.data.headers, e.data.body);
                break;
            case 'initSocket':
                initSocket(e.data.headers);
                break;
            case 'unload': {
                const index = ports.findIndex((i) => i === port);
                ports.splice(index, 1);
                break;
            }
        }
    };
};

// 群发消息
const broadcast = (data) => {
    ports.forEach((port) => {
        port.postMessage(data);
    });
};
