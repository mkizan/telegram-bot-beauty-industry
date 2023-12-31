const express = require("express");
const User = require("../model/User");
const router = express.Router();

// route from telegram webhook for get all users
router.get("/", async (_, res) => {
  const users = await User.findAll();
  res.status(200).send(users);
});

// route from telegram webhook for get one user
router.get("/:id", async (req, res) => {
  const requestedId = req.params.id;
  const user = await User.findOne({ where: { id: requestedId } });
  res.status(200).send(user);
});

// route from telegram webhook for create user
router.post("/", async (req, res) => {
  await User.create(req.body);
  res.status(201).send("User was inserted");
});

// route from telegram webhook for update user
router.put("/:id", async (req, res) => {
  const requestedId = req.params.id;
  const user = await User.findOne({ where: { id: requestedId } });
  user.first_name = req.body.first_name;
  await user.save();
  res.status(200).send("updated");
});

// route from telegram webhook for update user
router.delete("/:id", async (req, res) => {
  const requestedId = req.params.id;
  await User.destroy({ where: { id: requestedId } });
  res.status(200).send("removed");
});

module.exports = router;
