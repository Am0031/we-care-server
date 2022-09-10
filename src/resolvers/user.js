const { User, Carer, Patient, AddressLookup } = require("../models");
const mongoose = require("mongoose");
const sendNotification = require("./sendNotification");

const userInfo = async (_, { userId }) => {
  const carer = await User.findById(userId);

  return carer;
};

const carerInfo = async (_, { userId }) => {
  const carer = await Carer.findOne({ userId }).populate("userId");

  return carer;
};

const patientInfo = async (_, { userId }) => {
  const patient = await Patient.findOne({ userId }).populate("userId");

  return patient;
};

const updateUserInfo = async (_, { updateInput, userId }) => {
  try {
    if (updateInput.address) {
      const address = await AddressLookup.findOne({
        addresses: {
          $elemMatch: {
            _id: updateInput.address,
          },
        },
      });

      const yourAddress = address
        .get("addresses")
        .find(
          (address) => address.get("_id")?.toString() === updateInput.address
        );

      updateInput.address = yourAddress;
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      { $set: updateInput },
      {
        new: true,
      }
    );

    return {
      success: true,
      user: updatedUser,
    };
  } catch (error) {
    console.log(`[ERROR]: Failed to update user | ${error.message}`);
  }
};

const updateCarerInfo = async (_, { updateCarerInput, userId }) => {
  try {
    const updatedCarer = await Carer.findOneAndUpdate(
      { userId: userId },
      { $set: updateCarerInput },
      {
        new: true,
      }
    );

    return {
      success: true,
      userId: userId,
    };
  } catch (error) {
    console.log(`[ERROR]: Failed to update carer | ${error.message}`);
  }
};

const updatePatientInfo = async (_, { updatePatientInput, userId }) => {
  try {
    const updatedPatient = await Patient.findOneAndUpdate(
      { userId: userId },
      { $set: updatePatientInput },
      {
        new: true,
      }
    );

    return {
      success: true,
      userId: userId,
    };
  } catch (error) {
    console.log(`[ERROR]: Failed to update patient | ${error.message}`);
  }
};

const updateApprovedStatus = async (_, { userId }) => {
  try {
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      { $set: { approvedStatus: true } },
      {
        new: true,
      }
    );

    return {
      success: true,
      userId: userId,
    };
  } catch (error) {
    console.log(`[ERROR]: Failed to update patient | ${error.message}`);
  }
};

const updateCarerReviews = async (_, { reviewInput, userId }) => {
  try {
    reviewInput.patientId = userId;

    const carer = await Carer.findOne({ userId: userId });
    const receiverId = carer.userId;

    //push the review in the carer's reviews array
    carer.reviews.push(reviewInput);
    const updatedCarer = await carer.save();

    //notify the carer that they have a new review
    const carerNotified = await sendNotification({
      receiverType: "carer",
      receiverId,
      notificationType: "New review",
      notificationText: "You received a new review from one of your patients.",
    });

    return {
      success: true,
      userId: userId,
    };
  } catch (error) {
    console.log(`[ERROR]: Failed to update patient | ${error.message}`);
  }
};

module.exports = {
  userInfo,
  carerInfo,
  patientInfo,
  updateUserInfo,
  updateCarerInfo,
  updatePatientInfo,
  updateApprovedStatus,
  updateCarerReviews,
};
