import {TEST_URL} from "../../common/constant";
import myViewContents from "../../fixtures/my/myviewContents.json"
import myDownloads from '../../fixtures/my/myDownloads.json'
import myPurchaseContentItem from '../../fixtures/my/myPurchaseContentItem.json'
import myPurchaseContentPackage from '../../fixtures/my/myPurchaseContentPackage.json'
import summaryAuthAndNotSubscription from '../../fixtures/my/summaryAuthAndNotSubscription.json'
import summaryNotAuth from '../../fixtures/my/summaryNotAuth.json'
import summarySubscription from '../../fixtures/my/summarySubscription.json'
import alarmList from '../../fixtures/my/alarmList.json'
import zzimVod from '../../fixtures/my/zzimVod.json'
import zzimMovie from '../../fixtures/my/zzimMovie.json'
import zzimTheme from '../../fixtures/my/zzimTheme.json'
import coinCharged from '../../fixtures/my/coinCharged.json'
import coinExpired from '../../fixtures/my/coinExpired.json'
import coinSummary from '../../fixtures/my/coinSummary.json'
import myPurchaseProducts from '../../fixtures/my/myPurchaseProducts.json'
import couponReserve from '../../fixtures/my/couponReserve.json'
import couponExpired from '../../fixtures/my/couponExpired.json'
import myViewMovieContents from '../../fixtures/my/myViewMovieContents.json'
import tasteVodAnalysisGraph from '../../fixtures/my/tasteVodAnalysisGraph.json'
import tasteMovieAnalysisGraph from '../../fixtures/my/tasteMovieAnalysisGraph.json'
import tasteAnalysisLists from '../../fixtures/my/tasteAnalysisLists.json'
import tasteIntro from "../../fixtures/my/tasteIntro.json";
import summaryRevocationDefense from '../../fixtures/my/summaryRevocationDefense.json'
import myThemeZzimBand from '../../fixtures/my/myThemeZzimBand.json'
import myViewBand from '../../fixtures/my/myViewBand.json'
import adultVerifiedUserInfo from '../../fixtures/my/adultVerifiedUserInfo.json'
import notAdultVerifiedUserInfo from '../../fixtures/my/notAdultVerifiedUserInfo.json'
function addComma (num) {
    const regexp = /\B(?=(\d{3})+(?!\d))/g
    return num.toString().replace(regexp, ',')
}
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
        cy.visit(TEST_URL + '/my')
    })
    it('my 처음 진입할때 툴팁 노출 확인', () => {
        cy.get('.my-tooltip').should('exist')
    })
    it('개인정보영역 프로필명이 텍스트영역 밖으로 넘어가는경우 ... 처리', () => {
        cy.get('.profile-name').then(($span) => {
            $span[0].innerText = '호호호호호호호호호호호호홓호호호호호호호호호호호호호호호호호호호호호호호호홓호호호호호호호호'
        })
    })
    it('이용권 선택인시 이용중인 이용권화면으로 이동', () => {
        cy.get('[data-test="my-voucher"]').click()
        cy.wait('@getMyPurchaseProducts')
        cy.url().should('contain', '/my/subscription_ticket')
    })
    it('코인 선택시 코인화면으로 이동', () => {
        cy.get('[data-test="my-coin"]').click({ force: true })
        cy.wait(['@getCoinCharged', '@getCoinSummary'])
        cy.url().should('contain', '/my/coin')
    })
    it('쿠폰 선택시 쿠폰화면으로 이동', () => {
        cy.get('[data-test="my-coupon"]').click({ force: true })
        cy.wait('@getCouponList')
        cy.url().should('contain', '/my/coupon')
    })
    it('구매콘텐츠 선택시 단건구매 화면으로 이동', () => {
        cy.get('[data-test="my-purchase"]').click()
        cy.wait('@getPurchaseContents')
        cy.url().should('contain', '/my/voucher_list_singular')
    })
    it('다운로드 선택시 다운로드내역 화면으로 이동', () => {
        cy.get('[data-test="my-download"]').click()
        cy.wait('@getDownload')
        cy.url().should('contain', '/my/use_list_download')
    })
    // it('본인인증되지 않은 계정 프로모션 노출 확인 및 선택시 인증화면으로 이동, 이용중인이용권 내역 없음 확인 ', () => {
    //     cy.intercept('https://apis.pooq.co.kr/my/summary', (req) => {
    //         req.reply(summaryNotAuth)
    //     }).as('getSummary')
    //     cy.visit(TEST_URL + '/my')
    //     cy.wait('@getSummary').then(async ({ response }) => {
    //         cy.get('.promotion-text').should('exist')
    //         cy.get('.profile-metadata-list.ticket').should('not.exist')
    //         await cy.get('[data-test="promotion"]').click({ force: true })
    //         cy.url().should('contain', '/me/auth')
    //     })
    // })
    it('본인인증 되어있고 이용권 없는 계정 프로모션 노출 확인 및 선택시 이용권 화면으로 이동, 이용중인 이용권 내역 없음 확인', () => {
        cy.intercept('https://apis.pooq.co.kr/my/summary', (req) => {
            req.reply(summaryAuthAndNotSubscription)
        }).as('getSummary')
        cy.visit(TEST_URL + '/my')
        cy.wait('@getSummary').then(async ({ response }) => {
            cy.get('.promotion-text').should('exist')
            cy.get('.profile-metadata-list.ticket').should('not.exist')
            await cy.get('[data-test="promotion"]').click({ force: true })
            cy.url().should('contain', 'voucher/index')
        })
    })
    it('이용권 있는 계정일 경우 이용중인 이용권 노출 및 선택시 이용중인 이용권화면 이동', () => {
        cy.intercept('https://apis.pooq.co.kr/my/summary', (req) => {
            req.reply(summarySubscription)
        }).as('getSummary')
        cy.visit(TEST_URL + '/my')
        cy.wait('@getSummary').then(({ response }) => {
            if (response.body.mypass.length > 0) {
                cy.get('.profile-metadata-list.ticket').should('exist')
                cy.get('[data-test="use-voucher"]').click({force:true})
                cy.url().should('contain', '/my/subscription_ticket')
                cy.reload()
                cy.go('back')
                cy.get('[data-test="taste-analysis"]').click({ force: true })
                cy.url().should('contain', '/my/taste_analysis')
            }
        })
    })
    it('이용권없고 프로모션이 없는경우 이용중인 이용권 노출 안되고 프로모션 문구 노출x 이용권 구매하기 버튼 노출 및 선택시 이용권화면으로 이동', () => {
        summaryNotAuth.promotion = []
        cy.intercept('https://apis.pooq.co.kr/my/summary', (req) => {
            req.reply(summaryNotAuth)
        }).as('getSummary')
        cy.visit(TEST_URL + '/my')
        cy.wait('@getSummary').then(async ({ response }) => {
            if (response.body.mypass.length === 0 && response.body.promotion.length === 0) {
                cy.get('.profile-metadata-list.ticket').should('not.exist')
                cy.get('[data-test="not-promotion-and-not-subscription"]').should('exist')
                await cy.get('[data-test="voucher-purchase"]').click({ force: true })
                cy.url().should('contain', '/voucher/index')
            }
        })
    })
    it('프로필 영역 내에 "지금 해지신청을 취소하고 10000코인을 받으세요" 문구 및 해지취소하기버튼 노출되는지 확인', () => {
        cy.intercept('https://apis.pooq.co.kr/my/summary', (req) => {
            req.reply(summaryRevocationDefense)
        }).as('getSummary')
        cy.visit(TEST_URL + '/my')
        cy.wait('@getSummary').then(({ response }) => {
            cy.get('.promotion-text').should('contain', '지금 해지신청을 취소하고 10,000코인 받으세요!')
        })
    })
    it('해지 취소하기 버튼 선택시 해지취소 화면으로 이동하는지 확인', () => {
        cy.intercept('https://apis.pooq.co.kr/my/summary', (req) => {
            req.reply(summaryRevocationDefense)
        }).as('getSummary')
        cy.visit(TEST_URL + '/my')
        cy.wait('@getSummary').then(({ response }) => {
            cy.get('[data-test="promotion"]').contains(response.body.promotion[0].button).click()
            cy.url().should('contain', '/voucher/revocation_defense')
        })
    })
    it('이용권, 코인, 쿠폰, 다운로드, 구매콘텐츠 count 숫자 노출 확인', () => {
        cy.intercept('https://apis.pooq.co.kr/my/summary', (req) => {
            req.reply(summarySubscription)
        }).as('getSummary')
        cy.visit(TEST_URL + '/my')
        cy.wait('@getSummary').then(({ response }) => {
            cy.log(response)
            cy.get('[data-test="voucher-count"]').should('include.text', response.body.mypass.length)
            cy.get('[data-test="coin-count"]').should('include.text', addComma(response.body.coin))
            cy.get('[data-test="coupon-count"]').should('include.text', addComma(response.body.coupon))
            cy.get('[data-test="download-count"]').should('contain.text', addComma(response.body.downloadcount))
            cy.get('[data-test="purchase-count"]').should('contain.text', addComma(response.body.purchasecount))
        })
    })
    it('alarm-new api 확인', () => {
        cy.wait('@getAlarmNew').then(({ response }) => {
            cy.get('[data-test="alarm-count"]').should('include.text', response.body.count)
        })
    })
    it('my 멀티섹션 노출 확인', () => {
        cy.scrollTo('bottom')
        cy.wait('@getMyMultisection').then(({ response }) => {
            cy.get('[data-test="section-loader"]').should('have.length', response.body.multisectionlist.length)
        })
    })
    it('멀티밴드 콘텐츠가 없는 경우에는 [더보기]버튼 미노출되는지 확인', () => {
        cy.wait('@getMyViewContentsBand').then(({ response }) => {
            cy.log(response.body.band.celllist)
            if (response.body.band.celllist.length === 0) {
                cy.get('[data-test="전체 시청내역"]').find('.btn-more.all').should('not.exist')
            }
        })
    })
})
context('my 홈 멀티밴드', () => {
    beforeEach(() => {
        cy.homePopupOff()
        cy.csInfo()
        cy.wavveonOff()
        cy.intercept('https://apis.wavve.com/cf/supermultisections/GN53').as('getMyMultisection')
    })
    it('시청내역 > 밴드 선택시 상세화면으로 이동하는지 확인', () => {
        cy.intercept('https://apis.wavve.com/cf/uiservice/myview/contents-band', (req) => {
            req.reply(myViewBand)
        }).as('getViewBand')
        cy.visit(TEST_URL + '/my')
        cy.wait('@getViewBand').then(({ response }) => {
            const cellList = response.body.band.celllist
            cy.get('[data-test="전체 시청내역"]').find('[data-test="circle-cell"]').eq(0).click()
            const navigationIndex = Cypress._.findIndex(cellList[0].event_list, {type: 'on-navigation'})
            cy.url().should('contain', cellList[0].event_list[navigationIndex].url.replace('captvpooq://', ''))
        })
    })
    it('시청내역 > 더보기 선택시 시청내역으로 이동하는지 확인', () => {
        cy.intercept('https://apis.wavve.com/cf/uiservice/myview/contents-band', (req) => {
            req.reply(myViewBand)
        }).as('getViewBand')
        cy.visit(TEST_URL + '/my')
        cy.wait('@getMyMultisection').then(({ response }) => {
            const multisectionList = response.body.multisectionlist
            cy.get('[data-test="전체 시청내역"]').find('.btn-more.all').click()
            const viewListIndex = Cypress._.findIndex(multisectionList, {title: '전체 시청내역'})
            const viewMoreIndex = Cypress._.findIndex(multisectionList[viewListIndex].eventlist, {type: 'on-viewmore'})
            cy.url().should('contain',multisectionList[viewListIndex].eventlist[viewMoreIndex].url.replace('mypooq', 'my'))
        })
    })
    it('시청내역 > 시청내역 없을 경우 시청내역이 없어요 노출 되는지 확인', () => {
        cy.visit(TEST_URL + '/my')
        cy.wait('@getMyMultisection').then(() => {
            cy.get('[data-test="전체 시청내역"]').find('.no-data').should('exist')
            cy.get('[data-test="전체 시청내역"]').find('.no-data').should('contain', '시청내역이 없어요')
        })
    })
    it('시청내역 > 해당 텍스트 두줄로 노출되는지 확인', () => {
        cy.intercept('https://apis.wavve.com/cf/uiservice/myview/contents-band', (req) => {
            req.reply(myViewBand)
        }).as('getViewBand')
        cy.visit(TEST_URL + '/my')
        cy.get('@getViewBand').then(({ response }) => {
            const cellList = response.body.band.celllist
            cellList.forEach((cell, index) => {
                if (cell.title_list[0].maxline === '2' && cell.title_list[1].text !== '') {
                    cy.get('[data-test="전체 시청내역"]').find('[data-test="circle-cell"]').eq(index).find('.title2.line1').should('exist')
                } else if (cell.title_list[0].maxline === '2' && cell.title_list[1].text === '') {
                    cy.get('[data-test="전체 시청내역"]').find('[data-test="circle-cell"]').eq(index).find('.title1.line2').should('exist')
                }
            })
        })
    })
    it('구독한 프로그램 > 클릭시 해당 프로그램 상세화면으로 이동하는지 확인', () => {
        cy.intercept('https://apis.wavve.com/cf/uiservice/zzim-band/program').as('getZzimProgram')
        cy.visit(TEST_URL + '/my')
        cy.get('[data-test="구독한 프로그램"]').find('[data-test="portrait-cell"]').eq(0).click()
        cy.wait('@getZzimProgram').then(({ response }) => {
            cy.url().should('contain', (response.body.band.celllist[0].event_list[1].url + '&page=1').replace('.html', ''))
        })
    })
    it('구독한 프로그램 > 더보기 버튼 선택시 구독한 프로그램 상세화면으로 이동되는지 확인', () => {
        cy.visit(TEST_URL + '/my')
        cy.wait('@getMyMultisection').then(({ response }) => {
            const multisectionList = response.body.multisectionlist
            cy.get('[data-test="구독한 프로그램"]').find('.btn-more.all').click()
            const zzimProgramIndex = Cypress._.findIndex(multisectionList, {title: '구독한 프로그램'})
            const viewMoreIndex = Cypress._.findIndex(multisectionList[zzimProgramIndex].eventlist, {type: 'on-viewmore'})
            cy.url().should('contain',multisectionList[zzimProgramIndex].eventlist[viewMoreIndex].url.replace('mypooq', 'my'))
        })
    })
    it('구독한 프로그램 > 해당 밴드 콘텐츠 없을 시 안내문구를 구독한 프로그램이 없어요로 표시 되는지 확인', () => {
        cy.intercept('https://apis.wavve.com/cf/uiservice/zzim-band/program', {
            body: {bnad: {celllist: []}}
        }).as('getZzimProgram')
        cy.visit(TEST_URL + '/my')
        cy.wait('@getZzimProgram').then(({ response }) => {
            cy.get('[data-test="구독한 프로그램"]').find('.no-data').should('exist')
            cy.get('[data-test="구독한 프로그램"]').find('.no-data').should('contain', '구독한 프로그램이 없어요')
        })
    })
    it('구독 프로그램 > 해당 텍스트 한줄로 노출되는지 확인', () => {
        cy.intercept('https://apis.wavve.com/cf/uiservice/zzim-band/program').as('getZzimProgram')
        cy.visit(TEST_URL + '/my')
        cy.wait('@getZzimProgram').then(({ response }) => {
            const cellList = response.body.band.celllist
            if (cellList[0].title_list[0].maxline === '1') {
                cy.get('[data-test="구독한 프로그램"]').find('[data-test="portrait-cell"]').eq(0).find('.title1.line1').should('exist')
                cy.get('[data-test="구독한 프로그램"]').find('[data-test="portrait-cell"]').eq(0).find('.title2.line1').should('not.exist')
            }
        })
    })
    it('찜한 영화 > 밴드 선택시 상세화면으로 이동하는지 확인', () => {
        cy.intercept('https://apis.wavve.com/cf/uiservice/zzim-band/movie').as('getMovieBand')
        cy.visit(TEST_URL + '/my')
        cy.get('[data-test="찜한 영화"]').scrollIntoView()
        cy.wait('@getMovieBand').then(({ response }) => {
            cy.log(response)
            const cellList = response.body.band.celllist
            const navigationIndex = Cypress._.findIndex(cellList[0].event_list, {type: 'on-navigation'})
            cy.get('[data-test="찜한 영화"]').find('[data-test="portrait-cell"]').eq(0).click()
            cy.url().should('contain', cellList[0].event_list[navigationIndex].url.replace('.html', ''))
        })
    })
    it('찜한 영화 > 더보기 버튼 선택시 찜한영화 상세화면으로 이동되는지 확인', () => {
        cy.visit(TEST_URL + '/my')
        cy.get('[data-test="찜한 영화"]').scrollIntoView()
        cy.wait('@getMyMultisection').then(({ response }) => {
            const multisectionList = response.body.multisectionlist
            cy.get('[data-test="찜한 영화"]').find('.btn-more.all').click()
            const zzimMovieIndex = Cypress._.findIndex(multisectionList, {title: '찜한 영화'})
            const viewMoreIndex = Cypress._.findIndex(multisectionList[zzimMovieIndex].eventlist, {type: 'on-viewmore'})
            cy.url().should('contain',multisectionList[zzimMovieIndex].eventlist[viewMoreIndex].url.replace('mypooq', 'my').replace('.html', ''))
        })
    })
    it('찜한 영화 > 찜한 영화 콘텐츠 없을 경우 찜한영화없어요 문구 노출되는지 확인', () => {
        cy.intercept('https://apis.wavve.com/cf/uiservice/zzim-band/movie', {
            body: {bnad: {celllist: []}}
        }).as('getMovieBand')
        cy.visit(TEST_URL + '/my')
        cy.get('[data-test="찜한 영화"]').scrollIntoView()
        cy.wait('@getMovieBand').then(({ response }) => {
            cy.get('[data-test="찜한 영화"]').find('.no-data').should('exist')
            cy.get('[data-test="찜한 영화"]').find('.no-data').should('contain', '찜한 영화가 없어요')
        })
    })
    it('찜한 영화 > 텍스트 한줄로 노출되는지 확인', () => {
        cy.intercept('https://apis.wavve.com/cf/uiservice/zzim-band/movie').as('getMovieBand')
        cy.visit(TEST_URL + '/my')
        cy.get('[data-test="찜한 영화"]').scrollIntoView()
        cy.wait('@getMovieBand').then(({ response }) => {
            const cellList = response.body.band.celllist
            if (cellList[0].title_list[0].maxline === '1') {
                cy.get('[data-test="찜한 영화"]').find('[data-test="portrait-cell"]').eq(0).find('.title1.line1').should('exist')
                cy.get('[data-test="찜한 영화"]').find('[data-test="portrait-cell"]').eq(0).find('.title2.line1').should('not.exist')
            }
        })
    })
})
context('알림함', () => {
    beforeEach(() => {
        cy.homePopupOff()
        cy.csInfo()
        cy.wavveonOff()
        cy.intercept('https://apis.wavve.com/alarms/*').as('deleteAlarm')
    })
    it('알림설정 x 버튼 선택시 알림팝업 미노출 확인', () => {
        cy.visit(TEST_URL + '/my').then(async () => {
            await cy.get('[data-test="my-alarm"]').click({ force: true})
            await cy.get('.popup-close').click({ force: true })
            cy.get('.alarm-popup').should('not.exist')
        })
    })
    it('알림선택시 알림리스트있을경우 알림리스트 노', () => {
        cy.intercept('GET', 'https://apis.wavve.com/alarms?', (req) => {
            req.reply(alarmList)
        }).as('getAlarms')
        cy.visit(TEST_URL + '/my')
        cy.get('[data-test="my-alarm"]').click()
        cy.wait('@getAlarms').then(({ response }) => {
            cy.get('.pop-alert-list > li').should('have.length', response.body.list.length)
            cy.get('[data-test="alarm-btn"]').eq(0).click({ force: true })
            cy.url().should('contain', response.body.list[0].targeturl)
        })
    })
    it('알림 선택 삭제 선택시 해당 알림 삭제 확인', () => {
        cy.interceptDelete({ url: 'https://apis.wavve.com/alarms?', deleteType: 'select', json: alarmList, type: 'alarm' }).as('getAlarms')
        cy.visit(TEST_URL + '/my', {
            onBeforeLoad(win) {
                cy.stub(win, 'alert').as('windowAlert')
            }
        })
        cy.get('[data-test="my-alarm"]').click()
        cy.wait('@getAlarms')
        cy.get('.pop-alert-delete').eq(0).click()
        cy.on('window:alert', () => true)
        cy.wait('@deleteAlarm').then(({ response }) => {
            if (response.statusCode === 200) {
                cy.wait('@getAlarms').then(({ response }) => {
                    cy.log(response.body.list)
                    cy.get('.pop-alert-list > li').should('have.length', response.body.list.length)
                })
            }
        })
    })
    it('알림 전체 삭제시 알람 리스트 미노출되는지 확인', () => {
        cy.intercept('DELETE', 'https://apis.wavve.com/alarms?').as('deleteAllAlarm')
        cy.interceptDelete({ url: 'https://apis.wavve.com/alarms?', deleteType: 'all', json: alarmList, type: 'alarm' }).as('getAlarms')
        cy.visit(TEST_URL + '/my')
        cy.get('[data-test="my-alarm"]').click({ force: true })
        cy.get('[data-test="all-delete"]').click({ force: true })
        cy.on('window:confirm', () => true)
        cy.wait('@deleteAllAlarm').then(({ response }) => {
            if (response.statusCode === 200) {
                cy.wait('@getAlarms').then(({ response }) => {
                    cy.log(response.body.list)
                    cy.get('.my-pop-alert-empty').should('exist')
                })
            }
        })
    })
    it('알림설정인 정상 동작하는지 확인', () => {
        cy.intercept('POST', 'https://apis.wavve.com/alarms-receiver').as('postAlarmsReceiver')
        cy.intercept('GET', 'https://apis.wavve.com/alarms-receiver').as('getAlarmsReceiver')
        cy.visit(TEST_URL + '/my')
        cy.get('[data-test="my-alarm"]').click({ force: true })
        cy.get('[data-test="alarm-setting"]').click({ force: true })
        cy.wait('@getAlarmsReceiver').then(({ response }) => {
            const {live, upload} = response.body
            if (live === 'n') {
                cy.get('#ch-re-off').should('be.checked')
                cy.get('#ch-re-on').click({ force: true })
                cy.wait('@postAlarmsReceiver').then(({ response }) => {
                    cy.get('#ch-re-on').should('be.checked')
                })
            } else if (live === 'y') {
                cy.get('#ch-re-on').should('be.checked')
                cy.get('#ch-re-off').click({ force: true })
                cy.wait('@postAlarmsReceiver').then(({ response }) => {
                    cy.get('#ch-re-off').should('be.checked')
                })
            }
            if (upload === 'n') {
                cy.get('#ch-up-off').should('be.checked')
                cy.get('#ch-up-on').click({ force: true })
                cy.wait('@postAlarmsReceiver').then(({ response }) => {
                    cy.get('#ch-up-on').should('be.checked')
                })
            } else if (upload === 'y') {
                cy.get('#ch-up-on').should('be.checked')
                cy.get('#ch-up-off').click({ force: true })
                cy.wait('@postAlarmsReceiver').then(({ response }) => {
                    cy.get('#ch-up-off').should('be.checked')
                })
            }
        })
    })
})
context('이용중인 이용권', () => {
    beforeEach(() => {
        cy.homePopupOff()
        cy.csInfo()
        cy.wavveonOff()
    })
    it('자동결제 해지 선택 시 자동결제 해지 버튼 > 자동결제 해지 취소 버튼으로 변경되는지 확인 및 자동결제 해지 상태에서는 결제수단 변경 버튼 미노출되는지 확인', () => {
        let interceptCount = 0
        cy.intercept('https://apis.pooq.co.kr/mypurchase/products', (req) => {
            if (interceptCount === 0) {
                interceptCount += 1
                req.reply(myPurchaseProducts)
            } else if (interceptCount === 1) {
                myPurchaseProducts.list[0].autopaymentstatus = 'n'
                myPurchaseProducts.list[0].changemethod = 'n'
                req.reply(myPurchaseProducts)
            }
        }).as('getMyPurchase')
        cy.visit(TEST_URL + '/my/subscription_ticket', {
            onBeforeLoad(win) {
                cy.stub(win, 'alert').as('windowAlert')
            }
        }).then(async () => {
            await cy.get('[data-test="subscription-auto"]').click()
            await cy.get('[data-test="revocation-btn"]').click()
            cy.window().its('alert').should('be.called')
            cy.wait('@getMyPurchase')
            cy.get('[data-test="subscription-cancel"]').should('exist')
            cy.get('[data-test="subscription-change-btn"]').should('not.exist')
        })
    })
    it('자동결제 해지 취소 버튼 선택시 자동결제 해지 취소 -> 자동결제 해지 버튼으로 변경되는지 확인 및 자동결제 상태에서 결제수단 변경 버튼 다시 재노출 되는지 확인', () => {
        let interceptCount = 0
        cy.intercept('https://apis.pooq.co.kr/mypurchase/products', (req) => {
            if (interceptCount === 0) {
                interceptCount += 1
                req.reply(myPurchaseProducts)
            } else if (interceptCount === 1) {
                myPurchaseProducts.list[0].autopaymentstatus = 'y'
                myPurchaseProducts.list[0].changemethod = 'y'
                req.reply(myPurchaseProducts)
            }
        }).as('getMyPurchase')
        cy.visit(TEST_URL + '/my/subscription_ticket').then(async () => {
            await cy.get('[data-test="subscription-cancel"]').click()
            await cy.get('.btn-pink.marB0').click()
            await cy.get('[data-test="revocation-confirm"]').click()
            cy.wait('@getMyPurchase')
            cy.get('[data-test="subscription-auto"]').should('exist')
            cy.get('[data-test="subscription-change-btn"]').should('exist')
        })
    })
    it('결제수단 변경 버튼 선택시 결제수단 변경 팝업창 노출되고 변경 선택시 윈도우 open 되는지 확인', () => {
        cy.intercept('https://apis.pooq.co.kr/mypurchase/products', (req) => {
            req.reply(myPurchaseProducts)
        }).as('getMyPurchase')
        cy.visit(TEST_URL + '/my/subscription_ticket', {
            onBeforeLoad(win) {
                cy.stub(win, 'open').as('windowOpen')
            }
        }).then(async () => {
            await cy.get('[data-test="subscription-change-btn"]').click()
            cy.get('[data-test="change-payment-popup"]').should('exist')
            cy.get('.btn-purple.ftr').click()
            cy.window().its('open').should('be.called')
        })
    })
    it('이용중인 이용권있을경우 상태값 노출되는지 확인 및 이용권명 표시되는지 확인', () => {
        cy.intercept('https://apis.pooq.co.kr/mypurchase/products', (req) => {
            req.reply(myPurchaseProducts)
        }).as('getMyPurchase')
        cy.visit(TEST_URL + '/my/subscription_ticket')
        cy.wait('@getMyPurchase').then(({ response }) => {
            const item = response.body.list[0]
            const status = item.status === 'y' ? '이용중' : '기간만료'
            let voucherName = item.productgroupname
            cy.get('[data-test="voucher-status"]').should('contain', status)
            cy.get('[data-test="voucher-name"]').should('contain', voucherName)
        })
    })
})
context('코인', () => {
    beforeEach(() => {
        cy.homePopupOff()
        cy.wavveonOff()
        cy.csInfo()
        cy.intercept('https://apis.pooq.co.kr/mycoin/summary', (req) => {
            req.reply(coinSummary)
        }).as('getCoinSummary')
        cy.intercept('https://apis.pooq.co.kr/mypurchase/pass/cancel').as('postCancel')
        cy.visit(TEST_URL + '/my/coin', {
            onBeforeLoad(win) {
                cy.stub(win, 'open').as('windowOpen')
            }
        })
    })
    it('코인 충전선택시 윈도우팝업 열리는지 확인', () => {
        cy.get('[data-test="coin-register"]').click({ force: true })
        cy.window().its('open').should('be.called')
    })
    it('보유 코인 내역 노출되는지 확인', () => {
        cy.wait('@getCoinSummary').then((interception) => {
            cy.get('[data-test="total-coin"]').should('include.text', addComma(interception.response.body.totalcoin))
            cy.get('[data-test="charged-coin"]').should('include.text', addComma(interception.response.body.chargedcoin))
            cy.get('[data-test="bonus-coin"]').should('include.text', addComma(interception.response.body.bonuscoin))
        })
    })
    it('적립코인, 소진코인 탭 클릭 탭 선택시 해당 탭으로 이동되는지 확인', () => {
        cy.get('[data-test="expire-coin-tab"]').click()
        cy.url().should('contain', 'viewType=expire')
        cy.get('[data-test="charged-coin-tab"]').click()
        cy.url().should('contain', 'viewType=charged')
    })
    it('적립코인 있을경우 자동결제 해지 버튼 클릭시 자동결제해지취소 버튼 노출 확인', () => {
        let interceptCount = 0
        cy.intercept('https://apis.pooq.co.kr/mycoin/list/charged', (req) => {
            if (interceptCount === 0) {
                interceptCount += 1
                req.reply(coinCharged)
            } else if (interceptCount === 1) {
                coinCharged.list[0].autopaymentstatus = 'n'
                req.reply(coinCharged)
            }
        }).as('getCoinCharged')
        cy.visit(TEST_URL + '/my/coin')
        cy.wait('@getCoinCharged').then(({ response }) => {
            cy.get('[data-test="charged-coin-item"]').should('length', response.body.list.length)
            response.body.list.forEach((item, index) => {
                if (item.autopayment === 'true' && item.autopaymentstatus === 'y') {
                    cy.get('.pay-btn').should('exist')
                    cy.get('.pay-btn').click()
                    cy.wait('@postCancel').then(({ response }) => {
                        if (response.statusCode === 200) {
                            cy.wait('@getCoinCharged').then(({ response }) => {
                                cy.log(response)
                                cy.get('.pay-cancel-btn').should('exist')
                            })
                        }
                    })
                }
            })
        })
    })
    it('적립코인 없을경우 빈메시지 노출 확인', () => {
        coinCharged.list = []
        cy.intercept('https://apis.pooq.co.kr/mycoin/list/charged', (req) => {
            req.reply(coinCharged)
        }).as('getCoinCharged')
        cy.visit(TEST_URL + '/my/coin')
        cy.wait('@getCoinCharged').then(({ response }) => {
            expect(response.body.list.length).to.eq(0)
            cy.get('.my-like-empty').should('exist')
        })
    })
    it('소진 코인 있을 경우 만료된 코인 표시 확인', () => {
        cy.intercept('https://apis.pooq.co.kr/mycoin/list/expired', (req) => {
            req.reply(coinExpired)
        }).as('getCoinExpired')
        cy.visit(TEST_URL + '/my/coin')
        cy.get('[data-test="expire-coin-tab"]').click()
        cy.wait('@getCoinExpired').then(({ response }) => {
            cy.get('[data-test="expire-coin-item"]').should('length', response.body.list.length)
            response.body.list.map((item, index) => {
                if (item.expire === 'y') {
                    cy.get('[data-test="expire-coin-item"]').eq(index).should('have.class', 'coin-expire')
                }
            })
        })
    })
    it('소진 코인 없을 경우 빈화면 노출 확인 ', () => {
        coinExpired.list = []
        cy.intercept('https://apis.pooq.co.kr/mycoin/list/expired', (req) => {
            req.reply(coinExpired)
        }).as('getCoinExpired')
        cy.visit(TEST_URL + '/my/coin')
        cy.get('[data-test="expire-coin-tab"]').click()
        cy.wait('@getCoinExpired').then(({ response }) => {
            expect(response.body.list.length).to.eq(0)
            cy.get('.my-c-empty').should('exist')
        })
    })
})
context('쿠폰', () => {
    beforeEach(() => {
        cy.homePopupOff()
        cy.csInfo()
        cy.wavveonOff()
        cy.intercept('https://apis.pooq.co.kr/mycoupons/register/*').as('postCouponRegister')
        cy.intercept('https://apis.pooq.co.kr/mycoupons/list').as('getCouponList')
    })
    it('쿠폰번호 빈 등록 선택시 얼럿 노출 확인', () => {
        cy.visit(TEST_URL + '/my/coupon', {
            onBeforeLoad(win) {
                cy.stub(win, 'alert').as('windowAlert')
            }
        }).then(async () => {
            await cy.get('[data-test="coupon-regist-btn"]').click({ force: true })
            cy.window().its('alert').should('be.called')
        })
    })
    it('임의 쿠폰번호 입력후 쿠폰등록 선택시 에러메시지 노출 확인', () => {
        cy.visit(TEST_URL + '/my/coupon')
        cy.get('.my-coupon-input').find('[type="text"]').type('1111111111111111')
        cy.get('[data-test="coupon-regist-btn"]').click({ force: true })
        cy.wait('@postCouponRegister').then((interception) => {
            expect(interception.response.body.resultcode).eq('-1002')
        })
    })
    it('보유쿠폰있을경우 테이블 노출 확인', () => {
        cy.visit(TEST_URL + '/my/coupon')
        cy.wait('@getCouponList').then((interception) => {
            if (interception.response.body.list.length > 0) {
                cy.get('.my-c-table').should('exist')
                cy.get('[data-test="property-coupon-item"]').should('length', interception.response.body.list.length)
            } else {
                cy.get('.my-c-empty').should('exist')
            }
        })
    })
    it('쿠폰 탭 선택시 탭 이동 확인', () => {
        cy.visit(TEST_URL + '/my/coupon')
        cy.get('.my-sub-nav > li').contains('소진 쿠폰').click()
        cy.get('.my-sub-nav > li').contains('소진 쿠폰').should('have.class', 'my-sub-nav-on')
    })
    it('소진 쿠폰 선택시 이용중 쿠폰 확인', () => {
        cy.visit(TEST_URL + '/my/coupon?viewType=using')
        cy.wait('@getCouponList').then((interception) => {
            if (interception.response.body.list.length > 0) {
                cy.get('.my-c-table').should('exist')
                cy.get('[data-test="property-coupon-item"]').should('length', interception.response.body.list.length)
                const filteredList = interception.response.body.list.filter((item, index) => item.status === '이용중')
                if (filteredList.length > 0) {
                    cy.get('.btn-using').should('have.length', filteredList.length)
                }
            } else {
                cy.get('.my-c-empty').should('exist')
            }
        })
    })
})
context('취향분석', () => {
    beforeEach(() => {
        cy.homePopupOff()
        cy.wavveonOff()
        cy.csInfo()
    })
    it('사용자의 시청 패턴별 타입이 노출되는지 확인', () => {
        cy.tasteIntro().as('getIntro')
        cy.visit(TEST_URL + '/my/taste_analysis')
        cy.get('[data-test="taste-intro-title"]').should('exist')
        cy.wait('@getIntro').then(({ response }) => {
            cy.get('[data-test="taste-intro-title"]').should('contain', response.body.type)
        })
    })
    it('많이 본 장르 vod 내역 노출되는지 확인', () => {
        cy.tasteIntro().as('getIntro')
        cy.intercept('https://apis.wavve.com/analysis/graph?type=vod', (req) => {
            req.reply(tasteVodAnalysisGraph)
        }).as('getVodAnalysisGraph')
        cy.visit(TEST_URL + '/my/taste_analysis')
        cy.wait('@getVodAnalysisGraph').then(({ response }) => {
            cy.get('[data-test="genre-list-wrapper"]').should('exist')
        })
    })
    it('많이 본 장르 영화 내역 노출되는지 확인', () => {
        cy.tasteIntro().as('getIntro')
        cy.intercept('https://apis.wavve.com/analysis/graph?type=movie', (req) => {
            req.reply(tasteMovieAnalysisGraph)
        }).as('getMovieAnalysisGraph')
        cy.visit(TEST_URL + '/my/taste_analysis')
        cy.get('[data-test="taste-type-bar-tab"]').contains('영화').click()
        cy.wait('@getMovieAnalysisGraph').then(({ response }) => {
            cy.get('[data-test="genre-list-wrapper"]').should('exist')
        })
    })
    it('많이 본 장르 vod 내역 없을때 홈으로 이동하기 버튼 노출 및 버튼 클릭시 홈으로 이동', () => {
        cy.tasteIntro().as('getIntro')
        cy.intercept('https://apis.wavve.com/cf/supermultisections/GN51').as('getGN51')
        cy.intercept('https://apis.wavve.com/analysis/graph?type=vod', (req) => {
            tasteVodAnalysisGraph.analysisgraphlist = []
            req.reply(tasteVodAnalysisGraph)
        }).as('getVodAnalysisGraph')
        cy.visit(TEST_URL + '/my/taste_analysis')
        cy.wait('@getVodAnalysisGraph')
        cy.get('[data-test="vod-empty-go-home"]').contains('홈으로 이동하기').should('exist')
        cy.get('[data-test="vod-empty-go-home"]').click()
        cy.wait('@getGN51')
        cy.get('[data-test="gnb-home"]').should('have.class', 'on')
    })
    it('많이 본 장르 영화 내역 없을때 홈으로 이동하기 버튼 노출 및 버튼 클릭시 홈으로 이동', () => {
        cy.tasteIntro().as('getIntro')
        cy.intercept('https://apis.wavve.com/cf/supermultisections/GN51').as('getGN51')
        cy.intercept('https://apis.wavve.com/analysis/graph?type=movie', (req) => {
            tasteMovieAnalysisGraph.analysisgraphlist = []
            req.reply(tasteMovieAnalysisGraph)
        }).as('getMovieAnalysisGraph')
        cy.visit(TEST_URL + '/my/taste_analysis')
        cy.get('[data-test="taste-type-bar-tab"]').contains('영화').click()
        cy.wait('@getMovieAnalysisGraph')
        cy.get('[data-test="movie-empty-go-home"]').contains('홈으로 이동하기').should('exist')
        cy.get('[data-test="movie-empty-go-home"]').click()
        cy.wait('@getGN51')
        cy.get('[data-test="gnb-home"]').should('have.class', 'on')
    })
    it('많이 본 프로그램 내역 선택 시 해당 콘텐츠 상세페이지로 이동', () => {
        cy.tasteIntro()
        cy.intercept('https://apis.wavve.com/analysis/lists', (req) => {
            req.reply(tasteAnalysisLists)
        }).as('getAnalysisLists')
        cy.visit(TEST_URL + '/my/taste_analysis')
        cy.wait('@getAnalysisLists').then(({ response }) => {
            cy.get('[data-test="my-type-program"]').should('have.length', 10)
            cy.get('[data-test="my-type-program"]').eq(0).click()
            const programListIndex = Cypress._.findIndex(response.body, (item) => item.type === 'analysisprogramlist')
            cy.url().should('contain', response.body[programListIndex].list[0].programid)
        })
    })
    it('많이 본 프로그램 없을 경우 "홈으로 이동하기" 버튼 노출 및 홈으로 이동', () => {
        cy.tasteIntro()
        cy.intercept('https://apis.wavve.com/cf/supermultisections/GN51').as('getGN51')
        cy.intercept('https://apis.wavve.com/analysis/lists', (req) => {
            tasteAnalysisLists[0].list = []
            req.reply(tasteAnalysisLists)
        }).as('getAnalysisLists')
        cy.visit(TEST_URL + '/my/taste_analysis')
        cy.get('.my-type-empty').should('exist')
        cy.get('[data-test="type-program-go-home"]').click()
        cy.wait('@getGN51')
        cy.get('[data-test="gnb-home"]').should('have.class', 'on')
    })
    it('많이 본 인물 내역 선택 시 해당 콘텐츠 상세페이지로 이동', () => {
        cy.tasteIntro()
        cy.intercept('https://apis.wavve.com/analysis/lists', (req) => {
            req.reply(tasteAnalysisLists)
        }).as('getAnalysisLists')
        cy.visit(TEST_URL + '/my/taste_analysis')
        cy.wait('@getAnalysisLists').then(({ response }) => {
            cy.get('[data-test="my-type-person"]').should('have.length', 12)
            cy.get('[data-test="my-type-person"]').eq(0).click()
            cy.url().should('contain', '/search/search?searchWord=')
        })
    })
    it('많이 본 인물 내역 없을 경우 숨김처리 되는지 확인', () => {
        cy.tasteIntro()
        cy.intercept('https://apis.wavve.com/analysis/lists', (req) => {
            tasteAnalysisLists[1].list = []
            req.reply(tasteAnalysisLists)
        }).as('getAnalysisLists')
        cy.visit(TEST_URL + '/my/taste_analysis')
        cy.wait('@getAnalysisLists')
        cy.get('.my-type-character').should('not.exist')
    })
    it('많이 본 채널 내역 선택 시 해당 콘텐츠 상세페이지로 이동', () => {
        cy.tasteIntro()
        cy.intercept('https://apis.wavve.com/analysis/lists', (req) => {
            req.reply(tasteAnalysisLists)
        }).as('getAnalysisLists')
        cy.visit(TEST_URL + '/my/taste_analysis')
        cy.wait('@getAnalysisLists').then(({ response }) => {
            cy.get('[data-test="my-type-channel"]').should('have.length', 12)
            const channelListIndex = Cypress._.findIndex(response.body, (item) => item.type === 'analysischannellist')
            cy.get('[data-test="my-type-channel"]').eq(0).click()
            cy.url().should('contain', response.body[channelListIndex].list[0].channelid)
        })
    })
    it('많이 본 채널 내역 없을 경우 홈으로 이동하기 버튼 노출 및 홈으로 이동 확인', () => {
        cy.tasteIntro()
        cy.intercept('https://apis.wavve.com/cf/supermultisections/GN51').as('getGN51')
        cy.intercept('https://apis.wavve.com/analysis/lists', (req) => {
            tasteAnalysisLists[2].list = []
            req.reply(tasteAnalysisLists)
        }).as('getAnalysisLists')
        cy.visit(TEST_URL + '/my/taste_analysis')
        cy.get('.my-type-empty').should('exist')
        cy.get('[data-test="type-channel-go-home"]').click()
        cy.wait('@getGN51')
        cy.get('[data-test="gnb-home"]').should('have.class', 'on')
    })
    it('이용한 컨텐츠가 없을 경우 홈으로 이동하기 버튼 선택시 홈으로 이동', () => {
        cy.intercept('https://apis.wavve.com/cf/supermultisections/GN51').as('getGN51')
        cy.intercept('https://apis.wavve.com/analysis/intro', (req) => {
            tasteIntro.type = ''
            req.reply(tasteIntro)
        })
        cy.visit(TEST_URL + '/my/taste_analysis')
        cy.get('[data-test="type-go-home"]').click()
        cy.wait('@getGN51')
        cy.get('[data-test="gnb-home"]').should('have.class', 'on')
    })
    it('주 이용 디바이스 노출', () => {
        cy.tasteIntro()
        cy.visit(TEST_URL + '/my/taste_analysis')
        cy.get('[data-test="type-device"]').should('exist')
    })
})
context('vod 시청내역', () => {
    beforeEach(() => {
        cy.homePopupOff()
        cy.csInfo()
        cy.wavveonOff()
        cy.intercept('https://apis.wavve.com/cf/myview/contents?').as('deleteContents')
        cy.intercept('https://apis.wavve.com/cf/myview/contents-all?').as('deleteAllContents')
    })
    it('콘텐츠 클릭시 해당 콘텐츠 상세화면으로 이동되는지 확인', () => {
        cy.intercept('https://apis.wavve.com/myview/contents?', (req) => {
            req.reply(myViewContents)
        }).as('getMyViewContents')
        cy.visit(TEST_URL + '/my/use_list_vod_history').then(async () => {
            await cy.get('[data-test="my-view-content"]').eq(0).click({ force: true })
            cy.url().should('contain', '/player/vod')
        })
    })
    it('썸네일, 프로그레스바 노출 확인', () => {
        cy.intercept('https://apis.wavve.com/myview/contents?', (req) => {
            req.reply(myViewContents)
        }).as('getMyViewContents')
        cy.visit(TEST_URL + '/my/use_list_vod_history')
        cy.get('.progress-bar').should('exist')
    })
    it('좌측 하단에 이용내역 관련 안내 문구 노출 확인', () => {
        cy.intercept('https://apis.wavve.com/myview/contents?', (req) => {
            req.reply(myViewContents)
        }).as('getMyViewContents')
        cy.visit(TEST_URL + '/my/use_list_vod_history')
        cy.wait('@getMyViewContents')
        cy.get('.my-history-noti').should('exist')
        cy.get('.my-history-noti').should('contain', '동일한 콘텐츠를 여러 번 시청한 경우, 마지막 이력만 표시됩니다.')
    })

    it('편집 선택시 편집모드 노출 확인', () => {
        cy.intercept('https://apis.wavve.com/myview/contents?', (req) => {
            req.reply(myViewContents)
        }).as('getMyViewContents')
        cy.visit(TEST_URL + '/my/use_list_vod_history').then(async () => {
            await cy.get('[data-test="my-view-edit"]').click({ force: true })
            cy.get('.my-purchase-edit-l').should('exist')
        })
    })
    it('편집모드에서 나가기 선택시 편집모드 미노출', () => {
        cy.intercept('https://apis.wavve.com/myview/contents?', (req) => {
            req.reply(myViewContents)
        }).as('getMyViewContents')
        cy.visit(TEST_URL + '/my/use_list_vod_history').then(async () => {
            await cy.get('[data-test="my-view-edit"]').click({ force: true })
            await cy.get('[data-test="my-view-exit"]').click({ force: true })
            cy.get('[data-test="my-view-exit"]').should('not.exist')
        })
    })
    it('영화 탭 선택시 영화탭으로 이동 확인', () => {
        cy.intercept('https://apis.wavve.com/myview/contents?', (req) => {
            req.reply(myViewContents)
        }).as('getMyViewContents')
        cy.visit(TEST_URL + '/my/use_list_vod_history')
        cy.get('[data-test="my-sub-menu"]').contains('영화').click()
        cy.url().should('contain', '/my/use_list_movie_history')
        cy.get('[data-test="my-sub-menu"]').contains('영화').click().should('have.class', 'my-sub-nav-on')
    })

    it('선택 삭제시 선택한 컨텐츠 삭제되었는지 확인', () => {
        cy.interceptDelete({ url: 'https://apis.wavve.com/myview/contents?', deleteType: 'select', json: myViewContents, type: 'vod' }).as('getMyViewContents')
        cy.visit(TEST_URL + '/my/use_list_vod_history')
        cy.wait('@getMyViewContents')
        cy.get('.my-history-list').should('length', 10)
        cy.get('[data-test="my-view-edit"]').click({ force: true })
        cy.get('.my-history-check').eq(0).find('input').check({ force: true })
        cy.get('[data-test="select-delete"]').should('contain', 1)
        cy.get('[data-test="select-delete"]').click({ force: true })
        cy.wait('@deleteContents').should(({ response }) => {
            if (response.statusCode === 200) {
                cy.wait('@getMyViewContents').then(({ response }) => {
                    cy.get('.my-history-list').should('length', response.body[0].list.length)
                    expect(response.body[0].list.length).to.eq(9)
                })
            }
        })
    })
    it('전체 삭제 confirm 취소시 삭제 안되는지 확인', () => {
        cy.intercept('https://apis.wavve.com/myview/contents?', (req) => {
            req.reply(myViewContents)
        }).as('getMyViewContents')
        cy.visit(TEST_URL + '/my/use_list_vod_history')
        cy.wait('@getMyViewContents').then(({ response }) => {
            cy.log(response)
        })
        cy.get('[data-test="my-view-edit"]').click({ force: true })
        cy.get('[data-test="all-delete"]').click({ force: true })
        cy.on('window:confirm', () => false)
        cy.get('.my-like-empty').should('not.exist')
    })
    it('전체 삭제선택시 시청내역이없어요 노출 확인', () => {
        cy.interceptDelete({ url: 'https://apis.wavve.com/myview/contents?', deleteType: 'all', json: myViewContents, type: 'vod' }).as('getMyViewContents')
        cy.visit(TEST_URL + '/my/use_list_vod_history')
        cy.wait('@getMyViewContents').then(({ response }) => {
            cy.log(response)
        })
        cy.get('[data-test="my-view-edit"]').click({ force: true })
        cy.get('[data-test="all-delete"]').click({ force: true })
        cy.on('window:confirm', () => true)
        cy.wait('@deleteAllContents').then(({ response }) => {
            if (response.statusCode === 200) {
                cy.wait('@getMyViewContents').then(({ response }) => {
                    cy.get('.my-like-empty').should('exist')
                })
            }
        })
    })
    it('시청 내역 없을 경우 편집버튼 미노출 및 시청내역이 없어요 문구 노출 확인', () => {
        cy.intercept('https://apis.wavve.com/myview/contents?', (req) => {
            myViewContents[0].list = []
            req.reply(myViewContents)
        }).as('getMyViewContents')
        cy.visit(TEST_URL + '/my/use_list_vod_history')
        cy.get('.my-purchase-edit').should('not.exist')
        cy.get('.my-like-empty').should('exist')
    })
})
context('movie 시청내역', () => {
    beforeEach(() => {
        cy.wavveonOff()
        cy.homePopupOff()
        cy.csInfo()
        cy.intercept('https://apis.wavve.com/cf/myview/contents?').as('deleteContents')
        cy.intercept('https://apis.wavve.com/cf/myview/contents-all?').as('deleteAllContents')
    })
    it('영화 타이틀 최대 2줄 노출, 이용일 표시 확인', () => {
        cy.intercept('https://apis.wavve.com/myview/contents', (req) => {
            req.reply(myViewMovieContents)
        }).as('movieContents')
        cy.visit(TEST_URL + '/my/use_list_movie_history')
        cy.get('.con-text-wrap').eq(0).children().should('have.length', 2)
        cy.get('.con-text-wrap').contains('이용일').should('exist')
    })
    it('좌측 하단에 이용내역 관련 안내 문구 노출 확인', () => {
        cy.intercept('https://apis.wavve.com/myview/contents', (req) => {
            req.reply(myViewMovieContents)
        }).as('movieContents')
        cy.visit(TEST_URL + '/my/use_list_movie_history')
        cy.get('.my-history-noti').should('exist')
        cy.get('.my-history-noti').should('contain', '동일한 콘텐츠를 여러 번 시청한 경우, 마지막 이력만 표시됩니다.')
    })
    it('컨텐츠 선택시 해당 상세화면으로 이동하는지 확인', () => {
        cy.intercept('https://apis.wavve.com/cf/movie/contents/*').as('getMoviePlayerContents')
        cy.intercept('https://apis.wavve.com/myview/contents', (req) => {
            req.reply(myViewMovieContents)
        }).as('movieContents')
        cy.visit(TEST_URL + '/my/use_list_movie_history')
        cy.wait('@movieContents').then(async ({ response }) => {
            await cy.get('[data-test="movie-history-contents"]').eq(0).click({ force: true })
            cy.url().should('contain', response.body[0].list[0].movieid)
        })
    })
    it('포스터형 밴드 프로그레스바 노출', () => {
        cy.intercept('https://apis.wavve.com/myview/contents', (req) => {
            req.reply(myViewMovieContents)
        }).as('movieContents')
        cy.visit(TEST_URL + '/my/use_list_movie_history')
        cy.wait('@movieContents')
        cy.get('.progress-bar').should('exist')
    })
    it('편집 선택시 편집모드 노출 확인', () => {
        cy.intercept('https://apis.wavve.com/myview/contents?', (req) => {
            req.reply(myViewMovieContents)
        }).as('movieContents')
        cy.visit(TEST_URL + '/my/use_list_vod_history').then(async () => {
            await cy.get('[data-test="my-view-edit"]').click({ force: true })
            cy.get('.my-purchase-edit-l').should('exist')
        })
    })
    it('편집모드에서 나가기 선택시 편집모드 미노출', () => {
        cy.intercept('https://apis.wavve.com/myview/contents?', (req) => {
            req.reply(myViewMovieContents)
        }).as('movieContents')
        cy.visit(TEST_URL + '/my/use_list_vod_history').then(async () => {
            await cy.get('[data-test="my-view-edit"]').click({ force: true })
            await cy.get('[data-test="my-view-exit"]').click({ force: true })
            cy.get('[data-test="my-view-exit"]').should('not.exist')
        })
    })
    it('시청내역 dimmed처리 및 청불 태그 노출 확인', () => {
        cy.intercept('https://apis.wavve.com/myview/contents', (req) => {
            req.reply(myViewMovieContents)
        }).as('movieContents')
        cy.visit(TEST_URL + '/my/use_list_movie_history')
        cy.wait('@movieContents').then(({ response }) => {
            cy.log(response)
            const list = response.body[0].list
            list.forEach((item, index) => {
                if (item.targetage >= 21) {
                    cy.get('.movie-lock-21').should('exist')
                } else if (item.targetage >= 18) {
                    cy.get('[data-test="movie-history-contents"]').eq(index).find('.tag-age > img').should('have.attr', 'alt', '청소년 관람 불가')
                }
            })
        })
    })
    it('삭제시 선택한 컨텐츠 삭제되었는지 확인', () => {
        cy.intercept('https://apis.wavve.com/myview/contents', (req) => {
            req.reply(myViewMovieContents)
        }).as('movieContents')
        cy.interceptDelete({ url: 'https://apis.wavve.com/myview/contents?', deleteType: 'select', json: myViewMovieContents, type: 'movie' }).as('getMyViewContents')
        cy.visit(TEST_URL + '/my/use_list_movie_history')
        cy.get('[data-test="my-view-edit"]').click({ force: true })
        cy.get('.my-movie-check').eq(0).find('input').check({ force: true })
        cy.get('[data-test="select-delete"]').should('contain', 1)
        cy.get('[data-test="select-delete"]').click({ force: true })
        cy.wait('@deleteContents').should(({ response }) => {
            if (response.statusCode === 200) {
                cy.wait('@movieContents').then(({ response }) => {
                    cy.log(response)
                    cy.get('.my-movie-list li').should('length', response.body[0].list.length)
                })
            }
        })
    })
    it('전체 삭제 confirm 취소시 삭제 안되는지 확인', () => {
        cy.intercept('https://apis.wavve.com/myview/contents?', (req) => {
            req.reply(myViewMovieContents)
        }).as('movieContents')
        cy.visit(TEST_URL + '/my/use_list_vod_history')
        cy.wait('@movieContents')
        cy.get('[data-test="my-view-edit"]').click({ force: true })
        cy.get('[data-test="all-delete"]').click({ force: true })
        cy.on('window:confirm', () => false)
        cy.get('.my-like-empty').should('not.exist')
    })
    it('전체 삭제선택시 시청내역이없어요 노출 확인', () => {
        cy.interceptDelete({ url: 'https://apis.wavve.com/myview/contents?', deleteType: 'all', json: myViewMovieContents, type: 'movie' }).as('getMyViewContents')
        cy.visit(TEST_URL + '/my/use_list_movie_history')
        cy.wait('@getMyViewContents').then(({ response }) => {
            cy.log(response)
        })
        cy.get('[data-test="my-view-edit"]').click({ force: true })
        cy.get('[data-test="all-delete"]').click({ force: true })
        cy.on('window:confirm', () => true)
        cy.wait('@deleteAllContents').then(({ response }) => {
            if (response.statusCode === 200) {
                cy.wait('@getMyViewContents').then(({ response }) => {
                    cy.get('.my-like-empty').should('exist')
                })
            }
        })
    })
    it('시청내역 없을 경우 영화시청내역이 없어요 문구 노출 및 편집모드 숨김 확인', () => {
        cy.intercept('https://apis.wavve.com/myview/contents', (req) => {
            myViewMovieContents[0].list = []
            req.reply(myViewMovieContents)
        }).as('movieContents')
        cy.visit(TEST_URL + '/my/use_list_movie_history')
        cy.get('.my-like-empty').should('exist')
        cy.get('[data-test="my-view-exit"]').should('not.exist')
    })
})
context('구독한 프로그램, 찜한 영화, 찜한 에디터픽', () => {
    beforeEach(() => {
        cy.homePopupOff()
        cy.csInfo()
        cy.wavveonOff()
    })
    it('영화 찜하기 취소시 팝업 노출되는지 확인', () => {
        cy.intercept('https://apis.wavve.com/zzim/contents', (req) => {
            req.reply(zzimMovie)
        }).as('zzimMovie')
        cy.visit(TEST_URL + '/my/like_movie', {
            onBeforeLoad(win) {
                cy.stub(win, 'alert').as('windowAlert')
            }
        })
        cy.wait('@zzimMovie').then(({ response }) => {
            cy.likeContentsCancel()
        })
    })
    it('다시 영화 찜하기시 팝업 노출되는지 확인', () => {
        cy.intercept('https://apis.wavve.com/zzim/contents', (req) => {
            req.reply(zzimMovie)
        }).as('zzimMovie')
        cy.visit(TEST_URL + '/my/like_movie', {
            onBeforeLoad(win) {
                cy.stub(win, 'alert').as('windowAlert')
            }
        })
        cy.wait('@zzimMovie').then(({ response }) => {
            cy.likeContentsCancel()
            cy.likeContents()
        })
    })
    it('찜한 영화 콘텐츠 선택시 해당 상세화면으로 이동', () => {
        cy.intercept('https://apis.wavve.com/zzim/contents', (req) => {
            req.reply(zzimMovie)
        }).as('zzimMovie')
        cy.visit(TEST_URL + '/my/like_movie')
        cy.wait('@zzimMovie').then(({ response }) => {
            cy.get('[data-test="like-item"]').eq(0).click()
            cy.url().should('contain', response.body[0].list[0].movieid)
        })
    })
    it('찜 해제 후 페이지 새로고침 전 비활성화된 아이콘 재 선택시 아이콘 활성화되는지 확인', () => {
        cy.intercept('https://apis.wavve.com/zzim/contents', (req) => {
            req.reply(zzimMovie)
        }).as('zzimMovie')
        cy.visit(TEST_URL + '/my/like_movie')
        cy.wait('@zzimMovie').then(({ response }) => {
            cy.get('[data-test="zzim"]').eq(0).click({ force: true })
            cy.get('[data-test="zzim"]').invoke('attr', 'data-test-is-zzim').should('contain', 'zzim_false')
            cy.get('[data-test="zzim"]').eq(0).click({ force: true })
            cy.get('[data-test="zzim"]').invoke('attr', 'data-test-is-zzim').should('contain', 'zzim_true')
        })
    })
    it('찜한 영화 리스트 없을 경우 빈화면 노출', () => {
        cy.intercept('https://apis.wavve.com/zzim/contents', (req) => {
            zzimMovie[0].list = []
            req.reply(zzimMovie)
        }).as('zzimMovie')
        cy.visit(TEST_URL + '/my/like_movie')
        cy.wait('@zzimMovie')
        cy.get('.my-like-empty').should('exist')
    })
    it('찜한 에디터픽 취소시 팝업 노출되는지 확인', () => {
        cy.intercept('https://apis.wavve.com/zzim/contents', (req) => {
            req.reply(zzimTheme)
        }).as('zzimTheme')
        cy.visit(TEST_URL + '/my/like_theme', {
            onBeforeLoad(win) {
                cy.stub(win, 'alert').as('windowAlert')
            }
        })
        cy.wait('@zzimTheme').then(({ response }) => {
            cy.likeContentsCancel()
        })
    })
    it('다시 에디터픽 찜하기시 팝업 노출되는지 확인', () => {
        cy.intercept('https://apis.wavve.com/zzim/contents', (req) => {
            req.reply(zzimTheme)
        }).as('zzimTheme')
        cy.visit(TEST_URL + '/my/like_theme', {
            onBeforeLoad(win) {
                cy.stub(win, 'alert').as('windowAlert')
            }
        })
        cy.wait('@zzimTheme').then(({ response }) => {
            cy.likeContentsCancel()
            cy.likeContents()
        })
    })
    it('에디터픽 선택시 해당 상세화면으로 이동', () => {
        cy.intercept('https://apis.wavve.com/zzim/contents', (req) => {
            req.reply(zzimTheme)
        }).as('zzimTheme')
        cy.visit(TEST_URL + '/my/like_theme')
        cy.wait('@zzimTheme').then(({ response }) => {
            cy.get('[data-test="my-like-theme"]').eq(0).click()
            cy.url().should('contain', response.body[0].list[0].url.replace('https://www.wavve.com/', ''))
        })
    })
    it('에디터픽 찜 해제 후 페이지 새로고침시 아이콘 해제된 에디터픽 미노출되는지 확인', () => {
        cy.intercept('https://apis.wavve.com/zzim/contents', (req) => {
            req.reply(zzimTheme)
        }).as('zzimTheme')
        cy.visit(TEST_URL + '/my/like_theme')
        cy.wait('@zzimTheme').then(({ response }) => {
            cy.get('[data-test="zzim"]').eq(0).click({ force: true })
            cy.get('[data-test="zzim"]').invoke('attr', 'data-test-is-zzim').should('contain', 'zzim_false')
            cy.get('[data-test="zzim"]').eq(0).click({ force: true })
            cy.get('[data-test="zzim"]').invoke('attr', 'data-test-is-zzim').should('contain', 'zzim_true')
        })
    })
    it('찜한 구독한프로그램 취소시 얼럿 노출되는지 확인', () => {
        cy.intercept('https://apis.wavve.com/zzim/contents', (req) => {
            req.reply(zzimVod)
        }).as('zzimVod')
        cy.visit(TEST_URL + '/my/like_program', {
            onBeforeLoad(win) {
                cy.stub(win, 'alert').as('windowAlert')
            }
        })
        cy.wait('@zzimVod').then(({ response }) => {
            cy.likeContentsCancel()
        })
    })
    it('다시 구독한 프로그램 찜하기시 얼럿 노출되는지 확인', () => {
        cy.intercept('https://apis.wavve.com/zzim/contents', (req) => {
            req.reply(zzimVod)
        }).as('zzimVod')
        cy.visit(TEST_URL + '/my/like_program', {
            onBeforeLoad(win) {
                cy.stub(win, 'alert').as('windowAlert')
            }
        })
        cy.wait('@zzimVod').then(({ response }) => {
            cy.likeContentsCancel()
            cy.likeContents()
        })
    })
    it('구독한 프로그램 콘텐츠 선택시 상세화면으로 이동', () => {
        cy.intercept('https://apis.wavve.com/zzim/contents', (req) => {
            req.reply(zzimVod)
        }).as('zzimVod')
        cy.visit(TEST_URL + '/my/like_program')
        cy.wait('@zzimVod').then(({ response }) => {
            cy.get('[data-test="like-item"]').eq(0).click()
            cy.url().should('contain', response.body[0].list[0].programid)
        })
    })
    it('구독한 프로그램 리스트가 없을 경우 빈화면 노출', () => {
        cy.intercept('https://apis.wavve.com/zzim/contents', (req) => {
            zzimVod[0].list = []
            req.reply(zzimVod)
        }).as('zzimVod')
        cy.visit(TEST_URL + '/my/like_program')
        cy.wait('@zzimVod')
        cy.get('.my-like-empty').should('exist')
    })
})
context('단건 구매 콘텐츠', () => {
    beforeEach(() => {
        cy.homePopupOff()
        cy.wavveonOff()
        cy.csInfo()
    })
    function periodExpiration (endTime) {
        if (new Date(endTime.replace(/-/g, '/')) > new Date()) return false
        return true
    }
    it('패키지 탭 선택시 패키지로 이동 확인', () => {
        cy.intercept('https://apis.wavve.com/mypurchase/contents/item', (req) => {
            req.reply(myPurchaseContentItem)
        }).as('getPurchaseItem')
        cy.visit(TEST_URL + '/my/voucher_list_singular').then(async () => {
            await cy.get('.my-sub-nav').contains('패키지').click()
            cy.get('.my-sub-nav').contains('패키지').should('have.class', 'my-sub-nav-on')
        })
    })
    it('개별구매 콘텐츠 선택시 해당 상세페이지로 이동되는지 확인', () => {
        cy.intercept('https://apis.wavve.com/mypurchase/contents/item', (req) => {
            req.reply(myPurchaseContentItem)
        }).as('getPurchaseItem')
        cy.visit(TEST_URL + '/my/voucher_list_singular')
        cy.wait('@getPurchaseItem').then(({ response }) => {
            cy.log(response)
            cy.get('[data-test="single-purchase-img"]').eq(1).click()
            cy.url().should('contain', response.body.list[1].contentid)
        })
    })
    it('개별구매 각각 조건에 맞는 태그 확인 및 성인콘텐츠 확인', () => {
        cy.intercept('https://apis.wavve.com/mypurchase/contents/item', (req) => {
            req.reply(myPurchaseContentItem)
        }).as('getPurchaseItem')
        cy.visit(TEST_URL + '/my/voucher_list_singular')
        cy.wait('@getPurchaseItem').then((interception) => {
            const list = interception.response.body.list
            if (list.length > 0) {
                list.forEach((item, index) => {
                    if (item.contenttype === 'vod') {
                        cy.get('.my-purchase-cell').eq(index).find('.tag-vod').should('exist')
                    } else if (item.contenttype === 'movie') {
                        cy.get('.my-purchase-cell').eq(index).find('.tag-movie').should('exist')
                    }
                    if (item.own === 'y') {
                        cy.get('.my-purchase-cell').eq(index).find('.tag-permanent').should('exist')
                    } else if (periodExpiration(item.enddatetime)) {
                        cy.get('.my-purchase-cell').eq(index).find('.period-expiration-style').should('exist')
                        cy.get('.my-purchase-cell').eq(index).find('.tag-expire').should('exist')
                    } else {
                        cy.get('.my-purchase-cell').eq(index).find('.tag-rental').should('exist')
                    }
                    if (item.targetage === '21' && item.contenttype === 'movie') {
                        cy.get('.movie-lock-21').should('exist')
                    } else if (item.targetage === '21' && item.contenttype === 'vod') {
                        cy.get('.vod-lock-21').should('exist')
                    }
                    if (item.targetage >= 18) {
                        cy.get('.tag-age').should('exist')
                        cy.get('.tag-age > img').should('have.attr', 'alt', '청소년 관람 불가')
                    }
                })
                cy.get('[data-test="single-purchase-img"]').eq(0).click()
                cy.url().should('contain', '/player')
            } else {
                cy.get('.my-like-empty').should('exist')
            }
        })
    })
    it('편집 선택시 편집모드 노출 확인', () => {
        cy.intercept('https://apis.wavve.com/mypurchase/contents/item', (req) => {
            req.reply(myPurchaseContentItem)
        }).as('getPurchaseItem')
        cy.visit(TEST_URL + '/my/voucher_list_singular').then(async () => {
            await cy.get('[data-test="my-view-edit"]').click({ force: true })
            cy.get('.my-purchase-edit-l').should('exist')
        })
    })
    it('편집모드에서 나가기 선택시 편집모드 미노출', () => {
        cy.intercept('https://apis.wavve.com/mypurchase/contents/item', (req) => {
            req.reply(myPurchaseContentItem)
        }).as('getPurchaseItem')
        cy.visit(TEST_URL + '/my/voucher_list_singular').then(async () => {
            await cy.get('[data-test="my-view-edit"]').click({ force: true })
            await cy.get('[data-test="my-view-exit"]').click({ force: true })
            cy.get('[data-test="my-view-exit"]').should('not.exist')
        })
    })
    it('선택 삭제시 선택한 컨텐츠만 삭제되는지 확인', () => {
        cy.intercept('https://apis.wavve.com/mypurchase/contents?').as('deleteContents')
        cy.interceptDelete({ url: 'https://apis.wavve.com/mypurchase/contents/item?', deleteType: 'select', json: myPurchaseContentItem, type: 'singular' }).as('getPurchaseItem')
        cy.visit(TEST_URL + '/my/voucher_list_singular')
        cy.get('@getPurchaseItem')
        cy.get('[data-test="my-view-edit"]').click({ force: true })
        cy.get('.my-purchase-check').eq(0).find('input').check({orce: true })
        cy.get('[data-test="select-delete"]').should('contain', 1)
        cy.get('[data-test="select-delete"]').click({ force: true })
        cy.wait('@deleteContents').then(({ response }) => {
            if(response.statusCode === 200) {
                cy.wait('@getPurchaseItem').then(({ response }) => {
                    cy.get('.my-purchase-cell').should('have.length', 3)
                })
            }
        })
    })
    it('전체삭제시 confirm 노출 취소 선택시 전체삭제 되지 않는다.', () => {
        cy.intercept('https://apis.wavve.com/mypurchase/contents/item', (req) => {
            req.reply(myPurchaseContentItem)
        }).as('getPurchaseItem')
        cy.visit(TEST_URL + '/my/voucher_list_singular')
        cy.get('@getPurchaseItem')
        cy.get('[data-test="my-view-edit"]').click({ force: true })
        cy.get('[data-test="all-delete"]').click({ force: true })
        cy.on('window:confirm', () => false)
        cy.get('.my-like-empty').should('not.exist')
    })
    it('전체삭제시 빈화면 노출되는지 확인', () => {
        cy.intercept('https://apis.wavve.com/cf/mypurchase/contents/allitem?').as('deleteAllContents')
        cy.interceptDelete({ url: 'https://apis.wavve.com/mypurchase/contents/item?', deleteType: 'all', json: myPurchaseContentItem, type: 'singular' }).as('getPurchaseItem')
        cy.visit(TEST_URL + '/my/voucher_list_singular')
        cy.get('@getPurchaseItem')
        cy.get('[data-test="my-view-edit"]').click({ force: true })
        cy.get('[data-test="all-delete"]').click({ force: true })
        cy.on('window:confirm', () => true)
        cy.wait('@deleteAllContents').then(({ response }) => {
            if (response.statusCode === 200) {
                cy.wait('@getPurchaseItem').then(({ response }) => {
                    cy.get('.my-like-empty').should('exist')
                })
            }
        })
    })
})
context('패키지 구매 콘텐츠', () => {
    beforeEach(() => {
        cy.homePopupOff()
        cy.wavveonOff()
        cy.csInfo()
        cy.intercept('https://apis.wavve.com/purchase/product-contents/*').as('getPurchasePackageContent')
        cy.intercept('https://apis.wavve.com/mypurchase/contents?').as('deletePackageContents')
        cy.intercept('https://apis.wavve.com/cf/mypurchase/contents/allpackage').as('deleteAllPackageContents')
    })
    it('패키지컨텐츠 있는 경우 노출 확인', () => {
        cy.intercept('https://apis.wavve.com/mypurchase/contents/package', (req) => {
            req.reply(myPurchaseContentPackage)
        }).as('getPurchasePackage')
        cy.visit(TEST_URL + '/my/voucher_list_package')
        cy.wait('@getPurchasePackage')
        cy.get('.my-sub-nav').contains('패키지').click()
        cy.wait('@getPurchasePackage').then((interception) => {
            const list = interception.response.body.list
            if (list.length > 0) {
                cy.get('.my-purchase-btn').eq(0).click()
                cy.wait('@getPurchasePackageContent').then((contentInterception) => {
                    const contentList = contentInterception.response.body[0].list
                    cy.get('.vod-img.thumb-movie').should('have.length', contentList.length)
                })
            }
        })
    })
    it('패키지내역 콘텐츠 선택시 해당 상세화면으로 이동하는지 확인', () => {
        cy.intercept('https://apis.wavve.com/cf/movie/contents').as('getMovieContents')
        cy.intercept('https://apis.wavve.com/mypurchase/contents/package', (req) => {
            req.reply(myPurchaseContentPackage)
        }).as('getPurchasePackage')
        cy.visit(TEST_URL + '/my/voucher_list_package')
        cy.wait('@getPurchasePackage').then(({ response }) => {
            cy.get('.my-purchase-top').eq(0).find('a').click()
            cy.url().should('contain', response.body.list[0].contentid)
        })
    })
    it('해당 상세화면으로 이동하는지 확인', () => {
        cy.intercept('https://apis.wavve.com/cf/movie/contents').as('getMovieContents')
        cy.intercept('https://apis.wavve.com/mypurchase/contents/package', (req) => {
            req.reply(myPurchaseContentPackage)
        }).as('getPurchasePackage')
        cy.visit(TEST_URL + '/my/voucher_list_package')
        cy.wait('@getPurchasePackage').then(({ response }) => {
            cy.get('.my-purchase-top').eq(0).find('a').click()
            cy.url().should('contain', response.body.list[0].contentid)
        })
    })
    it('편집 선택시 편집모드 노출 확인', () => {
        cy.intercept('https://apis.wavve.com/mypurchase/contents/package', (req) => {
            req.reply(myPurchaseContentPackage)
        }).as('getPurchasePackage')
        cy.visit(TEST_URL + '/my/voucher_list_package').then(async () => {
            await cy.get('[data-test="my-view-edit"]').click({ force: true })
            cy.get('.my-purchase-edit-l').should('exist')
        })
    })
    it('편집모드에서 나가기 선택시 편집모드 미노출', () => {
        cy.intercept('https://apis.wavve.com/mypurchase/contents/package', (req) => {
            req.reply(myPurchaseContentPackage)
        }).as('getPurchasePackage')
        cy.visit(TEST_URL + '/my/voucher_list_package').then(async () => {
            await cy.get('[data-test="my-view-edit"]').click({ force: true })
            await cy.get('[data-test="my-view-exit"]').click({ force: true })
            cy.get('[data-test="my-view-exit"]').should('not.exist')
        })
    })
    it('선택 삭제시 선택한 컨텐츠 삭제되는지 확인', () => {
        cy.interceptDelete({ url: 'https://apis.wavve.com/mypurchase/contents/package', deleteType: 'select', json: myPurchaseContentPackage, type: 'package' }).as('getPurchasePackage')
        cy.visit(TEST_URL + '/my/voucher_list_package')
        cy.wait('@getPurchasePackage')
        cy.get('.my-purchase-edit').click({ force: true })
        cy.get('[data-test="package-item"]').eq(0).find('input').check({ force: true })
        cy.get('[data-test="select-delete"]').should('contain', 1)
        cy.get('[data-test="select-delete"]').click({ force: true })
        cy.wait('@deletePackageContents').then(({ response }) => {
            if (response.statusCode === 200) {
                cy.wait('@getPurchasePackage').then(({response })=>{
                    cy.get('[data-test="package-item"]').should('length', response.body.list.length)
                })
            }
        })
    })
    it('전체 삭제시 confirm 취소 시 전체삭제 안되는지 확인', () => {
        cy.intercept('https://apis.wavve.com/mypurchase/contents/package', (req) => {
            req.reply(myPurchaseContentPackage)
        }).as('getPurchasePackage')
        cy.visit(TEST_URL + '/my/voucher_list_package')
        cy.wait('@getPurchasePackage')
        cy.get('.my-purchase-edit').click({ force: true })
        cy.get('[data-test="all-delete"]').click({ force: true })
        cy.on('window:confirm', () => false)
        cy.get('.my-like-empty').should('not.exist')
    })
    it('전체 삭제시 빈화면 노출 확인', () => {
        cy.interceptDelete({ url: 'https://apis.wavve.com/mypurchase/contents/package', deleteType: 'all', json: myPurchaseContentPackage, type: 'package' }).as('getPurchasePackage')
        cy.visit(TEST_URL + '/my/voucher_list_package')
        cy.wait('@getPurchasePackage')
        cy.get('.my-purchase-edit').click({ force: true })
        cy.get('[data-test="all-delete"]').click({ force: true })
        cy.wait('@deleteAllPackageContents').then(({ response }) => {
            if (response.statusCode === 200) {
                cy.wait('@getPurchasePackage').then(({ response }) => {
                    cy.get('.my-like-empty').should('exist')
                    expect(response.body.list.length).to.eq(0)
                })
            }
        })
    })
    it('패키지 없는 경우 "패키지구매 내역이 없어요" 노출 확인', () => {
        cy.intercept('https://apis.wavve.com/mypurchase/contents/package', (req) => {
            myPurchaseContentPackage.list = []
            req.reply(myPurchaseContentPackage)
        }).as('getPurchasePackage')
        cy.visit(TEST_URL + '/my/voucher_list_package')
        cy.wait('@getPurchasePackage').then(({ response }) => {
            cy.get('.my-like-empty').should('exist')
            expect(response.body.list.length).to.eq(0)
        })
    })
})
context('다운로드 관리', () => {
    beforeEach(() => {
        cy.homePopupOff()
        cy.wavveonOff()
        cy.csInfo()
        cy.intercept('DELETE' ,'https://apis.wavve.com/downloads?').as('deleteDownloads')
        cy.intercept('DELETE', 'https://apis.wavve.com/cf/downloads/user').as('deleteAllDownloads')
        cy.intercept('GET', '/login').as('getLogin')
    })
    it('페이지 타이틀 다운로드 관리 노출 확인', () => {
        cy.visit(TEST_URL + '/my/use_list_download')
        cy.get('.page-title').should('contain', '다운로드 관리')
    })
    it('다운로드 가능 횟수 노출 확인', () => {
       드cy.intercept('https://apis.wavve.com/downloads?contenttype', (req) => {
            req.reply(myDownloads)
        }).as('getDownloads')
        cy.visit(TEST_URL + '/my/use_list_download')
        cy.wait('@getDownloads').then((interception) => {
            const totalCountObj = interception.response.body.totalcount
            cy.log(totalCountObj.downloadavailablecount + '/' + totalCountObj.downloadcontentcount)
            cy.get('[data-test="totalcount"]').should('contain.text',  totalCountObj.downloadavailablecount)
        })
    })
    it('이용권 보유자 아닌 경우 다운로드 횟수 노출 안되는지 확인', () => {
        cy.visit(TEST_URL + '/my/use_list_download')
        cy.get('.my-download-count').should('not.exist')
    })
    it('편집 버튼 선택시 다운로드 횟수 숨김처리 되는지 확인', () => {
        cy.intercept('https://apis.wavve.com/downloads?contenttype', (req) => {
            req.reply(myDownloads)
        }).as('getDownloads')
        cy.visit(TEST_URL + '/my/use_list_download')
        cy.get('.my-download-count').should('exist')
        cy.get('[data-test="my-view-edit"]').click({ force: true })
        cy.get('.my-download-count').should('not.exist')
    })
    it('다운로드 관리 편집 선택시 편집화면 노출 확인', () => {
        cy.intercept('https://apis.wavve.com/downloads?contenttype', (req) => {
            req.reply(myDownloads)
        }).as('getDownloads')
        cy.visit(TEST_URL + '/my/use_list_download').then(async () => {
            await cy.get('[data-test="my-view-edit"]').click({ force: true })
            cy.get('.my-purchase-edit-l').should('exist')
        })
    })
    it('편집모드에서 나가기 선택시 편집모드 미노출', () => {
        cy.intercept('https://apis.wavve.com/downloads?contenttype', (req) => {
            req.reply(myDownloads)
        }).as('getDownloads')
        cy.visit(TEST_URL + '/my/use_list_download').then(async () => {
            await cy.get('[data-test="my-view-edit"]').click({ force: true })
            await cy.get('[data-test="my-view-exit"]').click({ force: true })
            cy.get('[data-test="my-view-exit"]').should('not.exist')
        })
    })
    it('4회이상 다운로드한 콘텐츠 보여수 dimmed 처리되어 노출되는지 확인', () => {
        cy.intercept('https://apis.wavve.com/downloads?contenttype', (req) => {
            req.reply(myDownloads)
        }).as('getDownloads')
        cy.visit(TEST_URL + '/my/use_list_download')
        cy.wait('@getDownloads').then(({ response }) => {
            const data = response.body.list[0].downloadcount
            if (data === '4/4') {
                cy.get('.my-download-list').eq(0).should('have.class', 'expire')
            }
        })
    })
    it('성인인증 안된 계정 > 성인콘텐츠 다운로드 선택시 성인 인트로 페이지 노출 안되는지 확인', () => {
        cy.intercept('https://apis.pooq.co.kr/user', (req) => {
            req.reply(notAdultVerifiedUserInfo)
        }).as('getUser')
        cy.NotAdultVerifiedUserAdultContentDownloadClickAndShowAdultIntro('H')
    })
    it('성인인증 안된 계정 > 성인콘텐츠 다운로드 선택시 성인 인트로 페이지 노출 확인 버튼 선택시 인증화면 머무는지 확인(성인 콘텐츠 숨김)', () => {
        cy.intercept('https://apis.pooq.co.kr/user', (req) => {
            req.reply(notAdultVerifiedUserInfo)
        }).as('getUser')
        cy.adultContentDownloadClickAndAdultIntroConfirmClick('H')
    })
    it('성인인증 ok (1년 미만) > 성인콘텐츠 다운로드 선택시 성인 인트로 페이지 노출 확인 선택시 이전화면 노출 > 성인 콘텐츠 다운로드시 다운로드 팝업 노출 확인 (성인 콘텐츠 숨김)', () => {
        cy.intercept('https://apis.pooq.co.kr/user', (req) => {
            req.reply(adultVerifiedUserInfo)
        }).as('getUser')
        cy.verifiedAdultContentDownload('H')
    })
    it('성인콘텐츠 다운로드 선택시 성인 비밀번호 페이지 노출되는지 확인(성인 콘텐츠 잠금)', () => {
        cy.downloadListSetting('L')
        cy.wait('@getDownloads').then(({ response }) => {
            const adultContentsIndex = response.body.list.length - 1
            cy.get('[data-test="download-btn"]').eq(adultContentsIndex).click()
            cy.url().should('contain', '/setting/download/pincode_check')
        })
    })
    it('성인콘텐츠 다운로드 선택시 성인 비밀번호 페이지 > 비밀번호 입력 > 이전페이지로 이동하는지 확인(성인 콘텐츠 잠금)', () => {
        cy.downloadListSetting('L')
        cy.wait('@getDownloads').then(({ response }) => {
            const adultContentsIndex = response.body.list.length - 1
            cy.get('[data-test="download-btn"]').eq(adultContentsIndex).click()
            cy.url().should('contain', '/setting/download/pincode_check')
            cy.adultPassword()
            cy.get('.button-confirm').click()
            cy.url().should('contain', '/my/use_list_download')
        })
    })
    it('성인콘텐츠 다운로드 선택시 성인 비밀번호 페이지 > 비밀번호 입력 > 이전페이지로 이동후 다운로드 팝업 노출 확인(성인 콘텐츠 잠금)', () => {
        cy.downloadListSetting('L')
        cy.wait('@getDownloads').then(({ response }) => {
            const adultContentsIndex = response.body.list.length - 1
            cy.get('[data-test="download-btn"]').eq(adultContentsIndex).click()
            cy.url().should('contain', '/setting/download/pincode_check')
            cy.adultPassword()
            cy.get('.button-confirm').click()
            cy.url().should('contain', '/my/use_list_download')
            cy.get('[data-test="download-btn"]').eq(adultContentsIndex).click()
            cy.url().should('not.contain', '/setting/download/pincode_check')
        })
    })
    it('다운로드 버튼 선택시 다운로드 팝업 노출 확인', () => {
        cy.clearCookie('cs')
        cy.intercept('https://apis.wavve.com/downloads?contenttype', (req) => {
            req.reply(myDownloads)
        }).as('getDownloads')
        cy.visit(TEST_URL + '/my/use_list_download', {
            onBeforeLoad(win) {
                cy.stub(win, 'alert').as('windowAlert')
            }
        })
        cy.login('jihye0121', 'pooq1004!')
        cy.wait('@getLogin')
        cy.wait('@getDownloads').then((interception) => {
            const list = interception.response.body.list
            list.forEach((item, index) => {
                const downloadCountArr = item.downloadcount.split('/')
                if (downloadCountArr[0] === downloadCountArr[1]) {
                    cy.get('.my-download-list').should('have.class', 'expire')
                    cy.get('[data-test="download-btn"]').eq(index).click({ force: true })
                    cy.window().its('alert').should('be.called')
                } else {
                    cy.request({ url: 'https://apis.wavve.com/cf/vod/contents/' + item.contentid,
                        qs: {
                            apikey: 'E5F3E0D30947AA5440556471321BB6D9',
                            device: 'pc',
                            partner: 'pooq',
                            pooqzone: 'none',
                            region: 'kor',
                            drm: 'wm',
                            targetage: 'all',
                            credential: 'qTVoToA3lERq8oH+8qmH42/CAxZQqR+yhhf8UqQ521vceHbpJudBT'
                        }}).then(async (response) => {
                        await cy.get('[data-test="download-btn"]').eq(index).click({ force: true })
                        if (response.body.targetage < 19) {
                            cy.get('[data-test="download-popup"]').should('exist')
                        }
                    })
                }
            })
        })
    })
    it('선택 삭제할 경우 선택한 다운로드만 삭제되었는지 확인', () => {
        cy.interceptDelete({ url: 'https://apis.wavve.com/downloads?contenttype', deleteType: 'select', json: myDownloads, type: 'download' }).as('getDownloads')
        cy.visit(TEST_URL + '/my/use_list_download')
        cy.wait('@getDownloads')
        cy.get('[data-test="my-view-edit"]').click({ force: true })
        cy.get('.check-blue-dark').eq(0).check({ force: true })
        cy.get('[data-test="select-delete"]').click({ force: true })
        cy.wait('@deleteDownloads').then(({ response }) => {
            if (response.statusCode === 200) {
                cy.log(response)
                cy.wait('@getDownloads').then(({ response }) => {
                    cy.get('.my-download-list').should('have.length', response.body.list.length)
                })
            }
        })
    })
    it('전체 삭제 선택시 confirm 취소시 삭제 안됨', () => {
        cy.intercept('https://apis.wavve.com/downloads?contenttype', (req) => {
            req.reply(myDownloads)
        }).as('getDownloads')
        cy.visit(TEST_URL + '/my/use_list_download')
        cy.wait('@getDownloads')
        cy.get('[data-test="my-view-edit"]').click({ force: true })
        cy.get('[data-test="all-delete"]').click({ force: true })
        cy.on('window:confirm', () => false)
        cy.get('.my-like-empty').should('not.exist')
    })
    it('전체 삭제시 빈화면 노출 확인', () => {
        cy.interceptDelete({ url: 'https://apis.wavve.com/downloads?contenttype', deleteType: 'all', json: myDownloads, type: 'download'  }).as('getDownloads')
        cy.visit(TEST_URL + '/my/use_list_download')
        cy.wait('@getDownloads')
        cy.get('[data-test="my-view-edit"]').click({ force: true })
        cy.get('[data-test="all-delete"]').click({ force: true })
        cy.on('window:confirm', () => true)
        cy.wait('@deleteAllDownloads').then(({ response }) => {
            if (response.statusCode === 200) {
                cy.wait('@getDownloads').then(({response}) => {
                    expect(response.body.list.length).to.eq(0)
                    cy.get('.my-like-empty').should('exist')
                })
            }
        })
    })
    it('내역이 없을 경우 "다운로드 내역이 없어요" 문구 노출되는지 확인', () => {
        cy.visit(TEST_URL + '/my/use_list_download')
        cy.get('.my-like-empty').should('exist')
    })
})
