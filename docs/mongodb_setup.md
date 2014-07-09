# Geolocation Basic Node

## MongoDB Setup

This module comes with the ability to use MongoDB for storing necessary data by default.  Using the binary database as the IP lookup source will override using MongoDB. 

Instructions:

1. If you haven't already done so, install mongodb on your server.  Detailed instructions for your platform can be found here:  http://docs.mongodb.org/manual/installation/
2. Install the MongoDb module on your server.  ```npm install mongodb```
3. On the command line, navigate to the module's [db_structure directory](../../db_structure) and type in ```mongorestore```.  This will create a database called geolocation.  Feel free to modify the database name or insert into an existing database.
4. Import the applicable CSV files as necessary for the geolocation_dma, geolocation_cities, and geolocation_ip_locations collections.  Importing geolocaiton_dma can be omitted if you don't intend to use that feature.  Skip to step 12 if applicable.
5. Whether using the geolite or geoip versions, Maxmind provides two CSV files.  The file name ending in -Blocks and -Locations correlates to the geolocation_ip_locations and geolocation_cities collections respectively.
6. In both files, delete the Maxmind copyright notice, as it will interfere with the import process.
7. In the blocks file, replace the existing headers (startIpNum, endIpNum, locId) with the new headers (start_ip_num, end_ip_num, loc_id).
8. In the location file, replace the existing headers (locId, country, region, city, postalCode, latitude, longitude,	metroCode, areaCode) with the new headers (id, country, state_region, postal_code, lat, lng, dma_code, area_code).
9. The DMA information is automatically included as a part of the RDBMS setup and can easily be exported as a CSV with most any db admin application.
10. Import the CSV file(s) into the database.  Detailed instructions on CSV imports can be found [here](http://docs.mongodb.org/manual/core/import-export/).
11. To run geolocation queries on geolocation_cities and geolocation_dma, you will need to create an extra column for mongodb to use as a geolocation index and make the proper index.  The code is currently set up to run 2dsphere queries.  For Mongo environments that can only support 2d queries, custom setup of the queries in the code will be required.  2dsphere setup example:

```
db.geolocation_cities.find().forEach(
	function(elem){
		var newLoc = {type: 'Point', coordinates: [elem.lng, elem.lat]};
		db.geolocation_cities.update({_id: elem._id}, {$set: {loc: newLoc}});
	}
);
db.geolocation_cities.ensureIndex({loc: '2dsphere'});
```

12. The code is set to authenticate against the database by default.  If your MongoDB setup doesn't require authentication, set the mongoAuthentication setting in the [variable settings file](../json_files/class.var_settings.json) to false.
13. Change the ipSource setting in the [variable settings file](../../json_files/class.var_settings.json) to "mongo".
14. Enter in all necessary MongoDB login credentials in the module's [datbase settings file](../json_files/db_settings.json)(JSON format).  The file supports multiple database logins.  Username and password can be omitted if your MonboDB instance doesn't require authentication.

[Back](../../../)