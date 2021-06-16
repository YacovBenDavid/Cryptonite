
var Utilities = (function () {

    return class Utilities{


        /**Map a range of numbers to another range of numbers
         * 
         * @param {number} num
         * @param {number} in_min
         * @param {number} in_max
         * @param {number} out_min
         * @param {number} out_max
         * @returns{number}
         */
        static scaleRangeNumbers(num, in_min, in_max, out_min, out_max) {
            return ((num - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
        }


        // Local Storage
        static LocalStorage = class LocalStorage {

            /**Update Local Storage {Coins} */
            static updateCoins() {
                localStorage.setItem('Coins', JSON.stringify(coins));
                return this.getCoins();
                
            }


            /**Get Coins From Local Storage
             * @returns{object}*/
            static getCoins() {
                let coinsLS = JSON.parse(localStorage.getItem("Coins"));
                return coinsLS;
            }
        }



        static AJAX = class Ajax {

            /**AJAX - Get Data by URL (Promise)
             * @param {string} urlPath
             */
            static pAjaxGetDataByURL(urlPath) {
                return new Promise((resolve, reject) => {
                    $.ajax({
                        method: "GET",
                        url: urlPath,
                        success: data => resolve(data),
                        error: e => reject(e),
                        dataType: "json"
                    });
                });
            }


            /**Get Coin Market Data By ID
            * @param {string} coinID 
            * @returns{CoinMarketData}
            */
            static async getCoinMarketDataByID(coinID) {
                try {
                    // Get Coins Details:
                    let promiseCoinDetails = pAjaxGetDataByURL(`https://api.coingecko.com/api/v3/coins/${coinID}`);
                    let coinDetails = await promiseCoinDetails;

                    // Get coin Price & Market Capacity
                    let cPrice = coinDetails.market_data.current_price;
                    let cMarketCap = coinDetails.market_data.market_cap.usd;
                    let cMarketData = new CoinMarketData(cPrice.usd, cPrice.eur, cPrice.ils, cMarketCap)

                    return cMarketData;

                } catch (e) {
                    alert(e, message);

                }

            }

        }
    }

})();