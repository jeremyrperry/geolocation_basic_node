# Geolocation Basic Node API

[Back to Main Page](../../../)

Because there can be potential inaccuracies in resolving a user's IP address to a location, it is important  to be aware of potential limitations, pitfalls, etc. before utilizing it in location critical tasks of a website or web application.  The API offers the ability to obtain geolocation by using the following methods:

* IP Address – Gets city, state, postal code, and latitude/longitude by IP address.
* Postal Code - City, State, and latitude/longitude by Zip code.
* Lat/Lon City - City, State, and Postal Code by latitude/longitude.
* Lat/Lon Address - Full address by latitude/longitude.
* Address Lat/Lon - Latitude/longitude by full address.

In addition to direct geolocation information, this application is also capable of pulling weather information from the National Weather Service.  This can be accomplished through geocoordinates, a postal code, or the user’s IP address.

These methods are meant to augment the HTML5 Geolocator standard, which is by far the most accurate way of obtaining a user’s location.  However, there are times where the HTML5 Geolocator user prompt is not a desirable interaction. 

The information the module is capable of looking up can be utilized as a REST API or a socket.io service.  Requests can be done either from the client-side using JavaScript or server-side with most any server language.  All that is needed is to specify the listening port, or to have proper port forwarding in place.  Here is an example URL using a non-traditional web port (80, 443, etc):  http://yoursite.com:8080/

Unless otherwise specified, all REST API and socket.io lookups will use the type and value variables.

Feature List:

