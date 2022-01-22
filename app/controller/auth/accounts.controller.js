const token = require("../../auth");
const db = require("../../models");
var jwt = require("jsonwebtoken");
var mongoose = require("mongoose");
const BarangayMember = db.barangayMember;
const Account = db.account;

exports.registerUser = async (req, res) => {
  var id = new mongoose.Types.ObjectId();
  const email = req.body.email;
  const uuid = req.body.uuid;
  if (!req.body.email && req.body.uuid) {
    res.status(400).send({ message: "email or password can not be empty!" });
    return;
  }

  console.log(id);

  await Account.exists({ uuid }, async (err, result) => {
    if (err) {
      console.log(err);
    } else {
      const currentUserId = result;
      console.log(result);
      if (currentUserId !== null) {
        // if user existed
        console.log(req.body.code);
        console.log("user exist");
        if (req.body.code != "null") {
          // await BarangayMember.find({ email: email })
          //   .then((user) => res.json(user))
          //   .catch((err) => res.status(400).json("Error: " + err));
          return res.status(200).json("code");
        } else {
          return await BarangayMember.find({ email: email })
            .then((user) => {
              const data = { user };
              const accessToken = generateAccessTokenLogin(data);
              console.log(accessToken);
              res.json(accessToken);
            })
            .catch((err) => res.status(400).json("Error: " + err));
        }
      } else {
        const data = {
          _id: id,
          uuid: req.body.uuid,
          email: req.body.email,
          first_time: true,
        };
        const accessToken = generateAccessTokenLogin(data);
        const refreshToken = jwt.sign(data, process.env.REFRESH_TOKEN_SECRET);
        const users = new Account({
          _id: id,
          uuid: req.body.uuid,
          email: req.body.email,
          first_time: true,
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        await users
          .save(users)
          .then(async (_) => {
            if (req.body.code == "null") {
              //insert code
            } else {
              return await BarangayMember.find({ email: email })
                .then((user) => {
                  const data = { user };
                  const accessTokenBarangayMember = generateAccessToken(data);
                  res.json(accessTokenBarangayMember);
                })
                .catch((err) => res.status(400).json("Error: " + err));
            }
          })
          .catch((err) => {
            res.status(500).send({
              message:
                err.message ||
                "Some error occurred while creating the Account.",
            });
          });
      }
    }
  });
};
exports.loginUser = async (req, res) => {
  // Account.find()
  //   .then((users) => {
  //     const accessToken = jwt.sign(users, process.env.ACCESS_TOKEN_SECRET);
  //     console.log(users);
  //     return res.json({ users, accessToken });
  //   })
  //   .catch((err) => {
  //     return res.status(400).json("Error: " + err);
  //   });
  console.log(req.get("user-agent", "ssad"));
  Account.find({ uuid: req.params.auth_id })
    // .populate({ path: "barangays", model: "barangays" })
    .then((barangay) => {
      console.log(barangay[0].email);
      const users = {
        auth_id: req.params.auth_id,
        barangays: barangay[0].barangays,
        members: barangay[0].members,
      };
      const accessToken = generateAccessTokenLogin(users);
      const refreshToken = jwt.sign(users, process.env.REFRESH_TOKEN_SECRET);
      // refreshTokens.push(refreshToken);
      // res.json({});
      // console.log(accessToken);

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
            // access_token: accessToken,
            // refresh_token: refreshToken,
          },
        },
        { new: true },
        (err, doc) => {
          if (err) {
            return res.status(400).json("Error: " + err);
          }
          // const currentActive = [
          //   {
          //     barangay_id: barangayId,
          //     barangay_member_id: barangayMemberId,
          //     uuid: req.body.auth_id,
          //   },
          // ];
          // console.log(doc);
          // res.status(200).json(currentActive);
          return res.json(accessToken);
        }
      );
    })
    .catch((err) => res.status(400).json("Error: " + err));
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

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "30m" });
}
function generateAccessTokenLogin(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "20s" });
}
