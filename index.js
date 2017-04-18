#!/usr/bin/env node
'use strict';

// Modulos Externos
const _        = require('lodash');
const colors   = require('colors');
const inquirer = require('inquirer');
const moment   = require('moment');

// Modulos Internos
const api      = require('./API');
const mailer   = require('./mailer');

// Firulas
const Spinner  = require('cli-spinner').Spinner;
const spinner  = new Spinner('%s');
spinner.setSpinnerString("⣾⣽⣻⢿⡿⣟⣯⣷");


// Global
var cards, deleteCards = false;

const onError = err => {
    console.error(err);
    spinner.stop(true);
}

const getCards = function(){
    spinner.setSpinnerTitle('Carregando projeto/cards');
    spinner.start();

    api('projects/columns/882651/cards')
        .get()
        .then( data => {
            spinner.stop(true);

            cards = data;
            loadIssues( cards );

        })
        .catch( onError );
}

const loadIssues = function( data ) {
    spinner.setSpinnerTitle('Carregando issues de Done');
    spinner.start();

    // let lastCommits = _.takeRight(data, 2);

    Promise.all(
        data.map( issue => {
            let issueUrl = issue.content_url.replace('https://api.github.com/','');
            return api( issueUrl ).get();
        })
    ).then( allIssuesData => {
        spinner.stop(true);

        _.sortBy( allIssuesData, 'number' );

        console.log("Total de issues em done:", allIssuesData.length);

        let mailBody = `<h2>Total de issues em done: ${allIssuesData.length} </h2>
            <p><b>Cards arquivados:</b></p>
            <ul>`;

        allIssuesData.forEach( issue => {
            let msg = `${issue.number} - ${issue.title} (${issue.user.login}) - ${issue.state}`;
            msg = issue.state === 'closed' ? msg.gray : msg.yellow ;
            console.log( msg );

            mailBody += `<li style="margin: 4px 0;">
                <a href="${ issue.html_url }" target="_blank" style="color: black; text-decoration: none">
                    <span style="color: #3367d6">${ issue.number }</span> -
                    ${ issue.title } (<i>by: ${ issue.user.login }</i>)
                    <span style="color: ${ issue.state === 'open' ? 'green' : 'black' }">${ issue.state }</span>
                </a>
            </li>`;

        });

        mailBody += `</ul>
        <p>E-mail enviado em ${ moment().format('DD/MM/YYYY HH:mm') } por kpl-project-archiver</p>`

        sendMail( mailBody );
    });
}

const sendMail = function( mailBody ) {
    spinner.setSpinnerTitle('Enviando issues por e-mail');
    spinner.start();

    let subject    = `Fechamento de items Done do projeto de Features - ${ moment().format('DD/MM/YYYY HH:mm') }`;

    mailer( mailBody, subject ).then( response => {
        spinner.stop(true);

        console.log( 'Email enviado'.green );
        removeCardsOnProject();

    }).catch( err => {
        spinner.stop(true);
        console.log('Erro no envio de e-mail'.red);
        console.log( err );
    });
};

const removeCardsOnProject = function() {
    if ( deleteCards ) {
        spinner.setSpinnerTitle('Arquivando cards');
        spinner.start();

        // let card = _.last( cards );

        Promise.all(
            cards.map(
                card => api(`projects/columns/cards/${ card.id }`).delete()
            )
        ).then( results => {

            spinner.stop(true);
            console.log('Todos os cards foram arquivados com sucesso'.green);

        }).catch( error => {
            spinner.stop(true);
            console.log('Erro ao arquivar os cards'.red);
            console.error( error );
        });
    }
};

inquirer.prompt([{
    type     : 'input',
    name     : 'deleteCards',
    message  : 'Remover cards que estão em Done (digite sim)',
}]).then(answers => {
    deleteCards      = answers.deleteCards === 'sim';

    getCards();
});