'use strict';

/* jshint expr:true */


const
    should = require('chai').should(),
    Bluebird = require('bluebird'),
    _ = require('lodash'),

    randomByWeight = require('../lib/randomByWeight');

describe('RandomByWeight unit tests:', function () {

    it('должен возвращать элементы с вероятностью соответсвующей весам', function (done) {
        const
            ITERATION_COUNT = 100000,
            TRESHOLD = 0.5,
            selectedElements = [],
            elements = [
                { id: 1, percent: 10 },
                { id: 2, percent: 40 },
                { id: 3, percent: 50 }
            ];

        const getRandomElement = randomByWeight(elements, _.map(elements, 'percent'));

        for (let i=ITERATION_COUNT; i--;) {
            selectedElements.push( getRandomElement() );
        }

        let percentSum = 0;
        const percents = _(selectedElements)
            .countBy('id')
            .reduce((result, count, elementId)=>{
                const percent = count / ITERATION_COUNT * 100;
                percentSum += percent;
                result[elementId] = percent;
                return result;
            }, {});

        percentSum.should.be.equal(100);

        elements.forEach(element=>{
            const percent = percents[element.id];
            percent.should.be.below(element.percent + TRESHOLD);
            percent.should.be.above(element.percent - TRESHOLD);
        });

        done();
    });

});