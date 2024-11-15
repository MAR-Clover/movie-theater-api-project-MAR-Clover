const express = require("express");
const router = express.Router();
const {User, Show} = require("../models/index");
const { check, validationResult } = require("express-validator");

// GET all users
// GET one user
// GET all shows watched by a user (user id in req.params)
// PUT associate a user with a show they have watched

router.get("/",async (req,res) => {
    const users = await User.findAll()
    res.json(users)
})


router.get('/:id',
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }else{
            //returns user
            const user = await User.findByPk(req.params.id)
            res.json(user);
        }
    }
);


//get only shows watched by user with ID in params

router.get("/viewed/:id",
    async(req,res) => {
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            res.status(400).json({error:errors.array()})
        }else{
            //query db for the shows user watched, set it to variable
            //get user first
            
            const user = await User.findByPk(req.params.id, {
                include: {
                    model: Show,
                    through: { attributes: [] },  // Exclude the 'through' table attributes (optional)
                },
            });
            //extract only shows watched by user
            if (!user.shows) {
                return res.status(404).json({ error: 'No shows found for this user' });
            }
            if(user.shows.length === 0){
                return res.status(404).json({ error: 'user has not watched any shows' });
            }
            const viewedShows = user.shows.map(show => ({
                id: show.id,
                title: show.title
            }));

            res.json(viewedShows)
        }
    }
)

router.put("/:id",    
    [
        check("title").not().isEmpty().withMessage("Title is required").trim(),    
    ],
    async (req, res) => {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array() });
        }

        try {
            // Find user by id
            const user = await User.findByPk(req.params.id, {
                include: {
                    model: Show,
                    through: { attributes: [] },  // Exclude the 'through' table attributes (optional)
                },
            });

            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }

            // Find show by title
            const show = await Show.findOne({ where: { title: req.body.title } });

            if (!show) {
                return res.status(404).json({ error: "Show not found" });
            }

            // Add the show to the user's associated shows
            await user.addShow(show);

            // Fetch the user again after the show has been added
            const userAfterShow = await User.findByPk(req.params.id, {
                include: {
                    model: Show,
                    through: { attributes: [] },  // Exclude the 'through' table attributes (optional)
                },
            });

            res.json(userAfterShow);

        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Server error" });
        }
    }
);


module.exports = router