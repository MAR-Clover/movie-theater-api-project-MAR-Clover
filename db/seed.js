const { db } = require('./connection');
const { Show, User } = require('../models/index');
const userData = require('./users.json');
const showData = require('./shows.json');

const seed = async () => {
  // drop the db and recreate tables
  await db.sync({ force: true });

  // add users and shows data
  const users = await User.bulkCreate(userData);
  const shows = await Show.bulkCreate(showData);

  // Log data to ensure they are being inserted
  console.log('Users:', users);
  console.log('Shows:', shows);

  // associate users with shows
  await Promise.all([
    users[0].addShow(shows[0]),
    users[0].addShow(shows[1]),
    users[1].addShow(shows[2]),
    users[1].addShow(shows[3]),
  ]);

  console.log('Shows and User database info populated!');
};

// Call the seed function
seed();

