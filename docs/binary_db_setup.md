# Geolocation Basic Node

## Binary Database Setup

If you choose to set up the binary database, congratulations!  You are using the most recommended IP lookup setup that has the best overall performance.

1. Install the Maxmind DB Reader module on your server.  ```npm install maxmind-db-reader```
2. Download either the Geolite or GeoIP version of the database from Maxmind and place it in the binary_db directory of the module.  It is not necessary to store the database in the provided folder.  Be sure to modify the mmdbPath setting in the [variable settings file](../../json_files/class.var_settings.json).  Using the server's absolute path is recommended.  The GeoLite database can be downloaded from [here](http://geolite.maxmind.com/download/geoip/database/GeoLite2-City.mmdb.gz).
3. Change the ipSource setting to 'binary' in the [variable settings file](../../json_files/class.var_settings.json).

That's it.  You should be set to go. More detailed documentation for the database API can be found [here](https://github.com/PaddeK/node-maxmind-db).

[Back](../../../)
