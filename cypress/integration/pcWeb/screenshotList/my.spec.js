import {TEST_URL} from "../../../common/constant";
import myViewBand from "../../../fixtures/my/myViewBand.json";
import alarmList from "../../../fixtures/my/alarmList.json";
import myPurchaseProducts from "../../../fixtures/my/myPurchaseProducts.json";
import coinSummary from "../../../fixtures/my/coinSummary.json";
import coinCharged from "../../../fixtures/my/coinCharged.json";
import coinExpired from "../../../fixtures/my/coinExpired.json";
import myPurchaseContentItem from "../../../fixtures/my/myPurchaseContentItem.json";
import myPurchaseContentPackage from "../../../fixtures/my/myPurchaseContentPackage.json";
import myDownloads from "../../../fixtures/my/myDownloads.json";

context('my', () => {
    beforeEach(() => {
        cy.homePopupOff()
        cy.wavveonOff()
        cy.csInfo()
        cy.intercept('https://apis.pooq.co.kr/mypurchase/products').as('getMyPurchaseProducts')
        cy.intercept('https://apis.pooq.co.kr/mycoin/list/charged').as('getCoinCharged')
        cy.intercept('https://apis.pooq.co.kr/mycoin/summary').as('getCoinSummary')
        cy.intercept('https://apis.pooq.co.kr/mycoupons/list').as('getCouponList')
        cy.intercept('https://apis.wavve.com/mypurchase/contents/item').as('getPurchaseContents')
        cy.intercept('https://apis.wavve.com/downloads').as('getDownload')
        cy.intercept('https://apis.wavve.com/alarms-new').as('getAlarmNew')
        cy.intercept('https://apis.wavve.com/cf/supermultisections/GN53').as('getMyMultisection')
        cy.intercept('https://apis.wavve.com/cf/uiservice/myview/contents-band').as('getMyViewContentsBand')
        cy.intercept('https://apis.pooq.co.kr/mycoin/summary', (req) => {
            req.reply(coinSummary)
        }).as('getCoinSummary')
    })
    // it('my 처음 진입할때 툴팁 노출 확인', () => {
    //cy.visit(TEST_URL + '/my')
    // })
    // it('개인정보영역 프로필명이 텍스트영역 밖으로 넘어가는경우 ... 처리', () => {
    //     cy.visit(TEST_URL + '/my')
    //     cy.get('.profile-name').then(($span) => {
    //         $span[0].innerText = '호호호호호호호호호호호호홓호호호호호호호호호호호호호호호호호호호호호호호호홓호호호호호호호호'
    //     })
    // })
    // it('알림 선택시 팝업 > 알림 내역 x', () => {
    //     cy.visit(TEST_URL + '/my')
    //     cy.get('[data-test="my-alarm"]').click()
    // })
    // it('알림 선택 > 팝업 > 알림 내역 o', () => {
    //     cy.intercept('GET', 'https://apis.wavve.com/alarms?', (req) => {
    //         req.reply(alarmList)
    //     }).as('getAlarms')
    //     cy.visit(TEST_URL + '/my')
    //     cy.get('[data-test="my-alarm"]').click()
    // })
    // it('알림 선택 > 알림 설정', () => {
    //     cy.visit(TEST_URL + '/my')
    //     cy.get('[data-test="my-alarm"]').click()
    //     cy.get('[data-test="alarm-setting"]').click()
    // })
    // it('이용권 내역 X', () => {
    //     cy.visit(TEST_URL + '/my/subscription_ticket')
    // })
    // it('이용권 내역 O', () => {
    //     cy.intercept('https://apis.pooq.co.kr/mypurchase/products', (req) => {
    //         req.reply(myPurchaseProducts)
    //     }).as('getMyPurchase')
    //     cy.visit(TEST_URL + '/my/subscription_ticket')
    // })
    // it('이용권 내역 O > 결제수단 변경 선택', () => {
    //     cy.intercept('https://apis.pooq.co.kr/mypurchase/products', (req) => {
    //         req.reply(myPurchaseProducts)
    //     }).as('getMyPurchase')
    //     cy.visit(TEST_URL + '/my/subscription_ticket')
    //     cy.get('[data-test="subscription-change-btn"]').click()
    // })
    // it('이용권 내역 O > 자동결제해지 버튼 선택', () => {
    //     cy.intercept('https://apis.pooq.co.kr/mypurchase/products', (req) => {
    //         req.reply(myPurchaseProducts)
    //     }).as('getMyPurchase')
    //     cy.visit(TEST_URL + '/my/subscription_ticket')
    //     cy.get('[data-test="subscription-auto"]').click()
    // })
    // it('코인', () => {
    //     cy.visit(TEST_URL + '/my/coin')
    // })
    // it('코인 > 적립코인 O', () => {
    //     cy.intercept('https://apis.pooq.co.kr/mycoin/list/charged', (req) => {
    //         req.reply(coinCharged)
    //     }).as('getCoinCharged')
    //     cy.visit(TEST_URL + '/my/coin')
    // })
    // it('코인 > 소진코인 O', () => {
    //     cy.visit(TEST_URL + '/my/coin', {
    //         qs: {
    //             viewType: 'expire'
    //         }
    //     })
    // })
    // it('코인 > 소진코인 X', () => {
    //     coinExpired.list = []
    //     cy.intercept('https://apis.pooq.co.kr/mycoin/list/expired', (req) => {
    //         req.reply(coinExpired)
    //     }).as('getCoinExpired')
    //     cy.visit(TEST_URL + '/my/coin', {
    //         qs: {
    //             viewType: 'expire'
    //         }
    //     })
    // })
    // it('쿠폰 > 보유쿠폰', () => {
    //     cy.visit(TEST_URL + '/my/coupon')
    // })
    // it('쿠폰 > 소진쿠폰',() => {
    //     cy.visit(TEST_URL + '/my/coupon', {
    //         qs: {
    //             viewType: 'using'
    //         }
    //     })
    // })
    // it('구매콘텐츠 > 개별구매 X', () => {
    //     cy.visit(TEST_URL + '/my/voucher_list_singular')
    // })
    // it('구매콘텐츠 > 구매내역 O ', () => {
    //     cy.intercept('https://apis.wavve.com/mypurchase/contents/item', (req) => {
    //         req.reply(myPurchaseContentItem)
    //     }).as('getPurchaseItem')
    //     cy.visit(TEST_URL + '/my/voucher_list_singular')
    // })
    // it('구매콘텐츠 > 구매내역 O > 편진 선택', () => {
    //     cy.intercept('https://apis.wavve.com/mypurchase/contents/item', (req) => {
    //         req.reply(myPurchaseContentItem)
    //     }).as('getPurchaseItem')
    //     cy.visit(TEST_URL + '/my/voucher_list_singular')
    //     cy.get('[data-test="my-view-edit"]').click()
    //     cy.get('.my-purchase-check').eq(0).find('input').check({force: true })
    //     cy.scrollTo('top')
    // })
    // it('구매콘텐츠 > 패키지 구매 X', () => {
    //     cy.visit(TEST_URL + '/my/voucher_list_package')
    // })
    // it('구매콘텐츠 > 패키지 구매 O' ,() => {
    //     cy.intercept('https://apis.wavve.com/mypurchase/contents/package', (req) => {
    //         req.reply(myPurchaseContentPackage)
    //     }).as('getPurchasePackage')
    //     cy.visit(TEST_URL + '/my/voucher_list_package')
    // })
    // it('구매콘텐츠 > 패키지 구매 O > 전체보기 선택' ,() => {
    //     cy.intercept('https://apis.wavve.com/mypurchase/contents/package', (req) => {
    //         req.reply(myPurchaseContentPackage)
    //     }).as('getPurchasePackage')
    //     cy.visit(TEST_URL + '/my/voucher_list_package')
    //     cy.get('.my-purchase-btn').eq(0).click()
    // })
    // it('구매콘텐츠 > 패키지 구매 O > 편집 선택' ,() => {
    //     cy.intercept('https://apis.wavve.com/mypurchase/contents/package', (req) => {
    //         req.reply(myPurchaseContentPackage)
    //     }).as('getPurchasePackage')
    //     cy.visit(TEST_URL + '/my/voucher_list_package')
    //     cy.get('[data-test="my-view-edit"]').click()
    //     cy.get('[data-test="package-item"]').eq(0).find('input').check({ force: true })
    //     cy.scrollTo('top')
    // })
    // it('다운로드 관리 > 내역 X', () => {
    //     cy.visit(TEST_URL + '/my/use_list_download')
    // })
    // it('다운로드 관리 > 내역 O', () => {
    //     cy.clearCookie('cs')
    //     cy.visit(TEST_URL + '/my/use_list_download')
    //     cy.login('jihye0667', 'pooqwavve1!')
    //     cy.get('.user-style').eq(1).click()
    //     cy.get('[data-test="download-btn"]').eq(0).click()
    // })
    it('다운로드 관리 > 내역 O > 편진 선택', () => {

    })

    // it('멀티밴드 > 시청내역 없을 경우 문구 노출', () => {
    //     cy.visit(TEST_URL + '/my')
    //     // cy.screenshot({capture: 'viewport'})
    // })
    // it('멀티밴드 > 구독한 프로그램 없을 경우 문구 노출', () => {
    //     cy.intercept('https://apis.wavve.com/cf/uiservice/zzim-band/program', {
    //         body: {bnad: {celllist: []}}
    //     }).as('getZzimProgram')
    //     cy.visit(TEST_URL + '/my')
    //     cy.wait('@getZzimProgram').then(() => {
    //         cy.get('[data-test="구독한 프로그램"]').scrollIntoView({offset: {top: -200}})
    //     })
    // })
    // it('멀티밴드 찜한 영화 없을 경우 문구 노출', () => {
    //     cy.intercept('https://apis.wavve.com/cf/uiservice/zzim-band/movie', {
    //         body: {bnad: {celllist: []}}
    //     }).as('getMovieBand')
    //     cy.visit(TEST_URL + '/my')
    //     cy.get('[data-test="찜한 영화"]').scrollIntoView({offset: {top: -200}})
    // })
    // it('멀티밴드 찜한 에디터픽 없을 경우 문구 노출', () => {
    //     cy.intercept('https://apis.wavve.com/cf/uiservice/zzim-band/program', {
    //         body: {bnad: {celllist: []}}
    //     }).as('getZzimProgram')
    //     cy.intercept('https://apis.wavve.com/cf/uiservice/zzim-band/movie', {
    //         body: {bnad: {celllist: []}}
    //     }).as('getMovieBand')
    //     cy.intercept('https://apis.wavve.com/es/uiservice/zzim-band/theme', {
    //         body: {band: {celllist: []}}
    //     }).as('getThemeBand')
    //     cy.visit(TEST_URL + '/my')
    //     cy.get('[data-test="찜한 에디터Pick"]').scrollIntoView({offset: {top: -200}})
    // })
    // it ('멀티밴드 > 시청내역 있을 경우', () => {
    //     cy.intercept('https://apis.wavve.com/cf/uiservice/myview/contents-band', (req) => {
    //         req.reply(myViewBand)
    //     }).as('getViewBand')
    //     cy.visit(TEST_URL + '/my')
    // })
    // it('멀티밴드 > 구독한 프로그램 있을 경우', () => {
    //     cy.visit(TEST_URL + '/my')
    //     cy.get('[data-test="구독한 프로그램"]').scrollIntoView({offset: {top: -200}})
    // })
    // it('멀티밴드 찜한 영화 있을 경우', () => {
    //     cy.visit(TEST_URL + '/my')
    //     cy.get('[data-test="찜한 영화"]').scrollIntoView({offset: {top: -200}})
    // })
    // it('멀티밴드 > 찜한 에디터Pick 있을 경우', () => {
    //     cy.intercept('https://apis.wavve.com/cf/uiservice/zzim-band/program', {
    //         body: {bnad: {celllist: []}}
    //     }).as('getZzimProgram')
    //     cy.intercept('https://apis.wavve.com/cf/uiservice/zzim-band/movie', {
    //         body: {bnad: {celllist: []}}
    //     }).as('getMovieBand')
    //     cy.visit(TEST_URL + '/my')
    //     cy.get('[data-test="찜한 에디터Pick"]').scrollIntoView({offset: {top: -200}})
    // })
})
