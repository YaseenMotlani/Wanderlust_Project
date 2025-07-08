const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");


const multer  = require('multer');
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage });


// Index Route``
router.get("/", wrapAsync(async(req, res) => { 
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}));


// New Rote
router.get("/new", isLoggedIn, (req, res) =>{
    res.render("listings/new.ejs");
});


// SHow Route
router.get("/:id", wrapAsync(async (req, res) => {
    let { id }= req.params;
    const listing = await Listing.findById(id)
        .populate("reviews")
        .populate("owner");

    console.log("Listing Owner:", listing.owner);
    res.render("listings/show.ejs", { listing });

}));

//Create Route
// .post("/listings", async (req, res) =>{
//     const newListing = new Listing(req.body.listing);
//     await newListing.save();
//     res.redirect("/listings");
// });

router.post("/", 
    isLoggedIn,
    validateListing, 
    upload.single("listing[image]"),
    wrapAsync(async (req, res, next) => {
        let url = req.file.path;
        let filename = req.file.filename;

        if (!req.body.listing) {
            throw new ExpressError(400,"Send valid data for listing");
        };

        const data = req.body.listing;

        const newListing = new Listing({
            ...data,
            image: {
                url: data.image,
                filename: "manual"
             }
        });

        newListing.owner = req.user._id;
        newListing.image = { url, filename };
        await newListing.save();
        req.flash("success", "New Listing Created!");
        res.redirect(`/listings/${newListing._id}`); 
}));
    // router.post( "/", upload.single('listing[image]'), (req, res) => {
    //     res.send(req.file);
    // });

//Edit Route
router.get("/:id/edit",  isLoggedIn, isOwner ,wrapAsync(async (req, res) =>{
        let { id } = req.params;
        const listing = await Listing.findById(id);
        res.render("listings/edit.ejs", { listing });
}));

//Update Route
// app.put("/listings/:id", async (req, res) => {
//     let { id } = req.params;
//     await Listing.findByIdAndUpdate(id, {...req.body.listing });
//     res.redirect(`/listings/${id}`);
// });

router.put("/:id", isLoggedIn, isOwner , upload.single("listing[image]"), wrapAsync(async (req, res) => {
    if (!req.body.listing) {
        throw new ExpressError(400,"Send valid data for listing");
    };

    const { id } = req.params;
    const data = req.body.listing;
    const listing = await Listing.findById(id);

    listing.title = data.title;
    listing.description = data.description;
    listing.price = data.price;
    listing.location = data.location;
    listing.country = data.country;

    // if (data.image) {
    //     listing.image = {
    //         url: data.image,
    //         filename: "manual"
    //     };
    // }
    if (typeof req.file !== "undefined") {
        const url = req.file.path;
        const filename = req.file.filename;
        listing.image = { url, filename };
    }

    await listing.save();

    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);

}));

// DELETE ROUTEro
 router.delete("/:id", isLoggedIn, isOwner ,wrapAsync(async (req, res) =>{
    let {id} = req.params;
    let deleteListing = await Listing.findByIdAndDelete(id);
    console.log(deleteListing);
    res.redirect("/listings");
}));

module.exports = router;