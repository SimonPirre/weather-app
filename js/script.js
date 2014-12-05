$(function(){


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
		//Visar resultatet
        $('#result').stop(true).animate({
			'margin-bottom': 0,
			'opacity': '1' },
			{ queue: false,
			  duration: 300 });

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
		var coordinates = [];
		var timeSpans = [];
		var textResult = "";

		$.getJSON(url, function (result){

			//Pushar inte koordinater och resultat
			$.each(result, function (key, value){
				coordinates.push(value);
			});

			//Pushar in olika tider med väderdata
			$.each(coordinates[3], function (key, value){
				timeSpans.push(value);
			});

			//Enkelt resultat för temperaturen just nu
			textResult = textResult + "Latitude: " + coordinates[0] + "<br>" +
									  "Longitude: " + coordinates[1] + "<br>" + 
									  "Celsius: " + timeSpans[0].t + "<br>" +
									  "Vindriktning: <img class=\"wind_arrow\" src=\"img/ArrowUp_Green.png\"/><br>" +
									  "Vindhastighet: " + timeSpans[0].ws + " m/s<br>" + 
									  "Byvind: " + timeSpans[0].gust + " m/s<br>";


			//Skriver ut resultatet
			$("p").html("");
			$("p").append(textResult);
			//Celsius på kartan
		  	$("#celsiusNow").html(timeSpans[0].t + "&degC");
		  	//Vindriktning (gröna pilen)
			$(".wind_arrow").css("transform", "rotate("+timeSpans[0].wd+"deg)").css("height", "20px");
		});
	}
	


/* ----------------------- GOOGLE GEOCODING API ----------------------- */
//Google JSON hämtar address
//http://maps.google.com/maps/api/geocode/json?address=
	function getCoords (){

		var searchText = $("#searchText").val();
		searchText = searchText.replace(/\ /g, '+');
		searchText = searchText.replace(/\,/g, '');
		searchText = searchText.replace(/\ö/gi, "o");
		searchText = searchText.replace(/[åä]/gi, "a");

		var url = "http://maps.google.com/maps/api/geocode/json?address=" + searchText;
		var allAddresses = [];

		$.getJSON(url, function (result) {

			$.each(result, function (key, value){
				allAddresses.push(value);
			});


			latitude = Number(result.results[0].geometry.location.lat).toFixed(5);
			longitude = Number(result.results[0].geometry.location.lng).toFixed(5);

			console.log(latitude + "\n" + longitude);
			
			getWeather(latitude, longitude);
			getAddress(latitude, longitude);
		});

	}
	function getAddress(lat, lng) {

		var address;
		var url = "https://maps.googleapis.com/maps/api/geocode/json?latlng="+lat+","+lng;

		$.getJSON(url, function (result){

			// console.log(result.results[0].formatted_address);
			address = result.results[0].formatted_address;
			$("#address").html("Near " + address);

		});
	}




/* ----------------------- GOOGLE MAPS API ----------------------- */
	
	if (navigator.geolocation) {
  		navigator.geolocation.getCurrentPosition(getCurrentCoords);
	}
	else {
  		alert('Geo Location is not supported');
	}
	
	function getCurrentCoords(position){

		var currentCoords = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

		console.log(currentCoords);

		var marker = new google.maps.Marker({
      		position: coords,
      		map: map,
      		title:"You are here!"
 		});

	var mapProp = {
		// center: new google.maps.LatLng(62.774837, 17.424316),
		center: currentCoords,
		zoom: 5,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};

	var map = new google.maps.Map(document.getElementById("googleMap"), mapProp);

	}






	function initialize() {
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


		    		//Visar resultatet
        $('#result').stop(true).animate({
			'margin-bottom': 0,
			'opacity': '1' },
			{ queue: false,
			  duration: 300 });

    		//Hämtar coords och skriver ut i console
    		getCoords();

  		});

	}

	//Funktion att rita ut markers
	function drawMarkers(map, lat, lng) {
		var centerMarker = new google.maps.Marker({
			position: new google.maps.LatLng(lat, lng),
			map: map,
			animation:google.maps.Animation.BOUNCE
		});

		markers.push(centerMarker);
	}

	//Visa hela kartan
	google.maps.event.addDomListener(window, 'load', initialize);
});

