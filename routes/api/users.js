// @ts-ignore
const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const gravatar = require('gravatar');
const jwt = require('jsonwebtoken');
const config = require('config');



// @route POST api/users
// @desc Register user
// @access Public
router.post('/', [
    check('name', 'Name required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    ],
    async (req, res) => {
    console.log(req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { name, email, password } = req.body;

    try{
        // check user exists
        let user = await User.findOne({ email});
        if (user) {
            return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
        }

        // get users gravatar
        const avatar = gravatar.url(email, {
            s: '200', // size
            r: 'pg', // rating
            d: 'mm' // default
        });

        // create user
        user = new User({
            name,
            email,
            avatar,
            password
        })

        // encrypt password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();
        console.log('User registered')

        // return jsonwebtoken
        const payload = {
            user: {
                id: user.id
            }
        };

        const token = jwt.sign(
            payload,
            config.get('jwtSecret'),
            { expiresIn: 36000 // 10 hours
        });
        return res.json({ token });
    } catch(err) {
        console.error(err.message);
        return res.status(500).send('Server Error');
    }
});

module.exports = router;