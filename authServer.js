require("dotenv").config();

const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");

app.use(express.json());

let refreshTokens = [
  {
    token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJiYXJhbmdheXMiOltbIjYxYzJkZGY3YmIzMDQxYzg1MThlMWM3MSJdLFsiNjFkY2RjYTRkMjAzNjMxMjkzODlmNDFiIl0sWyI2MWRjZTU5ZTE4ZWMzNGE5MWNkOTI2ZTQiXSxbIjYxZTRkZTM2MGQxZTMwYThiNTk5OWE3OCJdXSwibWVtYmVycyI6W1siNjFjMmRkZjdiYjMwNDFjODUxOGUxYzcyIl0sWyI2MWRjZGNhNGQyMDM2MzEyOTM4OWY0MWMiXSxbIjYxZGNlNTllMThlYzM0YTkxY2Q5MjZlNSJdLFsiNjFlNGRlMzYwZDFlMzBhOGI1OTk5YTc5Il1dLCJpYXQiOjE2NDI0NjgyMzV9.WuPCEtIFU_AiAZHlKqIQ0JDl9Zytn1N86WrnoS10kEI",
  },
];

app.post("/token", (req, res) => {
  const refreshToken = req.body.token;
  if (refreshToken == null) return res.sendStatus(401);
  //REPLACE THIS WITH THIS
  // if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);
  // TOKEN.find()
  //   .then((exercises) => res.json(exercises))
  //   .catch((err) => res.status(400).json("Error: " + err));
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    console.log(user);
    const accessToken = generateAccessToken({ name: user.name });
    res.json({ accessToken: accessToken });
  });
});

app.delete("/logout", (req, res) => {
  refreshTokens = refreshTokens.filter((token) => token !== req.body.token);
  res.sendStatus(204);
});

app.post("/login", (req, res) => {
  // Authenticate User

  const username = req.body.username;
  const user = { name: username };

  const accessToken = generateAccessToken(user);
  const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
  refreshTokens.push(refreshToken);
  res.json({ accessToken: accessToken, refreshToken: refreshToken });
});

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15s" });
}
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
