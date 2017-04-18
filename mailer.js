//pacotes
const sendgrid   = require('sendgrid')
const helper     = sendgrid.mail;
const sg         = sendgrid(process.env.SENDGRID_API_KEY);

// defaults
const from_email = new helper.Email('no-replay@mercadobackoffice.com');
const to_email   = new helper.Email('express.features@mercadobackoffice.com');
// const to_email   = new helper.Email('gustavo.felizola@mercadobackoffice.com');




module.exports = function( mailBody, subject ){
    return new Promise( ( resolve, reject ) => {
        var content = new helper.Content('text/html', mailBody );
        var mail = new helper.Mail(from_email, subject, to_email, content);

        var request = sg.emptyRequest({
            method : 'POST',
            path   : '/v3/mail/send',
            body   : mail.toJSON(),
        });

        sg.API(request, (error, response) => {
            if ( error ) {
                reject( error );
            } else {
                resolve( response );
            }
        });
    });
}