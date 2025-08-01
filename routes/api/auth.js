const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const config = require('config');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');

// @route GET api/auth
// @desc Test route
// @access Public
router.get('/', auth,
    async (req, res) =>
    {
        try{
            const user = await User.findById(req.user.id).select('-password');
            res.json(user);
        } catch(err){
            console.error(err.message);
            res.status(500).send('Server error at Auth');
        }
    }

);

// @route POST api/auth
// @desc Authenticate user, get token
// @access Public
router.post('/', [
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password required').exists(),
    ],
    async (req, res) => {
        console.log(req.body);
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { email, password } = req.body;

        try{
            // check user exists
            let user = await User.findOne({ email});

            if (!user) {
                return res
                    .status(400)
                    .json({ errors: [{ msg: 'Invalid' }] });
            }

            // check password
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ errors: [{ msg: 'Invalid' }] });
            }

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