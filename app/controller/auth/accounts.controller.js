const token = require("../../auth");
const db = require("../../models");
var jwt = require("jsonwebtoken");

var mongoose = require("mongoose");
const BarangayMember = db.barangayMember;
const Account = db.account;

exports.registerUser = async (req, res) => {
  let mimeType = req.body.profile_url.match(/[^:]\w+\/[\w-+\d.]+(?=;|,)/)[0];
  console.log(mimeType);
  if (!req.body.email && req.body.uuid) {
    res.status(400).send({ message: "email or password can not be empty!" });
    return;
  }
  const email = req.body.email;
  await Account.exists({ email }, async (err, result) => {
    if (err) {
      console.log(err);
    } else {
      const currentUserId = result;
      if (currentUserId !== null) {
        // if user existed
        console.log(req.body.code);
        console.log("user exist");
        //if code exist
        registerOldUser(req, res);
      } else {
        registerNewUser(req, res);
      }
    }
  });
};
exports.loginUser = async (req, res) => {
  await Account.exists({ uuid: req.params.auth_id }, async (err, result) => {
    if (err) {
      console.log("first Error");
    } else {
      const currentUserId = result;
      if (currentUserId !== null) {
        loginUser(req, res);
      } else {
        console.log("user does not exsit");
        loginNewUser(req, res);
      }
    }
  });
};

exports.accessToken = async (req, res) => {
  console.log(req.get("user-agent"));
  const userAgent = req.get("user-agent");
  const refreshToken = req.body.token;
  const uuid = req.body.uuid;
  // console.log(req.user.auth_id, "test");
  if (refreshToken == null && uuid == null && userAgent == null)
    return res.sendStatus(401);

  await Account.exists({ uuid }, async (err, result) => {
    if (err) {
      res.sendStatus(403);
    } else {
      const currentUserId = result;
      // console.log(result);
      if (currentUserId !== null) {
        Account.find({ uuid: uuid })
          // .populate({ path: "barangays", model: "barangays" })
          .then((barangay) => {
            console.log(barangay[0].access_token);

            // if (barangay[0].access_token == refreshToken) {
            console.log("true");

            jwt.verify(
              barangay[0].refresh_token,
              process.env.REFRESH_TOKEN_SECRET,
              (err, user) => {
                if (err) {
                  console.log(err);

                  return res.sendStatus(403);
                }
                const accessToken = generateAccessToken({
                  auth_id: user.auth_id,
                });

                // Account.findOneAndUpdate(
                //   {
                //     uuid: user.auth_id,
                //   },
                //   {
                //     $set: {
                //       access_token: accessToken,
                //     },
                //   },
                //   { new: true },
                //   (err, doc) => {
                //     if (err) {
                //       return res.status(400).json("Error: " + err);
                //     }
                //     res.json({ accessToken: accessToken });
                //   }
                // );
                console.log(user.auth_id);
                // Account.findOneAndUpdate(
                //   {
                //     uuid: user.auth_id,
                //     "sessions.user_agent": userAgent,
                //   },
                //   {
                //     $set: {
                //       "sessions.$.access_token": accessToken,
                //     },
                //   },
                //   { new: true, upsert: true },
                //   (err, _) => {
                //     if (err) {
                //       return res.status(400).json("Error: " + err);
                //     }
                //     res.json({ accessToken: accessToken });
                //   }
                // );
                Account.updateOne(
                  { uuid: user.auth_id, "sessions.access_token": refreshToken },
                  {
                    $set: {
                      "sessions.$.access_token": accessToken,
                    },
                  },
                  { new: true, upsert: true },
                  (err, _) => {
                    if (err) {
                      return res.status(400).json("Error: " + err);
                    }
                    res.json({ accessToken: accessToken });
                  }
                );
              }
            );
            // } else {
            //   return res.sendStatus(401);
            // }
          })
          .catch((err) => res.status(400).json("Error: " + err));
        // if user existed
        console.log("user exist");
      } else {
        console.log("user not exist");
      }
    }
  });
};

exports.logOut = async (req, res) => {
  if (req.session_token) return res.sendStatus(404);
  const session_token = req.body.session_token;

  return await Account.findOneAndUpdate(
    { uuid: req.user.auth_id },
    {
      $pull: {
        sessions: {
          access_token: session_token,
        },
      },
    },
    { new: true, multi: true }
  )
    .then((account) => res.json("logout successful"))
    .catch((err) => res.status(400).json("Error: " + err));
};

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "30m" });
}
function generateAccessTokenLogin(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "24h" });
}

