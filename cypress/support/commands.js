// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
import {TEST_URL} from "../common/constant"
import voucherIndexAuth from '../fixtures/voucher/voucherIndexAuth.json'
import voucherIndexNotAuth from '../fixtures/voucher/voucherIndexNotAuth.json'
import tasteIntro from "../fixtures/my/tasteIntro.json"
import myDownloads from "../fixtures/my/myDownloads.json"
import loginSuccess from "../fixtures/login/loginSuccess.json"
import profile from "../fixtures/login/profile.json"
import loginFail from "../fixtures/login/loginFail.json"
import multiLineLoginSuccess from "../fixtures/login/multiLineLoginSuccess.json"

Cypress.Commands.add('homePopupOff', () => {
    cy.setCookie('close-popup', '1')
})
Cypress.Commands.add('wavveonOff', () => {
    cy.clearCookie('pzInfo', 'pz')
    cy.setCookie('pz', '%7B%22isPooqzone%22%3Afalse%7D')
})
Cypress.Commands.add('csInfo', () => {
    cy.setCookie('cs', '%7B%22isPooqzone%22%3Afalse%2C%22credential%22%3A%22qTVoToA3lERq8oH%2B8qmH41HIAd7jJ5825KsRdse8MIWeZNx8sRYMecRCvJwH0z%2BO%2B8AgSNTOuOgP4Mza1Qy8H5%2BAoqKyGKYwAop%2Fvy6EwclZbhh8ztFRU0njHv2lOAFKc2uRAb4oScJrN0hh41HEUsg9HMAgypLEg2bFt9qn8V3Mr6kqC5vP04QaiEoxPb2kw%2Ftr11KkqSNdiXj8c6Gpuge5sTxDa%2BcjtKGSvEpTsQdInYxTSRo6r0wtnQIrscB%2F6uaj%2FeLag%2BscYKxUW3mtig%3D%3D%22%2C%22uno%22%3A%2210176435%22%2C%22name%22%3A%22%EC%9E%A5%EC%A7%80%ED%98%9C%22%2C%22profile%22%3A%220%22%2C%22type%22%3A%22general%22%2C%22joindate%22%3A%222019-03-15%22%2C%22profilename%22%3A%22%ED%94%84%EB%A1%9C%ED%95%841%22%2C%22profilecount%22%3A%221%22%2C%22profileimage%22%3A%22img.wavve.com%2Fservice30%2Fprofile%2Fprofile_5.png%22%2C%22needselectprofile%22%3A%22n%22%2C%22needchangepassword%22%3A%22n%22%2C%22apppush%22%3A%22n%22%2C%22apppush_agreedate%22%3A%222019-04-05%22%2C%22movieuicode%22%3A%22GN17%22%2C%22idx%22%3A%226%22%2C%22alt%22%3A%22%EB%A8%B8%EB%A6%AC%EB%A5%BC%20%EC%96%91%EA%B0%88%EB%9E%98%EB%A1%9C%20%EB%94%B0%EA%B3%A0%20%ED%91%B8%EB%A5%B8%EC%83%89%20%EB%AA%A8%EC%9E%90%EB%A5%BC%20%EA%B1%B0%EA%BE%B8%EB%A1%9C%20%EC%93%B4%2010%EB%8C%80%20%EC%97%AC%EC%9E%90%22%7D')
})
Cypress.Commands.add('clickUtilMenuLogin', (id, pw) => {
    cy.get('.nav li').contains('로그인').click()
    cy.get('[data-test="id"]').type(id)
    cy.get('[data-test="pw"]').type(pw)
    cy.get('[data-test="login"]').click()
})
Cypress.Commands.add('login', (id, pw) => {
    cy.get('[data-test="id"]').type(id)
    cy.get('[data-test="pw"]').type(pw)
    cy.get('[data-test="login"]').click()
})
Cypress.Commands.add('loginPopup', (id, pw) => {
    cy.get('[data-test="popup-id"]').type(id)
    cy.get('[data-test="popup-pw"]').type(pw)
    cy.get('[data-test="popup-login"]').click()
})
Cypress.Commands.add('verifiedAdult', () => {
    cy.setCookie('verifiedAdult', '1')
})
Cypress.Commands.add('voucherBannerTest', (type) => {
    console.log('type', type)
    cy.intercept('https://apis.wavve.com/cf/uiservice/banner/single/voucher_index', (req) => {
        if (type === 'notLogin' || type === 'auth') {
            req.reply(voucherIndexAuth)
        } else if (type === 'NotAuth') {
            req.reply(voucherIndexNotAuth)
        }
    }).as('getVoucherBanner')
    cy.visit(TEST_URL + '/voucher/index')
    cy.wait('@getVoucherBanner').then(({ response }) => {
        const list = response.body.band.celllist
        if (list.length > 0) {
            const onNavigationIdx = Cypress._.findIndex(list[0].event_list, (item) => item.type === 'on-navigation')
            if (list[0].event_list[onNavigationIdx].url !== '') {
                cy.get('[data-test="voucher-banner"]').click()
                cy.url().should('contain', list[0].event_list[onNavigationIdx].url)
            } else {
                cy.get('[data-test="voucher-banner"]').should('not.exist')
            }
        }
    })
})
Cypress.Commands.add('SearchTooltip', () => {
    cy.setCookie('tooltip', '%7B%22search%22%3Atrue%7D')
})
Cypress.Commands.add('searchHistory', () => {
    localStorage.setItem('search-history', '라디오&어부&전참시&미우새&골목식당&어바웃타임&표리부동&골&동상이몽&해리포터&런닝맨&나혼자산다&해리&아리랑&무한')
})
Cypress.Commands.add('zzim', (zzim) => {
    const zzimStatus = zzim === 'n' ? 'zzim_true' : 'zzim_false'
    cy.get('[data-test="zzim"]').invoke('attr', 'data-test-is-zzim').should('contain', zzimStatus)
})
Cypress.Commands.add('interceptDelete', ({ url, deleteType, json,  type =''}) => {
    let interceptCount = 0
    let isNotArrayJson = ['download', 'singular', 'package', 'alarm']
    cy.intercept('GET', url, (req) => {
        if (interceptCount === 0) {
            interceptCount += 1
            req.reply(json)
        } else if (interceptCount === 1 && deleteType === 'select') {
            isNotArrayJson.indexOf(type) > -1 ? json.list.shift() :  json[0].list.shift()
            interceptCount += 1
            req.reply(json)
        } else if (interceptCount === 1 && deleteType === 'all') {
            isNotArrayJson.indexOf(type) > -1 ? json.list = [] : json[0].list = []
            interceptCount += 1
            req.reply(json)
        } else if (deleteType === 'select'){
            req.reply(json)
        }
    })
})
Cypress.Commands.add('adultPassword', () => {
    cy.get('#password0').type('1')
    cy.get('#password1').type('2')
    cy.get('#password2').type('3')
    cy.get('#password3').type('4{enter}')
})
Cypress.Commands.add('likeContentsCancel', () => {
    cy.get('[data-test="zzim"]').eq(0).click({ force: true })
    cy.get('[data-test="zzim"]').invoke('attr', 'data-test-is-zzim').should('contain', 'zzim_false')
    cy.window().its('alert').should('be.called')
})
Cypress.Commands.add('likeContents', () => {
    cy.get('[data-test="zzim"]').eq(0).click({ force: true })
    cy.get('[data-test="zzim"]').invoke('attr', 'data-test-is-zzim').should('contain', 'zzim_true')
    cy.window().its('alert').should('be.called')
})
Cypress.Commands.add('teamCalendarListBand', ({ list, index }) => {
    const cell = list[index]
    cy.get('[data-test="baseball-landscape-cell"]').eq(index).click()
    if (cell.game_status === 'PREV') {
        if (cell.svc_id !== '' && cell.alarm_on !== 'N') {
            cy.window().its('confirm').should('be.called')
        } else {
            cy.window().its('alert').should('be.called')
        }
    } else if (cell.game_status === 'END') {
        if (cell.record_yn.toUpperCase() === 'Y') {
            cy.url().should('contain', '/baseball/result')
        } else {
            cy.window().its('alert').should('be.called')
        }
    } else if (cell.game_status === 'CANCEL' || cell.game_status === 'SUSPENDED') {
        cy.window().its('alert').should('be.called')
    } else if (cell.game_status === 'LIVE') {
        if (cell.svc_id === '' && cell.alarm_on === 'N') {
            cy.window().its('alert').should('be.called')
        } else {
            cy.url().should('contain', '/player/baseball/live')
        }
    }
})
Cypress.Commands.add('tasteIntro', () => {
    cy.intercept('https://apis.wavve.com/analysis/intro', (req) => {
        req.reply(tasteIntro)
    })
})
Cypress.Commands.add('setCookieAdultSettings', (val) => {
    cy.setCookie('adult-settings', val)
})

