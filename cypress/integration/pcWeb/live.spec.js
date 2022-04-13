import {TEST_URL} from "../../common/constant";
import GN54 from '../../fixtures/gnbMenu/GN54.json'
import zzimChannel from '../../fixtures/gnbMenu/zzimChannel.json'
import likeChannel from '../../fixtures/gnbMenu/likeChannel.json'
import EmptyLikeChannelGN54 from '../../fixtures/gnbMenu/EmptyLikeChannelGN54.json'
context('라이브', () => {
    beforeEach(() => {
        cy.homePopupOff()
        cy.wavveonOff()
        cy.csInfo()
        cy.intercept('https://apis.wavve.com/alarms-contents').as('getAlarmContents')
        cy.intercept('https://apis.wavve.com/live/epgs').as('getLiveEpgs')
        cy.intercept('https://apis.wavve.com/cf/uiservice/zzim-band/channel', (req) => {
            req.reply(zzimChannel)}).as('getZzimChannel')
        cy.intercept('https://apis.wavve.com/zzim/contents', (req) => {
            req.reply(likeChannel)}).as('getLikeChannel')
        cy.visit(TEST_URL + '/live', {
            onBeforeLoad(win) {
                cy.stub(win, 'alert').as('windowAlert')
            }
        })
    })
    it('비로그인일 경우 좋아요한 채널 미노출되는지 확인', () => {
        cy.clearCookie('cs')
        cy.intercept('https://apis.wavve.com/cf/supermultisections/GN54').as('getGN54')
        cy.visit(TEST_URL + '/live')
        cy.wait('@getGN54')
        cy.get('[data-test="section-loader"]').contains('좋아요한 채널').should('not.exist')
    })
    it('로그인/좋아요 한 채널이 없을 경우 미노출되는지 확인', () => {
        cy.intercept('https://apis.wavve.com/cf/supermultisections/GN54', (req) => {
            req.reply(EmptyLikeChannelGN54)
        }).as('getEmptyLikeChannelGN54')
        cy.visit(TEST_URL + '/live')
        cy.wait('@getEmptyLikeChannelGN54')
        cy.get('[data-test="section-loader"]').contains('좋아요한 채널').should('not.exist')
    })
    // 보류 확인필요
    // it('임의의 채널 좋아요시 좋아요 한 채널 영역에 노출되는지 확인', () => {
    //     cy.visit(TEST_URL + '/player/live', {
    //         qs: { channelid: 'F2701'}
    //     })
    //     cy.get('[data-test-is-zzim="zzim_false"]').check({ force: true })
    //     cy.intercept('https://apis.wavve.com/cf/supermultisections/GN54').as('getGN54')
    //     cy.get('[data-test="gnb-live"]').click()
    //     cy.wait('@getGN54').then(({ response }) => {
    //         cy.log(response)
    //     })
    // })
    it('좋아요한 채널 로고 이미지 선택시 해당 채널 상세페이지로 이동 확인', () => {
        cy.get('[data-test="circle-cell"]').eq(0).click({ force: true })
        cy.wait('@getZzimChannel').then(({ response }) => {
            const list = response.body.band.celllist
            const onNavigationIndex = Cypress._.findIndex(list[0].event_list, (item) => item.type === 'on-navigation')
            cy.url().should('contain', list[0].event_list[onNavigationIndex].url.split('?').pop())
        })
    })
    it('좋아요한 채널 zzim', () => {
        cy.get('[data-test="view-more"]').click({ force: true })
        cy.wait('@getLikeChannel').then(({ response }) => {
            cy.get('[data-test="zzim"]').eq(0).click({ force: true })
            cy.window().its('alert').should('be.called')
            cy.zzim(response.body[0].list[0].zzim)
        })
    })
    it('좋아요한 채널 더보기 버튼 선택시 좋아요한 채널 리스트 화면으로 이동', () => {
        cy.intercept('https://apis.wavve.com/cf/supermultisections/GN54', (req) => {
            req.reply(GN54)
        }).as('getGN54')
        cy.visit(TEST_URL + '/live')
        cy.wait('@getGN54').then(({ response }) => {
            const multisectionList = response.body.multisectionlist
            const onViewMoreIndex = Cypress._.findIndex(multisectionList[0].eventlist, (item) => item.type === 'on-viewmore')
            cy.get('[data-test="view-more"]').click({ force: true })
            cy.url().should('contain', multisectionList[0].eventlist[onViewMoreIndex].url.split('/').pop().replace('.html', ''))
        })
    })
    it('로그아웃 상태에서 live 자동 재생 기능 미지원되는지 확인', () => {
        cy.clearCookie('cs')
        cy.visit(TEST_URL + '/live')
        cy.get('.thumb.landscape').eq(0).trigger('mouseenter')
        cy.get('.thumb.landscape').eq(0).should('not.have.class', 'video-mode playing')
    })
    it('로그인 상태에서 live 자동 재생 기능 지원되는지 확인 및 볼륨 꺼진상태 default이고 볼륨 클릭하면 볼륨 켜지는지 확인', () => {
        cy.get('.thumb.landscape').eq(0).trigger('mouseenter', { force: true })
        cy.get('.thumb.landscape').eq(0).should('have.class', 'video-mode playing')
    })
    it('자동 재생중인 채널 마우스 오버 해제시 자동 재생 정지되는지 확인', () => {
        cy.get('.thumb.landscape').eq(0).trigger('mouseenter', { force: true })
        cy.get('.thumb.landscape').eq(0).should('have.class', 'video-mode playing')
        cy.get('.thumb.landscape').eq(0).trigger('mouseleave', { force: true })
        cy.get('.thumb.landscape').eq(0).should('not.have.class', 'video-mode playing')
    })
    it('시청예약 선택시 시청예약 팝업 노출되는지 확인', () => {
        cy.get('[data-test="reservation"]').click({ force: true })
        cy.wait('@getAlarmContents')
        cy.get('.alarm-popup').should('exist')
    })
    it('편성표 선택시 편성표 페이지로 이동되는지 확인', () => {
        cy.get('[data-test="schedule"]').click({ force: true })
        cy.wait('@getLiveEpgs')
        cy.url().should('contain', '/schedule')
    })
    it('장르 임의 변경 시 해당 장르 채널 노출되는지 확인', () => {
        cy.get('[data-test="filter-select"]').select('&genre=11', { force: true })
        cy.url().should('contain', 'genre=11')
    })
    it('채널 임의 선택시 해당 채널 상세페이지로 이동하는지 확인', () => {
        cy.get('.thumb.landscape').eq(0).click()
        cy.url().should('contain', '/player/live')
    })
})
context('live instantPlay', () => {
    beforeEach(() => {
        cy.homePopupOff()
        cy.wavveonOff()
        cy.csInfo()
        cy.intercept('https://apis.wavve.com/cf/live/recommend-channels').as('getRecommendChannel')
    })
    it('로그아웃 > live 자동 재생 기능 미지원되는지 확인', () => {
        cy.clearCookie('cs')
        cy.visit(TEST_URL + '/live')
        cy.get('[data-test="landscape-cell"]').eq(0).trigger('mouseenter')
        cy.get('.thumb.landscape').eq(0).should('not.have.class', 'video-mode playing')
    })
    it('로그인 O > 임의의 채널 마우스 오버시 썸네일 영역 확장되는지 확인', () => {
        cy.visit(TEST_URL + '/live')
        cy.get('.thumb.landscape').eq(0).trigger('mouseenter')
        cy.get('.thumb.landscape').eq(0).should('have.class', 'video-mode playing')
    })
    it('로그인 O > 임의의 채널 마우스 오버시 영상 재생되는지 확인', () => {
        cy.visit(TEST_URL + '/live')
        cy.get('.thumb.landscape').eq(0).trigger('mouseenter')
        cy.get('.btn-volume-off').eq(0).should('exist')
    })
    it('로그인 O > 마우스 오버 해제시 자동 재생 정지 되는지 확인', () => {
        cy.visit(TEST_URL + '/live')
        cy.get('.thumb.landscape').eq(0).trigger('mouseleave')
        cy.get('.thumb.landscape').eq(0).should('not.have.class', 'video-mode playing')
    })
})
context('편성표', () => {
    beforeEach(() => {
        cy.homePopupOff()
        cy.wavveonOff()
        cy.intercept('https://apis.wavve.com/live/epgs').as('getLiveEpgs')
        cy.visit(TEST_URL + '/schedule')
    })
    const today = new Date()
    const hours = today.getHours()
    it('현재 시간 dot', () => {
        cy.get('.tt-time').contains(hours.toString().length === 1 ? ('0' + hours) : hours).should('have.class', 'tt-time-on')
    })
    it('현재 시간 +1, -1 클래스', () => {
        cy.get('.sch-t-time').contains(hours).should('have.class', 'on')
        if (hours === 0) {
            cy.get('.sch-t-time').contains(hours + 1).should('have.class', 'on')
            cy.get('.sch-t-time').contains(hours + 2).should('have.class', 'on')
        } else if (hours === 23) {
            cy.get('.sch-t-time').contains(hours - 1).should('have.class', 'on')
            cy.get('.sch-t-time').contains(hours - 2).should('have.class', 'on')
        } else {
            cy.get('.sch-t-time').contains(hours + 1).should('have.class', 'on')
            cy.get('.sch-t-time').contains(hours - 1).should('have.class', 'on')
        }
    })
    it('스케줄 api', () => {
        cy.wait('@getLiveEpgs').then(({ response }) => {
            if (response.body.list.length > 0) {
                cy.get('.tt-list-wrap').should('length', response.body.list.length)
            }
        })
    })
    it('임의의 날짜 선택시 시간은 바뀌지않고 선택한 날짜 기준으로 채널 리스트 노출되는지 확인', () => {
        cy.get('.sch-today').siblings().eq(2).find('button').click()
        cy.get('.sch-t-time').contains(hours).should('have.class', 'on')
    })
    it('now 버튼 노출되는지 확인', () =>{
        cy.get('.sch-now-btn').should('exist')
    })
    it('다시보기 버튼 선택시 해당 vod 콘텐츠 상세화면으로 이동하는지 확인', () => {
        cy.get('.tt-logo').eq(0).find('a').click()
        cy.url().should('contain', '/player/live')
    })
    // // TODO: 보류
    // it('다시보기', () => {
    //     cy.get('.tt-btn-again').eq(0).click({ force: true })
    //     cy.url().should('contain', '/player/vod')
    // })
    // it('시청하기', () => {
    //     cy.get('.tt-btn-play').eq(0).click({ force: true })
    //     cy.url().should('contain', '/player/vod')
    // })
})
