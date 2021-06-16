/// <reference path="jquery-3.6.0.js" />

class CoinMarketData {
  /**
   *
   * @param {number} usd
   * @param {number} eur
   * @param {number} ils
   * @param {number} marketCapacity
   */
  constructor(usd = -1, eur = -1, ils = -1, marketCapacity = -1) {
    this.CurrentPrice = { USD: usd, EUR: eur, ILS: ils };
    this.MarketCap = marketCapacity;
    this.isUpdate = usd > 0 || eur > 0 || ils > 0;
  }
  static displayNumber(num) {
    let rNumber = CoinMarketData.roundNumber(num);
    return rNumber.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  static roundNumber(num) {
    return Math.round((parseFloat(num) + Number.EPSILON) * 100) / 100;
  }
}

/**Base Class of Coin */
class Coin {
  static coinsSelected = 0;
  static Coins = []; //Main Array of Coin class

  /**
   * @param {string} id
   * @param {string} symbol
   * @param {string} name
   * @param {CoinMarketData} coinMarketData
   */
  constructor(coinMeta, coinMarketData = new CoinMarketData()) {
    this.ID = coinMeta.id;
    this.Symbol = coinMeta.symbol.toUpperCase();
    this.Name = coinMeta.name.toUpperCase();
    this.MarketData = coinMarketData;
    this.isSelected = false;
    this.isHide = false;
  }

  static popupModal(coinID) {
    let modal = $("#modal");
    let modalCoinItems = $("#modal-coin-items");
    modalCoinItems.empty();

    for (const coin of Coin.Coins) {
      if (coin.isSelected) {
        modalCoinItems.append(coin.generateModalItem());
      }      
    }
    
    modal.find("#modal-close").attr("value", coinID);
    //modal.css("display", "flex");
    modal.show();
    

  }

  generateModalItem() {
    this.ModalItemElement = $(`<div class="modal__coin-item"></div>`);
    this.ModalItemElement.html(
      `
      <h2>${this.Symbol}</h2>
      <img src="https://www.exodus.com/img/logos/${this.Symbol}.svg" alt="">
      <div class="btn__moadal-toggle">
        <label class="btn__toggle-lable">
          <div class="btn__toggle">
            <input class="btn__toggle-state" type="checkbox" name="check" value="check" checked>
            <div class="btn__toggle-indicator"></div>
          </div>
        </label>
      </div>`
    );

    //add btn toggle:
    let btnToggle = this.ModalItemElement.find(".btn__toggle-state");
    btnToggle.on("change", () => {
      this.toggleModalItem();
    });

    return this.ModalItemElement;
  }


  generateCardElement(sectionCoins) {
    //card coin element
    this.CardElement = $(
      `<div id="cardID-${this.Symbol}" class="card__container"></div>`
    );

    let checked = "";
    if (this.isSelected) {checked = "checked";}
    this.CardElement.html(`
        <div class="card__flip">

        <!-- Front Side -->
        <div class="card__front">

          <img class="card__logo" src="https://www.exodus.com/img/logos/${this.Symbol}.svg" alt="coin-logo" >
          <h3 class="card__text-name">${this.Name}</h3>
          <h4 class="card__text-symbol">${this.Symbol}</h4>
          <div class="btn__card-select"></div>

          <div class="btn__card-toggle">
            <label class="btn__toggle-lable">
              <div class="btn__toggle">
                <input class="btn__toggle-state" type="checkbox" name="check" value="${this.ID}" ${checked}>
                <div class="btn__toggle-indicator"></div>
              </div>
            </label>
          </div>

          <div class="btn__card-info">
            <i class="fas fa-info-circle"></i>
          </div>

        </div>

        <!-- Back Side -->
        <div class="card__back">
          <div class="card__progress-bar"></div>
          
          <!-- btn flip -->
          <div class="btn__card-flip">
            <i class="fas fa-undo"></i>
          </div>
          <!-- Shekel -->
          <div class="card__counter-container">
            <i class="card__counter-symbol fas fa-shekel-sign fa-2x"></i>
            <div class="card__counter-value counter-shekel" data-target="7500">${this.MarketData.CurrentPrice.ILS}</div>
          </div>

          <!-- Dollar -->
          <div class="card__counter-container">
            <i class="card__counter-symbol fas fa-dollar-sign fa-2x"></i>
            <div class="card__counter-value counter-dollar" data-target="7500">${this.MarketData.CurrentPrice.USD}</div>
          </div>

          <!-- Euro -->
          <div class="card__counter-container">
            <i class="card__counter-symbol fas fa-euro-sign fa-2x"></i>
            <div class="card__counter-value counter-euro" data-target="7500">${this.MarketData.CurrentPrice.EUR}</div>
          </div>

          
        </div></div>`);
    //console.log(t);

    //add btn info event to get more details
    let btnInfo = this.CardElement.find(".btn__card-info");
    btnInfo.on("click", () => {
      this.getCoinMarketData();
    });

    // add btn flip
    let btnFlip = this.CardElement.find(".btn__card-flip");
    btnFlip.on("click", () => {
      this.CardElement.find(".card__flip").removeClass("card__fliped");
    });

    //add btn toggle:
    let btnToggle = this.CardElement.find(".btn__toggle-state");
    btnToggle.on("change", () => {
      this.toggleSelected();
    });

    // Return:
    return this.CardElement;
  }

