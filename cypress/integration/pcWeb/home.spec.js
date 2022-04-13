import {TEST_URL} from "../../common/constant";
import bigBanner from '../../fixtures/gnbMenu/bigBanner.json'
import GN51 from '../../fixtures/gnbMenu/GN51.json'
import myViewContentsBand from '../../fixtures/gnbMenu/myViewContentsBand.json'
import hotEpisode from '../../fixtures/gnbMenu/hotEpisode.json'
context('notice popup', () => {
    beforeEach(() => {
        cy.wavveonOff()
        cy.intercept('https://apis.wavve.com/uiservice/banner/multi/layerpopup').as('getLayerPopup')
        cy.visit(TEST_URL)
    })
    it('notice popup 클릭시 popup에 해당하는 url로 이동되는지 확인', () => {
        cy.wait('@getLayerPopup').then(async ({ response }) => {
            await cy.get('.popup-back .swiper-slide-active img').click()
            const popupLink = response.body.top_list[0].bottom_list[0].bottom_link
            cy.url().should('contain', popupLink)
        })
    })
    it('popup x 버튼 선택시 팝업 꺼지는지 확인', () => {
        cy.get('.popup-back .popup-button-close a').click()
        cy.get('[data-test="notice-popup"]').should('not.exist')
        cy.getCookie('close-popup').should('be.null')
    })
    it('일주일 동안 보지 않기 체크 > 닫기 버튼 선택시 쿠키에 값이 들어가는지 확인', () => {
        cy.get('label').contains('일주일 동안 보지 않기').click()
        cy.get('.popup-back .popup-button-close a').click()
        cy.wait(1000)
        cy.getCookie('close-popup').should('have.property', 'value', '1')
    })
})
context('빅 배너, 싱글 배너', () => {
    beforeEach(() => {
        cy.homePopupOff()
        cy.wavveonOff()
        cy.intercept('https://apis.wavve.com/es/uiservice/banner/multi/bigbanner', (req) => {
            req.reply(bigBanner)
        }).as('getBigBanner')
        cy.intercept('https://apis.wavve.com/cf/uiservice/banner/single/homeband').as('getSingleBand')
        cy.intercept('https://apis.wavve.com/cf/movie/contents/*').as('getMovieContents')
        cy.intercept('https://apis.wavve.com/cf/supermultisections/GN51').as('getGN51')
        cy.visit(TEST_URL)
    })
    it('next 버튼 선택시 다음 배너가 화면에 노출되는지 확인', () => {
        cy.get('[data-test="pause"]').click()
        cy.get('[data-test="big-banner-prev"]').click()
        cy.get('[data-test="big-banner-cell"].swiper-slide-active').invoke('attr', 'data-swiper-slide-index').should('contain', '1')
    })
    it('prev 버튼 선택시 이전 배너가 화면에 노출되는지 확인', () => {
        cy.get('[data-test="pause"]').click()
        cy.get('[data-test="big-banner-pagenation"] > span').its('length').then((length) => {
            cy.get('[data-test="big-banner-next"]').click()
            cy.get('[data-test="big-banner-cell"].swiper-slide-active').invoke('attr', 'data-swiper-slide-index').should('contain', length-1)
        })
    })
    it('자동 롤링 컨트롤 버튼 선택시 자동 롤링 중단 되는지 확인', async () => {
        await cy.get('[data-test="pause"]').click()
        cy.get('.main01-nav .ir').should('have.class', 'btn-play')
    })
    it('빅배너 19금 아닌 컨텐츠 선택시 해당 배너 관련페이지로 이동되는지 확인', async () => {
        await cy.get('[data-test="big-banner-cell"]').eq(1).find('a').click({ force: true })
        cy.wait('@getBigBanner').then(({ response }) => {
            const list = response.body.band.celllist
            const onNavigationIndex = Cypress._.findIndex(list[1].event_list, (item) => item.type === 'on-navigation')
            cy.url().should('contain', list[1].event_list[onNavigationIndex].url.split('/')[0])
        })
    })
    it('빅배너 19금 컨텐츠 > 미로그인 > 선택시 로그인화면으로 이동되는지 확인', async () => {
        await cy.get('[data-test="big-banner-cell"]').eq(0).find('a').click({ force: true })
        cy.wait('@getBigBanner')
        cy.url().should('contain', '/member/login')
    })
    it('빅배너 19금 컨텐츠 > 로그인(성인인증 ok)일 경우 해당 컨텐츠로 이동되는지 확인', () => {
        cy.verifiedAdult()
        cy.visit(TEST_URL)
        cy.clickUtilMenuLogin('jihye0121', 'pooq1004!')
        cy.url().should('contain', TEST_URL)
        cy.wait(5000)
        cy.get('[data-test="big-banner-cell"]').eq(0).find('a').click({ force: true })
        cy.wait('@getBigBanner').then(({ response }) => {
            const list = response.body.band.celllist
            const onNavigationIndex = Cypress._.findIndex(list[0].event_list, (item) => item.type === 'on-navigation')
            cy.url().should('contain', list[0].event_list[onNavigationIndex].url.split('/')[0])
        })
    })
    it('싱글배너 선택시 싱글배너 Url으로 이동되는지 확인', () => {
        cy.wait('@getGN51').then((interception) => {
            if (Cypress._.findIndex(interception.response.body.multisection, { cell_type: 'banner_2' }) > -1) {
                cy.wait('@getSingleBand').then(async ({ response }) => {
                    const list = response.body.band.celllist
                    if (list.length > 0) {
                        const onNavigationIndex = Cypress._.findIndex(list[0].event_list, (item) => item.type === 'on-navigation')
                        await cy.get('[data-test="single-banner"]').first().click()
                        cy.url().should('contain', list[0].event_list[onNavigationIndex].url)
                    }
                })
            }
        })
    })
})
context('시청 중 콘텐츠 노출 여부', () => {
    beforeEach(() => {
        cy.homePopupOff()
        cy.wavveonOff()
        cy.intercept('https://apis.wavve.com/cf/supermultisections/GN51', (req) => {
            req.reply(GN51)
        }).as('getGN51')
        cy.intercept('GET', '/login').as('getLogin')

    })
    it('로그인하지 않은 상태에 시청내역 노출 되지 않는지 확인', () => {
        cy.visit(TEST_URL)
        cy.get('[data-test="multisection-title"]').contains('#시청 중 콘텐츠').should('not.exist')
    })
    it('로그인 y, 시청중 콘텐츠 n 일경우 시청 중 콘텐츠 노출 되지 않는지 확인', () => {
        cy.visit(TEST_URL)
        cy.clickUtilMenuLogin('jihye0121', 'pooq1004!')
        cy.wait('@getGN51').then(({ response }) => {
            cy.get('[data-test="multisection-title"]').contains('#시청 중 콘텐츠').should('not.exist')
        })
    })
    it('로그인 y, 시청내역 y 일 경우 시청 중 콘텐츠 노출되는지 확인', () => {
        cy.visit(TEST_URL)
        cy.clickUtilMenuLogin('jihye0667', 'pooqwavve1!')
        cy.get('.user-style').eq(1).click()
        cy.wait('@getGN51').then(({ response }) => {
            cy.get('[data-test="multisection-title"]').contains('#시청 중 콘텐츠').should('exist')
        })
    })
    it('더보기 클릭시 my > 전체 시청내역 > vod 탭으로 이동하는지 확인', () => {
        cy.visit(TEST_URL)
        cy.clickUtilMenuLogin('jihye0667', 'pooqwavve1!')
        cy.get('.user-style').eq(1).click()
        cy.get('[data-test="view-more"]').eq(0).click({ force: true })
        cy.url().should('contain', '/my/use_list_vod_history')
    })
    it('콘텐츠 선택 시 상세화면으로 이동하는지 확인', () => {
        cy.intercept('https://apis.wavve.com/cf/uiservice/myview/contents-band', (req) => {
            req.reply(myViewContentsBand)
        }).as('getMyViewContentsBand')
        cy.visit(TEST_URL)
        cy.clickUtilMenuLogin('jihye0667', 'pooqwavve1!')
        cy.wait('@getLogin')
        cy.get('.user-style').eq(1).click()
        cy.wait('@getMyViewContentsBand').then(({ response }) => {
            const list = response.body.band.celllist
            const onNavigationIndex = Cypress._.findIndex(list[0].event_list, (item) => item.type === 'on-navigation')
            cy.get('[data-test="circle-cell"]').eq(0).click({ force: true })
            console.log(list[0].event_list[onNavigationIndex].url.replace('captvpooq://'))
            cy.url().should('contain', list[0].event_list[onNavigationIndex].url.replace('captvpooq://', ''))
        })
    })
    it('최대 20개 콘텐츠 노출되는지 확인', () => {
        cy.intercept('https://apis.wavve.com/cf/uiservice/myview/contents-band', (req) => {
            req.reply(myViewContentsBand)
        }).as('getMyViewContentsBand')
        cy.visit(TEST_URL)
        cy.clickUtilMenuLogin('jihye0667', 'pooqwavve1!')
        cy.wait('@getLogin')
        cy.get('.user-style').eq(1).click()
        cy.wait('@getMyViewContentsBand').then(({ response }) => {
            const list = response.body.band.celllist
            expect(list.length <= 20).eq(true)
        })
    })
})
context('portrait 밴드', () => {
    beforeEach(() => {
        cy.homePopupOff()
        cy.wavveonOff()
        cy.intercept('https://apis.wavve.com/cf/supermultisections/GN51').as('getHomeMultiSection')
        cy.intercept('https://apis.wavve.com/es/vod/hotepisodes-band', (req) => {
            req.reply(hotEpisode)
        }).as('getHotEpisode')
        cy.visit(TEST_URL)
    })
    it('밴드 더보기 버튼 노출되는지 확인', () => {
        cy.wait('@getHomeMultiSection').then(async ({ response }) => {
            const list = response.body.multisectionlist
            const band10Index = Cypress._.findIndex(list, (band) => band.cell_type === 'band_10')
            if (band10Index > -1) {
                await cy.get('[data-test="section-loader"]').eq(band10Index).find('[data-test="view-more"]').should('exist')
            }
        })
    })
    it('밴드 더보기 선택시 밴드 더보기 url에 맞게 이동하는지 확인', () => {
        cy.wait('@getHomeMultiSection').then(async ({ response }) => {
            const list = response.body.multisectionlist
            const band10Index = Cypress._.findIndex(list, (band) => band.cell_type === 'band_10')
            if (band10Index > -1) {
                const viewMoreIndex = Cypress._.findIndex(list[band10Index].eventlist, (item) => item.type === 'on-viewmore')
                await cy.get('[data-test="section-loader"]').eq(band10Index).find('[data-test="view-more"]').click({ force: true })
                cy.url().should('contain', list[band10Index].eventlist[viewMoreIndex].url.split('/')[0])
            }
        })
    })
    it('prev 버튼에 마우스 in 했을때 마우스포커스 auto로 변경되는지 확인', () => {
        cy.get('[data-test="cell-list"]').eq(0).trigger('mouseenter')
        cy.get('[data-test="cell-list-prev"]').should('have.css', 'cursor', 'auto')
    })
    it('next 버튼에 마우스 in 했을때 마우스포커스 auto로 변경되는지 확인', () => {
        cy.get('[data-test="cell-list"]').eq(0).trigger('mouseenter')
        cy.get('[data-test="cell-list-next"]').should('have.css', 'cursor', 'pointer')
    })
    it('next, prev 버튼 선택시 밴드 노출 prev, next로 변경되는지 확인', () => {
        cy.get('[data-test="cell-list"]').eq(0).trigger('mouseenter')
        cy.get('[data-test="cell-list-next"]').eq(0).click({ force: true })
        cy.get('[data-test="cell"].swiper-slide-active').invoke('attr', 'data-index').should('contain', '5')
        cy.get('[data-test="cell-list"]').eq(0).trigger('mouseenter')
        cy.get('[data-test="cell-list-prev"]').eq(0).click({ force: true })
        cy.get('[data-test="cell"].swiper-slide-active').invoke('attr', 'data-index').should('contain', '0')
    })
    it('cell 선택시 해당 셀에 맞는 상세페이지로 이동하는지 확인', () => {
        cy.wait('@getHomeMultiSection').then(({ response }) => {
            const list = response.body.multisectionlist
            const band10Index = Cypress._.findIndex(list, (band) => band.cell_type === 'band_10')
            const multiSectionId = '#multisection_index_' + band10Index
            cy.get(multiSectionId).scrollIntoView()
            cy.get('[data-test="portrait-cell"]').eq(0).click({ force: true})
            cy.url().should('contain', '/player')
        })
    })
    it('quick vod tag 표시되는지 확인', () => {
        cy.wait('@getHomeMultiSection').then(async ({ response }) => {
            const list = response.body.multisectionlist
            const band10Index = Cypress._.findIndex(list, (band) => band.title === '지금 핫한 프로그램') || Cypress._.findIndex(list, (band) => band.cell_type === 'band_10')
            if (band10Index > -1) {
                cy.get('[data-test="section-loader"]').eq(band10Index)
                    .find('[data-test="portrait-cell"]').eq(0).find('[data-test="top-tag"] > span').should('have.class', 'tag-quick-vod')
            }
        })
    })
    it('최대 20개 노출되는지 확인', () => {
        cy.wait('@getHomeMultiSection').then(async ({ response }) => {
            const list = response.body.multisectionlist
            const band10Index = Cypress._.findIndex(list, (band) => band.title === '지금 핫한 프로그램') || Cypress._.findIndex(list, (band) => band.cell_type === 'band_10')
            if (band10Index > -1) {
                cy.log(list[band10Index])
                cy.get('[data-test="section-loader"]').eq(band10Index).find('[data-test="portrait-cell"]').should('have.length', 20)
            }
        })
    })
})
context('landscape band (band_2)', () => {
    beforeEach(() => {
        cy.homePopupOff()
        cy.wavveonOff()
        cy.intercept('https://apis.wavve.com/cf/supermultisections/GN51').as('getHomeMultiSection')
        cy.visit(TEST_URL)
    })
    it('밴드 더보기 노출되는지 확인', () => {
        cy.wait('@getHomeMultiSection').then(async ({ response }) => {
            cy.log(response)
            const list = response.body.multisectionlist
            const band2Index = Cypress._.findIndex(list, (band) => band.cell_type === 'band_2')
            cy.log(band2Index)
            if (band2Index > -1) {
                await cy.get('[data-test="section-loader"]').eq(band2Index).find('[data-test="view-more"]').should('exist')
            }
        })
    })
    it('밴드 더보기 선택시 밴드 더보기 url에 맞게 이동하는지 확인', () => {
        cy.wait('@getHomeMultiSection').then(async ({ response }) => {
            const list = response.body.multisectionlist
            const band2Index = Cypress._.findIndex(list, (band) => band.cell_type === 'band_2')
            if (band2Index > -1) {
                const viewMoreIndex = Cypress._.findIndex(list[band2Index].eventlist, (item) => item.type === 'on-viewmore')
                await cy.get('[data-test="section-loader"]').eq(band2Index).find('[data-test="view-more"]').click({ force: true })
                cy.url().should('contain', list[band2Index].eventlist[viewMoreIndex].url.split('/')[0])
            }
        })
    })
    it('cell 선택시 해당 셀에 맞는 상세페이지로 이동하는지 확인', () => {
        cy.wait('@getHomeMultiSection').then(async ({ response }) => {
            const list = response.body.multisectionlist
            const band2Index = Cypress._.findIndex(list, (band) => band.cell_type === 'band_2')
            if (band2Index > -1) {
                cy.get('[data-test="section-loader"]').eq(band2Index).scrollIntoView()
                cy.get('[data-test="landscape-cell"]').eq(0).click()
                cy.url().should('contain', '/player')
            }
        })
    })
})
context('wavve 추천 밴드', () => {
    beforeEach(() => {
        cy.homePopupOff()
        cy.wavveonOff()
        cy.intercept('https://apis.wavve.com/es/instantplay/contents-band').as('getInstantPlayBand')
        cy.intercept('https://apis.wavve.com/cf/supermultisections/GN51').as('getGN51')
    })
    it('더보기 버튼 미노출 되는지 확인', () => {
        cy.visit(TEST_URL)
        cy.wait('@getGN51').then((interception) => {
            if (Cypress._.findIndex(interception.response.body.multisection, { cell_type: 'band_82' }) > -1) {
                cy.get('.autoplay-band').scrollIntoView()
                cy.get('.autoplay-band').contains('더보기').should('not.exist')
            }
        })
    })
    it('wavve 추천 cell 선택시 해당 콘텐츠 화면으로 이동하는지 확인', () => {
        cy.visit(TEST_URL)
        cy.wait('@getGN51').then((interception) => {
            if (Cypress._.findIndex(interception.response.body.multisection, { cell_type: 'band_82' }) > -1) {
                cy.get('.autoplay-band').scrollIntoView()
                cy.wait('@getInstantPlayBand').then(({ response }) => {
                    const onNavigationIndex = Cypress._.findIndex(response.body.band.celllist[0].event_list, (item) => item.type === 'on-navigation')
                    cy.get('[data-test="preview-cell"]').eq(0).click()
                    cy.url().should('contain', response.body.band.celllist[0].event_list[onNavigationIndex].url.split('?').pop())
                })
            }
        })
    })
    it('미로그인 상태로 찜 선택할 경우 로그인팝업 노출되는지 확인', () => {
        cy.visit(TEST_URL)
        cy.wait('@getGN51').then((interception) => {
            if (Cypress._.findIndex(interception.response.body.multisection, { cell_type: 'band_82' }) > -1) {
                cy.get('.autoplay-band').scrollIntoView()
                cy.get('[data-test="zzim"]').first().click({force: true})
                cy.get('.login-popup').should('exist')
            }
        })
    })
    it('로그인상태에서 zzim 버튼 선택할 경우 zzim 잘되는지 확인', () => {
        cy.csInfo()
        cy.visit(TEST_URL)
        cy.wait('@getGN51').then((interception) => {
            if (Cypress._.findIndex(interception.response.body.multisection, { cell_type: 'band_82' }) > -1) {
                cy.get('.autoplay-band').scrollIntoView()
                cy.wait('@getInstantPlayBand').then(({ response }) => {
                    cy.get('[data-test="zzim"]').eq(0).click({force: true})
                    if (response.body.band.celllist[0].iszzim === 'y') {
                        cy.get('[data-test="zzim"]').first().invoke('attr', 'data-test-is-zzim').should('contain', 'zzim_false')
                    } else {
                        cy.get('[data-test="zzim"]').first().invoke('attr', 'data-test-is-zzim').should('contain', 'zzim_true')
                    }
                })
            }
        })
    })
    it('밴드 mouseEnter일 경우 영상 자동 재생되는지 확인', () => {
        cy.visit(TEST_URL)
        cy.wait('@getGN51').then((interception) => {
            if (Cypress._.findIndex(interception.response.body.multisection, { cell_type: 'band_82' }) > -1) {
                cy.get('.autoplay-band').scrollIntoView()
                cy.get('.thumb.autoplay-cell').eq(0).trigger('mouseenter', { force: true })
                cy.get('.thumb.autoplay-cell').eq(0).should('have.class', 'video-mode playing')
            }
        })
    })
    it('밴드 mouseLeave일 경우 영상 재생안되는지 확인', () => {
        cy.visit(TEST_URL)
        cy.wait('@getGN51').then((interception) => {
            if (Cypress._.findIndex(interception.response.body.multisection, { cell_type: 'band_82' }) > -1) {
                cy.get('.autoplay-band').scrollIntoView()
                cy.get('.thumb.autoplay-cell').eq(0).trigger('mouseleave', { force: true })
                cy.get('.thumb.autoplay-cell').eq(0).should('not.have.class', 'video-mode playing')
            }
        })
    })
    it('디폴트로 음소거모 재생되는지 확인', () => {
        cy.visit(TEST_URL)
        cy.wait('@getGN51').then((interception) => {
            if (Cypress._.findIndex(interception.response.body.multisection, { cell_type: 'band_82' }) > -1) {
                cy.get('.autoplay-band').scrollIntoView()
                cy.get('.thumb.autoplay-cell').eq(0).trigger('mouseenter', { force: true })
                cy.get('.btn-volume-off').should('exist')
            }
        })
    })
    it('콘텐츠 선택시 상세화면으로 이동하는지 확인', () => {
        cy.visit(TEST_URL)
        cy.wait('@getGN51').then((interception) => {
            if (Cypress._.findIndex(interception.response.body.multisection, { cell_type: 'band_82' }) > -1) {
                cy.get('[data-test="preview-cell"]').eq(0).click()
                cy.url().should('contain', '/player')
            }
        })
    })
})
context('top 버튼 확인', () => {
    before(() => {
        cy.homePopupOff()
        cy.wavveonOff()
    })
    it('top 버튼 클릭시 상단으로 이동되는지 확인', () => {
        cy.visit(TEST_URL).then(async () => {
            await cy.scrollTo('bottom')
            cy.get('.btn-top button').click({ force: true })
            cy.get('#main-banner').should('be.visible')
        })
    })
})
