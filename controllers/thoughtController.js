const { ObjectId } = require('mongoose').Types;
const { User, Thought } = require('../models');

const thoughtController = {
  
  // Get all thoughts
  async getAllThoughts(req, res) {

    try {
      const dbThoughtData = await Thought.find({})
      .select('-__v')
      .sort({ _id: -1 });

      res.json(dbThoughtData);

    } catch (err) {
      console.log(err);
      res.status(400).json(err);
    }
  },

  // Get a single thought by id
  async getSingleThought(req, res) {

    try {
      const dbThoughtData = await Thought.findOne({ _id: req.params.thoughtId })
      .select('-__v')

      if (!dbThoughtData) {
        res.status(404).json({ message: 'No thought found with this id!' });
        return;
      }
      res.json(dbThoughtData);
      
    } catch (err) {
      console.log(err);
      res.status(400).json(err);
    }
  },
  
  // Create a new thought
  async createThought(req, res) {

    try {
      // const dbUserData = await User.findOne({ _id: req.body.userId });

      // console.log("dbUserData: ",dbUserData);

      // if (!dbUserData) {
      //   res.status(404).json({ message: 'No user found with this id!' });
      //   return;
      // }

      
      // const thoughtData = await Thought.create(
      //   {
      //     thoughtText: req.body.thoughtText,
      //     username: dbUserData.username
      //   }
      // );

      const thoughtData = await Thought.create(
        {
          thoughtText: req.body.thoughtText,
          username: req.body.username
        }     
      );
      
      
      console.log("thoughtData: ",thoughtData);

      const newUserData = await User.findOneAndUpdate(
        { _id: req.body.userId },
        { $push: { thoughts: thoughtData._id } },
        { new: true }
      ).select('-__v');

      console.log("newUserData: ",newUserData);

      if (!newUserData) {
        res.status(404).json({ message: 'No user found with this id!' });
        return;
      }
      
      const createThought = {
        thoughtData,
        newUserData
      }

      res.json(createThought);      

    } catch (err) {
      console.log(err);
      res.json(err)
    }
  },

  // Update a thought by id
  async updateThought(req, res) {

    try {
      const dbThoughtData = await Thought.findOneAndUpdate(
        { _id: req.params.thoughtId },
        { $set: req.body },
        { runValidators: true, new: true }
      )  

      if (!dbThoughtData) {
        res.status(404).json({ message: 'No thought found with this id!' });
        return;
      }
      res.json(dbThoughtData);

    } catch (err) {
      console.log(err);
      res.status(400).json(err);
    }
  },    

  // Delete a thought by id
  async deleteThought(req, res) {

    try {
      const deletedThought = await Thought.findOneAndDelete(
        { _id: req.params.thoughtId }
      )

      if (!deletedThought) {
        return res.status(404).json({ message: 'No thought with this id!' });
      }

      const dbUserData = await User.findOneAndUpdate(
        { username: deletedThought.username },
        { $pull: { thoughts: req.params.thoughtId } },
        { new: true }
      )
      .select('-__v');

      if (!dbUserData) {
        res.status(404).json({ message: 'No user found with this id!' });
        return;
      }

      const deleteThought = {
        deletedThought,
        dbUserData
      }

      res.json(deleteThought);

    } catch (err) {
      console.log(err);
      res.json(err)
    }
  },    

  // Add a reaction to a thought
  async addReaction(req, res) {

    try {
      const dbThoughtData = await Thought.findOneAndUpdate(
        { _id: req.params.thoughtId },
        { $push: { reactions: req.body } },
        { runValidators: true, new: true }
      )
      .select('-__v');

      if (!dbThoughtData) {
        res.status(404).json({ message: 'No thought found with this id!' });
        return;
      }

      res.json(dbThoughtData);

    } catch (err) {
      console.log(err);
      res.json(err)
    }
  },   

  // Remove a reaction from a thought
  async removeReaction(req, res) {

    try {
      const dbThoughtData = await Thought.findOneAndUpdate(
        { _id: req.params.thoughtId },
        { $pull: { reactions: { reactionId: req.params.reactionId } } },
        { new: true }
      )
      .select('-__v');

      if (!dbThoughtData) {
        res.status(404).json({ message: 'No thought found with this id!' });
        return;
      }

      res.json(dbThoughtData);

    } catch (err) {
      console.log(err);
      res.json(err)
    }
  }
};


module.exports = thoughtController;

