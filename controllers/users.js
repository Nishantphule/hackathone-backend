// import the express Router
const userRouter = require('express').Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../utils/config");

const User = require("../models/User");

// register
userRouter.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, email, phoneNumber, address, sports, password } = req.body;

        const existingUser = await User.findOne({ emailId: email });

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
                address,
                sports,
                phoneNumber,
                password: hashedPassword
            })

            const savedUser = await user.save()
            // res.send({ "message": "Successful Registeration", token: token })
            res.status(201).json({ message: 'Successful Registeration', user: savedUser });
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

        if (!user) {
            res.status(400).send({ message: "Invalid Credentials" })
        }
        else {
            const storedPassword = user.password;
            const isPasswordMatch = await bcrypt.compare(password, storedPassword)
            if (isPasswordMatch) {
                const token = jwt.sign({ id: user.userId }, config.SECRET_KEY)
                res.header({ "x-auth-token": token })
                res.send({ "message": "Successful Login", token: token, user: user })
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


// get user
userRouter.get('/userById', async (req, res) => {
    try {
        const id = req.body;
        const user = await User.findById(id)
        res.status(200).json({ user })
    } catch (error) {
        res.status(400).json({ message: "Server Error", error })
    }
})


// edit
userRouter.patch("/editUser/:id", (request, response) => {
    const id = request.params.id;
    const userToPatch = request.body;

    User.findByIdAndUpdate(id, userToPatch)
        .then((updateduser) => {
            if (!updateduser) {
                return response.status(404).json({ error: 'user not found' });
            }
            response.status(201).json({ "message": "Update Successful", updateduser });
        })
        .catch((error) => {
            response.status(500).json({ error: 'Internal server error' });
        });
})


// all
userRouter.get("/allUser", async (req, res) => {
    try {
        User.find({})
            .then((users) => {
                res.status(200).json({ users: users })
            })
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" })
    }
})



module.exports = userRouter;