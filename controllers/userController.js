const { User, Thought } = require('../models');

const userController = {

  // Get all users
  async getAllUsers(req, res) {

    try {      
      const dbUserData = await User.find({})
      .populate({
        path: 'thoughts',
        select: '-__v'
      })
      .populate({
        path: 'friends',
        select: '-__v'
      })
      .select('-__v');

      res.json(dbUserData);

    } catch (err) {
      console.log(err);
      res.status(400).json(err);      
    }    
  },

  // Get a single user by id
  async getSingleUser(req, res) {    

    try {
      const dbUserData = await User.findOne({ _id: req.params.userId })
      .populate({
        path: 'thoughts',
        select: '-__v'
      })
      .populate({
        path: 'friends',
        select: '-__v'
      })
      .select('-__v');

      if (!dbUserData) {
        res.status(404).json({ message: 'No user found with this id!' });
        return;
      }
      res.json(dbUserData);

    } catch (err) {
      console.log(err);
      res.status(400).json(err);
    }    
  },

  // Create a new user
  async createUser(req, res) {
    try {
      const dbUserData = await User.create(req.body);
      res.json(dbUserData);
    } catch (err) {
      console.log(err);
      res.status(400).json(err);
    }
  },

  // Update a user by id
  async updateUser(req, res) {

    try {
      const dbUserData = await User.findOneAndUpdate(
        { _id: req.params.userId },
        { $set: req.body },
        { runValidators: true, new: true }
      )
      .select('-__v');

      if (!dbUserData) {
        res.status(404).json({ message: 'No user found with this id!' });
        return;
      }

      // Update a user's associated thoughts when username is changed.
      if(req.body.username) {
        const updateThoughtData = await Thought.updateMany(
          { username: dbUserData.username },
          { $set: { username: req.body.username } }
        );
        console.log("updateThoughtData: ",updateThoughtData);

        // Update a user's associated reactions when username is changed.
        const updateReactionData = await Thought.updateMany(
          { "reactions.username": dbUserData.username },
          { $set: { "reactions.$.username": req.body.username } }
        );
        console.log("updateReactionData: ",updateReactionData);        
      }

      res.json(dbUserData);      
      
    } catch (err) {
      console.log(err); 
      res.status(400).json(err);
    }    
  },

  // Delete a user by id
  async deleteUser(req, res) {
    try {

      const dbUserData = await User.findOne({ _id: req.params.userId });

      console.log("dbUserData: ",dbUserData);
      
      if (!dbUserData) {
        res.status(404).json({ message: 'No user found with this id!' });
        return;
      } 

      // Remove a user's associated thoughts when deleted.
      const removedThoughtData = await Thought.deleteMany({ username: dbUserData.username});
            
      console.log("removedThoughtData: ",removedThoughtData);

      // Remove a user's associated reactions when deleted
      const reactionRemovedData = await Thought.updateMany(
        { "reactions.username": dbUserData.username }, 
        { $pull: { reactions: { username: dbUserData.username } } }, 
        { multi: true}
      );

      console.log("reactionRemovedData: ",reactionRemovedData);
      
      const deleteUserData = await User.findOneAndDelete({ _id: req.params.userId });

      if (!deleteUserData) {
        res.status(404).json({ message: 'No user found with this id!' });
        return;
      }

      console.log("deleteUserData: ",deleteUserData);

      const deleteinfo = {
        removedThoughtData,
        reactionRemovedData,
        deleteUserData
      };

      // res.json(deleteUserData);
      res.json(deleteinfo);

    } catch (err) {
      console.log(err);
      res.status(400).json(err);     
    }
  },

  // Add a new friend to a user's friend list
  async addFriend(req, res) {

    try {
      const dbUserData = await User.findOneAndUpdate(
        { _id: req.params.userId },
        { $push: { friends: req.params.friendId } },
        { runValidators: true, new: true }
      )
      .select('-__v');

      if (!dbUserData) {
        res.status(404).json({ message: 'No user found with this id!' });
        return;
      }
      res.json(dbUserData);

    } catch (err) {
      console.log(err);
      res.status(400).json(err);
    }
  },
  

  // Remove a friend from a user's friend list
  async removeFriend(req, res) {

    try {
      const dbUserData = await User.findOneAndUpdate(
        { _id: req.params.userId },
        { $pull: { friends: req.params.friendId } },
        { runValidators: true, new: true }
      )
      .select('-__v');

      if (!dbUserData) {
        res.status(404).json({ message: 'No user found with this id!' });
        return;
      }
      res.json(dbUserData);

    } catch (err) {
      console.log(err);
      res.status(400).json(err);
    }
  }
};

module.exports = userController;
