const mongoose = require("mongoose");
const Joi = require("joi");

// Comment Schema
const CommentSchema = new mongoose.Schema({ 
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    text: {
        type: String,
        required: true,
        trim: true,
        minlenght: 2,
        maxlenght: 200,
    },
    username: {
        type: String,
        required: true,
    }
}, {
    timestamps: true,
});

// Comment Model
const Comment = mongoose.model("Comment", CommentSchema); // mongoose added s Comment = > Comments as other Models post & user ..

// Validate Create Comment

function validateCreateComment(obj) {
    const schema = Joi.object({
        postId: Joi.string().required().label("Post ID"),
        text: Joi.string().trim().min(2).max(200).required().label("Comment text"),
    });
    return schema.validate(obj);
}

// Validate Update Comment

function validateUpdateComment(obj) {
    const schema = Joi.object({
        text: Joi.string().trim().min(2).max(200).required(),
    });
    return schema.validate(obj);
}

module.exports = {
    Comment,
    validateCreateComment,
    validateUpdateComment,
}