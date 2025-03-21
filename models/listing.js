const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new mongoose.Schema ({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    image: {
        type: Object,
        get: function(value) {
          // If the stored value is an object with a url property, return that URL.
          if (value && typeof value === 'object' && value.url) {
            return value.url;
          }
          return value;
        }
    },
    price: {
        type: Number,
    },
    location: {
        type: String,
        required: true,
    },
    country: {
        type: String,
    },
    geometry: {
        type: {
          type: String,
          enum: ["Point"],
          required: true
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
          required: true
        }
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        },
    ], 
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    category: {
        type: String,
        enum: ["Room", "Mountain", "Castle", "Pool", "Camping", "Farm", "Arctic", "Beachfront", "Tree Houses"]
    },
});



listingSchema.post("findOneAndDelete", async(listing) => {
    if(listing) {
        await Review.deleteMany({_id :{$in: listing.reviews}});
    }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;