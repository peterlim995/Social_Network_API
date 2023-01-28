const { User, Thought } = require('../models');

const userController = {

  // Get all users
  getAllUsers(req, res) {
    User.find({})
      .select('-__v')
      .then((dbUserData) => res.json(dbUserData))
      .catch((err) => {
        console.log(err);
        res.status(400).json(err);
      });
  },

  // Get a single user by id
  getSingleUser(req, res) {    
    User.findOne({ _id: req.params.userId })
      .populate({
        path: 'thoughts',
        select: '-__v'
      })
      .populate({
        path: 'friends',
        select: '-__v'
      })
      .select('-__v')
      .then((dbUserData) => {
        if (!dbUserData) {
          res.status(404).json({ message: 'No user found with this id!' });
          return;
        }
        res.json(dbUserData);
      })
      .catch((err) => {
        console.log(err);
        res.status(400).json(err);
      });
  },

  // Create a new user
  createUser(req, res) {
    User.create(req.body)
      .then((dbUserData) => res.json(dbUserData))
      .catch((err) => {
        console.log(err);
        res.status(400).json(err)
      });
  },

  // Update a user by id
  updateUser(req, res) {
    User.findOneAndUpdate(
      { _id: req.params.userId },
      { $set: req.body },
      { runValidators: true, new: true }
    )
      .then((dbUserData) => {
        if (!dbUserData) {
          res.status(404).json({ message: 'No user found with this id!' });
          return;
        }
        res.json(dbUserData);
      })
      .catch((err) => {
        console.log(err);
        res.status(400).json(err);
      });
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
  addFriend(req, res) {
    User.findOneAndUpdate(
      { _id: req.params.userId },
      { $push: { friends: req.params.friendId } },
      { runValidators: true, new: true }
    )       
      .then((dbUserData) => {
        if (!dbUserData) {
          res.status(404).json({ message: 'No user found with this id!' });
          return;
        }
        res.json(dbUserData);
      })
      .catch((err) => {
        console.log(err);
        res.status(400).json(err);
      });
  },

  // Remove a friend from a user's friend list
  removeFriend(req, res) {
    User.findOneAndUpdate(
      { _id: req.params.userId },
      { $pull: { friends: req.params.friendId } },
      { runValidators: true, new: true }
    )
      .then((dbUserData) => {
        if (!dbUserData) {
          res.status(404).json({ message: 'No user found with this id!' });
          return;
        }
        res.json(dbUserData);
      })
      .catch((err) => {
        console.log(err);
        res.status(400).json(err);
      });
  }
};

module.exports = userController;