  async getCoinMarketData() {
    try {
      this.CardElement.find(".card__flip").addClass("card__fliped");
      if (!this.MarketData.isUpdate) {
        //hide before:
        this.CardElement.find(".card__counter-container").addClass("hide");
        //Update market data:
        this.MarketData = await Coin.AJAX.getCoinMarketDataByID(this.ID);
        console.log(this.MarketData);

        // update data attr on card:
        let shekel = this.CardElement.find(".counter-shekel");
        shekel.attr("data-target", this.MarketData.CurrentPrice.ILS);

        let dollar = this.CardElement.find(".counter-dollar");
        dollar.attr("data-target", this.MarketData.CurrentPrice.USD);

        let euro = this.CardElement.find(".counter-euro");
        euro.attr("data-target", this.MarketData.CurrentPrice.EUR);

        //updtae counter display:
        let counters = this.CardElement.find(".card__counter-value");

        //Start Show:
        this.CardElement.find(".card__counter-container").removeClass("hide");

        counters.each(function () {
          let cardElement = $(this);
          cardElement.html("0");

          const updateCounter = () => {
            const target = CoinMarketData.roundNumber(
              cardElement.attr("data-target")
            );
            const c = +cardElement.html();
            const increment = target / 100;
            if (c < target) {
              cardElement.html(`${Math.ceil(c + increment)}`);
              setTimeout(updateCounter, 20);
            } else {
              cardElement.html(CoinMarketData.displayNumber(target));
            }
          };
          updateCounter();
        });

        // assert reUpdate after 2 Minutes;
        let timeoutMinutes = 2;
        setTimeout(() => {
          this.MarketData.isUpdate = false;
        }, timeoutMinutes * 1000 * 60);
      }
    } catch (error) {
      alert(error);
      console.warn(error);
    }
  }

  toggleModalItem() {
    let btnToggle = this.ModalItemElement.find(".btn__toggle-state");

    if (!btnToggle.is(":checked")) {
      this.isSelected = false;
      Coin.coinsSelected--;      
    
    }else{
      this.isSelected = true;
      Coin.coinsSelected++;
    }
  }


  toggleSelected() {
    let btnToggle = this.CardElement.find(".btn__toggle-state");

    if (btnToggle.is(":checked")) {
      if (Coin.coinsSelected < 5) {
        this.isSelected = true;
        Coin.coinsSelected++;
      } else {
        //alert("Can't Selected more that 5 Coins");
        btnToggle.prop("checked", false);
        Coin.popupModal(this.ID);
      }
    } else {
      this.isSelected = false;
      Coin.coinsSelected--;
    }

    console.log(Coin.coinsSelected);
    {
      // it is checked
    }
  }

  //#region Sort - Static Functions

  /**Sort Coins by Price High to Low
   * @param {Coin} coinA
   * @param {Coin} coinB
   */
  static sortByPriceHigh(coinA, coinB) {
    return coinA.MarketData.CurrentPrice.USD < coinB.MarketData.CurrentPrice.USD
      ? 1
      : -1;
  }

  /** Sort Coins by Price Low to High
   * @param {Coin} coinA
   * @param {Coin} coinB
   */
  static sortByPriceLow(coinA, coinB) {
    return coinA.MarketData.CurrentPrice.USD > coinB.MarketData.CurrentPrice.USD
      ? 1
      : -1;
  }

  /** Sort Coins by {MarketCapacity} High to Low
   * @param {Coin} coinA
   * @param {Coin} coinB
   */
  static sortByMarketCapacityHigh(coinA, coinB) {
    return coinA.MarketData.MarketCap < coinB.MarketData.MarketCap ? 1 : -1;
  }

  /** Sort Coins by {MarketCapacity} low to high
   * @param {Coin} coinA
   * @param {Coin} coinB
   */
  static sortByMarketCapacityLow(coinA, coinB) {
    return coinA.MarketData.MarketCap > coinB.MarketData.MarketCap ? 1 : -1;
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
          success: (data) => resolve(data),
          error: (e) => reject(e),
          dataType: "json",
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
        let promiseCoinDetails = Coin.AJAX.pAjaxGetDataByURL(
          `https://api.coingecko.com/api/v3/coins/${coinID}`
        );
        let coinDetails = await promiseCoinDetails;

        // Get coin Price & Market Capacity
        let cPrice = coinDetails.market_data.current_price;
        let cMarketCap = coinDetails.market_data.market_cap.usd;
        let cMarketData = new CoinMarketData(
          cPrice.usd,
          cPrice.eur,
          cPrice.ils,
          cMarketCap
        );

        return cMarketData;
      } catch (e) {
        alert(e);
        console.warn(e);
      }
    }
  };

  //#endregion
}
