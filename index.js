// global variable
var map;

var totalTime;
var beginTime = "11:00";

// Press enter key to initMap
document.onkeypress = (e) => {
	var key = e.keyCode;

	if (key == 13) {
		initMap();
	};
};

// Main function
function initMap() {
	getArrivalTime ("11:00", 10);
	// Instance google map object
	map = new google.maps.Map(document.getElementById('map'), {
		center: new google.maps.LatLng(34.98584790244196, 135.75876588937692),
		zoom: 13
	});
	
	totalTime = 0;
	alert (document.getElementById('departure-time0').value)

	// Variable that displays a marker on the map
	var marker = function(position, content, opacity) {
		var mark = new google.maps.Marker({
			map: map,
			position: position,
			opacity: opacity
		});

		mark.addListener("click", () => {
			infoWindow.setContent(content);
			infoWindow.open(map, mark);
		});
	};

	// function that displays polyline
	function setPolyLine(path) {
		var polyline = new google.maps.Polyline({
			map: map,
			strokeColor: "#2196f3",
			strokeOpacity: 0.8,
			strokerWeight: 10,
			path: path
		});
	};
	setMarker();

	// Display markers on the map
	function setMarker() {
		var geocoder = new google.maps.Geocoder();
		var infoWindow = new google.maps.InfoWindow();

		for (var i = 0; i < 4; i++) {
			var placeValue = document.getElementById('placename' + i).value;
			var placePosition;

			if (placeValue != "") {
				var currentPlaceValue = placeValue;
				geocoder.geocode({
					address: placeValue
				}, (result, status) => {
					if (status == "OK") {
						placePosition = result[0].geometry.location;

						marker(placePosition, currentPlaceValue, 1.0);
					};
				});
			};
		};
	};

	for (var i = 0; i < 3; i++) {
		startPlace = document.getElementById('placename' + i).value;
		endPlace = document.getElementById('placename' + (i + 1)).value;

		if (document.getElementById('travelmode' + i).value == "walk") {
			searchDirections(startPlace, endPlace, 'walk', i);
		} else if (document.getElementById('travelmode' + i).value == "train") {
			searchDirections(startPlace, endPlace, 'train_station', i);
		} else if (document.getElementById('travelmode' + i).value == "bus") {
			searchDirections(startPlace, endPlace, 'bus_station', i);
		} else if (document.getElementById('travelmode' + i).value == "subway") {
			searchDirections(startPlace, endPlace, 'subway_station', i);
		};
	};

	function searchDirections(startPlace, endPlace, mode, index) {
		var directionsService = new google.maps.DirectionsService();
		var placesService = new google.maps.places.PlacesService(map);
		var geocoder = new google.maps.Geocoder();
		var startPosition;
		var endPosition;

		if (mode == 'walk') {
			var request = {
				origin: startPlace,
				destination: endPlace,
				travelMode: google.maps.DirectionsTravelMode.WALKING
			};

			directionsService.route(request, (result, status) => {
				if (status == "OK") {
					setPolyLine(result.routes[0].overview_path);
					setTimeText(result.routes[0].legs[0].duration.text, index);
				};
			});
		} else {
			geocoder.geocode({
				address: startPlace
			}, (result, status) => {
				if (status == "OK") {
					startPosition = result[0].geometry.location;

					var startRequest = {
						location: startPosition,
						radius: 500,
						type: [mode]
					};

					placesService.nearbySearch(startRequest, (result, status) => {
						if (status == "OK") {
							marker(result[0].geometry.location, "aa", 0.7);

							var request = {
								origin: startPosition,
								destination: result[0].geometry.location,
								travelMode: google.maps.DirectionsTravelMode.WALKING
							};

							directionsService.route(request, (result, status) => {
								if (status == "OK") {
									setPolyLine(result.routes[0].overview_path);
									totalTime += result.routes[0].legs[0].duration.value;
									getArrivalTime(beginTime, result.routes[0].legs[0].duration.value);
								};
							});
						} else if (status == "ZERO_RESULTS") {
							if (mode == 'train_station') {
								alert(startPlace + "の周辺に駅が見つかりませんでした");
							} else if (mode == "bus_station") {
								alert(startPlace + "の周辺にバス停が見つかりませんでした");
							} else if (mode == 'subway_station') {
								alert(startPlace + "の周辺に地下鉄駅が見つかりませんでした");
							};
						};
					});
				};
			});
			geocoder.geocode({
				address: endPlace
			}, (result, status) => {
				if (status == "OK") {
					endPosition = result[0].geometry.location;
					var endRequest = {
						location: endPosition,
						radius: 500,
						type: [mode]
					};
					placesService.nearbySearch(endRequest, (result, status) => {
						if (status == "OK") {
							marker(result[0].geometry.location, "aa", 0.8);

							var request = {
								origin: result[0].geometry.location,
								destination: endPosition,
								travelMode: google.maps.DirectionsTravelMode.WALKING
							};

							directionsService.route(request, (result, status) => {
								if (status == "OK") {
									setPolyLine(result.routes[0].overview_path);
									totalTime += result.routes[0].legs[0].duration.value
								};
							});
						} else if (status == "ZERO_RESULTS") {
							if (mode == 'train_station') {
								alert(endPlace + "の周辺に駅が見つかりませんでした");
							} else if (mode == "bus_station") {
								alert(endPlace + "の周辺にバス停が見つかりませんでした");
							} else if (mode == 'subway_station') {
								alert(endPlace + "の周辺に地下鉄駅が見つかりませんでした");
							};
						};;
					});
				};
			});
		};
	};
	
	var timer = document.getElementById("allowable-time").value;
	var text = document.getElementById("total-travel-time");

	alert (totalTime);
	h = "" + (totalTime / 36000 | 0) + (totalTime / 3600 % 10 | 0);
	m = "" + (totalTime % 3600 / 600 | 0) + (totalTime % 3600 / 60 % 10 | 0);
	T = h + "時間" + m + "分";
	text.textContent = T;

	if (totalTime >= 20700 - timer * 60) {
		text.style.color = "#ff0000";
	} else {
		text.style.color = "#222222";
	};
};

function getArrivalTime(startTime, spaceTime) {
	timer = spaceTime / 60;
	time = startTime.replace(":", "");
	result = time + timer;
	alert (Number(result));
}

function setTimeText(time, index) {
	document.getElementById('traveltime' + index).textContent = time;
}