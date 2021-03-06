'use strict';

angular.module('currencyFormat', ['currencyFormat.iso'])
    .filter('currencyFormat', ['$rootScope', '$filter', '$sce', 'currencyFormatService', function ($rootScope, $filter, $sce, currencyFormatService) {

        /**
         * Transforms an amount into the right format and currency according to a passed currency code (3 chars).
         *
         * @param float amount
         * @param string currencyCode e.g. EUR, USD
         * @param number fractionSize User specified fraction size that overwrites default value
         * @param boolean useUniqSymbol use unique currency symbol
         * @return string
         */
        return function (amount, currencyCode, fractionSize = null, useUniqSymbol = true) {
            if (!currencyCode || Number(amount) != amount) {
                return;
            }

            var formattedCurrency,
                currency = currencyFormatService.getByCode(currencyCode),
                formatedAmount = Math.abs(amount),
                signAmount = amount < 0 ? '-' : '',
                rtl = false;

            // Fraction size

            var currentFractionSize = currency.fractionSize;
            if (fractionSize !== null) {
                currentFractionSize = fractionSize;
            }

            formatedAmount = formatedAmount.toFixed(currentFractionSize);

            // Format numeral by language

            var languageCode = $rootScope.currencyLanguage || 'en_US',
                language = currencyFormatService.getLanguageByCode(languageCode);

            formatedAmount = formatedAmount.split('.').join(language.decimal);
            formatedAmount = formatedAmount.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1' + language.thousands);

            // Format currency

            if (!!currency && !useUniqSymbol && !!currency.symbol && !!currency.symbol.template) {
                formattedCurrency = currency.symbol.template.replace('1', formatedAmount);
                formattedCurrency = formattedCurrency.replace('$', currency.symbol.grapheme);
                formattedCurrency = signAmount + formattedCurrency;
                rtl = !!currency.symbol.rtl;
            }
            else if (!!currency && !!useUniqSymbol && !!currency.uniqSymbol && !!currency.uniqSymbol.template) {
                formattedCurrency = currency.uniqSymbol.template.replace('1', formatedAmount);
                formattedCurrency = formattedCurrency.replace('$', currency.uniqSymbol.grapheme);
                formattedCurrency = signAmount + formattedCurrency;
                rtl = !!currency.uniqSymbol.rtl;
            }
            else {
                formattedCurrency = signAmount + formatedAmount + ' ' + currencyCode;
            }

            return $sce.trustAsHtml('<span class="currency ' + currencyCode.toLowerCase() + '" dir="' + (rtl ? ' rtl' : ' ltr') + '">' + formattedCurrency + '</span>');
        };
    }]);
