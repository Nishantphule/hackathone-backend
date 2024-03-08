// import the express Router
const userRouter = require('express').Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../utils/config");

const User = require("../models/User");

// register
userRouter.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, email, phoneNumber, password } = req.body;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({ message: "User already exists" })
        }

        else {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            const user = new User({
                firstName,
                lastName,
                emailId: email,
                phoneNumber,
                password: hashedPassword
            })

            const savedUser = await user.save()
            res.send({ "message": "Successful Registeration", token: token })
            res.status(201).json({ message: 'User registered successfully', user: savedUser });
        }

    } catch (error) {
        res.status(504).json({ message: "Internal server Error" });
    }
})


// login
userRouter.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ emailId: email });
        console.log(user)
        if (!user) {
            res.status(400).send({ message: "Invalid Credentials" })
        }
        else {
            const storedPassword = user.password;
            const isPasswordMatch = await bcrypt.compare(password, storedPassword)
            if (isPasswordMatch) {
                const token = jwt.sign({ id: user.userId }, config.SECRET_KEY)
                res.header({ "x-auth-token": token })
                res.send({ "message": "Successful Login", token: token })
            }
            else {
                res.send({ message: "Invalid Credentials" })
            }
        }


    } catch (error) {
        console.error("Error signing In")
        res.status(500).json({ message: "Internal Server Error" })
    }
});

module.exports = userRouter;