Cypress.Commands.add('utilMenuDropDwon', () => {
    cy.get('.header-over-1depth').contains('회원정보 수정').should('exist')
    cy.get('.header-over-1depth').contains('성인 콘텐츠 설정').should('exist')
    cy.get('.header-over-1depth').contains('알림함').should('exist')
    cy.get('.header-over-1depth').contains('로그아웃').should('exist')
})
Cypress.Commands.add('downloadListSetting', (value) => {
    cy.intercept('https://apis.wavve.com/downloads?contenttype', (req) => {
        req.reply(myDownloads)
    }).as('getDownloads')
    cy.visit(TEST_URL + '/setting/adult', {
        onBeforeLoad(win) {
            cy.stub(win, 'alert').as('windowAlert')
            cy.stub(win, 'open').as('windowOpen')
        }
    })
    if (value === 'L') {
        cy.get('#adult-setting2').click({ force: true })
        cy.adultPassword()
    } else if (value === 'H') {
        cy.get('#adult-setting1').click({ force: true })
    } else {
        cy.get('#adult-setting3').click({ force: true })
        cy.adultPassword()
    }
    cy.get('[data-test="gnb-my"]').click()
    cy.get('[data-test="download-count"]').click()
})
Cypress.Commands.add('adultVerifiedUserAdultContentDownloadClick', (value) => {
    cy.downloadListSetting(value)
    cy.wait('@getDownloads').then(({ response }) => {
        const adultContentsIndex = response.body.list.length - 1
        cy.get('[data-test="download-btn"]').eq(adultContentsIndex).click()
        cy.url().should('contain', '/my/use_list_download')
    })
})
Cypress.Commands.add('NotAdultVerifiedUserAdultContentDownloadClickAndShowAdultIntro', (value) => {
    cy.downloadListSetting(value)
    cy.wait('@getDownloads').then(({ response }) => {
        const adultContentsIndex = response.body.list.length - 1
        cy.get('[data-test="download-btn"]').eq(adultContentsIndex).click()
        cy.url().should('contain', '/adult/download')
    })
})
Cypress.Commands.add('adultContentDownloadClickAndAdultIntroConfirmClick', (value) => {
    cy.downloadListSetting(value)
    cy.wait('@getDownloads').then(({ response }) => {
        const adultContentsIndex = response.body.list.length - 1
        cy.get('[data-test="download-btn"]').eq(adultContentsIndex).click()
        cy.url().should('contain', '/adult/download')
        cy.get('.button-confirm').click()
        cy.url().should('not.contain', '/my/use_list_download')
    })
})
Cypress.Commands.add('verifiedAdultContentDownload', (value) => {
    cy.downloadListSetting(value)
    cy.wait('@getDownloads').then(({ response }) => {
        const adultContentsIndex = response.body.list.length - 1
        cy.get('[data-test="download-btn"]').eq(adultContentsIndex).click()
        cy.url().should('not.contain', '/adult/download')
    })
})
Cypress.Commands.add('setCredential', () => {
    cy.getCookies().should((cookies) => {
        cy.log(cookies)
        const csIndex = Cypress._.findIndex(cookies, {name: 'cs'})
        if (csIndex > -1) {
            cy.setCookie('credential', cookies[csIndex].value)
        }
    })
})
Cypress.Commands.add('getCredential', (cookieName) => {
    return cy.getCookie(cookieName).should((c) => {
        return c.value
    })
    // return cy.getCookies().should((cookies) => {
    //     cy.log(cookies)
    //     const credentialIndex = Cypress._.findIndex(cookies, {name: 'credential'})
    //     if (credentialIndex > -1) {
    //         return cookies[credentialIndex].value
    //     }
    // })
})
let originalWindow = null;