async function registerOldUser(req, res) {
  if (req.body.code) {
    return res.status(200).json("code");
  } else {
    //if code does not  already exist

    Account.find({ uuid: req.body.uuid })
      .select({ first_time: 3, members: 2, barangays: 1, _id: 0 })
      .populate({
        path: "barangays",
        model: "barangays",
        select: [
          "_id",
          "barangay_name",
          "municipality",
          "province",
          "country",
          "address",
        ],
      })
      .populate({
        path: "members",
        model: "barangay_members",
        select: ["_id", "role", "email", "barangay_id"],
      })
      .then((barangay) => {
        console.log(barangay);

        const users = {
          auth_id: req.body.uuid,
          barangays: barangay[0].barangays,
          members: barangay[0].members,
          first_time: barangay[0].first_time,
        };

        console.log(barangay);
        console.log(barangay[0].email);

        const accessToken = generateAccessTokenLogin(users);
        const refreshToken = jwt.sign(users, process.env.REFRESH_TOKEN_SECRET);

        Account.findOneAndUpdate(
          {
            uuid: req.body.uuid,
          },
          {
            $push: {
              sessions: [
                {
                  user_agent: req.get("user-agent"),
                  access_token: accessToken,
                  refresh_token: refreshToken,
                },
              ],
            },
          },
          { new: true },
          (err, _) => {
            if (err) {
              return res.status(400).json("Error: " + err);
            }

            return res.json(accessToken);
          }
        );
      })
      .catch((err) => res.status(400).json("Error: " + err));
  }
}
async function registerNewUser(req, res) {
  var id = new mongoose.Types.ObjectId();
  let mimeType = req.body.profile_url.match(/[^:]\w+\/[\w-+\d.]+(?=;|,)/)[0];
  let join_last_name = "";
  let join_first_name = "";
  if (req.body.user != null) {
    const splitUser = req.body.user;
    let last_name = [];
    const namelist = splitUser.split(" ");
    join_first_name = namelist[0];
    for (let i = 1; i <= namelist.length; i++) {
      last_name.push(namelist[i]);
    }
    join_last_name = last_name.join(" ");
  }

  console.log("new account");
  const users = new Account({
    _id: id,
    uuid: req.body.uuid,
    email: req.body.email,
    first_time: true,
    full_name: req.body.user,
    first_name: join_first_name,
    last_name: join_last_name,
    profileUrl: {
      contentType: mimeType,
      data: new Buffer.from(req.body.profile_url, "base64"),
    },
  });

  await users
    .save(users)
    .then(async (_) => {
      if (req.body.code) {
        //insert code
        res.json("new code");
      } else {
        console.log(req.body.uuid, "uid");
        const users = {
          auth_id: req.body.uuid,
          barangays: [],
          members: [],
          first_time: true,
        };
        const accessToken = generateAccessTokenLogin(users);
        const refreshToken = jwt.sign(users, process.env.REFRESH_TOKEN_SECRET);

        Account.findOneAndUpdate(
          {
            uuid: req.body.uuid,
          },
          {
            $push: {
              sessions: [
                {
                  user_agent: req.get("user-agent"),
                  access_token: accessToken,
                  refresh_token: refreshToken,
                },
              ],
            },
          },
          { new: true },
          (err, _) => {
            if (err) {
              return res.status(400).json("Error: " + err);
            }
            return res.json(accessToken);
          }
        );
      }
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Account.",
      });
    });
}
async function loginUser(req, res) {
  Account.find({ uuid: req.params.auth_id })
    // .populate({ path: "barangays", model: "barangays" })
    .select({ first_time: 3, members: 2, barangays: 1, _id: 0 })
    .populate({
      path: "barangays",
      model: "barangays",
      select: [
        "_id",
        "barangay_name",
        "municipality",
        "province",
        "country",
        "address",
      ],
    })
    .populate({
      path: "members",
      model: "barangay_members",
      select: ["_id", "role", "email", "barangay_id"],
    })

    .then((barangay) => {
      console.log(barangay);
      console.log(barangay[0].email);
      const users = {
        auth_id: req.params.auth_id,
        barangays: barangay[0].barangays,
        members: barangay[0].members,
        first_time: barangay[0].first_time,
      };
      const accessToken = generateAccessTokenLogin(users);
      const refreshToken = jwt.sign(users, process.env.REFRESH_TOKEN_SECRET);

      Account.findOneAndUpdate(
        {
          uuid: req.params.auth_id,
        },
        {
          $push: {
            sessions: [
              {
                user_agent: req.get("user-agent"),
                access_token: accessToken,
                refresh_token: refreshToken,
              },
            ],
          },
        },
        { new: true },
        (err, _) => {
          if (err) {
            return res.status(400).json("Error: " + err);
          }

          return res.json(accessToken);
        }
      );
    })
    .catch((err) => res.status(400).json("Error: " + err));
}
async function loginNewUser(req, res) {
  var id = new mongoose.Types.ObjectId();
  let mimeType = req.body.profile_url.match(/[^:]\w+\/[\w-+\d.]+(?=;|,)/)[0];
  let join_last_name = "";
  let join_first_name = "";
  if (req.body.user != null) {
    const splitUser = req.body.user;
    let last_name = [];
    const namelist = splitUser.split(" ");
    join_first_name = namelist[0];
    for (let i = 1; i <= namelist.length; i++) {
      last_name.push(namelist[i]);
    }
    join_last_name = last_name.join(" ");
  }

  console.log("new account");
  const users = new Account({
    _id: id,
    uuid: req.params.auth_id,
    email: req.body.email,
    first_time: true,
    full_name: req.body.user,
    first_name: join_first_name,
    last_name: join_last_name,
    profileUrl: {
      contentType: mimeType,
      data: new Buffer.from(req.body.profile_url, "base64"),
    },
  });

  await users
    .save(users)
    .then(async (_) => {
      if (req.body.code) {
        //insert code
        res.json("new code");
      } else {
        console.log(req.params.auth_id, "uid");
        const users = {
          auth_id: req.params.auth_id,
          barangays: [],
          members: [],
          first_time: true,
        };
        const accessToken = generateAccessTokenLogin(users);
        const refreshToken = jwt.sign(users, process.env.REFRESH_TOKEN_SECRET);

        Account.findOneAndUpdate(
          {
            uuid: req.params.auth_id,
          },
          {
            $push: {
              sessions: [
                {
                  user_agent: req.get("user-agent"),
                  access_token: accessToken,
                  refresh_token: refreshToken,
                },
              ],
            },
          },
          { new: true },
          (err, _) => {
            if (err) {
              return res.status(400).json("Error: " + err);
            }
            return res.json(accessToken);
          }
        );
      }
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Account.",
      });
    });
}
