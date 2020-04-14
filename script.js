var searchHistory = [];

function grabDate(response, index) {
    var milliseconds = response.list[index].dt * 1000;
    var dateObj = new Date(milliseconds);
     return dateObj.toLocaleDateString();
}

function renderPage() {
    $(".card-body").empty();
    for(var i = 0; i < 5; i++) {
        $(".card-body" + i).empty();
    }
    $(".btn-group-vertical").empty();
    searchHistory = JSON.parse(localStorage.getItem("searchHistory"));
    console.log(searchHistory);
    if(searchHistory != null) {
        for(var i = 0; i < searchHistory.length; i++) {
            var cityButton = $("<button>").attr({
                type: "button", 
                class: "btn btn-light btn-lg btn-block",
                id: "cityBtn",
                city: searchHistory[i]});
            cityButton.text(searchHistory[i]);
            $(".btn-group-vertical").prepend(cityButton);
        }
    } else {
        searchHistory = [];
    }
}

function grabUVData(APIKey, lat, lon) {
    var queryURL = "http://api.openweathermap.org/data/2.5/uvi/forecast?lat=" + lat + "&lon=" + lon + "&appid=" + APIKey;
    var UVSet = $("<p>");
    var UVSpan = $("<span>");
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function(response) {
        var UVNum = response[0].value;
        UVSpan.text(UVNum);
        if(UVNum >=0 && UVNum <= 2.9) {
          UVSpan.attr("style", "background-color: green;");
        } else if(UVNum >= 3 && UVNum <= 5.9) {
          UVSpan.attr("style", "background-color: yellow;");
        } else if(UVNum >= 6 && UVNum <= 7.9) {
          UVSpan.attr("style", "background-color: orange;");
        } else if(UVNum >= 8 && UVNum <= 10.9) {
          UVSpan.attr("style", "background-color: red; color: white;");
        } else if(UVNum >= 11) {
          UVSpan.attr("style", "background-color: purple; color: white");
        } 
        UVSet.text("UV Index: ");
        UVSet.append(UVSpan);
    });
    return UVSet;
}

function getInfo(citySearchTerm) {
    var APIKey = "ced2cf879bb0aad6596f2794924c76f0";
    var queryURL = "http://api.openweathermap.org/data/2.5/forecast?q=" + citySearchTerm + "&APPID=" + APIKey;

    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function(response) {
        if(response.cod == "200") {
            if((searchHistory == null) || !(searchHistory.includes(citySearchTerm))) {
                searchHistory.push(citySearchTerm);
            }
            localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
            renderPage();
            var weatherSet = response.list[0];
            var cityText = response.city.name;
            var header = $("<h1>").text(cityText + " (" + grabDate(response, 0) + ")");
            var imageSet = $("<img>").attr("src", "http://openweathermap.org/img/wn/" + weatherSet.weather[0].icon + ".png");
            var temper = weatherSet.main.temp;
            var tempSet = $("<p>").text("Temperature: " + Math.floor((temper - 273.15) * 1.8 + 32) + "\xB0F");
            var humiditySet = $("<p>").text("Humidity: " + weatherSet.main.humidity + "%");
            var windSpeedSet = $("<p>").text("Wind Speed: " + weatherSet.wind.speed + " MPH");
            var latitude = response.city.coord.lat;
            var longitude = response.city.coord.lon;
            var UVSet = grabUVData(APIKey, latitude, longitude);
            header.append(imageSet);
            $(".card-body").append(header, tempSet, humiditySet, windSpeedSet, UVSet);

            for(var i = 0; i < 5; i++) {
                var index = 7 + (i * 8);
                var weatherSet2 = response.list[index];
                var header = $("<h5>").addClass("card-title");
                header.text(grabDate(response, index));
                var imageSet = $("<img>").attr("src", "http://openweathermap.org/img/wn/" + weatherSet2.weather[0].icon + ".png");
                var temper = weatherSet2.main.temp;
                var tempSet = $("<p>").text("Temperature: " + Math.floor((temper - 273.15) * 1.8 + 32) + "\xB0F");
                var humiditySet = $("<p>").text("Humidity: " + weatherSet2.main.humidity + "%");
                $(".card-body" + i).append(header, imageSet, tempSet, humiditySet);
            }
            $(".forecastTitle").text("5-Day Forecast:");
            $(".col-lg-8").attr("style", "display: block");

        }
    });
}

$(".btn-primary").on("click", function() {
    var cityNamer = $("#searchTerm").val();
    getInfo(cityNamer);
});

$(document).on("click", "#cityBtn", function() {
    var cityName = $(this).attr("city");
    getInfo(cityName);
});

renderPage();
if(searchHistory != null) {
    getInfo(searchHistory[searchHistory.length - 1]);
}