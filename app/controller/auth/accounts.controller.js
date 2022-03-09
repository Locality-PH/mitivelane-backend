const token = require("../../auth");
const db = require("../../models");
var jwt = require("jsonwebtoken");

var request = require("request").defaults({ encoding: null });

var mongoose = require("mongoose");
// const BarangayMember = db.barangayMember;
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
          // .populate({ path: "barangays", model: "barangays" })
          .then((barangay) => {
            // if (barangay[0].access_token == refreshToken) {

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

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "30m" });
}
function generateAccessTokenLogin(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "24h" });
}
// edit this four tomorrow to make a dynamic profile
async function registerOldUser(req, res) {
  const urlGeo =
    "https://geolocation-db.com/json/" +
    process.env.GEOLOCATION_ID +
    "/" +
    req.user.ipv4;
  const geolocation = await fetch(urlGeo)
    .then((response) => response.json())
    .then((data) => data);
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
        barangays: 1,
        _id: 0,
      })
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
        const users = {
          auth_id: req.body.uuid,
          profileLogo: barangay[0].profileLogo,
          barangays: barangay[0].barangays,
          members: barangay[0].members,
          first_time: barangay[0].first_time,
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
                  host: geolocation.IPv4,
                  country: geolocation.country_name,
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
              profileUrl: barangay[0].profileUrl.data,
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
  console.log(date);
  let base64data = null;
  const urlGeo =
    "https://geolocation-db.com/json/" +
    process.env.GEOLOCATION_ID +
    "/" +
    req.user.ipv4;
  const geolocation = await fetch(urlGeo)
    .then((response) => response.json())
    .then((data) => data);
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
        full_name: req.body.user,
        first_name: join_first_name,
        last_name: join_last_name,
        profileUrl: {
          contentType: mimeType,
          data: base64data,
        },
        profileLogo: colortag[random],
      });
    } else {
      users = new Account({
        _id: id,
        uuid: req.body.uuid,
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
            auth_id: req.body.uuid,
            barangays: [],
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
              uuid: req.body.uuid,
            },
            {
              $push: {
                sessions: [
                  {
                    user_agent: req.get("user-agent"),
                    access_token: accessToken,
                    refresh_token: refreshToken,
                    host: geolocation.IPv4,
                    country: geolocation.country_name,
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
                return res.json({ accessToken, profileUrl: base64data });
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
  const urlGeo =
    "https://geolocation-db.com/json/" +
    process.env.GEOLOCATION_ID +
    "/" +
    req.user.ipv4;
  const geolocation = await fetch(urlGeo)
    .then((response) => response.json())
    .then((data) => data);
  console.log(urlGeo);
  await Account.find({ uuid: req.params.auth_id })
    // .populate({ path: "barangays", model: "barangays" })
    .select({
      profileUrl: 5,
      profileLogo: 4,
      first_time: 3,
      members: 2,
      barangays: 1,
      _id: 0,
    })
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
      const users = {
        profileLogo: barangay[0].profileLogo,
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
                host: geolocation.IPv4,
                country: geolocation.country_name,
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
            profileUrl: barangay[0].profileUrl.data,
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
  const urlGeo =
    "https://geolocation-db.com/json/" +
    process.env.GEOLOCATION_ID +
    "/" +
    req.user.ipv4;
  const geolocation = await fetch(urlGeo)
    .then((response) => response.json())
    .then((data) => data);
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
          data: base64data,
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
            barangays: [],
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
              $push: {
                sessions: [
                  {
                    user_agent: req.get("user-agent"),
                    access_token: accessToken,
                    refresh_token: refreshToken,
                    host: geolocation.IPv4,
                    country: geolocation.country_name,
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
                return res.json({ accessToken, profileUrl: base64data });
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
