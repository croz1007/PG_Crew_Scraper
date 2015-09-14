TEST
#Columbus Crew Players List
![alt-text][logo]

###Description
This API is a simple site scraper to hit the Columbus Crew players website and pull a full roster with stats like 'Age', 'Height', 'Weight', and more.

###Usage
Using this API is very simple.

**To GET all players:**
=====
Access the host site and then call the REST endpoint '/players'.

*Example: http://fathomless-hollows-8511.herokuapp.com/players*

**To GET a Specific Player by ID:**
=====
Access the host site and then call the REST endpoint '/players/:id'. Note that this ID is *NOT* the players jersey number but rather the ID in the dataset.

*Example: http://fathomless-hollows-8511.herokuapp.com/players/5*

=====

####Notes
*Please note that the Columbus Crew Logo shown above belongs to the Columbus Crew Football Club and is only used here to add some style to the documentation.*

[logo]: http://content.sportslogos.net/logos/9/324/full/1002_columbus_crew-primary-2015.png "Crew Logo"
