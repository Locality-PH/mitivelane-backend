const db = require("../../../../models");
var mongoose = require("mongoose");
var moment = require("moment");
const { RecordSession } = require("../../../../helper/session");

const SupplyGiven = db.supplyGiven;
const SupplyReceived = db.supplyReceive;
const SupplyInventory = db.supplyInventory;
const Organization = db.organization;

exports.getGivenSupplyPage = async (req, res) => {
  try {
    var page = parseInt(req.params.page) - 1;
    var pageSize = parseInt(req.params.pageSize);
    var organization_id = req.params.organization_id;
    organization_id = mongoose.Types.ObjectId(organization_id);

    var tableScreen = req.body.tableScreen
    var tableScreenLength = Object.keys(tableScreen).length
    var sorter = null
    var filter = { organization_id: organization_id }
    var doesFilterExist = tableScreen.hasOwnProperty("filter")
    var doesSorterExist = tableScreen.hasOwnProperty("sorter")
    var numberKeys = ["amount"] // put here keys that are number fields

    //This is custom filter that have no date filter
    var current_date = req.body.dateFilter
    var startDate = moment(current_date).startOf('year')
    var endDate = moment(current_date).endOf('year')

    filter = {
      ...filter,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }

    if (doesFilterExist != false) {
      var tempFilter = tableScreen.filter
      var isKeyNumber = false
      var isKeyDate = false

      for (const [key, value] of Object.entries(tempFilter)) {
        if (value != null) {
          isKeyNumber = numberKeys.includes(key)
          isKeyDate = dateKeys.includes(key)

          if (isKeyNumber == true) {
            // console.log("number");
            filter = { ...filter, [key]: value }
          }

          if (isKeyDate == false && isKeyNumber == false) {
            // console.log("string");
            filter = { ...filter, [key]: { $regex: value.join("|"), $options: "i" } }
          }
        }
      }
    }

    if (doesSorterExist != false) {
      var tempSorter = tableScreen.sorter
      var field = tempSorter.field
      var order = tempSorter.order + 'ing'
      sorter = { [field]: order }
    }

    //  console.log("filter", filter)
    // console.log("sorter", sorter)

    await SupplyGiven.find(filter)
      .skip(page * pageSize)
      .limit(pageSize)
      .collation({ locale: "en" })
      .sort(sorter)
      .then(async (result) => {
        var list = result
        await SupplyGiven.countDocuments(filter)
          .then((result) => {
            var total = result
            res.json({ list, total });
          });
      })

  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "error" });
  }
};

exports.getReceivedSupplyPage = async (req, res) => {
  try {
    var page = parseInt(req.params.page) - 1;
    var pageSize = parseInt(req.params.pageSize);
    var organization_id = req.params.organization_id;
    organization_id = mongoose.Types.ObjectId(organization_id);

    var tableScreen = req.body.tableScreen
    var tableScreenLength = Object.keys(tableScreen).length
    var sorter = null
    var filter = { organization_id: organization_id }
    var doesFilterExist = tableScreen.hasOwnProperty("filter")
    var doesSorterExist = tableScreen.hasOwnProperty("sorter")
    var numberKeys = ["amount"] // put here keys that are number fields

    //This is custom filter that have no date filter
    var current_date = req.body.dateFilter
    var startDate = moment(current_date).startOf('year')
    var endDate = moment(current_date).endOf('year')

    filter = {
      ...filter,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }

    if (doesFilterExist != false) {
      var tempFilter = tableScreen.filter
      var isKeyNumber = false
      var isKeyDate = false

      for (const [key, value] of Object.entries(tempFilter)) {
        if (value != null) {
          isKeyNumber = numberKeys.includes(key)
          isKeyDate = dateKeys.includes(key)

          if (isKeyNumber == true) {
            // console.log("number");
            filter = { ...filter, [key]: value }
          }

          if (isKeyNumber == false) {
            // console.log("string");
            filter = { ...filter, [key]: { $regex: value.join("|"), $options: "i" } }
          }
        }
      }
    }

    if (doesSorterExist != false) {
      var tempSorter = tableScreen.sorter
      var field = tempSorter.field
      var order = tempSorter.order + 'ing'
      sorter = { [field]: order }
    }

    //  console.log("filter", filter)
    // console.log("sorter", sorter)

    await SupplyReceived.find(filter)
      .skip(page * pageSize)
      .limit(pageSize)
      .collation({ locale: "en" })
      .sort(sorter)
      .then(async (result) => {
        var list = result
        await SupplyReceived.countDocuments(filter)
          .then((result) => {
            var total = result
            res.json({ list, total });
          });
      })

  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "error" });
  }
};

