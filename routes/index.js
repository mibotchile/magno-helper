const express = require("express");
const router = express.Router();
const appController = require("../controllers/appController");

/*
Route to Add New User.
*/
router.post(
  "/mapfre/insert_clients",
  //appController.validateInput,
  appController.addMapfreCodDocum
);

/*
Route to get Each User
*/
router.get("/mapfre/:userId", appController.getUser);

/*
Route to get All user
*/
router.get("/mapfre_getClients", appController.getUsers);

/*
Route to get Delete All user
*/
router.delete("/mapfre_deleteClients", appController.deleteAllMapfre);

module.exports = router;
