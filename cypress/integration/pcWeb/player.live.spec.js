import {TEST_URL} from "../../common/constant";
import likeChannel from '../../fixtures/gnbMenu/likeChannel.json'

context('메타', () => {
    beforeEach(() => {
        cy.homePopupOff()
        cy.wavveonOff()
        cy.intercept('https://apis.wavve.com/live/channels/*').as('getLiveChannelInfo')
        cy.intercept('https://apis.wavve.com/vod/programs-contentid/*').as('getContentId')
        cy.intercept('https://apis.wavve.com/live/epgs/channels/K01').as('getChannelEpgs')
        cy.intercept('https://apis.wavve.com/getpermissionforcontent').as('getPermissionForContent')
        cy.visit(TEST_URL+'/player/live', {
            qs: {
                channelid: 'K01'
            },
            onBeforeLoad (win) {
                cy.stub(win, 'open').as('windowOpen')
                cy.stub(win, 'alert').as ('windowAlert')
            }
        })
    })
    it('전체 편성표 선택시 새탭 오픈 확인', async () => {
        await cy.get('[data-test="all-schedule"]').click()
        cy.window().its('open').should('be.called')
    })
    it('vod 보기 버튼 여부 확인', () => {
        cy.wait('@getLiveChannelInfo').then((interception) => {
            if (interception.response.body.programid !== '') {
                cy.wait('@getContentId').then((innerInterception) => {
                    if (innerInterception.response.body.resultcode !== '550' && innerInterception.response.body.contentid !== '') {
                        cy.get('[data-test="vod-view"]').should('exist')
                    } else {
                        cy.get('[data-test="vod-view"]').should('not.exist')
                    }
                })
            } else {
                cy.get('[data-test="vod-view"]').should('not.exist')
            }
        })
    })
    // //TODO: 함수문제로 보류
    // it('채널 편성표', () => {
    //     cy.wait('@getChannelEpgs').then((interception) => {
    //         const list = interception.response.body.list
    //         if (list.length > 0) {
    //             cy.get('[data-test="time-item"]').should('length', list.length)
    //             cy.get('.live-schedule-button-gray').eq(0).find('a').should('exist').click()
    //         }
    //     })
    // })
    it('공유 > twitter 선택 창열리는지 확인', () => {
        cy.get('[data-test="live-share"]').click({ force: true })
        cy.get('.pop-common-share').should('exist')
        cy.get('[data-test="twitter"]').click({ force: true })
        cy.window().its('open').should('be.called')
    })
    it('공유 > 페이스북 선택 창열리는지 확인', () => {
        cy.get('[data-test="live-share"]').click({ force: true })
        cy.get('.pop-common-share').should('exist')
        cy.wait(5000)
        cy.get('[data-test="facebook"]').click({ force: true })
        cy.window().its('open').should('be.called')
    })
    it('공유 > 링크 복사시 얼럿 발생하는지 확인', () => {
        cy.get('[data-test="live-share"]').click({ force: true })
        cy.get('.pop-common-share').should('exist')
        cy.get('[data-test="link-copy"]').click({ force: true })
        cy.window().its('alert').should('be.called')
    })
    it('미로그인 > action버튼 로그인(무료시청) 버튼 노출되는지 확인', () => {
        cy.get('[data-test="player-action-button"]').should('include.text', '로그인(무료시청)')
    })
    it('미로그인 > 로그인(무료시청) 버튼 선택시 로그인창 노출되는지 확인', () => {
        cy.get('[data-test="player-action-button"]').click()
        cy.get('.login-popup').should('exist')
    })
    it('미로그인 > 유료LIVE > action button 로그인 노출되는지 확인', () => {
        cy.visit(TEST_URL+'/player/live', {
            qs: {
                channelid: 'H02'
            }
        })
        cy.get('[data-test="player-action-button"]').should('include.text', '로그인')
    })
    it('미로그인 > 로그인 버튼 선택시 로그인창 노출되는지 확인', () => {
        cy.visit(TEST_URL+'/player/live', {
            qs: {
                channelid: 'H02'
            }
        })
        cy.get('[data-test="player-action-button"]').click()
        cy.get('.login-popup').should('exist')
    })
    it('이용권 미구매 > 유료live > 이용권 구매하기 버튼 노출되는지 확인', () => {
        cy.csInfo()
        cy.visit(TEST_URL+'/player/live', {
            qs: {
                channelid: 'H02'
            }
        })
        cy.get('[data-test="player-action-button"]').should('include.text', '이용권 구매하기')
    })
    it('이용권 미구매 > 유료live > 이용권 구매하기 버튼 선택시 팝업 발생하는지 확인', () => {
        cy.csInfo()
        cy.visit(TEST_URL+'/player/live', {
            qs: {
                channelid: 'H02'
            },
            onBeforeLoad (win) {
                cy.stub(win, 'open').as('windowOpen')
            }
        })
        cy.get('[data-test="player-action-button"]').click()
        cy.window().its('open').should('be.called')
    })
    it('시청하기 버튼 노출되는지 확인', () => {
        cy.csInfo()
        cy.visit(TEST_URL+'/player/live', {
            qs: {
                channelid: 'K01'
            }
        })
        cy.get('[data-test="player-action-button"]').should('include.text', '시청하기')
    })
    it('로그인 > action button click시 로그인팝업 노출안되는지 확인', () => {
        cy.csInfo()
        cy.wait('@getPermissionForContent').then(({ response }) => {
            cy.get('[data-test="player-action-button"]').should('include.text', response.body.display)
        })
        cy.get('.login-popup').should('not.exist')
    })
    it('미로그인 > 찜하기 선택시 로그인팝업 노출되는지 확인', () => {
        cy.get('[data-test="zzim"]').click({ force: true })
        cy.get('.login-popup').should('exist')
    })
    it('로그인 > 찜하기선택시 찜 동작 되는지 확인', () => {
        cy.csInfo()
        cy.wait('@getLiveChannelInfo').then(async ({ response }) => {
            await cy.get('[data-test="zzim"]').click({ force: true })
            cy.zzim(response.body.zzim)
        })
    })
})
context('전체채널', () => {
    beforeEach(() => {
        cy.homePopupOff()
        cy.wavveonOff()
        cy.intercept('https://apis.wavve.com/vod/programs-contentid/*').as('getContentId')
        cy.intercept('https://apis.wavve.com/live/epgs/channels/K01').as('getChannelEpgs')
        cy.intercept('https://apis.wavve.com/cf/vod/relatedcontents-band').as('getRelatedContents')
        cy.intercept('https://apis.wavve.com/getpermissionforcontent').as('getPermissionForContent')
        cy.intercept('https://apis.wavve.com/cf/live/recommend-channels').as('getAllChannel')
        cy.visit(TEST_URL+'/player/live', {
            qs: {
                channelid: 'K01'
            },
            onBeforeLoad (win) {
                cy.stub(win, 'open').as('windowOpen')
                cy.stub(win, 'alert').as ('windowAlert')
            }
        })
    })
    it('default 탭 전체 채널인지 확인', () => {
        cy.get('.player-nav').contains('전체 채널').should('have.class', 'on')
    })
    it('새로고침 버튼 선택시 전체 채널 영역 정보 갱신하는지 확인', () => {
        cy.wait('@getAllChannel').then(({ request }) => {
            cy.get('.reload').click()
            cy.wait('@getAllChannel').then((interception) => {
                expect(request.url).not.eq(interception.request.url)
            })
        })
    })
    it('전체 장르 필터 노출되는지 확인', () => {
        cy.wait('@getAllChannel').then(({ response }) => {
            const filterList = response.body.filter.filterlist[0].filter_item_list
            cy.log(filterList)
            cy.get('[data-test="filter-select"]').find('option').should('have.length', filterList.length)
        })
    })
    it('임의 필터 선택시 선택한 필터 채널 리스트 노출되는지 확인', () => {
        cy.get('[data-test="filter-select"]').select('&genre=11', { force: true })
        cy.url().should('contain', 'genre=11')
    })
    it('전체 채널 현재 재생중 채널 표시 확인', () => {
        cy.wait('@getAllChannel').then((interception) =>{
            const list = interception.response.body.cell_toplist.celllist
            if (list.length > 0) {
                const playNowIndex = list.findIndex((item, index) => item.event_list[3].url.split('=').pop() === 'K01')
                cy.get('.thumb.landscape').eq(playNowIndex).should('have.class', 'playnow')
            }
        })
    })
    it('임의의 채널 선택시 해당 상세페이지로 이동하는지 확인', async () => {
        await cy.get('[data-test="landscape-cell"]').eq(3).click()
        cy.url().should('not.contain', 'K01')
    })
})
context('추천', () => {
    beforeEach(() => {
        cy.csInfo()
        cy.homePopupOff()
        cy.wavveonOff()
        cy.intercept('https://apis.wavve.com/cf/supermultisections/DY1').as('getRecommendMultiSection')
        cy.visit(TEST_URL+'/player/live', {
            qs: {
                channelid: 'K01'
            }
        })
    })
    it('추천탭 메뉴 선택시 추천 리스트 노출되는지 확인', () => {
        cy.get('.player-nav').contains('추천').click()
        cy.wait('@getRecommendMultiSection').then(({ response }) => {
            cy.get('[data-multisection="true"]').should('length', response.body.multisectionlist.length)
        })
    })
    it('좋아요한 채널 더보기 선택시 좋아요한 채널로 이동하는지 확인', () => {
        cy.get('.player-nav').contains('추천').click()
        cy.get('[data-test="view-more"]').click({ force: true })
        cy.url().should('contain', '/my/like_channel')
    })
    it('좋아요한 채널 임의 선택시 해당 채널로 이동하는지 확인', () => {
        cy.get('.player-nav').contains('추천').click()
        cy.get('[data-test="circle-cell"]').eq(1).click()
        cy.url().should('not.contain', 'K01')
    })
    it('각 멀티밴드 리스트 내에 콘텐츠 선택시 해당 상세페이지로 이동되는지 확인', () => {
        cy.get('.player-nav').contains('추천').click()
        cy.wait('@getRecommendMultiSection').then(({ response }) => {
            const multiSectionList = response.body.multisectionlist
            cy.intercept(multiSectionList[1].eventlist[1].url).as('getMultiSection')
            cy.get('.footer').scrollIntoView()
            cy.wait('@getMultiSection').then(async ({response}) => {
                await cy.get('[data-multisection="true"]').eq(1).find('[data-test="cell"]').eq(0).click()
                cy.log(response.body.band.celllist)
                cy.url().should('contain', (response.body.band.celllist[0].event_list[1].url).replace('.html', ''))
            })
        })
    })
})
