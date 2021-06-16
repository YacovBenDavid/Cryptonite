/// <reference path="jquery-3.6.0.js" />
/// <reference path="Coin.js" />

var Display = (function () {
  return class Display {

    static loadingTime = 5;
    static imagesNumber = 6; //max 10

    static Loading() {
      let loadingText = $("#loading-text");
      let loadingImage = $("#loading-img");
      let body = $("body");
      
      let imageIndex = 0;
      let pageLoadPercentage = 0;
      let symbols = ["ETH", "BTC","UNI", "1INCH", "SRM", "ANT", "POLY", "REP", "CND", "ATOM"];

      //Loading Text:
      let setLoadingText = setInterval(function () {
        pageLoadPercentage+=2;
        
        if (!body.hasClass("stop-scrolling")) {
          body.addClass("stop-scrolling");
        }
        if (pageLoadPercentage > 99) {
          body.removeClass("stop-scrolling");
          clearInterval(setLoadingText);
        }
        loadingText.text(`${pageLoadPercentage}%`);
      }, (Display.loadingTime * 1000) / 100);


      //Loading Images:
      let setLoadingImage = setInterval(() => {
        imageIndex++;
        if (pageLoadPercentage > 99) {
          clearInterval(setLoadingImage);
        }
        let imageSRC = `https://www.exodus.com/img/logos/${symbols[imageIndex]}.svg`
        if (symbols[imageIndex] !== undefined) {
            loadingImage.attr("src", imageSRC);
        }
        
        
      }, (Display.loadingTime * 1000) / (Display.imagesNumber-1));

      let setRemoveLoading = setTimeout(() => {
        let loadingSection = $("#loading").remove();          
      }, Display.loadingTime * 1000);

      
    }
  };
})();
