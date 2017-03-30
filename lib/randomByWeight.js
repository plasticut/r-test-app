'use strict';

const
    debug = require('debug')('r-test-app:randomByWeight');

module.exports = randomByWeight;

/**
 * Возвращает целое случайное число в заданном диапазоне
 *
 * @param int low нижняя граница выборки
 * @param int hight верхняя граница выборки
 * @return int случайное целое
 */
function randomInt(low, high) {
    return Math.floor(Math.random() * (high - low + 1) + low);
}

/**
 * Подготавливает данные необходимые для выборки случайного элемента на основе заданных весов.
 * Возвращает функцию выбирающую случайный элемент
 *
 * @param array elements массив элементов
 * @param array weights массив весов
 * @return function функция возвращающая случайный элемент
 */
function randomByWeight(elements, weights) {
    let weightSums = [];
    let totalWeight = 0;

    // Подготавливаем массив для бинарного поиска
    for (let i=0; i < weights.length; i++) {
        totalWeight += weights[i];
        weightSums.push( totalWeight );
    }

    return function () {
        const randomWeight = randomInt(1, totalWeight);
        return elements[ binarySearch(randomWeight, weightSums) ];
    };
}

/**
 * Ищет в отсортированном массиве число и возвращает индекс если оно найдено.
 * Если элемент не найдет то возвращает подходящую для него позицию.
 *
 * @param int value число для поиска
 * @param array numbers массив чисел
 * @return int индекс
 */
function binarySearch(value, numbers){

    let rightIdx = numbers.length - 1;
    let leftIdx = 0, curIdx;

    while (leftIdx < rightIdx) {
        curIdx = Math.floor((rightIdx + leftIdx) / 2);

        if (numbers[curIdx] < value) {
            leftIdx = curIdx + 1;
        } else
        if (numbers[curIdx] > value) {
            rightIdx = curIdx - 1;
        } else {
            return curIdx;
        }
    }

    if ( leftIdx !== rightIdx ){
        return curIdx;
    } else {
        return (numbers[leftIdx] >= value) ? leftIdx : leftIdx + 1;
    }
}
