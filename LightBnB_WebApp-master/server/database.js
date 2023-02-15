const { Pool } = require('pg');

const pool = new Pool({
  user: 'vagrant',
  password: '333',
  host: 'localhost',
  database: 'lightbnb'
});

/// Users
/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */

const getUserWithEmail = function (email) {
  return pool
    .query(`SELECT * FROM users WHERE email LIKE $1`, [email])
    .then((result) => {
      if (result.rows[0]) {
        console.log(result.rows[0]);
        return result.rows[0]; //the promise resolves with the user object
      } else {
        return null; //return null if that user does not exist.
      }
    })
    .catch(err => console.log(err.message));
}
exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function (id) {
  return pool
    .query(`SELECT * FROM users WHERE id = $1`, [id])
    .then((result) => {
      if (result.rows[0]) {
        return result.rows[0]; //the promise resolves with the user object
      } else {
        return null; //return null if that user does not exist.
      }
    })
    .catch(err => console.log(err.message));
}
exports.getUserWithId = getUserWithId;


/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser = function (user) {
  return pool
    .query(`
    INSERT INTO users(name, email, password) 
    VALUES ($1,$2,$3) 
    RETURNING *;`, //to return the object that was just inserted.
      [user.name, user.email, user.password])
    .then(res => {
      return res.rows[0];
    }) //return the new user object, its id should appear as well
    .catch(err => console.log(err.message));
}
exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function (guest_id, limit) {
  return pool
    .query(`
    SELECT reservations.*, properties.*, avg(property_reviews.rating) as average_rating
    FROM reservations
    JOIN properties ON properties.id = reservations.property_id
    JOIN property_reviews ON properties.id = property_reviews.property_id
    WHERE reservations.guest_id = $1
    GROUP BY reservations.id, properties.id
    LIMIT $2;
    `, [guest_id, limit])
    .then(result => {
      return result.rows;
    })
    .catch(err => console.log(err.message));
};
exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = function (options, limit) {
  console.log('options:', options); //prin out the parameter to see what we'll receive

  let queryParam = [];
  let queryString = `
  SELECT properties.*, avg(property_reviews.rating) as average_rating
  FROM properties
  JOIN property_reviews ON properties.id = property_id
  WHERE 1 = 1
  `;

  //if city is filtered
  if (options.city) {
    queryParam.push(`%${options.city}%`); //the % syntax for the LIKE clause must be part of the parameter, not the query.
    queryString += ` AND city LIKE $${queryParam.length}`; //the length of the array = the $n placeholder number. 
  } //add any query that comes after the WHERE clause.

  //if the user already has a listing
  if (options.owner_id) {
    queryParam.push(Number(options.owner_id));
    queryString += ` AND owner_id = $${queryParam.length}`;
  }

  //if the cost is filtered
  if (options.minimum_price_per_night) {
    queryParam.push(Number(options.minimum_price_per_night) * 100);
    queryString += ` AND cost_per_night >= $${queryParam.length}`
  };

  if (options.maximum_price_per_night) {
    queryParam.push(Number(options.maximum_price_per_night) * 100);
    queryString += ` AND cost_per_night <= $${queryParam.length}`
  };

  queryString += `
  GROUP BY properties.id
  `; //the query requires a GROUP BY since we wanna create the average(rating) column

  //if rating is filtered
  if (options.minimum_rating) {
    queryParam.push(Number(options.minimum_rating));
    queryString += `
    HAVING avg(property_reviews.rating) >= $${queryParam.length}
    `;
  };

  queryParam.push(limit);
  queryString += `
  ORDER BY cost_per_night
  LIMIT $${queryParam.length};
  `;

  console.log(queryString, queryParam); //console log everything just to make sure we've done it right.

  return pool.query(queryString, queryParam).then(res => { return res.rows; }); //run the query.
};
exports.getAllProperties = getAllProperties;


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function (property) {
  let value = [];
  let key = [];
  let valueHolder = [];
  let index = 1;

  for (let item in property) {
    key.push(item);
    if (item === 'cost_per_night') {
      value.push(property[item]*100);
    } else {
      value.push(property[item]);
    }
    valueHolder.push(`$${index}`);
    index += 1;
  }
  
  let keyString = key.join(', ');
  let valueString = valueHolder.join(', ');

  let queryString = `
  INSERT INTO properties (${keyString})
  VALUES (${valueString})
  RETURNING *;
  `;

  console.log(queryString, value);

  return pool.query(queryString, value).then(res => res.rows);
}
exports.addProperty = addProperty;
