const db = require("../../../../models");
const Blotter = db.blotter;
var mongoose = require("mongoose");

const Transporter = require("../../../../../nodemailerSetup")

exports.addMember = async (req, res) => {
	const values = req.body;
	const _id = new mongoose.Types.ObjectId();

	var administratorMail = []
	var editorMail = []

	try {
		console.log(values)

		values.new_member.map((value, i) => {
			if (value.role == "Administrator") {
				administratorMail.push(value.email)
			} else if (value.role == "Editor") {
				editorMail.push(value.email)

			}
		})

		// Need to recode
		if (administratorMail.length != 0) {
			var mailOptions = {
				from: "testmitivelane@gmail.com",
				to: administratorMail,
				subject: "You've been invited to join the organization as Administrator",
				html: `<p>${values.current_user_name} invited you in his Organization</p>
			<a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ">Click here to accept.<a>`
			};

			Transporter.sendMail(mailOptions, function (error, info) {
				if (error) {
					console.log(error);
				} else {
					console.log('Email sent: ' + info.response);
				}
			});

		}

		else if (editorMail.length != 0) {
			var mailOptions = {
				from: "testmitivelane@gmail.com",
				to: editorMail,
				subject: "You've been invited to join the organization as Editor",
				html: `<p>${values.current_user_name} invited you in his Organization</p>
			<a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ">Click here to accept.<a>`
			};

			Transporter.sendMail(mailOptions, function (error, info) {
				if (error) {
					console.log(error);
				} else {
					console.log('Email sent: ' + info.response);
				}
			});

		}


		return res.json("Success");
	} catch (error) {
		return res.json("Error");
	}
};