* [IP Address](#ip-address)
* [Postal Code](#postal-code)
* [Ciyt/Postal by Geolocation](#citypostal-by-geolocation)
* [Address by Geolocation](#address-by-geolocation)
* [Weather](#weather)

An example of a JavaScript AJAX request (using jQuery for simplicity):

```
<script>
function getIP(){
	$.get(‘http://yoursite.com:8080’, function(json){
		var data = jQuery.parseJSON(json);
		var city = data.results.city;
		var state = data.results.state_region;
		var zip = data.results.postal_code;
		var lat = data.results.lat;
		var lng = data.results.lng;
]);
}
</script>
```

An example of a successful API JSON Response:

```
{"status":"success","results":{"id":"3535","country":"US","state_region":"WA","city":"Kirkland","postal_code":"98033","lat":"47.6727","lng":"-122.1873","dma_code":"819","area_code":"425"}}
```

An example of a socket.io request:

```
<script src="http://yoursite.com:8081/socket.io/socket.io.js"></script>
<script>
var socket = io.connect('http://yoursite.com:8081');
socket.on('connect', function(){
    var sendData = {
        'type': 'ip_address'
    };
    socket.send(JSON.stringify(sendData));
    socket.on('message', functtion(d){
        console.log(d);//The return is a JavaScript object
    });
})
</script>
```

_Note: when using the applicaiton with socket.io, the type will be returned to allow for custom sorting._

[top](#geolocation-basic-node-api)
 
## Location Methods

### IP Address

The IP address method is capable of getting the city, state, postal code, latitude longitude, dma code, and area code of the IP address in question.  It will use the IP address of the end user by default unless another IP is specified, so the value variable can be omitted if the end user’s IP is desired.  Because the IP lookup is the default functionality of the application, the type can be omitted when using the REST API method.  It should be noted that the results are a general location for the IP address, and should not be used to get an exact location for the end user.  Please be aware that resolving an IP address from a user on a mobile network may result in a completely inaccurate location due to the wide latitude cell phone carriers have in assigning IP addresses.

Required Input Values:
* type - ip_address.  Only required for socket.io.

Optional Input Values:
* value - an IP address not the current users
* ip_correct - true or false.  Default is true.  Performs additional lookup for missing location information, which has been known to happen with Maxmind CSV databases.  Can be set to false for faster performance, but is recommended to be left as true.
* dma_info - true or false.  Default is false.  Performs additional lookup for specific DMA information.
* run_update - true or false.  Default is true.  Corrects any missing location information in the database during the IP correct phase.  Can be set to false for faster performance, but it is recommended to be left as true.


Example Get URL (using an IP address not the end user’s):  

```
http://yoursite.com:8080/?value=24.19.187.86
```

Example JSON response:

```
{"status":"success","results":{"id":"3535","country":"US","state_region":"WA","city":"Kirkland","postal_code":"98033","lat":"47.6727","lng":"-122.1873","dma_code":"819","area_code":"425"}}
```

Example socket.io request:

```
<script>
var socket = io.connect('http://yoursite.com:8081');
socket.on('connect', function(){
    var sendData = {
        'type': 'ip_address'
    };
    socket.send(JSON.stringify(sendData));
    socket.on('message', functtion(d){
        console.log(d);//The return is a JavaScript object
    });
})
</script>
```

Response Result Variables:

* results.id: The ID of the database row.
* results.country: The abbreviated country.
* results.state_region: The abbreviated state, province, or region.
* results.esults city: The full city name.
* results.lat: The centralized reported latitude of the postal code.
* results.lon: The centralized reported longitude of the postal code.
* results.dma_code:  The DMA code for the user’s current location.
* results.area_code:  The prevailing area code for the user’s current. location.  This has no correlation to the user’s actual area code.

[top](#geolocation-basic-node-api)

---

### Postal Code

The Postal Code method is capable of getting the city, state, latitude, and longitude of  a postal code.  This method should not be used for pinpointing an end user’s exact location.

Required Input Values:
* type - postal_code
* value - Any valid US or Canadian postal code.

Example Get URL:
	
```
http://yoursite.com:8080/?type=postal_code&value=98033
```

Example JSON Response:

```
{"status":"success","results":{"id":"3535","country":"US","state_region":"WA","city":"Kirkland","postal_code":"98033","lat":"47.6727","lng":"-122.1873","dma_code":"819","area_code":"425"}}
```

Example socket.io request:

```
<script>
var socket = io.connect('http://yoursite.com:8081');
socket.on('connect', function(){
    var sendData = {
        'type': 'ip_address'
    };
    socket.send(JSON.stringify(sendData));
    socket.on('message', functtion(d){
        console.log(d);//The return is a JavaScript object
    });
})
</script>
```

_The response result variables are the same as the IP Address method._

[top](#geolocation-basic-node-api)

---

### City/Postal by Geolocation

The City/Postal by Geolocation method is capable of getting the closest reported city, state, and postal code by latitude and longitude.  It is used when the specific location of the end user is not needed.  It should be noted that minor inaccuracies can occur when a user’s lat/lon is near municipal boundaries.  The latitude and longitude need to be comma separated with the latitude preceding the longitude.

Required Input Values:
* type - city_postal_by_geo
* value - Any valid US or Canadian postal code.

Optional Values:
* dist - the maximum distance radius in miles for the search.  Default is 100.
    

Example Get URL:
	
```
http://yoursite.com:8080/?type=city_postal_by_geo&value=47.6727,-122.1873
```

Example JSON response:
	
```
{"status":"success","results":{"id":"3535","country":"US","state_region":"WA","city":"Kirkland","postal_code":"98033","lat":"47.6727","lng":"-122.1873","dma_code":"819","area_code":"425","distance":"0"}}
```

Example socket.io request:

```
<script>
var socket = io.connect('http://yoursite.com:8081');
socket.on('connect', function(){
    var sendData = {
        'type': 'city_postal_by_geo',
        'value': '47.6727,-122.1873'
    };
    socket.send(JSON.stringify(sendData));
    socket.on('message', functtion(d){
        console.log(d);//The return is a JavaScript object
    });
})
</script>
```

_The response result variables are the same as the IP Address method._

[top](#geolocation-basic-node-api)

---

### Address By Geolocation

The Address By Geolocation method is capable of getting the exact address for the inputted latitude and longitude.  It should only be used when an exact location is needed and when precise latitude and longitude coordinates are obtained.  The latitude and longitude need to be comma separated with the latitude preceding the longitude.  This function calls up the Google Maps API, so it should be used sparingly if a business API key can't be provided.

Required Input Values:
* type - address_by_geo
* value - Comma separated latitude and longitude coordinates

Optional Input Values:
* dma_info - true or false.  Default is false.  If set to true, the system will also return the relevant DMA information.

Example Get URL:

```
http://yoursite.com:8080/?type=address_by_geo&value=47.6727,-122.1873
```

Example JSON Response:

```
{"status":"success","results":{"address":"11501-11599 NE 75th St","city":"Kirkland","state_region":"WA","postal_code":"98033","country":"US"}}
```

Example socket.io request:

```
<script>
var socket = io.connect('http://yoursite.com:8081');
socket.on('connect', function(){
    var sendData = {
        'type': 'address_by_geo',
        'value': '47.6727,-122.1873'
    };
    socket.send(JSON.stringify(sendData));
    socket.on('message', functtion(d){
        console.log(d);//The return is a JavaScript object
    });
})
</script>
```

Response Result Variables:

* results.address: The reported address of the latitude/longitude coordinates.
* results.city; The reported city of the latitude/longitude coordinates. 
* results.state_region: The reported state/province/region of the latitude/longitude coordinates.
* results.postal_code: The reported postal code of the latitude/longitude coordinates.
* results.country:  The two letter code for the country of the latitude/longitude coordinates.

[top](#geolocation-basic-node-api)

---

### Geolocation By Address

The Geolocation By Address method is capable of getting the latitude and longitude of the inputted address.  It should only be used when the exact latitude and longitude are needed and an accurate address is obtained, as it uses the Google Maps API where query restrictions apply without an API key.  The API does allow for some minor variances in how the address is laid out.  The address does need to be URL encoded if being sent by a get method.

Required Input Values:
* type - geo_by_address
* value - The address to get the geocoordinates for.  

Example Get URL:

```
http://yoursite.com/geolocation/export?type=geo_by_address&value=111+central+way,+kirkland,+wa+98033
```

Example JSON Response:

```
{"status":"success","results":{"city":"Kirkland","state_region":"WA","postal_code":"98033","country":"USA","lat":47.6762704,"lng":-122.2077858}}
```

Example socket.io request:

```
<script>
var socket = io.connect('http://yoursite.com:8081');
socket.on('connect', function(){
    var sendData = {
        'type': 'geo_by_address',
        'value': '111 central way, kirkland, wa 98033'
    };
    socket.send(JSON.stringify(sendData));
    socket.on('message', functtion(d){
        console.log(d);//The return is a JavaScript object
    });
})
</script>
```

The result values are self-explanatory.

[top](#geolocation-basic-node-api)

## Weather


This module is capable of pulling weather information from the National Weather Service, and provides a wide latitude of reporting capabilities.  While it is completely possible to access the NWS API without an aggregate service like this module, the API is notoriously difficult to work with, and the module does a lot of the heavy lifting by converting the data into a more workable format.  Also, because the NWS web server can have a sluggish response at times, the module caches the weather information for up to three hours, helping to increase the performance.  The module can utilize latitude/longitude, postal code, or or an IP address for determining the weather reporting location.  A lookup by IP address is the default.

Required input values: 
* type: weather

Optional Input Values:
* subtype: postal_code, geo, or ip_address.  Default is IP address.  The subtype will coincide with the value.
* value:  Optional if subtype is ip_address, required for postal_code and geo subtypes.  If sbutype is set to geo, the lat/lng values must be comma separated with the lat value preceding the lng value.
* end: The maximum range for the weather forecast in relation to the current time in number of days.  Default is 1 day..

Example Get URL using latitude/longitude:

```
http://yoursite.com/geolocation/export?type=weather&subtype=geo&value=47.676308399999996,-122.20762579999999&end=3+days
```

Example socket.io request:

```
<script>
var socket = io.connect('http://yoursite.com:8081');
socket.on('connect', function(){
    var sendData = {
        'type': 'weather',
        'subtype': 'geo',
        'value': '47.676308399999996,-122.20762579999999',
        'end': '3 days'
    };
    socket.send(JSON.stringify(sendData));
    socket.on('message', functtion(d){
        console.log(d);//The return is a JavaScript object
    });
})
</script>
```

Because of the large dataset that can be returned, an example JSON response return is not included.  The possible result variables are below.  The start_valid_time and end_valid_time variables are time time periods the weather data is valid for in W3C format.

* status: the overall outcome of the query.  Is success or error.
* msg: An occasional message may appear if a particular outcome occurs.
* results city: The full city name.
*  results.state_region: The abbreviated state, province, or region.
* results.postal_code: The postal code of the user’s location.
* results.lat: The centralized reported latitude of the postal code.
* results.lng: The centralized reported longitude of the postal code.
* results.nws_xml: The URL for the original NWS XML output.
* results.nws_page: The URL for a human friendly NWS weather report page.
* results.data.icon:  An array of weather icon images provided by the NWS.  Within each result contains the value, which is a hyperlink to the image, and start_valid_time.
* results.data.weather_conditions: An array of the weather conditions summary.  Within reach result contains the value, which is a human readable summary of the weather, and start_valid_time.
* results.data.maximum_temp: An array of the maximum daytime temperatures in fahrenheit. Within reach result contains the value, start_valid_time and end_valid_time.
* results.data.minimum_temp: An array of the minimum daytime temperatures in fahrenheit. Within reach result contains the value, along with start_valid_time and end_valid_time.
* results.data.hourly_temp: An array of the hourly temperatures in fahrenheit. Within reach result contains the value, start_valid_time and end_valid_time.
* results.data.precipitation:  An array of the expected levels of precipitation in inches.  Within reach result contains the value, start_valid_time, and end_valid_time.
* results.data.clould_cover:  An array of the expected cloud cover levels in percentage.  Within reach result contains the value, start_valid_time, and end_valid_time.
* results.data.12_hour_precip_prob:  An array of the likeliness of precipitation in percentage.  Within reach result contains the value, start_valid_time, and end_valid_time.
* results.data.humidity:  An array of the humidity in percentage.  Within reach result contains the value, start_valid_time, and end_valid_time.
* results.data.wind_dir:  An array of the wind directions at specified time periods.  Within reach result contains the value, start_valid_time, and end_valid_time.
* results.data.wind_speed:  An array of the wind speed at specified time periods.  Within reach result contains the value, start_valid_time, and end_valid_time.

[top](#geolocation-basic-node-api)
