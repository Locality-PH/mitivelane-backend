const db = require("../../../../models");
const Account = db.account;
const Billing = db.billing;
const OrganizationMember = db.organizationMember;

const stripe = require("stripe")(
  "sk_test_51MlMs3HCtdNtuz3POOfVyMPNhZPnOmAmfZAsVORA6CPEACEBTmM9Q2IX6zjJ69XLztPKfOWPDTYIxEgB4FaNugQQ00ygZloaMq"
);
const NodeMailer = require("../../../../nodemailer/index.js");
const NotificationMiddleware = require("../../../../helper/notification");
var mongoose = require("mongoose");

exports.createBilling2 = async (req, res) => {
  let customer = [];
  let token_id = null;
  const billingId = new mongoose.Types.ObjectId();
  const info = req.body?.info;
  try {
    let splitCvc = req.body.valid_thru.split("/");
    if ("mastercard" === req.body.issuer || "visa" === req.body.issuer)
      await stripe.customers
        .list({ email: req.body.email }, async function (err, customers) {
          if (err) {
            console.error(err.message);
          } else {
            if (customers.data.length > 0) {
              const token = await stripe.paymentMethods
                .create({
                  type: "card",
                  card: {
                    number: req.body.card_number.replace(" ", ""),
                    exp_month: splitCvc[0],
                    exp_year: splitCvc[1],
                    cvc: req.body.cvc,
                  },
                })
                .catch((error) => {
                  return res.json(error.message);
                });
              const source = await stripe.sources.create({
                type: "card",
                card: {
                  number: req.body.card_number.replace(" ", ""),
                  exp_month: splitCvc[0],
                  exp_year: splitCvc[1],
                  cvc: req.body.cvc,
                },
              });
              console.log(source.id);
              const customer = await stripe.customers.update(
                customers.data[0].id,
                {
                  default_source: source.id,
                }
              );
              // Attach the payment method to the source
              await stripe.paymentMethods
                .attach(token.id, {
                  customer: customers.data[0].id,
                })
                .catch((error) => {
                  return res.json(error.message);
                });
              token_id = token.id;
            } else {
              const token = await stripe.tokens
                .create({
                  card: {
                    number: req.body.card_number.replace(" ", ""),
                    exp_month: splitCvc[0],
                    exp_year: splitCvc[1],
                    cvc: req.body.cvc,
                  },
                })

                .catch((error) => {
                  return res.json(error.message);
                });

              customer = await stripe.customers
                .create({
                  name: req.body.card_holder,
                  email: req.body.email,
                  address: {
                    line1: info?.address,
                    line2: info?.address2,
                    country: info?.country,
                    postal_code: info?.postcode,
                    city: info?.city,
                  },
                  phone: info?.phoneNumber,
                  source: token.id,
                })

                .catch((error) => {
                  return res.json(error.message);
                });
              token_id = token.id;
            }
          }
        })
        .finally(async () => {
          console.log(token_id);
          const billing = new Billing({
            _id: billingId,
            card_number: req.body.card_number,
            card_holder: req.body.card_holder,
            issuer: req.body.issuer,
            user_id: req.user.auth_id,
            valid_thru: req.body.valid_thru,
            cvc: req.body.cvc,
            active_card: false,
            customer_id: customer.id,
            token_id: token_id,
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
        })
        .catch(async () => {
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

exports.createBilling = async (req, res) => {
  let customer = [];
  let token_id = null;
  let src_id = null;
  const billingId = new mongoose.Types.ObjectId();
  const info = req.body?.info;
  let errorOccurred = false;

  try {
    let splitCvc = req.body.valid_thru.split("/");
    if ("mastercard" === req.body.issuer || "visa" === req.body.issuer) {
      const customers = await stripe.customers.list({ email: req.body.email });
      if (customers.data.length > 0) {
        const token = await stripe.paymentMethods.create({
          type: "card",
          card: {
            number: req.body.card_number.replace(" ", ""),
            exp_month: splitCvc[0],
            exp_year: splitCvc[1],
            cvc: req.body.cvc,
          },
        });
        // Attach the payment method to the source
        await stripe.paymentMethods.attach(token.id, {
          customer: customers.data[0].id,
        });
        const source = await stripe.sources
          .create({
            type: "card",
            card: {
              number: req.body.card_number.replace(" ", ""),
              exp_month: splitCvc[0],
              exp_year: splitCvc[1],
              cvc: req.body.cvc,
            },
          })
          .then(async (source) => {
            console.log(source.id);
            const customer = await stripe.customers.update(
              customers.data[0].id,
              {
                source: source.id,
              }
            );
            console.log(source.id);
            return source;
          });
        src_id = source.id;
        token_id = token.id;
        customer = customers.data[0].id;
      } else {
        const token = await stripe.tokens.create({
          card: {
            number: req.body.card_number.replace(" ", ""),
            exp_month: splitCvc[0],
            exp_year: splitCvc[1],
            cvc: req.body.cvc,
          },
        });
        customer = await stripe.customers.create({
          name: req.body.card_holder,
          email: req.body.email,
          address: {
            line1: info?.address,
            line2: info?.address2,
            country: info?.country,
            postal_code: info?.postcode,
            city: info?.city,
          },
          phone: info?.phoneNumber,
          source: token.id,
        });
        token_id = token.id;
        customer = customer.id;
      }
    }

    const account = await Account.findOneAndUpdate(
      { uuid: req.user.auth_id },
      { $set: { customer_id: customer } },
      { new: true }
    );
    await account.save();
    console.log(customer);
    const billing = new Billing({
      _id: billingId,
      card_number: req.body.card_number,
      card_holder: req.body.card_holder,
      issuer: req.body.issuer,
      user_id: req.user.auth_id,
      valid_thru: req.body.valid_thru,
      cvc: req.body.cvc,
      active_card: false,
      customer_id: customer,
      token_id: token_id,
      src_id: src_id,
    });
    await billing.save();

    await Account.findOneAndUpdate(
      { uuid: req.user.auth_id },
      { $push: { billing_method: billingId } },
      { new: true }
    ).then(() => {
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
    await Account.find({ uuid: req.user.auth_id })
      .select({
        customer_id: 1,
        billing_method: 1,
        _id: 0,
      })
      .populate({
        path: "billing_method",
        model: "billings",
        select: [
          "_id",
          "issuer",
          "user_id",
          "card_number",
          "active_card",
          "valid_thru",
          "customer_id",
          "token_id",
        ],
      })
      .then(async (organization) => {
        //        setTotal(res.headers["customer-id"]);
        await stripe.customers
          .retrieve(organization[0]?.customer_id)
          .then((customer) => {
            const balance = customer.balance;
            res.set("customer-balance", balance / 100);
            res.status(200).json(organization);
          })
          .catch(() => {
            res.set("customer-balance", 0);
            res.status(200).json(organization);
          });
      })
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
        req.body.card_id.length > 0 &&
        req.body.card_id_new &&
        req.body.card_id_new !== "" &&
        req.body.card_id_new.length > 0
      )
    ) {
      return res.status(400).json("card id is required");
    }
    const billingDataSearch = await Billing.findOne({
      user_id: req.user.auth_id,
      _id: req.body.card_id,
    });
    console.log(billingDataSearch);
    let detachResult;
    try {
      detachResult = await stripe.paymentMethods.detach(
        billingDataSearch.token_id
      );
      console.log("Payment method detached:", detachResult);
    } catch (err) {
      console.log("Error detaching payment method:", err);
      return res
        .status(500)
        .json("Error detaching payment method: " + err.message);
    }

    await Account.findOneAndUpdate(
      { uuid: req.user.auth_id },
      {
        $pull: {
          billing_method: req.body.card_id,
        },
      },
      { new: true }
    );

    const accountData = await Billing.findOneAndDelete({
      user_id: req.user.auth_id,
      _id: req.body.card_id,
    });

    const billingDataNew = await Billing.findOneAndUpdate(
      {
        user_id: req.user.auth_id,
        _id:
          req.body.card_id_new === "N/A"
            ? new mongoose.Types.ObjectId()
            : req.body.card_id_new,
      },
      {
        $set: {
          active_card: true,
        },
      }
    );
    console.log(billingDataNew);
    Promise.all([accountData, billingDataNew]).then(() => {});
    return res.status(200).json("Delete Successful");
  } catch (error) {
    console.log("Error deleting billing:", error);
    return res.status(500).json("Error deleting billing: " + error.message);
  }
};
exports.updateBillingCard = async (req, res) => {
  try {
    if (
      !(
        req.body.card_id_prev &&
        req.body.card_id_prev !== "" &&
        req.body.card_id_prev.length > 0 &&
        req.body.card_id_new &&
        req.body.card_id_new !== "" &&
        req.body.card_id_new.length > 0
      )
    ) {
      return res.status(400).json("card id is required");
    }
    const billingDataNew = await Billing.findOneAndUpdate(
      {
        user_id: req.user.auth_id,
        _id: req.body.card_id_new,
      },
      {
        $set: {
          active_card: true,
        },
      }
    );
    const billingData = await Billing.findOne({
      user_id: req.user.auth_id,
      _id: req.body.card_id_new,
    });
    console.log(billingData);
    if (req.body.card_id_new !== "N/A") {
      await stripe.customers
        .update(billingData.customer_id, {
          default_source: billingData.src_id,
          invoice_settings: {
            default_payment_method: billingData.token_id,
          },
        })
        .then(async (customer) => {
          console.log("Default payment method set for customer:", customer);
        })
        .catch((err) => {
          console.log("Error:", err);
        });
      const customer2 = await stripe.customers.retrieve(
        billingData.customer_id
      );

      console.log("org", customer2);
      // const customer = await stripe.customers.retrieve(billingData.customer_id);
      // await stripe.customers.update(billingData.customer_id, {
      //   default_source: billingData.token_id,
      // });
    }
    if (req.body.card_id_prev !== "none") {
      const billingDataPrev = await Billing.findOneAndUpdate(
        {
          user_id: req.user.auth_id,
          _id: req.body.card_id_prev,
        },
        {
          $set: {
            active_card: false,
          },
        }
      );
      Promise.all([billingDataNew, billingDataPrev]);
      return res.status(200).json("update successful");
    }
    Promise.all([billingDataNew]);
    return res.status(200).json("update successful");
  } catch (error) {
    return res.status(400).json("Error: " + error);
  }
};

exports.payDocumentIntent = async (req, res) => {
  try {
    // const charge = await stripe.charges.create({
    //   amount: 60,
    //   currency: "usd",
    //   customer: "cus_NWSK3Ps0MlzINU",
    //   payment_method: req.body.token_id,
    //   description: "Charge for " + req.body.certificate_type,
    // });
    const organizationData = await OrganizationMember.findOne({
      organization_id: req.body.organizationId,
      active_email: true,
    });
    //  console.log(organizationData);
    if (!organizationData) {
      return res.status(400).json("Organization billing email not set");
    }
    if (!organizationData?.email) {
      return res.status(400).json("Organization billing email not set");
    }
    //  console.log(organizationData.email);
    const account = await Account.findOne({
      email: organizationData.email,
    }).select({
      email: 1,
      full_name: 1,
      profileUrl: 1,
      profileLogo: 1,
      uuid: 1,
      customer_id: 1,
      _id: 1,
    });
    const account2 = await Account.findOne({
      uuid: req.user.auth_id,
    }).select({
      email: 1,
      full_name: 1,
      profileUrl: 1,
      profileLogo: 1,
      uuid: 1,
      customer_id: 1,
      _id: 1,
    });
    //  console.log("User ", account);
    if (!account?.customer_id) {
      return res.status(400).json("Organization billing user email not set");
    }
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Number(req.body.paymentData) * 100,
      currency: "usd",
      payment_method_types: ["card"],
      payment_method: req.body.token_id,
      customer: req.body.customer_id,
      description: "Example payment intent",
      confirm: true,
    });
    // console.log(account?.customer_id, req.body.customer_id);
    const customer2 = await stripe.customers.retrieve(req.body.customer_id);
    const customer3 = await stripe.customers.retrieve(account?.customer_id);
    console.log("user", customer2);
    console.log("org", customer3);
    const balanceTransaction = await stripe.charges.create({
      amount: Number(req.body.paymentData) * 100, // amount in cents
      currency: "usd",
      customer: account?.customer_id,
      description: "Adding $10 to customer balance",
    });

    // change cus_NWSK3Ps0MlzINU to customer 2
    const customer = await stripe.customers.retrieve(account?.customer_id);
    const currentBalance = customer.balance;

    // Calculate the new balance amount
    const newBalance = currentBalance + Number(req.body.paymentData) * 100;

    await stripe.customers.update(account?.customer_id, {
      balance: newBalance,
    });
    NotificationMiddleware.notificationDocument({
      organization_id: req.body.organizationId,
      message: "has paid you of " + req.body.paymentData + " credit",
      user_id: account2?._id,
      uuid: account?.uuid,
      is_read: false,
      type: "user",
      link: `#`,
    });
    NodeMailer.sendMail({
      template: "templates/status/payment/index.html",
      replacements: {
        link: `#`,
        profile:
          account2?.profileUrl?.data ||
          `https://ui-avatars.com/api/name=${
            account2?.full_name || "U"
          }&background=${
            account2?.profileLogo.replace("#", "") || "a0a0a0"
          }&color=FFFFFF&bold=true`,
        name: account2?.full_name,
        content: "has paid you of " + req.body.paymentData + " credit",
      },
      to: account?.email,
      from: "Mitivelane<testmitivelane@gmail.com>",
      subject: "has paid you of " + req.body.paymentData + " credit",
    });
    //  console.log("Transfer successfully created:", balanceTransaction);

    return res.status(200).json("payment successful");
  } catch (error) {
    return res.status(400).json("Error: " + error);
  }
};

// NotificationMiddleware.notificationDocument({
//   organization_id: comment3.organization_id,
//   message: "has replied to your comment",
//   user_id: user?._id,
//   uuid: comment3.account.uuid,
//   is_read: false,
//   type: "user",
//   link: `/home/posts/${orgId}/${generalId}/single/data`,
// });
// console.log(user?.profileUrl?.data);
// NodeMailer.sendMail({
//   template: "templates/status/comment/index.html",
//   replacements: {
//     link: `/home/posts/${orgId}/${generalId}/single/data`,
//     profile:
//       user?.profileUrl?.data ||
//       `https://ui-avatars.com/api/name=${
//         user?.full_name || "U"
//       }&background=${
//         user?.profileLogo.replace("#", "") || "a0a0a0"
//       }&color=FFFFFF&bold=true`,
//     name: user?.full_name,
//     content: `has message you, check the message in the comment section by clicking this button below`,
//   },
//   to: comment3.account.email,
//   from: "Mitivelane<testmitivelane@gmail.com>",
//   subject: `Someone has replied to your comment`,
// });
function checkEmailExists(email, arr) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].email === email) {
      return true; // email already exists in array
    }
  }
  return false; // email does not exist in array
}
