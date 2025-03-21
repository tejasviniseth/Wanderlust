const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listing.js");
const multer = require('multer');
const { storage } = require('../cloudConfig.js'); 
const upload = multer({ storage });

router.route("/")
    .get(wrapAsync(listingController.index))
    .post(
        isLoggedIn,
        upload.single("listing[image]"),
        (req, res, next) => {
          if (!req.file) {
            return res.status(400).send("File upload failed!");
          }
          next();
        },
        validateListing,  // Updated version
        (req, res, next) => {
          next();
        },
        listingController.createListing
    );

//New Route
router.get("/new", isLoggedIn, listingController.renderNewForm);

//Edit Route
router.get("/:id/edit",isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

//Update Route
router.route("/:id")
    .get( wrapAsync(listingController.showListing))
    .put(isLoggedIn, isOwner, upload.single("listing[image]"), validateListing, wrapAsync(listingController. updateListing))
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

module.exports = router;