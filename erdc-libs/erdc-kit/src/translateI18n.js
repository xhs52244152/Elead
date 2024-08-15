/**
 * 提取国际化
 * @example
 * const nameI18nJson = {
 *   "value": "基础应用服务",
 *   "en_us": "eRDCloud-FAM Base-App",
 *   "en_gb": "eRDCloud-FAM Base-App"
 * }
 * // zh_cn 环境下
 * FamKit.translateI18n(nameI18nJson); // '基础应用服务'
 * // en_us 环境下
 * FamKit.translateI18n(nameI18nJson); // 'eRDCloud-FAM Base-App'
 * // zh_tw 环境下
 * FamKit.translateI18n(nameI18nJson); // '基础应用服务'
 *
 * @param nameI18nJson
 * @returns {string|null}
 */
export default function translateI18n(nameI18nJson) {
    if (!nameI18nJson) {
        return null;
    }
    const currentLang = this.$store.state.i18n?.lang;
    let json = nameI18nJson;
    if (typeof json === 'string') {
        try {
            json = JSON.parse(nameI18nJson);
            if (typeof json === 'number') {
                return nameI18nJson;
            }
        } catch (e) {
            // 非json结构，直接返回
            return nameI18nJson;
        }
    }

    return json[currentLang] || json[currentLang.toLowerCase()] || json.value;
}
