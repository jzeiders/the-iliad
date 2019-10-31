const express = require("express");
const models = require("./models");
const utils = require("./utils");
const router = express.Router();
const Sentry = require("@sentry/node");

router.use(utils.authMiddleware);
router.use(utils.preprocessRequest);

router.get("/", async (req, res) => {
  const [hackerProfile] = await models.HackerProfile.findOrCreate({
    where: {
      userId: req.user.id
    },
    defaults: {
      email: req.user._json.email
    }
  });

  return res.json({ hackerProfile });
});

router.put("/", async (req, res) => {
  // TODO: Do input validation
  console.log("we got here");
  console.log(req.body);
  const newHackerProfile = await models.HackerProfile.update(req.body, {
    where: {
      userId: req.user.id
    }
  });
  console.log(newHackerProfile);
  return res.json({ hackerProfile: newHackerProfile });
});

module.exports = router;
