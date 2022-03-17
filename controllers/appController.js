const axios = require("axios");
const https = require("https");
// Require Redis Here
const redis = require("redis");

// Connect to our Database
const client = redis.createClient(
  process.env.REDIS_PORT,
  process.env.REDIS_HOST
);

const md5 = require("md5");
const async = require("async");

const baseUrlMagno = process.env.API_ESTRATEGIAS_URL;

function getJsonData(req, res) {
  const urlEndpoint = `${baseUrlMagno}/v1/external/redis/getData`;
  const config = {
    method: "get",
    url: urlEndpoint,
    httpsAgent: new https.Agent({ rejectUnauthorized: false }),
  };

  axios
    .request(config)
    .then(function (response) {
      // console.log(response.data.data.length);
      // return;
      const jsonResponse = response.data;
      let rows = jsonResponse.data;
      console.log("total insertado---", rows.length);
      for (let document_data of rows) {
        document_data.data = document_data.data.map((poliza) => {
          if (!poliza.ramo.toUpperCase().includes("AUTOMOVILES")) {
            poliza = {
              fecha_vcto: poliza.fecha_vcto,
              nro_poliza: poliza.nro_poliza,
              ramo: poliza.ramo,
              monto_soles: poliza.monto_soles,
              monto_dolares: poliza.monto_dolares,
            };
          }
          return poliza;
        });
        //console.log(document_data);
        addMapfreCodDocum(document_data, res);
      }
      return res.json({
        status: 200,
        message: "all data insert",
      });
    })
    .catch(function (error) {
      console.error(error);
    });
}

/*
Function to Create User
*/
function addMapfreCodDocum(document_data, res) {
  // Get the User Details
  //const newUser = req.body;
  const newUser = document_data;
  // console.log("+++++++++++++++++++++", req);
  // return;
  newUser.id = md5(newUser.cod_docum);
  // Check if user exists
  client.exists(newUser.cod_docum, (err, reply) => {
    if (reply === 1) {
      return res.json({
        status: 400,
        message: "Este coddocum ya existe",
        newUser,
      });
    }
    // Add New User
    client.hmset(
      newUser.id,
      ["cod_docum", newUser.cod_docum, "detail", JSON.stringify(newUser.data)],
      (error, result) => {
        if (error) {
          return res.json({
            status: 400,
            message: "Something went wrong",
            error,
          });
        }
      }
    );
  });
}

/*
Function to get all Users
*/
function getUsers(req, res) {
  client.keys("*", (err, keys) => {
    if (err) {
      return res.json({ status: 400, message: "could not fetch users", err });
    }
    if (keys) {
      async.map(
        keys,
        (key, cb) => {
          client.hgetall(key, (error, value) => {
            if (error)
              return res.json({
                status: 400,
                message: "Something went wrong",
                error,
              });
            //console.log(value);
            const user = {};
            user.userId = key;
            user.data = value;

            cb(null, user);
          });
        },
        (error, users) => {
          if (error)
            return res.json({
              status: 400,
              message: "Something went wrong",
              error,
            });
          console.log("Total consultado-----", users.length);
          res.json(users);
        }
      );
    }
  });
}

/*
Function to get each User
*/
function getUser(req, res) {
  const { userId } = req.params;
  client.hgetall(md5(userId), (err, user) => {
    if (err) {
      return res.json({ status: 400, message: "Something went wrong", err });
    }
    return res.json(user);
  });
}

// Middleware to check user exists before update and Delete
// function checkUserExists(req, res, next) {
//   const { userId } = req.params;
//   client.hgetall(userId, (err, user) => {
//     if (err) {
//       return res.json({ status: 400, message: "Something went wrong", err });
//     }
//     if (!user) {
//       return res.json({ status: 400, message: "Could not find that user" });
//     }
//     next();
//   });
// }

/*
Function to Delete all mapfre
*/
function deleteAllMapfre(req, res) {
  const { userId } = req.params;
  client.flushdb((err, result) => {
    if (err) {
      return res.json({ status: 400, message: "Something went wrong", err });
    }
    return res.json({ status: 200, message: "BD Deleted", result });
  });
}

module.exports = {
  deleteAllMapfre,
  getJsonData,
  addMapfreCodDocum,
  getUsers,
  getUser,
};
