import {TEST_URL} from "../../common/constant";

context('wavveon 입장하기', () => {
    beforeEach(() => {
        cy.clearCookies()
        cy.visit(TEST_URL)
        cy.get('[data-test="wavveon-enter"]').click({ force: true })
    })
    it('wavveon 입장하기 버튼 선택시 웨이브온 이름 노출 확인', () => {
        cy.get('.header-gnb.hd-pooqzone').should('exist')
        cy.get('[data-test="wavveon-name"]').should('exist')
    })
    it('wavveon 나가기 선택시 웨이브 홈페이지 노출되는지 확인', () => {
        cy.get('[data-test="wavveon-logout"]').click()
        cy.get('[data-test="wavveon-logout"]').should('not.exist')
        cy.get('.header-nav').contains('로그인').should('exist')
    })
})
context('웨이브온 더 알아보기, 기존 서비스로 보기', () => {
    beforeEach(() => {
        cy.visit(TEST_URL)
    })
    it('웨이브온 더 알아보기 선택시 인트로2화면 노출되는지 확인', () => {
        cy.get('[data-test="view-more-wavveon"]').click()
        cy.get('.pz-intro02-slide').should('exist')
    })
    it('웨이브온 더 알아보기 > 웨이브 둘러보기 선택시 웨이브온 홈페이지로 이동 확인', () => {
        cy.get('[data-test="view-more-wavveon"]').click()
        cy.get('[data-test="go-wavve"]').click()
        cy.get('.header-gnb.hd-pooqzone').should('not.exist')
        cy.get('.header-nav').contains('로그인').should('exist')
    })
    it('기존 서비스로 보기 선택시 웨이브 홈페이지로 이동되는지 확인', () => {
        cy.get('[data-cy="go-wavve"]').click()
        cy.get('.header-nav').contains('로그인').should('exist')
    })
})
