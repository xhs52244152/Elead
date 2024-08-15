export default function joinUrl(url, params) {
    if (_.isEmpty(params)) {
        return url;
    }
    _.each(params, function (value, key) {
        if (value) {
            value = value.toString();
            var pattern = new RegExp('\\b' + key + '=([^&]*)');
            const replaceText = key + '=' + encodeURIComponent(value);
            if (_.isEmpty(value)) {
                url = url.replace(new RegExp('[?|&]\\b' + key + '=([^&]*)'), '');
            } else {
                if (url.match(pattern)) {
                    url = url.replace(pattern, replaceText);
                } else if (url.match('[?]')) {
                    url = url + '&' + replaceText;
                } else {
                    url = url + '?' + replaceText;
                }
            }
        }
    });
    return url;
}
