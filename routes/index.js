const express = require("express");
const router = express.Router();
const appController = require("../controllers/appController");

/*Route to get Delete All user*/
router.delete("/mapfre_deleteClients", appController.deleteAllMapfre);

/*Route to Add New User.*/
router.get("/findClientsToProcess", appController.getJsonData);

/*Route to get All user*/
router.get("/mapfre_getClients", appController.getUsers);
// /*
// Route to Add New User.
// */
// router.post(
//   "/mapfre/insert_clients",
//   //appController.validateInput,
//   appController.addMapfreCodDocum
// );

// /*
// Route to get Each User
// */
// router.get("/mapfre/:userId", appController.getUser);

module.exports = router;
