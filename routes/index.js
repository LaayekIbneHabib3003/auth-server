const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// const auth = require("../middleware");
const userSchema = require("../model");

router.post(
  "/signup",
  [
    check("name", "Please enter your full name").not().isEmpty(),
    check("email", "Please enter a valid email").isEmail(),
    check("tel", "Please enter a valid phone number").isNumeric(),
    check("gender", "Please specify your gender").not().isEmpty(),
    check("country", "Please enter your country").not().isEmpty(),
    check("state", "Please enter your state").not().isEmpty(),
    check("city", "Please enter your city").not().isEmpty(),
    check("password", "Please enter a password with minimum 6 characters").isLength({
      min: 6,
    }),
  ],

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    const { name, email, tel, gender, country, state, city, password } = req.body;
    try {
      let user = await userSchema.findOne({
        email,
      });
      if (user) {
        return res.status(400).json({
          msg: "User already exists",
        });
      }

      user = new userSchema({
        name,
        email,
        tel,
        gender,
        country,
        state,
        city,
        password,
      });

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      await user.save();

      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        "randomString",
        {
          expiresIn: 10000,
        },
        (err, token) => {
          if (err) throw err;
          res.status(200).json({
            token,
          });
        }
      );
    } catch (err) {
      console.log(err.message);
      res.status(500).send("Error while saving");
    }
  }
);

router.post(
  "/signin",
  [
    check("email", "Please enter a valid email").isEmail(),
    check("password", "Please enter a password with minimum 6 characters").isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;
    try {
      let user = await userSchema.findOne({
        email,
      });
      if (!user)
        return res.status(400).json({
          message: "User doesn't exist",
        });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res.status(400).json({
          message: "Incorrect password",
        });

      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        "randomString",
        {
          expiresIn: 3600,
        },
        (err, token) => {
          if (err) throw err;
          res.status(200).json({
            token,
          });
        }
      );
    } catch (e) {
      console.error(e);
      res.status(500).json({
        message: "Server error",
      });
    }
  }
);

// router.get("/me", auth, async (req, res) => {
//   try {
//     const user = await userSchema.findById(req.user.id);
//     res.json(user);
//   } catch (e) {
//     res.send({ message: "Error while fetching user" });
//   }
// });

router.get("/data", async (req, res) => {
  try {
    const users = await userSchema.find();
    res.json(users);
  } catch (e) {
    res.send({ message: "Error while fetching users" });
  }
});

module.exports = router;
