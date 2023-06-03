const {
    SES
} = require("@aws-sdk/client-ses")
require('dotenv').config()

const ses = new SES({
    region: process.env.AWS_REGION,
    credentials :{
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRETE_KEY
    } 
})

const email = {}


email.sendOTP = (sender, receiver, subject, message)=>{
    const params ={
        Destination: {
            ToAddresses: [receiver]
        },
        Message: {
            Body:{
                Text: {
                    Data: message
                }
            },
            Subject:{
                Data: subject
            }
        },
        Source: sender
    }
    return ses.sendEmail(params);

}

email.sendAdminInvitation = (sender, receiver, subject, message)=>{
    const params ={
        Destination: {
            ToAddresses: [receiver]
        },
        Message: {
            Body:{
                Html: {
                    Data: `<html>
                        <p>
                            ${message}
                        </p>
                        
                    </html>`
                }
            },
            Subject:{
                Data: subject
            }
        },
        Source: sender
    }
    return ses.sendEmail(params);

}

email.OtpMessage = (name, usecase, otp)=>{
    return (`Hello ${name}, We got notification for a request to change your ${usecase}, 
    If you are the one that made this request, please verify your email with this OTP: ${otp}.
    But if you're not the one please ignore this message and change your password`)
}

email.adminInvitationMessage = (username, otp)=>{
    return (`Hello ${username}, this message is an invitation from Medpharmconsult to become an admin on the platform.
    If you're not interested in becoming an admin in Medpharmconsult, you can ignore this message.
    But if you are interested you can accept the invitation by clicking <a href=https://medpharmconsult.com/accept-admin-invitation?id=${username}&otp=${otp}>Accept invitation</a>`)
}


module.exports = email