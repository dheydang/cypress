import {TEST_URL} from "../../common/constant";
import movieEventBanner from '../../fixtures/player/movieEventBanner.json'
import adultSettingsNone from '../../fixtures/player/adultSettingsNone.json'
import movieContent from '../../fixtures/player/movieContent.json'
import notAdultVerifiedUserInfo from '../../fixtures/my/notAdultVerifiedUserInfo.json'
context('플레이어 상세화면', () => {
    beforeEach(() => {
        cy.homePopupOff()
        cy.wavveonOff()
        cy.intercept('https://apis.wavve.com/cf/supermultisections/DN2').as('getSuperMultiSection')
        cy.intercept('https://apis.wavve.com/fz/movie/contents/*').as('getMovieContents')
        cy.intercept('https://apis.wavve.com/cf/events-banner/contents/*', (req) => {
            req.reply(movieEventBanner)
        }).as('getMovieEventBanner')
        cy.intercept('https://apis.wavve.com/getpermissionforcontent').as('getPermissionForContent')
        cy.intercept('GET', '/login').as('getLogin')
        cy.intercept('https://apis.wavve.com/cf/themes-related/*').as('getThemesRelated')
        cy.visit(TEST_URL+'/player/movie', {
            qs: {
                movieid: 'MV_CJ01_CA0000011137'
            },
            onBeforeLoad (win) {
                cy.stub(win, 'open').as('windowOpen')
                cy.stub(win, 'alert').as('windowAlert')
            }
        })
    })
    it('영화제목, 평점, 장르, 상영시간, 연령 노출되는지 확인', () => {
        cy.wait('@getMovieContents').then(({ response }) => {
            console.log((response.body.playtime))
            cy.get('.episode-number').contains(response.body.title).should('exist') // 제목
            cy.get('.program-info-box').contains(response.body.rating).should('exist') // 평점
            cy.get('.program-info-box').contains(response.body.genre.list[0].text).should('exist') // 장르
            cy.get('.program-info-box').contains(Math.floor((response.body.playtime)/60)).should('exist') // 상영시간
            if (response.body.targetage !== '0') {
                cy.get('.program-info-box').contains((response.body.targetage + '세')).should('exist') // 연령
            }
        })
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
    it('이용권 미구매 (ppv영화) 개별 구매하기 버튼 노출되는지 확인', () => {
        cy.visit(TEST_URL+'/player/movie', {
            qs: {
                movieid: 'MV_CT01_MBC000012064'
            }
        })
        cy.clickUtilMenuLogin('jihye0121', 'pooq1004!')
        cy.get('[data-test="player-action-button"]').should('contain', '개별 구매하기')
    })
    it('이용권 미구매 (ppv영화) 개별 구매하기 버튼 선택시 구매 팝업 발생하는지 확인', () => {
        cy.intercept('https://apis.wavve.com/fz/movie/contents/*').as('getPpvMovieContent')
        cy.visit(TEST_URL+'/player/movie', {
            qs: {
                movieid: 'MV_CT01_MBC000012064'
            },
            onBeforeLoad (win) {
                cy.stub(win, 'open').as('windowOpen')
            }
        })
        cy.wait('@getPpvMovieContent').then(({ response }) => {
            cy.log(response)
        })
        cy.clickUtilMenuLogin('jihye0121', 'pooq1004!')
        cy.get('[data-test="player-action-button"]').click()
        cy.visit(TEST_URL + '/voucher/popup?channelid=none&contentid=MV_CT01_MBC000012064&contenttype=movie&cpid=EN01&playy=n&programid=MV_CT01_MBC000012064&type=movie')
        cy.get('.product-name.no-description').should('contain', '독전')
    })
    it('액션버튼 > 이용권 미보유 > 시청하기 버튼 노출되는지 확인', () => {
        cy.clickUtilMenuLogin('jihye0667', 'pooqwavve1!')
        cy.get('.user-style').eq(1).click()
        cy.get('[data-test="player-action-button"]').should('contain', '시청하기')
    })
    it('공유 > tiwtter 선택시 윈도우팝업 노출되는지 확인', () => {
        cy.get('[data-test="movie-share"]').click({ force: true })
        cy.get('.pop-common-share').should('exist')
        cy.get('[data-test="twitter"]').click({ force: true })
        cy.window().its('open').should('be.called')
    })
    it('공유 > 페이스북 선택시 윈도우팝업 노출되는지 확인', () => {
        cy.get('[data-test="movie-share"]').click({ force: true })
        cy.get('.pop-common-share').should('exist')
        cy.wait(5000)
        cy.get('[data-test="facebook"]').click({ force: true })
        cy.window().its('open').should('be.called')
    })
    it('공유, 찜하기 버튼 노출되는지 확인', () => {
        cy.get('[data-test="movie-share"]').should('exist')
        cy.get('.check-like.movie').should('exist')
    })
    it('찜하기 버튼 선택시 로그인팝업 노출되는지 확인', async () => {
        await cy.get('[data-test="zzim"]').click({ force: true })
        cy.get('.login-popup').should('exist')
    })
    it('공유 > 링크 복사 선택시 얼럿 노출되는지 확인',  () => {
        cy.get('[data-test="movie-share"]').click({ force: true })
        cy.get('.pop-common-share').should('exist')
        cy.get('[data-test="link-copy"]').click({ force: true })
        cy.window().its('alert').should('be.called')
    })
    it('찜하기 선택시 찜 잘 동작하는지 확인', () => {
        cy.csInfo()
        cy.wait('@getMovieContents').then(async ({ response }) => {
            await cy.get('[data-test="zzim"]').click({ force: true })
            cy.zzim(response.body.zzim)
        })
    })
    it('메타정보 더보기 버튼 선택시 메타정보 노출되는지 확인', () => {
        cy.get('[data-test="movie-view-more"]').click()
        cy.get('[data-test="movie-view-short"]').children().should('contain', '간략히')
    })
    it('더보기 버튼 선택시 원제, 개요, 장르, 감독, 출연, 정보 버튼 노출되는지 확인', () => {
        cy.wait('@getMovieContents').then(({ response }) => {
            cy.log(response.body)
            cy.get('[data-test="movie-view-more"]').click()
            cy.get('.detail-view-content').contains(response.body.country).should('exist') // 개요
            cy.get('[data-test="original-title"]').contains(response.body.origintitle).should('exist') // 원제
            cy.get('[data-test="movie-genre"]').should('have.length', response.body.genre.list.length) // 장르
            cy.get('.detail-view-content').contains(response.body.directors.list[0].text).should('exist') // 감독
            cy.get('[data-test="movie-actors"]').should('have.length', response.body.actors.list.length) // 출연
            cy.get('[data-test="deliveration-info"]').contains(response.body.deliverationinfo).should('exist')
        })
    })
    it('메타 장르 선택시 태그검색 화면으로 검색이 되는지 확인', () => {
        cy.get('[data-test="movie-view-more"]').click()
        cy.wait('@getMovieContents').then(({ response }) => {
            if (response.body.tags.list.length > 0) {
                cy.get('[data-test="movie-genre"]').eq(0).click()
                cy.url().should('contain', '/search/search_tag_group')
            }
        })
    })
    it('메타 감독 선택시 텍스트검색화면 노출되는지 확인', () => {
        cy.get('[data-test="movie-view-more"]').click()
        cy.wait('@getMovieContents').then(({ response }) => {
            if (response.body.directors.list.length > 0) {
                cy.get('[data-test="movie-directors"]').eq(0).click()
                cy.url().should('contain', '/search/search')
            }
        })
    })
    it('메타 출연자 선택시 텍스트 검색화면에 검색이되는지 확인', () => {
        cy.get('[data-test="movie-view-more"]').click()
        cy.wait('@getMovieContents').then(async ({ response }) => {
            if (response.body.actors.list.length > 0) {
                await cy.get('[data-test="movie-actors"]').first().click()
                cy.url().should('contain', '/search/search')
            }
        })
    })
    it('부가영상 페이지에서 본편보기 버튼 노출되는지 확인', () => {
        cy.visit(TEST_URL+'/player/movie', {
            qs: {
                movieid: 'MV_CA01_DY0000011537'
            }
        })
        cy.wait('@getMovieContents').then(({ response }) => {
            cy.get('[data-test="see-original-movie-btn"]').should('exist')
        })
    })
    it('본편보기 버튼 선택시 해당 영화 본편 상세페이지로 이동하는지 확인', () => {
        cy.visit(TEST_URL+'/player/movie', {
            qs: {
                movieid: 'MV_CA01_DY0000011537'
            }
        })
        cy.wait('@getMovieContents').then(({ response }) => {
            cy.get('.icon-box').contains('본편 보기').click()
            cy.url().should('not.contain', 'MV_CZ01_VW000000001')
        })
    })
    it('이벤트가 있을 경우에 노출되는지 확인', () => {
        cy.get('.movie-event').should('exist')
    })
    it('이벤트 영화 배너 선택했을때 이벤트상세페이지로 이동하는지 확인', () => {
        cy.wait('@getMovieEventBanner').then(async ({ response }) => {
            cy.get('[data-test="movie-banner"]').should('length', response.body.list.length)
            await cy.get('[data-test="movie-banner"]').eq(0).click()
            cy.url().should('contain', ('/customer/event_view?eventId=' + response.body.list[0].eventid))
        })
    })
    it('영화 상세화면 멀티섹션 api와 밴드 노출갯수 맞는지 확인', () => {
        cy.wait('@getSuperMultiSection').then(({ response }) => {
            const list = response.body.multisectionlist
            if (list.length > 0) {
                cy.get('[data-test="movie-sectionloader"]').should('length', list.length)
            }
        })
    })
    it('각 멀티밴드 내에 "더보기>" 버튼 선택시 해당 멀티밴드 상세리스트로 이동하는지 확인', () => {
        cy.get('[data-test="view-more"]').eq(0).click()
        cy.url().should('contain', '/list')
    })
    it('각 멀티밴드 리스트 내에 리스트 선택시 해당 상세페이지로 이동되는지 확인', () => {
        cy.get('[data-test="view-more"]').eq(0).click()
        cy.wait('@getThemesRelated')
        cy.get('[data-test="portrait-cell"]').eq(0).click()
        cy.url().should('contain', '/player/movie')
    })
    it('미로그인 > 다운로드 버튼 선택시 로그인팝업 노출되는지 확인', () => {
        cy.get('[data-test="movie-download"]').click({ force: true })
        cy.get('.login-popup').should('exist')
    })
    it('로그인 > 다운로드 버튼 선택시 이용권 구매 팝업 노출되는지 확인', () => {
        cy.clickUtilMenuLogin('jihye0121', 'pooq1004!')
        cy.get('[data-test="movie-download"]').click({ force: true })
        cy.get('[data-test="download-popup"]').contains('다운로드 권한이 없습니다.').should('exist')
    })
    it('로그인 > 다운로드 버튼 선택시 이용권 구매 팝업 > 구매하기 버튼 선택시 해당 영화 구매 팝업 노출되는지 확인', () => {
        cy.clickUtilMenuLogin('jihye0121', 'pooq1004!')
        cy.wait('@getMovieContents').then(({ response }) => {
            cy.get('[data-test="movie-download"]').click({ force: true })
            cy.get('[data-test="download-popup-voucher"]').click()
            cy.window().its('open').should('be.called')
            cy.visit(TEST_URL + '/voucher/popup?channelid=none&contentid='+response.body.movieid+'&contenttype=movie&cpid='+response.body.cpid+'&downloadyn=y&playy=n&programid='+response.body.movieid+'&type=movie')
            cy.get('.ticket-popup-wrap').contains('웨이브 상품 구매').should('exist')
        })
    })
    it('자막/더빙 있는 콘텐츠 자막/더빙 드롭다운 노출되는지 확인', () => {
        cy.visit(TEST_URL+'/player/movie', {
            qs: {
                movieid: 'MV_CG01_NU0000011712'
            }
        })
        cy.get('.player-bottom-utils select').should('exist')
    })
    it('자막 콘텐츠 자막/더빙 드롭다운에서 더빙 선택시 더빙으로 페이지 이동되는지 확인', () => {
        cy.visit(TEST_URL+'/player/movie', {
            qs: {
                movieid: 'MV_CG01_NU0000011712'
            }
        })
        cy.get('.player-bottom-utils select').select('더빙')
        cy.url().should('contain', '/player/movie?movieid=MV_CG01_NU0000011729')
    })
})
context('19 콘텐츠', () => {
    beforeEach(() => {
        cy.homePopupOff()
        cy.csInfo()
        cy.wavveonOff()
        cy.clearCookie('verifiedAdult')
        cy.intercept('https://apis.wavve.com/fz/movie/contents/*').as('getMovieContents')
    })
    it('성인인증 1년 미만인 경우 성인 인트로 노출 되지않고 콘텐츠 노출 확인',() => {
        cy.intercept('https://apis.pooq.co.kr/user?').as('getUser')
        cy.visit(TEST_URL+'/player/movie', {
            qs: { movieid: 'MV_CJ01_CA0000011512' }
        })
        cy.wait('@getMovieContents').then(() => {
            cy.wait('@getUser').then(() => {
                cy.getCookie('verifiedAdult').should('have.property', 'value', '1')
                cy.url().should('not.contain', '/adult')
            })
        })
    })
    it('성인인증 안된 경우 성인인증 팝업 노출되는지 확인', () => {
        cy.intercept('https://apis.pooq.co.kr/user?', (req) => {
            req.reply(notAdultVerifiedUserInfo)
        }).as('getUser')
        cy.visit(TEST_URL+'/player/movie', {
            qs: { movieid: 'MV_CJ01_CA0000011512' }
        })
        cy.url().should('contain', 'adult')
        cy.url().should('not.contain', '/player/movie')
    })
    it('성인 콘텐츠 인트로 > 나가기시 이전페이지로 이동하는지 확인', () => {
        cy.intercept('https://apis.pooq.co.kr/user?', (req) => {
            req.reply(notAdultVerifiedUserInfo)
        }).as('getUser')
        cy.visit(TEST_URL+'/player/movie', {
            qs: { movieid: 'MV_CJ01_CA0000011512' }
        })
        cy.wait('@getMovieContents')
        cy.get('.button-cancel').click()
        cy.url().should('not.contain', '/player/movie?movieid=MV_CJ01_CA0000011512')
        cy.url().should('not.contain', '/adult')

    })
})
