const express = require("express");
const router = express.Router();
const {User, Show} = require("../models/index");
const { check, validationResult } = require("express-validator");

// GET all shows
// GET one show
// GET all users who watched a show
// PUT update the available property of a show
// DELETE a show
// GET shows of a particular genre (genre in req.query)

router.get("/",async (req,res) => {
    const show = await Show.findAll()
    res.json(show)
})


router.get('/:id',
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }else{
            //returns user
            const show = await Show.findByPk(req.params.id)
            res.json(show);
        }
    }
);


// GET all users who watched a show

router.get("/viewed/:id",
    async(req,res) => {
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            res.status(400).json({error:errors.array()})
        }else{
            //query db for a show and the users that watched it, set it to variable
            //get user first
            
            const show = await Show.findByPk(req.params.id, {
                include: {
                    model: User,
                    through: { attributes: [] },  // Exclude the 'through' table attributes (optional)
                },
            });
            //extract only the users who watched that show
            if (!show.users) {
                return res.status(404).json({ error: 'no users property found for this show' });
            }
            if(show.users.length === 0){
                return res.status(404).json({ error: 'show has no views from users' });
            }
            const showViewers = show.users.map(users => ({
                username: users.username,
                password: users.password
            }));

            res.json(showViewers)
        }
    }
)


// PUT update the available property of a show

router.put("/:id/available",    
    [
        check("available").not().isEmpty().withMessage("Availability is required").isBoolean().withMessage("Availability must be a boolean")
    ],
    async (req, res) => {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array() });
        }else{
                        // Find show by id
            const show = await Show.findByPk(req.params.id, {
                include: {
                    model: User,
                    through: { attributes: [] },  // Exclude the 'through' table attributes (optional)
                },
            });
            if (!show) {
                return res.status(404).json({ error: "show not afound" });
            }

            //update show's availability
            await show.update({available:req.body.available})

            const updatedShow = await Show.findByPk(req.params.id);
            
            res.json(updatedShow);
        } 
    }
);


router.delete("/:id",
    async(req,res) => {
        try{
            //delete show
            //console.log(" DELETE SHOWS TESTING")
            await Show.destroy({where:{id:req.params.id}})
            const shows = await Show.findAll();
            res.status(200).json(shows)
           
        }catch(error){
           // console.log(" DELETE SHOWS ERROR TESTING")
            res.status(400).json({error: "failed to delete show"})
        }
    }
)

router.get("/genre/:genre", async (req, res) => {
    const genre = req.params.genre;

    

    try {
        const shows = await Show.findAll({ where: { genre } });
 

        if (!shows.length) {
            return res.status(204).send(); // if no shows match the genre
        }

        res.json(shows);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve shows by genre" });
    }
});






module.exports = router