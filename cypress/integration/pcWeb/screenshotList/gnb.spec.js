import {TEST_URL} from "../../../common/constant";

context('gnb screenshot', () => {
    beforeEach(() => {
        cy.wavveonOff()
        cy.homePopupOff()
        cy.intercept('https://apis.wavve.com/cf/supermultisections/GN51').as('getHomeMultiSection')
    })
    // it('카테고리 포커스', () => {
    //     cy.visit(TEST_URL)
    //     cy.get('[data-test="gnb-category"]').trigger('mouseenter')
    //     cy.screenshot({ capture: "viewport", overwrite: true })
    // })
    // it('카테고리 focus > 전체 카테고리', () => {
    //     cy.visit(TEST_URL)
    //     cy.get('[data-test="gnb-category"]').trigger('mouseenter')
    //     cy.get('[data-test="category-all-btn"]').click()
    //     cy.screenshot({ capture: "viewport", overwrite: true })
    // })
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
    // it('my', () => {
    //     cy.csInfo()
    //     cy.visit(TEST_URL + '/my')
    //     cy.scrollTo('bottom')
    //     cy.screenshot({ capture: "fullPage", overwrite: true })
    // })
    it ('검색하기 버튼 팝업', () => {
        cy.visit(TEST_URL)
        cy.get('[data-test="gnb-search"]').click()
        cy.screenshot({ capture: "fullPage", overwrite: true })
    })
})
