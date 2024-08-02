const router = require("express").Router();
const { photoUpload } = require("../middlewares/photoUpload");
const {verifyToken} = require("../middlewares/verifyToken");
const {createPostCtrl, getAllPostsCtrl, getSinglePostCtrl, getPostCountCtrl, deletePostCtrl, updatePostCtrl, updatePosImagetCtrl, toggleLikeCtrl} = require("../controllers/postsController");
const validateObjectId = require("../middlewares/validateObjectId");

// /api/posts
router.route("/")
.post(verifyToken,photoUpload.single("image"),createPostCtrl)
.get(getAllPostsCtrl);

// /api/posts/count
router.route("/count")
.get(getPostCountCtrl);

// /api/posts/:id

router.route("/:id")
.get(validateObjectId, getSinglePostCtrl)
.delete(validateObjectId,verifyToken,deletePostCtrl)
.put(validateObjectId,verifyToken,updatePostCtrl);

// /api/posts/update-image/:id

router.route("/update-image/:id")
.put(validateObjectId,verifyToken,photoUpload.single("image"),updatePosImagetCtrl);

// /api/posts/like/:id
router.route("/like/:id").put(validateObjectId,verifyToken, toggleLikeCtrl);


module.exports = router;