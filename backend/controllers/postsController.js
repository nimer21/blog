const fs = require("fs");
const path = require("path");
const asyncHandler = require("express-async-handler"); // instead of try and catch
const {
  Post,
  validateCreatePost,
  validateUpdatePost,
} = require("../models/Post");
const {
  cloudinaryUploadImage,
  cloudinaryRemoveImage,
} = require("../utils/cloudinary");
const { Comment } = require("../models/Comment");

/**----------------------------------------------------------------
 * @desc    Create New Post
 * @route  /api/posts
 * @method  POST
 * @access  private (only logged in user)
 ------------------------------------------------------------------*/
module.exports.createPostCtrl = asyncHandler(async (req, res) => {
  // 1. Validation for image
  if (!req.file) {
    return res.status(404).json({ message: "no image provided!" });
  }
  // 2. Validation for data
  const { error } = validateCreatePost(req.body);
  if (error) {
    return res.status(404).json({ message: error.details[0].message });
  }
  // 3. Upload photo
  // // This can also be a remote URL or a base64 DataURI
  const imagePath = path.join(__dirname, `../images/${req.file.filename}`);
  console.log("req.file :  ",req.file); // 
  /**
   * req.file :   {
  fieldname: 'image',
  originalname: '00201092583606 Abdala Elraik.jpg',
  encoding: '7bit',
  mimetype: 'image/jpeg',
  destination: 'C:\\2024.03.21\\Web\\DONE\\Youssef Abbas\\blog-pro\\backend\\images',
  filename: '2024-08-02T15-00-17.829Z00201092583606 Abdala Elraik.jpg',
  path: 'C:\\2024.03.21\\Web\\DONE\\Youssef Abbas\\blog-pro\\backend\\images\\2024-08-02T15-00-17.829Z00201092583606 Abdala Elraik.jpg',
  size: 83518
}
   */
  // Upload to cloudinary
  const result = await cloudinaryUploadImage(req.file.path); // imagePath

  // 4. Create new post and save it to DB
  const post = await Post.create({
    title: req.body.title,
    description: req.body.description,
    category: req.body.category,
    user: req.user.id,
    image: {
      url: result.secure_url,
      publicId: result.public_id,
    },
  });
  /*
    const post = new Post({
        title: req.body.title,
        description: req.body.description,
        image: result.secure_url,
        user: user._id
    });
    await post.save();*/

  // 5. Send response to the client
  res.status(201).json(post);

  // 6. Remove image from the server
  fs.unlinkSync(imagePath);
});
/**----------------------------------------------------------------
 * @desc    Get All  Posts
 * @route  /api/posts
 * @method  GET
 * @access  public
 ------------------------------------------------------------------*/
module.exports.getAllPostsCtrl = asyncHandler(async (req, res) => {
  const POST_PER_PAGE = 3;
  const { pageNumber, category } = req.query;
  let posts;

  if (pageNumber) {
    posts = await Post.find()
      .skip((pageNumber - 1) * POST_PER_PAGE)
      .limit(POST_PER_PAGE)
      .sort({ createdAt: -1 })
      .populate("user", ["-password"]);
  } else if (category) {
    posts = await Post.find({ category }) // in Java Script if Key = Value we write it like this instead of category: category
      .sort({ createdAt: -1 })
      .populate("user", ["-password"]);
  } else {
    posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate("user", ["-password"]);
  }
  res.status(200).json(posts);
});

/**----------------------------------------------------------------
 * @desc    Get Single Post
 * @route  /api/posts/:id
 * @method  GET
 * @access  public
 ------------------------------------------------------------------*/
module.exports.getSinglePostCtrl = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id)
  .populate("user", ["-password"])
  .populate("comments"); // Same as virtual in Post
  if (!post) {
    return res.status(404).json({ message: "post not found!" });
  }
  res.status(200).json(post);
});
/**----------------------------------------------------------------
 * @desc    Get Post Count
 * @route  /api/posts/:id
 * @method  GET
 * @access  public
 ------------------------------------------------------------------*/