exports.getCurrentSupply = async (req, res) => {
  try {
    var organization_id = req.body.organization_id;
    organization_id = mongoose.Types.ObjectId(organization_id);
    const currentSupply = await Organization.findOne({ _id: organization_id });
    res.status(200).send(currentSupply);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "error" });
  }
};

exports.updateCurrentSupply = async (req, res) => {
  try {
    var organization_id = req.body.organization_id;
    var new_supply_amount = req.body.new_supply_amount;
    organization_id = mongoose.Types.ObjectId(organization_id);
    const query = await Organization.updateOne(
      { _id: organization_id },
      { organization_supply: new_supply_amount }
    );
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "error" });
  }
};

exports.addSupplyGiven = async (req, res) => {
  try {
    var organization_id = req.body.organization_id;
    var new_supply_amount = req.body.new_supply_amount;
    var newSupplyData = req.body.newSupplyGiven;
    newSupplyData._id = new mongoose.Types.ObjectId();
    newSupplyData.organization_id = mongoose.Types.ObjectId(organization_id);
    newSupplyData.current_supply = new_supply_amount;

    var supply_date = newSupplyData.date
    var year = moment(supply_date).year()

    //Organization
    await Organization.updateOne(
      { _id: organization_id },
      { organization_supply: new_supply_amount }
    )
      .then(async () => {
        await SupplyInventory.findOne({ organization_id, year })
          .then(async (result) => {
            var date = moment(supply_date).month()

            if (result != null) {
              var month = result.given_month
              month[date] = month[date] + newSupplyData.amount

              var newInventory = { given_month: month }

              await SupplyInventory.updateOne(
                { _id: result._id },
                { ...newInventory }
              )
            }

            else {
              // console.log("inventory is null")
              // this resembles 12 months
              var newInventory = {}
              var month = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
              var received_month = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
              month[date] = month[date] + newSupplyData.amount
              var _id = new mongoose.Types.ObjectId();
              newInventory = { given_month: month, received_month, year, organization_id, _id }

              await new SupplyInventory(newInventory).save()
            }

            const newSupply = new SupplyGiven(newSupplyData);

            const querySession = await RecordSession({
              organization_id: organization_id,
              userAuthId: req.user.auth_id,
              message: `Given ${newSupplyData.amount} amount of supply to ${newSupplyData.household_name} household. New current supply stock: ${new_supply_amount}`,
              action: "Create",
              module: "Supply",
            })

            const querySupply = await newSupply.save();
            
            Promise.all([querySession, querySupply])
            .then((values) => {
              res.json(values[1])
            });
          })
      })

  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "error" });
  }
};

