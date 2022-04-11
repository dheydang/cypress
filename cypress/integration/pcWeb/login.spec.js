import {TEST_URL} from "../../common/constant";
import loginSuccess from '../../fixtures/login/loginSuccess.json'
import snsLoginNotSignUp from '../../fixtures/login/snsLoginNotSignUp.json'
import loginFail from '../../fixtures/login/loginFail.json'
import profile from '../../fixtures/login/profile.json'
import multiLineLoginSuccess from '../../fixtures/login/multiLineLoginSuccess.json'
context('login', () => {
    beforeEach(() => {
        cy.homePopupOff()
        cy.wavveonOff()
        cy.intercept('GET', '/login').as('getLogin')
    })
    it('id 저장', () => {
        cy.setCookie('userId', 'jihye0121')
        cy.visit(TEST_URL + '/member/login')
        cy.get('[data-test="id-save"]').should('be.checked')
        cy.get('[data-test="id"]').then(($input) => {
            expect($input.val()).to.contain('jihye0121')
        })
    })
    it('자동 로그인', () => {
        cy.visit(TEST_URL + '/member/login')
        cy.get('#login-auto').check({ force: true })
        cy.login('jihye0121', 'pooq1004!')
        cy.wait('@getLogin')
        cy.url().should('not.contain', '/member/login')
        cy.getCookies().then((cookies) => {
            const credentialIndex = Cypress._.findIndex(cookies, {name: 'credential'})
            cy.getCookie('credential').should('exist')
        })
    })
    it('아이디 찾기', async () => {
        cy.visit(TEST_URL + '/member/login')
        await cy.get('[data-test="find-id"]').click()
        cy.url().should('contain', '/find/id')
    })
    it('비밀번호 재설정', async () => {
        cy.visit(TEST_URL + '/member/login')
        await cy.get('[data-test="find-pw"]').click()
        cy.url().should('contain', '/find/password')
    })
    it('회원가입', async () => {
        cy.visit(TEST_URL + '/member/login')
        await cy.get('[data-test="sing-up"]').click()
        cy.url().should('contain', '/signup')
    })
})
context('sns 로그인 팝업 발생 여부', () => {
    beforeEach(() => {
        cy.homePopupOff()
        cy.wavveonOff()
        cy.visit(TEST_URL + '/member/login', {
            onBeforeLoad(win) {
                cy.stub(win, 'open').as('windowOpen')
            }
        })
    })
    // it('카카오톡', () => {
    //     cy.get('[data-test="kakao-login"]').click()
    //     cy.window().its('open').should('be.called')
    // })
    it('skt', () => {
        cy.get('[data-test="skt-login"]').click()
        cy.url().should('not.contain', 'www.wavve.com/member/login')
    })
    it('naver', () => {
        cy.get('[data-test="naver-login"]').click()
        cy.window().its('open').should('be.called')
    })
    it('facebook', () => {
        cy.get('[data-test="facebook-login"]').click()
        cy.window().its('open').should('be.called')
    })
    it('apple', () => {
        cy.get('[data-test="apple-login"]').click()
        cy.url().should('not.contain', 'www.wavve.com/member/login')
    })
})
context('sns 로그인', () => {
    beforeEach(() => {
        cy.homePopupOff()
        cy.wavveonOff()
    })
    // 토큰때문에 확인이 안됨..
    // it('카카오톡 로그인시 가입되어있지 않을 경우 회원가입페이지로 이동 확인', () => {
    //     cy.intercept('https://apis.pooq.co.kr/login', {
    //         statusCode: 551,
    //         body: snsLoginNotSignUp
    //     }).as('PostLogin')
    //     cy.visit(TEST_URL + '/sns/login/test', {
    //         onBeforeLoad(win) {
    //             cy.stub(win, 'alert').as('windowAlert')
    //         }
    //     })
    //     cy.get('[data-test="kakao-login"]').click()
    //     cy.wait('@PostLogin').then(({ response }) => {
    //         cy.url().should('contain', 'wavve.com/signup/sns/kakao/terms')
    //         cy.window().its('alert').should('be.called')
    //     })
    // // })
    it('카카오톡 로그인 성공시 이전화면 또는 홈화면으로 이동 확인', () => {
        cy.snsLoginSuccess('kakao')
    })
    it('카카오 인증 에러 또는 인증 시간이 만료될 경우 현재 페이지 머무는지 확인', () => {
        cy.snsLoginFail('kakao')
    })
    it('카카오 다회선 로그인 성공시 프로필 선택 화면으로 이동 확인', () => {
        cy.snsLoginMultiUserSuccess('kakao')
    })
    it('skt 로그인 성공시 홈화면 또는 이전페이지로 이동 확인', () => {
        cy.snsLoginSuccess('skt')
    })
    it('skt 로그인 실패시 로그인 페이지로 이동 확인', () => {
        cy.snsLoginFail('skt')
    })
    it('skt 다회선 로그인 성공시 프로필 선택 화면으로 이동 확인', () => {
        cy.snsLoginMultiUserSuccess('skt')
    })
    it('페이스북 로그인 성공시 이전페이지 또는 홈페이지로 이동 확인', () => {
        cy.snsLoginSuccess('facebook')
    })
    it('페이스북 다회선 로그인 성공시 프로필 선택 화면으로 이동 확인', () => {
        cy.snsLoginMultiUserSuccess('facebook')
    })
    it('페이스북 로그인 실패시 로그인 페이지로 이동 확인', () => {
        cy.snsLoginFail('facebook')
    })
    it('애플 로그인 성공시 이전페이지 또는 홈페이지로 이동 확인', () => {
        cy.snsLoginSuccess('apple')
    })
    it('애플 로그인 실패시 홈으로 이동 확인', () => {
        cy.snsLoginFail('apple')
    })
    it('애플 다회선 로그인 성공시 프로필 선택 화면으로 이동 확인', () => {
        cy.snsLoginMultiUserSuccess('apple')
    })
})
context( '로그인 api', () => {
    beforeEach(() => {
        cy.homePopupOff()
        cy.wavveonOff()
        cy.intercept('POST', 'https://apis.pooq.co.kr/login').as('postLogin')
        cy.intercept('https://apis.wavve.com/es/profiles?').as('getProfiles')
        cy.visit(TEST_URL + '/member/login')
    })
    it('1회선 로그인', () => {
        cy.login('jihye0121', 'pooq1004!')
        cy.wait('@postLogin').then(({ response }) => {
            if (response.statusCode === 200 && response.body.needselectprofile === 'n') {
                cy.url().should('contain', 'index')
            }
        })
    })
    it('다회선 로그인', () => {
        cy.login('jihye0667', 'pooqwavve1!')
        cy.wait('@postLogin').then(({ response }) => {
            if (response.statusCode === 200 && response.body.needselectprofile === 'y') {
                cy.url().should('contain', '/member/profile_list')
                cy.wait('@getProfiles').then(async (interception) => {
                    cy.get('.user-style').should('length', interception.response.body.list.length)
                    await cy.get('.user-style').eq(1).click()
                    cy.url().should('contain', 'index')
                    cy.get('[data-test="util-name"] > button').should('include.text', interception.response.body.list[1].profilename)
                })
            }
        })
    })
})