module.exports.getPostCountCtrl = asyncHandler(async (req, res) => {
  const count = await Post.countDocuments();
  res.status(200).json(count);
});
/**----------------------------------------------------------------
 * @desc    Delete Post
 * @route  /api/posts/:id
 * @method  DELETE
 * @access  private (only admin or owner of the post)
 ------------------------------------------------------------------*/
module.exports.deletePostCtrl = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ message: "post not found!" });
  }
  if (req.user.isAdmin || req.user.id === post.user.toString()) {
    await Post.findByIdAndDelete(req.params.id);
    await cloudinaryRemoveImage(post.image.publicId);

    // Delete all comments that belong to this post
    await Comment.deleteMany({ postId: post._id });

    res
      .status(200)
      .json({
        message: "post has been deleted successfully!",
        postId: post._id,
      });
  } else {
    res.status(403).json({ message: "access denied, forbidden" });
  }
});
/**----------------------------------------------------------------
 * @desc    Update Post
 * @route  /api/posts/:id
 * @method  PUT
 * @access  private (only owner of the post)
 ------------------------------------------------------------------*/
module.exports.updatePostCtrl = asyncHandler(async (req, res) => {
  // 1. Validation
  const { error } = validateUpdatePost(req.body);
  if (error) {
    return res.status(404).json({ message: error.details[0].message });
  }
  // 2. Get the post from DB and check if post exist
  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ message: "post not found!" });
  }
  // 3. Check if this post belong to logged in user
  if (req.user.id !== post.user.toString()) {
    return res
      .status(403)
      .json({ message: "access denied, you are not allowed" });
  }

  // 4. Update post
  const updatePost = await Post.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
      },
    },
    { new: true }
  ).populate("user", ["-password"])
  .populate("comments");

  // 5. Send response to the client
  res
    .status(200)
    .json({ message: "post has been updated successfully!", post: updatePost });
});

/**----------------------------------------------------------------
 * @desc    Update Post Image
 * @route  /api/posts/update-image/:id
 * @method  PUT
 * @access  private (only owner of the post)
 ------------------------------------------------------------------*/
module.exports.updatePosImagetCtrl = asyncHandler(async (req, res) => {
  // 1. Validation
  if (!req.file) {
    return res.status(404).json({ message: "no image provided" });
  }
  // 2. Get the post from DB and check if post exist
  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ message: "post not found!" });
  }
  // 3. Check if this post belong to logged in user
  if (req.user.id !== post.user.toString()) {
    return res
      .status(403)
      .json({ message: "access denied, you are not allowed" });
  }

  // 4. Delete the old image
  await cloudinaryRemoveImage(post.image.publicId);

  // 5. upload new photo
  const imagePath = path.join(__dirname, `../images/${req.file.filename}`);
  const result = await cloudinaryUploadImage(imagePath);

  // 6. Update the image field in the db
  const updatePost = await Post.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        image: {
          url: result.secure_url,
          publicId: result.public_id,
        },
      },
    },
    { new: true }
  );

  // 7. Send response to the client
  res
    .status(200)
    .json({
      message: "Image post has been updated successfully!",
      post: updatePost,
    });

  // 8. Remove image from the server
  fs.unlinkSync(imagePath);
});
/**----------------------------------------------------------------
 * @desc    Toggle Like
 * @route  /api/posts/like/:id
 * @method  PUT
 * @access  private (only logged in user)
 ------------------------------------------------------------------*/
 module.exports.toggleLikeCtrl = asyncHandler(async (req, res) => {
  const loggedInUser = req.user.id;
  const { id: postId } = req.params; // => Object destruction in JS because we changed the name write like this

  let post = await Post.findById(postId); // req.params.id
  if(!post){
    return res.status(404).json({ message: "post not found!" });
    }
  const isPostAlreadyLiked = post.likes.find((user)=> user.toString() === loggedInUser);
  if(isPostAlreadyLiked) {
    post = await Post.findByIdAndUpdate(postId,{
      $pull: {
        likes: loggedInUser
      }
    },{new: true});
  } else {
    post = await Post.findByIdAndUpdate(postId,{
      $push: {
        likes: loggedInUser
      }
    },{new: true});
  }
  res.status(200).json(post);
 });