exports.updateSupplyGiven = async (req, res) => {
  try {
    var organization_id = req.body.organization_id;
    var new_supply_amount = req.body.new_supply_amount;
    var newSupplyGiven = req.body.newSupplyGiven;
    var supply_id = newSupplyGiven.supply_given_id
    newSupplyGiven.current_supply = new_supply_amount;

    await SupplyGiven.findOne({ _id: supply_id })
      .then(async (result) => {
        if (result == null) {
          res.sendStatus(500);
        }

        else {
          let oldSupplyGiven = result
          let oldDate = oldSupplyGiven.date
          let newDate = newSupplyGiven.date

          let oldYear = moment(oldDate).year()
          let oldMonth = moment(oldDate).month()
          let newYear = moment(newDate).year()
          let newMonth = moment(newDate).month()

          let oldAmount = oldSupplyGiven.amount
          let newAmount = newSupplyGiven.amount
          let amountBalance = newAmount - oldAmount

          // console.log("yearSame", oldYear == newYear)
          // console.log("monthSame", oldMonth == newMonth)

          let isDateSame = oldYear == newYear && oldMonth == newMonth

          await SupplyInventory.findOne({ organization_id, year: oldYear })
            .then(async (result) => {

              var month = result.given_month

              if (isDateSame == true) {
                month[oldMonth] = month[oldMonth] + amountBalance
              }

              else {
                month[oldMonth] = month[oldMonth] - oldAmount
              }

              var newInventory = { given_month: month }

              await SupplyInventory.updateOne(
                { _id: result._id },
                { ...newInventory }
              )
            })

          if (isDateSame != true) {
            await SupplyInventory.findOne({ organization_id, year: newYear })
              .then(async (result) => {

                if (result != null) {
                  // console.log("result", result)
                  var month = result.given_month
                  month[newMonth] = month[newMonth] + newAmount

                  var newInventory = { given_month: month }

                  // console.log("month", month)

                  await SupplyInventory.updateOne(
                    { _id: result._id },
                    { ...newInventory }
                  )
                }

                else {
                  // console.log("inventory is null")
                  // this resembles 12 months
                  var newInventory = {}
                  var month = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                  var received_month = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                  month[newMonth] = month[newMonth] + newAmount
                  var _id = new mongoose.Types.ObjectId();
                  newInventory = { given_month: month, received_month, year: newYear, organization_id, _id }


                  await new SupplyInventory(newInventory).save()
                }
              })
          }

          //Organization
          const queryOrg = await Organization.updateOne(
            { _id: organization_id },
            { organization_supply: new_supply_amount }
          );

          //Supply
          const querySupply = await SupplyGiven.updateOne(
            { _id: supply_id },
            newSupplyGiven
          );

          const querySession = await RecordSession({
            organization_id: organization_id,
            userAuthId: req.user.auth_id,
            message: `A given record has been change. New current supply stock: ${new_supply_amount}`,
            action: "Update",
            module: "Supply",
          })

          Promise.all([queryOrg, querySupply, querySession])
          .then((values) => {
            res.sendStatus(200);
          });

        }
      })
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "error" });
  }
};

