const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const { check, validationResult } = require('express-validator');

// @route GET api/profile/me
// @desc Get current user's profile
// @access Private
router.get('/me',auth, async (req, res) => {
    try{
        const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'avatar']);
        if (!profile) {
            return res.status(400).json({ msg: 'There is no profile for this user' });
        }
        return res.json(profile);
    } catch(err) {
        console.error(err.message);
        return res.status(500).send('Server Error (Profile GET)');
    }
})

// @route POST api/profile
// @desc Create or update user profile
// @access Private
router.post('/', [auth, [
    check('status', 'Status is required').not().isEmpty(),
    check('skills', 'Skills are required').not().isEmpty()
] ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const {
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,
        youtube,
        twitter,
        facebook,
        linkedin,
        instagram
    } = req.body;

    // Build profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
        profileFields.skills = skills.split(',').map(skill => skill.trim());
    }
    // Initialize social object
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;

    try {
        let profile = await Profile.findOne({ user: req.user.id });
        if (profile) {
            // Update profile
            profile = await Profile.findOneAndUpdate(
                { user: req.user.id },
                { $set: profileFields },
                { new: true }
            );
            return res.json(profile);
        }
        // Create profile
        profile = new Profile(profileFields);
        await profile.save();
        return res.json(profile);
    } catch(err) {
        console.error(err.message);
        return res.status(500).send('Server Error (Profile POST)');
    }
})

// @route GET api/profile
// @desc Get all profiles
// @access Public
router.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar']);
        return res.json(profiles);
    } catch(err) {
        console.error(err.message);
        return res.status(500).send('Server Error (Profile GET All)');
    }
})

// @route GET api/profile/user/:user_id
// @desc Get profile by user ID
// @access Public
router.get('/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name', 'avatar']);
        if (!profile) {
            return res.status(400).json({ msg: 'Profile not found' });
        }
        return res.json(profile);
    } catch(err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ msg: 'Profile not found' });
        }
        return res.status(500).send('Server Error (Profile GET by ID)');
    }
})


// @route DELETE api/profile
// @desc Delete profile, user & posts
// @access Private
router.delete('/', auth, async (req, res) => {
    try {
        // Remove profile
        await Profile.findOneAndDelete({user: req.user.id});
        let user = await User.findOne({_id: req.user.id});
        let name = user.name;
        // Remove user
        await User.findOneAndDelete({_id: req.user.id});
        return res.json({msg: `User ${name} deleted`});
    } catch(err) {
        console.error(err.message);
        return res.status(500).send('Server Error (Profile DELETE)');
    }
})

module.exports = router;