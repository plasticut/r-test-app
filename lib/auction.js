'use strict';

const
    debug = require('debug')('r-test-app:auction'),
    randomByWeight = require('./randomByWeight');

module.exports = {
    selectBanners,
    isValidBannerCountry
};

/**
 * Группирует обьекты по значению указанного поля
 *
 * @param array elements Массив группируемых обьектов
 * @param string field Поле для группировки
 * @return object
 */
function groupBy(elements, field) {
    const result = Object.create(null);
    let object;

    for (let i=elements.length; i--;) {
        object = elements[i];
        (result[object[field]] = result[object[field]] || []).push(object);
    }

    return result;
}

/**
 * Формирует массив весов баннеров на основе цен
 *
 * @param array banners Массив баннеров
 * @return array
 */
function getBannerWeightsByPrice(banners) {
    return banners.map( banner=>Math.floor(banner.price * 100) );
}

/**
 * Проверяет подходит ли баннер к указанной стране
 *
 * @param object banner Баннер
 * @param string country Страна
 * @return boolean
 */
function isValidBannerCountry(banner, country) {
    let countries = banner.countries;

    if (countries.length === 0 || !country) {
        return true;
    }

    for (let j=countries.length; j--;) {
        if (countries[j] === country) {
            return true;
        }
    }

    return false;
}

/**
 * Возвращает баннеры согласно поставленному заданию
 *
 * @param array banners Массив баннеров
 * @param int places Максимальное кол-во мест
 * @param string country Страна
 * @return array Массив баннеров
 */
function selectBanners(banners, places, country) {
    let filtredBanners = [];

    debug('selectBanners input', banners, places, country);

    // оставляем тоько те баннеры которые подходят под указанную страну
    for (let i=banners.length; i--;) {
        let banner = banners[i];
        if (isValidBannerCountry(banner, country)) {
            filtredBanners.push(banner);
        }
    }

    // группируем оставшиеся баннеры по ид кампании
    let groupByCampaignId = groupBy(filtredBanners, 'campaignId');

    filtredBanners = [];

    debug('selectBanners groupByCampaignId', groupByCampaignId);

    // выбираем из каждой группы по одному случайному баннеру
    for (let campaignId in groupByCampaignId) {
        const campaignBanners = groupByCampaignId[campaignId];
        // Формируем веса
        const weights = getBannerWeightsByPrice( campaignBanners );
        // Инициализируем функцию выборки
        const selectRandomBanner = randomByWeight( campaignBanners, weights );
        // выбираем баннер
        filtredBanners.push( selectRandomBanner() );
    }

    debug('selectBanners filtredBanners', filtredBanners);

    // если количество мест больше либо равно кол-ву групп то возвращаем выбранные баннеры
    if (places >= filtredBanners.length) {
        return filtredBanners;
    }

    // Формируем веса
    const weights = getBannerWeightsByPrice( filtredBanners );
    // Инициализируем функцию выборки
    const selectRandomBanner = randomByWeight( filtredBanners, weights );

    const results = [];

    // Выбираем баннеры
    while (places > 0) {
        let banner = selectRandomBanner();
        if (results.indexOf(banner) === -1) {
            results.push(banner);
            places--;
        }
    }
    debug('selectBanners results', results);

    return results;
}