exports.deleteSupplyGiven = async (req, res) => {
  try {

    // console.log("req.body", req.body)
    var organization_id = req.body.organization_id;
    var new_supply_amount = req.body.new_supply_amount;
    var year = moment(req.body.dateFilter).year()

    var selectedRowKeys = req.body.selectedRowKeys;
    var length = selectedRowKeys.length
    var deleteIdList = []
    var removeSupplyMonth = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

    selectedRowKeys.forEach(row => {
      let rowYear = moment(row.date).year()
      let rowMonth = moment(row.date).month()

      if (year == rowYear) {
        removeSupplyMonth[rowMonth] = removeSupplyMonth[rowMonth] + row.amount

        deleteIdList.push(row._id)
      }
    });

    const counter = await SupplyGiven.countDocuments({ _id: deleteIdList })

    if (counter <= 0) {
      res.sendStatus(500);
    }

    else {
      //Organization
      await Organization.updateOne(
        { _id: organization_id },
        { organization_supply: new_supply_amount })
        .then(async () => {
          await SupplyInventory.findOne({ organization_id, year })
            .then(async (result) => {

              var month = result.given_month

              for (let i = 0; i < month.length; i++) {
                month[i] = month[i] - removeSupplyMonth[i]
              }

              var newInventory = { given_month: month }

              await SupplyInventory.updateOne(
                { _id: result._id },
                { ...newInventory }
              )
            })
        })

      //Supply
      const querySupply = await SupplyGiven.deleteMany({ _id: deleteIdList });
      
      const querySession = await RecordSession({
        organization_id: organization_id,
        userAuthId: req.user.auth_id,
        message: `${length} given record/s has been deleted. New current supply stock: ${new_supply_amount}`,
        action: "Delete",
        module: "Supply",
      })

      Promise.all([querySupply, querySession])
      .then((values) => {
        res.sendStatus(200);
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "error" });
  }
};

exports.addSupplyReceived = async (req, res) => {
  try {
    var organization_id = req.body.organization_id;
    var new_supply_amount = req.body.new_supply_amount;
    var newSupplyData = req.body.newSupplyReceived;
    newSupplyData._id = new mongoose.Types.ObjectId();
    newSupplyData.organization_id = mongoose.Types.ObjectId(organization_id);
    newSupplyData.current_supply = new_supply_amount;

    var supply_date = newSupplyData.date
    var year = moment(supply_date).year()

    //Organization
    await Organization.updateOne(
      { _id: organization_id },
      { organization_supply: new_supply_amount }
    )
      .then(async () => {
        await SupplyInventory.findOne({ organization_id, year })
          .then(async (result) => {
            var date = moment(supply_date).month()

            if (result != null) {
              var month = result.received_month
              month[date] = month[date] + newSupplyData.amount

              var newInventory = { received_month: month }

              await SupplyInventory.updateOne(
                { _id: result._id },
                { ...newInventory }
              )
            }

            else {
              // console.log("inventory is null")
              // this resembles 12 months
              var newInventory = {}
              var month = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
              var given_month = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
              month[date] = month[date] + newSupplyData.amount
              var _id = new mongoose.Types.ObjectId();
              newInventory = { received_month: month, given_month, year, organization_id, _id }

              await new SupplyInventory(newInventory).save()
            }

            const newSupply = new SupplyReceived(newSupplyData);

            const querySession = await RecordSession({
              organization_id: organization_id,
              userAuthId: req.user.auth_id,
              message: `Received ${newSupplyData.amount} amount of supply from ${newSupplyData.source}.  New current supply stock: ${new_supply_amount}`,
              action: "Create",
              module: "Supply",
            })

            const querySupply = await newSupply.save();

            Promise.all([querySession, querySupply])
            .then((values) => {
              res.json(values[1]);
            });

          })
      })

  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "error" });
  }
};

exports.updateSupplyReceived = async (req, res) => {
  try {
    var organization_id = req.body.organization_id;
    var new_supply_amount = req.body.new_supply_amount;
    var newSupplyReceived = req.body.newSupplyReceived;
    var supply_id = newSupplyReceived.supply_receive_id
    newSupplyReceived.current_supply = new_supply_amount;

    await SupplyReceived.findOne({ _id: supply_id })
      .then(async (result) => {

        if (result == null) {
          res.sendStatus(500);
        }

        else {
          let oldSupplyReceived = result
          let oldDate = oldSupplyReceived.date
          let newDate = newSupplyReceived.date

          let oldYear = moment(oldDate).year()
          let oldMonth = moment(oldDate).month()
          let newYear = moment(newDate).year()
          let newMonth = moment(newDate).month()

          let oldAmount = oldSupplyReceived.amount
          let newAmount = newSupplyReceived.amount
          let amountBalance = newAmount - oldAmount

          // console.log("yearSame", oldYear == newYear)
          // console.log("monthSame", oldMonth == newMonth)

          let isDateSame = oldYear == newYear && oldMonth == newMonth

          await SupplyInventory.findOne({ organization_id, year: oldYear })
            .then(async (result) => {

              var month = result.received_month

              if (isDateSame == true) {
                month[oldMonth] = month[oldMonth] + amountBalance
              }

              else {
                month[oldMonth] = month[oldMonth] - oldAmount
              }

              var newInventory = { received_month: month }

              await SupplyInventory.updateOne(
                { _id: result._id },
                { ...newInventory }
              )
            })

          if (isDateSame != true) {
            await SupplyInventory.findOne({ organization_id, year: newYear })
              .then(async (result) => {

                if (result != null) {
                  // console.log("result", result)
                  var month = result.received_month
                  month[newMonth] = month[newMonth] + newAmount

                  var newInventory = { received_month: month }

                  // console.log("month", month)

                  await SupplyInventory.updateOne(
                    { _id: result._id },
                    { ...newInventory }
                  )
                }

                else {
                  // console.log("inventory is null")
                  // this resembles 12 months
                  var newInventory = {}
                  var month = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                  var given_month = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                  month[newMonth] = month[newMonth] + newAmount
                  var _id = new mongoose.Types.ObjectId();
                  newInventory = { given_month, received_month: month, year: newYear, organization_id, _id }

                  await new SupplyInventory(newInventory).save()
                }
              })
          }

          //Organization
          const queryOrg = await Organization.updateOne(
            { _id: organization_id },
            { organization_supply: new_supply_amount }
          );
          //Supply
          const querySupply = await SupplyReceived.updateOne(
            { _id: supply_id },
            newSupplyReceived
          );

          const querySession = await RecordSession({
            organization_id: organization_id,
            userAuthId: req.user.auth_id,
            message: `A received record has been change. New current supply stock: ${new_supply_amount}`,
            action: "Update",
            module: "Supply",
          })

          Promise.all([queryOrg, querySupply, querySession])
            .then((values) => {
              res.sendStatus(200);
            });
        }
      })

  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "error" });
  }
};

