import {TEST_URL} from "../../common/constant";

context('성인 콘텐츠 설정값에 따른 화면 결과값', () => {
    beforeEach(() => {
        cy.clearCookies()
        cy.homePopupOff()
        cy.csInfo()
        cy.wavveonOff()
        cy.intercept('https://apis.pooq.co.kr/user/pin/adult').as('getAdult')
        cy.visit(TEST_URL + '/setting/adult')
    })
    it('성인 콘텐츠 api로 성인 콘텐츠 설정 체크값 확인', () => {
        cy.wait('@getAdult').then(({ response }) => {
            const settings = response.body.settings
            if (settings === 'H') {
                cy.get('#adult-setting1').should('be.checked')
            } else if (settings === 'L') {
                cy.get('#adult-setting2').should('be.checked')
            } else if (settings === 'N') {
                cy.get('#adult-setting3').should('be.checked')
            }
        })
    })
})
context('성인 콘텐츠 설정 페이지', () => {
    beforeEach(() => {
        cy.homePopupOff()
        cy.csInfo()
        cy.wavveonOff()
        cy.intercept('POST', 'https://apis.pooq.co.kr/user/pin/adult/confirm').as('postConfirm')
        cy.intercept('GET', 'https://apis.pooq.co.kr/user/pin/adult?').as('getAdult')
        cy.visit(TEST_URL + '/setting/adult', {
            onBeforeLoad(win) {
                cy.stub(win, 'open').as('windowOpen')
            }
        })
    })
    it('성인 콘텐츠 숨김 선택시 숨김으로 쿠키값 변경되고 숨김상태 체크되었는지 확인', () => {
        cy.get('#adult-setting1').click({ force: true })
        cy.wait('@postConfirm').then(({ response }) => {
            if (response.statusCode === 200) {
                cy.wait(5000)
                cy.getCookie('adult-settings').should('have.property', 'value', 'H')
                cy.get('#adult-setting1').should('be.checked')
            }
        })
    })
    it('성인 콘텐츠 잠금 선택시 잠금으로 쿠키 변경되고 잠금상태 체크되었는지 확인', () => {
        cy.get('#adult-setting2').click({ force: true })
        cy.adultPassword()
        cy.wait('@postConfirm').then(({ response }) => {
            if (response.statusCode === 200) {
                cy.getCookie('adult-settings').should('have.property', 'value', 'L')
                cy.get('#adult-setting2').should('be.checked')
            }
        })
    })
    it('차단하지 않음 선택시 비밀번호 창 노출되며 쿠키 변경되고 차단하진않음상태 체크되었는지 확인', () => {
        cy.get('#adult-setting3').click({ force: true })
        cy.adultPassword()
        cy.wait('@postConfirm').then(({ response }) => {
            if (response.statusCode === 200) {
                cy.getCookie('adult-settings').should('have.property', 'value', 'N')
                cy.get('#adult-setting3').should('be.checked')
            }
        })
    })
    it('자녀보호설정 페이지 취소 선택시 성인콘텐츠설정 화면으로 이동', () => {
        cy.get('#adult-setting3').click({ force: true })
        cy.get('.button-cancel').click({ force: true })
        cy.url().should('contain', '/setting/adult')
    })
    it('자녀보호설정 페이지 성일 비밀번호 초기화 선택시 윈도우 팝업창 노출 확인', () => {
        cy.get('#adult-setting3').click({ force: true})
        cy.get('[data-test="adult-pw-reset"]').click({ force: true })
        cy.on('window:confirm', () => true)
        cy.window().its('open').should('be.called')
    })
    it('성인 비밀번호 설정 버튼 선택시 윈도우 팝업창 노출 확인', () => {
        cy.get('[data-test="adult-pw-setting"]').click({ force: true })
        cy.window().its('open').should('be.called')
    })
})
