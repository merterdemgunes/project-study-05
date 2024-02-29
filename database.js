import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import env from "dotenv";

import cors from 'cors';

const app = express();
const port = process.env.PORT || 3000;
const saltRounds = 10;
env.config();

app.use(bodyParser.json());
app.use(cors());
//Client
const db = new pg.Pool({
  user: "database_myportfolio_user",
  host: "dpg-cnfkug0cmk4c73avqm6g-a",
  database: "database_myportfolio",
  password: "M2X814WGaqSBpPXCtgTr5djjNqPQTX8E",
  port: "5432",
});
db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Connected to the database');
  }
});
app.get('/login', async (req, res) => {
  try {
    const result = await db.query('SELECT email FROM users');
    const emails = result.rows.map(row => row.email);
    res.send(emails);
  } catch (error) {
    console.error('Error fetching emails:', error);
    res.status(500).send(`Error fetching emails: ${error.message}`);
  }
});


app.get("/register", async (req, res) => {
  try {
    const email = "abc@abc"; // Predefined email address
    const password = "somepassword"; // Predefined password

    // Hash the password before storing it in the database
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert the user into the database
    await db.query(
      "INSERT INTO users (email, password) VALUES ($1, $2)",
      [email, hashedPassword]
    );

    return res.json({ success: true, message: 'Registration successful' });
  } catch (error) {
    console.error('Error registering user:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});



app.post("/register", async (req, res) => {

  const { email, password } = req.body;

  try {
    const checkResult = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (checkResult.rows.length > 0) {
      return res.json({ success: false, message: 'Email already exists. Try logging in.' });
    } else {
      bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) {
          console.error("Error hashing password:", err);
          return res.status(401).json({ success: false, message: 'Error comparing passwords.' });
        } else {
          console.log("Hashed Password:", hash);
          await db.query(
            "INSERT INTO users (email, password) VALUES ($1, $2)",
            [email, hash]
          );
          return res.json({ success: true, message: 'Registration successful' });        }
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  let loginPassword = password;

  try {
    const result = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      const storedHashedPassword = user.password;

      bcrypt.compare(loginPassword, storedHashedPassword, (err, result) => {
        if (err) {
          return res.status(401).json({ success: false, message: 'Error comparing passwords.' });
        } else {
          if (result) {
            return res.json({ success: true, message: 'Login successful.' });
          } else {
            return res.json({ success: false, message: 'Incorrect password.' });          }
        }
      });

      
    } else {
      return res.json({ success: false, message: 'Email does not exists.' });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

app.listen(port, () => {
  console.log(`Authentication server running on port ${port}`);
});


//--------------------------------------------------------------------------
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------
import nodemailer from 'nodemailer';

const app1 = express();
const port1 = 3001;

app1.use(bodyParser.json());
app1.use(cors());

app1.post('/contact', (req, res) => {
    const { to, subject, text } = req.body;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.VITE_MY_EMAIL,
            pass: process.env.MY_PASSWORD
        }
    });

    const mailOptions = {
        from: process.env.VITE_MY_EMAIL,
        to: to,
        subject: subject,
        text: text
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            res.status(500).send('Error sending email');
        } else {
            console.log('Email sent: ' + info.response);
            res.send('Email sent successfully');
        }
    });
});

app1.listen(port1, () => {
  console.log(`Email server running on port ${port1}`);
});
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------
