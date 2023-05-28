const aws = require('aws-sdk')
require('dotenv').config()

const ses = new aws.SES({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRETE_KEY,
    region: process.env.AWS_REGION 
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
    return ses.sendEmail(params).promise()

}

email.OtpMessage = (name, otp)=>{
    return `Hello ${name}, We got notification for a request to change your password, 
    If this is you, please verify your email with this OTP: ${otp}.
    But if you're not the one please ignore this message and change your password`
}


module.exports = email