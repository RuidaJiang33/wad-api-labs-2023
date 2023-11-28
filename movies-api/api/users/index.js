import express from 'express';
import User from './userModel';

const router = express.Router(); // eslint-disable-line

// Get all users
router.get('/', async (req, res) => {
    const users = await User.find();
    res.status(200).json(users);
});

// register(Create)/Authenticate User
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

router.post('/', async (req, res, next) => {
    try {
        if (req.query.action === 'register') {
            if (!passwordRegex.test(req.body.password)) {
              return res.status(400).json({
                code: 400,
                msg: 'Password must be at least 8 characters long and include at least 1 letter, 1 number, and 1 special character.',
              });
            }
      
            await User(req.body).save();
            res.status(201).json({
                code: 201,
                msg: 'Successful created new user.',
            });
      }
      else { 
          const user = await User.findOne(req.body);
          if (!user) {
              return res.status(401).json({ code: 401, msg: 'Authentication failed' });
          } else {
              return res.status(200).json({ code: 200, msg: "Authentication Successful", token: 'TEMPORARY_TOKEN' });
          }
      }
    } catch (err) {
      if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map((el) => el.message);
        return res.status(400).json({ code: 400, msg: `Validation error: ${errors.join(', ')}` });
      }
      next(err);
    }
  });

// Update a user
router.put('/:id', async (req, res) => {
  if (req.body._id) delete req.body._id;
  const result = await User.updateOne({
      _id: req.params.id,
  }, req.body);
  if (result.matchedCount) {
      res.status(200).json({ code:200, msg: 'User Updated Sucessfully' });
  } else {
      res.status(404).json({ code: 404, msg: 'Unable to Update User' });
  }
});

export default router;