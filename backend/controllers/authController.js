const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");

const { User, validateRegisterUser, validateLoginUser } = require("../models/User");
const VerificationToken = require("../models/VerificationToken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

/**----------------------------------------------------------------
 * @desc    Register New User
 * @route  /api/auth/register
 * @method  POST
 * @access  public
 ------------------------------------------------------------------*/
 module.exports.registerUserCtrl = asyncHandler(async (req, res) => {
    // validation
    const {error} = validateRegisterUser(req.body);
    if (error) {
        return res.status(404).json({message: error.details[0].message});
    }
    // is user already exists
    let user = await User.findOne({ email: req.body.email});
    if (user) {
        return res.status(400).json({message: "user already exist"});
    }
    // hash the password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    // new user and save it to Db
    user = new User({
        username: req.body.username,
        email: req.body.email,
        password: hashPassword,
    });
    await user.save();
    /*
    const result = await user.save();
    const token = null;
    const {password,...other} = result._doc;
    res.status(201).json(result);*/

    // @TODO - sending email (verify account)

    // Creating new VerificationToken & save it toDB
    const verificationToken = new VerificationToken({
        userId: user._id,
        token: crypto.randomBytes(32).toString("hex"),
    });
    await verificationToken.save();

    // Making the link
    const link = `${process.env.CLIENT_DOMAIN}/users/${user._id}/verify/${verificationToken.token}`;
    // Putting the link into an html template
    const htmlTemplate = `
    <div>
    <p>Click on the link below to verify your email</p>
    <a href=${link}>Verify</a>
    </div>`;
    // Sending email to user
    await sendEmail(user.email, "Verify your email", htmlTemplate);

    // send response to client
    res.status(201).json({message: "We sent you an email, please check your email address"}); //you registered successfully, please login
 });

 /**----------------------------------------------------------------
 * @desc    Login User
 * @route  /api/auth/login
 * @method  POST
 * @access  public
 ------------------------------------------------------------------*/
 module.exports.loginUserCtrl = asyncHandler(async (req, res) => {
    // 1. validation
    // 2. is user exist
    // 3. check the password
    // 4. generate token (jwt)
    // 5. response to client

    // validation
    //const {error} = validateLoginUser(req.body); 
    //Should remove validateLoginUser => "password" length must be at least 8 characters long
    // from User.js => password: Joi.string().trim().min(8).required(),
    const {error} = validateLoginUser(req.body);
    if (error) {
        return res.status(404).json({message: error.details[0].message});
    }
    // is user already exists
    let user = await User.findOne({ email: req.body.email});
    if (!user) {
        return res.status(400).json({message: "user not found"});
    }
    // check password
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) {
        return res.status(400).json({message: "invalid password"});
    }

    // @TODO - sending email (verify account if not verified)
    if(!user.isAccountVerified) {
        let verificationToken = await VerificationToken.findOne({
            userId: user._id,
            //token: crypto.randomBytes(32).toString("hex"),
        });
        if(!verificationToken) {
            verificationToken = new VerificationToken({
                userId: user._id,
                token: crypto.randomBytes(32).toString("hex"),
            });
            await verificationToken.save();
        }

    const link = `${process.env.CLIENT_DOMAIN}/users/${user._id}/verify/${verificationToken.token}`;
    const htmlTemplate = `
    <div>
    <p>Click on the link below to verify your email</p>
    <a href=${link}>Verify</a>
    </div>`;
    await sendEmail(user.email, "Verify your email", htmlTemplate);

        return res.status(400).json({message: "Account not verified. Please verify your email."}); 
        //return res.status(201).json({message: "We sent you an email, please check your email address"});
    }
    const token = user.generateAuthToken();

    res.status(200).json({
    _id: user._id,
    isAdmin: user.isAdmin,
    profilePhoto: user.profilePhoto,
    token,
    username: user.username,
    });
    // send response to client
    res.status(201).json({message: "you logged in successfully"});
 });

 /**----------------------------------------------------------------
 * @desc    Verify User Account
 * @route  /api/auth/:userId/verify/:token
 * @method  GET
 * @access  public
 ------------------------------------------------------------------*/
 module.exports.verifyUserAccountCtrl = asyncHandler(async (req, res) => {
    //const { userId, token } = req.params;

    // Find the user by ID and token
    const user = await User.findById(req.params.userId);
    if (!user) {
        return res.status(400).json({ message: "Invalid link" }); //User not found.
    }

    const verificationToken = await VerificationToken.findOne({
        userId: user._id,
        token: req.params.token,
     });
    if (!verificationToken) {
        return res.status(400).json({ message: "Invalid token." });
    }

    // Update user's isAccountVerified field to true
    user.isAccountVerified = true;
    await user.save();

    // Remove the verification token from the database
    //await verificationToken.remove();
    await verificationToken.deleteOne();

    res.status(200).json({ message: "Account verified successfully. You can now login." });
 });
 /**----------------------------------------------------------------*/