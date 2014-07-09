# Geolocation Basic Node

## MySQL Database Setup

Setup of the Maxmind IP Geolocation data into an RDBMS is a mostly straightforward process that can be done with virtually any DB admin application.

1. Ensure the MySQL module is installed in your server environment.  ```npm install mysql```
1. Import the provided [database structure](../../db_structure/mysql_structure.sql) into your database.
2. Download either the Geolite or Geoip CSV data from Maxmind.
3. Whether using the geolite or geoip versions, Maxmind provides two CSV files.  The file name ending in -Blocks and -Locations correlates to the geolocation_ip_locations and geolocation_cities tables respectively.
4. In both files, delete the Maxmind copyright notice, as it will interfere with the import process.
5. In the blocks file, replace the existing headers (startIpNum, endIpNum, locId) with the new headers (start_ip_num, end_ip_num, loc_id).  Feel free to modify this if you so desire.
6. In the location file, replace the existing headers (locId, country, region, city, postalCode, latitude, longitude,	metroCode, areaCode) with the new headers (id, country, state_region, postal_code, lat, lng, dma_code, area_code).  Feel free to modify this if you so desire.
7. Import the CSV files into their respective tables.
8. Change the useMongo setting in the [variable settings file](../../json_files/class.var_settings.json) to false.
9. Change the ipSource setting in the [variable settings file](../../json_files/class.var_settings.json) to "rdbms".
10. Enter in all necessary MySQL login credentials in the module's [datbase settings file](json_files/db_settings.json)(JSON format).  The file supports multiple database logins.

Note:  The Locations file sometimes has issues in some db admin programs because of the formatting Maxmind uses, Shift JIS.  This can occur even when the geolocation_cities table is encoded the same way.  If you encounter this problem, I have a [PHP application](https://github.com/jeremyrperry/maxmind_locations_php_importer) that will do the import without issue.

[Back](../../../)