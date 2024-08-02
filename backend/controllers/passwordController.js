const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");

const { User, validateEmail, validateNewPassword } = require("../models/User");
const VerificationToken = require("../models/VerificationToken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");


/**----------------------------------------------------------------
 * @desc    Send Reset Password Link
 * @route  /api/password/reset-password-link
 * @method  POST
 * @access  public
 ------------------------------------------------------------------*/
 module.exports.sendResetPasswordLinkCtrl = asyncHandler(async (req, res) => {
    // 1. Validation
    // 2. Get the user from DB by email
    // 3. Creating VerificationToken
    // 4. Creating link
    // 5. Creating HTML template
    // 6. Sending Email
    // 7. Response to the client

    const { email } = req.body;

    // Validate email
    const { error } = validateEmail(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    // Check if user exists
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    // Generate verification token
    let verificationToken = await VerificationToken.findOne({ userId: user._id });
    if(!verificationToken) {
        verificationToken = new VerificationToken({
            userId: user._id,
            token: crypto.randomBytes(32).toString("hex"),
        });
        await verificationToken.save();
    }


const link = `${process.env.CLIENT_DOMAIN}/reset-password/${user._id}/${verificationToken.token}`;

const htmlTemplate = `<a href="${link}">Click here to reset your password</a>`;

await sendEmail(user.email, "Reset Password", htmlTemplate);

    // Save token to database
    //await verificationToken.save();

    // Send email with verification link

    res.status(200).json({
        message: "Reset password link sent successfully"
    })
});

/**----------------------------------------------------------------
 * @desc    Get Reset Password Link
 * @route  /api/password/reset-password/:userId/:token
 * @method  GET
 * @access  public
 ------------------------------------------------------------------*/
 module.exports.getResetPasswordLinkCtrl = asyncHandler(async (req, res) => {
    // 1. Validation
    // 2. Check if user exists and token is valid
    // 3. If valid, render reset password page
    // 4. If not valid, return an error

    //const { userId, token } = req.params;

    const user = await User.findById(req.params.userId);
    if(!user) {
        return res.status(404).json({ message: "User not found - Invalid Link" });
    }

    // Validate token
    const verificationToken = await VerificationToken.findOne({ 
        userId: user._id,
        token: req.params.token,
     });

    if (!verificationToken) {
        return res.status(400).json({ message: "Invalid token" });
    }

    res.status(200).json({ message: "Reset password link is valid" });
});

/**----------------------------------------------------------------
 * @desc    Reset Password
 * @route  /api/password/reset-password/:userId/:token
 * @method  POST
 * @access  public
 ------------------------------------------------------------------*/
 module.exports.resetPasswordCtrl = asyncHandler(async (req, res) => {
    // 1. Validation
    // 2. Check if user exists and token is valid
    // 3. If valid, render reset password page
    // 4. If not valid, return an error

    const { error } = validateNewPassword(req.body);
    if(error) {
        return res.status(404).json({ message: error.details[0].message });
    }
    const user = await User.findById(req.params.userId);
    if(!user) {
        return res.status(404).json({ message: "User not found - Invalid Link" });
    }
    // Validate token
    const verificationToken = await VerificationToken.findOne({ 
        userId: user._id,
        token: req.params.token,
     });
     if (!verificationToken) {
        return res.status(400).json({ message: "Invalid token" });
    }
    if(!user.isAccountVerified) {
        user.isAccountVerified = true;
    }
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    // Update user password
    user.password = hashedPassword;
    await user.save();
    // Delete verification token
    await VerificationToken.deleteOne({ userId: user._id });


    res.status(200).json({ message: "Reset password link is valid" });
});