# Geolocation Basic Node

__A Node.js API Geolocation Module__

This module offers both a basic geolocation and weather REST API web service, using JSON as the output format.  It can also work in a socket.io environment.

For the geolocation portion, it has a number of features that can locate a user's location from a number of external services.  The primary method this module uses is to resolve the user's IP address to a general location using Maxmind resources.  The module is fully compatible with both Maxmind's GeoLite(free) and GeoIP(paid) databases, be it CSV or the binary format.  Using the Maxmind resources is not required, as the module will also work with freegeoip.net right out of the box.  There are also a number of lookup methods for a user's location:  city/state/lat/lon by postal code, lat/lon by full address, full address by lat/lon, and city/state/zip by lat/lon.  These methods will use a combination of the Maxmind data whenever possible and are augmented by the Google Maps API.  The module also has the ability to use the Mapquest API, though this would require manual setup by a developer at this time.

For the Weather portion, this module is set up to make an API callout to the National Weather Service REST API, which is public information and can be accessed without any restrictions.  A user's weather information can be looked up by lat/lon, postal code, or IP address.  I also took the time to go through the very confusing NWS API to pre-process the data into a more friendly, readable format.  Because the NWS API can be sluggish at times, the module is designed to cache the weather data in a database and use it for up to three hours.  The time can be manually adjusted in the code.  While the caching feature can be disabled, it would require manual coding modifications and isn't recommended for sites and applications requiring a high callout rate.

The group of geolocation and weather functions can either be called up via their REST API links or by setting up a socket.io call.  Please read the [API documentation](docs/api_documentation.md) for specific examples.

This module uses MongoDB as it's default database, but also supports MySQL.  It is possible to modify this module to work with other RDBMS platforms such as SQL Server, Postgres, MariaDB, Oracle, etc.  Further documentation for MongoDB setup can be found [here](docs/mongodb_setup.md) and MySQL [here](docs/mysql_setup.md).

This module is a conversion from my [Drupal module](https://github.com/jeremyrperry/geolocation_basic) and utilizes Object Oriented Programming techinques whenever possible.  I'm not the most advanced developer for JavaScript OOP so my techniques might not be the most optimal.  Feedback is always welcome.  Code-level documentation has been provided in each JavaScript file.

Please be aware that while this module should for the most part work out of the box, it is still under active development, should only be installed by a knowledgeable developer, and should always go through a thorough testing/QA cycle before being put on a production site.  It may require some code modifications to work properly with your Node.js setup.

While the module will work without any Maxmind database, using either one is highly recommended to keep from hitting API limitations from Freegeoip.net and particularly Google Maps.  Please be aware that the module's DMA, City Postal By Geo, and Postal Code lookup functions utilize the data from the CSV Database whenever possible.  Because Maxmind's binary database API doesn't support any form of lookup outside of an IP address, setting up the CSV city data is still recommended even when using the binary database to avoid using the Google Maps API.  Regardless of the format chosen, you will need to download the databases directly from Maxmind as they are too big to include as a part of the module.  If the CSV version is chosen, be aware that some of the column names in the modules's table/collection structure are different from the provided CSV tables, so please plan accordingly. The Maxmind Geolite links are below.

This module also includes Postal and DMA code lookup features.  Both US and Canadian postal codes are supported.  Both datasets are available on a [separate repository](https://github.com/jeremyrperry/postal_and_dma_codes) in both JSON and CSV formats as they are too big to include with this repository.  Please feel free to use a different data source if it suits you better.

__CSV__

* [Geolite CSV Database Page](http://dev.maxmind.com/geoip/legacy/geolite/)
* [Geolite CSV Database City Download](http://geolite.maxmind.com/download/geoip/database/GeoLiteCity_CSV/GeoLiteCity-latest.zip)

__Binary__

* [Geolite Binary Database Page](http://dev.maxmind.com/geoip/geoip2/geolite2/)
* [Geolite Binary Database Download](http://geolite.maxmind.com/download/geoip/database/GeoLite2-City.mmdb.gz)

If you are using the binary database, please see [the documentaton](docs/binary_db_setup.md) for further setup instructions.

Maxmind's full subscription GeoIP databases can be downloaded from the appropriate section of the site.

## Further Module Documentation

* [API Documentaiton](docs/api_documentation.md)
* [AWS Load Balancer Notes](docs/aws_elb_notes.md)
* [Binary Database Setup](docs/binary_db_setup.md)
* [MongoDB Setup](docs/mongodb_setup.md)
* [MySQL Setup](docs/mysql_setup.md)

## Dependency Modules

* [assert](https://github.com/Jxck/assert)
- http (included by default)
* [MongoDB](https://github.com/mongodb/node-mongodb-native) or [MySQL](https://github.com/felixge/node-mysql)
* [xml2js](https://github.com/Leonidas-from-XIV/node-xml2js)
* [querystring](https://github.com/Gozala/querystring)
* [time](https://github.com/TooTallNate/node-time)
* [util](https://github.com/defunctzombie/node-util)

## Optional Modules

* [Maxmind DB Reader](https://github.com/PaddeK/node-maxmind-db)
* [pm2](https://github.com/unitech/pm2) (this module is strongly recommended in a production environment)
* [socket.io](https://github.com/Automattic/socket.io)


## Deployment Script Examples

* [REST API Mode](examples/web_services.js)
* [Socket.io Mode](examples/socket.js)
* [Get IP (For some ELB environments)](examples/get_ip.js)

_If you are planning to use this module in socket.io mode on an AWS load balancer environment, please read my [notes on proper setup](docs/aws_elb_notes.md)._

---

There is no copyright restriction on this module, and you are free to use or modify it in whole or in part for any purpose.  While I hope you find this module useful, it comes with no warranty, express or implied.  I will try to be helpful in answering basic questions, but I will not provide formal unpaid tech support.  Feedback, bug reports, etc. are always welcome on the project's [issues tracker](../../issues).  Also feel free to send pull requests.  Use of this module does not exempt one from the applicable copyright, licensing, and API policies set forth by the third party services utilized.