import {TEST_URL} from "../../common/constant"
import vodNotice from '../../fixtures/player/vodNotice.json'
import programContents from '../../fixtures/player/programContents.json'
import notAdultVerifiedUserInfo from '../../fixtures/my/notAdultVerifiedUserInfo.json'
context('플레이서 상세화면', () => {
    beforeEach(() => {
        cy.homePopupOff()
        cy.wavveonOff()
        cy.intercept('https://apis.wavve.com/es/notice/contents/*', (req) => {
            req.reply(vodNotice)
        }).as('getVodNotice')
        cy.intercept('https://apis.wavve.com/fz/vod/contents/*').as('getVodContent')
        cy.intercept('https://apis.wavve.com/streaming').as('getStreaming')
        cy.intercept('https://apis.wavve.com/getpermissionforcontent').as('getPermissionForContent')
        cy.intercept('GET', '/login').as('getLogin')
        cy.visit(TEST_URL+'/player/vod', {
            qs: {
                contentid: 'K04_LS-20211008031612-01-000.1'
            },
            onBeforeLoad (win) {
                cy.stub(win, 'open').as('windowOpen')
                cy.stub(win, 'alert').as('windowAlert')
            }
        })
    })
    it('다운로드, 공유, 구독 버튼 노출되는지 확인', () => {
        cy.get('.icon-box > ul').find('li').contains('다운로드').should('exist')
        cy.get('.icon-box > ul').find('li').contains('공유').should('exist')
        cy.get('.icon-box > ul').find('li').contains('구독').should('exist')
    })
    it('공유 > 페이스북 버튼 선택시 윈도우 팝업 노출 확인', () => {
        cy.get('[data-test="vod-share"]').click({ force: true })
        cy.get('.pop-common-share').should('exist')
        cy.wait(5000)
        cy.get('[data-test="facebook"]').click({ force: true })
        cy.window().its('open').should('be.called')
    })
    it('공유 > tiwtter 버튼 선택시 윈도우 팝업 노출 확인', () => {
        cy.get('[data-test="vod-share"]').click({ force: true })
        cy.get('.pop-common-share').should('exist')
        cy.get('[data-test="twitter"]').click({ force: true })
        cy.window().its('open').should('be.called')
    })
    it('공유 > 링크 복사 버튼 선택시 얼럿 노출 확인', () => {
        cy.get('[data-test="vod-share"]').click({ force: true })
        cy.get('.pop-common-share').should('exist')
        cy.get('[data-test="link-copy"]').click({ force: true })
        cy.window().its('alert').should('be.called')
    })
    it('콘텐츠 공지사항 선택시 공지사항 내용 노출 확인', () => {
        cy.wait('@getVodNotice').then(async ({ response }) => {
            cy.get('.player-notice-button').should('exist')
            await cy.get('[data-test="program-notice"]').click()
            cy.get('[data-test="program-notice"]').should('have.class', 'player-notice-close')
        })
    })
    it('메타정보 더보기 선택시 메타정보 노출 확인', () => {
        cy.get('[data-test="vod-view-more"]').click()
        cy.get('[data-test="vod-view-close"]').children().should('contain', '간략히')
    })
    it('개요, 장르, 출연, 줄거리 정보 노출되는지 확인', () => {
        cy.wait('@getVodContent').then(({ response}) => {
            const data = response.body
            cy.get('[data-test="vod-view-more"]').click()
            cy.get('[data-test="vod-summary"]').contains('개요').should('exist')
            if (data.tags.list.length > 0) {
                cy.get('[data-test="vod-genre"]').should('have.length', data.tags.list.length)
            }
            if (data.actors.list.length > 0) {
                cy.get('[data-test="vod-actors"]').should('have.length', data.actors.list.length)
            }
            if (data.programsynopsis !== '') {
                cy.get('[data-test="vod-synopsis"]').should('exist')
            }
        })
    })
    it('장르 선택시 태그 검색 화면으로 이동 확인', () => {
        cy.wait('@getVodContent').then(({ response }) => {
            const contentInfo = response.body
            if (contentInfo.tags.list.length > 0) {
                cy.get('[data-test="vod-view-more"]').click()
                cy.get('[data-test="vod-genre"]').eq(0).click()
                cy.url().should('contain', '/search/search_tag_group')
            }
        })
    })
    it('출연자 선택시 텍스트 검색 화면으로 이동', () => {
        cy.wait('@getVodContent').then(({ response }) => {
            const contentInfo = response.body
            if (contentInfo.actors.list.length > 0) {
                cy.get('[data-test="vod-view-more"]').click()
                cy.get('[data-test="vod-actors"]').eq(0).click()
                cy.url().should('contain', ('/search/search?searchWord=' + encodeURI(contentInfo.actors.list[0].text)))
            }
        })
    })
    it('감독 선택시 텍스트 검색 화면으로 이동', () => {
        cy.wait('@getVodContent').then(({ response }) => {
            const contentInfo = response.body
            if (contentInfo.directors.list.length > 0) {
                cy.get('[data-test="vod-view-more"]').click()
                cy.get('[data-test="vod-directors"]').eq(0).click()
                cy.url().should('contain', ('/search/search?searchWord=' + encodeURI(contentInfo.directors.list[0].text)))
            }
        })
    })
    it('간략히 버튼 선택시 내용 접히는지 확인', () => {
        cy.get('[data-test="vod-view-more"]').click()
        cy.get('[data-test="vod-view-close"]').click()
        cy.get('[data-test="vod-view-more"]').contains('더보기').should('exist')
    })
    it('액션버튼 > 미로그인 > 로그인 버튼 노출되는지 확인', () => {
        cy.get('[data-test="player-action-button"]').should('contain', '로그인')
    })
    it('액션버튼 > 미로그인 > 로그인 버튼 선택시 로그인창 표시되며 로그인 동작되는 확인', () => {
        cy.wait('@getPermissionForContent').then(({ response }) => {
            cy.get('[data-test="player-action-button"]').click()
            cy.get('.login-popup').should('exist')
            cy.loginPopup('jihye0121', 'pooq1004!')
            cy.wait('@getLogin')
            cy.get('[data-test="player-action-button"]').should('contain', '이용권 구매하기')
        })
    })
    it('액션버튼 > 이용권 미보유 > 이용권 구매하기 버튼 노출되는지 확인', () => {
        cy.clickUtilMenuLogin('jihye0121', 'pooq1004!')
        cy.get('[data-test="player-action-button"]').should('contain', '이용권 구매하기')
    })
    it('액션버튼 > 이용권 미보유 > 이용권 구매하기 버튼 선택시 이용권화면 노출되는지 확인', () => {
        cy.clickUtilMenuLogin('jihye0121', 'pooq1004!')
        cy.get('[data-test="player-action-button"]').click()
        cy.window().its('open').should('be.called')
    })
    it('액션버튼 > 이용권 미보유 > 시청하기 버튼 노출되는지 확인', () => {
        cy.clickUtilMenuLogin('jihye0667', 'pooqwavve1!')
        cy.get('.user-style').eq(1).click()
        cy.get('[data-test="player-action-button"]').should('contain', '시청하기')
    })
    it('전체보기 > 우측 정렬순서 옵션변경으로 최신회부터, 첫회부터 동작되는지 확인', async () => {
        await cy.get('[data-test="order-filter"]').select('첫회부터')
        cy.get('[data-test="order-filter"]').invoke('val').should('deep.equal', 'old')
    })
    it('추천 탭 선택시 추천탭으로 이동하는지 확인', () => {
        cy.get('[data-test="vod-player-tab"] > li').contains('추천').click().should('have.class', 'on')
    })
    it('전체회차 다른 콘텐츠 썸네일 선택시 현재 재생 콘텐츠 표시 선택한 콘텐츠로 노출되는지 확인', async () => {
        await cy.get('[data-test="thumb-all-vod-thumbnail"]').eq(2).click().url().should('not.contain', 'M_EP202102263552.1')
        cy.get('[data-test="thumb-all-vod-thumbnail"]').eq(2).children().should('have.class', 'vod-play-now')
    })
    it('미로그인 > 구독 선택시 로그인 팝업 노출 확인', async () => {
        await cy.get('[data-test="zzim"]').click({force: true})
        cy.get('.login-popup').should('exist')
    })
    it('로그인 > 구독 버튼 선택시 정상 동작하는지 확인', () => {
        cy.csInfo()
        cy.wait('@getVodContent').then(async ({ response }) => {
            await cy.get('[data-test="zzim"]').click({ force: true })
            cy.window().its('alert').should('be.called')
            cy.log(response.body.zzim)
            cy.zzim(response.body.zzim)
        })
    })
    it('이용권 미보유 > 다운로드 선택시 다운로드 권한없어요~~~ 문구 팝업 발생', () => {
        cy.clickUtilMenuLogin('jihye0121', 'pooq1004!')
        cy.get('[data-test="vod-download"]').click({force: true})
        cy.get('[data-test="download-popup"]').contains('다운로드 권한이 없습니다.').should('exist')
    })
    it('이용권 보유 > 다운로드 선택시 다운로드 되는지 확인', () => {
        cy.clickUtilMenuLogin('jihye0667', 'pooqwavve1!')
        cy.get('.user-style').eq(1).click()
        cy.get('[data-test="vod-download"]').click({force: true})
        cy.get('[data-test="download-popup"').contains('다운로드 화질 선택').should('exist')
    })
    it('이용권 미보유 > 다운로드 버튼 선택시 팝업 x 버튼 선택시 팝업 사라짐 확인', () => {
        cy.clearCookie('cs')
        cy.visit(TEST_URL+'/player/vod', {
            qs: {
                contentid: 'M_EP202102263552.1'
            }
        }).then(async () => {
            await cy.clickUtilMenuLogin('jihye0121', 'pooq1004!')
            await cy.get('[data-test="vod-download"]').click({force: true})
            cy.wait('@getStreaming')
            await cy.get('[data-test="download-popup-close"]').click()
            cy.get('[data-test="download-popup"]').should('not.exist')
        })
    })
    it('미로그인 > 다운로드 선택시 로그인 팝업 노출 확인', async () => {
        await cy.get('[data-test="vod-download"]').click({force: true})
        cy.get('.login-popup').should('exist')
    })
    it('전체회차 > 콘텐츠 선택시 해당 회차 상세화면으로 이동되는지 확인', () => {
        cy.get('[data-test="thumb-all-vod-thumbnail"]').eq(0).click()
        cy.url().should('not.contain', 'M_EP202102263552.1')
    })
    it('시즌이있는 콘텐츠일경우 시즌 필터 노출되는지 확인', () => {
        cy.intercept('https://apis.wavve.com/fz/vod/programs-contents/*', (req) => {
            req.reply(programContents)
        }).as('getProgramContents')
        cy.visit(TEST_URL+'/player/vod', {
            qs: {
                contentid: 'K04_LS-20211008031612-01-000.1'
            }
        })
        cy.wait('@getProgramContents').then(({ response }) => {
            if (response.body.filter.filterlist[0].filter_item_list.length > 0) {
                cy.get('.player-list .filter-item').should('have.length', ((response.body.filter.filterlist.length) + 1))
            }
        })
    })
    it('시즌 변경시 상세화면 유지되고 필터만 변경되는지 확인', () => {
        cy.get('.player-list .filter-item').eq(0).find('select').select('시즌2')
        cy.get('.player-list .filter-item').eq(0).find('select').should('have.value', 'K04_AG2018-0060')
        cy.get('[data-test="season-title"]').should('contain', '연애의 참견 시즌3')
    })
    it('에피소드 내의 다른 회차 텍스트 선택시 해당 회차로 이동되는지 확인', () => {
        cy.intercept('https://apis.wavve.com/fz/vod/programs-contents/*', (req) => {
            req.reply(programContents)
        }).as('getProgramContents')
        cy.visit(TEST_URL+'/player/vod', {
            qs: {
                contentid: 'K04_LS-20211008031612-01-000.1'
            }
        })
        cy.wait('@getProgramContents').then(({ response }) => {
            cy.get('[data-test="thumb-all-vod-info"]').eq(1).click()
            cy.url().should('contain', (response.body.cell_toplist.celllist[1].event_list[1].url).replace('.html', ''))
        })
    })
    it('에피소드 내의 다른 회차 썸네일 선택시 해당 회차로 이동되는지 확인', () => {
        cy.intercept('https://apis.wavve.com/fz/vod/programs-contents/*', (req) => {
            req.reply(programContents)
        }).as('getProgramContents')
        cy.visit(TEST_URL+'/player/vod', {
            qs: {
                contentid: 'K04_LS-20211008031612-01-000.1'
            }
        })
        cy.wait('@getProgramContents').then(({ response }) => {
            cy.get('[data-test="thumb-all-vod-thumbnail"]').eq(1).click()
            cy.url().should('contain', (response.body.cell_toplist.celllist[1].event_list[1].url).replace('.html', ''))
        })
    })
    it('미로그인 > 에피소드 탭 내의 다른회차 다운로드 버튼 선택시 로그인팝업 발생하는지 확인', () => {
        cy.get('[data-test="thumb-all-vod-download"]').eq(0).click()
        cy.get('.login-popup').should('exist')
    })
    it('미로그인 > 다운로드 버튼선택시 로그인팝업 발생 > 로그인 > 현재 상세페이지 노출되는지 확인', () => {
        cy.get('[data-test="thumb-all-vod-download"]').eq(0).click()
        cy.loginPopup('jihye0121', 'pooq1004!')
        cy.get('@getLogin')
        cy.url().should('contain', '/player/vod?contentid=K04_LS-20211008031612-01-000.1')
    })
    it('미로그인 > utilmenu > 로그인 > 기존 상세화면 노출되는지 확인', () => {
        cy.clearCookie('cs')
        cy.visit(TEST_URL+'/player/vod', {
            qs: {
                contentid: 'K04_LS-20211008031612-01-000.1'
            }
        })
        cy.get('.header-nav ul').contains('로그인').click()
        cy.login('jihye0121', 'pooq1004!')
        cy.get('@getLogin')
        cy.url().should('contain', '/player/vod?contentid=K04_LS-20211008031612-01-000.1')
    })
})
context('19 콘텐츠', () => {
    beforeEach( () => {
        cy.wavveonOff()
        cy.homePopupOff()
        cy.csInfo()
    })
    it('성인 인증 1년 미만인 경우 > 성인 콘텐츠 노출되는지 확인', () => {
        cy.intercept('https://apis.pooq.co.kr/user?').as('getUser')
        cy.visit(TEST_URL+'/player/vod', {
            qs: { programid: 'C9901_C99000000054' }
        })
        cy.wait('@getUser').then(() => {
            cy.wait(1000)
            cy.getCookie('verifiedAdult').should('have.property', 'value', '1')
            cy.url().should('not.contain', '/adult')
        })
    })
    it('성인인증 안된 경우 성인인증 팝업 노출되는지 확인', () => {
        cy.intercept('https://apis.pooq.co.kr/user?', (req) => {
            req.reply(notAdultVerifiedUserInfo)
        }).as('getUser')
        cy.visit(TEST_URL+'/player/movie', {
            qs: { programid: 'C9901_C99000000054' }
        })
        cy.url().should('contain', 'adult')
        cy.url().should('not.contain', '/player/vod')
    })
    it('성인 콘텐츠 인트로 > 나가기시 이전페이지로 이동하는지 확인', () => {
        cy.intercept('https://apis.pooq.co.kr/user?', (req) => {
            req.reply(notAdultVerifiedUserInfo)
        }).as('getUser')
        cy.visit(TEST_URL+'/player/vod', {
            qs: { programid: 'C9901_C99000000054' }
        })
        cy.get('.button-cancel').click()
        cy.url().should('not.contain', '/player/vod?programid=C9901_C99000000054')
        cy.url().should('not.contain', '/adult')

    })
})
