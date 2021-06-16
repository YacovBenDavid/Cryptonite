/// <reference path="modules/jquery-3.6.0.js" />
/// <reference path="modules/Display.js" />
/// <reference path="modules/Coin.js" />

//Coins Data:
let coinsListAllByAPI = []; // Coins All By API

// Btn:
let btnHome = $("#btnHome");
let btnAbout = $("#btnAbout");
let btnLiveReport = $("#btnLiveReport");
let btnFilter = $("#filter");
let modalClose = $("#modal-close");

// Section Title & subTitle:
let sectionTitle = $("#titleSection");
let sectionSubTitle = $("#subTitleSection");

//Main
let sectionDynamic = $("#main-dynamic");

//coins - Home
let coinsSectionHome; // = $("#coins__all");

//Startup Load Function:
$(async function () {
  try {
    //Startup load effect Todo!
    Display.Loading();
    //Display.blurLoading();

    //nav Event registration:
    regestryEvents();

    //Get coins Data:
    await getCoinsStartupData();

    //start Display
    setHome();
  } catch (error) {
    //console.log(error);
    alert("Error: Load Startup Data!!");
    console.warn(error);
  }
});

async function getCoinsStartupData() {
  try {
    //OPTIONAL- Get Coins from Local Storge
    //let coinsLS = Utilities.LocalStorage.getCoins()

    //coinsLS.sort(Coin.sortByMarketCapacityHigh);
    //let coinsIDsByMarketCapcityHigh = coinsLS.map(coin => coin.ID);

    //Get All Coins List:
    //let promiseCoinsAll = Utilities.AJAX.pAjaxGetDataByURL(Config.coinsListAPI);
    let promiseCoinsAll = Coin.AJAX.pAjaxGetDataByURL(Config.coinsListAPI);
    coinsListAllByAPI = await promiseCoinsAll; //< 7300

    // Setup Coins Array by Coins List Display
    for (const coinID of Config.coinsListDisplay) {
      let coinMeta = coinsListAllByAPI.find((c) => coinID === c.id);

      // OPTIONAL
      //let coinMarketData = await Coin.AJAX.getCoinMarketDataByID(coinID);

      // Setup Coin Class to coins Array
      let coin = new Coin(coinMeta); //, coinMarketData);

      Coin.Coins.push(coin);
      //coins.push(coin);
      //console.log(coin);
    }

    //OPTIONAL - Update Local Storage
    //Utilities.LocalStorage.updateCoins()

    //console.log(Coin.Coins);
    console.log(Coin.Coins.length);
  } catch (e) {
    alert(
      `getCoinsStartupData: Error in ajax request: ${e.status} - ${e.statusText}\n Failed to get Coins List`
    );
  }
}

function regestryEvents() {
  btnHome.on("click", setHome);
  btnLiveReport.on("click", setLiveReport);
  btnAbout.on("click", setAbout);

  // Filter coin by symbol
  btnFilter.on("input", function () {
    let inputValue = $(this).val();

    if (!filterCoins(inputValue)) {
      removeFilterCoin();
    }
  });

  //Modal:
  modalClose.on("click", function () {
    let modal = $("#modal");
    modal.css("display", "none");

    let coinID = modal.find("#modal-close").val();
    let coin = Coin.Coins.find((c) => coinID === c.ID);

    if (Coin.coinsSelected < 5) {
      coin.isSelected = true;
      Coin.coinsSelected++;
    } else {
      coin.isSelected = false;
    }

    setHome();
  });
}

function removeFilterCoin() {
  let cardsCoins = $(".card__container");
  cardsCoins.each(function () {
    $(this).removeClass("hide");
  });
}

function filterCoins(coinSymbol) {
  let result = false;

  if (coinSymbol.length >= 3) {
    let cardsCoins = $(".card__container"); //115

    cardsCoins.each(function (index, element) {
      let coinID = $(this)[0].id.split("-")[1];
      if (coinSymbol.toUpperCase() == coinID) {
        console.log(coinID);
        $(this).removeClass("hide");
        result = true;
      } else {
        $(this).addClass("hide");
      }
    });
  }

  return result;
}

function setHome() {
  //turn of modal if is open
  let modal = $("#modal");
  modal.css("display", "none");

  //set title:
  sectionTitle.text("Home");
  sectionSubTitle.text("100+ Cryptocurrency Assets");

  sectionDynamic.empty();

  coinsSectionHome = $(`<div id="coins__all" class="coins__flex-grid"></div>`);
  coinsSectionHome.html(
    `
      <input type="text" id="filter" class="btn__search" placeholder="Search" />
      <div id="card-list-container" class="card__list hide">
      `
  );
  let coinsListContainer = coinsSectionHome.find("#card-list-container");

  // add Card of coins to section
  for (let index = 0; index < Coin.Coins.length; index++) {
    const coin = Coin.Coins[index];

    // generate card:
    let coinElement = coin.generateCardElement();

    // Add Coin Card:
    coinsListContainer.append(coinElement);
  }
  let btnFilter = coinsSectionHome.find("#filter");
  btnFilter.on("input", function () {
    let inputValue = $(this).val();

    if (!filterCoins(inputValue)) {
      removeFilterCoin();
    }
  });

  coinsListContainer.removeClass("hide");
  coinsSectionHome.removeClass("hide");
  sectionDynamic.append(coinsSectionHome);
}

function setAbout() {
    //turn of modal if is open
    let modal = $("#modal");
    modal.css("display", "none");

  sectionTitle.text("About");
  sectionSubTitle.text("Create By Yacov Ben David");

  sectionDynamic.empty();
}

function setLiveReport() {
  //turn of modal if is open
  let modal = $("#modal");
  modal.css("display", "none");

  //set title & subtitle
  sectionTitle.text("Live Report");
  sectionSubTitle.text("Real-time change analysis");

  sectionDynamic.empty();
  let liveReportSection = $(
    `<div id="liveReportSection" class="liveReport"> </div>`
  );

  for (const coin of Coin.Coins) {
    if (coin.isSelected) {
      liveReportSection.append(coin.generateModalItem());
    }
  }
  sectionDynamic.append(liveReportSection);
}
