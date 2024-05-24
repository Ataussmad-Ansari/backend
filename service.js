const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(session({
  secret: 'yourSecretKey',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // for development; use secure: true in production with HTTPS
}));

mongoose.connect('mongodb+srv://samad:samad@cluster0.zzzurtt.mongodb.net/usersdb?retryWrites=true&w=majority&tls=true', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});

const User = mongoose.model('User', UserSchema);

app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const newUser = new User({ name, email, password });
    await newUser.save();
    res.status(201).send('User registered');
  } catch (error) {
    res.status(400).send('Error registering user');
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email, password });
    if (!user) {
      return res.status(400).send('Invalid credentials');
    }
    req.session.user = { name: user.name, email: user.email }; // Save user info in session
    res.status(200).send('User logged in');
  } catch (error) {
    res.status(500).send('Error logging in user');
  }
});

app.get('/current-user', (req, res) => {
  if (req.session.user) {
    res.status(200).json(req.session.user);
  } else {
    res.status(401).send('No user logged in');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
