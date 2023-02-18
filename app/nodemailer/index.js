const Transporter = require("../../nodemailerSetup");
const handlebars = require("handlebars");
const path = require("path");
const fs = require("fs");

exports.sendMail = async (data) => {
	try {
		const { template, replacements, from, to, subject } = data

		const filePath = path.join(__dirname, "../" + template);
		const source = fs.readFileSync(filePath, 'utf-8').toString();
		const templateCompile = handlebars.compile(source);


		const htmlToSend = templateCompile(replacements);

		var mailOptions = {
			from: from,
			to: to,
			subject: subject,
			html: htmlToSend,
		};

		await Transporter.sendMail(mailOptions, function (error, info) {
			if (error) {
				console.log(error);
			} else {
				console.log("Email sent: " + info.response);
			}
		});

	} catch (error) {
		console.log(error)
	}
}
