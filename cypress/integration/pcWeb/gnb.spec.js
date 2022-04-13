import {TEST_URL} from "../../common/constant";

context('GNB', () => {
    beforeEach(() => {
        cy.homePopupOff()
        cy.wavveonOff()
        cy.intercept('https://apis.wavve.com/cf/supermultisections/GN52').as('getGN52')
        cy.visit(TEST_URL)
    })
    it('로고 선택시 홈 화면 노출되는지 확인', async () => {
        cy.visit(TEST_URL)
        await cy.get('.logo a').click()
        cy.get('[data-test="gnb-home"]').should('have.class', 'on')
    })
    it('홈, 카테고리, 라이브, 마이 버튼 노출되는지 확인', () => {
        cy.get('[data-test="gnb-home"').should('exist')
        cy.get('[data-test="gnb-category"').should('exist')
        cy.get('[data-test="gnb-live"').should('exist')
        cy.get('[data-test="gnb-my"').should('exist')
    })
    it('홈 선택시 홈 화면 노출되는지 확인', async () => {
        cy.visit(TEST_URL)
        await cy.get('[data-test="gnb-home"]').click()
        cy.get('[data-test="gnb-home"]').should('have.class', 'on')
    })
    it('카테고리 focus-in 카테고리 메뉴 리스트 노출되는지 확인', () => {
        cy.get('[data-test="gnb-category"]').trigger('mouseenter')
        cy.get('.category-list-layer').should(($div) => {
            expect($div).to.have.css('display', 'block')
        })
    })
    it('카테고리 focus-in > focus-out 카테고리 메뉴 리스트 노출안되는지 확인', () => {
        cy.get('[data-test="gnb-category"]').trigger('mouseenter')
        cy.get('[data-test="gnb-category"]').trigger('mouseleave')
        cy.get('.category-list-layer').should(($div) => {
            expect($div).to.have.css('display', 'none')
        })
        // TODO: 웹접근성 작업 완료되면 아래 코드로 변경
        // cy.get('.category-list-item').should('have.class', 'on')
    })
    it('LIVE 클릭시 라이브 화면으로 이동하는지 확인', async () => {
        await cy.get('[data-test="gnb-live"]').click()
        cy.get('[data-test="gnb-live"]').should('contain', 'LIVE')
        cy.url().should('contain', 'live')
    })
    it('로그인 상태 MY 클릭시 로그인화면 > 로그인 > MY화면으로 이동하는지 확인', async () => {
        cy.csInfo()
        await cy.get('[data-test="gnb-my"]').click()
        cy.get('[data-test="gnb-my"]').should('have.class', 'on')
        cy.wait('@getGN52')
        cy.url().should('contain', 'my')
    })
    it('미로그인 상태 MY 클릭시 MY 화면 이동하는지 확인', () => {
        cy.get('[data-test="gnb-my"]').click()
        cy.login('jihye0121', 'pooq1004!')
        cy.get('[data-test="gnb-my"]').should('have.class', 'on')
        cy.wait('@getGN52')
        cy.url().should('contain', 'my')
    })
})
