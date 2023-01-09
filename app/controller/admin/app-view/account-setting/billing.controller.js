const db = require("../../../../models");
const Account = db.account;
const Billing = db.billing;

var mongoose = require("mongoose");

exports.createBilling = async (req, res) => {
  const billingId = new mongoose.Types.ObjectId();
  try {
    const billing = new Billing({
      _id: billingId,
      card_number: req.body.card_number,
      card_holder: req.body.card_holder,
      issuer: req.body.issuer,
      user_id: req.user.auth_id,
      valid_thru: req.body.valid_thru,
      cvc: req.body.cvc,
      active_card: req.body.active_card,
    });
    await billing.save();

    const account = await Account.findOneAndUpdate(
      { uuid: req.user.auth_id },
      { $push: { billing_method: billingId } },
      { new: true }
    );
    await account.save();

    return res.status(200).json({
      _id: billingId,
      user_id: req.user.auth_id,
      card_number: req.body.card_number,
      card_holder: req.body.card_holder,
      issuer: req.body.issuer,
      valid_thru: req.body.valid_thru,
      cvc: req.body.cvc,
      active_card: req.body.active_card,
    });
  } catch (error) {
    const billingData = Billing.findByIdAndDelete(billingId);
    const accountData = Account.findOneAndUpdate(
      { uuid: req.user.auth_id },
      {
        $pull: {
          billing_method: {
            _id: billingId,
          },
        },
      },
      { new: true, multi: true }
    );
    await Promise.all([billingData, accountData]);

    return res.status(400).json("Error: " + error);
  }
};

exports.getBilling = async (req, res) => {
  try {
    Account.find({ uuid: req.user.auth_id })
      .select({
        billing_method: 1,
        _id: 0,
      })
      .populate({ path: "billing_method", model: "billings" })
      .then((organization) => res.status(200).json(organization))
      .catch((err) => {
        return res.status(400).json("Error: " + err);
      });
  } catch (error) {
    return res.status(400).json("Error: " + error);
  }
};

exports.deleteBilling = async (req, res) => {
  try {
    if (
      !(
        req.body.card_id &&
        req.body.card_id !== "" &&
        req.body.card_id.length > 0
      )
    ) {
      return res.status(400).json("card id is required");
    }
    const billingData = Billing.findOneAndDelete({
      user_id: req.user.auth_id,
      _id: req.body.card_id,
    });
    const accountData = Account.findOneAndUpdate(
      { uuid: req.user.auth_id },
      {
        $pull: {
          billing_method: [req.body.card_id],
        },
      },
      { new: true, multi: true }
    );
    await Promise.all([billingData, accountData]);
    return res.status(200).json("Delete Successful");
  } catch (error) {
    return res.status(400).json("Error: " + error);
  }
};
