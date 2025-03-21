const Listing = require("../models/listing.js");
const geoCoder = require("../utils/geoCoder.js")

module.exports.index = async (req, res) => {
  const filter = {};

  // Check if search query exists
  if (req.query.search && req.query.search.trim() !== "") {
    const searchTerm = req.query.search.trim();
    
    // Case-insensitive country search (matches partial input)
    filter.country = { $regex: new RegExp(searchTerm, "i") };
  }

  if (req.query.category && req.query.category.trim() !== "") {
    filter.category = req.query.category;
  }
  console.log("Search Filter:", filter); // Debugging to check filters
  const allListings = await Listing.find(filter);
  console.log("Filtered Listings:", allListings.length); // Debugging output
  res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id).populate({path: "reviews", populate:{path: "author",},}).populate("owner");
    if(!listing) {
       req.flash("error", "Listing you requested for does not exist!");
       res.redirect("/listings");
    }
    // console.log(listing);
    res.render("listings/show.ejs", {listing});
};

module.exports.createListing = async (req, res, next) => {
    if (!req.file) {
      req.flash("error", "File upload failed!");
      return res.redirect("/listings");
    }
  
    const url = req.file.path;
    const filename = req.file.filename;
  
    try {
      // Get the text-based location from the form
      const locationInput = req.body.listing.location;
      
      // Geocode the location
      const geoData = await geoCoder.geocode(locationInput);
      console.log("Full GeoData:", geoData);
  
      if (geoData && geoData.length > 0) {
        // If the geocoder response includes a geometry object, use that.
        // Otherwise, extract latitude and longitude and build the geometry manually.
        let geometry = geoData[0].geometry;
        if (!geometry) {
          const latitude = geoData[0].latitude || geoData[0].lat;
          const longitude = geoData[0].longitude || geoData[0].lon;
          geometry = { type: "Point", coordinates: [longitude, latitude] };
        }
        // Attach the geometry to the listing (this stores the coordinates)
        req.body.listing.geometry = geometry;
      } else {
        req.flash("error", "Geocoding failed. Please enter a valid location.");
        return res.redirect("/listings/new");
      }
  
      // Create the new listing with both the text location and the geometry
      const newListing = new Listing(req.body.listing);
      newListing.image = { url, filename };
      newListing.owner = req.user._id;
      newListing.geometry = req.body.listing.geometry;
      

      let savedListing = await newListing.save();
      console.log(savedListing);
      req.flash("success", "New Listing Created!");
      res.redirect("/listings");
    } catch (err) {
      console.error("Error saving listing:", err);
      req.flash("error", err.message || "Something went wrong while saving!");
      return res.redirect("/listings");
    }
};  

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if(!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    res.redirect("/listings");
  }
  res.render("listings/edit.ejs", { listing });
};

module.exports.updateListing = async (req, res) => {
    let {id} = req.params;

    // If location is updated, re-geocode
    if (req.body.listing.location) {
      const locationInput = req.body.listing.location;
      const geoData = await geoCoder.geocode(locationInput);
      console.log("GeoData from update:", geoData);
      if (geoData && geoData.length > 0) {
        const latitude = geoData[0].latitude || geoData[0].lat;
        const longitude = geoData[0].longitude || geoData[0].lon;
        req.body.listing.geometry = { type: "Point", coordinates: [longitude, latitude] };
      } else {
        req.flash("error", "Geocoding failed. Please enter a valid location.");
        return res.redirect(`/listings/${id}/edit`);
      }
    }

    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});

    if (typeof req.file !== "undefined") {
        const url = req.file.path;
        const filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }

    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings"); 
};