$(function(){
	function initialize(position) {

		// if(position != null){

		// 	var mapLat = Number(position.coords.latitude).toFixed(5);
		// 	var mapLon = Number(position.coords.longitude).toFixed(5);



		//     var mapOptions = {
		//         center: new google.maps.LatLng(position.coords.latitude, position.coords.longitude),
		//         zoom: 15,
		//         panControl: false,
		//         zoomControl: false
		//     };

		//     var map = new google.maps.Map(document.getElementById("googleMap"),
		//     mapOptions);

		//     getCoords(mapLat, mapLon);

		// }


		//Stänger resultatet
		$("#result").click(function() {
	        $('#result').stop(true).animate({
				'margin-bottom': -1000,
				'opacity': '0' },
				{ queue: false,
				  duration: 300 });
		});


	/* ----------------------- GlOBAL VARIABLES ----------------------- */
		var latitude = 0;
		var longitude = 0;
		var markers = [];

	/* ----------------------- SMHI API ----------------------- */
		function mapClick(){

			latitude = Number(latitude).toFixed(5);
			longitude = Number(longitude).toFixed(5);

			getWeather(latitude, longitude);
			drawMarkers(map, latitude, longitude);
			getAddress(latitude, longitude);

			if(markers.length > 1) {
				for(var i = 0; i < markers.length - 1; i++){
					markers[i].setVisible(false);
				}
			}
		}

		function getWeather (lat, lng) {
			//Koordinater
			latitude = Number(latitude).toFixed(5);
			longitude = Number(longitude).toFixed(5);

			var url = "http://opendata-download-metfcst.smhi.se/api/category/pmp1.5g/version/1/geopoint/lat/" + latitude + "/lon/" + longitude + "/data.json";
			var textResult = "";
			//Vindriktning
			var wd;

			//Konverterar date till JSON (1 timme bakåt)
			var dateJSON = new Date().toJSON();

			$.getJSON(url, function (result){


				//Loopar genom resultatet och skriver ut det
				for(var i = 0; i < result.timeseries.length - 1; i++){

					if(dateJSON < result.timeseries[i+1].validTime && dateJSON > result.timeseries[i].validTime){

						textResult = textResult + "Temperatur: " + result.timeseries[i].t + "&degC<br>" +
												  "Vindriktning: <img class=\"wind_arrow\" src=\"img/ArrowUp_Green.png\"/><br>" +
												  "Vindhastighet: " + result.timeseries[i].ws + " m/s<br>" + 
												  "Byvind: " + result.timeseries[i].gust + " m/s<br>";

								  // För att visa koordinater:
								  //"Latitude: " + result.lat + "<br>" +
								  //"Longitude: " + result.lon + "<br>" + 

								  //Celsius på kartan
								  $("#celsiusNow").html(result.timeseries[i].t + "&degC");
								  wd = result.timeseries[i].wd;

								  displayWeatherIcons(result.timeseries[i].pcat, result.timeseries[i].lcc, result.timeseries[i].mcc, result.timeseries[i].hcc, result.timeseries[i].tstm, result.timeseries[i].validTime);
						
					}

				}

				//Skriver ut resultatet
				$("#resultText").html("");
				$("#resultText").append(textResult);
			  	//Vindriktning (gröna pilen)
				$(".wind_arrow").css("transform", "rotate("+wd+"deg)").css("height", "20px");

			})
			.error(function(error){
				$("#resultText").html("Vädret kunde inte visas för denna plats.");
				$("#weatherNow").html("");
			});

			//Slide up från botten
	        $('#result').stop(true).animate({
				'margin-bottom': 0,
				'opacity': '1' },
				{ queue: false,
				  duration: 300 });
		}

		function displayWeatherIcons(weather, lcc, mcc, hcc, tstm, jDate) {

			var clouds = lcc + mcc + hcc;
			var getDate = new Date(jDate);
			getDate.setMinutes(getDate.getMinutes() - 60);
			getH = getDate.getHours();

			if(weather == 0 && clouds < 1 ){
				$("#weatherNow").html("Vädret nu: <img class='weather-icon' src='img/weather-icons/clear_sun.png'>");
			}
			else if(weather == 0 && clouds < 6){
				$("#weatherNow").html("Vädret nu: <img class='weather-icon' src='img/weather-icons/sun_light-cloud.png'>");
			}
			else if(weather == 0 && clouds <12){
				$("#weatherNow").html("Vädret nu: <img class='weather-icon' src='img/weather-icons/sun_cloud.png'>");
			}
			else if(weather == 0 && clouds >=12){
				$("#weatherNow").html("Vädret nu: <img class='weather-icon' src='img/weather-icons/cloud.png'>");
			}
			else if(weather == 1){
				$("#weatherNow").html("Vädret nu: <img class='weather-icon' src='img/weather-icons/cloud_snow.png'>");
			}
			else if(weather == 2){
				$("#weatherNow").html("Vädret nu: <img class='weather-icon' src='img/weather-icons/cloud_rain-snow.png'>");
			}
			else if(weather == 3 || weather == 4){
				$("#weatherNow").html("Vädret nu: <img class='weather-icon' src='img/weather-icons/cloud_light-rain.png'>");
			}
			else if(weather == 5 || weather == 6){
				$("#weatherNow").html("Vädret nu: <img class='weather-icon' src='img/weather-icons/cloud_rain.png'>");
			}
			if(tstm>50){
				$("#weatherNow").html("Vädret nu: <img class='weather-icon' src='img/weather-icons/thunder_rain.png'>");
			}
			if(getH>=0 && getH<7 && weather == 0 && clouds <1){
				$("#weatherNow").html("Vädret nu: <img class='weather-icon' src='img/weather-icons/clear_moon.png'>");
			}
			else if(getH>=0 && getH<7 && weather == 0 && clouds>0 && clouds <12){
				$("#weatherNow").html("Vädret nu: <img class='weather-icon' src='img/weather-icons/moon_cloud.png'>");
			}
			else if(getH>=0 && getH<7 && weather == 0 && clouds >=12){
				$("#weatherNow").html("Vädret nu: <img class='weather-icon' src='img/weather-icons/cloud.png'>");
			}

			console.log(getH);

		}
		


	/* ----------------------- GOOGLE GEOCODING API ----------------------- */
	//Google JSON hämtar address
	//http://maps.google.com/maps/api/geocode/json?address=

		//Funktion som endast hämtar värden för sökfältet
		function getCoords (){

			var searchText = $("#searchText").val();
			searchText = searchText.replace(/\s/g, "+");
			searchText = searchText.replace(/,/g, "");
			searchText = searchText.replace(/ö/gi, "o");
			searchText = searchText.replace(/[åä]/gi, "a");

			var url = "http://maps.google.com/maps/api/geocode/json?address=" + searchText;

			$.getJSON(url, function (result) {

				latitude = Number(result.results[0].geometry.location.lat).toFixed(5);
				longitude = Number(result.results[0].geometry.location.lng).toFixed(5);

				console.log(result);

				console.log(latitude + "\n" + longitude);
				
				getWeather(latitude, longitude);
				getAddress(latitude, longitude);


			});

		}

		//Funktion som hämtar adressen med angivna koordinater och skriver ut den på #address
		function getAddress(lat, lng) {

			var address;
			var url = "https://maps.googleapis.com/maps/api/geocode/json?latlng="+lat+","+lng;

			$.getJSON(url, function (result){

				// console.log(result.results[0].formatted_address);
				address = result.results[0].formatted_address;
				$("#address").html("Nära: " + address);

			});
		}




	/* ----------------------- GOOGLE MAPS API ----------------------- */
		
		
		var mapProp = {
			center: new google.maps.LatLng(62.774837, 17.424316),
			// center: currentCoords,
			zoom: 5,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			streetViewControl: false
		};

		var map = new google.maps.Map(document.getElementById("googleMap"), mapProp);

		// function initialize() {
			//Hämtar kordinater på map-click
			google.maps.event.addListener(map, 'click', function (e) {
				latitude = e.latLng.lat();
				longitude = e.latLng.lng();
				infowindow.close();
				mapClick();
			});

			var celsius = document.getElementById("celsiusNow");
			map.controls[google.maps.ControlPosition.TOP_LEFT].push(celsius);

			var input = document.getElementById("searchText");

			// map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

			var autocomplete = new google.maps.places.Autocomplete(input);
	 		autocomplete.bindTo('bounds', map);

	 		var infowindow = new google.maps.InfoWindow();

			var marker = new google.maps.Marker({
				map: map,
	    		anchorPoint: new google.maps.Point(0, -29),
	    		animation:google.maps.Animation.BOUNCE
	 		});

	 		markers.push(marker);

	 		 
			//Skapa funktion för att ändra text i sökfältet
	 		google.maps.event.addListener(autocomplete, 'place_changed', function () {

	    		infowindow.close();
	    		marker.setVisible(false);
	    		var place = autocomplete.getPlace();

	    		if (!place.geometry) {
	      			return;
	    		}

			    // If the place has a geometry, then present it on a map.
			    if (place.geometry.viewport) {
			     	map.fitBounds(place.geometry.viewport);
			    }
			    else {
					map.setCenter(place.geometry.location);
			    	map.setZoom(17);
			    }

			    marker.setPosition(place.geometry.location);
			    marker.setVisible(true);

	    		//Hämtar coords och skriver ut i console
	    		getCoords();

	  		});

		// } slutet på gamla initialize

		//Funktion att rita ut markers
		function drawMarkers(map, lat, lng) {
			var centerMarker = new google.maps.Marker({
				position: new google.maps.LatLng(lat, lng),
				map: map,
				animation:google.maps.Animation.BOUNCE
			});

			markers.push(centerMarker);
		}


	}
	//Visa hela kartan
	google.maps.event.addDomListener(window, 'load', initialize);

	// checka om användaren kan använda geolocation
	// if (navigator.geolocation) {
	// 	navigator.geolocation.getCurrentPosition(initialize);
	// } 
	// else {
	// 	alert('Your browser or device does not support geolocation.');
	// }

});

