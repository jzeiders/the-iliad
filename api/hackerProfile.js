const express = require("express");
const models = require("./models");
const utils = require("./utils");
const router = express.Router();
const Sentry = require("@sentry/node");
const Busboy = require("busboy");
const AWS = require("aws-sdk");

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

  if (hackerProfile.status === "unverified" && req.user._json.email_verified) {
    // Update hacker profile
    hackerProfile.status = "verified";
    await hackerProfile.save();
    return res.json({ hackerProfile });
  }
  return res.json({ hackerProfile });
});

router.put("/", async (req, res) => {
  // Get the users current hacker profile
  const currentHackerProfile = await models.HackerProfile.findOne({
    where: { userId: req.user.id }
  });

  const formInput = req.body;

  // If the user is saving a profile, make sure that they have not already submitted one before
  if (currentHackerProfile.profileSubmittedAt !== null) {
    return res.status(400).json({
      error: "You have already submitted a profile"
    });
  }

  // Only allow certain fields for form input
  const allowedFields = new Set([
    "gender",
    "ethnicity",
    "email",
    "major",
    "minor",
    "skills",
    "interests",
    "firstName",
    "lastName",
    "phoneNumber",
    "school",
    "year",
    "skillLevel",
    "graduationDate",
    "over18",
    "needBus",
    "links",
    "submit"
  ]);

  for (let key of Object.keys(formInput)) {
    if (!allowedFields.has(key)) {
      return res.status(400).json({
        error: `${key} is not a supported field`
      });
    }
  }

  // TODO: Validate inputs

  const updatedProfileFields = {
    ...formInput
  };

  /*
    Advance the user in the application process if they meet the following conditions
    - Have previously not submitted a profile
    - Have filled out all of the required fields 
  */

  if (formInput.submit) {
    if (currentHackerProfile.profileSubmittedAt === null) {
      if (
        formInput.gender &&
        formInput.ethnicity &&
        formInput.major &&
        formInput.firstName &&
        formInput.lastName &&
        formInput.phoneNumber &&
        formInput.school &&
        formInput.skillLevel &&
        formInput.graduationDate &&
        formInput.over18
      ) {
        updatedProfileFields.profileSubmittedAt = new Date();
        updatedProfileFields.status = "profileSubmitted";
      } else {
        return res.status(400).json({
          error: "Not all required fields are filled out"
        });
      }
    } else {
      return res.status(400).json({
        error: "You have already submitted a profile"
      });
    }
  }

  // Update, then re-retrieve the updated hacker profile
  await models.HackerProfile.update(updatedProfileFields, {
    where: {
      userId: req.user.id
    }
  });

  const updatedHackerProfile = await models.HackerProfile.findOne({
    where: { userId: req.user.id }
  });

  return res.json({ hackerProfile: updatedHackerProfile });
});

router.post("/resume", utils.authMiddleware, async (req, res) => {
  const user = req.user;
  if (req.files) {
    const file = req.files.file;
    const s3 = new AWS.S3({
      accessKeyId: process.env.S3_ACCESS_KEY,
      secretAccessKey: process.env.S3_SECRET
    });

    const params = {
      Bucket: "hacksc-odyssey",
      Key: user.id,
      Body: file.data
    };

    s3.upload(params, function(err, data) {
      if (!err) {
        res.json({ data });
      } else {
        res.json(500, { message: "Failed to upload Resume" });
      }
    });
  }
});

router.put("/application", async (req, res) => {
  // Get the users current hacker profile
  const currentHackerProfile = await models.HackerProfile.findOne({
    where: { userId: req.user.id }
  });

  const formInput = req.body;

  if (currentHackerProfile.profileSubmittedAt === null) {
    return res.status(400).json({
      error: "You must submit a profile first, before submitting an application"
    });
  }

  // If the user is saving an application, make sure that they have not already submitted one before
  if (currentHackerProfile.applicationSubmittedAt !== null) {
    return res.status(400).json({
      error: "You have already submitted an application"
    });
  }

  // Only allow certain fields for form input
  const allowedFields = new Set([
    "questionOne",
    "questionTwo",
    "questionThree",
    "codeOfConduct",
    "authorize",
    "submit"
  ]);

  for (let key of Object.keys(formInput)) {
    if (!allowedFields.has(key)) {
      return res.status(400).json({
        error: `${key} is not a supported field`
      });
    }
  }

  // TODO: Validate inputs

  const updatedApplicationFields = {
    ...formInput
  };

  /*
    Advance the user in the application process if they meet the following conditions
    - Have previously not submitted an application
    - Have filled out all of the required fields 
  */

  if (formInput.submit) {
    if (currentHackerProfile.applicationSubmittedAt === null) {
      if (
        formInput.questionOne &&
        formInput.questionTwo &&
        formInput.questionThree &&
        formInput.codeOfConduct &&
        formInput.authorize
      ) {
        updatedApplicationFields.applicationSubmittedAt = new Date();
        updatedApplicationFields.status = "applicationSubmitted";
      } else {
        return res.status(400).json({
          error: "Not all required fields are filled out"
        });
      }
    } else {
      return res.status(400).json({
        error: "You have already submitted an application"
      });
    }
  }

  // Update, then re-retrieve the updated hacker profile
  await models.HackerProfile.update(updatedApplicationFields, {
    where: {
      userId: req.user.id
    }
  });

  const updatedHackerProfile = await models.HackerProfile.findOne({
    where: { userId: req.user.id }
  });

  return res.json({ hackerProfile: updatedHackerProfile });
});

module.exports = router;