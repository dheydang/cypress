import {TEST_URL} from "../../common/constant";
import vodNotice from "../../fixtures/player/vodNotice.json";
import vodContent from '../../fixtures/player/vodContent.json'
context('해외시리즈 상세화면', () => {
    beforeEach(() => {
        cy.homePopupOff()
        cy.wavveonOff()
        cy.intercept('https://apis.wavve.com/fz/vod/contents/*').as('getVodContent')
        cy.intercept('https://apis.wavve.com/getpermissionforcontent').as('getPermissionForContent')
        cy.intercept('GET', '/login').as('getLogin')
        cy.intercept('https://apis.wavve.com/cf/themes-related/*').as('getThemesRelated')
        cy.intercept('https://apis.wavve.com/zzim/contents?').as('getZzimProgram')
        cy.visit(TEST_URL + '/player/vod', {
            qs: {
                contentid: 'F0801_F08000000009_01_0001.1'
            },
            onBeforeLoad (win) {
                cy.stub(win, 'open').as('windowOpen')
                cy.stub(win, 'alert').as('windowAlert')
            }
        })
    })
    it('프로그램명, 회차, 장르, 상영시간, 연령 노출되는지 확인', () => {
        cy.wait('@getVodContent').then(({ response }) => {
            const data = response.body
            cy.log(data)
            cy.get('[data-test="season-title"]').should('contain', data.seasontitle) // 프로그램명
            cy.get('.program-info-box').contains((data.episodenumber + '회')).should('exist') // 회차
            cy.get('.program-info-box').contains(data.genretext).should('exist') // 장르
            cy.get('.program-info-box').contains((Math.floor((data.playtime)/60)) + '분').should('exist') // 상영시간
            cy.get('.program-info-box').contains((data.targetage + '세')).should('exist')
        })
    })
    it('미로그인 > 액션버튼 로그인 문구 노출되는지 확인', () => {
        cy.get('[data-test="player-action-button"]').should('contain', '로그인')
    })
    it('미로그인 > 액션버튼 선택시 로그인창 노출되는지 확인', () => {
        cy.wait('@getPermissionForContent').then(({ response }) => {
            cy.get('[data-test="player-action-button"]').click()
            cy.get('.login-popup').should('exist')
            cy.loginPopup('jihye0121', 'pooq1004!')
            cy.wait('@getLogin')
            cy.get('[data-test="player-action-button"]').should('contain', '이용권 구매하기')
        })
    })
    it('이용권 미구매 계정 > 액션버튼 이용권 구매하기 버튼명 노출되는지 확인', () => {
        cy.clickUtilMenuLogin('jihye0121', 'pooq1004!')
        cy.get('[data-test="player-action-button"]').should('contain', '이용권 구매하기')
    })
    it('이용권 미구매 계정 > 액션버튼 이용권 구매하기 버튼 선택시 윈도우 팝업 발생하는지 확인', () => {
        cy.clickUtilMenuLogin('jihye0121', 'pooq1004!')
        cy.get('[data-test="player-action-button"]').click()
        cy.window().its('open').should('be.called')
    })
    it('이용권 구매 계정 > 액션버튼 시청하기 버튼명 노출되는지 확인', () => {
        cy.clickUtilMenuLogin('jihye0667', 'pooqwavve1!')
        cy.get('.user-style').eq(1).click()
        cy.get('[data-test="player-action-button"]').should('contain', '시청하기')
    })
    it('공유, 구독 버튼 노출되는지 확인', () => {
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
    it('미로그인 > 구독 선택시 로그인 팝업 노출 확인', async () => {
        await cy.get('[data-test="zzim"]').click({force: true})
        cy.get('.login-popup').should('exist')
    })
    it('로그인 > 구독 버튼 선택시 구독버튼 활성화되어 구독중으로 노출되는지 확인', () => {
        cy.csInfo()
        cy.wait('@getVodContent').then(async ({ response }) => {
            await cy.get('[data-test="zzim"]').click({ force: true })
            cy.window().its('alert').should('be.called')
            cy.zzim(response.body.zzim)
            cy.get('[data-button-type="zzim"]').contains('구독중').should('exist')
        })
    })
    it('로그인 > 구독 버튼 선택시 구독한 프로그램 목록에 노출되는지 확인', () => {
        cy.csInfo()
        cy.wait('@getVodContent').then(async ({ response }) => {
            await cy.get('[data-test="zzim"]').click({ force: true })
            cy.window().its('alert').should('be.called')
            cy.zzim(response.body.zzim)
            cy.visit(TEST_URL + '/my/like_program')
            cy.wait('@getZzimProgram').then(({ response }) => {
                const list = response.body[0].list
                const findIndex = Cypress._.findIndex(list, { programid: 'C9001_C90000000023' })
                expect(findIndex).not.equals('-1')
            })
        })
    })
    it('더보기 버튼 노출되는지 확인', () => {
        cy.get('[data-test="vod-view-more"]').should('exist')
    })
    it('이미지, 개요, 장르, 출연, 줄거리 정보 노출되는지 확인', () => {
        cy.wait('@getVodContent').then(({ response}) => {
            const data = response.body
            cy.get('[data-test="vod-view-more"]').click()
            cy.get('[data-test="vod-summary"]').contains('개요').should('exist')
            if (data.programposterimage !== '') {
                cy.get('.detail-view-content-img > img').should('have.attr', 'src').should('include', data.programposterimage)
            }
            if (data.tags.list.length > 0) {
                cy.get('[data-test="vod-genre"]').should('have.length', data.tags.list.length)
            }
            if (data.actors.list.length > 0) {
                cy.get('[data-test="vod-actors"]').should('have.length', data.actors.list.length)
            }
            if (data.programsynopsis !== '') {
                cy.get('[data-test="vod-synopsis"]').should('exist')
            }
            if (data.directors.list.length > 0) {
                cy.get('[data-test="vod-directors"]').should('have.length', data.directors.list.length)
            }
            if (data.writers.list.length > 0) {
                cy.get('[data-test="vod-writers"]').should('have.length', data.writers.list.length)
            }
        })
    })
    it('출연자 선택시 텍스트 검색화면으로 이동되는지 확인', () => {
        cy.wait('@getVodContent').then(({ response}) => {
            const data = response.body
            cy.get('[data-test="vod-actors"]').eq(0).click()
            cy.url().should('contain', ('/search/search?searchWord=' + encodeURI(data.actors.list[0].text)))
        })
    })
    it('장르 선택시 태그검색 화면으로 이동하는지 확인', () => {
        cy.wait('@getVodContent').then(({ response}) => {
            const data = response.body
            if (data.tags.list.length > 0) {
                cy.get('[data-test="vod-view-more"]').click()
                cy.get('[data-test="vod-genre"]').eq(0).click()
                cy.url().should('contain', '/search/search_tag_group')
            }
        })
    })
    it('감독 선택시 텍스트 검색화면으로 이동되는지 확인', () => {
        cy.wait('@getVodContent').then(({ response}) => {
            const data = response.body
            if (data.directors.list.length > 0) {
                cy.get('[data-test="vod-view-more"]').click()
                cy.get('[data-test="vod-directors"]').eq(0).click()
                cy.url().should('contain', ('/search/search?searchWord=' + encodeURI(data.directors.list[0].text)))
            }
        })
    })
    it('작가 선택시 텍스트 검색화면으로 이동되는지 확인', () => {
        cy.wait('@getVodContent').then(({ response}) => {
            const data = response.body
            if (data.writers.list.length > 0) {
                cy.get('[data-test="vod-view-more"]').click()
                cy.get('[data-test="vod-writers"]').eq(0).click()
                cy.url().should('contain', ('/search/search?searchWord=' + encodeURI(data.writers.list[0].text)))
            }
        })
    })
    it('코멘트 있을 경우 코멘트 노출되는지 확인', () => {
        cy.wait('@getVodContent').then(({ response}) => {
            const data = response.body
            console.log(data)
            if (data.comment !== '') {
                cy.get('[data-test="comment"]').should('exist')
            }
        })
    })
    it('간략히 버튼 선택시 내용 접히는지 확인', () => {
        cy.get('[data-test="vod-view-more"]').click()
        cy.get('[data-test="vod-view-close"]').click()
        cy.get('[data-test="vod-view-more"]').contains('더보기').should('exist')
    })
    it('전체회차 > defualt로 전체회차 탭이 선택되어 노출되는지 확인', () => {
        cy.get('[data-test="vod-player-tab"]').contains('에피소드').should('have.class', 'on')
    })
    it('다른회차 선택시 재생되는지 확인', () => {
        cy.get('[data-test="thumb-all-vod-thumbnail"]').eq(2).click()
        cy.wait(2000)
        cy.get('[data-test="vod-player-tab"]').scrollIntoView()
        cy.url().should('not.contain', 'M_EP202102263552.1')
        cy.get('[data-test="thumb-all-vod-thumbnail"]').eq(2).find('[data-test="now-player"]').should('have.class', 'vod-play-now')
    })
    it('전체보기 > 우측 정렬순서 옵션변경으로 최신회부터, 첫회부터 동작되는지 확인', async () => {
        await cy.get('[data-test="order-filter"]').select('첫회부터')
        cy.get('[data-test="order-filter"]').invoke('val').should('deep.equal', 'old')
    })
    it('추천 탭 메뉴 선택시 추천역역으로 이동되는지 확인', () => {
        cy.get('[data-test="vod-player-tab"]').contains('추천').click()
        cy.get('[data-test="vod-player-tab"]').contains('추천').should('have.class', 'on')
    })
    it('각 멀티밴드 내에 "더보기>" 버튼 선택시 해당 멀티밴드 상세리스트로 이동하는지 확인', () => {
        cy.get('[data-test="vod-player-tab"]').contains('추천').click()
        cy.get('[data-test="view-more"]').eq(0).click({ force: true })
        cy.url().should('contain', '/list')
    })
    it('각 멀티밴드 리스트 내에 리스트 선택시 해당 상세페이지로 이동되는지 확인', () => {
        cy.get('[data-test="vod-player-tab"]').contains('추천').click()
        cy.get('[data-test="view-more"]').eq(0).click({ force: true })
        cy.wait('@getThemesRelated')
        cy.get('[data-test="portrait-cell"]').eq(0).click()
        cy.url().should('contain', '/player/vod')
    })
})
