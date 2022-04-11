import {TEST_URL} from "../../common/constant";

context('footer', () => {
    beforeEach(() => {
        cy.homePopupOff()
        cy.wavveonOff()
        cy.visit(TEST_URL)
        cy.scrollTo('bottom')
    })
    it('footer Menu > 회사소개, 인재채용 (target=_blank) 새창 속성 확인', () => {
        cy.get('.footer-menu  ul').then(($ul) => {
            cy.get($ul).contains('회사소개').should('have.attr', 'href', '/customer/company.html')
            cy.get($ul).contains('회사소개').should('have.attr', 'target', '_blank')
            cy.get($ul).contains('인재채용').should('have.attr', 'href', 'https://wavve.career.greetinghr.com/')
            cy.get($ul).contains('인재채용').should('have.attr', 'target', '_blank')
        })
    })
    it('footer Menu > 서비스 소개로 이동 확인', async() => {
        await cy.get('.footer-menu  ul').contains('서비스 소개').click()
        cy.url().should('contain', '/customer/service')
    })
    it('footer Menu > 이용약관으로 이동 확인', async () => {
        await cy.get('.footer-menu  ul').contains('이용약관').click()
        cy.url().should('contain', '/customer/agreement')
    })
    it('footer Menu > 개인정보 처리방침으로 이동', async () => {
        await cy.get('.footer-menu  ul').contains('개인정보 처리방침').click()
        cy.url().should('contain', '/customer/agreement?category=privacy')
    })
    it('footer Menu > 고객센터로 이동하는지 확인', async () => {
        await cy.get('.footer-menu  ul').contains('고객센터').click()
        cy.url().should('contain', '/customer/notice_list')
    })
    it('통신판매업 정보 공개선택시 a태그 속성이 이동할 주소과 새창으로 되어있는지 확인', () => {
        cy.get('[data-test="mailing-industry"]').should('have.attr', 'href', 'http://www.ftc.go.kr/bizCommPop.do?wrkr_no=220-88-38020')
        cy.get('[data-test="mailing-industry"]').should('have.attr', 'target', '_blank')
    })
    it('전자우편주소 선택시 href에 mailto로 되어있는지 확인', () => {
        cy.get('[data-test="email"]').should('have.attr', 'href', 'mailto:helpdesk@wavve.com')
    })
    it('wavveon selectbox 임의값 선택시 해당 url로 이동되는지 확인', async () => {
        await cy.get('[data-test="wavveon"]').select('웨이브온 도서관 서비스')
        cy.url().should('contain', 'join_library')
    })
    it('웨이브 페이스북선택시 웨이브 페이스북으로 이동되는지 확인', () => {
        cy.get('[data-test="wavve-facebook"]').should('have.attr', 'target', '_blank')
        cy.get('[data-test="wavve-facebook"]').should('have.attr', 'href', 'https://www.facebook.com/wavve.official/')
    })
    it('웨이브 포스트 선택시 포스트페이지로 이동되는지 확인', () => {
        cy.get('[data-test="wavve-post"]').should('have.attr', 'target', '_blank')
        cy.get('[data-test="wavve-post"]').should('have.attr', 'href', 'http://m.post.naver.com/my.nhn?memberNo=12375258')
    })
})