exports.deleteSupplyReceived = async (req, res) => {
  try {
    // console.log("req.body", req.body)
    var organization_id = req.body.organization_id;
    var new_supply_amount = req.body.new_supply_amount;
    var year = moment(req.body.dateFilter).year()

    var selectedRowKeys = req.body.selectedRowKeys;
    var length = selectedRowKeys.length
    var deleteIdList = []
    var removeSupplyMonth = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

    selectedRowKeys.forEach(row => {
      let rowYear = moment(row.date).year()
      let rowMonth = moment(row.date).month()

      if (year == rowYear) {
        removeSupplyMonth[rowMonth] = removeSupplyMonth[rowMonth] + row.amount

        deleteIdList.push(row._id)
      }
    });

    const counter = await SupplyReceived.countDocuments({ _id: deleteIdList })

    if (counter <= 0) {
      res.sendStatus(500);
    }

    else {
      //Organization
      const queryOrg = await Organization.updateOne(
        { _id: organization_id },
        { organization_supply: new_supply_amount }
      )
        .then(async () => {
          await SupplyInventory.findOne({ organization_id, year })
            .then(async (result) => {

              var month = result.received_month

              for (let i = 0; i < month.length; i++) {
                month[i] = month[i] - removeSupplyMonth[i]
              }

              var newInventory = { received_month: month }

              await SupplyInventory.updateOne(
                { _id: result._id },
                { ...newInventory }
              )
            })
        })

      //Supply
      const querySupply = await SupplyReceived.deleteMany({ _id: deleteIdList });

      const querySession = await RecordSession({
        organization_id: organization_id,
        userAuthId: req.user.auth_id,
        message: `${length} received record/s has been deleted. New current supply stock: ${new_supply_amount}`,
        action: "Delete",
        module: "Supply",
      })

      Promise.all([queryOrg, querySupply, querySession])
        .then((values) => {
          res.sendStatus(200);
        });

    }


  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "error" });
  }
};

exports.getSupplyInventory = async (req, res) => {
  const organization_id = req.params.organization_id;
  const year = req.params.year;

  // console.log("organization_id", organization_id)
  // console.log("year", year)

  try {
    const inventory = await SupplyInventory.findOne({ organization_id, year });
    res.json(inventory);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error });
  }
}

exports.getAllSupplyPerYear = async (req, res) => {
  const organization_id = req.params.organization_id;
  const year = req.params.year;

  try {
    const query1 = await SupplyGiven.find({ organization_id, year })
    const query2 = await SupplyReceived.find({ organization_id, year })

    Promise.all([query1, query2])
      .then(([givenList, receivedList]) => {
        res.json({ givenList, receivedList });
      })
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error });
  }
}