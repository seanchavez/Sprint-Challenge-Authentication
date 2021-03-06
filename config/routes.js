const axios = require('axios');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/dbConfig');
const { authenticate } = require('./middlewares');
const jwtKey = require('../_secrets/keys').jwtKey;

module.exports = server => {
  server.post('/api/register', register);
  server.post('/api/login', login);
  server.get('/api/jokes', authenticate, getJokes);
};

function register(req, res) {
  // implement user registration
  const credentials = req.body;
  const hash = bcrypt.hashSync(credentials.password, 14);
  credentials.password = hash;

  db('users').insert(credentials)
    .then(ids => {
      db('users').where('id', ids[0]).first()
        .then(user => {
          const token = generateToken(user);
          res.status(201).json(token);
        });
    })
    .catch(err => {
      res.send(err);
    });
}

function login(req, res) {
  // implement user login
  const credentials = req.body;

  db('users').where({username: credentials.username}).first()
    .then(user => {
      if (user && bcrypt.compareSync(credentials.password, user.password)) {
        const token = generateToken(user);
        res.send(token);
      } else {
        return res.status(401).json({error: 'Incorrect credentials'});
      }
    })
}

//const secret = jwtKey;

const generateToken = user => {
  const payload = {username: user.username};
  const options = {
    expiresIn: '1h',
    jwtid: '666666'
  };
  return jwt.sign(payload, jwtKey, options);
};

function getJokes(req, res) {
  axios
    .get(
      'https://08ad1pao69.execute-api.us-east-1.amazonaws.com/dev/random_ten'
    )
    .then(response => {
      res.status(200).json(response.data);
    })
    .catch(err => {
      res.status(500).json({ message: 'Error Fetching Jokes', error: err });
    });
}
