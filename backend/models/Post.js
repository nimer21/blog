const mongoose = require("mongoose");
const joi = require("joi");

// Post Schema
const PostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        minlenght: 2,
        maxlenght: 200,
    },
    description: {
        type: String,
        required: true,
        trim: true,
        minlenght: 10,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    image: {
        type: Object,
        default: {
            url: "",
            public_id: null,
        }
    },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }
    ]
},
    {
        timestamps: true,
        toJSON: {virtuals: true},
        toObject: {virtuals: true},
    });

    //Populate Comment For Thid Post
    PostSchema.virtual("comments", { // Same as populate in postController
        ref: "Comment",
        localField: "_id",
        foreignField: "postId",
    });

    // Post Model
    const Post = mongoose.model("Post", PostSchema);

    // Validate Create Post
    function validateCreatePost(obj) {
        const schema = joi.object({
            title: joi.string().trim().min(2).max(200).required(),
            description: joi.string().trim().min(10).required(),
            category: joi.string().trim().required(),
        });
        return schema.validate(obj);
    }
     // Validate Update Post
     function validateUpdatePost(obj) {
        const schema = joi.object({
            title: joi.string().trim().min(2).max(200),
            description: joi.string().trim().min(10),
            category: joi.string().trim(),
        });
        return schema.validate(obj);
    }
    module.exports = {
        Post,
        validateCreatePost,
        validateUpdatePost,
    }