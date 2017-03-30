'use strict';

/* jshint expr:true */


const
    should = require('chai').should(),
    Bluebird = require('bluebird'),
    _ = require('lodash'),

    auction = require('../lib/auction');


const banners = [
    { id: 1,  campaignId: 1, countries: [],              price: 5 },

    { id: 2,  campaignId: 2, countries: ['RUS'],         price: 5 },
    { id: 3,  campaignId: 2, countries: ['RUS'],         price: 5 },

    { id: 7,  campaignId: 3, countries: ['RUS', 'USA'],  price: 5 },
    { id: 8,  campaignId: 3, countries: ['RUS', 'USA'],  price: 10 },
    { id: 9,  campaignId: 3, countries: ['RUS', 'USA'],  price: 20 },

    { id: 10, campaignId: 4, countries: ['RUS', 'USA', 'NLD'],  price: 5 },
    { id: 12, campaignId: 4, countries: ['RUS', 'USA', 'NLD'],  price: 20 },
    { id: 13, campaignId: 4, countries: ['RUS', 'USA', 'NLD'],  price: 30 },
    { id: 14, campaignId: 4, countries: ['RUS', 'USA', 'NLD'],  price: 40 }
];


describe('Auction unit tests:', function () {

    describe('Method isValidBannerCountry', function() {

        it('если список стран баннера пуст,  либо страна не указана, то должна подходить любая страна', function(done) {

            ['RUS', 'NLD', 'USA', '', undefined, null].forEach(country=>{
                auction.isValidBannerCountry({ countries: [] }, country).should.be.true;
            });

            done();
        });

        it('должен возвращать true если у баннера есть указанная страна', function(done) {

            auction.isValidBannerCountry({ countries: ['RUS', 'NLD'] }, 'RUS').should.be.true;

            done();
        });

        it('должен возвращать false если у баннера нет указанной страны', function(done) {

            auction.isValidBannerCountry({ countries: ['RUS', 'NLD'] }, 'ECU').should.be.false;

            done();
        });

    });

    describe('Method selectBanners', function () {
        it('идентификатор рекламной кампании должен быть уникальным для баннеров в результате выдачи', function (done) {
            let selectedBanners;

            for (let i=100; i--;) {
                selectedBanners = auction.selectBanners(banners, 3, 'RUS');
                _.uniqBy(selectedBanners, 'campaignId').length.should.be.equal(selectedBanners.length);

                selectedBanners = auction.selectBanners(banners, 4);
                _.uniqBy(selectedBanners, 'campaignId').length.should.be.equal(selectedBanners.length);
            }

            done();
        });

        it('должны возвращаться только те баннеры, которые предназначены для этой страны', function (done) {

            function validateBannerCountry(country) {
                return function(banner) {
                    auction.isValidBannerCountry(banner, country).should.be.true;
                };
            }

            ['RUS', 'NLD', 'USA'].forEach(country=>{
                const validate = validateBannerCountry(country);
                for (let i=100; i--;) {
                    auction
                        .selectBanners(banners, 3, country)
                        .forEach(validate);
                }
            });

            done();
        });

        it('в случае если цена одинакова, баннеры должны отдаваться равновероятно', function (done) {
            this.timeout(10000);

            const
                ITERATION_COUNT = 100000,
                TRESHOLD = 0.5,

                selectedBanners = [];

            let banners = [
                { id: 15, campaignId: 5, countries: ['ECU'],  price: 5, percent: 2.5 },
                { id: 16, campaignId: 5, countries: ['ECU'],  price: 5, percent: 2.5 },

                { id: 17, campaignId: 6, countries: ['ECU'],  price: 5, percent: 2.5 },
                { id: 18, campaignId: 6, countries: ['ECU'],  price: 5, percent: 2.5 },

                { id: 19, campaignId: 7, countries: ['ECU'],  price: 40, percent: 40 },
                { id: 20, campaignId: 8, countries: ['ECU'],  price: 50, percent: 50 }
            ];

            for (let i=ITERATION_COUNT; i--;) {
                Array.prototype.push.apply(selectedBanners, auction.selectBanners(banners, 1, 'ECU'));
            }

            let percentSum = 0;
            let percents = _(selectedBanners)
                .countBy('id')
                .reduce((result, count, bannerId)=>{
                    let percent = count / ITERATION_COUNT * 100;
                    percentSum += percent;
                    result[bannerId] = percent;
                    return result;
                }, {});

            percentSum.should.be.equal(100);

            banners.forEach(banner=>{
                let percent = percents[banner.id];
                percent.should.be.below(banner.percent + TRESHOLD);
                percent.should.be.above(banner.percent - TRESHOLD);
            });

            done();
        });
    });

});