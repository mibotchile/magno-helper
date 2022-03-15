// Require Redis Here
const redis = require("redis");

// Connect to our Database
const client = redis.createClient(
  process.env.REDIS_PORT,
  process.env.REDIS_HOST
);

const md5 = require("md5");
const async = require("async");

/*
Function to Create User
*/
exports.addMapfreCodDocum = (req, res) => {
  // Get the User Details
  const newUser = req.body;
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
        return res.json({
          result,
          status: 200,
          message: "User Created",
          newUser,
        });
      }
    );
  });
};

/*
Function to get all Users
*/
exports.getUsers = (req, res) => {
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
            console.log(value);
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
          res.json(users);
        }
      );
    }
  });
};

/*
Function to get each User
*/
exports.getUser = (req, res) => {
  const { userId } = req.params;
  client.hgetall(md5(userId), (err, user) => {
    if (err) {
      return res.json({ status: 400, message: "Something went wrong", err });
    }
    return res.json(user);
  });
};

// Middleware to check user exists before update and Delete
exports.checkUserExists = (req, res, next) => {
  const { userId } = req.params;
  client.hgetall(userId, (err, user) => {
    if (err) {
      return res.json({ status: 400, message: "Something went wrong", err });
    }
    if (!user) {
      return res.json({ status: 400, message: "Could not find that user" });
    }
    next();
  });
};

/*
Function to Delete all mapfre
*/
exports.deleteAllMapfre = (req, res) => {
  const { userId } = req.params;
  client.flushdb((err, result) => {
    if (err) {
      return res.json({ status: 400, message: "Something went wrong", err });
    }
    return res.json({ status: 200, message: "BD Deleted", result });
  });
};
