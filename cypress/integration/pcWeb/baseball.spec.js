import {TEST_URL} from "../../common/constant";
import teamMonthlyCalendarList from '../../fixtures/baseball/teamMonthlyCalendarList.json'
import teamMonthlyCalendarListBandEmpty from '../../fixtures/baseball/teamMonthlyCalendarListBandEmpty.json'
import teamMonthlyCalendarListBand from '../../fixtures/baseball/teamMonthlyCalendarListBand.json'
import highlightScene from '../../fixtures/baseball/highlightScene.json'
import highlightSceneEmpty from '../../fixtures/baseball/highlightSceneEmpty.json'
context('프로야구 홈', () => {
    beforeEach(() => {
        cy.wavveonOff()
        cy.homePopupOff()
        cy.intercept('https://apis.wavve.com/cf/supermultisections/GN9').as('getMultiscetion')
        cy.intercept('https://apis.wavve.com/dp/vod/scene-band').as('getHighlightBand')
    })
    it('멀티섹션 api length만큼 밴드 노출 확인', () => {
        cy.visit(TEST_URL + '/baseball')
        cy.wait('@getMultiscetion').then(({ response }) => {
            cy.get('[data-test="section-loader"]').should('length', response.body.multisectionlist.length)
        })
    })
    it('금일 날짜의 경기 일정 노출 여부(경기없을경우 empty 문구 노출) 확인', () => {
        cy.intercept('https://annexapi.wavve.com/skb/baseball/teamcalendarlist-band', (req) => {
            req.reply(teamMonthlyCalendarListBandEmpty)
        }).as('getScheduleBand')
        cy.visit(TEST_URL + '/baseball')
        let date = new Date()
        const year = date.getFullYear()
        let month = (1 + date.getMonth())
        month = month >= 10 ? month : '0' + month
        let day = date.getDate()
        day = day >= 10 ? day : '0' + day
        const today = year + '-' + month + '-' + day
        cy.wait('@getScheduleBand').then(({ response }) => {
            if (response.body.band.game_count === 0) {
                cy.get('.baseball-no-data').should('exist')
                cy.get('.baseball-no-data > a').click()
            }
        })
    })
    it('일정 결과  [더보기] 선택시 일정/결과 상세화면으로 이동되는지 확인', () =>{
        cy.visit(TEST_URL + '/baseball')
        cy.get('.baseball-landscape-cell').find('.btn-more').click({ force: true })
        cy.url().should('contain', '/baseball/schedule')
    })
    it('임의 하이라이트 선택시 해당 하이라이트 상세화면으로 이동되는지 확인', () => {
        cy.visit(TEST_URL + '/baseball')
        cy.get('[data-test="landscape-cell"]').eq(0).click()
        cy.url().should('contain', '/player/baseball/highlight')
    })
    it('더보기 선택시 하이라이트 상세화면으로 이동되는지 확인', () => {
        cy.visit(TEST_URL + '/baseball')
        cy.get('.landscape-cell').find('[data-test="view-more"]').click({ force: true })
        cy.url().should('contain', '/baseball/highlight/')
    })
})
context('일정/결과 밴드', () => {
    beforeEach(() => {
        cy.wavveonOff()
        cy.csInfo()
        cy.homePopupOff()
        cy.intercept('https://annexapi.wavve.com/skb/baseball/teamcalendarlist-band', (req) => {
            req.reply(teamMonthlyCalendarListBand)
        }).as('teamCalendarListBand')
    })
    it ('경기전 예약불가시 얼럿 노출 확인', () => {
        cy.visit(TEST_URL + '/baseball/schedule', {
            onBeforeLoad(win) {
                cy.stub(win, 'alert').as('windowAlert')
                cy.stub(win, 'confirm').as('windowConfirm')
            }
        })
        cy.wait('@teamCalendarListBand').then(({ response }) => {
            cy.teamCalendarListBand({list: response.body.band.celllist, index: 0})
        })
    })
    it('예약 확인 팝업에서 확인 선택시 얼럿 노출하는지 확인', () => {
        cy.visit(TEST_URL + '/baseball/schedule', {
            onBeforeLoad(win) {
                cy.stub(win, 'alert').as('windowAlert')
            }
        })
        cy.wait('@teamCalendarListBand').then(({ response }) => {
            cy.get('[data-test="baseball-landscape-cell"]').eq(1).click()
            cy.on('window:confirm', () => true)
            cy.window().its('alert').should('be.called')
        })
    })
    it('예약 확인 팝업에서 취소 선택시 팝업 종료되는지 확인', () => {
        cy.visit(TEST_URL + '/baseball/schedule', {
            onBeforeLoad(win) {
                cy.stub(win, 'alert').as('windowAlert')
            }
        })
        cy.wait('@teamCalendarListBand').then(({ response }) => {
            cy.get('[data-test="baseball-landscape-cell"]').eq(1).click()
            cy.on('window:confirm', () => false)
            cy.window().its('alert').should('not.be.called')
        })
    })
    it ('예약 가능한 경기 confirm 창 노출 확인', () => {
        cy.visit(TEST_URL + '/baseball/schedule', {
            onBeforeLoad(win) {
                cy.stub(win, 'alert').as('windowAlert')
                cy.stub(win, 'confirm').as('windowConfirm')
            }
        })
        cy.wait('@teamCalendarListBand').then(({ response }) => {
            cy.teamCalendarListBand({list: response.body.band.celllist, index: 1})
        })
    })
    it('예약 취소 팝업에서 확 선택시 팝업 종료되는지 확인', () => {
        cy.visit(TEST_URL + '/baseball/schedule', {
            onBeforeLoad(win) {
                cy.stub(win, 'alert').as('windowAlert')
            }
        })
        cy.wait('@teamCalendarListBand').then(({ response }) => {
            cy.get('[data-test="baseball-landscape-cell"]').eq(8).click()
            cy.on('window:confirm', () => true)
            cy.window().its('alert').should('be.called')
        })
    })
    it('예약 취소 팝업에서 취소 선택시 팝업 종료되는지 확인', () => {
        cy.visit(TEST_URL + '/baseball/schedule', {
            onBeforeLoad(win) {
                cy.stub(win, 'alert').as('windowAlert')
            }
        })
        cy.wait('@teamCalendarListBand').then(({ response }) => {
            cy.get('[data-test="baseball-landscape-cell"]').eq(8).click()
            cy.on('window:confirm', () => false)
            cy.window().its('alert').should('not.be.called')
        })
    })
    it ('경기종료, 결과페이지 있을 경우 경기결과페이지로 이동', () => {
        cy.visit(TEST_URL + '/baseball/schedule', {
            onBeforeLoad(win) {
                cy.stub(win, 'alert').as('windowAlert')
                cy.stub(win, 'confirm').as('windowConfirm')
            }
        })
        cy.wait('@teamCalendarListBand').then(({ response }) => {
            cy.teamCalendarListBand({list: response.body.band.celllist, index: 2})
        })
    })
    it ('경기종료, 결과페이지 없을 경우 얼럿창 노출 확인', () => {
        cy.visit(TEST_URL + '/baseball/schedule', {
            onBeforeLoad(win) {
                cy.stub(win, 'alert').as('windowAlert')
                cy.stub(win, 'confirm').as('windowConfirm')
            }
        })
        cy.wait('@teamCalendarListBand').then(({ response }) => {
            cy.teamCalendarListBand({list: response.body.band.celllist, index: 3})
        })
    })
    it ('경기 취소시 얼럿창 노출 확인', () => {
        cy.visit(TEST_URL + '/baseball/schedule', {
            onBeforeLoad(win) {
                cy.stub(win, 'alert').as('windowAlert')
                cy.stub(win, 'confirm').as('windowConfirm')
            }
        })
        cy.wait('@teamCalendarListBand').then(({ response }) => {
            cy.teamCalendarListBand({list: response.body.band.celllist, index: 4})
        })
    })

    it ('경기 중단시 얼럿창 노출 확인', () => {
        cy.visit(TEST_URL + '/baseball/schedule', {
            onBeforeLoad(win) {
                cy.stub(win, 'alert').as('windowAlert')
                cy.stub(win, 'confirm').as('windowConfirm')
            }
        })
        cy.wait('@teamCalendarListBand').then(({ response }) => {
            cy.teamCalendarListBand({list: response.body.band.celllist, index: 5})
        })
    })
    it ('경기중 경기 페이지 생성 전 얼럿창 노출 확인', () => {
        cy.visit(TEST_URL + '/baseball/schedule', {
            onBeforeLoad(win) {
                cy.stub(win, 'alert').as('windowAlert')
                cy.stub(win, 'confirm').as('windowConfirm')
            }
        })
        cy.wait('@teamCalendarListBand').then(({ response }) => {
            cy.teamCalendarListBand({list: response.body.band.celllist, index: 6})
        })
    })
    it ('경기중 페이지 생정 플레이어 화면 이동 확인 ', () => {
        cy.visit(TEST_URL + '/baseball/schedule', {
            onBeforeLoad(win) {
                cy.stub(win, 'alert').as('windowAlert')
                cy.stub(win, 'confirm').as('windowConfirm')
            }
        })
        cy.wait('@teamCalendarListBand').then(({ response }) => {
            cy.teamCalendarListBand({list: response.body.band.celllist, index: 7})
        })
    })
})
context('프로야구 일정/결과 상세페이지', () => {
    beforeEach(() => {
        cy.wavveonOff()
        cy.homePopupOff()
        cy.intercept('POST', 'https://apis.wavve.com/dp/baseball/alarms?').as('postAlarms')
    })
    let date = new Date()
    let year = date.getFullYear()
    let month = date.getMonth() + 1
    let day = date.getDate()
    it('일정 있을 경우 경기 리스트 노출되는지 확인', () => {
        cy.intercept('https://annexapi.wavve.com/skb/baseball/teamcalendarlist-band', (req) => {
            req.reply(teamMonthlyCalendarListBand)
        })
        cy.visit(TEST_URL + '/baseball/schedule')
        cy.get('.baseball-landscape-cell').should('exist')
    })
    it('일정 없을 경우 "선택한 일자는 경기가 없어요." 문구 노출되는지 확인', () => {
        cy.intercept('https://annexapi.wavve.com/skb/baseball/teamcalendarlist-band', (req) => {
            req.reply(teamMonthlyCalendarListBandEmpty)
        })
        cy.visit(TEST_URL + '/baseball/schedule')
        cy.get('.baseball-no-data').should('exist')
    })
    it('일정 없을 경우 "다음 경기 일정 보기" 버튼 선택시 다음 일정밴드 노출되는지 확인', () => {
        let interceptCount = 0
        cy.intercept('https://annexapi.wavve.com/skb/baseball/teamcalendarlist-band', (req) => {
            if (interceptCount === 0) {
                interceptCount += 1
                req.reply(teamMonthlyCalendarListBandEmpty)
            } else if (interceptCount === 1) {
                req.reply(teamMonthlyCalendarListBand)
            }
        }).as('getScheduleBand')
        cy.intercept('https://annexapi.wavve.com/skb/baseball/teamlatelygamedate').as('getGameDate')
        cy.visit(TEST_URL + '/baseball/schedule', {
            onBeforeLoad(win) {
                cy.stub(win, 'alert').as('windowAlert')
            }
        })
        cy.wait('@getScheduleBand').then((interception) => {
            if (interception.response.body.band.game_count === 0) {
                cy.get('.baseball-no-data').contains('다음 경기 일정 보기').click()
                cy.wait('@getGameDate').then(({ response }) => {
                    cy.log(response)
                    if (response.body.is_null === true) {
                        cy.window().its('alert').should('be.called')
                    } else {
                        cy.wait('@getScheduleBand').then(({response}) => {
                            cy.get('[data-test="baseball-landscape-cell"]').should('length', response.body.band.celllist.length)
                        })
                    }
                })

            }
        })
    })
    it('상단 날짜 next 버큰 클릭 > +1개월 간격으로 이동하는지 확인', () => {
        cy.visit(TEST_URL + '/baseball/schedule')
        cy.get('[data-test="next-month-btn"]').click({ force: true })
        cy.get('[data-test="month"]').should('contain', month === 12 ? 1 : (month + 1))
        cy.get('[data-test="year"]').should('contain', month === 12 ? (year + 1) : year)
    })
    it('상단 날짜 prev 버튼 클릭 > -1개월 간격으로 이동하는지 확인', () => {
        cy.visit(TEST_URL + '/baseball/schedule')
        cy.get('[data-test="prev-month-btn"]').click({ force: true })
        cy.get('[data-test="month"]').should('contain', month === 1 ? 12 : (month - 1))
        cy.get('[data-test="year"]').should('contain', month === 1 ? (year - 1) : year)
    })
    it('날짜 이동시 default로 해당 날짜의 1일자로 선택되어 노출되는지 확인', () => {
        cy.visit(TEST_URL + '/baseball/schedule')
        cy.get('[data-test="next-month-btn"]').click({ force: true })
        cy.get('[data-test="date-slider"] .swiper-slide-active').find('.date-month').should('contain.text', (month === 12 ? 1 : (month + 1) + '/1'))
    })
    it('오늘 버튼 선택시 오늘 날짜 경기로 화면 노출되는지 확인', () => {
        cy.visit(TEST_URL + '/baseball/schedule')
        let today = new Date()
        cy.get('.schedule-cell-inner').find('.swiper-slide-next').click({ force: true })
        cy.get('.button-kbo-filled').click()
        cy.get('.schedule-cell-inner').find('.swiper-slide-active').find('.date-month').should('include.text' , ((today.getMonth()+1) + '/' + today.getDate()))
    })
    // // TODO: 포워딩때문에 클릭해도 잘 선택 안됨 포워딩안할때 따로 테스트 필요
    // it('임의의 날짜 선택시 선택한 날짜 리스트 노출되는지 확인', () => {
    //     cy.intercept('https://annexapi.wavve.com/skb/baseball/teamcalendarlist-band').as('getTeamCalendarListBand')
    //     cy.visit(TEST_URL + '/baseball/schedule')
    //     cy.wait('@getTeamCalendarListBand').then(() => {
    //         if (day === 1) {
    //             cy.get('.schedule-cell-inner .swiper-slide-next').find('a').click()
    //         } else {
    //             cy.get('.schedule-cell-inner .swiper-slide-prev').find('a').click()
    //         }
    //         cy.wait('@getTeamCalendarListBand').then(({ request }) => {
    //             let daySetting = day === 1 ? day + 1 : day - 1
    //             const date = `${year}${month >= 10 ? month : '0' + month}${daySetting >= 10 ? daySetting : '0' + daySetting}`
    //             expect(request.url).contain(date)
    //         })
    //     })
    // })
    it('경기 전 일 경우 시청 예약 버튼 노출되는지 확인', () => {
        cy.intercept('https://annexapi.wavve.com/skb/baseball/teamcalendarlist-band', (req) => {
            req.reply(teamMonthlyCalendarListBand)
        }).as('teamCalendarListBand')
        cy.visit(TEST_URL + '/baseball/schedule')
        cy.get('[data-test="baseball-landscape-cell"]').eq(1).find('.kbo-zzim-button').should('exist')
    })
    it('경기 중 일 경우 시청 예약 버튼 미노출되는지 확인', () => {
        cy.intercept('https://annexapi.wavve.com/skb/baseball/teamcalendarlist-band', (req) => {
            req.reply(teamMonthlyCalendarListBand)
        }).as('teamCalendarListBand')
        cy.visit(TEST_URL + '/baseball/schedule')
        cy.get('[data-test="baseball-landscape-cell"]').eq(7).find('.kbo-zzim-button').should('not.exist')
    })
    it('월별 경기 리스트 노출되는지 확인', () => {
        cy.intercept('https://annexapi.wavve.com/skb/baseball/teammonthlycalendarlist', (req) => {
            req.reply(teamMonthlyCalendarList)
        }).as('getTeamMonthlyCalendarList')
        cy.visit(TEST_URL + '/baseball/schedule')
        cy.get('.list-team-table').should('exist')
    })
    it('디폴트로 전체 선택되어 노출되는지 확인', () => {
        cy.visit(TEST_URL + '/baseball/schedule')
        cy.get('.baseball-list-team.team-all').should('have.class', 'on')
    })
    it('임의 팀 선택 시 선택 한 팀 경기 리스트 노출되는지 확인', () => {
        cy.visit(TEST_URL + '/baseball/schedule')
        cy.get('[data-code="SS"] > a').click({ force: true })
        cy.url().should('contain', '/baseball/schedule?teamcode=SS')
    })

    it('월별 스케줄 경기 종료일경우 경기결과페이지 생성되어있으면 경기결과페이지로 이동 생성 안되있으면  결기결과 버튼 disabled 확인', () => {
        cy.intercept('https://annexapi.wavve.com/skb/baseball/teammonthlycalendarlist', (req) => {
            req.reply(teamMonthlyCalendarList)
        }).as('getTeamMonthlyCalendarList')
        cy.visit(TEST_URL + '/baseball/schedule')
        cy.wait('@getTeamMonthlyCalendarList').then(({ response }) => {
            const list = response.body.cell_toplist.celllist
            list.forEach((item, index) => {
                if (item.game_status === 'END' && item.record_yn === 'Y') {
                    cy.get('[data-test="game-result-end"]').eq(index).find('button').should('have.class', 'button-kbo-secondary')
                } else {
                    cy.get('[data-test="game-result-end"]').eq(index).contains('경기결과').should('not.have.class', 'button-kbo-secondary')
                    cy.get('[data-test="game-result-end"]').eq(index).contains('경기결과').should('have.attr', 'disabled', 'disabled')
                }
            })
        })
    })
    it('시청 예약 미지원 경기일 경우 경기 전 문구 노출되는지 확인', () => {
        cy.intercept('https://annexapi.wavve.com/skb/baseball/teammonthlycalendarlist', (req) => {
            req.reply(teamMonthlyCalendarList)
        }).as('getTeamMonthlyCalendarList')
        cy.visit(TEST_URL + '/baseball/schedule')
        cy.wait('@getTeamMonthlyCalendarList').then(({ response }) => {
            const list = response.body.cell_toplist.celllist
            const idx = Cypress._.findLastIndex(list, {'game_status': 'PREV', 'alarm_on': 'N', 'alarm_yn': 'N'})
            if (idx > -1) {
                cy.get('[data-test="game-status"]').eq(idx).contains('경기 전').should('exist')
            }
        })
    })
    it('경기 끝났을 경우 경기종료 문구, 경기결과 버튼 노출되는지 확인', () => {
        cy.intercept('https://annexapi.wavve.com/skb/baseball/teammonthlycalendarlist', (req) => {
            req.reply(teamMonthlyCalendarList)
        }).as('getTeamMonthlyCalendarList')
        cy.visit(TEST_URL + '/baseball/schedule')
        cy.wait('@getTeamMonthlyCalendarList').then(({ response }) => {
            const list = response.body.cell_toplist.celllist
            const filteredIndex = Cypress._.findIndex(list, {'game_status': 'END', 'record_yn': 'Y'})
            cy.get('[data-test="game-result-end"]').eq(filteredIndex).find('button').should('exist')
            cy.get('.team-table-state').eq(filteredIndex).contains('경기 종료').should('exist')
        })
    })
    it('경기 결과 버튼 선택시 해당 경기 결과 화면으로 이동 확인', () => {
        cy.intercept('https://annexapi.wavve.com/skb/baseball/teammonthlycalendarlist', (req) => {
            req.reply(teamMonthlyCalendarList)
        }).as('getTeamMonthlyCalendarList')
        cy.visit(TEST_URL + '/baseball/schedule')
        cy.wait('@getTeamMonthlyCalendarList').then(({ response }) => {
            const list = response.body.cell_toplist.celllist
            const filteredIndex = Cypress._.findIndex(list, {'game_status': 'END', 'record_yn': 'Y'})
            cy.get('[data-test="game-result-end"]').eq(filteredIndex).find('button').click({ force: true })
            cy.url().should('contain', list[filteredIndex].game_id)
        })
    })
    it('경기 전일 경우 예약 버튼 노출 및 경기결과 버튼 비활성화 처리되어 노출되는지 확인', () => {
        cy.intercept('https://annexapi.wavve.com/skb/baseball/teammonthlycalendarlist', (req) => {
            req.reply(teamMonthlyCalendarList)
        }).as('getTeamMonthlyCalendarList')
        cy.visit(TEST_URL + '/baseball/schedule')
        cy.wait('@getTeamMonthlyCalendarList').then(({ response }) => {
            const list = response.body.cell_toplist.celllist
            const idx = Cypress._.findLastIndex(list, {'game_status': 'PREV', 'alarm_on': 'Y', 'alarm_yn': 'N'})
            if (idx > -1) {
                cy.get('[data-test="game-status"]').eq(idx).find('button').should('exist')
                cy.get('[data-test="game-result-end"]').eq(idx).find('button').should('be.disabled')
            }
        })
    })
    it('월별 스케쥴 미로그인 예약일 경우 로그인페이지로 이동되는지 확인', () => {
        cy.intercept('https://annexapi.wavve.com/skb/baseball/teammonthlycalendarlist', (req) => {
            req.reply(teamMonthlyCalendarList)
        }).as('getTeamMonthlyCalendarList')
        cy.visit(TEST_URL + '/baseball/schedule')
        cy.wait('@getTeamMonthlyCalendarList').then(({ response }) => {
            const list = response.body.cell_toplist.celllist
            const idx = Cypress._.findLastIndex(list, {'game_status': 'PREV', 'alarm_on': 'Y', 'alarm_yn': 'N'})
            if (idx > -1) {
                cy.get('[data-test="game-status"]').eq(idx).contains('예약').click({ force: true })
                cy.on('window:confirm', () => true)
                cy.url().should('contain', '/member/login')
            }
        })
    })
    it('월별 스케줄 로그인 상태 예약일 경우 예약 선택-> 예약완료, 예약완료 선택 -> 예약으로 상태 변경', () => {
        cy.csInfo()
        let interceptCount = 0
        cy.intercept('https://annexapi.wavve.com/skb/baseball/teammonthlycalendarlist', (req) => {
            if (interceptCount === 0) {
                interceptCount += 1
                req.reply(teamMonthlyCalendarList)
            } else if (interceptCount === 1){
                teamMonthlyCalendarList.cell_toplist.celllist[9].alarm_yn = 'Y'
                req.reply(teamMonthlyCalendarList)
            }
        }).as('getTeamMonthlyCalendarList')
        cy.visit(TEST_URL + '/baseball/schedule')
        cy.wait('@getTeamMonthlyCalendarList').then((interception) => {
            cy.get('[data-test="game-status"]').eq(9).contains('예약').should('not.have.class', 'button-kbo-tertiary')
            cy.get('[data-test="game-status"]').eq(9).contains('예약').click({ force: true })
            cy.on('window:confirm', () => true)
            cy.wait('@postAlarms').then(({response }) => {
                if (response.statusCode === 550) {
                    cy.wait('@getTeamMonthlyCalendarList').then(({ response }) => {
                        cy.get('[data-test="game-status"]').eq(9).contains('예약 완료').should('have.class', 'button-kbo-tertiary')
                    })
                }
            })
        })
    })
})
context('경기별 하이라이트', () => {
    beforeEach(() => {
        cy.wavveonOff()
        cy.homePopupOff()
    })
    let date = new Date()
    let year = date.getFullYear()
    let month = date.getMonth() + 1
    it('일정이 없을 경우 "선택한 일자는 경기 영상이 없어요" 문구 노출되는지 확인', () => {
        cy.intercept('https://apis.wavve.com/dp/vod/scene?', (req) => {
            req.reply(highlightSceneEmpty)
        }).as('getScene')
        cy.visit(TEST_URL + '/baseball')
        cy.get('[data-test="section-loader"]').eq(1).find('[data-test="view-more"]').click({ force: true })
        cy.get('.baseball-no-data').should('exist')
    })
    it('하이라이트 api 확인하여 셀갯수 및 태그 확인', () => {
        cy.intercept('https://apis.wavve.com/dp/vod/scene?', (req) => {
            req.reply(highlightScene)
        }).as('getScene')
        cy.visit(TEST_URL + '/baseball')
        cy.get('[data-test="section-loader"]').eq(1).find('[data-test="view-more"]').click({ force: true })
        cy.wait('@getScene').then(({ response }) => {
            const list = response.body.cell_toplist.celllist
            if (list.length > 0) {
                cy.get('[data-test="landscape-cell"]').should('length', list.length)
                const bottomTagIndex = Cypress._.findIndex(list, {'bottom_taglist': ['free']})
                if (bottomTagIndex > -1) {
                    cy.get('[data-test="landscape-cell"]').eq(bottomTagIndex).find('.tag-free').should('contain', '무료')
                }
            }
        })
    })
    it('팀 선택시 해당 팀별로 하이라이트 영상 노출되는지 확인', () => {
        cy.visit(TEST_URL + '/baseball')
        cy.get('[data-test="section-loader"]').eq(1).find('[data-test="view-more"]').click({ force: true })
        cy.get('.baseball-list.list-team > ul > li').eq(3).click()
        cy.intercept('https://apis.wavve.com/dp/vod/scene?', (req) => {
            req.reply(highlightScene)
        }).as('getScene')
        cy.reload()
        cy.wait('@getScene').then((interception) => {
            expect(interception.request.url).include('team=WO')
        })
    })
    it('하이라이트 영상 선택시 하이라이트 상세화면으로 이동', () => {
        cy.intercept('https://apis.wavve.com/dp/vod/contents/*').as('getHighlightContent')
        cy.intercept('https://apis.wavve.com/dp/vod/scene?', (req) => {
            req.reply(highlightScene)
        }).as('getScene')
        cy.visit(TEST_URL + '/baseball')
        cy.get('[data-test="section-loader"]').eq(1).find('[data-test="view-more"]').click({ force: true })
        cy.get('[data-test="landscape-cell"]').eq(0).click({ force: true })
        cy.wait('@getHighlightContent')
        cy.url().should('contain', '/player/baseball/highlight')
    })
    it('상단 날짜 next 버큰 클릭 > +1개월 간격으로 이동하는지 확인', () => {
        cy.visit(TEST_URL + '/baseball')
        cy.get('[data-test="section-loader"]').eq(1).find('[data-test="view-more"]').click({ force: true })
        cy.get('[data-test="next-month-btn"]').click({ force: true })
        cy.get('[data-test="month"]').should('contain', month === 12 ? 1 : (month + 1))
        cy.get('[data-test="year"]').should('contain', month === 12 ? (year + 1) : year)
    })
    it('상단 날짜 prev 버튼 클릭 > -1개월 간격으로 이동하는지 확인', () => {
        cy.visit(TEST_URL + '/baseball')
        cy.get('[data-test="section-loader"]').eq(1).find('[data-test="view-more"]').click({ force: true })
        cy.get('[data-test="prev-month-btn"]').click({ force: true })
        cy.get('[data-test="month"]').should('contain', month === 1 ? 12 : (month - 1))
        cy.get('[data-test="year"]').should('contain', month === 1 ? (year - 1) : year)
    })
    it('날짜 이동시 default로 해당 날짜의 1일자로 선택되어 노출되는지 확인', () => {
        cy.visit(TEST_URL + '/baseball')
        cy.get('[data-test="section-loader"]').eq(1).find('[data-test="view-more"]').click({ force: true })
        cy.get('[data-test="next-month-btn"]').click({ force: true })
        cy.get('[data-test="date-slider"] .swiper-slide-active').find('.date-month').should('contain.text', (month === 12 ? 1 : (month + 1) + '/1'))
    })
    it('오늘 버튼 선택시 오늘 날짜 경기로 화면 노출되는지 확인', () => {
        cy.visit(TEST_URL + '/baseball')
        cy.get('[data-test="section-loader"]').eq(1).find('[data-test="view-more"]').click({ force: true })
        let today = new Date()
        cy.get('.schedule-cell-inner').find('.swiper-slide-next').click({ force: true })
        cy.get('.button-kbo-filled').click()
        cy.get('.schedule-cell-inner').find('.swiper-slide-active').find('.date-month').should('include.text' , ((today.getMonth()+1) + '/' + today.getDate()))
    })
    it('디폴트로 전체 선택되어 노출되는지 확인', () => {
        cy.visit(TEST_URL + '/baseball')
        cy.get('[data-test="section-loader"]').eq(1).find('[data-test="view-more"]').click({ force: true })
        cy.get('.baseball-list-team.team-all').should('have.class', 'on')
    })
    it('임의 팀 선택 시 선택 한 팀 경기 리스트 노출되는지 확인', () => {
        cy.visit(TEST_URL + '/baseball')
        cy.get('[data-test="section-loader"]').eq(1).find('[data-test="view-more"]').click({ force: true })
        cy.get('[data-code="SS"] > a').click({ force: true })
        cy.url().should('contain', 'team=SS')
    })
    it('Default로 최신 날짜의 하이라이트가 노출되는지 확인한다.', () => {
        let interceptCount = 0
        cy.intercept('https://apis.wavve.com/dp/vod/scene?', (req) => {
            if (interceptCount === 0) {
                interceptCount += 1
            } else {
                req.reply()
            }
        }).as('getScene')
        cy.visit(TEST_URL + '/baseball')
        cy.get('[data-test="section-loader"]').eq(1).find('[data-test="view-more"]').click({ force: true })
        cy.wait('@getScene')
        cy.wait('@getScene').then(({ response, request }) => {
            const url = request.url
            const defaultDate = url.substr(url.indexOf('date'), 13).split('=').pop()
            let month = defaultDate.substr(4, 2)
            let day = defaultDate.substr(6, 2)
            month = month.substr(0, 1) === '0' ? month.substr(1, 1) : month
            day = day.substr(0, 1) === '0' ? day.substr(1, 1) : day
            cy.get('.schedule-cell-inner .swiper-slide-active').find('.date-month').should('contain', (month+'/'+day))
        })
    })
    it('가장 좌측, 우측 날짜일 경우 "<", ">" 버튼 비활성화 처리되어 노출되는지 확인', () => {
        cy.visit(TEST_URL + '/baseball')
        cy.get('[data-test="section-loader"]').eq(1).find('[data-test="view-more"]').click({ force: true })
        cy.get('[data-test="next-month-btn"]').click()
        cy.get('.schedule-cell-inner .swiper-button-prev').should('have.class', 'swiper-button-disabled')
    })
})
context('경기결과', () => {
    beforeEach(() => {
        cy.wavveonOff()
        cy.homePopupOff()
        cy.intercept('https://annexm.wavve.com/api/sport/baseball/relay/text').as('getInningText')
        cy.visit(TEST_URL + '/baseball/result', {
            qs: {
                game_id: '20210403SSWO0'
            }
        })
    })
    it('문자 중계 탭 선택시 이닝 이동되는지 확인', () => {
        cy.get('.inning-list').contains('5').click({ force: true })
        cy.get('.inning-list').contains('5').should('have.class', 'active')
    })
})
context('팀순위, 부문별 선수 순위', () => {
    beforeEach(() => {
        cy.wavveonOff()
        cy.homePopupOff()
        cy.intercept('https://annexapi.wavve.com/skb/baseball/ranklist').as('getRankList')
        cy.visit(TEST_URL + '/baseball')
    })
    it('각 팀 순위가 Default로 1위부터 차례대로 노출되는지 확인한다.', () => {
        cy.wait('@getRankList').then(({ response }) => {
            const teamRankList = response.body.cell_toplist.celllist[0].team_rank
            cy.get('[data-test="team-rank"]').should('have.length', teamRankList.length)
        })
    })
    it('부문별 선수 순위 > 타율', () => {
        cy.wait('@getRankList').then(({ response }) => {
            cy.playerRankAssertion(response.body.cell_toplist.celllist[0].hitter_rank.batting_average, '타율')
        })
    })
    it('부문별 선수 순위 > 홈런', () => {
        cy.wait('@getRankList').then(({ response }) => {
            cy.playerRankAssertion(response.body.cell_toplist.celllist[0].hitter_rank.home_run, '홈런')
        })
    })
    it('부문별 선수 순위 > 타점', () => {
        cy.wait('@getRankList').then(({ response }) => {
            cy.playerRankAssertion(response.body.cell_toplist.celllist[0].hitter_rank.run_batted_in, '타점')
        })
    })
    it('부문별 선수 순위 > 평균자책', () => {
        cy.wait('@getRankList').then(({ response }) => {
            cy.playerRankAssertion(response.body.cell_toplist.celllist[0].pitcher_rank.earned_run_average, '평균 자책')
        })
    })
    it('부문별 선수 순위 > 다승', () => {
        cy.wait('@getRankList').then(({ response }) => {
            cy.playerRankAssertion(response.body.cell_toplist.celllist[0].pitcher_rank.total_win_counter, '다승')
        })
    })
    it('부문별 선수 순위 > 탈삼진', () => {
        cy.wait('@getRankList').then(({ response }) => {
            cy.playerRankAssertion(response.body.cell_toplist.celllist[0].pitcher_rank.strike_out, '탈삼진')
        })
    })
})
