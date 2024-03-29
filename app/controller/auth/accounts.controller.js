const token = require("../../auth");
const db = require("../../models");
const geoip = require("fast-geoip");
var jwt = require("jsonwebtoken");
var request = require("request").defaults({ encoding: null });
var mongoose = require("mongoose");

const Account = db.account;
let colortag = [
  "#0085c3",
  "#7ab800",
  "#f2af00",
  "#dc5034",
  "#ce1126",
  "#0085c3",
  "#FF1493",
  "#AA47BC",
];

exports.registerUser = async (req, res) => {
  // let mimeType = req.body.profile_url.match(/[^:]\w+\/[\w-+\d.]+(?=;|,)/)[0];
  // console.log(mimeType);
  if (!req.body.email && req.body.uuid) {
    res.status(400).send({ message: "email or password can not be empty!" });
    return;
  }
  const email = req.body.email;
  await Account.exists({ email }, async (err, result) => {
    if (err) {
      console.log(err);
      return res.status(400).json("Email or User not found");
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
      return res.sendStatus(404);
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
  // console.log(req.get("user-agent"));
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
          // .populate({ path: "organizations", model: "organizations" })
          .then((organization) => {
            // if (organization[0].access_token == refreshToken) {

            jwt.verify(
              organization[0].refresh_token,
              process.env.REFRESH_TOKEN_SECRET,
              (err, user) => {
                if (err) {
                  console.log(err);

                  return res.sendStatus(403);
                }
                const accessToken = generateAccessToken({
                  auth_id: user.auth_id,
                });

                console.log(user.auth_id);

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
        return res.status(400).json("user does not exist");
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

exports.deactiaveAccount = async (req, res) => {
  try {
    await Account.findOneAndUpdate(
      {
        uuid: req.user.auth_id,
      },
      {
        $set: {
          is_deactivate: true,
        },
      },
      { new: true }
    );

    return res.status(200).json("Deactivation Successful");
  } catch (error) {
    return res.status(400).json("Error: " + error.message);
  }
};

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "30m" });
}
function generateAccessTokenLogin(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "24h" });
}
// edit this four tomorrow to make a dynamic profile
async function registerOldUser(req, res) {
  const geolocation = (await geoip.lookup(req.user.ipv4)) || "";

  if (req.body.code) {
    return res.status(200).json("code");
  } else {
    //if code does not  already exist

    Account.find({ uuid: req.body.uuid })
      .select({
        profileUrl: 5,
        profileLogo: 4,
        first_time: 3,
        members: 2,
        organizations: 1,
        _id: 0,
      })
      .populate({
        path: "organizations",
        model: "organizations",
        select: [
          "_id",
          "organization_name",
          "municipality",
          "province",
          "country",
          "address",
        ],
      })
      .populate({
        path: "members",
        model: "organization_members",
        select: ["_id", "role", "email", "organization_id"],
      })
      .then((organization) => {
        console.log(organization);
        const users = {
          auth_id: req.body.uuid,
          profileLogo: organization[0].profileLogo,
          organizations: organization[0].organizations,
          members: organization[0].members,
          first_time: organization[0].first_time,
        };

        const accessToken = generateAccessTokenLogin(users);
        const refreshToken = jwt.sign(users, process.env.REFRESH_TOKEN_SECRET);

        Account.findOneAndUpdate(
          {
            uuid: req.body.uuid,
          },
          {
            $set: {
              is_deactivate: false,
            },
            $push: {
              sessions: [
                {
                  user_agent: req.get("user-agent"),
                  access_token: accessToken,
                  refresh_token: refreshToken,
                  host: req.user.ipv4,
                  country: geolocation.country,
                  city: geolocation.city,
                  os: req.user.platform,
                  browser: req.user.browser,
                },
              ],
            },
          },
          { new: true },
          (err, _) => {
            if (err) {
              return res.status(400).json("Error: " + err);
            }

            return res.json({
              accessToken,
              profileUrl: organization[0].profileUrl.data,
            });
          }
        );
      })
      .catch((err) => res.status(400).json("Error: " + err));
  }
}
async function registerNewUser(req, res) {
  const date = new Date()
    .toISOString()
    .replace(/T/, " ") // replace T with a space
    .replace(/\..+/, "");
  let base64data = null;
  const geolocation = (await geoip.lookup(req.user.ipv4)) || "";
  const random = Math.floor(Math.random() * colortag.length);
  const randomUser = `user-${makeid(8)}`;
  var id = new mongoose.Types.ObjectId();
  let join_last_name = "";
  let join_first_name = "";
  let mimeType;
  let users = {};
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
  request.get(req.body.profile_url, async function (error, response, body) {
    if (!error && response.statusCode == 200) {
      let base64data =
        "data:" +
        response.headers["content-type"] +
        ";base64," +
        Buffer.from(body).toString("base64");
      // console.log(base64data);
      mimeType = base64data.match(/[^:]\w+\/[\w-+\d.]+(?=;|,)/)[0];

      users = new Account({
        _id: id,
        uuid: req.body.uuid,
        email: req.body.email,
        first_time: true,
        full_name: req.body.user || randomUser,
        first_name: join_first_name,
        last_name: join_last_name,
        profileUrl: {
          contentType: mimeType,
          data: req.body.profile_url,
        },
        profileLogo: colortag[random],
      });
    } else {
      users = new Account({
        _id: id,
        uuid: req.body.uuid,
        email: req.body.email,
        first_time: true,
        full_name: req.body.user || randomUser,
        first_name: join_first_name,
        last_name: join_last_name,
        profileLogo: colortag[random],
      });
    }

    await users
      .save(users)
      .then(async (_) => {
        if (req.body.code) {
          //insert code
          res.json("new code");
        } else {
          const users = {
            profileLogo: colortag[random],
            auth_id: req.body.uuid,
            organizations: [],
            members: [],
            first_time: true,
            full_name: randomUser,
          };
          const accessToken = generateAccessTokenLogin(users);
          const refreshToken = jwt.sign(
            users,
            process.env.REFRESH_TOKEN_SECRET
          );

          Account.findOneAndUpdate(
            {
              uuid: req.body.uuid,
            },
            {
              $set: {
                is_deactivate: false,
              },
              $push: {
                sessions: [
                  {
                    user_agent: req.get("user-agent"),
                    access_token: accessToken,
                    refresh_token: refreshToken,
                    host: req.user.ipv4,
                    country: geolocation.country,
                    city: geolocation.city,
                    os: req.user.platform,
                    browser: req.user.browser,
                    date: new Date(date),
                  },
                ],
              },
            },
            { new: true },
            (err, _) => {
              if (err) {
                return res.status(400).json("Error: " + err);
              }
              if (base64data) {
                return res.json({
                  accessToken,
                  profileUrl: req.body?.profile_url,
                });
              } else {
                return res.json({ accessToken, profileUrl: "" });
              }
            }
          );
        }
      })
      .catch((err) => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while creating the Accounts.",
        });
      });
  });
}
async function loginUser(req, res) {
  const date = new Date()
    .toISOString()
    .replace(/T/, " ") // replace T with a space
    .replace(/\..+/, "");
  const geolocation = (await geoip.lookup(req.user.ipv4)) || "";

  await Account.find({ uuid: req.params.auth_id })
    // .populate({ path: "organizations", model: "organizations" })
    .select({
      profileUrl: 5,
      profileLogo: 4,
      first_time: 3,
      members: 2,
      organizations: 1,
      _id: 0,
    })
    .populate({
      path: "organizations",
      model: "organizations",
      select: [
        "_id",
        "organization_name",
        "municipality",
        "province",
        "country",
        "address",
      ],
    })
    .populate({
      path: "members",
      model: "organization_members",
      select: ["_id", "role", "email", "organization_id"],
    })

    .then((organization) => {
      console.log(organization[0].organizations);

      const users = {
        profileLogo: organization[0].profileLogo,
        auth_id: req.params.auth_id,
        organizations: organization[0].organizations,
        members: organization[0].members,
        first_time: organization[0].first_time,
      };
      const accessToken = generateAccessTokenLogin(users);
      const refreshToken = jwt.sign(users, process.env.REFRESH_TOKEN_SECRET);

      Account.findOneAndUpdate(
        {
          uuid: req.params.auth_id,
        },
        {
          $set: {
            is_deactivate: false,
          },
          $push: {
            sessions: [
              {
                user_agent: req.get("user-agent"),
                access_token: accessToken,
                refresh_token: refreshToken,
                host: req.user.ipv4,
                country: geolocation.country,
                city: geolocation.city,
                os: req.user.platform,
                browser: req.user.browser,
                date: new Date(date),
              },
            ],
          },
        },
        { new: true },
        (err, _) => {
          if (err) {
            return res.status(400).json("Error: " + err);
          }

          return res.json({
            accessToken,
            profileUrl: organization[0].profileUrl.data,
          });
        }
      );
    })
    .catch((err) => res.status(400).json("Error: " + err));
}
async function loginNewUser(req, res) {
  let base64data = null;
  const date = new Date()
    .toISOString()
    .replace(/T/, " ") // replace T with a space
    .replace(/\..+/, "");
  const geolocation = (await geoip.lookup(req.user.ipv4)) || "";

  const random = Math.floor(Math.random() * colortag.length);
  var id = new mongoose.Types.ObjectId();
  let join_last_name = "";
  let join_first_name = "";
  let mimeType;
  let users = {};
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

  request.get(req.body.profile_url, async function (error, response, body) {
    if (!error && response.statusCode == 200) {
      base64data =
        "data:" +
        response.headers["content-type"] +
        ";base64," +
        Buffer.from(body).toString("base64");
      mimeType = base64data.match(/[^:]\w+\/[\w-+\d.]+(?=;|,)/)[0];
      users = new Account({
        _id: id,
        uuid: req.params.auth_id,
        email: req.body.email,
        first_time: true,
        full_name: req.body.user,
        first_name: join_first_name,
        last_name: join_last_name,
        profileLogo: colortag[random],
        profileUrl: {
          contentType: mimeType,
          data: req.body?.profile_url,
        },
      });
    } else {
      users = new Account({
        _id: id,
        uuid: req.params.auth_id,
        email: req.body.email,
        first_time: true,
        full_name: req.body.user,
        first_name: join_first_name,
        last_name: join_last_name,
        profileLogo: colortag[random],
      });
    }
    await users
      .save(users)
      .then(async (_) => {
        if (req.body.code) {
          //insert code
          res.json("new code");
        } else {
          const users = {
            profileLogo: colortag[random],
            auth_id: req.params.auth_id,
            organizations: [],
            members: [],
            first_time: true,
          };
          const accessToken = generateAccessTokenLogin(users);
          const refreshToken = jwt.sign(
            users,
            process.env.REFRESH_TOKEN_SECRET
          );

          Account.findOneAndUpdate(
            {
              uuid: req.params.auth_id,
            },
            {
              $set: {
                is_deactivate: false,
              },
              $push: {
                sessions: [
                  {
                    user_agent: req.get("user-agent"),
                    access_token: accessToken,
                    refresh_token: refreshToken,
                    host: req.user.ipv4,
                    country: geolocation.country,
                    city: geolocation.city,
                    os: req.user.platform,
                    browser: req.user.browser,
                    date: new Date(date),
                  },
                ],
              },
            },
            { new: true },
            (err, _) => {
              if (err) {
                return res.status(400).json("Error: " + err);
              }
              if (base64data) {
                return res.json({
                  accessToken,
                  profileUrl: req.body?.profile_url,
                });
              } else {
                return res.json({ accessToken, profileUrl: "" });
              }
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
  });

  // })
  // .catch((err) => {
  //   res.status(500).send({
  //     message:
  //       err.message || "Some error occurred while creating the Account.",
  //   });
  // });
}

function makeid(length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
const getBase64FromUrl = async (url) => {
  const data = await fetch(url);
  const blob = await data.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      const base64data = reader.result;
      resolve(base64data);
    };
  });
};
