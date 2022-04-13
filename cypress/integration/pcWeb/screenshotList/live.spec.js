import {TEST_URL} from "../../../common/constant";
import likeChannel from "../../../fixtures/gnbMenu/likeChannel.json";
import alarmContents from "../../../fixtures/gnbMenu/alarmContents.json";
context('라이브', () => {
    beforeEach(() => {
        cy.wavveonOff()
        cy.homePopupOff()
    })
    // it('라이브 > 좋아요 한 찜 채널 없는 경우', () => {
    //     cy.intercept('https://apis.wavve.com/cf/supermultisections/GN54').as('getGN54')
    //     cy.visit(TEST_URL + '/live')
    //     cy.wait('@getGN54').then(({ response }) => {
    //         cy.screenshot({ capture: "viewport", overwrite: true })
    //     })
    // })
    // it('라이브 > 좋아요 한 찜 채널 있는 경우', () => {
    //     cy.csInfo()
    //     cy.intercept('https://apis.wavve.com/zzim/contents', (req) => {
    //         req.reply(likeChannel)}).as('getLikeChannel')
    //     cy.visit(TEST_URL + '/live')
    //     cy.screenshot({ capture: "viewport", overwrite: true })
    // })
    // it('시청예약 선택시 내역 없는 팝업', () => {
    //     cy.visit(TEST_URL + '/live')
    //     cy.get('[data-test="reservation"]').click({ force: true })
    //     cy.screenshot({ capture: "viewport", overwrite: true })
    // })
    // it('시청예약 선택시 내역 있는 팝업', () => {
    //     cy.visit(TEST_URL + '/live')
    //     cy.intercept('https://apis.wavve.com/alarms-contents', (req) => {
    //         req.reply(alarmContents)
    //     }).as('getAlarmsContents')
    //     cy.get('[data-test="reservation"]').click({ force: true })
    //     cy.screenshot({ capture: "viewport", overwrite: true })
    // })
    // it('스케줄 선택', () => {
    //     cy.visit(TEST_URL + '/schedule')
    //     cy.screenshot({ capture: "fullPage", overwrite: true })
    // })
    // it('스케줄 시청하기 레이어팝업', () => {
    //     cy.visit(TEST_URL + '/schedule')
    //     cy.get('.tt-program.tt-ing').eq(0).click()
    //     cy.scrollTo('top')
    //     cy.screenshot({ capture: "viewport", overwrite: true })
    // })
    // it('스케줄 시청예약 레이어팝업', () => {
    //     cy.visit(TEST_URL + '/schedule')
    //     cy.get('.tt-program.tt-next').eq(0).click()
    //     cy.scrollTo('top')
    //     cy.screenshot({ capture: "viewport", overwrite: true })
    // })

})
