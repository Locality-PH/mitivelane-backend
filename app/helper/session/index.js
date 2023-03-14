const db = require("../../models");
var mongoose = require("mongoose");

const Session = db.session
const Account = db.account

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

exports.RecordSession = async (props) => {
    try {
        const { message, action, module, organization_id, userAuthId } = props;
        //action are Create, Edit, Delete
        console.log("props", props)

        var newSessionData = { 
            organization_id,
            message, 
            action: capitalizeFirstLetter(action), 
            module: capitalizeFirstLetter(module), 
        }

        newSessionData._id = new mongoose.Types.ObjectId();
        newSessionData.organization_id = mongoose.Types.ObjectId(
            organization_id
        );

        await Account.findOne({ uuid: userAuthId }, "_id")
            .then(async (res) => {
                let userId = res._id
                newSessionData.account = userId

                const newSession = new Session(newSessionData);
                await newSession.save();
            })


    } catch (error) {
        throw error
    }
};