Cypress.Commands.add('openWindow', (url, features) => {
    if(!originalWindow){
        originalWindow = cy.state('window');
        originalWindow.APP_ID = 1; // depth 1
    }
    const w = Cypress.config('viewportWidth')
    const h = Cypress.config('viewportHeight')
    if (!features) {
        features = `width=${w}, height=${h}`
    }
    console.log('openWindow %s "%s"', url, features)

    return new Promise(resolve => {
        if (window.top.MyAltWindow && window.top.MyAltWindow.close) {
            console.log('window exists already')
            window.top.MyAltWindow.close()
        }
        window.top.MyAltWindow = window.top.open(url, 'MyAltWindow', features)
        window.top.MyAltWindow.APP_ID = 2;
        setTimeout(() => {
            cy.state('document', window.top.MyAltWindow.document)
            cy.state('window', window.top.MyAltWindow)
            resolve()
        }, 500)
    })
})
Cypress.Commands.add('switchWindow', () => {
    return new Promise(resolve=>{
        console.log('switch', cy.state('window').APP_ID)
        if(cy.state('window').APP_ID === 1){
            // switch to our ALT window
            console.log('switching to alt popup window...')
            cy.state('document', originalWindow.top.MyAltWindow.document)
            cy.state('window', originalWindow.top.MyAltWindow)
            originalWindow.blur()
        } else {
            console.log('switching back to original window')
            // switch back to originalWindow
            cy.state('document', originalWindow.document)
            cy.state('window', originalWindow)
            originalWindow.top.MyAltWindow.blur()
        }
        window.blur();

        cy.state('window').focus()

        resolve();
    })
})
Cypress.Commands.add('closeWindow', () => {
    return new Promise(resolve=>{
        if(window.top.MyAltWindow && window.top.MyAltWindow.close){
            window.top.MyAltWindow.close() // close popup
            window.top.MyAltWindow = null
        }
        if(originalWindow){
            cy.state('document', originalWindow.document)
            cy.state('window', originalWindow)
        }
        cy.state('window').focus()
        resolve()
    })
})
Cypress.Commands.add('playerRankAssertion', (list, title) => {
    const filteredList = Cypress._.remove(list, (item, index) => {
        return index < 5
    })
    filteredList.forEach((item, index) => {
        cy.get('.section-title').contains(title).parent().find('.player-rank-list > li').eq(index).should('contain', item.rank)
    })
})
Cypress.Commands.add('snsLoginSuccess', (type) => {
    const snsType = type + '-login'
    cy.intercept('https://apis.pooq.co.kr/login', {
        statusCode: 200,
        body: loginSuccess
    }).as('postLogin')
    cy.intercept('https://apis.wavve.com/es/profiles/0', (req) => {
        req.reply(profile)
    })
    cy.visit(TEST_URL + '/sns/login/test')
    cy.get('[data-test='+ snsType +']').click()
    cy.wait('@postLogin').then(({ response }) => {
        cy.url().should('not.contain', '/sns/login/test')
        cy.get('[data-test="util-name"]').should('exist')
    })
})
Cypress.Commands.add('snsLoginMultiUserSuccess', (type) => {
    const snsType = type + '-login'
    cy.intercept('https://apis.wavve.com/es/profiles/0', (req) => {
        req.reply(profile)
    })
    cy.intercept('https://apis.pooq.co.kr/login', {
        statusCode: 200,
        body: multiLineLoginSuccess
    }).as('postLogin')
    cy.visit(TEST_URL + '/sns/login/test')
    cy.get('[data-test='+ snsType +']').click()
    cy.wait('@postLogin').then(({ response }) => {
        cy.url().should('contain', '/member/profile_list')
        cy.url().should('not.contain', '/sns/login/test')
    })
})
Cypress.Commands.add('snsLoginFail', (type) => {
    const snsType = type + '-login'
    cy.intercept('https://apis.wavve.com/cf/supermultisections/GN51').as('getGN51')
    cy.intercept('https://apis.pooq.co.kr/login', {
        statusCode: 550,
        body: loginFail
    }).as('PostLogin')
    cy.visit(TEST_URL + '/sns/login/test')
    cy.get('[data-test='+ snsType +']').click()
    cy.wait('@PostLogin').then(({ response }) => {
        if (type === 'kakao') {
            cy.url().should('contain', '/sns/login/test')
        } else if (type === 'apple') {
            cy.url().should('not.contain', '/sns/login/test')
            cy.url().should('not.contain', '/memger/login/html')
            cy.wait('@getGN51')
            cy.get('[data-test="gnb-home"]').should('have.class', 'on')
        } else {
            cy.url().should('contain', '/member/login.html')
        }
    })
})
