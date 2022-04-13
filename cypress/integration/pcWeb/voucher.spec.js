import {TEST_URL} from "../../common/constant";
import voucherPurchaseProductsAll from '../../fixtures/voucher/voucherPurchaseProductsAll.json'
function addComma (num) {
    const regexp = /\B(?=(\d{3})+(?!\d))/g
    return num.toString().replace(regexp, ',')
}
context('팝업 구매테스트', () => {
    beforeEach(() => {
        cy.homePopupOff()
        cy.wavveonOff()
        // cy.csInfo()
        cy.intercept('POST', 'https://apis.pooq.co.kr/login').as('postLogin')
        cy.visit(TEST_URL + '/voucher/index', {
            onBeforeLoad(win) {
                cy.stub(win, 'close').as('windowClose')
            }
        })
        cy.clickUtilMenuLogin('jihye0121', 'pooq1004!')
    })
    it('구매하기 버튼 선택시 팝업 노출 뒤 구매 성공시 팝업 닫힘', () => {
        cy.get('[data-test="voucher-purchase-test"]').click()
        cy.openWindow('/voucher/purchase_test')
        cy.get('[data-test="purchase"]').click()
        cy.wait('@postLogin').then(({ response, request }) => {
            expect(response.statusCode).eq(200)
        })
        cy.switchWindow()
    })
    it('구매하기 버튼 선택시 팝업 노출 > 구매하기 > 결제 취소 버튼 선택 > 팝업 닫힘', () => {
        cy.get('[data-test="voucher-purchase-test"]').click()
        cy.openWindow('/voucher/purchase_test')
        cy.get('[data-test="purchase-and-cancel"]').click()
        cy.window().then((win) => {
            cy.stub(win, 'close')
            win.close()
            expect(win.close).to.be.called
        })
        cy.switchWindow()
    })
    it('구매하기 버튼 선택시 팝업 노출 > 취소 버튼 선택 > 팝업 닫힘', () => {
        cy.get('[data-test="voucher-purchase-test"]').click()
        cy.openWindow('/voucher/purchase_test')
        cy.get('[data-test="cancel"]').click()
        cy.window().then((win) => {
            cy.stub(win, 'close')
            win.close()
            expect(win.close).to.be.called
        })
        cy.switchWindow()
    })
})
context('wavve 이용권', () => {
    beforeEach(() => {
        cy.homePopupOff()
        cy.wavveonOff()
        cy.intercept('GET', '/login').as('getLogin')
        cy.visit(TEST_URL + '/voucher/index', {
            onBeforeLoad(win) {
                cy.stub(win, 'open').as('windowOpen')
            }
        })
    })
    it('코인, 쿠폰 메뉴 선택 메뉴이동 확인', async () => {
        await cy.get('[data-test="voucher-menu"]').contains('쿠폰·코인').click()
        cy.get('[data-test="voucher-menu"]').contains('쿠폰·코인').parent().should('have.class', 'nav-depth-on')
    })
    it('웨이브온 메뉴 선택 메뉴 이동 확인', async () => {
        await cy.get('[data-test="voucher-menu"]').contains('웨이브온 이용권').click()
        cy.get('[data-test="voucher-menu"]').contains('웨이브온 이용권').parent().should('have.class', 'nav-depth-on')
    })
    // 미로그인 배너
    it('미로그인 상태 이용권 배너 클릭시 로그인페이지 이동 확인', () => {
        cy.voucherBannerTest('notLogin')
    })
    // 본인인증 안하고 이용권 없는 계정
    it('로그인 상태 본인인증 안했을경우 배너 선택 해당 url 이동 확인', () => {
       cy.voucherBannerTest('notAuth')
    })
    //본인인증하고 이용권 없는 계정
    it('로그인 > 본인인증 완료 > 이용권 x', () => {
        cy.voucherBannerTest('auth')
    })
    it('이벤트 내용을 확인하세요! 토글 열기 버튼 선택 이벤트 내용 열림 닫힘 확인', () => {
        cy.get('.ticket-event-desc').contains('이벤트 내용을 확인하세요!').click( { force: true })
        cy.get('.ticket-event-text').should('have.css', 'display', 'block')
        cy.get('.ticket-event-desc').contains('이벤트 내용을 확인하세요!').click({ force: true })
        cy.get('.ticket-event-text').should('have.css', 'display', 'none')
    })
    it('이용권 ? 버튼 선택 레이어팝업 노출 확인', () => {
        cy.get('[data-test="question-btn"]').click()
        cy.get('[data-test="voucher-info-popup"]').should(($div) => {
            expect($div).to.have.css('display', 'block')
        })
    })
    it('이용권 ? 버튼 클릭 > 팝업 이용권 가격 api와 동일하게 노출되는지 확인', () => {
        cy.get('[data-test="question-btn"]').click()
        const productsList = voucherPurchaseProductsAll[0].productgroups[0].products
        const basicIndex = Cypress._.findIndex(productsList, (item) => item.concurrency[0].product_name === 'Basic')
        const standardIndex = Cypress._.findIndex(productsList, (item) => item.concurrency[0].product_name === 'Standard')
        const premiumIndex = Cypress._.findIndex(productsList, (item) => item.concurrency[0].product_name === 'Premium')
        cy.get('[data-test="basic"]').should('include.text', addComma(productsList[basicIndex].concurrency[0].amount))
        cy.get('[data-test="standard"]').should('include.text', addComma(productsList[standardIndex].concurrency[0].amount))
        cy.get('[data-test="premium"]').should('include.text', addComma(productsList[premiumIndex].concurrency[0].amount))
    })
    it('이용권 ? 버튼 클릭 > x 버튼 선택시 레이어팝업 닫힘 확인', () => {
        cy.get('[data-test="question-btn"]').click()
        cy.get('[data-test="voucher-popup-close"]').click()
        cy.get('[data-test="voucher-info-popup"]').should(($div) => {
            expect($div).to.have.css('display', 'none')
        })
    })
    it('서비스 이용 주의사항 자세히보기 선택시 고객센터 faq화면으로 이동 확인', () => {
        cy.get('.bt-noti-wrap').scrollIntoView()
        cy.get('[data-test="voucher-noti-more"]').contains('자세히보기').click()
        cy.url().should('contain', '/customer/faq')
    })
    it('미로그인시 이용권 구매 주의사항 > 구매내역 바로가기 클릭 > 로그인화면 확인', () => {
        cy.get('.bt-noti-wrap').scrollIntoView()
        cy.get('[data-test="voucher-subscription-ticket"]').contains('구매내역 바로가기').click()
        cy.url().should('contain', 'member/login')
    })
    it('로그인상태 이용권 구매 주의사항 > 구매내역 바로가기 클릭 > 로그인화면 확인', () => {
        cy.clickUtilMenuLogin('jihye0121', 'pooq1004!')
        cy.wait('@getLogin')
        cy.get('.bt-noti-wrap').scrollIntoView()
        cy.get('[data-test="voucher-subscription-ticket"]').contains('구매내역 바로가기').click()
        cy.url().should('contain', '/my/subscription_ticket')
    })
    it('미로그인시 이용권 구매하기 버튼 선택시 로그인 화면 확인', () => {
        cy.get('[data-test="voucher-purchase"]').click()
        cy.url().should('contain', 'member/login')
    })
    it('로그인 상태 이용권 구매하기 버튼 선택시 윈도우 팝업 열리는지 확인', () => {
        cy.clickUtilMenuLogin('jihye0121', 'pooq1004!')
        cy.wait('@getLogin')
        cy.get('.bt-noti-wrap').scrollIntoView()
        cy.get('[data-test="voucher-purchase"]').click()
        cy.window().its('open').should('be.called')
    })
    it('이용권 standard 선택시 standard 이용권 선택되는지 확인', () => {
        cy.get('[data-test="voucher-item"]').contains('Standard').click()
        cy.get('.sticky-product-name').should('contain.text', 'Standard')
        cy.get('[data-test="voucher-item"]').contains('Standard').parents('li').should('have.class', 'checked')
    })
    it('이용권 Premium 선택시 premium 이용권 선택 잘 되었는지 확인', () => {
        cy.get('[data-test="voucher-item"]').contains('Premium').click()
        cy.get('.sticky-product-name').should('contain.text', 'Premium')
        cy.get('[data-test="voucher-item"]').contains('Premium').parents('li').should('have.class', 'checked')
    })
})
context('코인, 쿠폰', () => {
    beforeEach(() => {
        cy.homePopupOff()
        cy.wavveonOff()
        cy.intercept('POST', 'https://apis.pooq.co.kr/mycoupons/register/*').as('postCouponRegister')
        cy.intercept('GET', '/login').as('getLogin')
        cy.visit(TEST_URL + '/voucher/regist', {
            onBeforeLoad(win) {
                cy.stub(win, 'open').as('windowOpen')
                cy.stub(win, 'alert').as('windowAlert')
                cy.stub(win, 'confirm').as('windowConfirm')
            }
        })
    })
    it('쿠폰번호 미입력 후 등록하기 선택시 얼럿창 노출 확인', () => {
        cy.get('[data-test="coupon-regist"]').contains('등록하기').click()
        cy.window().its('alert').should('be.called')
    })
    it('임의의 쿠폰번호 입력 후 등록하기 선택시 에러 얼럿 노출 확인', () => {
        cy.get('.ticket-coupon-input input').type('1234123412341234')
        cy.get('.ticket-coupon-input').contains('등록하기').click()
        cy.wait('@postCouponRegister').then(({ response }) => {
            expect(response.statusCode).to.eq(550)
            cy.window().its('confirm').should('be.called')
        })
    })
    it('코인 쿠폰번호 입력 > my > 코인화면으로 이동하는지 확인', () => {
        cy.clickUtilMenuLogin('jihye0121', 'pooq1004!')
        cy.wait('@getLogin')
        cy.intercept('POST', 'https://apis.pooq.co.kr/mycoupons/register/*', {
            statusCode: 200,
            body: {
                coupontypeid: '3'
            }
        }).as('postCouponRegister')
        cy.get('.ticket-coupon-input input').type('1234123412341234')
        cy.get('.ticket-coupon-input').contains('등록하기').click()
        cy.wait('@postCouponRegister').then(({ response }) => {
            expect(response.body.coupontypeid).to.contain('3')
        })
    })
    it('코인 쿠폰번호 입력 > confrim 취소 > 이동 안되는지 확인', () => {
        cy.clickUtilMenuLogin('jihye0121', 'pooq1004!')
        cy.wait('@getLogin')
        cy.intercept('POST', 'https://apis.pooq.co.kr/mycoupons/register/*', {
            statusCode: 200,
            body: {
                coupontypeid: '3'
            }
        }).as('postCouponRegister')
        cy.get('.ticket-coupon-input input').type('1234123412341234')
        cy.get('.ticket-coupon-input').contains('등록하기').click()
        cy.wait('@postCouponRegister')
        cy.on('window:confirm', () => false)
        cy.url().should('not.contain', '/my/coin')
        cy.url().should('contain', '/voucher/regist')
    })
    it('쿠폰 쿠폰번호 입력 > my > 쿠폰화면으로 이동하는지 확인', () => {
        cy.clickUtilMenuLogin('jihye0121', 'pooq1004!')
        cy.wait('@getLogin')
        cy.intercept('POST', 'https://apis.pooq.co.kr/mycoupons/register/*', {
            statusCode: 200,
            body: {
                coupontypeid: ''
            }
        }).as('postCouponRegister')
        cy.get('.ticket-coupon-input input').type('1234123412341234')
        cy.get('.ticket-coupon-input').contains('등록하기').click()
        cy.wait('@postCouponRegister').then(({ response }) => {
            expect(response.body.coupontypeid).to.contain('')
        })

    })
    it('쿠폰 쿠폰번호 입력 > confrim 취소 > 이동 안되는지 확인', () => {
        cy.clickUtilMenuLogin('jihye0121', 'pooq1004!')
        cy.wait('@getLogin')
        cy.intercept('POST', 'https://apis.pooq.co.kr/mycoupons/register/*', {
            statusCode: 200,
            body: {
                coupontypeid: ''
            }
        }).as('postCouponRegister')
        cy.get('.ticket-coupon-input input').type('1234123412341234')
        cy.get('.ticket-coupon-input').contains('등록하기').click()
        cy.wait('@postCouponRegister')
        cy.on('window:confirm', () => false)
        cy.url().should('not.contain', '/my/coupon')
        cy.url().should('contain', '/voucher/regist')
    })
    it('미로그인상태에서 충전하기 클릭 > confirm 확인 버튼 선택 > 로그인화면 확인', () => {
        cy.get('.ticket-coupon-input input').type('1234123412341234')
        cy.get('.ticket-coupon-input').contains('등록하기').click()
        cy.on('window:confirm', () => true)
    })
    it('미로그인 상태에서 충전하기 선택 > confirm 창 취소 클릭 > 현재창 유지되는지 확인', () => {
        cy.get('[data-test="coin-regist"]').click()
        cy.on('window:confirm', () => false)
        cy.url().should('contain', '/voucher/regist')
    })
    it('로그인상태에서 코인 충천하기 선택 윈도우 팝업 노출되는지 확인', () => {
        cy.clickUtilMenuLogin('jihye0121', 'pooq1004!')
        cy.wait('@getLogin')
        cy.get('[data-test="coin-regist"]').click()
        cy.window().its('open').should('be.called')
    })
})
context('웨이브온 이용권', () => {
    beforeEach(() => {
        cy.homePopupOff()
        cy.wavveonOff()
        cy.visit(TEST_URL + '/voucher/wavveon')
    })
    it('웨이브온 더 알아보기 링크 속성 확인', () => {
        cy.wait(1000)
        cy.get('.wavveon-banner > a').should('have.attr', 'target', '_blank')
        cy.get('.wavveon-banner > a').should('have.attr', 'href', 'http://www.pooqzone.co.kr/')
    })
    it('상품 구매 바로가기 링크 속성 확인', () => {
        cy.wait(1000)
        cy.get('.wavveon-group-wrap').contains('상품 구매 바로가기').should('have.attr', 'target', '_blank')
        cy.get('.wavveon-group-wrap').contains('상품 구매 바로가기').should('have.attr', 'href', 'http://www.pooqzone.co.kr/Admin/BuyNewPackageList.aspx')
    })
    it('서비스 가입하기 링크 속성 확인', () => {
        cy.wait(1000)
        cy.get('.btn-wrap li').contains('서비스 가입하기').should('have.attr', 'target', '_blank')
        cy.get('.btn-wrap li').contains('서비스 가입하기').should('have.attr', 'href', 'http://www.pooqzone.co.kr/Admin/Registration.aspx')
    })
    it('웨이브온 더 알아보기 속성 확인', () => {
        cy.get('.btn-wrap li').contains('웨이브온 더 알아보기').should('have.attr', 'target', '_blank')
        cy.get('.btn-wrap li').contains('웨이브온 더 알아보기').should('have.attr', 'href', 'http://www.pooqzone.co.kr/')
    })
})
